import React, { useEffect, useMemo, useRef } from 'react';
import type { ViewStyle } from 'react-native';
import { Animated, Easing, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, Polyline, type MapStyleElement, type Region } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
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

const accentColor = '#D83A2E';
const heroDark = '#1A253A';
const softBackground = '#F5F6FA';
const softSurface = '#FFFFFF';
const mutedText = '#667085';
const headingText = '#1F2937';

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

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const OrderTrackingScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<OrderTrackingRoute>();
  const order = route.params?.order ?? null;

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
  const timelineAnimations = useMemo(
    () => steps.map(() => new Animated.Value(0)),
    [steps],
  );

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

  const restaurantName = order?.restaurant?.name ?? 'your restaurant';
  const orderIdLabel = order ? `#${order.orderId}` : 'Live order';
  const deliveryAddress = order?.delivery?.address ?? 'Your saved address';
  const addressLabel = order?.delivery?.savedAddress?.label ?? 'Delivery';
  const trimmedAddress = deliveryAddress.length > 90 ? `${deliveryAddress.slice(0, 87)}...` : deliveryAddress;
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
  const paymentMethod = order?.payment?.method ?? 'Selected method';
  const displayedItems = useMemo(() => (order?.items ?? []).slice(0, 3), [order?.items]);
  const remainingItems = Math.max(0, (order?.items?.length ?? 0) - displayedItems.length);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: softBackground }}>
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        <LinearGradient
          colors={[accentColor, '#F0644B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View className="px-6 pt-2 pb-12">
            <View className="flex-row items-center justify-between">
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                activeOpacity={0.85}
                className="h-11 w-11 items-center justify-center rounded-full bg-white/20"
              >
                <ArrowLeft color="white" size={22} />
              </TouchableOpacity>
              <View className="rounded-full bg-white/20 px-4 py-2">
                <Text allowFontScaling={false} className="text-xs font-semibold uppercase tracking-[2px] text-white/90">
                  {orderIdLabel}
                </Text>
              </View>
            </View>

            <View className="mt-8">
              <Text allowFontScaling={false} className="text-xs font-semibold uppercase tracking-[4px] text-white/70">
                Now
              </Text>
              <Text allowFontScaling={false} className="mt-3 text-3xl font-bold text-white">
                {activeStep?.title ?? 'Order in progress'}
              </Text>
              <Text allowFontScaling={false} className="mt-4 text-sm leading-5 text-white/85">
                {activeStep?.description ?? `We are looking after your order from ${restaurantName}.`}
              </Text>
            </View>

            <View style={styles.heroSummary}>
              <View style={styles.heroSummaryItem}>
                <Clock size={18} color={accentColor} />
                <View className="ml-3">
                  <Text allowFontScaling={false} style={styles.heroSummaryLabel}>
                    Estimated time
                  </Text>
                  <Text allowFontScaling={false} style={styles.heroSummaryValue}>
                    {estimatedWindow}
                  </Text>
                </View>
              </View>
              <View style={[styles.heroSummaryItem, { marginTop: 16 }]}> 
                <MapPin size={18} color={accentColor} />
                <View className="ml-3 flex-1">
                  <Text allowFontScaling={false} style={styles.heroSummaryLabel}>
                    {addressLabel}
                  </Text>
                  <Text allowFontScaling={false} style={styles.heroSummaryValue} numberOfLines={2}>
                    {trimmedAddress}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.contentWrapper}>
          <View style={styles.contactCard}>
            <View>
              <Text allowFontScaling={false} style={styles.contactLabel}>
                Your courier
              </Text>
              <Text allowFontScaling={false} style={styles.contactName}>
                Foodify partner
              </Text>
              <Text allowFontScaling={false} style={styles.contactHint}>
                Reach out if you need to share delivery instructions.
              </Text>
            </View>
            <TouchableOpacity activeOpacity={0.9} style={styles.contactButton}>
              <Phone color="white" size={18} />
              <Text allowFontScaling={false} style={styles.contactButtonText}>
                Call courier
              </Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.card, styles.mapCard]}>
            <View style={styles.cardHeader}>
              <Text allowFontScaling={false} style={styles.cardTitle}>
                Courier location
              </Text>
              <View style={styles.statusChip}>
                <Text allowFontScaling={false} style={styles.statusChipText}>
                  {estimatedWindow}
                </Text>
              </View>
            </View>
            <Text allowFontScaling={false} style={styles.cardSubtitle}>
              {activeStep?.statusLabel ?? 'On the move to you'}
            </Text>
            <View style={styles.mapWrapper}>
              <MapView
                style={styles.map}
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
            <View style={styles.mapFooter}>
              <MapPin size={16} color={accentColor} />
              <Text allowFontScaling={false} style={styles.mapFooterText} numberOfLines={1}>
                {trimmedAddress}
              </Text>
            </View>
          </View>

          <View style={[styles.card, { marginTop: 24 }]}>
            <View style={styles.cardHeader}>
              <Text allowFontScaling={false} style={styles.cardTitle}>
                Live order status
              </Text>
              <View style={styles.statusChipMuted}>
                <Text allowFontScaling={false} style={styles.statusChipMutedText}>
                  Step {activeIndex + 1} of {steps.length}
                </Text>
              </View>
            </View>

            {steps.map((step, index) => {
              const isActive = index === activeIndex;
              const isCompleted = index < activeIndex || (steps.length - 1 === index && step.completed);
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
                  <View style={styles.timelineIconWrapper}>
                    <View
                      style={[
                        styles.timelineDot,
                        {
                          backgroundColor: isCompleted || isActive ? accentColor : softSurface,
                          borderColor: isCompleted || isActive ? accentColor : '#D1D5DB',
                        },
                      ]}
                    >
                      {isCompleted ? <CheckCircle2 size={14} color="white" /> : null}
                    </View>
                    {index < steps.length - 1 ? (
                      <View
                        style={[
                          styles.timelineLine,
                          { backgroundColor: isCompleted ? `${accentColor}55` : '#E5E7EB' },
                        ]}
                      />
                    ) : null}
                  </View>
                  <View style={styles.timelineContent}>
                    <Text
                      allowFontScaling={false}
                      style={[styles.timelineTitle, { color: isActive ? accentColor : headingText }]}
                    >
                      {step.title}
                    </Text>
                    <Text allowFontScaling={false} style={styles.timelineDescription}>
                      {step.description}
                    </Text>
                    {step.statusLabel ? (
                      <View style={styles.timelineChip}>
                        <Text allowFontScaling={false} style={styles.timelineChipText}>
                          {step.statusLabel}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </Animated.View>
              );
            })}
          </View>

          <View style={[styles.card, { marginTop: 24 }]}> 
            <View style={styles.cardHeader}>
              <Text allowFontScaling={false} style={styles.cardTitle}>
                Order summary
              </Text>
              {orderTotal ? (
                <Text allowFontScaling={false} style={styles.summaryTotal}>
                  {orderTotal}
                </Text>
              ) : null}
            </View>
            <Text allowFontScaling={false} style={styles.cardSubtitle}>
              Payment method: {paymentMethod}
            </Text>

            {displayedItems.length ? (
              <View style={styles.summaryItemsWrapper}>
                {displayedItems.map((item) => (
                  <View key={`${item.menuItemId}-${item.name}`} style={styles.summaryItemRow}>
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <Text allowFontScaling={false} style={styles.summaryItemTitle}>
                        {item.quantity} × {item.name}
                      </Text>
                      {item.extras?.length ? (
                        <Text allowFontScaling={false} style={styles.summaryItemExtras}>
                          Extras: {item.extras.map((extra) => extra.name).join(', ')}
                        </Text>
                      ) : null}
                    </View>
                    <Text allowFontScaling={false} style={styles.summaryItemPrice}>
                      {formatServerMoney(item.lineTotal)}
                    </Text>
                  </View>
                ))}
                {remainingItems > 0 ? (
                  <Text allowFontScaling={false} style={styles.summaryMore}>
                    + {remainingItems} more {remainingItems === 1 ? 'item' : 'items'}
                  </Text>
                ) : null}
              </View>
            ) : null}

            <View style={styles.summaryActions}>
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={() => navigation.navigate('OrderHistory')}
                style={[styles.actionButton, styles.actionButtonGhost]}
              >
                <Text allowFontScaling={false} style={styles.actionButtonGhostText}>
                  View order history
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => navigation.navigate('Home')}
                style={[styles.actionButton, styles.actionButtonPrimary]}
              >
                <Text allowFontScaling={false} style={styles.actionButtonPrimaryText}>
                  Back to home
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  hero: {
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  heroSummary: {
    marginTop: 28,
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  heroSummaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroSummaryLabel: {
    fontSize: 12,
    color: mutedText,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    fontWeight: '600',
  },
  heroSummaryValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '600',
    color: heroDark,
  },
  contentWrapper: {
    paddingHorizontal: 24,
    marginTop: -32,
  },
  card: {
    borderRadius: 28,
    backgroundColor: softSurface,
    padding: 24,
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  contactCard: {
    borderRadius: 28,
    backgroundColor: heroDark,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: heroDark,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },
  contactLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  contactName: {
    marginTop: 8,
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  contactHint: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    lineHeight: 18,
  },
  contactButton: {
    backgroundColor: accentColor,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactButtonText: {
    marginLeft: 8,
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  mapCard: {
    marginTop: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: headingText,
  },
  cardSubtitle: {
    marginTop: 8,
    fontSize: 13,
    color: mutedText,
  },
  statusChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: 'rgba(216,58,46,0.12)',
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: accentColor,
  },
  statusChipMuted: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: '#F1F5F9',
  },
  statusChipMutedText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  mapWrapper: {
    marginTop: 18,
    borderRadius: 24,
    overflow: 'hidden',
    height: 220,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapFooter: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
  },
  mapFooterText: {
    marginLeft: 8,
    fontSize: 13,
    color: heroDark,
    flex: 1,
  },
  mapDriverMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapDriverPulse: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: accentColor,
  },
  mapDriverMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: accentColor,
    borderWidth: 4,
    borderColor: '#FFFFFF',
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
  destinationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: accentColor,
  },
  mapFooterIcon: {
    marginRight: 8,
  },
  mapFooterLabel: {
    fontSize: 12,
    color: mutedText,
  },
  timelineRow: {
    flexDirection: 'row',
    marginTop: 24,
  },
  timelineIconWrapper: {
    width: 32,
    alignItems: 'center',
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 6,
  },
  timelineContent: {
    flex: 1,
    marginLeft: 16,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  timelineDescription: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 18,
    color: mutedText,
  },
  timelineChip: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 9999,
    backgroundColor: '#FEF1EF',
  },
  timelineChipText: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    color: accentColor,
    textTransform: 'uppercase',
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: accentColor,
  },
  summaryItemsWrapper: {
    marginTop: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F9FAFB',
  },
  summaryItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  summaryItemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: headingText,
  },
  summaryItemExtras: {
    marginTop: 4,
    fontSize: 12,
    color: mutedText,
  },
  summaryItemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: headingText,
  },
  summaryMore: {
    marginTop: 12,
    fontSize: 12,
    color: mutedText,
  },
  summaryActions: {
    marginTop: 20,
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 9999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionButtonGhost: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  actionButtonGhostText: {
    fontSize: 14,
    fontWeight: '600',
    color: headingText,
  },
  actionButtonPrimary: {
    backgroundColor: heroDark,
  },
  actionButtonPrimaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
});

export default OrderTrackingScreen;
