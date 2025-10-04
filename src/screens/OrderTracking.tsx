import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
  Linking,
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

import type { CreateOrderResponse, MonetaryAmount, OrderDto } from '~/interfaces/Order';
import useOrderTracking from '~/hooks/useOrderTracking';
import {
  DEFAULT_REGION,
  DEFAULT_WORKFLOW_BLUEPRINT,
  EMPTY_ORDER,
  ensureWorkflow,
  normalizeStatus,
  STATUS_SEQUENCE,
  updateWorkflowProgress,
} from '~/services/orderTrackingHelpers';
import { vs } from 'react-native-size-matters';
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

const DEFAULT_DRIVER_OFFSET: LatLng = {
  latitude: DEFAULT_REGION.latitude - 0.005,
  longitude: DEFAULT_REGION.longitude + 0.012,
};

type WorkflowStep = {
  key: string;
  title: string;
  description: string;
  statusText: string;
  etaLabel: string;
  state: 'completed' | 'active' | 'pending';
};

type OrderTrackingRoute = RouteProp<
  { OrderTracking: { order?: CreateOrderResponse | null } },
  'OrderTracking'
>;

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


const formatEtaValue = (value?: number | null): string => {
  if (!Number.isFinite(value as number)) {
    return '—';
  }

  const numeric = Number(value);
  if (numeric <= 0) {
    return '—';
  }

  if (numeric > 180) {
    const minutes = Math.round(numeric / 60);
    return `${minutes} min`;
  }

  if (numeric >= 60) {
    const minutes = Math.floor(numeric / 60);
    const seconds = Math.round(numeric % 60);
    if (seconds <= 0) {
      return `${minutes} min`;
    }
    return `${minutes}m ${seconds}s`;
  }

  if (numeric >= 1) {
    return `${Math.round(numeric)} min`;
  }

  const seconds = Math.round(numeric * 60);
  if (seconds > 0) {
    return `${seconds}s`;
  }

  return '—';
};

const formatEtaFromUpdate = (
  stepKey: OrderStatus | null,
  update?: OrderDto | null,
): string => {
  if (!update) {
    return '—';
  }

  if (!stepKey) {
    return '—';
  }

  switch (stepKey) {
    case 'ACCEPTED':
    case 'PREPARING':
    case 'READY_FOR_PICK_UP':
      return formatEtaValue(update.estimatedPickUpTime);
    case 'IN_DELIVERY':
      return formatEtaValue(update.estimatedDeliveryTime);
    case 'DELIVERED':
      return normalizeStatus(update.status) === 'DELIVERED' ? 'Completed' : '—';
    default:
      return '—';
  }
};

const buildWorkflowSteps = (
  order: CreateOrderResponse | null | undefined,
  update?: OrderDto | null,
): WorkflowStep[] => {
  const workflow = ensureWorkflow(order);
  const progressedWorkflow = updateWorkflowProgress(
    workflow,
    update?.status ?? order?.status,
  );

  return progressedWorkflow.map((step, index) => {
    const normalizedStep = normalizeStatus(step.step);
    const normalizedStatus = normalizeStatus(step.status);

    let state: WorkflowStep['state'] = 'pending';
    if (step.completed || normalizedStatus === 'COMPLETED') {
      state = 'completed';
    } else if (normalizedStatus === 'IN_PROGRESS' || normalizedStatus === 'ACTIVE') {
      state = 'active';
    } else if (normalizedStep) {
      const currentStatus = normalizeStatus(update?.status ?? order?.status);
      const stepIndex = STATUS_SEQUENCE.indexOf(normalizedStep);
      const statusIndex = currentStatus ? STATUS_SEQUENCE.indexOf(currentStatus) : -1;

      if (statusIndex !== -1 && stepIndex !== -1) {
        if (statusIndex > stepIndex) {
          state = 'completed';
        } else if (statusIndex === stepIndex) {
          state = 'active';
        }
      }
    }

    return {
      key: normalizedStep ?? (step.step ?? `STEP_${index}`),
      title: step.label ?? DEFAULT_WORKFLOW_BLUEPRINT[index]?.label ?? `Step ${index + 1}`,
      description:
        step.description ??
        DEFAULT_WORKFLOW_BLUEPRINT[index]?.description ??
        'We will notify you once this updates.',
      statusText:
        state === 'completed'
          ? 'Completed'
          : state === 'active'
            ? 'In progress'
            : 'Pending',
      etaLabel: formatEtaFromUpdate(normalizedStep, update),
      state,
    } satisfies WorkflowStep;
  });
};

