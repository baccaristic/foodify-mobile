import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
  Easing,
  Vibration,
  Pressable,
  Modal,
  Alert,
  Linking,
  LayoutChangeEvent,
  useWindowDimensions,
} from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Bike,
  Check,
  ChevronDown,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  Star,
} from 'lucide-react-native';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';

import type {
  CreateOrderResponse,
  MonetaryAmount,
  OrderStatusHistoryDto,
  PaymentSummaryResponse,
} from '~/interfaces/Order';
import { ms, vs } from 'react-native-size-matters';
import useOngoingOrder from '~/hooks/useOngoingOrder';
import type { OngoingOrderData } from '~/context/OngoingOrderContext';
import { formatOrderStatusLabel } from '~/utils/order';
import { BASE_API_URL } from '@env';
import { useTranslation } from '~/localization';
import { useCurrencyFormatter } from '~/localization/hooks';
const HEADER_MAX_HEIGHT = 320;
const HEADER_MIN_HEIGHT = 72;
const COLLAPSE_THRESHOLD = 80;

const accentColor = '#D83A2E';
const softBackground = '#F5F6FA';
const softSurface = '#FFFFFF';
const textPrimary = '#0F172A';
const textSecondary = '#6B7280';
const borderColor = '#F0F1F5';

type LatLng = { latitude: number; longitude: number };

const STATUS_LABEL_KEYS: Record<string, string> = {
  PENDING: 'orderTracking.status.pending',
  ACCEPTED: 'orderTracking.status.accepted',
  PREPARING: 'orderTracking.status.preparing',
  READY_FOR_PICK_UP: 'orderTracking.status.readyForPickup',
  IN_DELIVERY: 'orderTracking.status.inDelivery',
  DELIVERED: 'orderTracking.status.delivered',
  CANCELLED: 'orderTracking.status.cancelled',
};

const PAYMENT_STATUS_LABEL_KEYS: Record<string, string> = {
  PENDING: 'orderTracking.payment.statusNames.pending',
  PAID: 'orderTracking.payment.statusNames.paid',
  FAILED: 'orderTracking.payment.statusNames.failed',
  EXPIRED: 'orderTracking.payment.statusNames.expired',
};

export type OrderTrackingData = (OngoingOrderData & Partial<CreateOrderResponse>) & {
  statusHistory?: OrderStatusHistoryDto[] | null;
};

type StatusChangeInfo = {
  title: string;
  description?: string | null;
};

type OnlinePaymentDetails = {
  paymentUrl: string | null;
  paymentReference: string | null;
  environment: string | null;
  status: string | null;
  method: string | null;
};

