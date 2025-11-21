import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Alert,
  GestureResponderEvent,
  Keyboard,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import {
  CommonActions,
  NavigationProp,
  ParamListBase,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {
  ArrowLeft,
  ChevronDown,
  CreditCard,
  MapPin,
  PenSquare,
  TicketPercent,
  Wallet,
  X,
} from 'lucide-react-native';
import MapView, { Marker } from 'react-native-maps';
import { isAxiosError } from 'axios';
import * as Location from 'expo-location';
import { GOOGLE_MAPS_API_KEY } from '@env';

import { useCart } from '~/context/CartContext';
import AddressMismatchOverlay from '~/components/AddressMismatchOverlay';
import OngoingOrderWarningOverlay from '~/components/OngoingOrderWarningOverlay';
import { getCurrentCoordinates } from '~/services/locationAccess';
import useSelectedAddress from '~/hooks/useSelectedAddress';
import useAuth from '~/hooks/useAuth';
import useOngoingOrder from '~/hooks/useOngoingOrder';
import { createOrder } from '~/api/orders';
import { getRestaurantDeliveryFee } from '~/api/restaurants';
import { hasValidEstimatedDeliveryTime } from '~/utils/restaurantFavorites';
import type { MonetaryAmount, OrderRequest } from '~/interfaces/Order';
import type { CouponType } from '~/interfaces/Loyalty';
import type { OrderTrackingData } from './OrderTracking';
import type { OngoingOrderData } from '~/context/OngoingOrderContext';
import { useTranslation } from '~/localization';
import { useCurrencyFormatter } from '~/localization/hooks';
import { moderateScale } from 'react-native-size-matters';
import { useServiceFeeAmount } from '~/hooks/useServiceFee';

const sectionTitleColor = '#17213A';
const accentColor = '#CA251B';
const borderColor = '#E8E9EC';
const TIP_OPTIONS = [5, 10, 15, 20];

const parsePositiveDecimalInput = (value: string): number | null => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed.length) {
    return null;
  }

  const normalized = trimmed.replace(/,/g, '.');
  if (!/^\d+(\.\d{0,2})?$/.test(normalized)) {
    return null;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }

  return Math.round(parsed * 100) / 100;
};

const extractNumericAmount = (value: MonetaryAmount | null | undefined): number | null => {
  if (value == null) {
    return null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(',', '.'));
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const resolvePaymentIcon = (method?: string | null) => {
  if (!method) {
    return CreditCard;
  }

  const normalized = method.toLowerCase();
  if (normalized.includes('cash')) {
    return Wallet;
  }
  return CreditCard;
};

type DisplayItem = {
  key: string;
  name: string;
  quantity: number;
  extrasLabel?: string;
  total: number;
};

interface AccordionProps {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const Accordion: React.FC<AccordionProps> = ({ title, expanded, onToggle, children }) => (
  <View className="mt-4 overflow-hidden rounded-3xl border bg-white" style={{ borderColor }}>
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onToggle}
      className="flex-row items-center justify-between px-5 py-4">
      <Text
        allowFontScaling={false}
        className="text-base font-semibold"
        style={{ color: sectionTitleColor }}>
        {title}
      </Text>
      <ChevronDown
        size={20}
        color={sectionTitleColor}
        style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }}
      />
    </TouchableOpacity>
    {expanded ? (
      <View className="border-t px-5 pb-5 pt-4" style={{ borderColor }}>
        {children}
      </View>
    ) : null}
  </View>
);

type PaymentMethod = 'CARD' | 'CASH';

type PaymentOption = {
  id: PaymentMethod;
  label: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
};

type PaymentOptionConfig = {
  id: PaymentMethod;
  labelKey: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
};

const PAYMENT_OPTION_CONFIG: PaymentOptionConfig[] = [
  { id: 'CARD', labelKey: 'checkout.payment.options.card', Icon: CreditCard },
  { id: 'CASH', labelKey: 'checkout.payment.options.cash', Icon: Wallet },
];

type DeliveryQuoteError = 'INVALID_COORDINATES' | 'REQUEST_FAILED';

const PaymentModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSelect: (method: PaymentMethod) => void;
  selected: PaymentMethod | null;
  title: string;
  options: PaymentOption[];
}> = ({ visible, onClose, onSelect, selected, title, options }) => (
  <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
    <View className="flex-1 justify-center bg-[#17213A]/40 px-6">
      <TouchableOpacity activeOpacity={1} onPress={onClose} className="absolute inset-0" />
      <View className="rounded-3xl bg-white p-6 shadow-lg">
        <Text
          allowFontScaling={false}
          className="text-center text-lg font-semibold"
          style={{ color: sectionTitleColor }}>
          {title}
        </Text>
        {options.map((option, index) => {
          const isSelected = selected === option.id;
          return (
            <TouchableOpacity
              key={option.id}
              activeOpacity={0.8}
              onPress={() => onSelect(option.id)}
              className={`${index === 0 ? 'mt-6' : 'mt-4'} flex-row items-center justify-between rounded-2xl border px-4 py-4`}
              style={{
                borderColor: isSelected ? accentColor : '#EFEFF1',
                backgroundColor: isSelected ? '#FFF5F4' : 'white',
              }}>
              <View className="flex-row items-center">
                <option.Icon size={22} color={accentColor} />
                <Text
                  allowFontScaling={false}
                  className="ml-3 text-base font-semibold"
                  style={{ color: sectionTitleColor }}>
                  {option.label}
                </Text>
              </View>
              {option.id === 'CARD' ? (
                <ChevronDown
                  size={20}
                  color={sectionTitleColor}
                  style={{ transform: [{ rotate: '-90deg' }] }}
                />
              ) : (
                <View
                  className="h-5 w-5 items-center justify-center rounded-full border"
                  style={{ borderColor: accentColor, backgroundColor: 'white' }}>
                  {isSelected ? (
                    <View
                      className="h-3.5 w-3.5 rounded-full"
                      style={{ backgroundColor: accentColor }}
                    />
                  ) : null}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  </Modal>
);

type TipSelectionOverlayProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onSelect: (percentage: number) => void;
  selectedPercentage: number | null;
  options: number[];
  title: string;
  orderAmountLabel: string;
  orderAmountValue: string;
  tipAmountLabel?: string | null;
  tipAmountValue?: string | null;
  description: string;
  percentageHelper: string;
  cancelLabel: string;
  confirmLabel: string;
  cashLabel?: string | null;
  cashPlaceholder: string;
  cashValue: string;
  onCashChange: (value: string) => void;
  showCashInput: boolean;
  errorMessage?: string | null;
};

const TipSelectionOverlay: React.FC<TipSelectionOverlayProps> = ({
  visible,
  onClose,
  onConfirm,
  onSelect,
  selectedPercentage,
  options,
  title,
  orderAmountLabel,
  orderAmountValue,
  tipAmountLabel,
  tipAmountValue,
  description,
  percentageHelper,
  cancelLabel,
  confirmLabel,
  cashLabel,
  cashPlaceholder,
  cashValue,
  onCashChange,
  showCashInput,
  errorMessage,
}) => {
  const handleDismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const handleClose = useCallback(() => {
    Keyboard.dismiss();
    onClose();
  }, [onClose]);

  const handleConfirm = useCallback(() => {
    Keyboard.dismiss();
    onConfirm();
  }, [onConfirm]);

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={handleClose}>
      <View className="flex-1 justify-center bg-[#17213A]/40 px-6">
        <TouchableOpacity activeOpacity={1} onPress={handleClose} className="absolute inset-0" />
        <TouchableWithoutFeedback onPress={handleDismissKeyboard} accessible={false}>
          <View
            className="rounded-3xl bg-white px-6 py-7"
            style={{ maxHeight: '88%', width: '100%', alignSelf: 'center' }}>
            <TouchableOpacity
              onPress={handleClose}
              className="absolute left-5 top-5 rounded-full border border-[#E4E6EB] p-2">
              <X size={18} color={sectionTitleColor} />
            </TouchableOpacity>
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ paddingBottom: 8 }}>
              <View className="items-center">
                <Image
                  source={require('../../assets/tip-rider.png')}
                  contentFit="contain"
                  style={{
                    width: '100%',
                    height: moderateScale(100),
                    maxHeight: 220,
                  }}
                />
              </View>
              <Text
                allowFontScaling={false}
                className="mt-4 text-center text-xl font-bold"
                style={{ color: sectionTitleColor }}>
                {title}
              </Text>
              <Text allowFontScaling={false} className="mt-6 text-center text-sm text-[#6B7280]">
                {orderAmountLabel}
              </Text>
              <Text
                allowFontScaling={false}
                className="mt-1 text-center text-2xl font-bold"
                style={{ color: accentColor }}>
                {orderAmountValue}
              </Text>
              {tipAmountValue ? (
                <View className="mt-4 items-center rounded-2xl bg-[#FFF5F4] px-4 py-3">
                  {tipAmountLabel ? (
                    <Text
                      allowFontScaling={false}
                      className="text-xs font-semibold uppercase text-[#6B7280]">
                      {tipAmountLabel}
                    </Text>
                  ) : null}
                  <Text
                    allowFontScaling={false}
                    className="mt-1 text-lg font-semibold"
                    style={{ color: accentColor }}>
                    +{tipAmountValue}
                  </Text>
                </View>
              ) : null}
              <View className="mt-6 flex-row flex-wrap justify-between">
                {options.map((option) => {
                  const isSelected = selectedPercentage === option;
                  return (
                    <TouchableOpacity
                      key={option}
                      activeOpacity={0.85}
                      onPress={() => onSelect(option)}
                      className="mb-3 items-center justify-center rounded-2xl border py-3"
                      style={{
                        width: '22%',
                        borderColor: isSelected ? accentColor : '#EFEFF1',
                        backgroundColor: isSelected ? '#FFF5F4' : 'white',
                      }}>
                      <Text
                        allowFontScaling={false}
                        className="text-base font-semibold"
                        style={{ color: sectionTitleColor }}>
                        {option}%
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <Text
                allowFontScaling={false}
                className="text-center text-xs uppercase tracking-wider text-[#6B7280]">
                {percentageHelper}
              </Text>
              <Text allowFontScaling={false} className="mt-4 text-center text-sm text-[#4B5563]">
                {description}
              </Text>
              {showCashInput ? (
                <View className="mt-6">
                  {cashLabel ? (
                    <Text
                      allowFontScaling={false}
                      className="text-sm font-semibold"
                      style={{ color: sectionTitleColor }}>
                      {cashLabel}
                    </Text>
                  ) : null}
                  <TextInput
                    allowFontScaling={false}
                    value={cashValue}
                    onChangeText={onCashChange}
                    keyboardType="decimal-pad"
                    placeholder={cashPlaceholder}
                    className="mt-2 rounded-2xl border border-[#EFEFF1] px-4 py-3 text-base text-[#111827]"
                  />
                  {errorMessage ? (
                    <Text allowFontScaling={false} className="mt-2 text-sm text-[#CA251B]">
                      {errorMessage}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </ScrollView>
            <View className="mt-6 flex-row items-center justify-between">
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleClose}
                className="mr-3 flex-1 items-center justify-center rounded-full border border-[#E4E6EB] px-4 py-3">
                <Text
                  allowFontScaling={false}
                  className="text-base font-semibold"
                  style={{ color: sectionTitleColor }}>
                  {cancelLabel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={handleConfirm}
                className="flex-1 items-center justify-center rounded-full bg-[#CA251B] px-4 py-3">
                <Text allowFontScaling={false} className="text-base font-semibold text-white">
                  {confirmLabel}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    </Modal>
  );
};

type CheckoutRouteParams = {
  couponCode?: string;
  discountAmount?: number;
  couponValid?: boolean;
  couponType?: CouponType;
  couponDiscountPercent?: number | null;
  viewMode?: boolean;
  order?: OrderTrackingData | null;
};

type CheckoutRoute = RouteProp<{ CheckoutOrder: CheckoutRouteParams }, 'CheckoutOrder'>;

const CheckoutOrder: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<CheckoutRoute>();
  const { t } = useTranslation();
  const formatCurrency = useCurrencyFormatter();
  const { amount: serviceFeeAmount } = useServiceFeeAmount();
  const { items, restaurant, subtotal, clearCart } = useCart();
  const { selectedAddress } = useSelectedAddress();
  const { user } = useAuth();
  const {
    order: ongoingOrder,
    hasFetched: hasFetchedOngoing,
    updateOrder: updateOngoingOrder,
  } = useOngoingOrder();
  const hasClosedViewModeRef = useRef(false);
  const [itemsExpanded, setItemsExpanded] = useState(true);
  const [allergiesExpanded, setAllergiesExpanded] = useState(false);
  const [commentExpanded, setCommentExpanded] = useState(false);
  const [allergies, setAllergies] = useState('');
  const [comment, setComment] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    type: CouponType;
    discountPercent: number | null;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [isTipModalVisible, setIsTipModalVisible] = useState(false);
  const [selectedTipPercentage, setSelectedTipPercentage] = useState<number | null>(null);
  const [cashToCollectInput, setCashToCollectInput] = useState('');
  const [tipOverlayError, setTipOverlayError] = useState<string | null>(null);
  const [pendingCoordinates, setPendingCoordinates] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [deliveryQuote, setDeliveryQuote] = useState<{
    available: boolean;
    fee: number | null;
    distanceKm: number | null;
  } | null>(null);
  const [isDeliveryQuoteLoading, setIsDeliveryQuoteLoading] = useState(false);
  const [deliveryQuoteError, setDeliveryQuoteError] = useState<DeliveryQuoteError | null>(null);
  const [showAddressMismatchOverlay, setShowAddressMismatchOverlay] = useState(false);
  const [showOngoingOrderWarning, setShowOngoingOrderWarning] = useState(false);
  const [currentGpsLocation, setCurrentGpsLocation] =
    useState<Location.LocationObjectCoords | null>(null);
  const [currentGpsAddress, setCurrentGpsAddress] = useState<string | null>(null);

  const paymentOptions = useMemo(
    () =>
      PAYMENT_OPTION_CONFIG.map((option) => ({
        id: option.id,
        Icon: option.Icon,
        label: t(option.labelKey),
      })),
    [t]
  );

  const handleTipSelection = useCallback((value: number) => {
    setSelectedTipPercentage((prev) => (prev === value ? null : value));
  }, []);

  const handleCashInputChange = useCallback((value: string) => {
    const sanitized = value.replace(/[^0-9.,]/g, '');
    setCashToCollectInput(sanitized);
  }, []);

  const formatPaymentMethodLabel = useCallback(
    (method?: string | null) => {
      if (!method) {
        return t('checkout.payment.methodFallback');
      }

      const normalized = method.replace(/_/g, ' ').toLowerCase();

      if (normalized.includes('cash')) {
        return t('checkout.payment.methodNames.cash');
      }

      if (normalized.includes('card') || normalized.includes('credit')) {
        return t('checkout.payment.methodNames.card');
      }

      return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
    },
    [t]
  );

  const rawOrderParam = route.params?.order ?? null;
  const isViewMode = Boolean(route.params?.viewMode && rawOrderParam);
  const viewOrder = isViewMode ? rawOrderParam : null;
  const viewOrderItems = useMemo<unknown[]>(
    () => (isViewMode && viewOrder && Array.isArray(viewOrder.items) ? viewOrder.items : []),
    [isViewMode, viewOrder]
  );
  const viewOrderId = useMemo(() => {
    if (!viewOrder) {
      return null;
    }

    const orderIdCandidate =
      (viewOrder as OrderTrackingData).orderId ?? (viewOrder as any)?.id ?? null;
    return orderIdCandidate != null ? String(orderIdCandidate) : null;
  }, [viewOrder]);

  const closeCheckoutViewMode = useCallback(() => {
    if (hasClosedViewModeRef.current) {
      return;
    }

    hasClosedViewModeRef.current = true;

    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      })
    );
  }, [navigation]);

  useEffect(() => {
    if (!isViewMode) {
      hasClosedViewModeRef.current = false;
      return;
    }

    if (!hasFetchedOngoing) {
      return;
    }

    if (!ongoingOrder) {
      closeCheckoutViewMode();
      return;
    }

    const ongoingId = ongoingOrder.orderId != null ? String(ongoingOrder.orderId) : null;

    if (viewOrderId && ongoingId && ongoingId !== viewOrderId) {
      closeCheckoutViewMode();
      return;
    }

    hasClosedViewModeRef.current = false;
  }, [closeCheckoutViewMode, hasFetchedOngoing, isViewMode, ongoingOrder, viewOrderId]);

  useEffect(() => {
    if (isViewMode) {
      return;
    }

    const params = route.params;
    if (params?.couponValid && params.couponCode) {
      const couponType = params.couponType ?? 'PERCENTAGE_DISCOUNT';
      setAppliedCoupon({
        code: params.couponCode,
        type: couponType as CouponType,
        discountPercent: params.couponDiscountPercent ?? null,
      });
      navigation.setParams({
        couponCode: undefined,
        discountAmount: undefined,
        couponValid: undefined,
        couponType: undefined,
        couponDiscountPercent: undefined,
      });
    }
  }, [route.params, navigation, isViewMode]);

  useEffect(() => {
    if (selectedPaymentMethod !== 'CASH') {
      setCashToCollectInput('');
    }
  }, [selectedPaymentMethod]);

  useEffect(() => {
    if (!isTipModalVisible) {
      setTipOverlayError(null);
    }
  }, [isTipModalVisible]);

  useEffect(() => {
    if (isViewMode) {
      return;
    }

    if (!restaurant?.id || !selectedAddress) {
      setDeliveryQuote(null);
      setDeliveryQuoteError(null);
      setIsDeliveryQuoteLoading(false);
      return;
    }

    const latCandidate = Number(selectedAddress.coordinates?.latitude);
    const lngCandidate = Number(selectedAddress.coordinates?.longitude);

    if (!Number.isFinite(latCandidate) || !Number.isFinite(lngCandidate)) {
      setDeliveryQuote(null);
      setDeliveryQuoteError('INVALID_COORDINATES');
      setIsDeliveryQuoteLoading(false);
      return;
    }

    let isCancelled = false;
    setIsDeliveryQuoteLoading(true);
    setDeliveryQuoteError(null);

    getRestaurantDeliveryFee({
      restaurantId: restaurant.id,
      lat: latCandidate,
      lng: lngCandidate,
    })
      .then((response) => {
        if (isCancelled) {
          return;
        }

        const normalizedFee = Number(response.deliveryFee);
        const normalizedDistance = Number(response.distanceKm);
        const fee = Number.isFinite(normalizedFee) && normalizedFee >= 0 ? normalizedFee : null;
        const distance =
          Number.isFinite(normalizedDistance) && normalizedDistance >= 0
            ? normalizedDistance
            : null;

        setDeliveryQuote({
          available: Boolean(response.available),
          fee: response.available ? fee : null,
          distanceKm: distance,
        });
        setDeliveryQuoteError(null);
      })
      .catch((error) => {
        if (isCancelled) {
          return;
        }

        console.error('Failed to fetch delivery fee quote:', error);
        setDeliveryQuote(null);
        setDeliveryQuoteError('REQUEST_FAILED');
      })
      .finally(() => {
        if (!isCancelled) {
          setIsDeliveryQuoteLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [
    isViewMode,
    restaurant?.id,
    selectedAddress,
    selectedAddress?.id,
    selectedAddress?.coordinates?.latitude,
    selectedAddress?.coordinates?.longitude,
  ]);

  // Fetch current GPS location on mount
  useEffect(() => {
    if (isViewMode) {
      return;
    }

    let isCancelled = false;

    const fetchCurrentLocation = async () => {
      try {
        const coords = await getCurrentCoordinates();
        if (isCancelled || !coords) {
          return;
        }

        setCurrentGpsLocation(coords);

        // Reverse geocode to get address
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${GOOGLE_MAPS_API_KEY || ''}`
          );
          const data = await response.json();

          if (!isCancelled && data.status === 'OK' && data.results?.length) {
            setCurrentGpsAddress(data.results[0].formatted_address);
          }
        } catch (error) {
          console.error('Failed to reverse geocode current location:', error);
        }
      } catch (error) {
        console.error('Failed to get current location:', error);
      }
    };

    fetchCurrentLocation();

    return () => {
      isCancelled = true;
    };
  }, [isViewMode]);

  type ViewModeAggregates = {
    lineSubtotal: number;
    itemsTotal: number;
    extrasTotal: number;
    lineTotal: number;
    promotionDiscount: number;
  };

  const viewModeTotals = useMemo<ViewModeAggregates | null>(() => {
    if (!isViewMode || !viewOrder) {
      return null;
    }

    return viewOrderItems.reduce(
      (acc, rawItem) => {
        const quantityValue = Number((rawItem as { quantity?: number })?.quantity);
        const quantity = Number.isFinite(quantityValue) && quantityValue > 0 ? quantityValue : 1;

        const unitBasePrice = extractNumericAmount(
          (rawItem as { unitBasePrice?: MonetaryAmount })?.unitBasePrice
        );
        const unitPrice = extractNumericAmount(
          (rawItem as { unitPrice?: MonetaryAmount })?.unitPrice
        );
        const unitExtrasPrice = extractNumericAmount(
          (rawItem as { unitExtrasPrice?: MonetaryAmount })?.unitExtrasPrice
        );
        const lineSubtotal = extractNumericAmount(
          (rawItem as { lineSubtotal?: MonetaryAmount })?.lineSubtotal
        );
        const promotionDiscount = extractNumericAmount(
          (rawItem as { promotionDiscount?: MonetaryAmount })?.promotionDiscount
        );
        const lineItemsTotal = extractNumericAmount(
          (rawItem as { lineItemsTotal?: MonetaryAmount })?.lineItemsTotal
        );
        const extrasTotal = extractNumericAmount(
          (rawItem as { extrasTotal?: MonetaryAmount })?.extrasTotal
        );
        const lineTotal = extractNumericAmount(
          (rawItem as { lineTotal?: MonetaryAmount })?.lineTotal
        );
        const total = extractNumericAmount((rawItem as { total?: MonetaryAmount })?.total);
        const totalPrice = extractNumericAmount(
          (rawItem as { totalPrice?: MonetaryAmount })?.totalPrice
        );
        const extrasPrice = extractNumericAmount(
          (rawItem as { extrasPrice?: MonetaryAmount })?.extrasPrice
        );

        const resolvedLineSubtotal =
          lineSubtotal ??
          (unitBasePrice != null ? unitBasePrice * quantity : null) ??
          (unitPrice != null ? unitPrice * quantity : null) ??
          0;

        const inferredDiscount = (() => {
          if (promotionDiscount != null) {
            return Math.max(promotionDiscount, 0);
          }
          if (lineSubtotal != null && lineItemsTotal != null) {
            return Math.max(lineSubtotal - lineItemsTotal, 0);
          }
          return 0;
        })();

        const resolvedItemsTotal =
          lineItemsTotal ?? Math.max(resolvedLineSubtotal - inferredDiscount, 0);

        const resolvedExtras =
          extrasTotal ??
          (unitExtrasPrice != null ? unitExtrasPrice * quantity : null) ??
          extrasPrice ??
          0;

        const resolvedLineTotal =
          lineTotal ?? total ?? totalPrice ?? Math.max(resolvedItemsTotal + resolvedExtras, 0);

        return {
          lineSubtotal: acc.lineSubtotal + resolvedLineSubtotal,
          itemsTotal: acc.itemsTotal + resolvedItemsTotal,
          extrasTotal: acc.extrasTotal + resolvedExtras,
          lineTotal: acc.lineTotal + resolvedLineTotal,
          promotionDiscount: acc.promotionDiscount + inferredDiscount,
        } satisfies ViewModeAggregates;
      },
      {
        lineSubtotal: 0,
        itemsTotal: 0,
        extrasTotal: 0,
        lineTotal: 0,
        promotionDiscount: 0,
      }
    );
  }, [isViewMode, viewOrder, viewOrderItems]);

  const paymentDetails = useMemo(
    () => (isViewMode && viewOrder ? (viewOrder.payment ?? null) : null),
    [isViewMode, viewOrder]
  );

  const paymentBreakdown = useMemo(() => {
    if (!paymentDetails) {
      return null;
    }

    return {
      subtotal: extractNumericAmount(paymentDetails.subtotal),
      extrasTotal: extractNumericAmount(paymentDetails.extrasTotal),
      total: extractNumericAmount(paymentDetails.total),
      serviceFee: extractNumericAmount(paymentDetails.serviceFee),
      itemsSubtotal: extractNumericAmount(paymentDetails.itemsSubtotal),
      promotionDiscount: extractNumericAmount(paymentDetails.promotionDiscount),
      itemsTotal: extractNumericAmount(paymentDetails.itemsTotal),
      deliveryFee: extractNumericAmount(paymentDetails.deliveryFee),
      grandTotal: extractNumericAmount(
        (paymentDetails as { grandTotal?: MonetaryAmount | null })?.grandTotal
      ),
      tipPercentage: extractNumericAmount(
        (paymentDetails as { tipPercentage?: MonetaryAmount | null })?.tipPercentage
      ),
      tipAmount: extractNumericAmount(
        (paymentDetails as { tipAmount?: MonetaryAmount | null })?.tipAmount
      ),
      totalBeforeTip: extractNumericAmount(
        (paymentDetails as { totalBeforeTip?: MonetaryAmount | null })?.totalBeforeTip
      ),
      cashToCollect: extractNumericAmount(
        (paymentDetails as { cashToCollect?: MonetaryAmount | null })?.cashToCollect
      ),
    };
  }, [paymentDetails]);

  const hasItems = items.length > 0;
  const restaurantName = restaurant?.name ?? t('cart.defaultRestaurantName');

  const extrasTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.extrasTotal * item.quantity, 0),
    [items]
  );
  const baseSubtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.basePrice * item.quantity, 0),
    [items]
  );
  const deliveryFee = useMemo(() => {
    if (isViewMode) {
      const breakdownFee = paymentBreakdown?.deliveryFee;
      if (typeof breakdownFee === 'number' && Number.isFinite(breakdownFee)) {
        return Math.max(breakdownFee, 0);
      }
      return 0;
    }

    if (!hasItems) {
      return 0;
    }

    if (deliveryQuote?.available && typeof deliveryQuote.fee === 'number') {
      return Math.max(deliveryQuote.fee, 0);
    }

    return 0;
  }, [isViewMode, paymentBreakdown, hasItems, deliveryQuote]);
  const serviceFee = useMemo(() => {
    if (isViewMode) {
      const fee = paymentBreakdown?.serviceFee;
      return typeof fee === 'number' && Number.isFinite(fee) ? Math.max(fee, 0) : 0;
    }
    if (!hasItems) return 0;
    return Math.max(Number(serviceFeeAmount) || 0, 0);
  }, [isViewMode, paymentBreakdown?.serviceFee, hasItems, serviceFeeAmount]);
  const calculateCouponDiscount = useCallback(
    (type?: CouponType, discountPercent?: number | null) => {
      if (!type) {
        return 0;
      }

      const orderBase = subtotal + deliveryFee + serviceFee;
      if (orderBase <= 0) {
        return 0;
      }

      if (type === 'FREE_DELIVERY') {
        return Math.min(deliveryFee, orderBase);
      }

      const percentValue = Number(discountPercent ?? 0);
      if (!Number.isFinite(percentValue) || percentValue <= 0) {
        return 0;
      }

      const discount = (orderBase * percentValue) / 100;
      return Math.min(Math.max(discount, 0), orderBase);
    },
    [subtotal, deliveryFee, serviceFee]
  );
  const discountValue = useMemo(
    () =>
      appliedCoupon
        ? calculateCouponDiscount(appliedCoupon.type, appliedCoupon.discountPercent)
        : 0,
    [appliedCoupon, calculateCouponDiscount]
  );
  const baseTotal = useMemo(
    () => Math.max(subtotal + deliveryFee + serviceFee - discountValue, 0),
    [subtotal, deliveryFee, serviceFee, discountValue]
  );
  const deliveryToken = (viewOrder as any)?.deliveryToken;
  const effectiveTipPercentage = useMemo(() => {
    if (isViewMode) {
      if (paymentBreakdown?.tipPercentage == null) {
        return null;
      }
      const clamped = Math.min(Math.max(paymentBreakdown.tipPercentage, 0), 100);
      return Math.round(clamped * 100) / 100;
    }

    if (selectedTipPercentage == null) {
      return null;
    }

    const clamped = Math.min(Math.max(selectedTipPercentage, 0), 100);
    return Math.round(clamped * 100) / 100;
  }, [isViewMode, paymentBreakdown, selectedTipPercentage]);

  const displayTipAmount = useMemo(() => {
    if (isViewMode) {
      const tipAmount = paymentBreakdown?.tipAmount;
      return tipAmount != null ? Math.max(tipAmount, 0) : 0;
    }

    if (effectiveTipPercentage == null || baseTotal <= 0) {
      return 0;
    }

    const computed = (baseTotal * effectiveTipPercentage) / 100;
    return Math.max(Math.round(computed * 100) / 100, 0);
  }, [isViewMode, paymentBreakdown, effectiveTipPercentage, baseTotal]);

  const displayTotalBeforeTip = useMemo(() => {
    if (isViewMode) {
      if (paymentBreakdown?.totalBeforeTip != null) {
        return Math.max(paymentBreakdown.totalBeforeTip, 0);
      }

      if (paymentBreakdown?.total != null) {
        const fallback = paymentBreakdown.total - (paymentBreakdown.tipAmount ?? 0);
        return Math.max(fallback, 0);
      }

      const orderTotal = extractNumericAmount((viewOrder as { total?: MonetaryAmount })?.total);
      if (orderTotal != null) {
        return Math.max(orderTotal - (paymentBreakdown?.tipAmount ?? 0), 0);
      }

      return viewModeTotals?.lineSubtotal ?? 0;
    }

    return baseTotal;
  }, [isViewMode, paymentBreakdown, baseTotal, viewOrder, viewModeTotals]);

  const displayCashToCollect = useMemo(() => {
    if (isViewMode) {
      const cashValue = paymentBreakdown?.cashToCollect;
      return cashValue != null ? Math.max(cashValue, 0) : null;
    }

    const parsed = parsePositiveDecimalInput(cashToCollectInput);
    return parsed != null ? parsed : null;
  }, [isViewMode, paymentBreakdown, cashToCollectInput]);

  const shouldShowTipSummary = useMemo(
    () => (isViewMode ? paymentBreakdown?.tipAmount != null : displayTipAmount > 0),
    [isViewMode, paymentBreakdown, displayTipAmount]
  );

  const shouldShowTotalBeforeTip = useMemo(
    () => (isViewMode ? paymentBreakdown?.totalBeforeTip != null : displayTipAmount > 0),
    [isViewMode, paymentBreakdown, displayTipAmount]
  );

  const shouldShowCashToCollect = useMemo(
    () =>
      isViewMode
        ? paymentBreakdown?.cashToCollect != null
        : selectedPaymentMethod === 'CASH' && displayCashToCollect != null,
    [isViewMode, paymentBreakdown, selectedPaymentMethod, displayCashToCollect]
  );

  const tipSummaryLabel = useMemo(() => {
    const baseLabel = t('checkout.summary.tip');
    if (effectiveTipPercentage != null && effectiveTipPercentage > 0) {
      const formatted = Number(effectiveTipPercentage.toFixed(2)).toString();
      return `${baseLabel} (${formatted}%)`;
    }
    return baseLabel;
  }, [t, effectiveTipPercentage]);

  const displayItems = useMemo<DisplayItem[]>(() => {
    if (isViewMode && viewOrder) {
      return viewOrderItems.map((item, index) => {
        const rawItem = item as {
          menuItemId?: number | string;
          menuItemName?: string;
          name?: string;
          quantity?: number;
          extras?: unknown;
          lineTotal?: MonetaryAmount;
          total?: MonetaryAmount;
          totalPrice?: MonetaryAmount;
          unitPrice?: MonetaryAmount;
          extrasPrice?: MonetaryAmount;
          unitBasePrice?: MonetaryAmount;
          unitExtrasPrice?: MonetaryAmount;
          lineSubtotal?: MonetaryAmount;
          promotionDiscount?: MonetaryAmount;
          lineItemsTotal?: MonetaryAmount;
          extrasTotal?: MonetaryAmount;
        };

        const quantityValue = Number(rawItem.quantity);
        const quantity = Number.isFinite(quantityValue) && quantityValue > 0 ? quantityValue : 1;
        const name =
          (typeof rawItem.name === 'string' && rawItem.name.trim().length ? rawItem.name : null) ??
          (typeof rawItem.menuItemName === 'string' && rawItem.menuItemName.trim().length
            ? rawItem.menuItemName
            : t('checkout.defaults.item'));

        const extrasSource = rawItem.extras;
        const extrasLabel = (() => {
          if (!extrasSource) {
            return undefined;
          }

          if (typeof extrasSource === 'string') {
            return extrasSource;
          }

          if (Array.isArray(extrasSource)) {
            const values = extrasSource
              .map((extra) => {
                if (!extra) {
                  return null;
                }
                if (typeof extra === 'string') {
                  return extra;
                }
                if (typeof extra === 'object') {
                  if ('name' in extra && typeof extra.name === 'string') {
                    return extra.name;
                  }
                  if ('label' in extra && typeof extra.label === 'string') {
                    return extra.label;
                  }
                }
                return null;
              })
              .filter((value): value is string => Boolean(value && value.trim().length));

            return values.length ? values.join(', ') : undefined;
          }

          return undefined;
        })();

        const lineTotal = extractNumericAmount(rawItem.lineTotal);
        const total = extractNumericAmount(rawItem.total);
        const totalPrice = extractNumericAmount(rawItem.totalPrice);
        const unitPrice = extractNumericAmount(rawItem.unitPrice);
        const extrasPrice = extractNumericAmount(rawItem.extrasPrice);
        const unitBasePrice = extractNumericAmount(rawItem.unitBasePrice);
        const unitExtrasPrice = extractNumericAmount(rawItem.unitExtrasPrice);
        const lineSubtotal = extractNumericAmount(rawItem.lineSubtotal);
        const promotionDiscount = extractNumericAmount(rawItem.promotionDiscount);
        const lineItemsTotal = extractNumericAmount(rawItem.lineItemsTotal);
        const extrasTotal = extractNumericAmount(rawItem.extrasTotal);

        const resolvedLineSubtotal =
          lineSubtotal ??
          (unitBasePrice != null ? unitBasePrice * quantity : null) ??
          (unitPrice != null ? unitPrice * quantity : null) ??
          0;

        const resolvedDiscount = (() => {
          if (promotionDiscount != null) {
            return Math.max(promotionDiscount, 0);
          }
          if (lineSubtotal != null && lineItemsTotal != null) {
            return Math.max(lineSubtotal - lineItemsTotal, 0);
          }
          return 0;
        })();

        const resolvedItemsTotal =
          lineItemsTotal ?? Math.max(resolvedLineSubtotal - resolvedDiscount, 0);

        const resolvedExtras =
          extrasTotal ??
          (unitExtrasPrice != null ? unitExtrasPrice * quantity : null) ??
          extrasPrice ??
          0;

        const resolvedTotal =
          lineTotal ?? total ?? totalPrice ?? Math.max(resolvedItemsTotal + resolvedExtras, 0);

        return {
          key: `order-${String(rawItem.menuItemId ?? name)}-${index}`,
          name,
          quantity,
          extrasLabel,
          total: resolvedTotal,
        } satisfies DisplayItem;
      });
    }

    return items.map((item) => ({
      key: item.id,
      name: item.name,
      quantity: item.quantity,
      extrasLabel:
        item.extras.flatMap((group) => group.extras.map((extra) => extra.name)).join(', ') ||
        undefined,
      total: item.totalPrice,
    }));
  }, [isViewMode, viewOrder, viewOrderItems, items, t]);

  const displayItemCount = useMemo(
    () => displayItems.reduce((sum, item) => sum + item.quantity, 0),
    [displayItems]
  );
  const hasDisplayItems = displayItems.length > 0;
  const itemSummaryPrefix = useMemo(
    () =>
      t('cart.itemSummaryPrefix', {
        values: {
          count: displayItemCount,
          productLabel: t(
            displayItemCount === 1 ? 'cart.productLabel.singular' : 'cart.productLabel.plural'
          ),
        },
      }),
    [displayItemCount, t]
  );
  const displayRestaurantName = useMemo(() => {
    if (!isViewMode || !viewOrder) {
      return restaurantName;
    }

    const candidates = [
      viewOrder.restaurant?.name,
      (viewOrder.restaurant as { restaurantName?: string } | undefined)?.restaurantName,
      (viewOrder as { restaurantName?: string } | null)?.restaurantName,
    ];

    const resolved = candidates.find(
      (value): value is string => typeof value === 'string' && value.trim().length > 0
    );

    return resolved ?? t('cart.defaultRestaurantName');
  }, [isViewMode, viewOrder, restaurantName, t]);

  const displaySubtotal = useMemo(() => {
    if (!isViewMode || !viewOrder) {
      return baseSubtotal;
    }

    if (paymentBreakdown?.itemsSubtotal != null) {
      return paymentBreakdown.itemsSubtotal;
    }

    if (paymentBreakdown?.subtotal != null && paymentBreakdown?.extrasTotal != null) {
      return Math.max(paymentBreakdown.subtotal - paymentBreakdown.extrasTotal, 0);
    }

    if (paymentBreakdown?.subtotal != null) {
      return paymentBreakdown.subtotal;
    }

    if (paymentBreakdown?.itemsTotal != null && paymentBreakdown?.extrasTotal != null) {
      return Math.max(paymentBreakdown.itemsTotal - paymentBreakdown.extrasTotal, 0);
    }

    return viewModeTotals?.lineSubtotal ?? 0;
  }, [isViewMode, viewOrder, baseSubtotal, viewModeTotals, paymentBreakdown]);

  const displayExtrasTotal = useMemo(() => {
    if (!isViewMode || !viewOrder) {
      return extrasTotal;
    }

    if (paymentBreakdown?.extrasTotal != null) {
      return paymentBreakdown.extrasTotal;
    }

    if (paymentBreakdown?.itemsTotal != null && paymentBreakdown?.itemsSubtotal != null) {
      return Math.max(paymentBreakdown.itemsTotal - paymentBreakdown.itemsSubtotal, 0);
    }

    if (paymentBreakdown?.subtotal != null && paymentBreakdown?.itemsSubtotal != null) {
      return Math.max(paymentBreakdown.subtotal - paymentBreakdown.itemsSubtotal, 0);
    }

    return viewModeTotals?.extrasTotal ?? 0;
  }, [isViewMode, viewOrder, extrasTotal, viewModeTotals, paymentBreakdown]);

  const displayTotal = useMemo(() => {
    if (!isViewMode || !viewOrder) {
      return Math.max(displayTotalBeforeTip + displayTipAmount, 0);
    }

    if (paymentBreakdown?.total != null) {
      return paymentBreakdown.total;
    }

    if (paymentBreakdown?.grandTotal != null) {
      return paymentBreakdown.grandTotal;
    }

    if (paymentBreakdown?.subtotal != null && paymentBreakdown?.deliveryFee != null) {
      const subtotalWithFees = Math.max(
        paymentBreakdown.subtotal + paymentBreakdown.deliveryFee,
        0
      );
      return subtotalWithFees + Math.max(paymentBreakdown.tipAmount ?? 0, 0);
    }

    if (paymentBreakdown?.itemsTotal != null) {
      return paymentBreakdown.itemsTotal + Math.max(paymentBreakdown.tipAmount ?? 0, 0);
    }

    const orderTotal = extractNumericAmount((viewOrder as { total?: MonetaryAmount })?.total);
    if (orderTotal != null) {
      return orderTotal;
    }

    return Math.max(displayTotalBeforeTip + Math.max(paymentBreakdown?.tipAmount ?? 0, 0), 0);
  }, [isViewMode, viewOrder, paymentBreakdown, displayTotalBeforeTip, displayTipAmount]);

  const displayPromotionDiscount = useMemo(() => {
    if (!isViewMode || !viewOrder) {
      return 0;
    }

    if (paymentBreakdown?.promotionDiscount != null) {
      return Math.max(paymentBreakdown.promotionDiscount, 0);
    }

    if (
      paymentBreakdown?.itemsTotal != null &&
      paymentBreakdown?.subtotal != null &&
      paymentBreakdown.itemsTotal > paymentBreakdown.subtotal
    ) {
      return Math.max(paymentBreakdown.itemsTotal - paymentBreakdown.subtotal, 0);
    }

    if (viewModeTotals) {
      if (viewModeTotals.promotionDiscount > 0) {
        return Math.max(viewModeTotals.promotionDiscount, 0);
      }

      if (viewModeTotals.itemsTotal < viewModeTotals.lineSubtotal) {
        return Math.max(viewModeTotals.lineSubtotal - viewModeTotals.itemsTotal, 0);
      }
    }

    return 0;
  }, [isViewMode, viewOrder, paymentBreakdown, viewModeTotals]);

  const displayFees = useMemo(() => {
    if (!isViewMode || !viewOrder) {
      return deliveryFee + serviceFee;
    }

    if (paymentBreakdown?.deliveryFee != null) {
      return paymentBreakdown.deliveryFee;
    }

    if (paymentBreakdown?.total != null && paymentBreakdown?.subtotal != null) {
      const diff =
        paymentBreakdown.total -
        paymentBreakdown.subtotal -
        Math.max(paymentBreakdown.tipAmount ?? 0, 0) +
        displayPromotionDiscount;
      if (Number.isFinite(diff)) {
        return Math.max(diff, 0);
      }
    }

    const computed =
      displayTotal -
      displayTipAmount -
      (displaySubtotal + displayExtrasTotal) +
      displayPromotionDiscount;

    if (Number.isFinite(computed)) {
      return Math.max(computed, 0);
    }

    const fallback = displayTotal - displayTipAmount - (displaySubtotal + displayExtrasTotal);

    if (Number.isFinite(fallback)) {
      return Math.max(fallback, 0);
    }

    return 0;
  }, [
    isViewMode,
    viewOrder,
    paymentBreakdown,
    deliveryFee,
    serviceFee,
    displayTotal,
    displaySubtotal,
    displayExtrasTotal,
    displayPromotionDiscount,
    displayTipAmount,
  ]);

  const deliveryStatusMessage = useMemo(() => {
    if (isViewMode) {
      return null;
    }

    if (isDeliveryQuoteLoading) {
      return t('checkout.summary.checkingDelivery');
    }

    if (deliveryQuote?.available === false) {
      return t('checkout.errors.deliveryUnavailable');
    }

    if (deliveryQuoteError === 'INVALID_COORDINATES') {
      return t('checkout.errors.missingCoordinates');
    }

    if (deliveryQuoteError === 'REQUEST_FAILED') {
      return t('checkout.errors.deliveryQuoteFailed');
    }

    return null;
  }, [isViewMode, isDeliveryQuoteLoading, deliveryQuote?.available, deliveryQuoteError, t]);

  const deliveryStatusColor =
    deliveryQuote?.available === false || deliveryQuoteError ? '#CA251B' : '#6B7280';

  const deliveryAddressValue = useMemo(() => {
    if (!isViewMode || !viewOrder) {
      return selectedAddress?.formattedAddress ?? '';
    }

    const candidates = [
      viewOrder.delivery?.address,
      (viewOrder.delivery?.savedAddress as { formattedAddress?: string } | undefined)
        ?.formattedAddress,
      (viewOrder as { deliveryAddress?: string | null })?.deliveryAddress ?? null,
      (viewOrder.savedAddress as { formattedAddress?: string } | undefined)?.formattedAddress,
    ];

    const resolved = candidates.find(
      (value): value is string => typeof value === 'string' && value.trim().length > 0
    );

    return resolved ?? '';
  }, [isViewMode, viewOrder, selectedAddress]);

  const deliveryAddressTitle = useMemo(() => {
    if (!isViewMode || !viewOrder) {
      if (selectedAddress?.label?.trim()?.length) {
        return selectedAddress.label;
      }
      return t('checkout.address.savedAddressFallback');
    }

    const candidates = [
      viewOrder.delivery?.savedAddress?.label,
      (viewOrder.savedAddress as { label?: string } | undefined)?.label,
    ];

    const resolved = candidates.find(
      (value): value is string => typeof value === 'string' && value.trim().length > 0
    );

    return resolved ?? t('checkout.address.deliveryAddressFallback');
  }, [isViewMode, viewOrder, selectedAddress, t]);

  const hasDeliveryAddress = isViewMode
    ? Boolean(deliveryAddressValue && deliveryAddressValue.trim().length)
    : Boolean(selectedAddress);
  const emptyAddressMessage = isViewMode
    ? t('checkout.address.empty.viewMode')
    : t('checkout.address.empty.editMode');

  const combinedInstructions = useMemo(() => {
    const trimmedComment = comment.trim();
    const trimmedAllergies = allergies.trim();
    const parts: string[] = [];

    if (trimmedComment.length) {
      parts.push(trimmedComment);
    }

    if (trimmedAllergies.length) {
      parts.push(t('checkout.instructions.allergies', { value: trimmedAllergies }));
    }

    if (!parts.length) {
      return undefined;
    }

    return parts.join(' | ');
  }, [allergies, comment, t]);

  const paymentMethodLabel = useMemo(() => {
    if (isViewMode && viewOrder) {
      const method = paymentDetails?.method ?? viewOrder.paymentMethod;
      return formatPaymentMethodLabel(method);
    }

    if (!selectedPaymentMethod) {
      return t('checkout.payment.selectMethod');
    }

    const option = paymentOptions.find((candidate) => candidate.id === selectedPaymentMethod);
    return option?.label ?? t('checkout.payment.selectMethod');
  }, [
    isViewMode,
    viewOrder,
    paymentDetails,
    formatPaymentMethodLabel,
    selectedPaymentMethod,
    paymentOptions,
    t,
  ]);

  const SelectedPaymentIcon = useMemo(() => {
    if (isViewMode && viewOrder) {
      const method = paymentDetails?.method ?? viewOrder.paymentMethod;
      return resolvePaymentIcon(method);
    }

    if (!selectedPaymentMethod) {
      return CreditCard;
    }
    const option = paymentOptions.find((candidate) => candidate.id === selectedPaymentMethod);
    return option?.Icon ?? CreditCard;
  }, [isViewMode, viewOrder, selectedPaymentMethod, paymentDetails, paymentOptions]);

  const deliveryRegion = useMemo(() => {
    if (isViewMode && viewOrder) {
      const candidateLocations = [
        viewOrder.delivery?.location,
        (
          viewOrder as {
            deliveryLocation?: { lat?: number | string; lng?: number | string };
          } | null
        )?.deliveryLocation,
      ];

      for (const location of candidateLocations) {
        if (!location) {
          continue;
        }

        const latCandidate = Number((location as { lat?: number | string }).lat);
        const lngCandidate = Number((location as { lng?: number | string }).lng);

        if (Number.isFinite(latCandidate) && Number.isFinite(lngCandidate)) {
          return {
            latitude: latCandidate,
            longitude: lngCandidate,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          };
        }
      }
    }

    if (!selectedAddress?.coordinates) {
      return null;
    }

    const latCandidate = Number(selectedAddress.coordinates.latitude);
    const lngCandidate = Number(selectedAddress.coordinates.longitude);

    if (!Number.isFinite(latCandidate) || !Number.isFinite(lngCandidate)) {
      return null;
    }

    return {
      latitude: latCandidate,
      longitude: lngCandidate,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }, [isViewMode, viewOrder, selectedAddress]);

  const addressDetails = useMemo(() => {
    if (isViewMode) {
      const candidates = [
        viewOrder?.delivery?.savedAddress?.formattedAddress,
        (viewOrder?.savedAddress as { formattedAddress?: string } | undefined)?.formattedAddress,
      ];

      const normalizedValue = deliveryAddressValue.trim();
      for (const candidate of candidates) {
        if (typeof candidate === 'string' && candidate.trim().length) {
          const normalizedDetail = candidate.trim();
          if (!normalizedValue || normalizedValue !== normalizedDetail) {
            return candidate;
          }
        }
      }
      return null;
    }

    if (!selectedAddress) {
      return null;
    }

    const candidates = [
      selectedAddress.directions,
      selectedAddress.notes,
      selectedAddress.entranceNotes,
    ];
    const detail = candidates.find(
      (value): value is string => typeof value === 'string' && value.trim().length > 0
    );

    return detail ?? null;
  }, [isViewMode, viewOrder, selectedAddress, deliveryAddressValue]);

  const handlePaymentSelection = useCallback((method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    setIsPaymentModalVisible(false);
  }, []);

  const handleRemoveCoupon = useCallback(() => {
    setAppliedCoupon(null);
  }, []);

  const handleOpenLocationSelection = useCallback(() => {
    if (isViewMode) {
      return;
    }
    navigation.navigate('LocationSelection');
  }, [navigation, isViewMode]);

  const validateBeforeSubmission = useCallback((): { lat: number; lng: number } | null => {
    if (isViewMode) {
      return null;
    }

    if (!hasItems) {
      setSubmissionError(t('checkout.errors.emptyCart'));
      return null;
    }

    if (!restaurant?.id) {
      setSubmissionError(t('checkout.errors.missingRestaurant'));
      return null;
    }

    if (!selectedAddress) {
      setSubmissionError(t('checkout.errors.missingAddress'));
      return null;
    }

    const latCandidate = Number(selectedAddress.coordinates?.latitude);
    const lngCandidate = Number(selectedAddress.coordinates?.longitude);

    if (!Number.isFinite(latCandidate) || !Number.isFinite(lngCandidate)) {
      setSubmissionError(t('checkout.errors.missingCoordinates'));
      return null;
    }

    if (!selectedPaymentMethod) {
      setSubmissionError(t('checkout.errors.missingPayment'));
      return null;
    }

    if (isDeliveryQuoteLoading) {
      setSubmissionError(t('checkout.errors.deliveryFeePending'));
      return null;
    }

    if (deliveryQuote?.available === false) {
      setSubmissionError(t('checkout.errors.deliveryUnavailable'));
      return null;
    }

    if (deliveryQuoteError === 'INVALID_COORDINATES') {
      setSubmissionError(t('checkout.errors.missingCoordinates'));
      return null;
    }

    if (deliveryQuoteError) {
      setSubmissionError(t('checkout.errors.deliveryQuoteFailed'));
      return null;
    }

    setSubmissionError(null);
    return { lat: latCandidate, lng: lngCandidate };
  }, [
    isViewMode,
    hasItems,
    restaurant?.id,
    selectedAddress,
    selectedPaymentMethod,
    isDeliveryQuoteLoading,
    deliveryQuote?.available,
    deliveryQuoteError,
    t,
  ]);

  const submitOrder = useCallback(
    async (
      tipPercentageValue: number | null,
      cashToCollectValue: number | null,
      coordinatesOverride?: { lat: number; lng: number } | null
    ) => {
      if (isViewMode) {
        return;
      }

      const coordinates = coordinatesOverride ?? validateBeforeSubmission();
      if (!coordinates) {
        return;
      }

      if (!selectedAddress) {
        setSubmissionError(t('checkout.errors.missingAddress'));
        return;
      }

      const restaurantId = restaurant?.id;
      if (!restaurantId) {
        setSubmissionError(t('checkout.errors.missingRestaurant'));
        return;
      }

      if (!selectedPaymentMethod) {
        setSubmissionError(t('checkout.errors.missingPayment'));
        return;
      }

      const numericUserId = typeof user?.id === 'number' ? user.id : Number(user?.id);

      const paymentMethodPayload = selectedPaymentMethod === 'CASH' ? 'cash' : 'card';

      const payload = {
        deliveryAddress: selectedAddress.formattedAddress ?? '',
        items: items.map((item) => {
          const extraIds = item.extras.flatMap((group) => group.extras.map((extra) => extra.id));
          return {
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            specialInstructions: combinedInstructions,
            extraIds: extraIds.length ? extraIds : undefined,
          };
        }),
        location: {
          lat: coordinates.lat,
          lng: coordinates.lng,
        },
        paymentMethod: paymentMethodPayload,
        restaurantId,
        userId: Number.isFinite(numericUserId) ? Number(numericUserId) : undefined,
        savedAddressId: selectedAddress.id,
      } as OrderRequest;

      if (appliedCoupon?.code) {
        payload.couponCode = appliedCoupon.code;
      }

      if (tipPercentageValue != null) {
        const clampedTip = Math.min(Math.max(tipPercentageValue, 0), 100);
        payload.tipPercentage = Number(clampedTip.toFixed(2));
      }

      if (cashToCollectValue != null) {
        payload.cashToCollect = Number(cashToCollectValue.toFixed(2));
      }

      setIsSubmitting(true);

      try {
        const response = await createOrder(payload);

        updateOngoingOrder({
          orderId: response.orderId,
          status: response.status,
          restaurant: response.restaurant,
          delivery: response.delivery,
          payment: response.payment,
          items: response.items as unknown as OngoingOrderData['items'],
          workflow: response.workflow,
        });
        clearCart();
        setAppliedCoupon(null);
        setComment('');
        setAllergies('');
        navigation.navigate('OrderTracking', { order: response });

        const paymentUrl =
          typeof response?.payment?.paymentUrl === 'string'
            ? response.payment.paymentUrl.trim()
            : '';

        if (paymentUrl) {
          try {
            const canOpen = await Linking.canOpenURL(paymentUrl);
            if (!canOpen) {
              throw new Error('UNSUPPORTED_URL');
            }
            await Linking.openURL(paymentUrl);
          } catch (error) {
            console.warn('Failed to open Konnect payment URL', error);
            Alert.alert(
              t('orderTracking.payment.openErrorTitle'),
              t('orderTracking.payment.openErrorMessage')
            );
          }
        }
      } catch (error) {
        console.error('Failed to create order:', error);
        const message = (() => {
          if (isAxiosError(error)) {
            const responseMessage =
              (typeof error.response?.data === 'object' &&
              error.response?.data &&
              'message' in error.response.data
                ? String((error.response?.data as { message?: unknown }).message)
                : null) ?? error.message;
            return responseMessage || t('checkout.errors.generic');
          }

          if (error instanceof Error) {
            return error.message;
          }

          return t('checkout.errors.generic');
        })();

        setSubmissionError(message);
        Alert.alert(t('checkout.alerts.orderFailedTitle'), message);
      } finally {
        setIsSubmitting(false);
        setPendingCoordinates(null);
      }
    },
    [
      isViewMode,
      validateBeforeSubmission,
      selectedAddress,
      restaurant?.id,
      selectedPaymentMethod,
      user?.id,
      items,
      combinedInstructions,
      appliedCoupon?.code,
      clearCart,
      navigation,
      t,
      updateOngoingOrder,
    ]
  );

  // Function to calculate distance between two coordinates (in meters)
  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371e3; // Earth's radius in meters

      // Convert latitude and longitude to radians
      const φ1 = (lat1 * Math.PI) / 180;
      const φ2 = (lat2 * Math.PI) / 180;
      const Δφ = ((lat2 - lat1) * Math.PI) / 180;
      const Δλ = ((lon2 - lon1) * Math.PI) / 180;

      // Haversine formula: calculate the great-circle distance between two points
      // a = sin²(Δφ/2) + cos(φ1) * cos(φ2) * sin²(Δλ/2)
      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

      // c = 2 * atan2(√a, √(1−a))
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      // Distance = R * c
      return R * c;
    },
    []
  );

  // Function to check if addresses match (within 500 meters tolerance)
  const checkAddressMismatch = useCallback((): boolean => {
    if (!currentGpsLocation || !selectedAddress?.coordinates) {
      return false;
    }

    const selectedLat = Number(selectedAddress.coordinates.latitude);
    const selectedLng = Number(selectedAddress.coordinates.longitude);

    if (!Number.isFinite(selectedLat) || !Number.isFinite(selectedLng)) {
      return false;
    }

    const distance = calculateDistance(
      currentGpsLocation.latitude,
      currentGpsLocation.longitude,
      selectedLat,
      selectedLng
    );

    // Consider addresses as mismatched if distance is more than 500 meters
    return distance > 500;
  }, [currentGpsLocation, selectedAddress, calculateDistance]);

  const handleConfirmOrder = useCallback(() => {
    if (isViewMode) {
      return;
    }

    // Check if there's an ongoing order first
    if (ongoingOrder && ongoingOrder.orderId) {
      setShowOngoingOrderWarning(true);
      return;
    }

    const coordinates = validateBeforeSubmission();
    if (!coordinates) {
      return;
    }

    // Check for address mismatch
    const hasMismatch = checkAddressMismatch();
    if (hasMismatch && !showAddressMismatchOverlay) {
      setShowAddressMismatchOverlay(true);
      return;
    }

    setPendingCoordinates(coordinates);
    setTipOverlayError(null);
    setIsTipModalVisible(true);
  }, [isViewMode, ongoingOrder, validateBeforeSubmission, checkAddressMismatch, showAddressMismatchOverlay]);

  const handleTipOverlayConfirm = useCallback(() => {
    if (isViewMode) {
      return;
    }

    setTipOverlayError(null);

    const normalizedTip =
      selectedTipPercentage != null
        ? Math.round(Math.min(Math.max(selectedTipPercentage, 0), 100) * 100) / 100
        : null;

    let cashValue: number | null = null;
    if (selectedPaymentMethod === 'CASH') {
      if (!cashToCollectInput.trim().length) {
        setTipOverlayError(t('checkout.tip.overlay.errors.requiredCash'));
        return;
      }

      const parsedCash = parsePositiveDecimalInput(cashToCollectInput);
      if (parsedCash == null) {
        setTipOverlayError(t('checkout.tip.overlay.errors.invalidCash'));
        return;
      }

      cashValue = parsedCash;
      setCashToCollectInput(parsedCash.toFixed(2));
    }

    setSelectedTipPercentage(normalizedTip);
    setIsTipModalVisible(false);
    submitOrder(normalizedTip, cashValue, pendingCoordinates);
    setPendingCoordinates(null);
  }, [
    isViewMode,
    selectedTipPercentage,
    selectedPaymentMethod,
    cashToCollectInput,
    t,
    submitOrder,
    pendingCoordinates,
  ]);

  const handleAddressMismatchContinue = useCallback(() => {
    setShowAddressMismatchOverlay(false);

    // Proceed with the order using selected address
    const coordinates = validateBeforeSubmission();
    if (!coordinates) {
      return;
    }

    setPendingCoordinates(coordinates);
    setTipOverlayError(null);
    setIsTipModalVisible(true);
  }, [validateBeforeSubmission]);

  const handleAddressMismatchUpdateLocation = useCallback(() => {
    setShowAddressMismatchOverlay(false);

    // Navigate to location selection screen to update address
    navigation.navigate('LocationSelection');
  }, [navigation]);

  const handleAddressMismatchCancel = useCallback(() => {
    setShowAddressMismatchOverlay(false);
  }, []);

  const isDeliveryQuoteBlocking =
    !isViewMode &&
    (isDeliveryQuoteLoading || deliveryQuote?.available === false || Boolean(deliveryQuoteError));

  const canSubmit =
    !isViewMode &&
    hasItems &&
    Boolean(selectedAddress) &&
    Boolean(selectedPaymentMethod) &&
    !isSubmitting &&
    !isDeliveryQuoteBlocking;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 pb-4 pt-2">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mr-4 rounded-full border border-[#E4E6EB] p-2">
          <ArrowLeft size={20} color={sectionTitleColor} />
        </TouchableOpacity>
        <Text
          allowFontScaling={false}
          className="flex-1 text-center text-xl font-bold"
          style={{ color: sectionTitleColor }}>
          {t('checkout.title')}
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} className="flex-1">
        <View className="px-4">
          <View className="rounded-3xl bg-white">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setItemsExpanded((prev) => !prev)}
              className="flex-row items-center justify-between rounded-3xl border border-[#F0F1F3] px-5 py-4">
              <View>
                <Text
                  allowFontScaling={false}
                  className="text-sm font-semibold"
                  style={{ color: accentColor }}>
                  {itemSummaryPrefix}
                </Text>
                <Text
                  allowFontScaling={false}
                  className="text-lg font-bold"
                  style={{ color: accentColor }}>
                  {displayRestaurantName}
                </Text>
                {hasValidEstimatedDeliveryTime(restaurant?.estimatedDeliveryTime) && (
                  <Text allowFontScaling={false} className="mt-0.5 text-xs text-gray-500">
                    {t('restaurantDetails.delivery.estimatedTime', {
                      values: { time: restaurant!.estimatedDeliveryTime },
                    })}
                  </Text>
                )}
                <Text
                  allowFontScaling={false}
                  className="mt-1 text-sm font-semibold text-[#17213A]">
                  {formatCurrency(displaySubtotal)}
                </Text>
              </View>
              <ChevronDown
                size={20}
                color={accentColor}
                style={{ transform: [{ rotate: itemsExpanded ? '180deg' : '0deg' }] }}
              />
            </TouchableOpacity>
            {itemsExpanded ? (
              <View className="border-t" style={{ borderColor }}>
                {hasDisplayItems ? (
                  displayItems.map((item) => (
                    <View key={item.key} className="flex-row items-start justify-between px-5 py-4">
                      <View className="flex-1 pr-3">
                        <Text
                          allowFontScaling={false}
                          className="text-sm font-semibold text-[#17213A]">
                          {item.quantity} × {item.name}
                        </Text>
                        {item.extrasLabel ? (
                          <Text allowFontScaling={false} className="mt-1 text-xs text-[#6B7280]">
                            {t('checkout.items.extrasLabel', {
                              values: { extras: item.extrasLabel },
                            })}
                          </Text>
                        ) : null}
                      </View>
                      <Text
                        allowFontScaling={false}
                        className="text-sm font-semibold text-[#17213A]">
                        {formatCurrency(item.total)}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View className="px-5 py-4">
                    <Text allowFontScaling={false} className="text-sm text-[#6B7280]">
                      {t(
                        isViewMode
                          ? 'checkout.items.empty.viewMode'
                          : 'checkout.items.empty.editMode'
                      )}
                    </Text>
                  </View>
                )}
              </View>
            ) : null}
          </View>

          {!isViewMode ? (
            <>
              <Accordion
                title={t('checkout.sections.allergies.title')}
                expanded={allergiesExpanded}
                onToggle={() => setAllergiesExpanded((prev) => !prev)}>
                <TextInput
                  allowFontScaling={false}
                  multiline
                  placeholder={t('checkout.sections.allergies.placeholder')}
                  placeholderTextColor="#9CA3AF"
                  value={allergies}
                  onChangeText={setAllergies}
                  className="min-h-[80px] rounded-2xl border border-[#F1F2F4] bg-[#F9FAFB] px-4 py-3 text-sm text-[#17213A]"
                  textAlignVertical="top"
                />
              </Accordion>

              <Accordion
                title={t('checkout.sections.comment.title')}
                expanded={commentExpanded}
                onToggle={() => setCommentExpanded((prev) => !prev)}>
                <TextInput
                  allowFontScaling={false}
                  multiline
                  placeholder={t('checkout.sections.comment.placeholder')}
                  placeholderTextColor="#9CA3AF"
                  value={comment}
                  onChangeText={setComment}
                  className="min-h-[80px] rounded-2xl border border-[#F1F2F4] bg-[#F9FAFB] px-4 py-3 text-sm text-[#17213A]"
                  textAlignVertical="top"
                />
              </Accordion>
            </>
          ) : null}

          <View className="mt-6">
            <View className="flex-row items-center justify-between">
              <Text
                allowFontScaling={false}
                className="text-base font-bold"
                style={{ color: sectionTitleColor }}>
                {t('checkout.address.sectionTitle')}
              </Text>
              {!isViewMode ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleOpenLocationSelection}
                  className="rounded-full bg-[#FDE7E5] px-6 py-3">
                  <Text allowFontScaling={false} className=" font-semibold text-[#CA251B]">
                    {t('checkout.address.changeCta')}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
            {hasDeliveryAddress ? (
              <View className="mt-3 overflow-hidden rounded-3xl border" style={{ borderColor }}>
                <View style={styles.mapWrapper}>
                  {deliveryRegion ? (
                    <MapView
                      key={
                        isViewMode ? `order-${viewOrder?.orderId ?? 'map'}` : selectedAddress?.id
                      }
                      style={StyleSheet.absoluteFill}
                      initialRegion={deliveryRegion}
                      scrollEnabled={false}
                      zoomEnabled={false}
                      pitchEnabled={false}
                      rotateEnabled={false}>
                      <Marker
                        coordinate={deliveryRegion}
                        title={t('checkout.address.markerTitle')}
                        description={deliveryAddressValue || undefined}
                      />
                    </MapView>
                  ) : (
                    <View className="flex-1 items-center justify-center bg-[#FDE7E5]">
                      <MapPin size={24} color={accentColor} />
                      <Text
                        allowFontScaling={false}
                        className="mt-2 text-xs font-semibold text-[#CA251B]">
                        {t(
                          isViewMode
                            ? 'checkout.address.mapUnavailable.viewMode'
                            : 'checkout.address.mapUnavailable.editMode'
                        )}
                      </Text>
                    </View>
                  )}
                </View>
                <View className="flex-row items-start gap-3 bg-white px-4 py-4">
                  <MapPin size={18} color={accentColor} />
                  <View className="flex-1">
                    <Text allowFontScaling={false} className="text-sm font-semibold text-[#17213A]">
                      {deliveryAddressTitle}
                    </Text>
                    <Text allowFontScaling={false} className="mt-1 text-sm text-[#4B5563]">
                      {deliveryAddressValue || emptyAddressMessage}
                    </Text>
                    {addressDetails ? (
                      <Text allowFontScaling={false} className="mt-1 text-xs text-[#6B7280]">
                        {addressDetails}
                      </Text>
                    ) : null}
                  </View>
                </View>
              </View>
            ) : !isViewMode ? (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleOpenLocationSelection}
                className="mt-3 flex-row items-center justify-between rounded-3xl border border-dashed border-[#F0F1F3] bg-white px-5 py-4">
                <View className="flex-1 flex-row items-center">
                  <MapPin size={22} color={accentColor} />
                  <Text
                    allowFontScaling={false}
                    className="ml-3 flex-1 text-base font-semibold"
                    style={{ color: sectionTitleColor }}>
                    {t('checkout.address.choosePrompt')}
                  </Text>
                </View>
                <ChevronDown
                  size={20}
                  color={sectionTitleColor}
                  style={{ transform: [{ rotate: '-90deg' }] }}
                />
              </TouchableOpacity>
            ) : (
              <View className="mt-3 rounded-3xl border border-dashed border-[#F0F1F3] bg-white px-5 py-4">
                <View className="flex-row items-center">
                  <MapPin size={22} color={accentColor} />
                  <Text
                    allowFontScaling={false}
                    className="ml-3 flex-1 text-base font-semibold"
                    style={{ color: sectionTitleColor }}>
                    {emptyAddressMessage}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View className="mt-6">
            <Text
              allowFontScaling={false}
              className="text-base font-bold"
              style={{ color: sectionTitleColor }}>
              {t('checkout.payment.sectionTitle')}
            </Text>
            {isViewMode ? (
              <View className="mt-3 flex-row items-center justify-between rounded-3xl border border-[#F0F1F3] bg-white px-5 py-4">
                <View className="flex-row items-center">
                  <SelectedPaymentIcon size={22} color={accentColor} />
                  <Text
                    allowFontScaling={false}
                    className="ml-3 text-base font-semibold"
                    style={{ color: sectionTitleColor }}>
                    {paymentMethodLabel}
                  </Text>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsPaymentModalVisible(true)}
                className="mt-3 flex-row items-center justify-between rounded-3xl border border-[#F0F1F3] bg-white px-5 py-4">
                <View className="flex-row items-center">
                  <SelectedPaymentIcon size={22} color={accentColor} />
                  <Text
                    allowFontScaling={false}
                    className="ml-3 text-base font-semibold"
                    style={{ color: sectionTitleColor }}>
                    {paymentMethodLabel}
                  </Text>
                </View>
                <ChevronDown size={20} color={sectionTitleColor} />
              </TouchableOpacity>
            )}
          </View>

          {!isViewMode ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                navigation.navigate('CouponCode', {
                  currentCode: appliedCoupon?.code,
                })
              }
              className="mt-4 flex-row items-center justify-between rounded-3xl border border-dashed border-[#F0F1F3] bg-white px-5 py-4">
              <View className="flex-1 flex-row items-center">
                <TicketPercent size={22} color={accentColor} />
                <View className="ml-3 flex-1">
                  <Text
                    allowFontScaling={false}
                    className="text-base font-semibold"
                    style={{ color: sectionTitleColor }}>
                    {appliedCoupon ? t('checkout.coupon.applied') : t('checkout.coupon.add')}
                  </Text>
                  {appliedCoupon ? (
                    <Text allowFontScaling={false} className="mt-1 text-sm text-[#6B7280]">
                      {appliedCoupon.code} −{formatCurrency(discountValue)}
                    </Text>
                  ) : null}
                </View>
              </View>
              {appliedCoupon ? (
                <TouchableOpacity
                  accessibilityRole="button"
                  onPress={(event: GestureResponderEvent) => {
                    event.stopPropagation();
                    handleRemoveCoupon();
                  }}>
                  <X size={20} color={sectionTitleColor} />
                </TouchableOpacity>
              ) : (
                <PenSquare size={20} color={sectionTitleColor} />
              )}
            </TouchableOpacity>
          ) : null}

          <View className="mt-6 rounded-3xl border border-[#F0F1F3] bg-white p-5">
            <View className="flex-row items-center justify-between">
              <Text allowFontScaling={false} className="text-sm text-[#6B7280]">
                {t('checkout.summary.items')}
              </Text>
              <Text allowFontScaling={false} className="text-sm font-semibold text-[#4B5563]">
                {formatCurrency(displaySubtotal)}
              </Text>
            </View>
            <View className="mt-3 flex-row items-center justify-between">
              <Text allowFontScaling={false} className="text-sm text-[#6B7280]">
                {t('checkout.summary.extras')}
              </Text>
              <Text allowFontScaling={false} className="text-sm font-semibold text-[#4B5563]">
                {formatCurrency(displayExtrasTotal)}
              </Text>
            </View>
            {!isViewMode ? (
              <>
                <View className="mt-3 flex-row items-center justify-between">
                  <Text allowFontScaling={false} className="text-sm text-[#6B7280]">
                    {t('checkout.summary.delivery')}
                  </Text>
                  <View className="flex-row items-center">
                    {isDeliveryQuoteLoading ? (
                      <ActivityIndicator size="small" color={sectionTitleColor} />
                    ) : (
                      <Text
                        allowFontScaling={false}
                        className="text-sm font-semibold text-[#4B5563]">
                        {formatCurrency(deliveryFee)}
                      </Text>
                    )}
                  </View>
                </View>
                {deliveryStatusMessage ? (
                  <Text
                    allowFontScaling={false}
                    className="mt-2 text-xs"
                    style={{ color: deliveryStatusColor }}>
                    {deliveryStatusMessage}
                  </Text>
                ) : null}
                <View className="mt-3 flex-row items-center justify-between">
                  <Text allowFontScaling={false} className="text-sm text-[#6B7280]">
                    {t('checkout.summary.service')}
                  </Text>
                  <Text allowFontScaling={false} className="text-sm font-semibold text-[#4B5563]">
                    {formatCurrency(serviceFee)}
                  </Text>
                </View>
              </>
            ) : (
              <>
                <View className="mt-3 flex-row items-center justify-between">
                  <Text allowFontScaling={false} className="text-sm text-[#6B7280]">
                    {t('checkout.summary.service')}
                  </Text>
                  <Text allowFontScaling={false} className="text-sm font-semibold text-[#4B5563]">
                    {formatCurrency(serviceFee)}
                  </Text>
                </View>
                <View className="mt-3 flex-row items-center justify-between">
                  <Text allowFontScaling={false} className="text-sm text-[#6B7280]">
                    {t('checkout.summary.fees')}
                  </Text>
                  <Text allowFontScaling={false} className="text-sm font-semibold text-[#4B5563]">
                    {formatCurrency(displayFees)}
                  </Text>
                </View>
              </>
            )}
            {!isViewMode && appliedCoupon ? (
              <View className="mt-3 flex-row items-center justify-between">
                <Text allowFontScaling={false} className="text-sm text-[#6B7280]">
                  {t('checkout.summary.coupon', { values: { code: appliedCoupon.code } })}
                </Text>
                <Text allowFontScaling={false} className="text-sm font-semibold text-[#CA251B]">
                  −{formatCurrency(discountValue)}
                </Text>
              </View>
            ) : null}
            {isViewMode && displayPromotionDiscount > 0 ? (
              <View className="mt-3 flex-row items-center justify-between">
                <Text allowFontScaling={false} className="text-sm text-[#6B7280]">
                  {t('checkout.summary.promotion')}
                </Text>
                <Text allowFontScaling={false} className="text-sm font-semibold text-[#CA251B]">
                  −{formatCurrency(displayPromotionDiscount)}
                </Text>
              </View>
            ) : null}
            {shouldShowTotalBeforeTip ? (
              <View className="mt-3 flex-row items-center justify-between">
                <Text allowFontScaling={false} className="text-sm text-[#6B7280]">
                  {t('checkout.summary.beforeTip')}
                </Text>
                <Text allowFontScaling={false} className="text-sm font-semibold text-[#4B5563]">
                  {formatCurrency(displayTotalBeforeTip)}
                </Text>
              </View>
            ) : null}
            {shouldShowTipSummary ? (
              <View className="mt-3 flex-row items-center justify-between">
                <Text allowFontScaling={false} className="text-sm text-[#6B7280]">
                  {tipSummaryLabel}
                </Text>
                <Text allowFontScaling={false} className="text-sm font-semibold text-[#4B5563]">
                  +{formatCurrency(displayTipAmount)}
                </Text>
              </View>
            ) : null}
            {shouldShowCashToCollect && displayCashToCollect != null ? (
              <View className="mt-3 flex-row items-center justify-between">
                <Text allowFontScaling={false} className="text-sm text-[#6B7280]">
                  {t('checkout.summary.cashToCollect')}
                </Text>
                <Text allowFontScaling={false} className="text-sm font-semibold text-[#4B5563]">
                  {formatCurrency(displayCashToCollect)}
                </Text>
              </View>
            ) : null}
            <View className="mt-4 border-t border-dashed pt-4" style={{ borderColor }}>
              <View className="flex-row items-center justify-between">
                <Text
                  allowFontScaling={false}
                  className="text-lg font-bold"
                  style={{ color: sectionTitleColor }}>
                  {t('checkout.summary.total')}
                </Text>
                <Text
                  allowFontScaling={false}
                  className="text-lg font-bold"
                  style={{ color: accentColor }}>
                  {formatCurrency(displayTotal)}
                </Text>
              </View>
            </View>
          </View>
          {isViewMode && viewOrder?.status === 'IN_DELIVERY' && (
            <View className="mt-4 rounded-3xl border border-[#F0F1F3] bg-white p-5">
              <Text
                allowFontScaling={false}
                className="mb-3 text-center text-lg font-bold"
                style={{ color: sectionTitleColor }}>
                {t('checkout.deliveryCode.title')}
              </Text>

              <Text allowFontScaling={false} className="mb-5 text-center text-sm text-[#4B5563]">
                {t('checkout.deliveryCode.description')}
              </Text>

              <View className="items-center justify-center">
                <View className="rounded-full px-10 py-3" style={{ backgroundColor: accentColor }}>
                  <Text
                    allowFontScaling={false}
                    className="text-center text-2xl font-bold tracking-[2] text-white">
                    {deliveryToken}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {!isViewMode ? (
        <View className="px-4 pb-6">
          {deliveryStatusMessage ? (
            <Text
              allowFontScaling={false}
              className="mb-2 text-center text-sm"
              style={{ color: deliveryStatusColor }}>
              {deliveryStatusMessage}
            </Text>
          ) : null}
          {submissionError ? (
            <Text allowFontScaling={false} className="mb-3 text-center text-sm text-[#CA251B]">
              {submissionError}
            </Text>
          ) : null}
          <TouchableOpacity
            activeOpacity={0.9}
            className={`rounded-full px-6 py-4 ${canSubmit ? 'bg-[#CA251B]' : 'bg-[#F1F2F4]'}`}
            disabled={!canSubmit}
            onPress={handleConfirmOrder}>
            {isSubmitting ? (
              <ActivityIndicator color={canSubmit ? '#FFFFFF' : '#9CA3AF'} />
            ) : (
              <Text
                allowFontScaling={false}
                className={`text-center text-base font-semibold ${canSubmit ? 'text-white' : 'text-[#9CA3AF]'}`}>
                {t('checkout.actions.confirm')}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}

      <TipSelectionOverlay
        visible={!isViewMode && isTipModalVisible}
        onClose={() => {
          setIsTipModalVisible(false);
          setPendingCoordinates(null);
        }}
        onConfirm={handleTipOverlayConfirm}
        onSelect={handleTipSelection}
        selectedPercentage={selectedTipPercentage}
        options={TIP_OPTIONS}
        title={t('checkout.tip.overlay.title')}
        orderAmountLabel={t('checkout.tip.overlay.orderAmountLabel')}
        orderAmountValue={formatCurrency(displayTotalBeforeTip)}
        tipAmountLabel={t('checkout.tip.overlay.tipAmountLabel')}
        tipAmountValue={displayTipAmount > 0 ? formatCurrency(displayTipAmount) : null}
        description={t('checkout.tip.overlay.description')}
        percentageHelper={t('checkout.tip.overlay.percentageHelper')}
        cancelLabel={t('checkout.tip.overlay.cancel')}
        confirmLabel={t('checkout.tip.overlay.confirm')}
        cashLabel={
          selectedPaymentMethod === 'CASH' ? t('checkout.tip.overlay.cashLabel') : undefined
        }
        cashPlaceholder={t('checkout.tip.overlay.cashPlaceholder')}
        cashValue={cashToCollectInput}
        onCashChange={handleCashInputChange}
        showCashInput={selectedPaymentMethod === 'CASH'}
        errorMessage={tipOverlayError}
      />
      <PaymentModal
        visible={!isViewMode && isPaymentModalVisible}
        onClose={() => setIsPaymentModalVisible(false)}
        onSelect={handlePaymentSelection}
        selected={isViewMode ? null : selectedPaymentMethod}
        title={t('checkout.payment.modalTitle')}
        options={paymentOptions}
      />
      <AddressMismatchOverlay
        visible={!isViewMode && showAddressMismatchOverlay}
        selectedAddress={selectedAddress?.formattedAddress ?? ''}
        currentLocationAddress={currentGpsAddress ?? undefined}
        onContinueWithSelected={handleAddressMismatchContinue}
        onUpdateToCurrentLocation={handleAddressMismatchUpdateLocation}
        onCancel={handleAddressMismatchCancel}
      />
      <OngoingOrderWarningOverlay
        visible={!isViewMode && showOngoingOrderWarning}
        onViewOrder={() => {
          setShowOngoingOrderWarning(false);
          if (ongoingOrder?.orderId) {
            navigation.navigate('OrderTracking', { orderId: ongoingOrder.orderId });
          }
        }}
        onDismiss={() => setShowOngoingOrderWarning(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mapWrapper: {
    height: 170,
    width: '100%',
  },
});

export default CheckoutOrder;
