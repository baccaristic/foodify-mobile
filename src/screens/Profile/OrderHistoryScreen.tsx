import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import type { ListRenderItem } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { ScaledSheet, s, vs } from 'react-native-size-matters';
import { Image } from 'expo-image';
import MainLayout from '~/layouts/MainLayout';
import { getMyOrders } from '~/api/orders';
import type { OrderDto, OrderItemDto } from '~/interfaces/Order';
import HeaderWithBackButton from '~/components/HeaderWithBackButton';
import OrderDetailsOverlay from '~/components/OrderDetailsOverlay';
import { useCart } from '~/context/CartContext';
import { useTranslation } from '~/localization';
import OrderHistorySkeleton from '~/components/skeletons/OrderHistorySkeleton';
import RemoteImageWithSkeleton from '~/components/RemoteImageWithSkeleton';

const accentColor = '#CA251B';
const primaryColor = '#17213A';
const PAGE_SIZE = 10;
const emptyIllustration = require('../../../assets/emptyHistory.png');

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const MAX_CARD_STAGGER = 8;

const formatOrderTotal = (total: OrderDto['total']) => {
  if (total == null) return '--';
  const parsed = typeof total === 'string' ? Number(total.replace(/,/g, '.')) : Number(total);
  if (!Number.isFinite(parsed)) return '--';
  return `${parsed.toLocaleString('en-US', { minimumFractionDigits: 0 })} DT`;
};

const buildOrderSummary = (order: OrderDto, fallback: string) => {
  if (!order?.items?.length) return order.restaurantAddress ?? fallback;
  const entries = order.items
    .filter((item) => item?.menuItemName)
    .map((item) => {
      const quantity = item.quantity && item.quantity > 1 ? `${item.quantity}x ` : '';
      return `${quantity}${item.menuItemName}`;
    });
  if (!entries.length) return order.restaurantAddress ?? fallback;
  const summary = entries.slice(0, 2).join(' • ');
  const remaining = order.items.length - 2;
  return remaining > 0 ? `${summary} • +${remaining} more` : summary;
};

