import React, { useCallback, useMemo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList } from 'react-native';
import type { ListRenderItem } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ScaledSheet, s, vs } from 'react-native-size-matters';
import { Image } from 'expo-image';

import MainLayout from '~/layouts/MainLayout';
import { getMyOrders } from '~/api/orders';
import type { OrderDto } from '~/interfaces/Order';
import HeaderWithBackButton from '~/components/HeaderWithBackButton';

const accentColor = '#CA251B';
const primaryColor = '#17213A';
const PAGE_SIZE = 10;

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

  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['client', 'my-orders'],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getMyOrders({
        page: typeof pageParam === 'number' ? pageParam : Number(pageParam) || 1,
        pageSize: PAGE_SIZE,
      }),
    getNextPageParam: (lastPage) => {
      if (!lastPage) {
        return undefined;
      }

      if (lastPage.hasNext === false) {
        return undefined;
      }

      const nextPage = lastPage.page + 1;

      if (lastPage.hasNext === true) {
        return nextPage;
      }

      if (typeof lastPage.totalPages === 'number' && nextPage > lastPage.totalPages) {
        return undefined;
      }

      if (lastPage.items.length < lastPage.pageSize) {
        return undefined;
      }

      return nextPage;
    },
  });

  const orders = useMemo(() => {
    if (!data?.pages?.length) {
      return [] as OrderDto[];
    }

    const collected = data.pages.flatMap((page) => page.items ?? []);

    const parseDate = (value?: string) => {
      if (!value) {
        return 0;
      }

      const timestamp = Date.parse(value);
      return Number.isFinite(timestamp) ? timestamp : 0;
    };

    return collected.sort((a, b) => parseDate(b.createdAt) - parseDate(a.createdAt));
  }, [data]);

  const hasOrders = orders.length > 0;
  const isRefreshing = isFetching && !isLoading && !isFetchingNextPage;

  const handleRefresh = useCallback(() => {
    return refetch();
  }, [refetch]);

  const handleEndReached = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) {
      return;
    }

    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const renderOrderItem = useCallback<ListRenderItem<OrderDto>>(
    ({ item }) => (
      <View style={styles.orderCard}>
        <Image source={orderPlaceholder} style={styles.orderImage} contentFit="cover" />
        <View style={styles.orderContent}>
          <Text allowFontScaling={false} style={styles.orderName} numberOfLines={1}>
            {item.restaurantName}
          </Text>
          <Text allowFontScaling={false} style={styles.orderSummary} numberOfLines={2}>
            {buildOrderSummary(item)}
          </Text>
          <View style={styles.orderFooter}>
            <Text allowFontScaling={false} style={styles.orderTotal}>
              {formatOrderTotal(item.total)}
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.orderActionButton}
              onPress={() =>
                navigation.navigate('OrderTracking' as never, { orderId: item.id } as never)
              }
            >
              <Text allowFontScaling={false} style={styles.orderActionLabel}>
                See Details
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    ),
    [navigation],
  );

  const renderSeparator = useCallback(() => <View style={styles.orderSeparator} />, []);

  const renderEmptyState = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.stateWrapper}>
          <ActivityIndicator size="large" color={accentColor} />
          <Text allowFontScaling={false} style={styles.stateTitle}>
            Fetching your delicious memories...
          </Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.stateWrapper}>
          <Text allowFontScaling={false} style={styles.stateTitle}>
            We couldn’t load your orders.
          </Text>
          <Text allowFontScaling={false} style={styles.stateSubtitle}>
            Check your connection and try again in a moment.
          </Text>
          <TouchableOpacity activeOpacity={0.85} style={styles.retryButton} onPress={() => refetch()}>
            <Text allowFontScaling={false} style={styles.retryLabel}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
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
  }, [isLoading, isError, navigation, refetch]);

  const renderFooter = useCallback(() => {
    if (!hasOrders) {
      return null;
    }

    return (
      <View style={styles.listFooter}>
        {isFetchingNextPage ? (
          <ActivityIndicator size="small" color={accentColor} />
        ) : null}
        <View style={styles.footerSpacer} />
      </View>
    );
  }, [hasOrders, isFetchingNextPage]);

  const virtualizedListProps = useMemo(
    () => ({
      data: orders,
      keyExtractor: (item: OrderDto) => item.id.toString(),
      renderItem: renderOrderItem,
      ItemSeparatorComponent: renderSeparator,
      ListEmptyComponent: renderEmptyState,
      ListFooterComponent: renderFooter,
      contentContainerStyle: styles.ordersListContent,
      showsVerticalScrollIndicator: false,
      onEndReached: handleEndReached,
      onEndReachedThreshold: 0.35,
    }),
    [
      orders,
      renderOrderItem,
      renderSeparator,
      renderEmptyState,
      renderFooter,
      handleEndReached,
    ],
  );

  const mainContent = () => (
    <View style={{ flex: 1 }}>
      <FlatList
        {...virtualizedListProps}
        nestedScrollEnabled
        scrollEnabled={false}
      />
    </View>
  );

  const customHeader = (
    <View style={styles.header}>
      <HeaderWithBackButton title="Order History" titleMarginLeft={s(70)} />
    </View>
  )

  const continueOrderingButton = hasOrders ? (
    <View style={styles.continueContainer} pointerEvents="box-none">
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
  ) : undefined;

  return (
    <MainLayout
      showFooter
      enableHeaderCollapse={false}
      enforceResponsiveHeaderSize={false}
      headerMaxHeight={vs(80)}
      headerMinHeight={vs(30)}
      activeTab="Profile"
      customHeader={customHeader}
      mainContent={mainContent()}
      floatingContent={continueOrderingButton}
      onRefresh={handleRefresh}
      isRefreshing={isRefreshing}
    />
  );
};

const styles = ScaledSheet.create({
  header: {
    borderBottomColor: ' rgba(211, 211, 211, 0.4)',
    borderBottomWidth: 2,
  },
  stateWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '24@s',
    paddingBottom: '32@vs',
    gap: '16@vs',
    borderTopColor: '#F9FAFB',
    borderColor: '#F9FAFB',
    borderTopWidth: 2,
    borderBottomWidth: 0,
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
  ordersListContent: {
    flexGrow: 1,
    paddingHorizontal: '16@s',
    paddingBottom: '140@vs',
    paddingTop: '8@vs',

  },
  orderSeparator: {
    height: '16@vs',
  },
  orderCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: '18@ms',
    padding: '12@s',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    color: accentColor,
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
  listFooter: {
    paddingTop: '12@vs',
    alignItems: 'center',
  },
  footerSpacer: {
    height: '120@vs',
  },
  continueContainer: {
    width: '100%',
    paddingBottom: '8@vs',
  },
  continueButton: {
    backgroundColor: primaryColor,
    paddingVertical: '14@vs',
    borderRadius: '24@ms',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: 'rgba(15,23,42,0.15)',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  continueLabel: {
    color: '#FFFFFF',
    fontSize: '14@ms',
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default OrderHistoryScreen;