const formatStatusLabel = (status?: string | null) => {
  if (!status) {
    return 'Pending';
  }

  return status
    .toString()
    .toLowerCase()
    .replace(/[\s_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const formatExtrasLabel = (extras?: { name?: string | null }[] | null) => {
  if (!extras?.length) {
    return null;
  }

  const labels = extras
    .map((extra) => extra?.name)
    .filter((name): name is string => Boolean(name));

  if (!labels.length) {
    return null;
  }

  return labels.join(', ');
};

const buildDriverCoordinate = (
  order: CreateOrderResponse | null,
  update: OrderDto | null,
): LatLng => {
  const courierLocation = (update as unknown as { courierLocation?: { lat: number; lng: number } })
    ?.courierLocation;

  if (courierLocation?.lat && courierLocation?.lng) {
    return {
      latitude: courierLocation.lat,
      longitude: courierLocation.lng,
    } satisfies LatLng;
  }

  const orderCourierLocation = (order as unknown as { delivery?: { courier?: { location?: { lat: number; lng: number } } } })
    ?.delivery?.courier?.location;

  if (orderCourierLocation?.lat && orderCourierLocation?.lng) {
    return {
      latitude: orderCourierLocation.lat,
      longitude: orderCourierLocation.lng,
    } satisfies LatLng;
  }

  if (order?.delivery?.location?.lat && order.delivery.location.lng) {
    return {
      latitude: order.delivery.location.lat + (DEFAULT_DRIVER_OFFSET.latitude - DEFAULT_REGION.latitude),
      longitude:
        order.delivery.location.lng + (DEFAULT_DRIVER_OFFSET.longitude - DEFAULT_REGION.longitude),
    } satisfies LatLng;
  }

  return {
    latitude: DEFAULT_DRIVER_OFFSET.latitude,
    longitude: DEFAULT_DRIVER_OFFSET.longitude,
  } satisfies LatLng;
};

const buildDestinationCoordinate = (order: CreateOrderResponse | null): LatLng | null => {
  if (order?.delivery?.location?.lat && order.delivery.location.lng) {
    return {
      latitude: order.delivery.location.lat,
      longitude: order.delivery.location.lng,
    } satisfies LatLng;
  }

  return null;
};



const OrderTrackingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<OrderTrackingRoute>();
  const insets = useSafeAreaInsets();
  const {
    order,
    latestUpdate,
    connectionState,
    activeOrderId,
    beginTrackingOrder,
    hydrateTrackedOrder,
  } = useOrderTracking();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

  const normalizedRouteOrder = useMemo(
    () =>
      route.params?.order
        ? { ...route.params.order, workflow: ensureWorkflow(route.params.order) }
        : null,
    [route.params?.order],
  );

  useEffect(() => {
    if (!normalizedRouteOrder) {
      return;
    }

    if (!activeOrderId || activeOrderId !== normalizedRouteOrder.orderId) {
      beginTrackingOrder(normalizedRouteOrder);
    } else {
      hydrateTrackedOrder(normalizedRouteOrder);
    }
  }, [normalizedRouteOrder, activeOrderId, beginTrackingOrder, hydrateTrackedOrder]);

  const trackingOrder = order ?? normalizedRouteOrder ?? null;
  const displayOrder = order ?? normalizedRouteOrder ?? EMPTY_ORDER;
  const steps = useMemo(
    () => buildWorkflowSteps(displayOrder, latestUpdate),
    [displayOrder, latestUpdate],
  );

  const orderTotal = formatCurrency(displayOrder.payment.total);
  const deliveryArea =
    displayOrder.delivery.savedAddress?.label ??
    displayOrder.delivery.savedAddress?.formattedAddress ??
    'Delivery area';
  const deliveryAddress = displayOrder.delivery.address ?? 'Your delivery address';

  const courierName =
    latestUpdate?.driverName ??
    ((displayOrder as unknown as { delivery?: { courier?: { name?: string } } })
      ?.delivery?.courier?.name ?? 'Assigned courier');
  const courierPhone =
    latestUpdate?.driverPhone ??
    ((displayOrder as unknown as { delivery?: { courier?: { phone?: string } } })
      ?.delivery?.courier?.phone ?? null);
  const courierAvatarUri =
    ((displayOrder as unknown as { delivery?: { courier?: { avatarUrl?: string } } })
      ?.delivery?.courier?.avatarUrl ?? 'https://i.pravatar.cc/96?img=12');
  const courierRatingValue = Number(
    ((displayOrder as unknown as { delivery?: { courier?: { rating?: number } } })
      ?.delivery?.courier?.rating ?? NaN),
  );
  const courierRating = Number.isFinite(courierRatingValue)
    ? courierRatingValue.toFixed(1)
    : '5.0';
  const courierDeliveriesValue = Number(
    ((displayOrder as unknown as { delivery?: { courier?: { totalDeliveries?: number } } })
      ?.delivery?.courier?.totalDeliveries ?? NaN),
  );
  const courierDeliveries = Number.isFinite(courierDeliveriesValue)
    ? courierDeliveriesValue
    : 120;
  const restaurantImageUri =
    (displayOrder.restaurant.imageUrl as string | undefined) ??
    'https://images.unsplash.com/photo-1606755962773-0e7d61a9b1fc?auto=format&fit=crop&w=200&q=80';
  const orderNumberLabel = displayOrder.orderId > 0 ? `#${displayOrder.orderId}` : 'In progress';

  const driverCoordinate = useMemo(
    () => buildDriverCoordinate(trackingOrder, latestUpdate),
    [trackingOrder, latestUpdate],
  );
  const destinationCoordinate = useMemo(
    () => buildDestinationCoordinate(trackingOrder),
    [trackingOrder],
  );

  const mapRegion = useMemo<Region>(
    () => ({
      latitude: driverCoordinate.latitude,
      longitude: driverCoordinate.longitude,
      latitudeDelta: 0.025,
      longitudeDelta: 0.025,
    }),
    [driverCoordinate.latitude, driverCoordinate.longitude],
  );

  const handleGoBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  const handleCallCourier = useCallback(() => {
    if (!courierPhone) {
      return;
    }

    Linking.openURL(`tel:${courierPhone}`).catch((error) =>
      console.warn('Failed to initiate courier call.', error),
    );
  }, [courierPhone]);

  const handleSeeDetails = useCallback(() => {
    if (!trackingOrder) {
      return;
    }
    navigation.navigate('CheckoutOrder', { viewMode: true, order: trackingOrder });
  }, [navigation, trackingOrder]);

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

  const renderHero = (collapsed: boolean) => (
    <View style={collapsed ? styles.mapCollapsed : styles.mapExpanded}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { transform: [{ translateY: mapTranslateY }] },
        ]}
        pointerEvents={collapsed ? 'none' : 'auto'}
      >
        <MapView
          style={StyleSheet.absoluteFill}
          region={mapRegion}
          scrollEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
          zoomEnabled={false}
          showsPointsOfInterest={false}
          showsCompass={false}
        >
          {destinationCoordinate ? (
            <Marker coordinate={destinationCoordinate}>
              <View style={styles.destinationMarker}>
                <MapPin size={16} color={accentColor} />
              </View>
            </Marker>
          ) : null}
          <Marker coordinate={driverCoordinate}>
            <View style={styles.driverMarker}>
              <Bike size={16} color="white" />
            </View>
          </Marker>
        </MapView>
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
        <Text style={styles.stepsTitle}>Order Steps</Text>
        <View style={styles.stepsStatusBadge}>
          <Text style={styles.stepsStatusText}>{formatStatusLabel(displayOrder.status)}</Text>
        </View>
      </View>
      {connectionState !== 'connected' ? (
        <Text style={styles.stepsConnectionText}>
          {connectionState === 'connecting'
            ? 'Connecting to live updates…'
            : connectionState === 'error'
              ? 'Reconnecting to live updates…'
              : 'Waiting for live updates…'}
        </Text>
      ) : null}
      {steps.length ? (
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
                    <Check size={12} color="white" />
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
      ) : (
        <Text style={styles.noStepsText}>
          Tracking information will appear here once the restaurant shares updates.
        </Text>
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
              <Image source={{ uri: restaurantImageUri }} style={styles.summaryRestaurantImage} />
              <View>
                <Text style={styles.summaryTitle}>My Order</Text>
                <Text style={styles.summarySubtitle} numberOfLines={1}>
                  {displayOrder.restaurant.name ?? 'Your restaurant'}
                </Text>
                <Text style={styles.summarySubtitleSecondary} numberOfLines={1}>
                  {deliveryArea}
                </Text>
              </View>
            </View>
            <View style={styles.summaryBadge}>
              <Text style={styles.summaryBadgeText}>{orderNumberLabel}</Text>
            </View>
          </View>

          <View style={styles.summaryAddressRow}>
            <MapPin size={16} color={accentColor} />
            <View style={styles.summaryAddressTexts}>
              <Text style={styles.summaryAddressTitle}>Deliver to</Text>
              <Text style={styles.summaryAddressValue} numberOfLines={2}>
                {deliveryAddress}
              </Text>
            </View>
          </View>

          <View style={styles.summaryItems}>
            {displayOrder.items.length ? (
              displayOrder.items.map((item, index) => {
                const isLast = index === displayOrder.items.length - 1;
                const extrasLabel = formatExtrasLabel(item.extras);
                const instructions = item.specialInstructions?.trim();
                const lineTotal = formatCurrency(item.lineTotal);
                return (
                  <View
                    key={`${item.menuItemId}-${index}`}
                    style={[styles.summaryItemRow, !isLast && styles.summaryItemRowSpacing]}
                  >
                    <View style={styles.summaryItemInfo}>
                      <Text style={styles.summaryItemQuantity}>{item.quantity}x</Text>
                      <View style={styles.summaryItemTexts}>
                        <Text style={styles.summaryItemName} numberOfLines={1}>
                          {item.name}
                        </Text>
                        {extrasLabel ? (
                          <Text style={styles.summaryItemExtras} numberOfLines={1}>
                            {extrasLabel}
                          </Text>
                        ) : null}
                        {instructions ? (
                          <Text style={styles.summaryItemNote} numberOfLines={2}>
                            {instructions}
                          </Text>
                        ) : null}
                      </View>
                    </View>
                    {lineTotal ? <Text style={styles.summaryItemPrice}>{lineTotal}</Text> : null}
                  </View>
                );
              })
            ) : (
              <Text style={styles.summaryEmptyText}>
                Your order items will appear here once the restaurant confirms the menu.
              </Text>
            )}
          </View>

          <View style={styles.summaryFooter}>
            {orderTotal ? <Text style={styles.summaryTotal}>{orderTotal}</Text> : null}
            <TouchableOpacity
              onPress={handleSeeDetails}
              activeOpacity={0.85}
              disabled={!order}
              style={[
                styles.summaryDetailsButton,
                !order && styles.summaryDetailsButtonDisabled,
              ]}
            >
              <Text
                style={[
                  styles.summaryDetailsText,
                  !order && styles.summaryDetailsTextDisabled,
                ]}
              >
                See details
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.courierStickyCard}>
          <View style={styles.courierInfo}>
            <Image source={{ uri: courierAvatarUri }} style={styles.courierAvatar} />
            <View>
              <Text style={styles.courierStickyLabel}>Delivered by</Text>
              <Text style={styles.courierStickyName}>{courierName}</Text>
              <View style={styles.courierStickyRating}>
                <Star size={14} color={accentColor} fill={accentColor} />
                <Text style={styles.courierStickyRatingText}>
                  {courierRating} / 5 ({courierDeliveries})
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.courierStickyActions}>
            <TouchableOpacity
              activeOpacity={courierPhone ? 0.85 : 1}
              disabled={!courierPhone}
              style={[
                styles.courierActionButton,
                !courierPhone && styles.courierActionButtonDisabled,
              ]}
              onPress={handleCallCourier}
            >
              <Phone size={18} color={accentColor} />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              disabled
              style={[
                styles.courierActionButton,
                styles.courierActionButtonSpacing,
                styles.courierActionButtonDisabled,
              ]}
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
  bannerContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 24,
  },
  bannerRibbon: {
    backgroundColor: accentColor,
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  bannerLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  bannerLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  bannerTexts: {
    marginLeft: 10,
    flex: 1,
  },
  bannerLocation: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  bannerAddress: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    marginTop: 2,
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
  destinationMarker: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: accentColor,
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
    backgroundColor: accentColor,
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
  stepsStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
  },
  stepsStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: accentColor,
  },
  stepsConnectionText: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 16,
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
  noStepsText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: '#94A3B8',
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
  summaryTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: textPrimary,
  },
  summarySubtitle: {
    fontSize: 12,
    color: textSecondary,
    fontWeight: '500',
  },
  summarySubtitleSecondary: {
    fontSize: 11,
    color: '#A0AEC0',
    marginTop: 2,
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
  summaryAddressRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  summaryAddressTexts: {
    flex: 1,
    marginLeft: 10,
  },
  summaryAddressTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: textSecondary,
    textTransform: 'uppercase',
  },
  summaryAddressValue: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: textPrimary,
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
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  summaryItemQuantity: {
    fontSize: 11,
    fontWeight: '600',
    color: accentColor,
    marginRight: 8,
    marginTop: 2,
  },
  summaryItemTexts: {
    flex: 1,
  },
  summaryItemName: {
    fontSize: 12,
    fontWeight: '600',
    color: textPrimary,
  },
  summaryItemExtras: {
    marginTop: 4,
    fontSize: 11,
    color: textSecondary,
  },
  summaryItemNote: {
    marginTop: 2,
    fontSize: 11,
    color: '#A0AEC0',
  },
  summaryItemPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: textPrimary,
    marginLeft: 12,
  },
  summaryEmptyText: {
    fontSize: 12,
    color: '#94A3B8',
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
  summaryDetailsTextDisabled: {
    color: accentColor,
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
  courierActionButtonDisabled: {
    backgroundColor: '#E2E8F0',
  },
});
