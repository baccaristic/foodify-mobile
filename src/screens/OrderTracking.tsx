import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
  Easing,
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

import type {
  CreateOrderResponse,
  MonetaryAmount,
  OrderNotificationDto,
  OrderStatusHistoryDto,
} from '~/interfaces/Order';
import { vs } from 'react-native-size-matters';
import { OrderStatusHistoryEntry, useWebSocketContext } from '~/context/WebSocketContext';
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

const formatStatusLabel = (status: string | null | undefined) => {
  if (!status) {
    return null;
  }

  return status
    .toString()
    .toLowerCase()
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
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

const mergeOrderData = (
  baseOrder: OrderTrackingData | null | undefined,
  update: Partial<OrderTrackingData> | null | undefined,
): OrderTrackingData | null => {
  if (!baseOrder && !update) {
    return null;
  }

  const mergedRestaurant =
    baseOrder?.restaurant || update?.restaurant
      ? {
          ...((baseOrder?.restaurant as Record<string, unknown>) ?? {}),
          ...((update?.restaurant as Record<string, unknown>) ?? {}),
        }
      : undefined;

  const mergedDeliveryBase: Record<string, unknown> = {
    ...((baseOrder?.delivery as Record<string, unknown>) ?? {}),
    ...((update?.delivery as Record<string, unknown>) ?? {}),
  };

  if (
    (baseOrder as any)?.delivery?.driver != null ||
    (update as any)?.delivery?.driver != null
  ) {
    mergedDeliveryBase.driver = {
      ...(((baseOrder as any)?.delivery?.driver as Record<string, unknown>) ?? {}),
      ...(((update as any)?.delivery?.driver as Record<string, unknown>) ?? {}),
    };
  }

  const merged: OrderTrackingData = {
    ...(baseOrder ?? {}),
    ...(update ?? {}),
    ...(mergedRestaurant ? { restaurant: mergedRestaurant } : {}),
    ...(Object.keys(mergedDeliveryBase).length ? { delivery: mergedDeliveryBase } : {}),
    ...(baseOrder?.payment || update?.payment
      ? {
          payment: {
            ...((baseOrder?.payment as unknown as Record<string, unknown>) ?? {}),
            ...((update?.payment as unknown as Record<string, unknown>) ?? {}),
          },
        }
      : {}),
    items: update?.items ?? baseOrder?.items,
    workflow: update?.workflow ?? baseOrder?.workflow,
    statusHistory: update?.statusHistory ?? baseOrder?.statusHistory,
    status: update?.status ?? baseOrder?.status,
    orderId: update?.orderId ?? baseOrder?.orderId,
  };

  if (merged.orderId == null && baseOrder?.orderId != null) {
    merged.orderId = baseOrder.orderId;
  }

  return merged;
};

const OrderTrackingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<OrderTrackingRoute>();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const statusPulse = useRef(new Animated.Value(0)).current;
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);
  const { latestOrderUpdate, orderUpdates } = useWebSocketContext();

  const initialOrder = route.params?.order ?? null;
  const routeOrderIdParam = route.params?.orderId ?? null;
  const initialOrderId = initialOrder?.orderId ?? null;

  const websocketOrderData = useMemo<OrderTrackingData | null>(() => {
    if (routeOrderIdParam != null) {
      const update = orderUpdates[String(routeOrderIdParam)];
      if (update) {
        return update;
      }
    }

    if (initialOrderId != null) {
      const update = orderUpdates[String(initialOrderId)];
      if (update) {
        return update;
      }
    }

    return latestOrderUpdate ?? null;
  }, [initialOrderId, latestOrderUpdate, orderUpdates, routeOrderIdParam]);

  const order = useMemo<OrderTrackingData | null>(() => {
    const merged = mergeOrderData(initialOrder as OrderTrackingData | null, websocketOrderData);
    if (!merged) {
      if (routeOrderIdParam != null) {
        return { orderId: routeOrderIdParam } as OrderTrackingData;
      }
      return null;
    }

    const orderId = merged.orderId ?? routeOrderIdParam ?? initialOrderId ?? null;
    return {
      ...merged,
      orderId,
    };
  }, [initialOrder, initialOrderId, routeOrderIdParam, websocketOrderData]);

  const steps = useMemo(() => buildWorkflowSteps(order), [order]);
  const formattedStatus = formatStatusLabel(order?.status);

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

  const driverCoordinate = useMemo<LatLng | null>(() => {
    const courierLocation = courierDetails?.location ?? deliverySummary?.driverLocation;
    if (courierLocation?.lat != null && courierLocation?.lng != null) {
      return {
        latitude: Number(courierLocation.lat),
        longitude: Number(courierLocation.lng),
      } satisfies LatLng;
    }

    if (
      deliverySummary?.location?.lat != null &&
      deliverySummary.location.lng != null
    ) {
      return {
        latitude: Number(deliverySummary.location.lat),
        longitude: Number(deliverySummary.location.lng),
      } satisfies LatLng;
    }

    if (order?.deliveryLocation?.lat != null && order.deliveryLocation.lng != null) {
      return {
        latitude: Number(order.deliveryLocation.lat),
        longitude: Number(order.deliveryLocation.lng),
      } satisfies LatLng;
    }

    return null;
  }, [courierDetails, deliverySummary, order]);

  const mapRegion = useMemo<Region | null>(() => {
    if (!driverCoordinate) {
      return null;
    }

    return {
      latitude: driverCoordinate.latitude,
      longitude: driverCoordinate.longitude,
      latitudeDelta: 0.025,
      longitudeDelta: 0.025,
    } satisfies Region;
  }, [driverCoordinate]);

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
    const showMap = hasAssignedCourier && mapRegion;

    return (
      <View style={collapsed ? styles.mapCollapsed : styles.mapExpanded}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { transform: [{ translateY: mapTranslateY }] },
          ]}
          pointerEvents={collapsed ? 'none' : 'auto'}
        >
          {showMap ? (
            <MapView
              style={StyleSheet.absoluteFill}
              region={mapRegion!}
              scrollEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
              zoomEnabled={false}
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
            </MapView>
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

          const topConnectorActive =
            index > 0 &&
            (previousStep?.state === 'completed' || previousStep?.state === 'active');
          const bottomConnectorActive = !isLast && isCompleted;

          return (
            <View
              key={`${step.key}-${index}`}
              style={[styles.stepRow, !isLast && styles.stepRowDivider]}
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
            </View>
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
                return (
                  <View
                    key={`${item?.menuItemId ?? index}-${index}`}
                    style={[styles.summaryItemRow, !isLast && styles.summaryItemRowSpacing]}
                  >
                    <Text style={styles.summaryItemQuantity}>{item.quantity ?? 1}x</Text>
                    <Text style={styles.summaryItemName} numberOfLines={1}>
                      {item?.name ?? item.name ?? 'Menu item'}
                    </Text>
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
    paddingHorizontal: 32,
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
    fontSize: 12,
    fontWeight: '700',
    color: accentColor,
  },
  stepsEmptyText: {
    fontSize: 14,
    lineHeight: 20,
    color: textSecondary,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: 24,
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
    alignItems: 'center',
  },
  summaryItemRowSpacing: {
    marginBottom: 6,
  },
  summaryItemQuantity: {
    fontSize: 11,
    fontWeight: '600',
    color: accentColor,
    marginRight: 8,
  },
  summaryItemName: {
    flex: 1,
    fontSize: 12,
    color: textPrimary,
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
});
