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
import useOngoingOrder from '~/hooks/useOngoingOrder';
import { createOrder } from '~/api/orders';
import type { MonetaryAmount, OrderNotificationDto } from '~/interfaces/Order';
import { convertCreateOrderResponseToTrackingOrder } from '~/utils/order';

const sectionTitleColor = '#17213A';
const accentColor = '#CA251B';
const borderColor = '#E8E9EC';

const formatCurrency = (value: number) => `${value.toFixed(3)} dt`;

const sanitizeMonetaryInput = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed.length) {
    return '';
  }

  const cleaned = trimmed.replace(/[^0-9.,-]/g, '');
  if (!cleaned.length) {
    return '';
  }

  const normalized = cleaned.replace(/,/g, '.');
  const direct = Number(normalized);
  if (Number.isFinite(direct)) {
    return normalized;
  }

  if (!normalized.includes('.')) {
    return normalized;
  }

  const segments = normalized.split('.');
  const last = segments.pop();
  if (last == null) {
    return normalized;
  }

  return `${segments.join('')}.${last}`;
};

const parseMonetaryAmount = (value: MonetaryAmount | null | undefined) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : Number.NaN;
  }

  if (typeof value === 'string') {
    const sanitized = sanitizeMonetaryInput(value);
    if (!sanitized.length) {
      return Number.NaN;
    }

    const parsed = Number(sanitized);
    return Number.isFinite(parsed) ? parsed : Number.NaN;
  }

  return Number.NaN;
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
  order?: Partial<OrderNotificationDto> | null;
};

type CheckoutRoute = RouteProp<{ CheckoutOrder: CheckoutRouteParams }, 'CheckoutOrder'>;