const extractNumericAmount = (
  value: MonetaryAmount | null | undefined,
): number | null => {
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

const OrderTrackingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const statusPulse = useRef(new Animated.Value(0)).current;
  const statusAnnouncementOpacity = useRef(new Animated.Value(0)).current;
  const highlightPulse = useRef(new Animated.Value(0)).current;
  const previousStatusRef = useRef<string | null>(null);
  const helpSheetAnimation = useRef(new Animated.Value(0)).current;
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [statusChangeInfo, setStatusChangeInfo] = useState<StatusChangeInfo | null>(null);
  const [highlightedStepKey, setHighlightedStepKey] = useState<string | null>(null);
  const [isHelpModalVisible, setIsHelpModalVisible] = useState(false);
  const [isPaymentDetailsExpanded, setIsPaymentDetailsExpanded] = useState(false);
  const { order: ongoingOrder } = useOngoingOrder();
  const { t } = useTranslation();
  const formatCurrency = useCurrencyFormatter();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isCompactWidth = width < 360;
  const isTablet = width >= 768;
  const horizontalPadding = isTablet ? 32 : isCompactWidth ? 16 : 20;
  const cardHorizontalPadding = isTablet ? 32 : isCompactWidth ? 18 : 24;
  const cardVerticalPadding = isTablet ? 36 : isCompactWidth ? 26 : 32;
  const contentMaxWidth = isTablet ? Math.min(width * 0.75, 720) : undefined;
  const heroAnimationSize = Math.min(
    Math.max(width * (isTablet ? 0.3 : 0.65), 200),
    isTablet ? 320 : 260,
  );
  const heroPulseSize = heroAnimationSize + (isTablet ? 96 : isCompactWidth ? 36 : 56);
  const statusMessageFontSize = Math.max(12, Math.min(isTablet ? 16 : 14, width * 0.04));
  const statusMessageLineHeight = Math.round(statusMessageFontSize * 1.3);
  const [bottomSheetHeight, setBottomSheetHeight] = useState(0);
  const scrollPaddingBottom = useMemo(
    () => bottomSheetHeight + vs(isLandscape ? 140 : 180),
    [bottomSheetHeight, isLandscape],
  );
  const bottomSheetExtraPadding = isCompactWidth || isLandscape ? 16 : 20;
  const helpSheetHiddenOffset = useMemo(
    () => Math.min(Math.max(height * 0.45, 320), Math.max(height - insets.bottom - 80, 360)),
    [height, insets.bottom],
  );
  const responsiveStyles = useMemo(
    () => {
      const cardOuterWidthStyles = contentMaxWidth
        ? { width: '100%' as const, maxWidth: contentMaxWidth, alignSelf: 'center' as const }
        : { width: '100%' as const, alignSelf: 'center' as const };

      return {
        scrollContent: {
          paddingHorizontal: horizontalPadding,
          paddingBottom: scrollPaddingBottom,
          alignItems: 'stretch' as const,
        },
        mapTopBar: {
          paddingHorizontal: horizontalPadding,
          paddingTop: Math.max(insets.top + (isCompactWidth ? 6 : 12), insets.top + 6),
        },
        statusPlaceholder: {
          paddingHorizontal: Math.max(horizontalPadding, isCompactWidth ? 16 : 24),
          paddingVertical: isLandscape ? 24 : 32,
        },
        statusAnimation: {
          width: heroAnimationSize,
          height: heroAnimationSize,
        },
        statusPulse: {
          width: heroPulseSize,
          height: heroPulseSize,
          borderRadius: heroPulseSize / 2,
        },
        statusMessage: {
          fontSize: statusMessageFontSize,
          lineHeight: statusMessageLineHeight,
        },
        statusHeading: {
          fontSize: isTablet ? 22 : isCompactWidth ? 16 : 18,
          marginBottom: isTablet ? 16 : 12,
        },
        statusSubheading: {
          fontSize: isTablet ? 15 : isCompactWidth ? 12 : 13,
          lineHeight: isTablet ? 22 : 20,
          paddingHorizontal: isTablet ? 24 : 0,
        },
        stepsCard: {
          ...cardOuterWidthStyles,
          paddingHorizontal: cardHorizontalPadding,
          paddingVertical: cardVerticalPadding,
          marginBottom: isLandscape ? 28 : 40,
        },
        stepsHeader: {
          flexWrap: 'wrap' as const,
        },
        stepsStatusBadge: {
          marginTop: isCompactWidth ? 12 : 0,
        },
        stepRow: {
          flexWrap: 'wrap' as const,
        },
        stepMeta: {
          marginTop: isCompactWidth ? 12 : 0,
        },
        paymentCard: {
          ...cardOuterWidthStyles,
          marginBottom: isCompactWidth ? 12 : 16,
        },
        paymentAccordionHeader: {
          paddingHorizontal: cardHorizontalPadding - 2,
          paddingVertical: isCompactWidth ? 16 : 18,
        },
        paymentAccordionContent: {
          paddingHorizontal: cardHorizontalPadding - 2,
          paddingBottom: isCompactWidth ? 16 : 20,
        },
        paymentDescription: {
          fontSize: isCompactWidth ? 12 : 13,
          lineHeight: isCompactWidth ? 18 : 20,
        },
        summaryCard: {
          ...cardOuterWidthStyles,
          paddingHorizontal: cardHorizontalPadding - 6,
          paddingVertical: isCompactWidth ? 12 : 16,
        },
        summaryHeader: {
          flexWrap: 'wrap' as const,
        },
        summaryBadge: {
          marginTop: isCompactWidth ? 8 : 0,
        },
        summaryItemRow: {
          flexWrap: 'wrap' as const,
        },
        summaryItemPrice: {
          marginTop: isCompactWidth ? 6 : 0,
          textAlign: isCompactWidth ? 'left' : 'right',
          width: isCompactWidth ? '100%' : undefined,
        },
        summaryFooter: {
          flexWrap: 'wrap' as const,
        },
        bottomSheet: {
          paddingHorizontal: horizontalPadding,
          paddingTop: isCompactWidth || isLandscape ? 6 : 10,
        },
        bottomSheetInner: {
          width: '100%' as const,
          alignSelf: 'center' as const,
          ...(contentMaxWidth ? { maxWidth: contentMaxWidth } : {}),
        },
        courierStickyCard: {
          ...cardOuterWidthStyles,
          flexDirection: isCompactWidth ? 'column' : 'row',
          alignItems: isCompactWidth ? 'flex-start' : 'center',
          paddingHorizontal: cardHorizontalPadding - 6,
          paddingVertical: isCompactWidth ? 14 : 12,
        },
        courierStickyActions: {
          marginTop: isCompactWidth ? 12 : 0,
          alignSelf: isCompactWidth ? 'stretch' : 'auto',
          justifyContent: isCompactWidth ? 'space-between' : 'center',
        },
        courierActionButtonSpacing: {
          marginLeft: isCompactWidth ? 0 : 8,
          marginTop: isCompactWidth ? 8 : 0,
        },
        helpSheet: {
          paddingHorizontal: horizontalPadding,
          paddingTop: isCompactWidth ? 18 : 24,
        },
        helpOption: {
          flexDirection: isCompactWidth ? 'column' : 'row',
          alignItems: isCompactWidth ? 'flex-start' : 'center',
          paddingHorizontal: cardHorizontalPadding - 6,
          paddingVertical: isCompactWidth ? 14 : 16,
        },
        helpOptionIcon: {
          marginRight: isCompactWidth ? 0 : 16,
          marginBottom: isCompactWidth ? 12 : 0,
        },
        helpOptionContent: {
          width: '100%' as const,
        },
        helpChatButton: {
          flexDirection: isCompactWidth ? 'column' : 'row',
          paddingVertical: isCompactWidth ? 14 : 16,
        },
        helpChatButtonText: {
          marginLeft: isCompactWidth ? 0 : 10,
          marginTop: isCompactWidth ? 8 : 0,
        },
      } as const;
    },
    [
      cardHorizontalPadding,
      cardVerticalPadding,
      contentMaxWidth,
      heroAnimationSize,
      heroPulseSize,
      horizontalPadding,
      insets.top,
      isCompactWidth,
      isLandscape,
      isTablet,
      scrollPaddingBottom,
      statusMessageFontSize,
      statusMessageLineHeight,
    ],
  );
  const formatMonetaryAmount = useCallback(
    (value: MonetaryAmount | null | undefined) => {
      const amount = extractNumericAmount(value);
      return amount != null ? formatCurrency(amount) : undefined;
    },
    [formatCurrency],
  );
  const getStatusLabel = useCallback(
    (status: string | null | undefined) => {
      if (!status) {
        return null;
      }

      const normalized = status.toString().toUpperCase();
      const key = STATUS_LABEL_KEYS[normalized];
      if (key) {
        return t(key, {
          defaultValue: formatOrderStatusLabel(status) ?? normalized.replace(/_/g, ' '),
        });
      }

      return formatOrderStatusLabel(status) ?? normalized.replace(/_/g, ' ');
    },
    [t],
  );

  const order = useMemo<OrderTrackingData | null>(
    () => (ongoingOrder ? (ongoingOrder as OrderTrackingData) : null),
    [ongoingOrder],
  );

  const paymentDetails = useMemo<OnlinePaymentDetails | null>(() => {
    const paymentRecord = (order?.payment ?? null) as PaymentSummaryResponse | null;
    const methodCandidate = paymentRecord?.method ?? order?.paymentMethod ?? null;
    const normalizedMethod = methodCandidate ? String(methodCandidate).toUpperCase() : null;

    const paymentUrl =
      typeof paymentRecord?.paymentUrl === 'string' && paymentRecord.paymentUrl.trim().length
        ? paymentRecord.paymentUrl.trim()
        : null;

    const paymentReference =
      typeof paymentRecord?.paymentReference === 'string' &&
      paymentRecord.paymentReference.trim().length
        ? paymentRecord.paymentReference.trim()
        : null;

    const environment =
      typeof paymentRecord?.environment === 'string' && paymentRecord.environment.trim().length
        ? paymentRecord.environment.trim()
        : null;

    const status = paymentRecord?.status != null ? String(paymentRecord.status) : null;

    const isOnlineMethod =
      Boolean(paymentUrl) ||
      (normalizedMethod != null &&
        (normalizedMethod.includes('CARD') ||
          normalizedMethod.includes('ONLINE') ||
          normalizedMethod.includes('WEB') ||
          normalizedMethod.includes('PAY')));

    if (!isOnlineMethod && !paymentReference && !environment && !status) {
      return null;
    }

    return {
      paymentUrl,
      paymentReference,
      environment,
      status,
      method: normalizedMethod,
    } satisfies OnlinePaymentDetails;
  }, [order]);

  const paymentStatusNormalized = useMemo(
    () => (paymentDetails?.status ? paymentDetails.status.toString().toUpperCase() : null),
    [paymentDetails?.status],
  );

  const paymentStatusLabel = useMemo(() => {
    if (!paymentStatusNormalized) {
      return null;
    }

    const key = PAYMENT_STATUS_LABEL_KEYS[paymentStatusNormalized];
    if (key) {
      return t(key);
    }

    return (
      formatOrderStatusLabel(paymentDetails?.status) ??
      paymentStatusNormalized.replace(/_/g, ' ')
    );
  }, [paymentDetails?.status, paymentStatusNormalized, t]);

  const isPaymentPending = !paymentStatusNormalized || paymentStatusNormalized === 'PENDING';

  const paymentEnvironmentLabel = useMemo(() => {
    if (!paymentDetails?.environment) {
      return null;
    }

    return formatOrderStatusLabel(paymentDetails.environment) ?? paymentDetails.environment;
  }, [paymentDetails?.environment]);

  const shouldShowPaymentCard = Boolean(paymentDetails);
  const shouldShowResumePayment = Boolean(paymentDetails?.paymentUrl) && isPaymentPending;

  useEffect(() => {
    if (!shouldShowPaymentCard) {
      setIsPaymentDetailsExpanded(false);
    }
  }, [shouldShowPaymentCard]);

  const supportPhoneNumber = '+1 (800) 555-0199';
  const helpSheetTranslateY = useMemo(
    () =>
      helpSheetAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [helpSheetHiddenOffset, 0],
      }),
    [helpSheetAnimation, helpSheetHiddenOffset],
  );
  const helpBackdropOpacity = useMemo(
    () =>
      helpSheetAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.45],
      }),
    [helpSheetAnimation],
  );
  const helpSheetPadding = useMemo(
    () => ({ paddingBottom: insets.bottom + 24 }),
    [insets.bottom],
  );
  const statusHistory = useMemo<OrderStatusHistoryDto[]>(
    () => (Array.isArray(order?.statusHistory) ? order?.statusHistory ?? [] : []),
    [order?.statusHistory],
  );
  const normalizedStatus = useMemo(() => {
    const historyStatus = statusHistory.length
      ? statusHistory[statusHistory.length - 1]?.newStatus
      : null;
    const baseStatus = historyStatus ?? order?.status ?? null;

    return baseStatus ? String(baseStatus).toUpperCase() : null;
  }, [order?.status, statusHistory]);
  const formattedStatus = getStatusLabel(normalizedStatus);
  const isPendingStatus = normalizedStatus === 'PENDING';
  const isAcceptedStatus = normalizedStatus === 'ACCEPTED';
  const isPreparingStatus = normalizedStatus === 'PREPARING';
  const isReadyForPickupStatus = normalizedStatus === 'READY_FOR_PICK_UP';
  const isInDeliveryStatus = normalizedStatus === 'IN_DELIVERY';

  const getHistoryEntryKey = useCallback(
    (entry: OrderStatusHistoryDto | null | undefined, index: number) => {
      if (!entry) {
        return normalizedStatus ?? `history-${index}`;
      }

      return `${entry.changedAt ?? entry.newStatus ?? `history-${index}`}`;
    },
    [normalizedStatus],
  );

  const handleResumePayment = useCallback(async () => {
    if (!paymentDetails?.paymentUrl) {
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(paymentDetails.paymentUrl);
      if (!canOpen) {
        throw new Error('UNSUPPORTED_URL');
      }

      await Linking.openURL(paymentDetails.paymentUrl);
    } catch (error) {
      console.warn('Failed to open Konnect payment URL', error);
      Alert.alert(
        t('orderTracking.payment.openErrorTitle'),
        t('orderTracking.payment.openErrorMessage'),
      );
    }
  }, [paymentDetails?.paymentUrl, t]);

  const heroAnimationConfig = useMemo(() => {
    if (isPendingStatus) {
      return {
        source: require('../../assets/animations/order_placed.json'),
        message: t('orderTracking.hero.pending'),
      } as const;
    }

    if (isAcceptedStatus) {
      return {
        source: require('../../assets/animations/order_placed.json'),
        message: t('orderTracking.hero.accepted'),
      } as const;
    }

    if (isPreparingStatus) {
      return {
        source: require('../../assets/animations/prepare_food.json'),
        message: t('orderTracking.hero.preparing'),
      } as const;
    }

    if (isReadyForPickupStatus) {
      return {
        source: require('../../assets/animations/order_ready.json'),
        message: t('orderTracking.hero.readyForPickup'),
      } as const;
    }

    return null;
  }, [
    isAcceptedStatus,
    isPendingStatus,
    isPreparingStatus,
    isReadyForPickupStatus,
    t,
  ]);

  const handleCloseSupport = useCallback(() => {
    Animated.timing(helpSheetAnimation, {
      toValue: 0,
      duration: 220,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setIsHelpModalVisible(false);
      }
    });
  }, [helpSheetAnimation]);

  const handleOpenSupport = useCallback(() => {
    setIsHelpModalVisible(true);
    setTimeout(() => {
      helpSheetAnimation.stopAnimation();
      helpSheetAnimation.setValue(0);
      Animated.timing(helpSheetAnimation, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }, 0);
  }, [helpSheetAnimation]);

  const handleCallSupport = useCallback(() => {
    const sanitizedNumber = supportPhoneNumber.replace(/[^0-9+]/g, '');
    const telUrl = `tel:${sanitizedNumber}`;

    Linking.openURL(telUrl).catch(() => {
      Alert.alert(
        t('orderTracking.help.callErrorTitle'),
        t('orderTracking.help.callErrorMessage', { values: { phone: supportPhoneNumber } }),
      );
    });
    handleCloseSupport();
  }, [handleCloseSupport, supportPhoneNumber, t]);

  const handleRequestLiveChat = useCallback(() => {
    handleCloseSupport();
    setTimeout(() => {
      navigation.navigate(
        'LiveChat' as never,
        {
          orderId: order?.orderId ?? null,
          topic: t('orderTracking.help.liveChatTopic'),
          from: 'OrderTracking',
        } as never,
      );
    }, 260);
  }, [handleCloseSupport, navigation, order?.orderId, t]);

  useEffect(() => {
    previousStatusRef.current = null;
    setStatusChangeInfo(null);
    setHighlightedStepKey(null);
  }, [
    order?.orderId,
  ]);

  useEffect(() => {
    if (!statusChangeInfo) {
      return;
    }

    statusAnnouncementOpacity.setValue(0);
    let isActive = true;

    const animation = Animated.sequence([
      Animated.timing(statusAnnouncementOpacity, {
        toValue: 1,
        duration: 250,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.delay(2400),
      Animated.timing(statusAnnouncementOpacity, {
        toValue: 0,
        duration: 260,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished && isActive) {
        setStatusChangeInfo(null);
      }
    });

    return () => {
      isActive = false;
      animation.stop();
    };
  }, [statusAnnouncementOpacity, statusChangeInfo]);

  useEffect(() => {
    if (!highlightedStepKey) {
      return;
    }

    highlightPulse.setValue(0);
    let isActive = true;

    const animation = Animated.sequence([
      Animated.timing(highlightPulse, {
        toValue: 1,
        duration: 420,
        easing: Easing.out(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.delay(1600),
      Animated.timing(highlightPulse, {
        toValue: 0,
        duration: 420,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false,
      }),
    ]);

    animation.start(({ finished }) => {
      if (finished && isActive) {
        setHighlightedStepKey(null);
      }
    });

    return () => {
      isActive = false;
      animation.stop();
    };
  }, [highlightPulse, highlightedStepKey]);

  const highlightBackground = useMemo(
    () =>
      highlightPulse.interpolate({
        inputRange: [0, 1],
        outputRange: ['rgba(216,58,46,0)', 'rgba(216,58,46,0.12)'],
      }),
    [highlightPulse],
  );

  const highlightScale = useMemo(
    () =>
      highlightPulse.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.015],
      }),
    [highlightPulse],
  );

  const statusAnnouncementScale = useMemo(
    () =>
      statusAnnouncementOpacity.interpolate({
        inputRange: [0, 1],
        outputRange: [0.96, 1],
      }),
    [statusAnnouncementOpacity],
  );

  const statusAnnouncementTranslateY = useMemo(
    () =>
      statusAnnouncementOpacity.interpolate({
        inputRange: [0, 1],
        outputRange: [-8, 0],
      }),
    [statusAnnouncementOpacity],
  );

  useEffect(() => {
    const previousStatus = previousStatusRef.current;

    if (normalizedStatus && previousStatus && normalizedStatus !== previousStatus) {
      const statusLabel =
        getStatusLabel(normalizedStatus) ?? t('orderTracking.history.statusUpdated');
      const latestStatusEntry =
        statusHistory.length > 0 ? statusHistory[statusHistory.length - 1] ?? null : null;

      setStatusChangeInfo({
        title: statusLabel,
        description:
          latestStatusEntry?.reason ??
          latestStatusEntry?.action ??
          t('orderTracking.history.defaultDescription'),
      });

      const highlightKey = getHistoryEntryKey(
        latestStatusEntry ?? null,
        Math.max(statusHistory.length - 1, 0),
      );

      setHighlightedStepKey((current) => (current === highlightKey ? current : highlightKey));

      Vibration.vibrate(40);
    }

    if (normalizedStatus) {
      previousStatusRef.current = normalizedStatus;
    }
  }, [
    getHistoryEntryKey,
    getStatusLabel,
    normalizedStatus,
    statusHistory,
    t,
  ]);

  const orderTotal = useMemo(() => {
    if (!order) {
      return undefined;
    }

    const paymentRecord = (order.payment ?? null) as
      | (Record<string, MonetaryAmount | null | undefined> & {
          total?: MonetaryAmount | null;
          itemsTotal?: MonetaryAmount | null;
          subtotal?: MonetaryAmount | null;
        })
      | null;

    const fallbackOrder = order as { total?: MonetaryAmount | null } | null;

    const candidates: (MonetaryAmount | null | undefined)[] = [
      paymentRecord?.total,
      paymentRecord?.itemsTotal,
      paymentRecord?.subtotal,
      fallbackOrder?.total,
    ];

    for (const candidate of candidates) {
      const formatted = formatMonetaryAmount(candidate);
      if (formatted) {
        return formatted;
      }
    }

    return undefined;
  }, [formatCurrency, formatMonetaryAmount, order]);
  const deliverySummary = (order?.delivery ?? null) as Record<string, any> | null;
  const courierDetails = deliverySummary?.courier ?? deliverySummary?.driver ?? null;
  const parsedCourierRating = Number(courierDetails?.rating ?? NaN);
  const courierRating = Number.isFinite(parsedCourierRating)
    ? parsedCourierRating.toFixed(1)
    : null;
  const courierDeliveriesValue = Number(courierDetails?.totalDeliveries ?? NaN);
  const courierDeliveries = Number.isFinite(courierDeliveriesValue)
    ? courierDeliveriesValue
    : null;
  const courierName = courierDetails?.name ?? t('orderTracking.courier.pending');
  const courierAvatarUri = courierDetails?.avatarUrl ?? undefined;
  const restaurantAvatarUri = (order as any)?.restaurant?.imageUrl ?? undefined;
  const orderIdentifier = order?.orderId
    ? t('orderTracking.summary.orderId', { values: { id: order.orderId } })
    : t('orderTracking.summary.titleFallback');
  const restaurantName =
    order?.restaurant?.name ?? t('restaurantDetails.fallbackName');
  const courierRatingText = courierRating ? `${courierRating} / 5` : '—';
  const courierDeliveriesText = courierDeliveries != null ? ` (${courierDeliveries})` : '';
  const canViewDetails = Boolean(order);
  const hasItems = (order?.items?.length ?? 0) > 0;
  const orderTotalDisplay = orderTotal ?? '—';

  const hasAssignedCourier = Boolean(
    courierDetails && (courierDetails.id != null || courierDetails.name),
  );

  const resolveCoordinate = useCallback((value: any): LatLng | null => {
    if (!value) {
      return null;
    }

    const lat =
      value?.lat ?? value?.latitude ?? value?.latitud ?? value?.coords?.lat ?? value?.coords?.latitude;
    const lng =
      value?.lng ??
      value?.lon ??
      value?.longitude ??
      value?.coords?.lng ??
      value?.coords?.lon ??
      value?.coords?.longitude;

    if (lat != null && lng != null) {
      const parsedLat = Number(lat);
      const parsedLng = Number(lng);

      if (Number.isFinite(parsedLat) && Number.isFinite(parsedLng)) {
        return {
          latitude: parsedLat,
          longitude: parsedLng,
        } satisfies LatLng;
      }
    }

    return null;
  }, []);

  const driverCoordinate = useMemo<LatLng | null>(() => {
    const potentialLocations = [
      courierDetails?.location,
      deliverySummary?.driverLocation,
    ];

    for (const location of potentialLocations) {
      const coordinate = resolveCoordinate(location);
      if (coordinate) {
        return coordinate;
      }
    }

    return null;
  }, [courierDetails, deliverySummary, resolveCoordinate]);

  const clientCoordinate = useMemo<LatLng | null>(() => {
    const potentialLocations = [
      deliverySummary?.destination,
      deliverySummary?.dropoff,
      deliverySummary?.location,
      order?.deliveryLocation,
      (order as Record<string, any> | null)?.shippingAddress,
    ];

    for (const location of potentialLocations) {
      const coordinate = resolveCoordinate(location);
      if (coordinate) {
        return coordinate;
      }
    }

    return null;
  }, [deliverySummary, order, resolveCoordinate]);

  const mapRegion = useMemo<Region | null>(() => {
    const points = [driverCoordinate, clientCoordinate].filter(
      (point): point is LatLng => point != null,
    );

    if (points.length === 0) {
      return null;
    }

    if (points.length === 1) {
      return {
        latitude: points[0]!.latitude,
        longitude: points[0]!.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      } satisfies Region;
    }

    const lats = points.map((point) => point.latitude);
    const lngs = points.map((point) => point.longitude);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latitudeDelta = Math.max((maxLat - minLat) * 1.4, 0.02);
    const longitudeDelta = Math.max((maxLng - minLng) * 1.4, 0.02);

    return {
      latitude: (minLat + maxLat) / 2,
      longitude: (minLng + maxLng) / 2,
      latitudeDelta,
      longitudeDelta,
    } satisfies Region;
  }, [clientCoordinate, driverCoordinate]);

  const [interactiveRegion, setInteractiveRegion] = useState<Region | null>(null);
  const mapManuallyAdjustedRef = useRef(false);
  const mapHasInitializedRef = useRef(false);
  const pendingRegionUpdateRef = useRef<Region | null>(null);

  useEffect(() => {
    if (!mapRegion) {
      if (interactiveRegion) {
        setInteractiveRegion(null);
      }
      mapManuallyAdjustedRef.current = false;
      mapHasInitializedRef.current = false;
      pendingRegionUpdateRef.current = null;
      return;
    }

    if (!interactiveRegion) {
      pendingRegionUpdateRef.current = mapRegion;
      setInteractiveRegion(mapRegion);
      return;
    }

    if (mapManuallyAdjustedRef.current) {
      return;
    }

    const hasRegionChanged =
      Math.abs(interactiveRegion.latitude - mapRegion.latitude) > 0.0001 ||
      Math.abs(interactiveRegion.longitude - mapRegion.longitude) > 0.0001 ||
      Math.abs(interactiveRegion.latitudeDelta - mapRegion.latitudeDelta) > 0.0001 ||
      Math.abs(interactiveRegion.longitudeDelta - mapRegion.longitudeDelta) > 0.0001;

    if (hasRegionChanged) {
      pendingRegionUpdateRef.current = mapRegion;
      setInteractiveRegion(mapRegion);
    }
  }, [interactiveRegion, mapRegion]);

  const handleMapRegionChangeComplete = useCallback((region: Region) => {
    setInteractiveRegion(region);

    const pendingRegion = pendingRegionUpdateRef.current;
    const isProgrammaticUpdate =
      pendingRegion != null &&
      Math.abs(region.latitude - pendingRegion.latitude) <= 0.0001 &&
      Math.abs(region.longitude - pendingRegion.longitude) <= 0.0001 &&
      Math.abs(region.latitudeDelta - pendingRegion.latitudeDelta) <= 0.0001 &&
      Math.abs(region.longitudeDelta - pendingRegion.longitudeDelta) <= 0.0001;

    if (!mapHasInitializedRef.current) {
      mapHasInitializedRef.current = true;
    }

    pendingRegionUpdateRef.current = null;

    if (isProgrammaticUpdate) {
      return;
    }

    mapManuallyAdjustedRef.current = true;
  }, []);

  const handleMapPanDrag = useCallback(() => {
    mapManuallyAdjustedRef.current = true;
  }, []);

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleCallCourier = () => {};

  const handleSeeDetails = () => {
    if (!order) {
      return;
    }

    navigation.navigate('CheckoutOrder', {
      viewMode: true,
      order: order as CreateOrderResponse,
    });
  };

  const handleBottomSheetLayout = useCallback((event: LayoutChangeEvent) => {
    const nextHeight = event?.nativeEvent?.layout?.height ?? 0;
    if (!Number.isFinite(nextHeight)) {
      return;
    }

    setBottomSheetHeight((current) => (Math.abs(current - nextHeight) > 2 ? nextHeight : current));
  }, []);

  const headerMinHeight = useMemo(
    () => Math.max(HEADER_MIN_HEIGHT, insets.top + 56),
    [insets.top],
  );

  const headerMaxHeight = useMemo(() => {
    const desiredHeight = Math.max(HEADER_MAX_HEIGHT, height * (isLandscape ? 0.5 : 0.42));
    const cappedHeight = Math.min(desiredHeight, isTablet ? 440 : 360);
    const availableHeight = Math.max(height - (isLandscape ? 96 : 140), headerMinHeight + 40);
    return Math.min(Math.max(cappedHeight, headerMinHeight + 40), availableHeight);
  }, [headerMinHeight, height, isLandscape, isTablet]);

  const headerScrollDistance = useMemo(
    () => Math.max(headerMaxHeight - headerMinHeight, 1),
    [headerMaxHeight, headerMinHeight],
  );

  const headerHeight = scrollY.interpolate({
    inputRange: [0, headerScrollDistance],
    outputRange: [headerMaxHeight, headerMinHeight],
    extrapolate: 'clamp',
  });

  const headerRadius = scrollY.interpolate({
    inputRange: [0, headerScrollDistance],
    outputRange: [28, 0],
    extrapolate: 'clamp',
  });

  const mapCollapseDistance = useMemo(
    () => Math.min(140, Math.max(90, headerMaxHeight * 0.35)),
    [headerMaxHeight],
  );

  const mapTranslateY = scrollY.interpolate({
    inputRange: [0, headerScrollDistance],
    outputRange: [0, -mapCollapseDistance],
    extrapolate: 'clamp',
  });

  const contentSpacerHeight = scrollY.interpolate({
    inputRange: [0, headerScrollDistance],
    outputRange: [headerMaxHeight + (isTablet ? 32 : 24), headerMinHeight + 12],
    extrapolate: 'clamp',
  });

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(statusPulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(statusPulse, {
          toValue: 0,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [statusPulse]);

  const statusPulseScale = statusPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const statusPulseOpacity = statusPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.65, 1],
  });

  const renderHero = (collapsed: boolean) => {
    const shouldShowMap = isInDeliveryStatus && hasAssignedCourier && Boolean(mapRegion);
    const showStatusAnimation = !shouldShowMap && heroAnimationConfig != null;

    return (
      <View style={collapsed ? styles.mapCollapsed : styles.mapExpanded}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { transform: [{ translateY: mapTranslateY }] },
          ]}
          pointerEvents={collapsed ? 'none' : 'auto'}
        >
          {shouldShowMap ? (
            <MapView
              style={StyleSheet.absoluteFill}
              initialRegion={mapRegion!}
              region={interactiveRegion ?? mapRegion!}
              onRegionChangeComplete={handleMapRegionChangeComplete}
              onPanDrag={handleMapPanDrag}
              scrollEnabled
              zoomEnabled
              rotateEnabled={false}
              pitchEnabled={false}
              showsPointsOfInterest={false}
              showsCompass={false}
            >
              {driverCoordinate ? (
                <Marker coordinate={driverCoordinate}>
                  <View style={styles.driverMarker}>
                    <Bike size={16} color="white" />
                  </View>
                </Marker>
              ) : null}
              {clientCoordinate ? (
                <Marker coordinate={clientCoordinate}>
                  <View style={styles.clientMarker}>
                    <MapPin size={18} color="white" />
                  </View>
                </Marker>
              ) : null}
            </MapView>
          ) : showStatusAnimation ? (
            <View style={[styles.statusPlaceholder, responsiveStyles.statusPlaceholder]}>
              <LottieView
                source={heroAnimationConfig!.source}
                autoPlay
                loop
                style={[styles.statusAnimation, responsiveStyles.statusAnimation]}
              />
              <Text style={[styles.statusMessage, responsiveStyles.statusMessage]}>
                {heroAnimationConfig!.message}
              </Text>
            </View>
          ) : (
            <View style={[styles.statusPlaceholder, responsiveStyles.statusPlaceholder]}>
              <Animated.View
                style={[
                  styles.statusPulse,
                  responsiveStyles.statusPulse,
                  {
                    opacity: statusPulseOpacity,
                    transform: [{ scale: statusPulseScale }],
                  },
                ]}
              />
              <View style={styles.statusTextWrapper}>
                <Text style={[styles.statusHeading, responsiveStyles.statusHeading]}>
                  {formattedStatus ?? t('orderTracking.hero.waitingTitle')}
                </Text>
                <Text style={[styles.statusSubheading, responsiveStyles.statusSubheading]}>
                  {hasAssignedCourier
                    ? t('orderTracking.hero.driverEnRoute')
                    : t('orderTracking.hero.driverUnassigned')}
                </Text>
              </View>
            </View>
          )}
        </Animated.View>

        <View style={[styles.mapTopBar, responsiveStyles.mapTopBar]}>
          <TouchableOpacity
            onPress={handleGoBack}
            activeOpacity={0.85}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleOpenSupport}
            activeOpacity={0.85}
            style={styles.helpButton}
          >
            <MessageCircle size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    {
      useNativeDriver: false,
      listener: (event) => {
        const offset = event.nativeEvent.contentOffset.y;
        const shouldCollapse = offset > COLLAPSE_THRESHOLD;
        setIsHeaderCollapsed((prev) =>
          prev === shouldCollapse ? prev : shouldCollapse,
        );
      },
    },
  );

  const renderSteps = () => (
    <View style={[styles.stepsCard, responsiveStyles.stepsCard]}>
      <View style={[styles.stepsHeader, responsiveStyles.stepsHeader]}>
        <Text style={styles.stepsTitle}>{t('orderTracking.history.title')}</Text>
        {formattedStatus ? (
          <View style={[styles.stepsStatusBadge, responsiveStyles.stepsStatusBadge]}>
            <Text style={styles.stepsStatusText}>{formattedStatus}</Text>
          </View>
        ) : null}
      </View>
      {statusChangeInfo ? (
        <Animated.View
          style={[
            styles.statusAnnouncement,
            {
              opacity: statusAnnouncementOpacity,
              transform: [
                { scale: statusAnnouncementScale },
                { translateY: statusAnnouncementTranslateY },
              ],
            },
          ]}
        >
          <Text style={styles.statusAnnouncementTitle}>{statusChangeInfo.title}</Text>
          {statusChangeInfo.description ? (
            <Text style={styles.statusAnnouncementDescription}>
              {statusChangeInfo.description}
            </Text>
          ) : null}
        </Animated.View>
      ) : null}
      {statusHistory.length === 0 ? (
        <Text style={styles.stepsEmptyText}>
          {t('orderTracking.history.empty')}
        </Text>
      ) : (
        statusHistory.map((entry, index) => {
          const isLast = index === statusHistory.length - 1;
          const entryStatus = entry?.newStatus ? String(entry.newStatus).toUpperCase() : null;
          const isDelivered = normalizedStatus === 'DELIVERED';
          const isActive = isLast && !isDelivered;
          const isCompleted = index < statusHistory.length - 1 || (isLast && isDelivered);
          const isPending = !isCompleted && !isActive;
          const topConnectorActive = index > 0 && (isCompleted || isActive || isDelivered);
          const bottomConnectorActive = !isLast && isCompleted;
          const highlightKey = getHistoryEntryKey(entry, index);
          const isHighlighted = highlightedStepKey === highlightKey;
          const title =
            getStatusLabel(entryStatus) ??
            entry?.newStatus ??
            entry?.action ??
            t('orderTracking.history.updateFallback', { values: { index: index + 1 } });
          const description =
            entry?.reason ??
            entry?.action ??
            t('orderTracking.history.defaultDescription');
          const changedAt = entry?.changedAt ? new Date(entry.changedAt) : null;
          const timeLabel = changedAt
            ? changedAt.toLocaleTimeString(undefined, {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '—';

          return (
            <Animated.View
              key={`${highlightKey}-${index}`}
              style={[
                styles.stepRow,
                responsiveStyles.stepRow,
                !isLast && styles.stepRowDivider,
                isHighlighted && styles.stepRowHighlighted,
                isHighlighted
                  ? {
                      backgroundColor: highlightBackground,
                      transform: [{ scale: highlightScale }],
                    }
                  : null,
              ]}
            >
              <View style={styles.stepTimeline}>
                {index > 0 ? (
                  <View
                    style={[
                      styles.stepConnector,
                      styles.stepConnectorTop,
                      topConnectorActive && styles.stepConnectorActive,
                    ]}
                  />
                ) : null}

                <View
                  style={[
                    styles.stepDot,
                    isCompleted && styles.stepDotCompleted,
                    isActive && styles.stepDotActive,
                    isPending && styles.stepDotPending,
                  ]}
                >
                  {isCompleted ? (
                    <Check size={12} color={accentColor} />
                  ) : isActive ? (
                    <Clock size={12} color={accentColor} />
                  ) : null}
                </View>

                {!isLast ? (
                  <View
                    style={[
                      styles.stepConnector,
                      styles.stepConnectorBottom,
                      bottomConnectorActive && styles.stepConnectorActive,
                    ]}
                  />
                ) : null}
              </View>
              <View style={styles.stepTexts}>
                <Text
                  style={[
                    styles.stepTitle,
                    (isCompleted || isActive) && styles.stepTitleActive,
                    isPending && styles.stepTitlePending,
                  ]}
                >
                  {title}
                </Text>
                <Text
                  style={[
                    styles.stepDescription,
                    isPending && styles.stepDescriptionPending,
                  ]}
                >
                  {description}
                </Text>
              </View>
              <View style={[styles.stepMeta, responsiveStyles.stepMeta]}>
                <View
                  style={[
                    styles.stepEtaBadge,
                    isPending && styles.stepEtaBadgePending,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepEtaText,
                      isPending && styles.stepEtaTextPending,
                    ]}
                  >
                    {timeLabel}
                  </Text>
                </View>
              </View>
            </Animated.View>
          );
        })
      )}
    </View>
  );

  return (
    <View style={styles.screen}>
      <Animated.View
        style={[
          styles.headerContainer,
          {
            height: headerHeight,
            borderBottomLeftRadius: headerRadius,
            borderBottomRightRadius: headerRadius,
          },
        ]}
      >
        {renderHero(isHeaderCollapsed)}
      </Animated.View>

      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, responsiveStyles.scrollContent]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Animated.View style={[styles.contentSpacer, { height: contentSpacerHeight }]} />
        {renderSteps()}
      </Animated.ScrollView>

      <View
        style={[
          styles.bottomSheet,
          responsiveStyles.bottomSheet,
          { paddingBottom: insets.bottom + bottomSheetExtraPadding },
        ]}
        onLayout={handleBottomSheetLayout}
      >
        <View style={responsiveStyles.bottomSheetInner}>
          {shouldShowPaymentCard ? (
            <View style={[styles.paymentCard, responsiveStyles.paymentCard]}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => setIsPaymentDetailsExpanded((previous) => !previous)}
                style={[styles.paymentAccordionHeader, responsiveStyles.paymentAccordionHeader]}
              >
              <View style={styles.paymentHeaderRow}>
                <Text style={styles.paymentTitle}>{t('orderTracking.payment.title')}</Text>
                {paymentStatusLabel ? (
                  <View
                    style={[
                      styles.paymentStatusPill,
                      isPaymentPending && styles.paymentStatusPillPending,
                    ]}
                  >
                    <Text
                      style={[
                        styles.paymentStatusText,
                        isPaymentPending && styles.paymentStatusTextPending,
                      ]}
                    >
                      {paymentStatusLabel}
                    </Text>
                  </View>
                ) : null}
              </View>
              <ChevronDown
                size={18}
                color={textSecondary}
                style={[
                  styles.paymentAccordionCaret,
                  isPaymentDetailsExpanded && styles.paymentAccordionCaretExpanded,
                ]}
              />
            </TouchableOpacity>

            {isPaymentDetailsExpanded ? (
              <View style={[styles.paymentAccordionContent, responsiveStyles.paymentAccordionContent]}>
                <Text style={[styles.paymentDescription, responsiveStyles.paymentDescription]}>
                  {isPaymentPending
                    ? t('orderTracking.payment.pendingDescription')
                    : t('orderTracking.payment.statusDescription')}
                </Text>

                {paymentEnvironmentLabel ? (
                  <Text style={styles.paymentMeta}>
                    {t('orderTracking.payment.environmentLabel', {
                      values: { environment: paymentEnvironmentLabel },
                    })}
                  </Text>
                ) : null}

                {paymentDetails?.paymentReference ? (
                  <Text style={styles.paymentMeta}>
                    {t('orderTracking.payment.referenceLabel', {
                      values: { reference: paymentDetails.paymentReference },
                    })}
                  </Text>
                ) : null}

                {shouldShowResumePayment ? (
                  <TouchableOpacity
                    onPress={handleResumePayment}
                    activeOpacity={0.85}
                    style={styles.paymentButton}
                  >
                    <Text style={styles.paymentButtonText}>
                      {t('orderTracking.payment.resumeCta')}
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : null}
          </View>
        ) : null}

        <View style={[styles.summaryCard, responsiveStyles.summaryCard]}>
          <View style={[styles.summaryHeader, responsiveStyles.summaryHeader]}>
            <View style={styles.summaryHeaderLeft}>
              {restaurantAvatarUri ? (
                <Image
                  source={{ uri: `${BASE_API_URL}/auth/image/${restaurantAvatarUri}` }}
                  style={styles.summaryRestaurantImage}
                />
              ) : (
                <View style={styles.summaryRestaurantPlaceholder}>
                  <MapPin size={18} color="white" />
                </View>
              )}
              <Text style={styles.summaryTitle}>{orderIdentifier}</Text>
            </View>
            <View style={[styles.summaryBadge, responsiveStyles.summaryBadge]}>
              <Text style={styles.summaryBadgeText}>
                {restaurantName}
              </Text>
            </View>
          </View>

          <View style={styles.summaryItems}>
            {hasItems ? (
              order?.items?.map((item, index) => {
                const isLast = index === (order?.items?.length ?? 0) - 1;
                const extrasLabel = Array.isArray(item?.extras)
                  ? item.extras
                      .map((extra) => extra?.name)
                      .filter((name): name is string => Boolean(name && name.trim().length))
                      .join(', ')
                  : undefined;
                const quantity = item?.quantity ?? 1;
                const displayName =
                  item?.name ??
                  (item as { menuItemName?: string } | null | undefined)?.menuItemName ??
                  t('checkout.defaults.item');
                const totalDisplay = (() => {
                  const lineTotal = extractNumericAmount(item?.lineTotal);
                  const unitPrice = extractNumericAmount(item?.unitPrice);
                  const extrasPrice = extractNumericAmount(item?.extrasPrice);
                  const unitBasePrice = extractNumericAmount(item?.unitBasePrice);
                  const unitExtrasPrice = extractNumericAmount(item?.unitExtrasPrice);
                  const lineSubtotal = extractNumericAmount(item?.lineSubtotal);
                  const promotionDiscount = extractNumericAmount(item?.promotionDiscount);
                  const lineItemsTotal = extractNumericAmount(item?.lineItemsTotal);
                  const extrasTotal = extractNumericAmount(item?.extrasTotal);
                  const legacyTotal = extractNumericAmount((item as { total?: MonetaryAmount })?.total);
                  const legacyTotalPrice = extractNumericAmount(
                    (item as { totalPrice?: MonetaryAmount })?.totalPrice,
                  );

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

                  const resolvedLineTotal =
                    lineTotal ??
                    legacyTotal ??
                    legacyTotalPrice ??
                    Math.max(resolvedItemsTotal + resolvedExtras, 0);

                  const formattedLineTotal = formatCurrency(resolvedLineTotal);
                  if (formattedLineTotal) {
                    return formattedLineTotal;
                  }

                  const fallbackTotal = Math.max(resolvedItemsTotal + resolvedExtras, 0);
                  if (fallbackTotal > 0) {
                    return formatCurrency(fallbackTotal);
                  }

                  return undefined;
                })();

                return (
                  <View
                    key={`${item?.menuItemId ?? index}-${index}`}
                    style={[
                      styles.summaryItemRow,
                      responsiveStyles.summaryItemRow,
                      !isLast && styles.summaryItemRowSpacing,
                    ]}
                  >
                    <View style={styles.summaryItemInfo}>
                      <View style={styles.summaryItemPrimaryRow}>
                        <Text style={styles.summaryItemQuantity}>{quantity}x</Text>
                        <Text style={styles.summaryItemName} numberOfLines={1}>
                          {displayName}
                        </Text>
                      </View>
                      {extrasLabel ? (
                        <Text style={styles.summaryItemExtras} numberOfLines={1}>
                          {extrasLabel}
                        </Text>
                      ) : null}
                    </View>
                    <Text style={[styles.summaryItemPrice, responsiveStyles.summaryItemPrice]}>
                      {totalDisplay ?? '—'}
                    </Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.summaryEmptyText}>
                {t('orderTracking.summary.empty')}
              </Text>
            )}
          </View>

          <View style={[styles.summaryFooter, responsiveStyles.summaryFooter]}>
            <Text style={styles.summaryTotal}>{orderTotalDisplay}</Text>
            <TouchableOpacity
              onPress={handleSeeDetails}
              disabled={!canViewDetails}
              activeOpacity={0.85}
              style={[
                styles.summaryDetailsButton,
                !canViewDetails && styles.summaryDetailsButtonDisabled,
              ]}
            >
              <Text style={styles.summaryDetailsText}>{t('orderTracking.summary.detailsCta')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.courierStickyCard, responsiveStyles.courierStickyCard]}>
          <View style={styles.courierInfo}>
            {courierAvatarUri ? (
              <Image source={{ uri: courierAvatarUri }} style={styles.courierAvatar} />
            ) : (
              <View style={[styles.courierAvatar, styles.courierAvatarFallback]}>
                <Bike size={16} color="white" />
              </View>
            )}
            <View>
              <Text style={styles.courierStickyLabel}>{t('orderTracking.courier.label')}</Text>
              <Text style={styles.courierStickyName}>{courierName}</Text>
              <View style={styles.courierStickyRating}>
                <Star size={14} color={accentColor} fill={accentColor} />
                <Text style={styles.courierStickyRatingText}>
                  {courierRatingText}
                  {courierDeliveriesText}
                </Text>
              </View>
            </View>
          </View>
          <View style={[styles.courierStickyActions, responsiveStyles.courierStickyActions]}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.courierActionButton}
              onPress={handleCallCourier}
            >
              <Phone size={18} color={accentColor} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.courierActionButton,
                styles.courierActionButtonSpacing,
                responsiveStyles.courierActionButtonSpacing,
              ]}
              onPress={handleRequestLiveChat}
            >
              <MessageCircle size={18} color={accentColor} />
            </TouchableOpacity>
          </View>
        </View>
        </View>
      </View>

      {isHelpModalVisible ? (
        <Modal
          transparent
          visible={isHelpModalVisible}
          onRequestClose={handleCloseSupport}
          animationType="none"
        >
          <View style={styles.helpModalContainer}>
            <Pressable style={styles.helpBackdropPressable} onPress={handleCloseSupport}>
              <Animated.View
                style={[styles.helpBackdrop, { opacity: helpBackdropOpacity }]}
              />
            </Pressable>
            <Animated.View
              style={[
                styles.helpSheet,
                responsiveStyles.helpSheet,
                helpSheetPadding,
                { transform: [{ translateY: helpSheetTranslateY }] },
              ]}
            >
              <View style={styles.helpHandle} />
              <Text style={styles.helpTitle}>{t('orderTracking.help.title')}</Text>
              <Text style={styles.helpDescription}>
                {t('orderTracking.help.description')}
              </Text>
              <TouchableOpacity
                style={[styles.helpOption, responsiveStyles.helpOption]}
                activeOpacity={0.85}
                onPress={handleCallSupport}
              >
                <View style={[styles.helpOptionIcon, responsiveStyles.helpOptionIcon]}>
                  <Phone size={20} color="white" />
                </View>
                <View style={[styles.helpOptionContent, responsiveStyles.helpOptionContent]}>
                  <Text style={styles.helpOptionTitle}>
                    {t('orderTracking.help.callSupport')}
                  </Text>
                  <Text style={styles.helpOptionSubtitle}>{supportPhoneNumber}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.helpChatButton, responsiveStyles.helpChatButton]}
                activeOpacity={0.9}
                onPress={handleRequestLiveChat}
              >
                <MessageCircle size={18} color="white" />
                <Text style={[styles.helpChatButtonText, responsiveStyles.helpChatButtonText]}>
                  {t('orderTracking.help.liveChatCta')}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
};

export default OrderTrackingScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: softBackground,
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: softBackground,
    overflow: 'hidden',
    zIndex: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: softBackground,
  },
  contentSpacer: {
    width: '100%',
  },
  mapExpanded: {
    flex: 1,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  mapCollapsed: {
    flex: 1,
    overflow: 'hidden',
  },
  statusPlaceholder: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: ms(20),
  },
  statusAnimation: {
    width: ms(260),
    height: ms(260),
  },
  statusMessage: {
    marginTop: ms(10),
    fontSize: 10,
    lineHeight: ms(12),
    fontWeight: '600',
    color: textPrimary,
    textAlign: 'center',
    paddingHorizontal: ms(12),
  },
  statusPulse: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(216,58,46,0.12)',
    alignSelf: 'center',
  },
  statusTextWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: accentColor,
    textAlign: 'center',
    marginBottom: 12,
  },
  statusSubheading: {
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
    color: textSecondary,
  },
  mapTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(15,23,42,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverMarker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: accentColor,
    borderWidth: 3,
    borderColor: 'white',
  },
  clientMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E3A8A',
    borderWidth: 3,
    borderColor: 'white',
  },
  stepsCard: {
    backgroundColor: softSurface,
    borderRadius: 26,
    paddingHorizontal: 24,
    paddingVertical: 32,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
    marginBottom: 40,
  },
  stepsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: textPrimary,
  },
  stepsStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(216,58,46,0.1)',
  },
  stepsStatusText: {
    fontSize: ms(7),
    fontWeight: '700',
    color: accentColor,
  },
  stepsEmptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: textSecondary,
  },
  statusAnnouncement: {
    marginBottom: 20,
    backgroundColor: 'rgba(216,58,46,0.12)',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  statusAnnouncementTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: accentColor,
  },
  statusAnnouncementDescription: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: textPrimary,
    opacity: 0.75,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: 24,
  },
  stepRowHighlighted: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingTop: 12,
    marginHorizontal: -12,
  },
  stepRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderColor,
    marginBottom: 24,
  },
  stepTimeline: {
    width: 36,
    minHeight: 24,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  stepConnector: {
    position: 'absolute',
    width: 2,
    backgroundColor: '#E5E7EB',
    left: 17,
  },
  stepConnectorTop: {
    top: 0,
    bottom: 12,
  },
  stepConnectorBottom: {
    top: 12,
    bottom: 0,
  },
  stepConnectorActive: {
    backgroundColor: accentColor,
  },
  stepDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotCompleted: {
    backgroundColor: 'rgba(216,58,46,0.1)',
    borderColor: accentColor,
  },
  stepDotActive: {
    borderColor: accentColor,
  },
  stepDotPending: {
    borderColor: '#E2E8F0',
  },
  stepTexts: {
    flex: 1,
    paddingRight: 16,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  stepTitleActive: {
    color: accentColor,
  },
  stepTitlePending: {
    color: '#A0AEC0',
  },
  stepDescription: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: textSecondary,
  },
  stepDescriptionPending: {
    color: '#C5CCD8',
  },
  stepMeta: {
    alignItems: 'flex-end',
    width: 78,
  },
  stepEtaBadge: {
    marginTop: 8,
    backgroundColor: accentColor,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  stepEtaBadgePending: {
    backgroundColor: '#EEF2F6',
  },
  stepEtaText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  stepEtaTextPending: {
    color: '#9CA3AF',
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: softSurface,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#0F172A',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
    marginBottom: 12,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryRestaurantImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
    backgroundColor: '#F1F5F9',
  },
  summaryRestaurantPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: accentColor,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: textPrimary,
  },
  summaryBadge: {
    backgroundColor: '#FDE6E3',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  summaryBadgeText: {
    color: accentColor,
    fontSize: 11,
    fontWeight: '600',
  },
  summaryItems: {
    marginBottom: 10,
  },
  summaryItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  summaryItemRowSpacing: {
    marginBottom: 6,
  },
  summaryItemInfo: {
    flex: 1,
    marginRight: 12,
  },
  summaryItemPrimaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItemQuantity: {
    fontSize: 11,
    fontWeight: '600',
    color: accentColor,
    marginRight: 8,
  },
  summaryItemName: {
    fontSize: 12,
    color: textPrimary,
    flexShrink: 1,
  },
  summaryItemExtras: {
    fontSize: 11,
    color: textSecondary,
    marginTop: 2,
  },
  summaryItemPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: textPrimary,
    textAlign: 'right',
  },
  summaryEmptyText: {
    fontSize: 12,
    color: textSecondary,
  },
  summaryFooter: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: textPrimary,
  },
  summaryDetailsButton: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: accentColor,
  },
  summaryDetailsButtonDisabled: {
    backgroundColor: '#E2E8F0',
  },
  summaryDetailsText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  paymentCard: {
    backgroundColor: '#FFF6F5',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(216,58,46,0.18)',
    marginBottom: 16,
    overflow: 'hidden',
  },
  paymentAccordionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentHeaderRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentAccordionCaret: {
    marginLeft: 12,
    transform: [{ rotate: '0deg' }],
  },
  paymentAccordionCaretExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: textPrimary,
  },
  paymentStatusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(15,23,42,0.08)',
  },
  paymentStatusPillPending: {
    backgroundColor: 'rgba(216,58,46,0.12)',
  },
  paymentStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: textPrimary,
    textTransform: 'uppercase',
  },
  paymentStatusTextPending: {
    color: accentColor,
  },
  paymentDescription: {
    fontSize: 13,
    lineHeight: 18,
    color: textSecondary,
    marginTop: 4,
    marginBottom: 8,
  },
  paymentMeta: {
    fontSize: 12,
    lineHeight: 16,
    color: textSecondary,
    marginTop: 4,
  },
  paymentAccordionContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(216,58,46,0.12)',
  },
  paymentButton: {
    marginTop: 16,
    backgroundColor: accentColor,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  bottomSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: softBackground,
  },
  courierStickyCard: {
    backgroundColor: softSurface,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#0F172A',
    shadowOpacity: 0.02,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  courierInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  courierAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
    backgroundColor: '#F1F5F9',
  },
  courierAvatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: accentColor,
  },
  courierStickyLabel: {
    color: textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  courierStickyName: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '700',
    color: textPrimary,
  },
  courierStickyRating: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  courierStickyRatingText: {
    marginLeft: 6,
    fontSize: 11,
    color: textSecondary,
  },
  courierStickyActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courierActionButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F8F9FC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  courierActionButtonSpacing: {
    marginLeft: 8,
  },
  helpModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  helpBackdropPressable: {
    ...StyleSheet.absoluteFillObject,
  },
  helpBackdrop: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  helpSheet: {
    backgroundColor: softSurface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  helpHandle: {
    width: 48,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
    marginBottom: 18,
  },
  helpTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: textPrimary,
    marginBottom: 8,
  },
  helpDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: textSecondary,
    marginBottom: 24,
  },
  helpOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 18,
  },
  helpOptionIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: accentColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  helpOptionContent: {
    flex: 1,
  },
  helpOptionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: textPrimary,
    marginBottom: 4,
  },
  helpOptionSubtitle: {
    fontSize: 14,
    color: textSecondary,
  },
  helpChatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: accentColor,
    borderRadius: 20,
    paddingVertical: 16,
  },
  helpChatButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 10,
  },
});
