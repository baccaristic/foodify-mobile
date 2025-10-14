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
} from 'react-native';
import MapView, { Marker, type Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Bike, Check, Clock, MapPin, MessageCircle, Phone, Star } from 'lucide-react-native';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';
import LottieView from 'lottie-react-native';

import type { CreateOrderResponse, MonetaryAmount, OrderStatusHistoryDto } from '~/interfaces/Order';
import { ms, vs } from 'react-native-size-matters';
import useOngoingOrder from '~/hooks/useOngoingOrder';
import type { OngoingOrderData } from '~/context/OngoingOrderContext';
import { formatOrderStatusLabel } from '~/utils/order';
import { BASE_API_URL } from '@env';
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

export type OrderTrackingData = (OngoingOrderData & Partial<CreateOrderResponse>) & {
  statusHistory?: OrderStatusHistoryDto[] | null;
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
  const { order: ongoingOrder } = useOngoingOrder();

  const order = useMemo<OrderTrackingData | null>(
    () => (ongoingOrder ? (ongoingOrder as OrderTrackingData) : null),
    [ongoingOrder],
  );
  const supportPhoneNumber = '+1 (800) 555-0199';
  const helpSheetTranslateY = useMemo(
    () =>
      helpSheetAnimation.interpolate({
        inputRange: [0, 1],
        outputRange: [360, 0],
      }),
    [helpSheetAnimation],
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
  const formattedStatus = formatOrderStatusLabel(order?.status);
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
      Alert.alert('Unable to place call', `Please dial ${supportPhoneNumber} manually.`);
    });
    handleCloseSupport();
  }, [handleCloseSupport, supportPhoneNumber]);

  const handleRequestLiveChat = useCallback(() => {
    handleCloseSupport();
    setTimeout(() => {
      navigation.navigate(
        'LiveChat' as never,
        {
          orderId: order?.orderId ?? null,
          topic: 'Order support',
          from: 'OrderTracking',
        } as never,
      );
    }, 260);
  }, [handleCloseSupport, navigation, order?.orderId]);

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
      const statusLabel = formatOrderStatusLabel(normalizedStatus) ?? 'Status updated';
      const latestStatusEntry =
        statusHistory.length > 0 ? statusHistory[statusHistory.length - 1] ?? null : null;

      setStatusChangeInfo({
        title: statusLabel,
        description:
          latestStatusEntry?.reason ??
          latestStatusEntry?.action ??
          'Your order moved to the next step.',
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
  }, [getHistoryEntryKey, normalizedStatus, statusHistory]);

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
      const formatted = formatCurrency(candidate);
      if (formatted) {
        return formatted;
      }
    }

    return undefined;
  }, [order]);
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
      {statusHistory.length === 0 ? (
        <Text style={styles.stepsEmptyText}>
          Tracking updates will appear once we receive status changes from the restaurant.
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
            formatOrderStatusLabel(entryStatus) ??
            entry?.newStatus ??
            entry?.action ??
            `Update ${index + 1}`;
          const description =
            entry?.reason ?? entry?.action ?? 'Your order moved to the next step.';
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
                helpSheetPadding,
                { transform: [{ translateY: helpSheetTranslateY }] },
              ]}
            >
              <View style={styles.helpHandle} />
              <Text style={styles.helpTitle}>Need help with your order?</Text>
              <Text style={styles.helpDescription}>
                Our support team is available 24/7 to assist you.
              </Text>
              <TouchableOpacity
                style={styles.helpOption}
                activeOpacity={0.85}
                onPress={handleCallSupport}
              >
                <View style={styles.helpOptionIcon}>
                  <Phone size={20} color="white" />
                </View>
                <View style={styles.helpOptionContent}>
                  <Text style={styles.helpOptionTitle}>Call customer support</Text>
                  <Text style={styles.helpOptionSubtitle}>{supportPhoneNumber}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.helpChatButton}
                activeOpacity={0.9}
                onPress={handleRequestLiveChat}
              >
                <MessageCircle size={18} color="white" />
                <Text style={styles.helpChatButtonText}>Request instant live chat</Text>
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
