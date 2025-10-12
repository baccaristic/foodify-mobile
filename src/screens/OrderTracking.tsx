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
} from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Bike,
  Check,
  Clock,
  MapPin,
  MessageCircle,
  Phone,
  Star,
} from 'lucide-react-native';
import {
  NavigationProp,
  ParamListBase,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import LottieView from 'lottie-react-native';

import type {
  CreateOrderResponse,
  MonetaryAmount,
  OrderNotificationDto,
  OrderStatusHistoryDto,
} from '~/interfaces/Order';
import { ms, vs } from 'react-native-size-matters';
import { OrderStatusHistoryEntry, useWebSocketContext } from '~/context/WebSocketContext';
import useOngoingOrder from '~/hooks/useOngoingOrder';
import { formatOrderStatusLabel, mergeOrderLikeData } from '~/utils/order';
const HEADER_MAX_HEIGHT = 320;
const HEADER_MIN_HEIGHT = 72;
const COLLAPSE_THRESHOLD = 80;

const accentColor = '#D83A2E';
const softBackground = '#F5F6FA';
const softSurface = '#FFFFFF';
const textPrimary = '#0F172A';
const textSecondary = '#6B7280';
const borderColor = '#F0F1F5';

type OrderTrackingRoute = RouteProp<
  { OrderTracking: { order?: CreateOrderResponse | null; orderId?: number | string | null } },
  'OrderTracking'
>;

type LatLng = { latitude: number; longitude: number };

type WorkflowStep = {
  key: string;
  title: string;
  description: string;
  statusText: string;
  etaLabel: string;
  state: 'completed' | 'active' | 'pending';
};

type OrderTrackingData = Partial<CreateOrderResponse> &
  Partial<OrderNotificationDto> & {
  orderId?: number | string | null;
  statusHistory?: (OrderStatusHistoryDto | OrderStatusHistoryEntry)[];
};

type StatusChangeInfo = {
  title: string;
  description?: string | null;
};

const formatCurrency = (value: MonetaryAmount | null | undefined) => {
  if (value == null) {
    return undefined;
  }

  if (typeof value === 'number') {
    return `${value.toFixed(3)} dt`;
  }

  const parsed = Number(String(value).replace(',', '.'));
  if (Number.isFinite(parsed)) {
    return `${parsed.toFixed(3)} dt`;
  }

  return undefined;
};

const parseCurrencyValue = (value: MonetaryAmount | null | undefined) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(',', '.'));
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
};

const buildWorkflowSteps = (order: OrderTrackingData | null | undefined): WorkflowStep[] => {
  if (!order) {
    return [];
  }

  const normalizedStatus = order?.status ? String(order.status).toUpperCase() : null;
  const workflowSteps = order.workflow ?? [];

  if (workflowSteps.length) {
    return workflowSteps.map((step, index) => {
      const status = String(step?.status ?? '').toUpperCase();
      let state: WorkflowStep['state'] = 'pending';

      if (status === 'COMPLETED' || step?.completed) {
        state = 'completed';
      } else if (
        status === 'IN_PROGRESS' ||
        status === 'ACTIVE' ||
        (normalizedStatus && (status === normalizedStatus || step?.step?.toUpperCase() === normalizedStatus))
      ) {
        state = 'active';
      }

      return {
        key: step?.step ?? `STEP_${index}`,
        title: step?.label ?? `Step ${index + 1}`,
        description: step?.description ?? 'We will notify you once this updates.',
        statusText:
          state === 'completed' ? 'Completed' : state === 'active' ? 'In progress' : 'Pending',
        etaLabel: '—',
        state,
      } satisfies WorkflowStep;
    });
  }

  const historySteps = order.statusHistory ?? [];

  if (historySteps.length) {
    return historySteps.map((entry, index) => {
      const status = String(entry?.newStatus ?? '').toUpperCase();
      let state: WorkflowStep['state'] = 'completed';

      if (index === historySteps.length - 1 && normalizedStatus && normalizedStatus !== 'DELIVERED') {
        state = 'active';
      }

      if (normalizedStatus && status === normalizedStatus) {
        state = 'active';
      }

      return {
        key: entry?.action ?? `HISTORY_${index}`,
        title: entry?.newStatus ?? entry?.action ?? `Update ${index + 1}`,
        description: entry?.reason ?? 'Your order status has changed.',
        statusText: status || 'Updated',
        etaLabel: '—',
        state,
      } satisfies WorkflowStep;
    });
  }

  return [];
};

const OrderTrackingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<OrderTrackingRoute>();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const statusPulse = useRef(new Animated.Value(0)).current;
  const statusAnnouncementOpacity = useRef(new Animated.Value(0)).current;
  const highlightPulse = useRef(new Animated.Value(0)).current;
  const deliveryCelebrationOpacity = useRef(new Animated.Value(0)).current;
  const deliveryCardScale = useRef(new Animated.Value(0.92)).current;
  const deliveryCheckScale = useRef(new Animated.Value(0.6)).current;
  const deliveryTextOpacity = useRef(new Animated.Value(0)).current;
  const previousStatusRef = useRef<string | null>(null);
  const celebrationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const [statusChangeInfo, setStatusChangeInfo] = useState<StatusChangeInfo | null>(null);
  const [highlightedStepKey, setHighlightedStepKey] = useState<string | null>(null);
  const [showDeliveryCelebration, setShowDeliveryCelebration] = useState(false);
  const { latestOrderUpdate, orderUpdates } = useWebSocketContext();
  const { order: ongoingOrder, updateOrder: updateOngoingOrder } = useOngoingOrder();

  const initialOrder = route.params?.order ?? null;
  const routeOrderIdParam = route.params?.orderId ?? null;
  const initialOrderId = initialOrder?.orderId ?? null;
  const ongoingOrderId = ongoingOrder?.orderId ?? null;

  useEffect(() => {
    if (initialOrder) {
      updateOngoingOrder(initialOrder as Partial<OrderTrackingData>);
    }
  }, [initialOrder, updateOngoingOrder]);

  const relevantOrderIds = useMemo(() => {
    const ids: string[] = [];
    const addId = (value: number | string | null | undefined) => {
      if (value != null) {
        const key = String(value);
        if (!ids.includes(key)) {
          ids.push(key);
        }
      }
    };

    addId(routeOrderIdParam);
    addId(initialOrderId);
    addId(ongoingOrderId);

    return ids;
  }, [initialOrderId, ongoingOrderId, routeOrderIdParam]);

  const websocketOrderData = useMemo<OrderTrackingData | null>(() => {
    for (const id of relevantOrderIds) {
      const update = orderUpdates[id];
      if (update) {
        return update;
      }
    }

    if (latestOrderUpdate) {
      if (!latestOrderUpdate.orderId || relevantOrderIds.length === 0) {
        return latestOrderUpdate;
      }

      const latestId = String(latestOrderUpdate.orderId);
      if (relevantOrderIds.includes(latestId)) {
        return latestOrderUpdate;
      }

      const keyedUpdate = orderUpdates[latestId];
      if (keyedUpdate) {
        return keyedUpdate;
      }
    }

    return null;
  }, [latestOrderUpdate, orderUpdates, relevantOrderIds]);

  const contextOrder = useMemo<OrderTrackingData | null>(() => {
    if (!ongoingOrder) {
      return null;
    }

    const contextId = ongoingOrder.orderId ?? null;
    const targetId = routeOrderIdParam ?? initialOrderId ?? null;

    if (targetId == null || contextId == null) {
      return ongoingOrder as OrderTrackingData;
    }

    return String(contextId) === String(targetId)
      ? (ongoingOrder as OrderTrackingData)
      : null;
  }, [initialOrderId, ongoingOrder, routeOrderIdParam]);

  const baseOrder = useMemo(() => {
    return mergeOrderLikeData<OrderTrackingData>(
      initialOrder as OrderTrackingData | null,
      contextOrder as Partial<OrderTrackingData> | null,
    );
  }, [contextOrder, initialOrder]);

  const order = useMemo<OrderTrackingData | null>(() => {
    const merged = mergeOrderLikeData<OrderTrackingData>(
      baseOrder as OrderTrackingData | null,
      websocketOrderData as Partial<OrderTrackingData> | null,
    );

    if (merged) {
      const fallbackId =
        merged.orderId ??
        (websocketOrderData?.orderId ?? null) ??
        (contextOrder?.orderId ?? null) ??
        routeOrderIdParam ??
        initialOrderId ??
        null;

      return fallbackId != null ? ({ ...merged, orderId: fallbackId } as OrderTrackingData) : merged;
    }

    const fallbackId =
      (websocketOrderData?.orderId ?? null) ??
      (contextOrder?.orderId ?? null) ??
      routeOrderIdParam ??
      initialOrderId ??
      null;

    return fallbackId != null ? ({ orderId: fallbackId } as OrderTrackingData) : null;
  }, [
    baseOrder,
    contextOrder,
    initialOrderId,
    routeOrderIdParam,
    websocketOrderData,
  ]);

  const steps = useMemo(() => buildWorkflowSteps(order), [order]);
  const normalizedStatus = useMemo(
    () => (order?.status ? String(order.status).toUpperCase() : null),
    [order?.status],
  );
  const formattedStatus = formatOrderStatusLabel(order?.status);
  const isPendingStatus = normalizedStatus === 'PENDING';
  const isAcceptedStatus = normalizedStatus === 'ACCEPTED';
  const isPreparingStatus = normalizedStatus === 'PREPARING';
  const isReadyForPickupStatus = normalizedStatus === 'READY_FOR_PICK_UP';
  const isInDeliveryStatus = normalizedStatus === 'IN_DELIVERY';

  const heroAnimationConfig = useMemo(() => {
    if (isPendingStatus) {
      return {
        source: require('../../assets/animations/order_placed.json'),
        message: 'Restaurant has received your order.',
      } as const;
    }

    if (isAcceptedStatus) {
      return {
        source: require('../../assets/animations/order_placed.json'),
        message: 'Restaurant accepted your order, finding a suitable driver…',
      } as const;
    }

    if (isPreparingStatus) {
      return {
        source: require('../../assets/animations/prepare_food.json'),
        message: 'Restaurant is preparing your order.',
      } as const;
    }

    if (isReadyForPickupStatus) {
      return {
        source: require('../../assets/animations/order_ready.json'),
        message: 'Your order is ready, the driver is picking it up.',
      } as const;
    }

    return null;
  }, [
    isAcceptedStatus,
    isPendingStatus,
    isPreparingStatus,
    isReadyForPickupStatus,
  ]);

  const clearCelebrationTimeout = useCallback(() => {
    if (celebrationTimeoutRef.current) {
      clearTimeout(celebrationTimeoutRef.current);
      celebrationTimeoutRef.current = null;
    }
  }, []);

  const dismissDeliveryCelebration = useCallback(() => {
    if (!showDeliveryCelebration) {
      return;
    }

    clearCelebrationTimeout();

    Animated.timing(deliveryCelebrationOpacity, {
      toValue: 0,
      duration: 220,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setShowDeliveryCelebration(false);
        navigation.navigate('Home' as never);
      }
    });
  }, [
    clearCelebrationTimeout,
    deliveryCelebrationOpacity,
    navigation,
    showDeliveryCelebration,
  ]);

  useEffect(() => {
    return () => {
      clearCelebrationTimeout();
    };
  }, [clearCelebrationTimeout]);

  useEffect(() => {
    previousStatusRef.current = null;
    setStatusChangeInfo(null);
    setHighlightedStepKey(null);
    setShowDeliveryCelebration(false);
    deliveryCelebrationOpacity.setValue(0);
    deliveryCardScale.setValue(0.92);
    deliveryCheckScale.setValue(0.6);
    deliveryTextOpacity.setValue(0);
    clearCelebrationTimeout();
  }, [
    clearCelebrationTimeout,
    deliveryCardScale,
    deliveryCelebrationOpacity,
    deliveryCheckScale,
    deliveryTextOpacity,
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

  useEffect(() => {
    if (!showDeliveryCelebration) {
      return;
    }

    deliveryCelebrationOpacity.setValue(0);
    deliveryCardScale.setValue(0.92);
    deliveryCheckScale.setValue(0.6);
    deliveryTextOpacity.setValue(0);

    const overlayAnimation = Animated.parallel(
      [
        Animated.timing(deliveryCelebrationOpacity, {
          toValue: 1,
          duration: 260,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.spring(deliveryCardScale, {
          toValue: 1,
          damping: 7,
          mass: 0.9,
          stiffness: 160,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(160),
          Animated.spring(deliveryCheckScale, {
            toValue: 1.12,
            damping: 6,
            mass: 0.8,
            stiffness: 200,
            useNativeDriver: true,
          }),
          Animated.spring(deliveryCheckScale, {
            toValue: 1,
            damping: 7,
            mass: 0.8,
            stiffness: 220,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.delay(300),
          Animated.timing(deliveryTextOpacity, {
            toValue: 1,
            duration: 320,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ],
      { stopTogether: false },
    );

    overlayAnimation.start();

    clearCelebrationTimeout();
    celebrationTimeoutRef.current = setTimeout(() => {
      dismissDeliveryCelebration();
    }, 4200);

    return () => {
      overlayAnimation.stop();
      clearCelebrationTimeout();
    };
  }, [
    clearCelebrationTimeout,
    deliveryCardScale,
    deliveryCelebrationOpacity,
    deliveryCheckScale,
    deliveryTextOpacity,
    dismissDeliveryCelebration,
    showDeliveryCelebration,
  ]);

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

    if (normalizedStatus === 'DELIVERED' && previousStatus !== 'DELIVERED') {
      setShowDeliveryCelebration(true);
    }

    if (normalizedStatus && previousStatus && normalizedStatus !== previousStatus) {
      const statusLabel = formatOrderStatusLabel(normalizedStatus) ?? 'Status updated';
      const statusHistory = Array.isArray(order?.statusHistory) ? order?.statusHistory ?? [] : [];
      const latestStatusEntry =
        statusHistory.length > 0 ? statusHistory[statusHistory.length - 1] : null;

      setStatusChangeInfo({
        title: statusLabel,
        description:
          (latestStatusEntry as OrderStatusHistoryDto | OrderStatusHistoryEntry | null)?.reason ??
          (latestStatusEntry as OrderStatusHistoryDto | OrderStatusHistoryEntry | null)?.action ??
          'Your order moved to the next step.',
      });

      const activeStep = steps.find((step) => step.state === 'active') ?? null;
      const fallbackStep =
        activeStep ??
        [...steps].reverse().find((step) => step.state === 'completed') ??
        null;
      setHighlightedStepKey((current) =>
        current === (fallbackStep?.key ?? null) ? current : fallbackStep?.key ?? null,
      );

      Vibration.vibrate(40);
    }

    if (normalizedStatus) {
      previousStatusRef.current = normalizedStatus;
    }
  }, [normalizedStatus, order?.statusHistory, steps]);

  const orderTotal = formatCurrency(order?.payment?.total);
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
  const courierName = courierDetails?.name ?? 'Courier assigned soon';
  const courierAvatarUri = courierDetails?.avatarUrl ?? undefined;
  const restaurantAvatarUri = (order as any)?.restaurant?.imageUrl ?? undefined;
  const orderIdentifier = order?.orderId ? `Order #${order.orderId}` : 'Order details';
  const restaurantName = order?.restaurant?.name ?? 'Restaurant pending';
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

  const headerMinHeight = useMemo(
    () => Math.max(HEADER_MIN_HEIGHT, insets.top + 56),
    [insets.top],
  );

  const headerScrollDistance = useMemo(
    () => Math.max(HEADER_MAX_HEIGHT - headerMinHeight, 1),
    [headerMinHeight],
  );

  const headerHeight = scrollY.interpolate({
    inputRange: [0, headerScrollDistance],
    outputRange: [HEADER_MAX_HEIGHT, headerMinHeight],
    extrapolate: 'clamp',
  });

  const headerRadius = scrollY.interpolate({
    inputRange: [0, headerScrollDistance],
    outputRange: [28, 0],
    extrapolate: 'clamp',
  });

  const mapTranslateY = scrollY.interpolate({
    inputRange: [0, headerScrollDistance],
    outputRange: [0, -140],
    extrapolate: 'clamp',
  });

  const contentSpacerHeight = scrollY.interpolate({
    inputRange: [0, headerScrollDistance],
    outputRange: [HEADER_MAX_HEIGHT + 24, headerMinHeight + 12],
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
            <View style={styles.statusPlaceholder}>
              <LottieView
                source={heroAnimationConfig!.source}
                autoPlay
                loop
                style={styles.statusAnimation}
              />
              <Text style={styles.statusMessage}>{heroAnimationConfig!.message}</Text>
            </View>
          ) : (
            <View style={styles.statusPlaceholder}>
              <Animated.View
                style={[
                  styles.statusPulse,
                  {
                    opacity: statusPulseOpacity,
                    transform: [{ scale: statusPulseScale }],
                  },
                ]}
              />
              <View style={styles.statusTextWrapper}>
                <Text style={styles.statusHeading}>
                  {formattedStatus ?? 'Waiting for restaurant'}
                </Text>
                <Text style={styles.statusSubheading}>
                  {hasAssignedCourier
                    ? 'Driver is getting ready — location coming soon.'
                    : 'We will show the driver once they are assigned to your order.'}
                </Text>
              </View>
            </View>
          )}
        </Animated.View>

        <View style={[styles.mapTopBar, { paddingTop: insets.top + 10 }]}>
          <TouchableOpacity
            onPress={handleGoBack}
            activeOpacity={0.85}
            style={styles.backButton}
          >
            <ArrowLeft size={20} color="white" />
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
    <View style={styles.stepsCard}>
      <View style={styles.stepsHeader}>
        <Text style={styles.stepsTitle}>Order progress</Text>
        {formattedStatus ? (
          <View style={styles.stepsStatusBadge}>
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
      {steps.length === 0 ? (
        <Text style={styles.stepsEmptyText}>
          Tracking updates will appear once we receive status changes from the restaurant.
        </Text>
      ) : (
        steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const isCompleted = step.state === 'completed';
          const isActive = step.state === 'active';
          const isPending = !isCompleted && !isActive;
          const previousStep = index > 0 ? steps[index - 1] : null;
          const isHighlighted = highlightedStepKey != null && highlightedStepKey === step.key;

          const topConnectorActive =
            index > 0 &&
            (previousStep?.state === 'completed' || previousStep?.state === 'active');
          const bottomConnectorActive = !isLast && isCompleted;

          return (
            <Animated.View
              key={`${step.key}-${index}`}
              style={[
                styles.stepRow,
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
                  {step.title}
                </Text>
                <Text
                  style={[
                    styles.stepDescription,
                    isPending && styles.stepDescriptionPending,
                  ]}
                >
                  {step.description}
                </Text>
              </View>
              <View style={styles.stepMeta}>
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
                    {step.etaLabel}
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
        contentContainerStyle={[styles.scrollContent, { paddingBottom: vs(180) }]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <Animated.View style={[styles.contentSpacer, { height: contentSpacerHeight }]} />
        {renderSteps()}
      </Animated.ScrollView>

      <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={styles.summaryHeaderLeft}>
              {restaurantAvatarUri ? (
                <Image
                  source={{ uri: restaurantAvatarUri }}
                  style={styles.summaryRestaurantImage}
                />
              ) : (
                <View style={styles.summaryRestaurantPlaceholder}>
                  <MapPin size={18} color="white" />
                </View>
              )}
              <Text style={styles.summaryTitle}>{orderIdentifier}</Text>
            </View>
            <View style={styles.summaryBadge}>
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
                  'Menu item';
                const totalDisplay = (() => {
                  const formattedTotal = formatCurrency(item?.lineTotal);
                  if (formattedTotal) {
                    return formattedTotal;
                  }

                  const computedTotal =
                    parseCurrencyValue(item?.unitPrice) * quantity +
                    parseCurrencyValue(item?.extrasPrice);

                  if (!Number.isFinite(computedTotal) || computedTotal <= 0) {
                    return undefined;
                  }

                  return formatCurrency(computedTotal);
                })();

                return (
                  <View
                    key={`${item?.menuItemId ?? index}-${index}`}
                    style={[styles.summaryItemRow, !isLast && styles.summaryItemRowSpacing]}
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
                    <Text style={styles.summaryItemPrice}>{totalDisplay ?? '—'}</Text>
                  </View>
                );
              })
            ) : (
              <Text style={styles.summaryEmptyText}>
                Items will appear once your order is confirmed.
              </Text>
            )}
          </View>

          <View style={styles.summaryFooter}>
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
              <Text style={styles.summaryDetailsText}>See details</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.courierStickyCard}>
          <View style={styles.courierInfo}>
            {courierAvatarUri ? (
              <Image source={{ uri: courierAvatarUri }} style={styles.courierAvatar} />
            ) : (
              <View style={[styles.courierAvatar, styles.courierAvatarFallback]}>
                <Bike size={16} color="white" />
              </View>
            )}
            <View>
              <Text style={styles.courierStickyLabel}>Delivered by</Text>
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
          <View style={styles.courierStickyActions}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.courierActionButton}
              onPress={handleCallCourier}
            >
              <Phone size={18} color={accentColor} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.courierActionButton, styles.courierActionButtonSpacing]}
            >
              <MessageCircle size={18} color={accentColor} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {showDeliveryCelebration ? (
        <Animated.View
          pointerEvents="auto"
          style={[
            styles.deliveryCelebrationOverlay,
            { opacity: deliveryCelebrationOpacity },
          ]}
        >
          <Pressable
            style={styles.deliveryCelebrationBackdrop}
            onPress={dismissDeliveryCelebration}
          />
          <Animated.View
            style={[
              styles.deliveryCelebrationCard,
              { transform: [{ scale: deliveryCardScale }] },
            ]}
          >
            <Animated.View
              style={[
                styles.deliveryCelebrationIcon,
                { transform: [{ scale: deliveryCheckScale }] },
              ]}
            >
              <Check size={32} color="#FFFFFF" strokeWidth={3} />
            </Animated.View>
            <Animated.Text
              style={[
                styles.deliveryCelebrationTitle,
                { opacity: deliveryTextOpacity },
              ]}
            >
              Enjoy your order
            </Animated.Text>
            <Animated.Text
              style={[
                styles.deliveryCelebrationSubtitle,
                { opacity: deliveryTextOpacity },
              ]}
            >
              It’s been delivered. Bon appétit!
            </Animated.Text>
            <TouchableOpacity
              style={styles.deliveryCelebrationDismissButton}
              onPress={dismissDeliveryCelebration}
              activeOpacity={0.85}
            >
              <Text style={styles.deliveryCelebrationDismissText}>Close</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
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
  deliveryCelebrationOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  deliveryCelebrationBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  deliveryCelebrationCard: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: softSurface,
    borderRadius: 28,
    paddingHorizontal: 28,
    paddingVertical: 32,
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  deliveryCelebrationIcon: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: accentColor,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: accentColor,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  deliveryCelebrationTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: textPrimary,
    textAlign: 'center',
  },
  deliveryCelebrationSubtitle: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: textSecondary,
    textAlign: 'center',
  },
  deliveryCelebrationDismissButton: {
    marginTop: 24,
    paddingHorizontal: 28,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: accentColor,
  },
  deliveryCelebrationDismissText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
