import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import useOngoingOrder from '~/hooks/useOngoingOrder';

const accentColor = '#D83A2E';
const softBackground = '#F5F6FA';
const softSurface = '#FFFFFF';
const textPrimary = '#0F172A';
const textSecondary = '#6B7280';
const borderColor = '#F0F1F5';

const OrderTrackingScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { order: ongoingOrder, isLoading } = useOngoingOrder();

  if (isLoading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Text style={styles.heading}>Loading your order...</Text>
      </View>
    );
  }

  if (!ongoingOrder) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <Text style={styles.heading}>No ongoing order</Text>
        <Text style={styles.description}>
          We will display details here once you place an order that is being prepared or delivered.
        </Text>
      </View>
    );
  }

  const restaurantName = ongoingOrder.restaurant?.name ?? 'Unknown restaurant';
  const restaurantAddress = ongoingOrder.restaurant?.address ?? 'No restaurant address available';
  const orderStatus = ongoingOrder.status ?? ongoingOrder.statusHistory?.[ongoingOrder.statusHistory.length - 1]?.newStatus;
  const driverName = ongoingOrder.delivery?.driver?.name ?? 'Driver not assigned yet';
  const driverPhone = ongoingOrder.delivery?.driver?.phone ?? 'No phone number provided';
  const deliveryAddress = ongoingOrder.deliveryAddress ?? ongoingOrder.delivery?.address ?? 'No delivery address';
  const estimatedDeliveryTime = ongoingOrder.delivery?.estimatedDeliveryTime;
  const estimatedPickupTime = ongoingOrder.delivery?.estimatedPickupTime;
  const orderId = ongoingOrder.orderId ?? 'N/A';
  const itemCount = ongoingOrder.items?.length ?? 0;
  const paymentMethod = ongoingOrder.paymentMethod ?? 'Not specified';

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      <View style={styles.card}>
        <Text style={styles.heading}>Order #{orderId}</Text>
        <Text style={styles.statusLabel}>{orderStatus ?? 'Status unavailable'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Restaurant</Text>
        <Text style={styles.primaryText}>{restaurantName}</Text>
        <Text style={styles.secondaryText}>{restaurantAddress}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Delivery details</Text>
        <Text style={styles.primaryText}>{deliveryAddress}</Text>
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Text style={styles.secondaryText}>Estimated pickup</Text>
            <Text style={styles.primaryText}>
              {estimatedPickupTime != null ? `${Math.round(estimatedPickupTime / 60)} min` : '—'}
            </Text>
          </View>
          <View style={styles.rowItem}>
            <Text style={styles.secondaryText}>Estimated delivery</Text>
            <Text style={styles.primaryText}>
              {estimatedDeliveryTime != null ? `${Math.round(estimatedDeliveryTime / 60)} min` : '—'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Driver</Text>
        <Text style={styles.primaryText}>{driverName}</Text>
        <Text style={styles.secondaryText}>{driverPhone}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Order summary</Text>
        <Text style={styles.primaryText}>{itemCount} item{itemCount === 1 ? '' : 's'}</Text>
        <Text style={styles.secondaryText}>Payment method: {paymentMethod}</Text>
        {ongoingOrder.date ? (
          <Text style={styles.secondaryText}>Placed on: {new Date(ongoingOrder.date).toLocaleString()}</Text>
        ) : null}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: softBackground,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 16,
  },
  card: {
    backgroundColor: softSurface,
    borderRadius: 20,
    padding: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor,
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: textPrimary,
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: accentColor,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: accentColor,
    marginBottom: 8,
  },
  primaryText: {
    fontSize: 16,
    color: textPrimary,
    marginBottom: 4,
  },
  secondaryText: {
    fontSize: 14,
    color: textSecondary,
    marginBottom: 4,
  },
  description: {
    fontSize: 16,
    color: textSecondary,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 12,
  },
  rowItem: {
    flex: 1,
    padding: 12,
    backgroundColor: softBackground,
    borderRadius: 12,
  },
});

export default OrderTrackingScreen;