const OrderHistoryScreen = () => {
  const navigation = useNavigation();
  const { addItem } = useCart();
  const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const { t } = useTranslation();

  const openOverlay = useCallback((order: OrderDto) => {
    setSelectedOrder(order);
    setOverlayVisible(true);
  }, []);

  const closeOverlay = useCallback(() => {
    setOverlayVisible(false);
    setSelectedOrder(null);
  }, []);

  const handleReorder = useCallback(
    (order: OrderDto) => {
      if (!order || !order.items?.length) return;
      order.items.forEach((it: OrderItemDto) => {
        addItem({
          restaurant: { id: order.restaurantId, name: order.restaurantName },
          menuItem: {
            id: it.menuItemId || 0,
            name: it.menuItemName || it.name || t('profile.orderHistory.fallbackItem'),
            description: '',
            imageUrl: (order as any).restaurantImage || null,
            price: Number(it.lineTotal) / (it.quantity || 1),
          },
          quantity: it.quantity || 1,
          extras: [],
        });
      });
      navigation.navigate('CheckoutOrder' as never);
    },
    [addItem, navigation, t],
  );

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
    initialPageParam: 0,
    queryFn: ({ pageParam }) =>
      getMyOrders({
        page: typeof pageParam === 'number' ? pageParam : Number(pageParam) || 0,
        pageSize: PAGE_SIZE,
      }),
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.hasNext === false) return undefined;
      const nextPage = lastPage.page + 1;
      if (typeof lastPage.totalPages === 'number' && nextPage > lastPage.totalPages) return undefined;
      if (lastPage.items.length < lastPage.pageSize) return undefined;
      return nextPage;
    },
  });

  const orders = useMemo(() => {
    if (!data?.pages?.length) return [] as OrderDto[];
    const collected = data.pages.flatMap((page) => page.items ?? []);
    const parseDate = (v?: string) => (v ? Date.parse(v) || 0 : 0);
    return collected.sort((a, b) => parseDate(b.createdAt) - parseDate(a.createdAt));
  }, [data]);

  const hasOrders = orders.length > 0;
  const isInitialLoading = isLoading && !data?.pages?.length;
  const isRefreshing = isFetching && !isLoading && !isFetchingNextPage;
  const handleRefresh = useCallback(() => refetch(), [refetch]);
  const handleEndReached = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage || isFetching) return;
    void fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetching, isFetchingNextPage]);

  const renderListFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={accentColor} />
      </View>
    );
  }, [isFetchingNextPage]);

  const renderOrderItem = useCallback<ListRenderItem<OrderDto>>(
    ({ item, index = 0 }) => {
      const isDelivered = item.status?.toUpperCase() === 'DELIVERED';
      const isCanceled = item.status?.toUpperCase() === 'CANCELED';
      const entranceDelay = Math.min(index ?? 0, MAX_CARD_STAGGER) * 80;
      const enteringAnimation = FadeInDown.springify()
        .damping(18)
        .stiffness(220)
        .mass(0.85)
        .withInitialValues({
          opacity: 0,
          transform: [{ translateY: -18 }, { scale: 0.94 }],
        })
        .delay(entranceDelay);

      return (
        <AnimatedTouchableOpacity
          entering={enteringAnimation}
          activeOpacity={0.9}
          style={styles.orderCard}
          onPress={() => openOverlay(item)}
        >
          <RemoteImageWithSkeleton
            imagePath={(item as { restaurantImage?: string | null }).restaurantImage}
            containerStyle={styles.orderImageContainer}
            skeletonStyle={styles.orderImageSkeleton}
          />
          <View style={styles.orderContent}>
            <Text allowFontScaling={false} style={styles.orderName} numberOfLines={1}>
              {item.restaurantName}
            </Text>
            <View style={styles.summaryRow}>
            <Text allowFontScaling={false} style={styles.orderSummary} numberOfLines={2}>
              {buildOrderSummary(item, t('profile.orderHistory.summaryFallback'))}
            </Text>
            {isDelivered && (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.orderActionButton}
                onPress={() => handleReorder(item)}
              >
                <Text allowFontScaling={false} style={styles.orderActionLabel}>
                  {t('profile.orderHistory.actions.reorder').toUpperCase()}
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <Text allowFontScaling={false} style={styles.totalStatusText}>
              {`${formatOrderTotal(item.total)} - `}
              <Text
                allowFontScaling={false}
                style={{
                  color: isDelivered ? 'green' : isCanceled ? accentColor : '#CA251B',
                  fontWeight: '600',
                }}
              >
                {item.status?.toUpperCase() || 'UNKNOWN'}
              </Text>
            </Text>
          </View>
        </AnimatedTouchableOpacity>
      );
    },
    [openOverlay, handleReorder, t],
  );

  const renderSeparator = useCallback(() => <View style={styles.orderSeparator} />, []);

  const renderEmptyState = useCallback(() => {
    if (isInitialLoading) {
      return <OrderHistorySkeleton />;
    }
    if (isError)
      return (
        <View style={styles.stateWrapper}>
          <Text allowFontScaling={false} style={styles.stateTitle}>
            {t('profile.orderHistory.states.errorTitle')}
          </Text>
          <Text allowFontScaling={false} style={styles.stateSubtitle}>
            {t('profile.orderHistory.states.errorSubtitle')}
          </Text>
          <TouchableOpacity activeOpacity={0.85} style={styles.retryButton} onPress={() => refetch()}>
            <Text allowFontScaling={false} style={styles.retryLabel}>
              {t('profile.orderHistory.actions.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      );
    return (
      <View style={styles.emptyBody}>
        <Image source={emptyIllustration} style={styles.emptyIllustration} contentFit="contain" />
        <Text allowFontScaling={false} style={styles.emptyTitle}>
          {t('profile.orderHistory.states.emptyTitle')}
        </Text>
        <Text allowFontScaling={false} style={styles.emptySubtitle}>
          {t('profile.orderHistory.states.emptySubtitle')}
        </Text>
        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Home' as never)}
        >
          <Text allowFontScaling={false} style={styles.primaryButtonLabel}>
            {t('profile.orderHistory.actions.startOrdering')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }, [isInitialLoading, isError, navigation, refetch, t]);

  const mainContent = <></>;

  const customHeader = (
    <View style={styles.header}>
      <HeaderWithBackButton title={t('profile.orderHistory.title')}  />
    </View>
  );

  const continueOrderingButton = hasOrders ? (
    <View style={styles.continueContainer} pointerEvents="box-none">
      <TouchableOpacity
        activeOpacity={0.9}
        style={styles.continueButton}
        onPress={() => navigation.navigate('Home' as never)}
      >
        <Text allowFontScaling={false} style={styles.continueLabel}>
          {t('profile.orderHistory.actions.continueOrdering')}
        </Text>
      </TouchableOpacity>
    </View>
  ) : undefined;

  return (
    <>
      <MainLayout
        showFooter
        enableHeaderCollapse={false}
        enforceResponsiveHeaderSize={false}
        headerMaxHeight={vs(80)}
        headerMinHeight={vs(30)}
        activeTab="Profile"
        customHeader={customHeader}
        mainContent={mainContent}
        virtualizedListProps={{
          data: orders,
          keyExtractor: (item) => item.id.toString(),
          renderItem: renderOrderItem,
          ItemSeparatorComponent: renderSeparator,
          ListEmptyComponent: renderEmptyState,
          ListFooterComponent: renderListFooter,
          contentContainerStyle: styles.ordersListContent,
          showsVerticalScrollIndicator: false,
          onEndReached: handleEndReached,
          onEndReachedThreshold: 0.35,
        }}
        floatingContent={continueOrderingButton}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />
      <OrderDetailsOverlay visible={overlayVisible} onClose={closeOverlay} order={selectedOrder} />
    </>
  );
};

const styles = ScaledSheet.create({
  header: { borderBottomColor: 'rgba(211,211,211,0.4)', borderBottomWidth: 2,numberOfLines:2  },
  orderCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: '16@ms',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3.84,
    elevation: 4,
    minHeight: vs(90),
  },
  orderImageContainer: { width: '90@s', height: '100%', alignSelf: 'stretch' },
  orderImageSkeleton: { borderRadius: 0 },
  orderContent: { flex: 1, padding: '10@s', justifyContent: 'center' },
  orderName: { fontSize: '15@ms', fontWeight: '700', color: primaryColor },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: vs(2),
  },
  orderSummary: { fontSize: '12@ms', color: primaryColor, flexShrink: 1, marginRight: '10@s' },
  orderActionButton: {
    backgroundColor: accentColor,
    paddingHorizontal: '10@s',
    paddingVertical: '6@vs',
    borderRadius: '10@ms',
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderActionLabel: { color: '#FFF', fontSize: '14@ms', fontWeight: '500' },
  totalStatusText: { fontSize: '14@ms', fontWeight: '700', color: accentColor, marginTop: vs(6) },
  orderSeparator: { height: '14@vs' },
  ordersListContent: { flexGrow: 1, paddingHorizontal: '16@s', paddingBottom: '140@vs', paddingTop: '8@vs' },
  footerLoader: { paddingVertical: '12@vs', alignItems: 'center', justifyContent: 'center' },
  stateWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: '24@s', gap: '16@vs' },
  stateTitle: { fontSize: '16@ms', fontWeight: '600', color: primaryColor, textAlign: 'center' },
  stateSubtitle: { fontSize: '13@ms', color: '#64748B', textAlign: 'center', marginTop: vs(2) },
  retryButton: {
    marginTop: '8@vs',
    backgroundColor: accentColor,
    paddingHorizontal: '24@s',
    paddingVertical: '10@vs',
    borderRadius: '20@ms',
  },
  retryLabel: { color: '#FFF', fontSize: '14@ms', fontWeight: '700' },
  emptyBody: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: '24@s', gap: '16@vs' },
  emptyIllustration: { width: '220@s', height: '180@vs' },
  emptyTitle: { fontSize: '18@ms', fontWeight: '700', color: primaryColor, textAlign: 'center' },
  emptySubtitle: { fontSize: '13@ms', color: '#64748B', textAlign: 'center', marginHorizontal: '12@s' },
  primaryButton: {
    marginTop: '12@vs',
    backgroundColor: primaryColor,
    paddingHorizontal: '28@s',
    paddingVertical: '12@vs',
    borderRadius: '22@ms',
  },
  primaryButtonLabel: { color: '#FFF', fontSize: '14@ms', fontWeight: '700' },
  continueContainer: { width: '100%', paddingBottom: '8@vs' },
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
  continueLabel: { color: '#FFF', fontSize: '14@ms', fontWeight: '700', letterSpacing: 0.3 },
});

export default OrderHistoryScreen;
