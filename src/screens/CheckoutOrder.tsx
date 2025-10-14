import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Alert,
  GestureResponderEvent,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  NavigationProp,
  ParamListBase,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { ArrowLeft, ChevronDown, CreditCard, MapPin, PenSquare, TicketPercent, Wallet, X } from 'lucide-react-native';
import MapView, { Marker } from 'react-native-maps';
import { isAxiosError } from 'axios';

import { useCart } from '~/context/CartContext';
import useSelectedAddress from '~/hooks/useSelectedAddress';
import useAuth from '~/hooks/useAuth';
import { createOrder } from '~/api/orders';
import type { MonetaryAmount } from '~/interfaces/Order';
import type { OrderTrackingData } from './OrderTracking';

const sectionTitleColor = '#17213A';
const accentColor = '#CA251B';
const borderColor = '#E8E9EC';

const formatCurrency = (value: number) => `${value.toFixed(3)} dt`;

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


const formatPaymentMethodName = (method?: string | null) => {
  if (!method) {
    return 'Payment method';
  }

  const normalized = method.replace(/_/g, ' ');
  return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
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
      className="flex-row items-center justify-between px-5 py-4"
    >
      <Text allowFontScaling={false} className="text-base font-semibold" style={{ color: sectionTitleColor }}>
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

const PAYMENT_OPTIONS: PaymentOption[] = [
  { id: 'CARD', label: 'Add new Credit Card', Icon: CreditCard },
  { id: 'CASH', label: 'Pay by Cash', Icon: Wallet },
];

const PaymentModal: React.FC<{
  visible: boolean;
  onClose: () => void;
  onSelect: (method: PaymentMethod) => void;
  selected: PaymentMethod | null;
}> = ({ visible, onClose, onSelect, selected }) => (
  <Modal
    animationType="fade"
    transparent
    visible={visible}
    onRequestClose={onClose}
  >
    <View className="flex-1 justify-center bg-[#17213A]/40 px-6">
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="absolute inset-0"
      />
      <View className="rounded-3xl bg-white p-6 shadow-lg">
        <Text allowFontScaling={false} className="text-center text-lg font-semibold" style={{ color: sectionTitleColor }}>
          Payment method
        </Text>
        {PAYMENT_OPTIONS.map((option, index) => {
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
              }}
            >
              <View className="flex-row items-center">
                <option.Icon size={22} color={accentColor} />
                <Text allowFontScaling={false} className="ml-3 text-base font-semibold" style={{ color: sectionTitleColor }}>
                  {option.label}
                </Text>
              </View>
              {option.id === 'CARD' ? (
                <ChevronDown size={20} color={sectionTitleColor} style={{ transform: [{ rotate: '-90deg' }] }} />
              ) : (
                <View
                  className="h-5 w-5 items-center justify-center rounded-full border"
                  style={{ borderColor: accentColor, backgroundColor: 'white' }}
                >
                  {isSelected ? (
                    <View className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: accentColor }} />
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

type CheckoutRouteParams = {
  couponCode?: string;
  discountAmount?: number;
  couponValid?: boolean;
  viewMode?: boolean;
  order?: OrderTrackingData | null;
};

type CheckoutRoute = RouteProp<{ CheckoutOrder: CheckoutRouteParams }, 'CheckoutOrder'>;

const CheckoutOrder: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<CheckoutRoute>();
  const { items, restaurant, subtotal, clearCart } = useCart();
  const { selectedAddress } = useSelectedAddress();
  const { user } = useAuth();
  const [itemsExpanded, setItemsExpanded] = useState(true);
  const [allergiesExpanded, setAllergiesExpanded] = useState(false);
  const [commentExpanded, setCommentExpanded] = useState(false);
  const [allergies, setAllergies] = useState('');
  const [comment, setComment] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [isPaymentModalVisible, setIsPaymentModalVisible] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const rawOrderParam = route.params?.order ?? null;
  const isViewMode = Boolean(route.params?.viewMode && rawOrderParam);
  const viewOrder = isViewMode ? rawOrderParam : null;
  const viewOrderItems = useMemo<unknown[]>(
    () => (isViewMode && viewOrder && Array.isArray(viewOrder.items) ? viewOrder.items : []),
    [isViewMode, viewOrder],
  );

  useEffect(() => {
    if (isViewMode) {
      return;
    }

    const params = route.params;
    if (params?.couponValid && params.couponCode) {
      setAppliedCoupon({ code: params.couponCode, discount: params.discountAmount ?? 0 });
      navigation.setParams({ couponCode: undefined, discountAmount: undefined, couponValid: undefined });
    }
  }, [route.params, navigation, isViewMode]);

  const viewModeTotals = useMemo(() => {
    if (!isViewMode || !viewOrder) {
      return null;
    }

    return viewOrderItems.reduce(
      (acc, rawItem) => {
        const quantityValue = Number((rawItem as { quantity?: number })?.quantity);
        const quantity = Number.isFinite(quantityValue) && quantityValue > 0 ? quantityValue : 1;

        const unit = extractNumericAmount((rawItem as { unitPrice?: MonetaryAmount })?.unitPrice);
        const extrasPrice = extractNumericAmount((rawItem as { extrasPrice?: MonetaryAmount })?.extrasPrice);
        const lineTotal = extractNumericAmount((rawItem as { lineTotal?: MonetaryAmount })?.lineTotal);
        const total = extractNumericAmount((rawItem as { total?: MonetaryAmount })?.total);
        const totalPrice = extractNumericAmount((rawItem as { totalPrice?: MonetaryAmount })?.totalPrice);

        const fallbackTotal = (unit ?? 0) * quantity + (extrasPrice ?? 0);
        const resolvedTotal = lineTotal ?? total ?? totalPrice ?? fallbackTotal;
        const resolvedSubtotal =
          unit != null
            ? unit * quantity
            : Math.max(resolvedTotal - (extrasPrice ?? 0), 0);
        const resolvedExtras = extrasPrice ?? Math.max(resolvedTotal - resolvedSubtotal, 0);

        return {
          subtotal: acc.subtotal + resolvedSubtotal,
          extras: acc.extras + resolvedExtras,
          total: acc.total + resolvedTotal,
        };
      },
      { subtotal: 0, extras: 0, total: 0 },
    );
  }, [isViewMode, viewOrder, viewOrderItems]);

  const hasItems = items.length > 0;
  const restaurantName = restaurant?.name ?? 'Restaurant';

  const extrasTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.extrasTotal * item.quantity, 0),
    [items],
  );
  const baseSubtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.basePrice * item.quantity, 0),
    [items],
  );
  const deliveryFee = useMemo(() => (hasItems ? Math.max(2.5, subtotal * 0.08) : 0), [hasItems, subtotal]);
  const serviceFee = useMemo(() => (hasItems ? Math.max(1.5, subtotal * 0.05) : 0), [hasItems, subtotal]);
  const discountValue = appliedCoupon?.discount ?? 0;
  const total = useMemo(
    () => Math.max(subtotal + deliveryFee + serviceFee - discountValue, 0),
    [subtotal, deliveryFee, serviceFee, discountValue],
  );

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
        };

        const quantityValue = Number(rawItem.quantity);
        const quantity = Number.isFinite(quantityValue) && quantityValue > 0 ? quantityValue : 1;
        const name =
          (typeof rawItem.name === 'string' && rawItem.name.trim().length
            ? rawItem.name
            : null) ??
          (typeof rawItem.menuItemName === 'string' && rawItem.menuItemName.trim().length
            ? rawItem.menuItemName
            : 'Item');

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
        const resolvedTotal = lineTotal ?? total ?? totalPrice ?? (unitPrice ?? 0) * quantity + (extrasPrice ?? 0);

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
        item.extras.flatMap((group) => group.extras.map((extra) => extra.name)).join(', ') || undefined,
      total: item.totalPrice,
    }));
  }, [isViewMode, viewOrder, viewOrderItems, items]);

  const displayItemCount = useMemo(
    () => displayItems.reduce((sum, item) => sum + item.quantity, 0),
    [displayItems],
  );
  const hasDisplayItems = displayItems.length > 0;
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
      (value): value is string => typeof value === 'string' && value.trim().length > 0,
    );

    return resolved ?? 'Restaurant';
  }, [isViewMode, viewOrder, restaurantName]);

  const displaySubtotal = useMemo(() => {
    if (!isViewMode || !viewOrder) {
      return baseSubtotal;
    }

    const paymentSubtotal = extractNumericAmount(viewOrder.payment?.subtotal);
    if (paymentSubtotal != null) {
      return paymentSubtotal;
    }

    return viewModeTotals?.subtotal ?? 0;
  }, [isViewMode, viewOrder, baseSubtotal, viewModeTotals]);

  const displayExtrasTotal = useMemo(() => {
    if (!isViewMode || !viewOrder) {
      return extrasTotal;
    }

    const paymentExtras = extractNumericAmount(viewOrder.payment?.extrasTotal);
    if (paymentExtras != null) {
      return paymentExtras;
    }

    return viewModeTotals?.extras ?? 0;
  }, [isViewMode, viewOrder, extrasTotal, viewModeTotals]);

  const displayTotal = useMemo(() => {
    if (!isViewMode || !viewOrder) {
      return total;
    }

    const paymentTotal = extractNumericAmount(viewOrder.payment?.total);
    if (paymentTotal != null) {
      return paymentTotal;
    }

    const paymentGrandTotal = extractNumericAmount(
      (viewOrder.payment as { grandTotal?: MonetaryAmount } | undefined)?.grandTotal,
    );
    if (paymentGrandTotal != null) {
      return paymentGrandTotal;
    }

    const orderTotal = extractNumericAmount((viewOrder as { total?: MonetaryAmount })?.total);
    if (orderTotal != null) {
      return orderTotal;
    }

    return viewModeTotals?.total ?? 0;
  }, [isViewMode, viewOrder, total, viewModeTotals]);

  const displayFees = useMemo(
    () =>
      isViewMode
        ? Math.max(displayTotal - displaySubtotal - displayExtrasTotal, 0)
        : deliveryFee + serviceFee,
    [
      isViewMode,
      displayTotal,
      displaySubtotal,
      displayExtrasTotal,
      deliveryFee,
      serviceFee,
    ],
  );

  const deliveryAddressValue = useMemo(() => {
    if (!isViewMode || !viewOrder) {
      return selectedAddress?.formattedAddress ?? '';
    }

    const candidates = [
      viewOrder.delivery?.address,
      (viewOrder.delivery?.savedAddress as { formattedAddress?: string } | undefined)?.formattedAddress,
      (viewOrder as { deliveryAddress?: string | null })?.deliveryAddress ?? null,
      (viewOrder.savedAddress as { formattedAddress?: string } | undefined)?.formattedAddress,
    ];

    const resolved = candidates.find(
      (value): value is string => typeof value === 'string' && value.trim().length > 0,
    );

    return resolved ?? '';
  }, [isViewMode, viewOrder, selectedAddress]);

  const deliveryAddressTitle = useMemo(() => {
    if (!isViewMode || !viewOrder) {
      if (selectedAddress?.label?.trim()?.length) {
        return selectedAddress.label;
      }
      return 'Saved address';
    }

    const candidates = [
      viewOrder.delivery?.savedAddress?.label,
      (viewOrder.savedAddress as { label?: string } | undefined)?.label,
    ];

    const resolved = candidates.find(
      (value): value is string => typeof value === 'string' && value.trim().length > 0,
    );

    return resolved ?? 'Delivery address';
  }, [isViewMode, viewOrder, selectedAddress]);

  const hasDeliveryAddress = isViewMode
    ? Boolean(deliveryAddressValue && deliveryAddressValue.trim().length)
    : Boolean(selectedAddress);
  const emptyAddressMessage = isViewMode
    ? 'Delivery details unavailable for this order.'
    : 'Add a delivery address to preview it here.';

  const combinedInstructions = useMemo(() => {
    const trimmedComment = comment.trim();
    const trimmedAllergies = allergies.trim();
    const parts: string[] = [];

    if (trimmedComment.length) {
      parts.push(trimmedComment);
    }

    if (trimmedAllergies.length) {
      parts.push(`Allergies: ${trimmedAllergies}`);
    }

    if (!parts.length) {
      return undefined;
    }

    return parts.join(' | ');
  }, [allergies, comment]);

  const paymentMethodLabel = useMemo(() => {
    if (isViewMode && viewOrder) {
      const method = viewOrder.payment?.method ?? viewOrder.paymentMethod;
      return formatPaymentMethodName(method);
    }

    if (!selectedPaymentMethod) {
      return 'Select payment method';
    }

    const option = PAYMENT_OPTIONS.find((candidate) => candidate.id === selectedPaymentMethod);
    return option?.label ?? 'Select payment method';
  }, [isViewMode, viewOrder, selectedPaymentMethod]);

  const SelectedPaymentIcon = useMemo(() => {
    if (isViewMode && viewOrder) {
      const method = viewOrder.payment?.method ?? viewOrder.paymentMethod;
      return resolvePaymentIcon(method);
    }

    if (!selectedPaymentMethod) {
      return CreditCard;
    }
    const option = PAYMENT_OPTIONS.find((candidate) => candidate.id === selectedPaymentMethod);
    return option?.Icon ?? CreditCard;
  }, [isViewMode, viewOrder, selectedPaymentMethod]);

  const deliveryRegion = useMemo(() => {
    if (isViewMode && viewOrder) {
      const candidateLocations = [
        viewOrder.delivery?.location,
        (viewOrder as { deliveryLocation?: { lat?: number | string; lng?: number | string } } | null)
          ?.deliveryLocation,
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

    const candidates = [selectedAddress.directions, selectedAddress.notes, selectedAddress.entranceNotes];
    const detail = candidates.find(
      (value): value is string => typeof value === 'string' && value.trim().length > 0,
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

  const handleConfirmOrder = useCallback(async () => {
    if (isViewMode) {
      return;
    }

    if (!hasItems) {
      setSubmissionError('Your cart is empty.');
      return;
    }

    if (!restaurant?.id) {
      setSubmissionError('Missing restaurant information.');
      return;
    }

    if (!selectedAddress) {
      setSubmissionError('Please choose a delivery address.');
      return;
    }

    const latCandidate = Number(selectedAddress.coordinates?.latitude);
    const lngCandidate = Number(selectedAddress.coordinates?.longitude);

    if (!Number.isFinite(latCandidate) || !Number.isFinite(lngCandidate)) {
      setSubmissionError('The selected address is missing coordinates. Please update it and try again.');
      return;
    }

    if (!selectedPaymentMethod) {
      setSubmissionError('Select a payment method to continue.');
      return;
    }

    setSubmissionError(null);
    setIsSubmitting(true);

    try {
      const numericUserId =
        typeof user?.id === 'number' ? user.id : Number(user?.id);

      const payload = {
        deliveryAddress: selectedAddress.formattedAddress,
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
          lat: latCandidate,
          lng: lngCandidate,
        },
        paymentMethod: selectedPaymentMethod,
        restaurantId: restaurant.id,
        userId: Number.isFinite(numericUserId) ? Number(numericUserId) : undefined,
        savedAddressId: selectedAddress.id,
      };

      const response = await createOrder(payload);
      clearCart();
      setAppliedCoupon(null);
      setComment('');
      setAllergies('');
      navigation.navigate('OrderTracking', { order: response });
    } catch (error) {
      console.error('Failed to create order:', error);
      const message = (() => {
        if (isAxiosError(error)) {
          const responseMessage =
            (typeof error.response?.data === 'object' && error.response?.data && 'message' in error.response.data
              ? String((error.response?.data as { message?: unknown }).message)
              : null) ?? error.message;
          return responseMessage || 'We could not place your order. Please try again.';
        }

        if (error instanceof Error) {
          return error.message;
        }

        return 'We could not place your order. Please try again.';
      })();

      setSubmissionError(message);
      Alert.alert('Order failed', message);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isViewMode,
    hasItems,
    restaurant?.id,
    selectedAddress,
    selectedPaymentMethod,
    user?.id,
    items,
    combinedInstructions,
    clearCart,
    navigation,
  ]);

  const canSubmit =
    !isViewMode && hasItems && Boolean(selectedAddress) && Boolean(selectedPaymentMethod) && !isSubmitting;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row items-center px-4 pb-4 pt-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4 rounded-full border border-[#E4E6EB] p-2">
          <ArrowLeft size={20} color={sectionTitleColor} />
        </TouchableOpacity>
        <Text allowFontScaling={false} className="flex-1 text-center text-xl font-bold" style={{ color: sectionTitleColor }}>
          My Order
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} className="flex-1">
        <View className="px-4">
          <View className="rounded-3xl bg-white">
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setItemsExpanded((prev) => !prev)}
              className="flex-row items-center justify-between rounded-3xl border border-[#F0F1F3] px-5 py-4"
            >
              <View>
                <Text allowFontScaling={false} className="text-sm font-semibold" style={{ color: accentColor }}>
                  {displayItemCount} {displayItemCount === 1 ? 'Product' : 'Products'} from
                </Text>
                <Text allowFontScaling={false} className="text-lg font-bold" style={{ color: accentColor }}>
                  {displayRestaurantName}
                </Text>
                <Text allowFontScaling={false} className="mt-1 text-sm font-semibold text-[#17213A]">
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
                        <Text allowFontScaling={false} className="text-sm font-semibold text-[#17213A]">
                          {item.quantity} × {item.name}
                        </Text>
                        {item.extrasLabel ? (
                          <Text allowFontScaling={false} className="mt-1 text-xs text-[#6B7280]">
                            Extras {item.extrasLabel}
                          </Text>
                        ) : null}
                      </View>
                      <Text allowFontScaling={false} className="text-sm font-semibold text-[#17213A]">
                        {formatCurrency(item.total)}
                      </Text>
                    </View>
                  ))
                ) : (
                  <View className="px-5 py-4">
                    <Text allowFontScaling={false} className="text-sm text-[#6B7280]">
                      {isViewMode ? 'No items to display.' : 'Your cart is empty.'}
                    </Text>
                  </View>
                )}
              </View>
            ) : null}
          </View>

          {!isViewMode ? (
            <>
              <Accordion
                title="I have Allergies"
                expanded={allergiesExpanded}
                onToggle={() => setAllergiesExpanded((prev) => !prev)}
              >
                <TextInput
                  allowFontScaling={false}
                  multiline
                  placeholder="Add your allergies"
                  placeholderTextColor="#9CA3AF"
                  value={allergies}
                  onChangeText={setAllergies}
                  className="min-h-[80px] rounded-2xl border border-[#F1F2F4] bg-[#F9FAFB] px-4 py-3 text-sm text-[#17213A]"
                  textAlignVertical="top"
                />
              </Accordion>

              <Accordion
                title="Add a comment"
                expanded={commentExpanded}
                onToggle={() => setCommentExpanded((prev) => !prev)}
              >
                <TextInput
                  allowFontScaling={false}
                  multiline
                  placeholder="Leave a note for the restaurant"
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
              <Text allowFontScaling={false} className="text-base font-bold" style={{ color: sectionTitleColor }}>
                Delivery Address
              </Text>
              {!isViewMode ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={handleOpenLocationSelection}
                  className="rounded-full bg-[#FDE7E5] px-3 py-1"
                >
                  <Text allowFontScaling={false} className="text-xs font-semibold text-[#CA251B]">
                    Change
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
            {hasDeliveryAddress ? (
              <View className="mt-3 overflow-hidden rounded-3xl border" style={{ borderColor }}>
                <View style={styles.mapWrapper}>
                  {deliveryRegion ? (
                    <MapView
                      key={isViewMode ? `order-${viewOrder?.orderId ?? 'map'}` : selectedAddress?.id}
                      style={StyleSheet.absoluteFill}
                      initialRegion={deliveryRegion}
                      scrollEnabled={false}
                      zoomEnabled={false}
                      pitchEnabled={false}
                      rotateEnabled={false}
                    >
                      <Marker
                        coordinate={deliveryRegion}
                        title="Delivery Address"
                        description={deliveryAddressValue || undefined}
                      />
                    </MapView>
                  ) : (
                    <View className="flex-1 items-center justify-center bg-[#FDE7E5]">
                      <MapPin size={24} color={accentColor} />
                      <Text allowFontScaling={false} className="mt-2 text-xs font-semibold text-[#CA251B]">
                        {isViewMode ? 'Map preview unavailable for this address' : 'Set a precise location to preview it here'}
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
                className="mt-3 flex-row items-center justify-between rounded-3xl border border-dashed border-[#F0F1F3] bg-white px-5 py-4"
              >
                <View className="flex-1 flex-row items-center">
                  <MapPin size={22} color={accentColor} />
                  <Text allowFontScaling={false} className="ml-3 flex-1 text-base font-semibold" style={{ color: sectionTitleColor }}>
                    Choose where to deliver your order
                  </Text>
                </View>
                <ChevronDown size={20} color={sectionTitleColor} style={{ transform: [{ rotate: '-90deg' }] }} />
              </TouchableOpacity>
            ) : (
              <View className="mt-3 rounded-3xl border border-dashed border-[#F0F1F3] bg-white px-5 py-4">
                <View className="flex-row items-center">
                  <MapPin size={22} color={accentColor} />
                  <Text allowFontScaling={false} className="ml-3 flex-1 text-base font-semibold" style={{ color: sectionTitleColor }}>
                    {emptyAddressMessage}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View className="mt-6">
            <Text allowFontScaling={false} className="text-base font-bold" style={{ color: sectionTitleColor }}>
              Payment method
            </Text>
            {isViewMode ? (
              <View className="mt-3 flex-row items-center justify-between rounded-3xl border border-[#F0F1F3] bg-white px-5 py-4">
                <View className="flex-row items-center">
                  <SelectedPaymentIcon size={22} color={accentColor} />
                  <Text allowFontScaling={false} className="ml-3 text-base font-semibold" style={{ color: sectionTitleColor }}>
                    {paymentMethodLabel}
                  </Text>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsPaymentModalVisible(true)}
                className="mt-3 flex-row items-center justify-between rounded-3xl border border-[#F0F1F3] bg-white px-5 py-4"
              >
                <View className="flex-row items-center">
                  <SelectedPaymentIcon size={22} color={accentColor} />
                  <Text allowFontScaling={false} className="ml-3 text-base font-semibold" style={{ color: sectionTitleColor }}>
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
              className="mt-4 flex-row items-center justify-between rounded-3xl border border-dashed border-[#F0F1F3] bg-white px-5 py-4"
            >
              <View className="flex-1 flex-row items-center">
                <TicketPercent size={22} color={accentColor} />
                <View className="ml-3 flex-1">
                  <Text allowFontScaling={false} className="text-base font-semibold" style={{ color: sectionTitleColor }}>
                    {appliedCoupon ? 'Coupon applied' : 'Add Coupon code'}
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
                  }}
                >
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
                Items
              </Text>
              <Text allowFontScaling={false} className="text-sm font-semibold text-[#4B5563]">
                {formatCurrency(displaySubtotal)}
              </Text>
            </View>
            <View className="mt-3 flex-row items-center justify-between">
              <Text allowFontScaling={false} className="text-sm text-[#6B7280]">
                Extras
              </Text>
              <Text allowFontScaling={false} className="text-sm font-semibold text-[#4B5563]">
                {formatCurrency(displayExtrasTotal)}
              </Text>
            </View>
            {!isViewMode ? (
              <>
                <View className="mt-3 flex-row items-center justify-between">
                  <Text allowFontScaling={false} className="text-sm text-[#6B7280]">
                    Delivery
                  </Text>
                  <Text allowFontScaling={false} className="text-sm font-semibold text-[#4B5563]">
                    {formatCurrency(deliveryFee)}
                  </Text>
                </View>
                <View className="mt-3 flex-row items-center justify-between">
                  <Text allowFontScaling={false} className="text-sm text-[#6B7280]">
                    Service
                  </Text>
                  <Text allowFontScaling={false} className="text-sm font-semibold text-[#4B5563]">
                    {formatCurrency(serviceFee)}
                  </Text>
                </View>
              </>
            ) : (
              <View className="mt-3 flex-row items-center justify-between">
                <Text allowFontScaling={false} className="text-sm text-[#6B7280]">
                  Fees & delivery
                </Text>
                <Text allowFontScaling={false} className="text-sm font-semibold text-[#4B5563]">
                  {formatCurrency(displayFees)}
                </Text>
              </View>
            )}
            {!isViewMode && appliedCoupon ? (
              <View className="mt-3 flex-row items-center justify-between">
                <Text allowFontScaling={false} className="text-sm text-[#6B7280]">
                  Coupon ({appliedCoupon.code})
                </Text>
                <Text allowFontScaling={false} className="text-sm font-semibold text-[#CA251B]">
                  −{formatCurrency(discountValue)}
                </Text>
              </View>
            ) : null}
            <View className="mt-4 border-t border-dashed pt-4" style={{ borderColor }}>
              <View className="flex-row items-center justify-between">
                <Text allowFontScaling={false} className="text-lg font-bold" style={{ color: sectionTitleColor }}>
                  Total
                </Text>
                <Text allowFontScaling={false} className="text-lg font-bold" style={{ color: accentColor }}>
                  {formatCurrency(displayTotal)}
                </Text>
              </View>
            </View>
          </View>
          {isViewMode && viewOrder?.status === 'IN_DELIVERY' && (
            <View className="mt-4 rounded-3xl border border-[#F0F1F3] bg-white p-5">
              <Text
                allowFontScaling={false}
                className="text-center text-lg font-bold mb-3"
                style={{ color: sectionTitleColor }}
              >
                YOUR DELIVERY CODE
              </Text>

              <Text
                allowFontScaling={false}
                className="text-center text-sm text-[#4B5563] mb-5"
              >
                Give this code to the deliverer when you pick up your order to confirm that you’ve received your meal
              </Text>

              <View className="items-center justify-center">
                <View
                  className="rounded-full px-10 py-3"
                  style={{ backgroundColor: accentColor }}
                >
                  <Text
                    allowFontScaling={false}
                    className="text-white text-2xl font-bold text-center tracking-[2]"
                  >
                    483254
                  </Text>
                </View>
              </View>
            </View>
          )}


        </View>
      </ScrollView>

      {!isViewMode ? (
        <View className="px-4 pb-6">
          {submissionError ? (
            <Text allowFontScaling={false} className="mb-3 text-center text-sm text-[#CA251B]">
              {submissionError}
            </Text>
          ) : null}
          <TouchableOpacity
            activeOpacity={0.9}
            className={`rounded-full px-6 py-4 ${canSubmit ? 'bg-[#CA251B]' : 'bg-[#F1F2F4]'}`}
            disabled={!canSubmit}
            onPress={handleConfirmOrder}
          >
            {isSubmitting ? (
              <ActivityIndicator color={canSubmit ? '#FFFFFF' : '#9CA3AF'} />
            ) : (
              <Text
                allowFontScaling={false}
                className={`text-center text-base font-semibold ${canSubmit ? 'text-white' : 'text-[#9CA3AF]'}`}
              >
                Confirm and pay to order
              </Text>
            )}
          </TouchableOpacity>
        </View>
      ) : null}

      <PaymentModal
        visible={!isViewMode && isPaymentModalVisible}
        onClose={() => setIsPaymentModalVisible(false)}
        onSelect={handlePaymentSelection}
        selected={isViewMode ? null : selectedPaymentMethod}
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
