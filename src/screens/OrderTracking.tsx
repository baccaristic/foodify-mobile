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
const heroDark = '#1A253A';
const surfaceColor = '#FFFFFF';
const softBackground = '#F5F6FA';
const headingText = '#1F2937';
const mutedText = '#6B7280';

const mapTheme: MapStyleElement[] = [
  { elementType: 'geometry', stylers: [{ color: '#E8ECF4' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#425466' }] },
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
    stylers: [{ color: '#C4DAF7' }],
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
        duration: 380,
        delay: index * 90,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    );
    const controller = Animated.stagger(90, animations);
    controller.start();

    return () => {
      controller.stop();
    };
  }, [timelineAnimations]);

  const pulseScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] });
  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.3, 0.15, 0] });

  const restaurantName = order?.restaurant?.name ?? 'Your restaurant';
  const orderIdLabel = order ? `#${order.orderId}` : 'Live order';
  const deliveryAddress = order?.delivery?.address ?? 'Your saved address';
  const addressLabel = order?.delivery?.savedAddress?.label ?? 'Delivery address';
  const trimmedAddress = deliveryAddress.length > 90 ? `${deliveryAddress.slice(0, 87)}...` : deliveryAddress;
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
    <LinearGradient colors={[accentColor, '#F0644B']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.headerGradient}>
      <View style={[styles.headerTopRow, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={handleGoBack} activeOpacity={0.85} style={styles.headerIconButton}>
          <ArrowLeft color="white" size={22} />
        </TouchableOpacity>
        <View style={styles.headerLocation}>
          <Text allowFontScaling={false} style={styles.headerLocationLabel} numberOfLines={1}>
            Delivering to
          </Text>
          <Text allowFontScaling={false} style={styles.headerLocationValue} numberOfLines={1}>
            {deliveryArea}
          </Text>
        </View>
        <TouchableOpacity onPress={handleCallCourier} activeOpacity={0.85} style={styles.headerCallButton}>
          <Phone color={accentColor} size={18} />
        </TouchableOpacity>
      </View>

      <View style={styles.headerMapCard}>
        <View style={styles.headerEtaChip}>
          <Clock size={16} color={accentColor} />
          <Text allowFontScaling={false} style={styles.headerEtaText}>
            {estimatedWindow}
          </Text>
        </View>
        <View style={styles.mapWrapper}>
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
              strokeColor="rgba(216,58,46,0.9)"
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
        </View>
        <View style={styles.headerDestinationRow}>
          <MapPin size={16} color={accentColor} />
          <Text allowFontScaling={false} style={styles.headerDestinationText} numberOfLines={2}>
            {trimmedAddress}
          </Text>
        </View>
      </View>
    </LinearGradient>
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
    <View style={styles.contentContainer}>
      <View style={styles.timelineCard}>
        <View style={styles.timelineHeader}>
          <View>
            <Text allowFontScaling={false} style={styles.timelineTitle}>
              Order Steps
            </Text>
            <Text allowFontScaling={false} style={styles.timelineSubtitle}>
              {restaurantName}
            </Text>
          </View>
          <View style={styles.timelineStepChip}>
            <Text allowFontScaling={false} style={styles.timelineStepText}>
              Step {activeIndex + 1} of {steps.length}
            </Text>
          </View>
        </View>

        {steps.map((step, index) => {
          const isActive = index === activeIndex;
          const isCompleted = index < activeIndex || (steps.length - 1 === index && step.completed);
          const isLast = index === steps.length - 1;
          const timelineValue = timelineAnimations[index];
          const animatedStyle: Animated.WithAnimatedObject<ViewStyle> | undefined = timelineValue
            ? {
                opacity: timelineValue,
                transform: [
                  {
                    translateY: timelineValue.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }),
                  },
                ],
              }
            : undefined;

          return (
            <Animated.View key={`${step.key}-${index}`} style={[styles.timelineRow, animatedStyle]}>
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
                    style={[styles.timelineConnector, (isCompleted || isActive) && styles.timelineConnectorActive]}
                  />
                ) : null}
              </View>
              <View style={styles.timelineContent}>
                <Text
                  allowFontScaling={false}
                  style={[styles.timelineRowTitle, { color: isActive ? accentColor : headingText }]}
                >
                  {step.title}
                </Text>
                <Text allowFontScaling={false} style={styles.timelineDescription}>
                  {step.description}
                </Text>
              </View>
              <View style={styles.timelineStatus}>
                <Text
                  allowFontScaling={false}
                  style={[styles.timelineStatusText, isActive && styles.timelineStatusActive]}
                >
                  {step.statusLabel ?? 'Pending'}
                </Text>
              </View>
            </Animated.View>
          );
        })}
      </View>

      <View style={styles.orderCard}>
        <View style={styles.orderCardHeader}>
          <View>
            <Text allowFontScaling={false} style={styles.orderCardTitle}>
              My Order
            </Text>
            <Text allowFontScaling={false} style={styles.orderCardSubtitle}>
              {orderIdLabel}
            </Text>
          </View>
          {orderTotal ? (
            <Text allowFontScaling={false} style={styles.orderTotal}>
              {orderTotal}
            </Text>
          ) : null}
        </View>
        <View style={styles.orderItems}>
          {displayedItems.map((item, index) => (
            <View key={`${item.menuItemId}-${index}`} style={styles.orderItemRow}>
              <Text allowFontScaling={false} style={styles.orderItemText}>
                {item.quantity} × {item.name}
              </Text>
              <Text allowFontScaling={false} style={styles.orderItemPrice}>
                {formatServerMoney(item.lineTotal)}
              </Text>
            </View>
          ))}
          {remainingItems > 0 ? (
            <Text allowFontScaling={false} style={styles.orderMore}>
              +{remainingItems} more item{remainingItems === 1 ? '' : 's'}
            </Text>
          ) : null}
        </View>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handleSeeDetails}
          disabled={!order}
          style={[styles.seeDetailsButton, !order && styles.seeDetailsButtonDisabled]}
        >
          <Text allowFontScaling={false} style={[styles.seeDetailsText, !order && styles.seeDetailsTextDisabled]}>
            See details
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.courierCard}>
        <View style={styles.courierInfo}>
          <Text allowFontScaling={false} style={styles.courierLabel}>
            Courier
          </Text>
          <Text allowFontScaling={false} style={styles.courierName}>
            Foodify partner
          </Text>
          <Text allowFontScaling={false} style={styles.courierHint}>
            Call the driver if you need to share instructions.
          </Text>
        </View>
        <TouchableOpacity activeOpacity={0.9} onPress={handleCallCourier} style={styles.courierCallButton}>
          <Phone color="white" size={18} />
          <Text allowFontScaling={false} style={styles.courierCallText}>
            Call driver
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <MainLayout
      showHeader
      showFooter={false}
      customHeader={header}
      collapsedHeader={collapsedHeader}
      mainContent={mainContent}
      headerMaxHeight={360}
      headerMinHeight={insets.top + 120}
    />
  );
};

