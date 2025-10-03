import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { ArrowLeft, Bike, CheckCircle2, Clock, MapPin } from 'lucide-react-native';

import type { CreateOrderResponse, MonetaryAmount } from '~/interfaces/Order';

const accentColor = '#CA251B';
const darkColor = '#17213A';
const mutedTextColor = '#6B7280';
const softSurface = '#F9FAFB';
const chipBackground = 'rgba(255,255,255,0.18)';

type LatLng = { latitude: number; longitude: number };

const DEFAULT_REGION: Region = {
  latitude: 36.8065,
  longitude: 10.1815,
  latitudeDelta: 0.042,
  longitudeDelta: 0.042,
};

const mapTheme: MapStyleElement[] = [
  { elementType: 'geometry', stylers: [{ color: '#1F2933' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#F9FAFB' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1F2933' }] },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: 'rgba(255,255,255,0.2)' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#2A364B' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#F3F4F6' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#16213A' }],
  },
];

const parseMonetaryAmount = (value: MonetaryAmount | null | undefined) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.replace(',', '.');
    const parsed = Number(normalized);
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
    description: 'Chefs are crafting your meal with fresh ingredients.',
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

  const progressAnim = useRef(new Animated.Value(0)).current;
  const bobAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: safeProgress,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progressAnim, safeProgress]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(bobAnim, {
          toValue: 1,
          duration: 1300,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bobAnim, {
          toValue: 0,
          duration: 1300,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => {
      animation.stop();
    };
  }, [bobAnim]);

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

  const stepsCount = steps.length;
  const timelineAnimations = useMemo(
    () => Array.from({ length: stepsCount }, () => new Animated.Value(0)),
    [stepsCount],
  );

  useEffect(() => {
    timelineAnimations.forEach((value) => value.setValue(0));
    const animations = timelineAnimations.map((value, index) =>
      Animated.timing(value, {
        toValue: 1,
        duration: 450,
        delay: index * 110,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    );
    const controller = Animated.stagger(110, animations);
    controller.start();

    return () => {
      controller.stop();
    };
  }, [timelineAnimations]);

  const progressWidth = trackWidth ? Animated.multiply(progressAnim, trackWidth) : 0;
  const riderTranslateX = trackWidth ? Animated.multiply(progressAnim, trackWidth) : 0;
  const riderTranslateY = bobAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const pulseScale = pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] });
  const pulseOpacity = pulseAnim.interpolate({ inputRange: [0, 0.7, 1], outputRange: [0.35, 0.15, 0] });

  const restaurantName = order?.restaurant?.name ?? 'your restaurant';
  const orderIdLabel = order ? `#${order.orderId}` : 'Live order';
  const deliveryAddress = order?.delivery?.address ?? 'Your saved address';
  const addressLabel = order?.delivery?.savedAddress?.label ?? 'Delivery';
  const trimmedAddress = deliveryAddress.length > 80 ? `${deliveryAddress.slice(0, 77)}...` : deliveryAddress;
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
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <View>
          <LinearGradient
            colors={[accentColor, '#E75A4D']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroGradient}
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
                <View className="rounded-full bg-white/15 px-4 py-2">
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
                <Text allowFontScaling={false} className="mt-3 text-sm leading-5 text-white/85">
                  {activeStep?.description ?? `We are looking after your order from ${restaurantName}.`}
                </Text>
                <Text allowFontScaling={false} className="mt-4 text-xs uppercase tracking-[3px] text-white/70">
                  From {restaurantName}
                </Text>
              </View>

              <View className="mt-6 flex-row flex-wrap gap-3">
                <View className="flex-row items-center rounded-full px-4 py-2" style={{ backgroundColor: chipBackground }}>
                  <Clock size={18} color="white" />
                  <Text allowFontScaling={false} className="ml-2 text-sm font-semibold text-white">
                    {estimatedWindow}
                  </Text>
                </View>
                <View className="flex-row items-center rounded-full px-4 py-2" style={{ backgroundColor: chipBackground }}>
                  <Bike size={18} color="white" />
                  <Text allowFontScaling={false} className="ml-2 text-sm font-semibold text-white">
                    {activeStep?.statusLabel ?? 'In progress'}
                  </Text>
                </View>
              </View>

              <View className="mt-6 rounded-3xl bg-white/15 p-4">
                <View className="flex-row items-center">
                  <View className="h-10 w-10 items-center justify-center rounded-2xl bg-white/20">
                    <MapPin size={20} color="white" />
                  </View>
                  <View className="ml-3 flex-1">
                    <Text allowFontScaling={false} className="text-xs font-semibold uppercase text-white/70">
                      {addressLabel}
                    </Text>
                    <Text allowFontScaling={false} className="mt-1 text-sm font-semibold text-white">
                      {trimmedAddress}
                    </Text>
                  </View>
                </View>
              </View>

              <View className="mt-8">
                <View
                  style={styles.trackContainer}
                  onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
                >
                  <View style={styles.trackBackground} />
                  <Animated.View style={[styles.trackProgress, { width: progressWidth }]} />
                  <Animated.View
                    style={[
                      styles.riderContainer,
                      {
                        transform: [
                          { translateX: riderTranslateX },
                          { translateY: riderTranslateY },
                        ],
                      },
                    ]}
                  >
                    <Animated.View
                      style={[
                        styles.riderPulse,
                        {
                          transform: [{ scale: pulseScale }],
                          opacity: pulseOpacity,
                        },
                      ]}
                    />
                    <View style={styles.riderIconWrapper}>
                      <Bike size={22} color="white" />
                    </View>
                  </Animated.View>
                </View>
                <View className="mt-3 flex-row items-center justify-between">
                  <Text allowFontScaling={false} className="text-xs font-semibold uppercase text-white/80">
                    Start
                  </Text>
                  <Text allowFontScaling={false} className="text-xs font-semibold uppercase text-white/80">
                    Finish
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>

          <View className="-mt-10 px-6">
            <View style={styles.mapCard} className="mb-6">
              <MapView
                style={styles.map}
                initialRegion={mapRegion}
                region={mapRegion}
                scrollEnabled={false}
                rotateEnabled={false}
                pitchEnabled={false}
                zoomEnabled={false}
                pointerEvents="none"
                customMapStyle={mapTheme}
              >
                <Polyline
                  coordinates={routeCoordinates}
                  strokeColor="rgba(202,37,27,0.85)"
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
                      <Bike size={20} color="white" />
                    </View>
                  </View>
                </Marker>
                <Marker coordinate={destinationCoordinate} anchor={{ x: 0.5, y: 0.95 }}>
                  <View style={styles.destinationMarker}>
                    <View style={styles.destinationDot} />
                  </View>
                </Marker>
              </MapView>
              <View style={styles.mapOverlay}>
                <Text allowFontScaling={false} style={styles.mapOverlayTitle}>
                  Courier location
                </Text>
                <Text allowFontScaling={false} style={styles.mapOverlayEta}>
                  {estimatedWindow}
                </Text>
                <Text allowFontScaling={false} style={styles.mapOverlayBody}>
                  {activeStep?.statusLabel ?? 'On the move to you'}
                </Text>
              </View>
              <View style={styles.mapDestinationOverlay}>
                <Text allowFontScaling={false} style={styles.mapDestinationLabel}>
                  Delivering to
                </Text>
                <Text allowFontScaling={false} style={styles.mapDestinationValue}>
                  {trimmedAddress}
                </Text>
              </View>
            </View>
            <View style={styles.card}>
              <Text allowFontScaling={false} className="text-base font-semibold" style={{ color: darkColor }}>
                Live order status
              </Text>
              {steps.map((step, index) => {
                const isActive = index === activeIndex;
                const isCompleted = index < activeIndex || (steps.length - 1 === index && step.completed);
                const timelineValue = timelineAnimations[index];
                const animatedStyle: Animated.WithAnimatedObject<ViewStyle> | null = timelineValue
                  ? {
                      opacity: timelineValue,
                      transform: [
                        {
                          translateY: timelineValue.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }),
                        },
                      ],
                    }
                  : null;

                return (
                  <Animated.View
                    key={`${step.key}-${index}`}
                    className="mt-6 flex-row"
                    style={animatedStyle ?? undefined}
                  >
                    <View className="items-center" style={{ width: 28 }}>
                      <View
                        className="items-center justify-center rounded-full"
                        style={[
                          styles.timelineDot,
                          {
                            backgroundColor: isCompleted || isActive ? accentColor : '#FFFFFF',
                            borderColor: isCompleted || isActive ? accentColor : '#E5E7EB',
                          },
                        ]}
                      >
                        {isCompleted ? <CheckCircle2 size={14} color="white" /> : null}
                      </View>
                      {index < steps.length - 1 ? (
                        <View
                          style={[
                            styles.timelineLine,
                            { backgroundColor: isCompleted ? `${accentColor}66` : '#E5E7EB' },
                          ]}
                        />
                      ) : null}
                    </View>
                    <View className="ml-4 flex-1">
                      <Text
                        allowFontScaling={false}
                        className="text-sm font-semibold"
                        style={{ color: isActive ? accentColor : darkColor }}
                      >
                        {step.title}
                      </Text>
                      <Text allowFontScaling={false} className="mt-1 text-xs leading-5" style={{ color: mutedTextColor }}>
                        {step.description}
                      </Text>
                      {step.statusLabel ? (
                        <View className="mt-2 self-start rounded-full bg-[#FDE7E5] px-3 py-1">
                          <Text allowFontScaling={false} className="text-[11px] font-semibold uppercase text-[#CA251B]">
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
              <Text allowFontScaling={false} className="text-base font-semibold" style={{ color: darkColor }}>
                Order summary
              </Text>
              <View className="mt-4 rounded-2xl px-4 py-4" style={{ backgroundColor: softSurface }}>
                <View className="flex-row items-center justify-between">
                  <Text allowFontScaling={false} className="text-sm font-semibold" style={{ color: darkColor }}>
                    Total paid
                  </Text>
                  <Text allowFontScaling={false} className="text-lg font-bold" style={{ color: accentColor }}>
                    {orderTotal ?? '—'}
                  </Text>
                </View>
                <Text allowFontScaling={false} className="mt-2 text-xs" style={{ color: mutedTextColor }}>
                  {`Payment method: ${paymentMethod}`}
                </Text>
              </View>

              {displayedItems.length ? (
                <View className="mt-4 rounded-2xl border border-dashed border-[#E5E7EB] px-4 py-4">
                  {displayedItems.map((item) => (
                    <View key={`${item.menuItemId}-${item.name}`} className="mt-3 flex-row items-start justify-between">
                      <View className="flex-1 pr-3">
                        <Text allowFontScaling={false} className="text-sm font-semibold" style={{ color: darkColor }}>
                          {item.quantity} × {item.name}
                        </Text>
                        {item.extras?.length ? (
                          <Text allowFontScaling={false} className="mt-1 text-xs" style={{ color: mutedTextColor }}>
                            Extras: {item.extras.map((extra) => extra.name).join(', ')}
                          </Text>
                        ) : null}
                      </View>
                      <Text allowFontScaling={false} className="text-sm font-semibold" style={{ color: darkColor }}>
                        {formatServerMoney(item.lineTotal)}
                      </Text>
                    </View>
                  ))}
                  {remainingItems > 0 ? (
                    <Text allowFontScaling={false} className="mt-3 text-xs" style={{ color: mutedTextColor }}>
                      + {remainingItems} more {remainingItems === 1 ? 'item' : 'items'}
                    </Text>
                  ) : null}
                </View>
              ) : null}

              <View className="mt-6 flex-row gap-3">
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => navigation.navigate('OrderHistory')}
                  className="flex-1 rounded-full border border-[#E5E7EB] px-4 py-3"
                >
                  <Text allowFontScaling={false} className="text-center text-sm font-semibold" style={{ color: darkColor }}>
                    View order history
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate('Home')}
                  className="flex-1 rounded-full bg-[#17213A] px-4 py-3"
                >
                  <Text allowFontScaling={false} className="text-center text-sm font-semibold text-white">
                    Back to home
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  heroGradient: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    overflow: 'hidden',
  },
  mapCard: {
    height: 220,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    shadowColor: darkColor,
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapOverlay: {
    position: 'absolute',
    top: 18,
    left: 18,
    right: 18,
    borderRadius: 24,
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(23,33,58,0.82)',
  },
  mapOverlayTitle: {
    fontSize: 12,
    letterSpacing: 3,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
  },
  mapOverlayEta: {
    marginTop: 6,
    fontSize: 22,
    color: 'white',
    fontWeight: '700',
  },
  mapOverlayBody: {
    marginTop: 6,
    fontSize: 13,
    color: 'rgba(255,255,255,0.82)',
    fontWeight: '500',
  },
  mapDestinationOverlay: {
    position: 'absolute',
    bottom: 18,
    right: 18,
    left: 18,
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  mapDestinationLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    color: '#6B7280',
  },
  mapDestinationValue: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: '600',
    color: darkColor,
  },
  mapDriverMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapDriverPulse: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: accentColor,
    opacity: 0.25,
  },
  mapDriverMarker: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: accentColor,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    shadowColor: accentColor,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  destinationMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: accentColor,
    shadowColor: '#0F172A',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  destinationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: accentColor,
  },
  trackContainer: {
    height: 14,
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  trackBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  trackProgress: {
    height: '100%',
    borderRadius: 9999,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  riderContainer: {
    position: 'absolute',
    top: -22,
  },
  riderPulse: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: accentColor,
  },
  riderIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: accentColor,
    shadowColor: accentColor,
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  card: {
    borderRadius: 32,
    backgroundColor: 'white',
    padding: 24,
    shadowColor: darkColor,
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  timelineDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 6,
  },
});

export default OrderTrackingScreen;
