import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { ScaledSheet, s, vs } from 'react-native-size-matters';
import { Image } from 'expo-image';

import MainLayout from '~/layouts/MainLayout';
import { getMyOrders } from '~/api/orders';
import type { OrderDto } from '~/interfaces/Order';

const accentColor = '#CA251B';
const primaryColor = '#17213A';

const emptyIllustration = require('../../../assets/emptyHistory.png');
const orderPlaceholder = require('../../../assets/baguette.png');

const formatOrderTotal = (total: OrderDto['total']) => {
  if (total == null) {
    return '--';
  }

  const parsed =
    typeof total === 'string' ? Number(total.replace(/,/g, '.')) : Number(total);

  if (!Number.isFinite(parsed)) {
    return '--';
  }

  return `${parsed.toLocaleString('en-US', { minimumFractionDigits: 0 })} DT`;
};

const buildOrderSummary = (order: OrderDto) => {
  if (!order?.items?.length) {
    return order.restaurantAddress ?? 'Ready for pickup soon';
  }

  const entries = order.items
    .filter((item) => item?.menuItemName)
    .map((item) => {
      const quantity = item.quantity && item.quantity > 1 ? `${item.quantity}x ` : '';
      return `${quantity}${item.menuItemName}`;
    });

  if (!entries.length) {
    return order.restaurantAddress ?? 'Ready for pickup soon';
  }

  const summary = entries.slice(0, 2).join(' • ');
  const remaining = order.items.length - 2;
  return remaining > 0 ? `${summary} • +${remaining} more` : summary;
};