const styles = StyleSheet.create({
  headerGradient: {
    flex: 1,
    width: '100%',
    height: '100%',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIconButton: {
    height: 44,
    width: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  headerLocation: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerLocationLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.4,
    color: 'rgba(255,255,255,0.72)',
    textTransform: 'uppercase',
  },
  headerLocationValue: {
    marginTop: 6,
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  headerCallButton: {
    height: 44,
    width: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  headerMapCard: {
    marginTop: 28,
    borderRadius: 28,
    backgroundColor: surfaceColor,
    padding: 16,
    shadowColor: '#13203B',
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  headerEtaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: accentMuted,
    borderRadius: 9999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  headerEtaText: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: '600',
    color: accentColor,
  },
  mapWrapper: {
    marginTop: 12,
    borderRadius: 20,
    overflow: 'hidden',
    height: 180,
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
    backgroundColor: 'rgba(216,58,46,0.2)',
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
    borderColor: surfaceColor,
    backgroundColor: accentColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destinationDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: surfaceColor,
  },
  headerDestinationRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  headerDestinationText: {
    marginLeft: 8,
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: heroDark,
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
    backgroundColor: 'rgba(255,255,255,0.15)',
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
    backgroundColor: surfaceColor,
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 48,
    paddingTop: 8,
    backgroundColor: softBackground,
    flex: 1,
  },
  timelineCard: {
    backgroundColor: surfaceColor,
    borderRadius: 28,
    padding: 24,
    shadowColor: '#13203B',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timelineTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: heroDark,
  },
  timelineSubtitle: {
    marginTop: 4,
    fontSize: 14,
    color: mutedText,
  },
  timelineStepChip: {
    backgroundColor: accentMuted,
    borderRadius: 9999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  timelineStepText: {
    fontSize: 12,
    fontWeight: '600',
    color: accentColor,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 18,
  },
  timelineIndicator: {
    alignItems: 'center',
    width: 32,
  },
  timelineDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: surfaceColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineDotActive: {
    borderColor: accentColor,
  },
  timelineDotCompleted: {
    backgroundColor: accentColor,
    borderColor: accentColor,
  },
  timelineConnector: {
    width: 2,
    flex: 1,
    marginTop: 6,
    backgroundColor: '#E5E7EB',
  },
  timelineConnectorActive: {
    backgroundColor: `${accentColor}55`,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 8,
    marginRight: 12,
  },
  timelineRowTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: headingText,
  },
  timelineDescription: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: mutedText,
  },
  timelineStatus: {
    alignItems: 'flex-end',
    minWidth: 80,
  },
  timelineStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: mutedText,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  timelineStatusActive: {
    color: accentColor,
  },
  orderCard: {
    marginTop: 28,
    backgroundColor: surfaceColor,
    borderRadius: 28,
    padding: 24,
    shadowColor: '#13203B',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  orderCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  orderCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: heroDark,
  },
  orderCardSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: mutedText,
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
    justifyContent: 'space-between',
    marginTop: 10,
  },
  orderItemText: {
    fontSize: 14,
    color: headingText,
    flex: 1,
    marginRight: 16,
  },
  orderItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: headingText,
  },
  orderMore: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: '600',
    color: accentColor,
  },
  seeDetailsButton: {
    marginTop: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: accentColor,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  seeDetailsButtonDisabled: {
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  seeDetailsText: {
    fontSize: 14,
    fontWeight: '700',
    color: accentColor,
  },
  seeDetailsTextDisabled: {
    color: '#9CA3AF',
  },
  courierCard: {
    marginTop: 24,
    backgroundColor: heroDark,
    borderRadius: 28,
    padding: 24,
  },
  courierInfo: {
    marginBottom: 18,
  },
  courierLabel: {
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  courierName: {
    marginTop: 10,
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  courierHint: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: 'rgba(255,255,255,0.7)',
  },
  courierCallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingVertical: 14,
    backgroundColor: accentColor,
  },
  courierCallText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
  },
});

export default OrderTrackingScreen;
