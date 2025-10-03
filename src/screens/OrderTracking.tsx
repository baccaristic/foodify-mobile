import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Image,
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

import type { CreateOrderResponse, MonetaryAmount } from '~/interfaces/Order';
const HEADER_MAX_HEIGHT = 320;
const HEADER_MIN_HEIGHT = 72;
const COLLAPSE_THRESHOLD = 80;

const accentColor = '#D83A2E';
const softBackground = '#F5F6FA';
const softSurface = '#FFFFFF';
const textPrimary = '#0F172A';
const textSecondary = '#6B7280';
const borderColor = '#F0F1F5';

const DEFAULT_REGION: Region = {
  latitude: 36.8065,
  longitude: 10.1815,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

const MOCK_DRIVER_COORDINATE: LatLng = {
  latitude: DEFAULT_REGION.latitude - 0.005,
  longitude: DEFAULT_REGION.longitude + 0.012,
};

const MOCK_ORDER: CreateOrderResponse = {
  orderId: 'FO-2024-1834',
  status: 'READY_FOR_PICKUP',
  restaurant: {
    name: 'Tacos XL',
  },
  items: [
    {
      quantity: 2,
      menuItem: {
        id: 'item-1',
        name: 'Crispy Chicken Wrap',
      },
    },
    {
      quantity: 1,
      menuItem: {
        id: 'item-2',
        name: 'Loaded Fries',
      },
    },
  ],
  payment: {
    total: '28.500',
  },
  delivery: {
    address: '221 Market Street, Downtown, San Francisco, CA',
    savedAddress: {
      label: 'San Francisco Bay Area',
    },
    courier: {
      name: 'Jaafar',
      rating: 4.9,
      totalDeliveries: 152,
    },
    location: {
      lat: DEFAULT_REGION.latitude + 0.01,
      lng: DEFAULT_REGION.longitude + 0.008,
    },
  },
  workflow: [
    {
      step: 'ACCEPTED',
      label: 'Accepted by the Restaurant',
      description: 'Your order is being prepared fresh & hot.',
      status: 'COMPLETED',
      completed: true,
    },
    {
      step: 'READY_FOR_PICKUP',
      label: 'Ready to Pickup',
      description: 'The courier is heading to the restaurant to pick up your order.',
      status: 'IN_PROGRESS',
      completed: false,
    },
    {
      step: 'ON_THE_WAY',
      label: 'On the way',
      description: 'The courier is as fast as possible heading to you.',
      status: 'PENDING',
      completed: false,
    },
    {
      step: 'FOOD_IS_HERE',
      label: 'Food is here',
      description: 'The courier is a few meters away.',
      status: 'PENDING',
      completed: false,
    },
    {
      step: 'DELIVERED',
      label: 'Delivered',
      description: 'Enjoy your meal! The order has been delivered.',
      status: 'PENDING',
      completed: false,
    },
  ],
};

type OrderTrackingRoute = RouteProp<
  { OrderTracking: { order?: CreateOrderResponse | null } },
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

const buildWorkflowSteps = (order: CreateOrderResponse | null | undefined): WorkflowStep[] => {
  const fallbackSteps: WorkflowStep[] = MOCK_ORDER.workflow!.map((step, index) => {
    const state = index === 0 ? 'completed' : index === 1 ? 'active' : 'pending';
    return {
      key: step.step ?? `STEP_${index}`,
      title: step.label ?? `Step ${index + 1}`,
      description: step.description ?? 'We will notify you once this updates.',
      statusText:
        index === 0 ? 'Completed' : index === 1 ? 'Preparing' : 'Pending',
      etaLabel: index === 0 ? '4 m 34s' : index === 1 ? '24s' : '0s',
      state,
    } satisfies WorkflowStep;
  });

  if (!order?.workflow?.length) {
    return fallbackSteps;
  }

  return order.workflow.map((step, index) => {
    const status = String(step.status ?? '').toUpperCase();
    let state: WorkflowStep['state'] = 'pending';
    if (status === 'COMPLETED' || step.completed) {
      state = 'completed';
    } else if (status === 'IN_PROGRESS' || status === 'ACTIVE') {
      state = 'active';
    }

    return {
      key: step.step ?? `STEP_${index}`,
      title: step.label ?? `Step ${index + 1}`,
      description: step.description ?? 'We will notify you once this updates.',
      statusText:
        state === 'completed' ? 'Completed' : state === 'active' ? 'Preparing' : 'Pending',
      etaLabel:
        index === 0 ? '4 m 34s' : index === 1 ? '24s' : index === 2 ? '0s' : '1m 20s',
      state,
    } satisfies WorkflowStep;
  });
};

const OrderTrackingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<OrderTrackingRoute>();
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [isHeaderCollapsed, setIsHeaderCollapsed] = useState(false);

  const order = route.params?.order ?? MOCK_ORDER;

  const steps = useMemo(() => buildWorkflowSteps(order), [order]);

  const orderTotal = formatCurrency(order?.payment?.total);
  const deliveryArea = order?.delivery?.savedAddress?.label ?? 'San Francisco Bay Area';
  const deliveryAddress = order?.delivery?.address ?? 'Your delivery address';
  const parsedCourierRating = Number(order?.delivery?.courier?.rating ?? NaN);
  const courierRating = Number.isFinite(parsedCourierRating)
    ? parsedCourierRating.toFixed(1)
    : '5.0';
  const courierDeliveriesValue = Number(order?.delivery?.courier?.totalDeliveries ?? NaN);
  const courierDeliveries = Number.isFinite(courierDeliveriesValue)
    ? courierDeliveriesValue
    : 120;
  const courierName = order?.delivery?.courier?.name ?? 'Assigned courier';
  const courierAvatarUri =
    (order as any)?.delivery?.courier?.avatarUrl ?? 'https://i.pravatar.cc/96?img=12';
  const restaurantAvatarUri =
    (order as any)?.restaurant?.imageUrl ??
    'https://images.unsplash.com/photo-1606755962773-0e7d61a9b1fc?auto=format&fit=crop&w=200&q=80';

  const driverCoordinate = useMemo<LatLng>(() => {
    const courierLocation = (order as any)?.delivery?.courier?.location;
    if (courierLocation?.lat && courierLocation?.lng) {
      return {
        latitude: courierLocation.lat,
        longitude: courierLocation.lng,
      } satisfies LatLng;
    }

    if (order?.delivery?.location?.lat && order.delivery.location.lng) {
      return {
        latitude: order.delivery.location.lat - 0.006,
        longitude: order.delivery.location.lng + 0.004,
      } satisfies LatLng;
    }

    return MOCK_DRIVER_COORDINATE;
  }, [order]);

  const mapRegion = useMemo<Region>(
    () => ({
      latitude: driverCoordinate.latitude,
      longitude: driverCoordinate.longitude,
      latitudeDelta: 0.025,
      longitudeDelta: 0.025,
    }),
    [driverCoordinate.latitude, driverCoordinate.longitude],
  );

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleCallCourier = () => {};

  const handleSeeDetails = () => {
    navigation.navigate('CheckoutOrder', { viewMode: true, order });
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

  const bannerOpacity = scrollY.interpolate({
    inputRange: [0, headerScrollDistance * 0.6, headerScrollDistance],
    outputRange: [1, 0.4, 0],
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

      {!collapsed ? (
        <Animated.View style={[styles.bannerContainer, { opacity: bannerOpacity }]}>
          <View style={styles.bannerRibbon}>
            <Text style={styles.bannerLabel}>Delivering to</Text>
            <View style={styles.bannerLocationRow}>
              <MapPin size={16} color="white" />
              <View style={styles.bannerTexts}>
                <Text style={styles.bannerLocation}>{deliveryArea}</Text>
                <Text style={styles.bannerAddress} numberOfLines={1}>
                  {deliveryAddress}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      ) : null}
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
        <View style={styles.stepsTimer}>
          <Clock size={18} color={accentColor} />
          <Text style={styles.stepsTimerText}>4 m 34s</Text>
        </View>
      </View>
      {steps.map((step, index) => {
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
              {(isCompleted || isActive) && (
                <View
                  style={[
                    styles.stepStatusBadge,
                    isCompleted && styles.stepStatusBadgeCompleted,
                    isActive && styles.stepStatusBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepStatusLabel,
                      (isCompleted || isActive) && styles.stepStatusLabelContrast,
                    ]}
                  >
                    {step.statusText}
                  </Text>
                </View>
              )}
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
      })}
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
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 320 }]}
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
              <Image
                source={{ uri: restaurantAvatarUri }}
                style={styles.summaryRestaurantImage}
              />
              <Text style={styles.summaryTitle}>My Order</Text>
            </View>
            <View style={styles.summaryBadge}>
              <Text style={styles.summaryBadgeText}>
                {order?.restaurant?.name ?? 'Your restaurant'}
              </Text>
            </View>
          </View>

          <View style={styles.summaryItems}>
            {order?.items?.map((item, index) => {
              const isLast = index === (order?.items?.length ?? 0) - 1;
              return (
                <View
                  key={`${item.menuItem?.id ?? index}-${index}`}
                  style={[styles.summaryItemRow, !isLast && styles.summaryItemRowSpacing]}
                >
                  <Text style={styles.summaryItemQuantity}>{item.quantity ?? 1}x</Text>
                  <Text style={styles.summaryItemName} numberOfLines={1}>
                    {item.menuItem?.name ?? item.name ?? 'Menu item'}
                  </Text>
                </View>
              );
            })}
          </View>

          <View style={styles.summaryFooter}>
            {orderTotal ? <Text style={styles.summaryTotal}>{orderTotal}</Text> : null}
            <TouchableOpacity
              onPress={handleSeeDetails}
              activeOpacity={0.85}
              style={styles.summaryDetailsButton}
            >
              <Text style={styles.summaryDetailsText}>See details</Text>
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
  stepsTimer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepsTimerText: {
    marginLeft: 8,
    color: accentColor,
    fontSize: 13,
    fontWeight: '700',
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
    top: -24,
    bottom: 24,
  },
  stepConnectorBottom: {
    top: 24,
    bottom: -24,
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
  stepStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: '#F1F5F9',
  },
  stepStatusBadgeCompleted: {
    backgroundColor: '#DCF0EA',
  },
  stepStatusBadgeActive: {
    backgroundColor: accentColor,
  },
  stepStatusLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: accentColor,
  },
  stepStatusLabelContrast: {
    color: 'white',
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
