import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import MapView, { Marker, Polyline, type Region } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  Bike,
  Clock,
  MapPin,
  Phone,
  Star,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  NavigationProp,
  ParamListBase,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import type { CreateOrderResponse, MonetaryAmount } from '~/interfaces/Order';
import MainLayout from '~/layouts/MainLayout';

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

  const mapRegion = useMemo<Region>(() => {
    if (order?.delivery?.location?.lat && order.delivery.location.lng) {
      return {
        latitude: order.delivery.location.lat,
        longitude: order.delivery.location.lng,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      } satisfies Region;
    }

    return DEFAULT_REGION;
  }, [order?.delivery?.location?.lat, order?.delivery?.location?.lng]);

  const destinationCoordinate: LatLng = {
    latitude: mapRegion.latitude,
    longitude: mapRegion.longitude,
  };

  const routeCoordinates: LatLng[] = useMemo(() => {
    const { latitude, longitude } = mapRegion;
    return [
      { latitude: latitude - 0.02, longitude: longitude - 0.012 },
      { latitude: latitude - 0.012, longitude: longitude - 0.008 },
      { latitude: latitude - 0.005, longitude: longitude - 0.003 },
      { latitude: latitude + 0.001, longitude: longitude + 0.002 },
      { latitude: latitude + 0.004, longitude: longitude + 0.006 },
    ];
  }, [mapRegion]);

  const driverCoordinate: LatLng = routeCoordinates[1] ?? destinationCoordinate;

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  const handleCallCourier = () => {};

  const handleSeeDetails = () => {
    navigation.navigate('CheckoutOrder', { viewMode: true, order });
  };

  const renderHero = (collapsed: boolean) => (
    <View style={collapsed ? styles.mapCollapsed : styles.mapExpanded}>
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
        <Polyline
          coordinates={routeCoordinates}
          strokeColor="rgba(255,255,255,0.85)"
          strokeWidth={4}
          lineCap="round"
          lineJoin="round"
        />
        <Marker coordinate={driverCoordinate}>
          <View style={styles.driverMarker}>
            <Bike size={16} color="white" />
          </View>
        </Marker>
        <Marker coordinate={destinationCoordinate}>
          <View style={styles.destinationMarker} />
        </Marker>
      </MapView>

      <LinearGradient
        colors={collapsed ? ['rgba(0,0,0,0.4)', 'transparent'] : ['rgba(0,0,0,0.45)', 'transparent']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

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
        <>
          <View style={styles.mapLocationCard}>
            <Text style={styles.locationEyebrow}>Delivering to</Text>
            <View style={styles.locationRow}>
              <MapPin size={18} color="white" />
              <View style={styles.locationTexts}>
                <Text style={styles.locationTitle}>{deliveryArea}</Text>
                <Text style={styles.locationSubtitle} numberOfLines={1}>
                  {deliveryAddress}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.courierFloatingCard}>
            <View style={styles.courierAvatar}>
              <Bike size={20} color={accentColor} />
            </View>
          <View style={styles.courierDetails}>
            <Text style={styles.courierLabel}>Delivered by</Text>
            <Text style={styles.courierName}>{courierName}</Text>
            <View style={styles.courierMetaRow}>
              <Star size={14} color={accentColor} fill={accentColor} />
              <Text style={styles.courierMetaText}>
                {courierRating} • {courierDeliveries} deliveries
              </Text>
            </View>
          </View>
            <TouchableOpacity
              style={styles.callPill}
              activeOpacity={0.85}
              onPress={handleCallCourier}
            >
              <Phone size={18} color="white" />
            </TouchableOpacity>
          </View>
        </>
      ) : null}
    </View>
  );

  const mainContent = (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.stepsCard}>
        <View style={styles.stepsHeader}>
          <Text style={styles.stepsTitle}>Order Steps</Text>
          <View style={styles.stepsStatusPill}>
            <Clock size={14} color="white" />
            <Text style={styles.stepsStatusText}>In progress</Text>
          </View>
        </View>
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1;
          const dotStyle = [styles.stepDot];
          if (step.state === 'completed') {
            dotStyle.push(styles.stepDotCompleted);
          } else if (step.state === 'active') {
            dotStyle.push(styles.stepDotActive);
          }

          const lineStyle = [styles.stepLine];
          if (step.state !== 'pending') {
            lineStyle.push(styles.stepLineActive);
          }

          return (
            <View key={`${step.key}-${index}`} style={[styles.stepRow, !isLast && styles.stepRowDivider]}>
              <View style={styles.stepTimeline}>
                <View style={dotStyle} />
                {!isLast ? <View style={lineStyle} /> : null}
              </View>
              <View style={styles.stepTexts}>
                <Text style={styles.stepStage}>Step {index + 1}</Text>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
              <View style={styles.stepMeta}>
                <View
                  style={[
                    styles.stepStatusBadge,
                    step.state === 'completed' && styles.stepStatusBadgeCompleted,
                    step.state === 'active' && styles.stepStatusBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepStatusLabel,
                      step.state !== 'pending' && styles.stepStatusLabelContrast,
                    ]}
                  >
                    {step.statusText}
                  </Text>
                </View>
                <Text style={styles.stepEta}>{step.etaLabel}</Text>
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>My Order</Text>
          <View style={styles.summaryBadge}>
            <Text style={styles.summaryBadgeText}>{order?.restaurant?.name ?? 'Your restaurant'}</Text>
          </View>
        </View>

        <View style={styles.summaryItems}>
          {order?.items?.map((item, index) => {
            const isLast = index === (order?.items?.length ?? 0) - 1;
            return (
              <View
                key={`${item.menuItem?.id ?? index}-${index}`}
                style={[
                  styles.summaryItemRow,
                  !isLast && styles.summaryItemRowSpacing,
                ]}
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
          <TouchableOpacity onPress={handleSeeDetails} activeOpacity={0.85} style={styles.summaryDetailsButton}>
            <Text style={styles.summaryDetailsText}>See details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.screen}>
      <MainLayout
        showFooter={false}
        customHeader={renderHero(false)}
        collapsedHeader={renderHero(true)}
        mainContent={mainContent}
        headerMaxHeight={360}
        headerMinHeight={160}
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
  mapLocationCard: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 140,
    backgroundColor: accentColor,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  locationEyebrow: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 10,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationTexts: {
    marginLeft: 12,
    flex: 1,
  },
  locationTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  locationSubtitle: {
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
    fontSize: 14,
  },
  courierFloatingCard: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 28,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: softSurface,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  courierAvatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FCE7E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  courierDetails: {
    flex: 1,
    marginHorizontal: 16,
  },
  courierLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: textSecondary,
    fontWeight: '600',
  },
  courierName: {
    marginTop: 4,
    fontSize: 18,
    fontWeight: '700',
    color: textPrimary,
  },
  courierMetaRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  courierMetaText: {
    marginLeft: 6,
    color: textSecondary,
    fontSize: 13,
  },
  callPill: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: accentColor,
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
  destinationMarker: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'white',
    borderWidth: 4,
    borderColor: accentColor,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 60,
  },
  stepsCard: {
    backgroundColor: softSurface,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    marginBottom: 20,
  },
  stepsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  stepsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: textPrimary,
  },
  stepsStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: accentColor,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  stepsStatusText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: 18,
  },
  stepRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: borderColor,
    marginBottom: 18,
  },
  stepTimeline: {
    width: 34,
    alignItems: 'center',
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  stepDotCompleted: {
    backgroundColor: accentColor,
    borderColor: accentColor,
  },
  stepDotActive: {
    borderColor: accentColor,
  },
  stepLine: {
    position: 'absolute',
    top: 22,
    bottom: -18,
    width: 2,
    backgroundColor: '#E5E7EB',
  },
  stepLineActive: {
    backgroundColor: accentColor,
  },
  stepTexts: {
    flex: 1,
    paddingRight: 12,
  },
  stepStage: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    color: accentColor,
    fontWeight: '600',
  },
  stepTitle: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '600',
    color: textPrimary,
  },
  stepDescription: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: textSecondary,
  },
  stepMeta: {
    alignItems: 'flex-end',
    width: 90,
  },
  stepStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
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
    fontSize: 12,
    fontWeight: '600',
    color: accentColor,
  },
  stepStatusLabelContrast: {
    color: 'white',
  },
  stepEta: {
    marginTop: 6,
    fontSize: 13,
    color: '#EF4444',
    fontWeight: '600',
  },
  summaryCard: {
    backgroundColor: softSurface,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: textPrimary,
  },
  summaryBadge: {
    backgroundColor: '#FDE6E3',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  summaryBadgeText: {
    color: accentColor,
    fontSize: 13,
    fontWeight: '600',
  },
  summaryItems: {
    marginBottom: 16,
  },
  summaryItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryItemRowSpacing: {
    marginBottom: 12,
  },
  summaryItemQuantity: {
    fontSize: 14,
    fontWeight: '600',
    color: accentColor,
    marginRight: 12,
  },
  summaryItemName: {
    flex: 1,
    fontSize: 15,
    color: textPrimary,
  },
  summaryFooter: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: '700',
    color: textPrimary,
  },
  summaryDetailsButton: {
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: accentColor,
  },
  summaryDetailsText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
