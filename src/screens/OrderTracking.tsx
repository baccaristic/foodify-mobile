import React, { useEffect, useMemo, useRef } from 'react';
import type { ViewStyle } from 'react-native';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, type MapStyleElement, type Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  NavigationProp,
  ParamListBase,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { ArrowLeft, Bike, CheckCircle2, Clock, MapPin, Phone } from 'lucide-react-native';

import type { CreateOrderResponse, MonetaryAmount } from '~/interfaces/Order';
import MainLayout from '~/layouts/MainLayout';

const accentColor = '#D83A2E';
const accentMuted = '#FBE5E1';
const heroText = '#0F172A';
const softSurface = '#FFFFFF';
const softBackground = '#F5F6FA';
const secondaryText = '#6B7280';

const mapTheme: MapStyleElement[] = [
  { elementType: 'geometry', stylers: [{ color: '#E7ECF5' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#2E3A4A' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#FFFFFF' }] },
  {
    featureType: 'poi',
    elementType: 'labels.text',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#FFFFFF' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#D8DEE9' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#CBD5E1' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#C5DAF7' }],
  },
];

type LatLng = { latitude: number; longitude: number };

const DEFAULT_REGION: Region = {
  latitude: 36.8065,
  longitude: 10.1815,
  latitudeDelta: 0.04,
  longitudeDelta: 0.04,
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const parseMonetaryAmount = (value: MonetaryAmount | null | undefined) => {
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

const formatCurrency = (value: number) => `${value.toFixed(3)} dt`;

const formatServerMoney = (value: MonetaryAmount | null | undefined) => formatCurrency(parseMonetaryAmount(value));

const formatStatusLabel = (status?: string | null) => {
  if (!status) {
    return 'Pending';
  }

  const normalized = status.replace(/_/g, ' ');
  return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
};

type OrderTrackingRoute = RouteProp<{ OrderTracking: { order?: CreateOrderResponse | null } }, 'OrderTracking'>;

interface TrackingStepBase {
  key: string;
  title: string;
  description: string;
}

interface TrackingStep extends TrackingStepBase {
  completed: boolean;
  statusLabel?: string;
}

const DEFAULT_WORKFLOW_BASE: TrackingStepBase[] = [
  {
    key: 'CONFIRMED',
    title: 'Order confirmed',
    description: 'We let the restaurant know about your order.',
  },
  {
    key: 'PREPARING',
    title: 'Preparing your dishes',
    description: 'Chefs are cooking your meal with fresh ingredients.',
  },
  {
    key: 'READY_FOR_PICKUP',
    title: 'Courier is picking up',
    description: 'Your courier is heading to the restaurant.',
  },
  {
    key: 'IN_TRANSIT',
    title: 'On the way to you',
    description: 'Keep an eye on the door, your order is nearby.',
  },
  {
    key: 'DELIVERED',
    title: 'Delivered',
    description: 'Enjoy your meal and bon appétit! 🍽️',
  },
];

const DEFAULT_STATUS_INDEX: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 0,
  PREPARING: 1,
  READY_FOR_PICKUP: 2,
  IN_TRANSIT: 3,
  DELIVERED: 4,
};

const OrderTrackingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<OrderTrackingRoute>();
  const order = route.params?.order ?? null;
  const insets = useSafeAreaInsets();

  const { steps, activeIndex } = useMemo(() => {
    if (order?.workflow?.length) {
      const preparedSteps: TrackingStep[] = order.workflow.map((step, index) => {
        const keyCandidate =
          typeof step.step === 'string'
            ? step.step.toUpperCase()
            : typeof step.label === 'string'
            ? step.label.toUpperCase().replace(/\s+/g, '_')
            : `STEP_${index + 1}`;
        const title =
          (typeof step.label === 'string' && step.label.length > 0
            ? step.label
            : typeof step.step === 'string' && step.step.length > 0
            ? formatStatusLabel(step.step)
            : `Step ${index + 1}`) ?? `Step ${index + 1}`;
        const statusLabel = typeof step.status === 'string' ? formatStatusLabel(step.status) : undefined;
        const description =
          typeof step.description === 'string' && step.description.length > 0
            ? step.description
            : statusLabel ?? 'We will keep you posted as soon as this updates.';

        return {
          key: keyCandidate,
          title,
          description,
          statusLabel,
          completed: Boolean(step.completed),
        } satisfies TrackingStep;
      });

      const inProgressIndex = order.workflow.findIndex((step) => {
        const status = typeof step.status === 'string' ? step.status.toUpperCase() : '';
        return status === 'IN_PROGRESS' || status === 'ACTIVE' || status === 'ONGOING';
      });

      const lastCompletedIndex = order.workflow.reduce((acc, step, index) => (step.completed ? index : acc), -1);
      const resolvedIndex = clamp(
        inProgressIndex >= 0 ? inProgressIndex : lastCompletedIndex + 1,
        0,
        preparedSteps.length - 1,
      );

      return { steps: preparedSteps, activeIndex: resolvedIndex };
    }

    const normalizedStatus = typeof order?.status === 'string' ? order.status.toUpperCase() : 'PENDING';
    const defaultIndex = DEFAULT_STATUS_INDEX[normalizedStatus] ?? 0;
    const clampedIndex = clamp(defaultIndex, 0, DEFAULT_WORKFLOW_BASE.length - 1);
    const isDelivered = normalizedStatus === 'DELIVERED';

    const preparedSteps: TrackingStep[] = DEFAULT_WORKFLOW_BASE.map((step, index) => {
      const isCurrent = index === clampedIndex;
      const isCompleted = index < clampedIndex || (isDelivered && isCurrent);
      const statusLabel = isCompleted ? 'Completed' : isCurrent ? 'In progress' : 'Pending';

      return {
        ...step,
        completed: isCompleted,
        statusLabel,
      } satisfies TrackingStep;
    });

    return { steps: preparedSteps, activeIndex: clampedIndex };
  }, [order]);

  const activeStep = steps[activeIndex] ?? steps[0];
  const safeProgress = steps.length > 1 ? clamp(activeIndex / (steps.length - 1), 0, 1) : 1;

  const deliveryLocation = order?.delivery?.location;

  const mapRegion = useMemo<Region>(() => {
    if (deliveryLocation?.lat && deliveryLocation?.lng) {
      return {
        latitude: deliveryLocation.lat,
        longitude: deliveryLocation.lng,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      } satisfies Region;
    }

    return DEFAULT_REGION;
  }, [deliveryLocation]);

  const destinationCoordinate = useMemo<LatLng>(
    () => ({ latitude: mapRegion.latitude, longitude: mapRegion.longitude }),
    [mapRegion],
  );

  const routeCoordinates = useMemo<LatLng[]>(() => {
    const { latitude, longitude } = mapRegion;
    return [
      { latitude: latitude - 0.018, longitude: longitude - 0.015 },
      { latitude: latitude - 0.012, longitude: longitude - 0.008 },
      { latitude: latitude - 0.006, longitude: longitude - 0.003 },
      { latitude: latitude - 0.001, longitude: longitude + 0.002 },
      { latitude: latitude + 0.004, longitude: longitude + 0.006 },
      { latitude: latitude + 0.008, longitude: longitude + 0.01 },
    ];
  }, [mapRegion]);

  const driverCoordinate = useMemo<LatLng>(() => {
    if (routeCoordinates.length < 2) {
      return destinationCoordinate;
    }

    const totalSegments = routeCoordinates.length - 1;
    const normalizedProgress = clamp(safeProgress, 0, 0.9999) * totalSegments;
    const segmentIndex = Math.floor(normalizedProgress);
    const segmentProgress = normalizedProgress - segmentIndex;
    const start = routeCoordinates[segmentIndex];
    const end = routeCoordinates[Math.min(segmentIndex + 1, routeCoordinates.length - 1)];

    return {
      latitude: start.latitude + (end.latitude - start.latitude) * segmentProgress,
      longitude: start.longitude + (end.longitude - start.longitude) * segmentProgress,
    } satisfies LatLng;
  }, [destinationCoordinate, routeCoordinates, safeProgress]);

  const pulseAnim = useRef(new Animated.Value(0)).current;
  const timelineAnimations = useMemo(() => steps.map(() => new Animated.Value(0)), [steps]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => {
      animation.stop();
    };
  }, [pulseAnim]);

  useEffect(() => {
    timelineAnimations.forEach((value) => value.setValue(0));
    const animations = timelineAnimations.map((value, index) =>
      Animated.timing(value, {
        toValue: 1,
        duration: 360,
        delay: index * 100,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    );
    const controller = Animated.stagger(100, animations);
    controller.start();

    return () => {
      controller.stop();
    };
  }, [timelineAnimations]);

  const pulseScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] });
  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.4, 0.15, 0] });

  const restaurantName = order?.restaurant?.name ?? 'Your restaurant';
  const orderIdLabel = order ? `#${order.orderId}` : 'Live order';
  const deliveryAddress = order?.delivery?.address ?? 'Your saved address';
  const addressLabel = order?.delivery?.savedAddress?.label ?? 'Delivery address';
  const trimmedAddress = deliveryAddress.length > 120 ? `${deliveryAddress.slice(0, 117)}...` : deliveryAddress;
  const deliveryArea = useMemo(() => {
    if (addressLabel && addressLabel !== 'Delivery address') {
      return addressLabel;
    }
    const [firstPart] = deliveryAddress.split(',');
    return firstPart.trim().length ? firstPart.trim() : 'Your area';
  }, [addressLabel, deliveryAddress]);

  const estimatedWindow = useMemo(() => {
    if (!order) {
      return '35-45 min';
    }

    const itemCount = order.items?.length ?? 0;
    const base = 28 + Math.min(itemCount * 4, 12);
    const start = Math.max(18, base - 6);
    const end = base + 6;
    return `${start}-${end} min`;
  }, [order]);

  const orderTotal = order ? formatServerMoney(order.payment?.total) : undefined;
  const displayedItems = useMemo(() => (order?.items ?? []).slice(0, 3), [order?.items]);
  const remainingItems = Math.max(0, (order?.items?.length ?? 0) - displayedItems.length);

  const handleGoBack = () => {
    navigation.goBack();
  };

  const handleCallCourier = () => {};

  const handleSeeDetails = () => {
    if (!order) {
      return;
    }
    navigation.navigate('CheckoutOrder', { viewMode: true, order });
  };

  const header = (
    <View style={styles.heroContainer}>
      <MapView
        style={StyleSheet.absoluteFill}
        region={mapRegion}
        scrollEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
        zoomEnabled={false}
        customMapStyle={mapTheme}
        showsBuildings={false}
        showsCompass={false}
        showsPointsOfInterest={false}
      >
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="rgba(216,58,46,0.85)"
          strokeWidth={5}
          lineCap="round"
          lineJoin="round"
        />
        <Marker coordinate={driverCoordinate} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={styles.mapDriverMarkerContainer}>
            <Animated.View
              style={[
                styles.mapDriverPulse,
                { transform: [{ scale: pulseScale }], opacity: pulseOpacity },
              ]}
            />
            <View style={styles.mapDriverMarker}>
              <Bike size={18} color="white" />
            </View>
          </View>
        </Marker>
        <Marker coordinate={destinationCoordinate} anchor={{ x: 0.5, y: 0.95 }}>
          <View style={styles.destinationMarker}>
            <View style={styles.destinationDot} />
          </View>
        </Marker>
      </MapView>

      <LinearGradient
        colors={['rgba(11,16,28,0.72)', 'rgba(11,16,28,0.32)', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={[styles.heroContent, { paddingTop: insets.top + 12 }]}>
        <View style={styles.heroTopRow}>
          <TouchableOpacity onPress={handleGoBack} activeOpacity={0.85} style={styles.heroIconButton}>
            <ArrowLeft color="white" size={22} />
          </TouchableOpacity>
          <View style={styles.heroTitleBlock}>
            <Text allowFontScaling={false} style={styles.heroEyebrow} numberOfLines={1}>
              {orderIdLabel}
            </Text>
            <Text allowFontScaling={false} style={styles.heroTitle} numberOfLines={2}>
              {activeStep?.title ?? 'Order in progress'}
            </Text>
          </View>
          <TouchableOpacity onPress={handleCallCourier} activeOpacity={0.85} style={styles.heroIconButton}>
            <Phone color="white" size={20} />
          </TouchableOpacity>
        </View>

        <View style={styles.heroInfoCard}>
          <View style={styles.heroInfoRow}>
            <View style={styles.heroEtaPill}>
              <Clock size={16} color={accentColor} />
              <Text allowFontScaling={false} style={styles.heroEtaText}>
                {estimatedWindow}
              </Text>
            </View>
            <View style={styles.heroLocationRow}>
              <MapPin size={16} color={accentColor} />
              <Text allowFontScaling={false} style={styles.heroLocationText} numberOfLines={1}>
                {deliveryArea}
              </Text>
            </View>
          </View>
          <Text allowFontScaling={false} style={styles.heroDescription}>
            {activeStep?.description ?? 'We are keeping an eye on your delivery.'}
          </Text>
        </View>
      </View>
    </View>
  );

  const collapsedHeader = (
    <LinearGradient colors={[accentColor, '#F0644B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.collapsedHeader}>
      <View style={[styles.collapsedContent, { paddingTop: insets.top + 6 }]}>
        <TouchableOpacity onPress={handleGoBack} activeOpacity={0.85} style={styles.collapsedIconButton}>
          <ArrowLeft color="white" size={20} />
        </TouchableOpacity>
        <View style={styles.collapsedTexts}>
          <Text allowFontScaling={false} style={styles.collapsedOrder} numberOfLines={1}>
            {orderIdLabel}
          </Text>
          <Text allowFontScaling={false} style={styles.collapsedTitle} numberOfLines={1}>
            {activeStep?.title ?? 'Order in progress'}
          </Text>
          <Text allowFontScaling={false} style={styles.collapsedMeta} numberOfLines={1}>
            ETA {estimatedWindow} • {activeStep?.statusLabel ?? 'In progress'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleCallCourier} activeOpacity={0.9} style={styles.collapsedCallButton}>
          <Phone color={accentColor} size={18} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );

  const mainContent = (
    <View style={styles.sheetContainer}>
      <View style={styles.sheetHandle} />

      <View style={styles.statusCard}>
        <View style={styles.statusHeaderRow}>
          <View>
            <Text allowFontScaling={false} style={styles.statusEyebrow}>
              Current status
            </Text>
            <Text allowFontScaling={false} style={styles.statusTitle}>
              {activeStep?.title ?? 'Order in progress'}
            </Text>
          </View>
          <View style={styles.statusEtaChip}>
            <Clock size={16} color={accentColor} />
            <Text allowFontScaling={false} style={styles.statusEtaText}>
              {estimatedWindow}
            </Text>
          </View>
        </View>
        <Text allowFontScaling={false} style={styles.statusDescription}>
          {activeStep?.description ?? 'We will notify you as soon as something changes.'}
        </Text>
      </View>

      <View style={[styles.timelineCard, styles.sectionSpacing]}>
        <Text allowFontScaling={false} style={styles.timelineTitle}>
          Delivery progress
        </Text>
        {steps.map((step, index) => {
          const isActive = index === activeIndex;
          const isCompleted = index < activeIndex || (steps.length - 1 === index && step.completed);
          const isLast = index === steps.length - 1;
          const animation = timelineAnimations[index];
          const animatedStyle: Animated.WithAnimatedObject<ViewStyle> | undefined = animation
            ? {
                opacity: animation,
                transform: [
                  {
                    translateY: animation.interpolate({ inputRange: [0, 1], outputRange: [16, 0] }),
                  },
                ],
              }
            : undefined;

          return (
            <Animated.View
              key={`${step.key}-${index}`}
              style={[
                styles.timelineRow,
                isLast && styles.timelineRowLast,
                animatedStyle,
              ]}
            >
              <View style={styles.timelineIndicator}>
                <View
                  style={[
                    styles.timelineDot,
                    isCompleted && styles.timelineDotCompleted,
                    isActive && !isCompleted && styles.timelineDotActive,
                  ]}
                >
                  {isCompleted ? <CheckCircle2 size={14} color="white" /> : null}
                </View>
                {!isLast ? (
                  <View
                    style={[
                      styles.timelineConnector,
                      (isCompleted || isActive) && styles.timelineConnectorActive,
                    ]}
                  />
                ) : null}
              </View>
              <View style={styles.timelineContent}>
                <Text allowFontScaling={false} style={styles.timelineStepTitle}>
                  {step.title}
                </Text>
                <Text allowFontScaling={false} style={styles.timelineStepDescription}>
                  {step.description}
                </Text>
                {step.statusLabel ? (
                  <Text allowFontScaling={false} style={styles.timelineStepLabel}>
                    {step.statusLabel}
                  </Text>
                ) : null}
              </View>
            </Animated.View>
          );
        })}
      </View>

      <View style={[styles.courierCard, styles.sectionSpacing]}>
        <View style={styles.courierBadge}>
          <Bike size={22} color={accentColor} />
        </View>
        <View style={styles.courierInfo}>
          <Text allowFontScaling={false} style={styles.courierLabel}>
            Courier
          </Text>
          <Text allowFontScaling={false} style={styles.courierName} numberOfLines={1}>
            {order?.delivery?.courier?.name ?? 'Assigned courier'}
          </Text>
          <Text allowFontScaling={false} style={styles.courierStatus} numberOfLines={1}>
            {activeStep?.statusLabel ?? 'In progress'}
          </Text>
        </View>
        <TouchableOpacity onPress={handleCallCourier} activeOpacity={0.9} style={styles.courierCallButton}>
          <Phone size={18} color="white" />
          <Text allowFontScaling={false} style={styles.courierCallLabel}>
            Call
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.destinationCard, styles.sectionSpacing]}>
        <View style={styles.destinationHeader}>
          <MapPin size={18} color={accentColor} />
          <Text allowFontScaling={false} style={styles.destinationTitle}>
            Delivering to
          </Text>
        </View>
        <Text allowFontScaling={false} style={styles.destinationAddress}>
          {trimmedAddress}
        </Text>
      </View>

      <View style={[styles.orderCard, styles.sectionSpacing]}>
        <View style={styles.orderHeader}>
          <View>
            <Text allowFontScaling={false} style={styles.orderTitle}>
              Order summary
            </Text>
            <Text allowFontScaling={false} style={styles.orderSubtitle}>
              {restaurantName}
            </Text>
          </View>
          {orderTotal ? (
            <Text allowFontScaling={false} style={styles.orderTotal}>
              {orderTotal}
            </Text>
          ) : null}
        </View>

        {displayedItems.length > 0 ? (
          <View style={styles.orderItems}>
            {displayedItems.map((item, index) => (
              <View
                key={`${item.menuItem?.id ?? item.name ?? index}-${index}`}
                style={[
                  styles.orderItemRow,
                  index === displayedItems.length - 1 && styles.orderItemRowLast,
                ]}
              >
                <Text allowFontScaling={false} style={styles.orderItemQuantity}>
                  {item.quantity ?? 1}x
                </Text>
                <Text allowFontScaling={false} style={styles.orderItemName} numberOfLines={1}>
                  {item.menuItem?.name ?? item.name ?? 'Menu item'}
                </Text>
              </View>
            ))}
            {remainingItems > 0 ? (
              <Text allowFontScaling={false} style={styles.orderMoreLabel}>
                +{remainingItems} more item{remainingItems > 1 ? 's' : ''}
              </Text>
            ) : null}
          </View>
        ) : (
          <Text allowFontScaling={false} style={styles.emptyItemsText}>
            Your order details will appear here once confirmed.
          </Text>
        )}

        <TouchableOpacity onPress={handleSeeDetails} activeOpacity={0.9} style={styles.orderDetailsButton}>
          <Text allowFontScaling={false} style={styles.orderDetailsLabel}>
            See details
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      <MainLayout
        showFooter={false}
        customHeader={header}
        collapsedHeader={collapsedHeader}
        mainContent={mainContent}
        headerMaxHeight={360}
        headerMinHeight={120}
        enableHeaderCollapse
        enforceResponsiveHeaderSize={false}
      />
    </View>
  );
};

export default OrderTrackingScreen;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: softBackground,
  },
  heroContainer: {
    flex: 1,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
  },
  heroContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroIconButton: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitleBlock: {
    flex: 1,
    marginHorizontal: 16,
  },
  heroEyebrow: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 4,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
  },
  heroInfoCard: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 22,
    padding: 18,
  },
  heroInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroEtaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: accentMuted,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  heroEtaText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: accentColor,
  },
  heroLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(216,58,46,0.1)',
    borderRadius: 999,
  },
  heroLocationText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: heroText,
  },
  heroDescription: {
    marginTop: 16,
    fontSize: 14,
    lineHeight: 20,
    color: heroText,
    fontWeight: '500',
  },
  mapDriverMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapDriverPulse: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(216,58,46,0.25)',
  },
  mapDriverMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: accentColor,
    shadowColor: accentColor,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  destinationMarker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: softSurface,
    backgroundColor: accentColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destinationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: softSurface,
  },
  sheetContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  sectionSpacing: {
    marginTop: 18,
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#D1D5DB',
    marginBottom: 4,
  },
  statusCard: {
    backgroundColor: softSurface,
    borderRadius: 22,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  statusHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statusEyebrow: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: accentColor,
    fontWeight: '600',
  },
  statusTitle: {
    marginTop: 6,
    fontSize: 20,
    fontWeight: '700',
    color: heroText,
  },
  statusEtaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: accentMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusEtaText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: accentColor,
  },
  statusDescription: {
    marginTop: 14,
    fontSize: 14,
    lineHeight: 20,
    color: secondaryText,
  },
  timelineCard: {
    backgroundColor: softSurface,
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: heroText,
    marginBottom: 12,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timelineRowLast: {
    marginBottom: 0,
  },
  timelineIndicator: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotActive: {
    backgroundColor: 'rgba(216,58,46,0.15)',
    borderWidth: 2,
    borderColor: accentColor,
  },
  timelineDotCompleted: {
    backgroundColor: accentColor,
  },
  timelineConnector: {
    flex: 1,
    width: 2,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
  },
  timelineConnectorActive: {
    backgroundColor: accentColor,
  },
  timelineContent: {
    flex: 1,
  },
  timelineStepTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: heroText,
  },
  timelineStepDescription: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: secondaryText,
  },
  timelineStepLabel: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: accentColor,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  courierCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: softSurface,
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  courierBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courierInfo: {
    flex: 1,
    marginHorizontal: 16,
  },
  courierLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: secondaryText,
    fontWeight: '600',
  },
  courierName: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '700',
    color: heroText,
  },
  courierStatus: {
    marginTop: 4,
    fontSize: 13,
    color: secondaryText,
  },
  courierCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: accentColor,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  courierCallLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginLeft: 8,
  },
  destinationCard: {
    backgroundColor: softSurface,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  destinationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  destinationTitle: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '700',
    color: heroText,
  },
  destinationAddress: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
    color: secondaryText,
  },
  orderCard: {
    backgroundColor: softSurface,
    borderRadius: 22,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: heroText,
  },
  orderSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: secondaryText,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: accentColor,
  },
  orderItems: {
    marginTop: 16,
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderItemRowLast: {
    marginBottom: 0,
  },
  orderItemQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: accentColor,
    marginRight: 10,
  },
  orderItemName: {
    flex: 1,
    fontSize: 14,
    color: heroText,
    fontWeight: '500',
  },
  orderMoreLabel: {
    marginTop: 4,
    fontSize: 13,
    color: secondaryText,
  },
  emptyItemsText: {
    marginTop: 16,
    fontSize: 14,
    color: secondaryText,
  },
  orderDetailsButton: {
    marginTop: 20,
    backgroundColor: heroText,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  orderDetailsLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  collapsedHeader: {
    flex: 1,
    width: '100%',
    height: '100%',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  collapsedContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collapsedIconButton: {
    height: 40,
    width: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  collapsedTexts: {
    flex: 1,
    marginHorizontal: 14,
  },
  collapsedOrder: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.72)',
  },
  collapsedTitle: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  collapsedMeta: {
    marginTop: 4,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
  },
  collapsedCallButton: {
    height: 40,
    width: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: softSurface,
  },
});