const OrderHistoryScreen = () => {
  const navigation = useNavigation();

  const { data, isLoading, isError, refetch, isFetching } = useQuery<OrderDto[]>({
    queryKey: ['client', 'my-orders'],
    queryFn: getMyOrders,
  });

  const orders = useMemo(() => {
    if (!data?.length) {
      return [] as OrderDto[];
    }

    const parseDate = (value?: string) => {
      if (!value) {
        return 0;
      }

      const timestamp = Date.parse(value);
      return Number.isFinite(timestamp) ? timestamp : 0;
    };

    return [...data].sort((a, b) => parseDate(b.createdAt) - parseDate(a.createdAt));
  }, [data]);

  const hasOrders = orders.length > 0;

  let content: React.ReactNode;

  if (isLoading) {
    content = (
      <View style={styles.stateWrapper}>
        <ActivityIndicator size="large" color={accentColor} />
        <Text allowFontScaling={false} style={styles.stateTitle}>
          Fetching your delicious memories...
        </Text>
      </View>
    );
  } else if (isError) {
    content = (
      <View style={styles.stateWrapper}>
        <Text allowFontScaling={false} style={styles.stateTitle}>
          We couldn’t load your orders.
        </Text>
        <Text allowFontScaling={false} style={styles.stateSubtitle}>
          Check your connection and try again in a moment.
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.retryButton}
          onPress={() => refetch()}
        >
          <Text allowFontScaling={false} style={styles.retryLabel}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  } else if (!hasOrders) {
    content = (
      <View style={styles.emptyBody}>
        <Image source={emptyIllustration} style={styles.emptyIllustration} contentFit="contain" />
        <Text allowFontScaling={false} style={styles.emptyTitle}>
          Your order history is empty
        </Text>
        <Text allowFontScaling={false} style={styles.emptySubtitle}>
          Every great meal begins with a first click. Browse top-rated restaurants and build your flavor legacy today.
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Home' as never)}
        >
          <Text allowFontScaling={false} style={styles.primaryButtonLabel}>
            Start Ordering
          </Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    content = (
      <View style={styles.ordersWrapper}>
        {orders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            <Image source={orderPlaceholder} style={styles.orderImage} contentFit="cover" />
            <View style={styles.orderContent}>
              <Text allowFontScaling={false} style={styles.orderName} numberOfLines={1}>
                {order.restaurantName}
              </Text>
              <Text allowFontScaling={false} style={styles.orderSummary} numberOfLines={2}>
                {buildOrderSummary(order)}
              </Text>
              <View style={styles.orderFooter}>
                <Text allowFontScaling={false} style={styles.orderTotal}>
                  {formatOrderTotal(order.total)}
                </Text>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.orderActionButton}
                  onPress={() => navigation.navigate('OrderTracking' as never)}
                >
                  <Text allowFontScaling={false} style={styles.orderActionLabel}>
                    See Details
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.continueButton}
          onPress={() => navigation.navigate('Home' as never)}
        >
          <Text allowFontScaling={false} style={styles.continueLabel}>
            Continue Ordering
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <MainLayout
      showFooter
      enableHeaderCollapse={false}
      headerMaxHeight={vs(110)}
      headerMinHeight={vs(90)}
      activeTab="Profile"
      headerBackgroundImage={require('../../../assets/background.png')}
      customHeader={
        <View style={styles.headerBar}>
          <TouchableOpacity
            style={styles.headerBack}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <ArrowLeft size={s(18)} color="#FFFFFF" />
          </TouchableOpacity>
          <Text allowFontScaling={false} style={styles.headerTitle}>
            Order History
          </Text>
          <View style={{ width: s(32) }} />
        </View>
      }
      mainContent={content}
      onRefresh={refetch}
      isRefreshing={isFetching}
    />
  );
};

const styles = ScaledSheet.create({
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: '16@s',
    paddingTop: vs(24),
    paddingBottom: vs(16),
  },
  headerBack: {
    width: '32@s',
    height: '32@s',
    borderRadius: '16@s',
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: '#FFFFFF',
  },
  stateWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '24@s',
    paddingBottom: '32@vs',
    gap: '16@vs',
  },
  stateTitle: {
    fontSize: '16@ms',
    fontWeight: '600',
    color: primaryColor,
    textAlign: 'center',
  },
  stateSubtitle: {
    fontSize: '13@ms',
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: '20@vs',
    paddingHorizontal: '12@s',
  },
  retryButton: {
    marginTop: '8@vs',
    backgroundColor: accentColor,
    paddingHorizontal: '24@s',
    paddingVertical: '10@vs',
    borderRadius: '20@ms',
  },
  retryLabel: {
    color: '#FFFFFF',
    fontSize: '14@ms',
    fontWeight: '700',
  },
  emptyBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '24@s',
    paddingBottom: '32@vs',
    gap: '16@vs',
  },
  emptyIllustration: {
    width: '220@s',
    height: '180@vs',
  },
  emptyTitle: {
    fontSize: '18@ms',
    fontWeight: '700',
    color: primaryColor,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: '13@ms',
    color: '#4B5563',
    textAlign: 'center',
    lineHeight: '20@vs',
    marginHorizontal: '12@s',
  },
  primaryButton: {
    marginTop: '12@vs',
    backgroundColor: primaryColor,
    paddingHorizontal: '28@s',
    paddingVertical: '12@vs',
    borderRadius: '22@ms',
  },
  primaryButtonLabel: {
    color: '#FFFFFF',
    fontSize: '14@ms',
    fontWeight: '700',
  },
  ordersWrapper: {
    flex: 1,
    paddingHorizontal: '16@s',
    paddingBottom: '32@vs',
    paddingTop: '8@vs',
    gap: '16@vs',
  },
  orderCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: '18@ms',
    padding: '12@s',
    alignItems: 'center',
    shadowColor: 'rgba(15,23,42,0.08)',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
    gap: '12@s',
  },
  orderImage: {
    width: '72@s',
    height: '72@s',
    borderRadius: '16@s',
  },
  orderContent: {
    flex: 1,
    gap: '6@vs',
  },
  orderName: {
    fontSize: '15@ms',
    fontWeight: '700',
    color: primaryColor,
  },
  orderSummary: {
    fontSize: '12@ms',
    color: '#6B7280',
  },
  orderFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12@s',
  },
  orderTotal: {
    fontSize: '15@ms',
    fontWeight: '700',
    color: primaryColor,
  },
  orderActionButton: {
    backgroundColor: accentColor,
    paddingHorizontal: '16@s',
    paddingVertical: '8@vs',
    borderRadius: '18@ms',
  },
  orderActionLabel: {
    color: '#FFFFFF',
    fontSize: '12@ms',
    fontWeight: '700',
  },
  continueButton: {
    marginTop: '8@vs',
    backgroundColor: primaryColor,
    paddingVertical: '14@vs',
    borderRadius: '24@ms',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueLabel: {
    color: '#FFFFFF',
    fontSize: '14@ms',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default OrderHistoryScreen;