const CheckoutOrder: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<CheckoutRoute>();
  const { items, restaurant, subtotal, clearCart } = useCart();
  const { selectedAddress } = useSelectedAddress();
  const { user } = useAuth();
  const { updateOrder: updateOngoingOrder } = useOngoingOrder();
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
  const viewOrder = useMemo<Partial<OrderNotificationDto> | null>(() => {
    if (!isViewMode) {
      return null;
    }

    if (!rawOrderParam || typeof rawOrderParam !== 'object') {
      return null;
    }

    return rawOrderParam as Partial<OrderNotificationDto>;
  }, [isViewMode, rawOrderParam]);

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

  const viewModeItemData = useMemo(() => {
    if (!isViewMode || !viewOrder) {
      return null;
    }

    const extendedOrder = viewOrder as { itemSummaries?: unknown[] } | null;
    const rawItems = (Array.isArray(extendedOrder?.itemSummaries) && extendedOrder.itemSummaries.length
      ? extendedOrder.itemSummaries
      : Array.isArray(viewOrder.items)
      ? viewOrder.items
      : []) as unknown[];

    const normalizedItems: DisplayItem[] = [];
    let subtotalAccumulator = 0;
    let extrasAccumulator = 0;
    let totalAccumulator = 0;

    rawItems.forEach((item, index) => {
      const record = item as Record<string, unknown> | null;
      if (!record) {
        return;
      }

      const quantityCandidate = Number(record?.quantity ?? 1);
      const quantity = Number.isFinite(quantityCandidate) && quantityCandidate > 0 ? quantityCandidate : 1;

      const extrasRaw = Array.isArray(record?.extras) ? record.extras : [];
      const extrasNames = extrasRaw
        .map((extra) => {
          if (typeof extra === 'string') {
            return extra;
          }
          if (
            extra &&
            typeof extra === 'object' &&
            'name' in (extra as Record<string, unknown>) &&
            typeof (extra as { name?: unknown }).name === 'string'
          ) {
            return String((extra as { name?: string }).name);
          }
          return null;
        })
        .filter((value): value is string => Boolean(value && value.trim().length));

      const nameCandidates: (string | null | undefined)[] = [
        typeof record?.name === 'string' ? record.name : null,
        typeof (record as { menuItemName?: string }).menuItemName === 'string'
          ? (record as { menuItemName?: string }).menuItemName
          : null,
        typeof (record as { title?: string }).title === 'string'
          ? (record as { title?: string }).title
          : null,
      ];
      const name =
        nameCandidates.find((candidate) => candidate && candidate.trim().length) ?? 'Menu item';

      const parsedUnitPrice = parseMonetaryAmount(record?.unitPrice as MonetaryAmount | undefined);
      const parsedExtrasPrice = parseMonetaryAmount(record?.extrasPrice as MonetaryAmount | undefined);
      const totalCandidates: (MonetaryAmount | null | undefined)[] = [
        record?.total as MonetaryAmount | undefined,
        record?.lineTotal as MonetaryAmount | undefined,
        record?.totalPrice as MonetaryAmount | undefined,
        record?.amount as MonetaryAmount | undefined,
        record?.price as MonetaryAmount | undefined,
      ];

      let totalValue: number | null = null;
      for (const candidate of totalCandidates) {
        const parsedCandidate = parseMonetaryAmount(candidate);
        if (Number.isFinite(parsedCandidate)) {
          totalValue = parsedCandidate;
          break;
        }
      }

      const subtotalContribution =
        Number.isFinite(parsedUnitPrice) && parsedUnitPrice > 0 ? parsedUnitPrice * quantity : 0;
      const extrasContribution =
        Number.isFinite(parsedExtrasPrice) && parsedExtrasPrice > 0 ? parsedExtrasPrice : 0;
      const computedTotal =
        totalValue != null && Number.isFinite(totalValue)
          ? totalValue
          : Number.isFinite(subtotalContribution + extrasContribution) &&
            subtotalContribution + extrasContribution > 0
          ? Number((subtotalContribution + extrasContribution).toFixed(3))
          : 0;

      if (Number.isFinite(subtotalContribution) && subtotalContribution > 0) {
        subtotalAccumulator += subtotalContribution;
      }
      if (Number.isFinite(extrasContribution) && extrasContribution > 0) {
        extrasAccumulator += extrasContribution;
      }
      if (Number.isFinite(computedTotal) && computedTotal > 0) {
        totalAccumulator += computedTotal;
      }

      const menuItemIdCandidate = record?.menuItemId;

      normalizedItems.push({
        key: `order-${typeof menuItemIdCandidate === 'number' ? menuItemIdCandidate : index}-${index}`,
        name,
        quantity,
        extrasLabel: extrasNames.length ? extrasNames.join(', ') : undefined,
        total: Number.isFinite(computedTotal) ? computedTotal : 0,
      });
    });

    return {
      items: normalizedItems,
      totals: {
        subtotal: subtotalAccumulator,
        extrasTotal: extrasAccumulator,
        total: totalAccumulator,
      },
    };
  }, [isViewMode, viewOrder]);

  const displayItems = useMemo<DisplayItem[]>(() => {
    if (isViewMode && viewModeItemData) {
      return viewModeItemData.items;
    }

    return items.map((item) => ({
      key: item.id,
      name: item.name,
      quantity: item.quantity,
      extrasLabel:
        item.extras.flatMap((group) => group.extras.map((extra) => extra.name)).join(', ') || undefined,
      total: item.totalPrice,
    }));
  }, [isViewMode, items, viewModeItemData]);

  const viewModeTotals = useMemo(() => {
    if (!isViewMode || !viewOrder) {
      return null;
    }

    const record = viewOrder as Record<string, unknown>;

    const pickOptionalAmount = (paths: (string | number)[][]): number | null => {
      for (const path of paths) {
        let current: any = record;
        for (const segment of path) {
          if (!current || typeof current !== 'object') {
            current = null;
            break;
          }
          current = current[segment as keyof typeof current];
        }

        if (current == null) {
          continue;
        }

        const parsed = parseMonetaryAmount(current as MonetaryAmount | undefined);
        if (Number.isFinite(parsed)) {
          return parsed;
        }
      }

      return null;
    };

    const fallbackSubtotal = viewModeItemData?.totals.subtotal ?? 0;
    const fallbackExtras = viewModeItemData?.totals.extrasTotal ?? 0;
    const fallbackTotal =
      viewModeItemData?.totals.total ??
      Math.max((viewModeItemData?.totals.subtotal ?? 0) + (viewModeItemData?.totals.extrasTotal ?? 0), 0);

    const subtotal =
      pickOptionalAmount([
        ['payment', 'subtotal'],
        ['payment', 'subTotal'],
        ['payment', 'itemsTotal'],
        ['totals', 'subtotal'],
        ['totals', 'items'],
        ['totals', 'itemsTotal'],
        ['subtotal'],
        ['itemsTotal'],
      ]) ?? fallbackSubtotal;

    const extras =
      pickOptionalAmount([
        ['payment', 'extrasTotal'],
        ['payment', 'extras'],
        ['totals', 'extrasTotal'],
        ['totals', 'extras'],
        ['extrasTotal'],
        ['extras'],
      ]) ?? fallbackExtras;

    const totalValue =
      pickOptionalAmount([
        ['payment', 'total'],
        ['payment', 'grandTotal'],
        ['payment', 'amount'],
        ['payment', 'totalAmount'],
        ['totals', 'total'],
        ['totals', 'grandTotal'],
        ['totals', 'amount'],
        ['totals', 'totalAmount'],
        ['total'],
        ['orderTotal'],
        ['grandTotal'],
        ['paymentTotal'],
        ['amount'],
      ]) ?? fallbackTotal;

    const feeCandidates: (string | number)[][] = [
      ['payment', 'fees'],
      ['payment', 'deliveryFee'],
      ['payment', 'serviceFee'],
      ['payment', 'delivery'],
      ['payment', 'service'],
      ['totals', 'fees'],
      ['totals', 'feesTotal'],
      ['fees'],
      ['deliveryFee'],
      ['serviceFee'],
    ];

    const explicitFees = feeCandidates
      .map((path) => pickOptionalAmount([path]))
      .filter((value): value is number => value != null && Number.isFinite(value) && value > 0);

    const fees = explicitFees.length
      ? explicitFees.reduce((sum, value) => sum + value, 0)
      : Math.max(totalValue - subtotal - extras, 0);

    return {
      subtotal,
      extrasTotal: extras,
      total: totalValue,
      fees,
    };
  }, [isViewMode, viewOrder, viewModeItemData]);
  const displayItemCount = useMemo(
    () => displayItems.reduce((sum, item) => sum + item.quantity, 0),
    [displayItems],
  );
  const hasDisplayItems = displayItems.length > 0;
  const displayRestaurantName = isViewMode ? viewOrder?.restaurant?.name ?? 'Restaurant' : restaurantName;
  const displaySubtotal = isViewMode && viewModeTotals ? viewModeTotals.subtotal : baseSubtotal;
  const displayExtrasTotal = isViewMode && viewModeTotals ? viewModeTotals.extrasTotal : extrasTotal;
  const displayTotal = isViewMode && viewModeTotals ? viewModeTotals.total : total;
  const displayFees = isViewMode && viewModeTotals ? viewModeTotals.fees : deliveryFee + serviceFee;
  const viewModeSavedAddress =
    (viewOrder as { savedAddress?: { label?: string | null } } | null)?.savedAddress ??
    (viewOrder as { delivery?: { savedAddress?: { label?: string | null } | null } } | null)?.delivery?.savedAddress ??
    null;
  const viewModeDeliveryAddress =
    viewOrder?.deliveryAddress ??
    (viewOrder as { delivery?: { address?: string } } | null)?.delivery?.address ??
    '';
  const deliveryAddressValue = isViewMode
    ? viewModeDeliveryAddress
    : selectedAddress?.formattedAddress ?? '';
  const deliveryAddressTitle = isViewMode
    ? viewModeSavedAddress?.label?.trim()?.length
      ? String(viewModeSavedAddress.label)
      : 'Delivery address'
    : selectedAddress?.label?.trim()?.length
      ? selectedAddress.label
      : 'Saved address';
  const hasDeliveryAddress = isViewMode ? Boolean(deliveryAddressValue) : Boolean(selectedAddress);
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
      const paymentMethodSource =
        (viewOrder as { paymentMethod?: string | null } | null)?.paymentMethod ??
        (viewOrder as { payment?: { method?: string | null } } | null)?.payment?.method;
      return formatPaymentMethodName(paymentMethodSource);
    }

    if (!selectedPaymentMethod) {
      return 'Select payment method';
    }

    const option = PAYMENT_OPTIONS.find((candidate) => candidate.id === selectedPaymentMethod);
    return option?.label ?? 'Select payment method';
  }, [isViewMode, viewOrder, selectedPaymentMethod]);

  const SelectedPaymentIcon = useMemo(() => {
    if (isViewMode && viewOrder) {
      const paymentMethodSource =
        (viewOrder as { paymentMethod?: string | null } | null)?.paymentMethod ??
        (viewOrder as { payment?: { method?: string | null } } | null)?.payment?.method;
      return resolvePaymentIcon(paymentMethodSource);
    }

    if (!selectedPaymentMethod) {
      return CreditCard;
    }
    const option = PAYMENT_OPTIONS.find((candidate) => candidate.id === selectedPaymentMethod);
    return option?.Icon ?? CreditCard;
  }, [isViewMode, viewOrder, selectedPaymentMethod]);

  const deliveryRegion = useMemo(() => {
    if (isViewMode) {
      const locationSource =
        viewOrder?.deliveryLocation ??
        (viewOrder as { delivery?: { location?: { lat?: number; lng?: number } | null } } | null)?.delivery?.location ??
        null;

      if (locationSource) {
        const latCandidate = Number((locationSource as { lat?: number }).lat);
        const lngCandidate = Number((locationSource as { lng?: number }).lng);

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
      const formatted =
        (viewModeSavedAddress?.formattedAddress && viewModeSavedAddress.formattedAddress.trim().length
          ? viewModeSavedAddress.formattedAddress
          : null) ?? undefined;
      if (formatted && formatted.trim().length) {
        const normalizedDetail = formatted.trim();
        const normalizedValue = deliveryAddressValue.trim();
        if (!normalizedValue || normalizedValue !== normalizedDetail) {
          return formatted;
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
  }, [isViewMode, viewModeSavedAddress, selectedAddress, deliveryAddressValue]);

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
      const normalizedOrder = convertCreateOrderResponseToTrackingOrder(response);
      if (normalizedOrder) {
        updateOngoingOrder(normalizedOrder);
      }
      clearCart();
      setAppliedCoupon(null);
      setComment('');
      setAllergies('');
      navigation.navigate('OrderTracking', { order: normalizedOrder ?? null });
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
    updateOngoingOrder,
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
