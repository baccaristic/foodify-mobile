import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Modal,
} from 'react-native';
import {
  Pizza,
  Hamburger,
  Search,
  Utensils,
  Bike,
  Soup,
  Croissant,
  Sunrise,
  Drumstick,
  CupSoda,
  Flame,
  IceCreamCone,
  ChefHat,
  Globe,
  UtensilsCrossed,
  Salad,
  Sandwich,
  Fish,
  FishSymbol,
  Cookie,
  CakeSlice,
  Coffee,
  Sprout,
  Percent,
  X,
  ArrowUp,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import MainLayout from "~/layouts/MainLayout";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Animated, { FadeIn, FadeInDown, FadeInUp } from "react-native-reanimated";
import { Image } from "expo-image";
import { ScaledSheet, moderateScale, s, vs } from "react-native-size-matters";
import Header from "~/components/Header";
import RestaurantShowcaseCard from '~/components/RestaurantShowcaseCard';
import SystemStatusOverlay from '~/components/SystemStatusOverlay';
import {
  getNearbyFavoriteRestaurants,
  getNearbyPromotionsPage,
  getNearbyRecentOrderRestaurants,
  getNearbyRestaurantsPage,
  getNearbyTopRestaurants,
} from "~/api/restaurants";
import { getDeliveryNetworkStatus } from '~/api/delivery';
import { PageResponse, RestaurantCategory, RestaurantDisplayDto } from "~/interfaces/Restaurant";
import type {
  DeliveryNetworkStatus,
  DeliveryNetworkStatusResponse,
} from '~/interfaces/DeliveryStatus';
import { BASE_API_URL } from "@env";
import CategoryOverlay from '~/components/CategoryOverlay';
import useSelectedAddress from '~/hooks/useSelectedAddress';
import useLocationOverlay from '~/hooks/useLocationOverlay';
import { useTranslation } from '~/localization';
import { getCategoryLabelKey, toCategoryDisplayName } from '~/localization/categoryKeys';
import HomeSkeleton from '~/components/skeletons/HomeSkeleton';
import SkeletonPulse from '~/components/skeletons/SkeletonPulse';
import {
  getAcknowledgedDeliveryStatus,
  getCachedDeliveryStatus,
  setAcknowledgedDeliveryStatus,
  setCachedDeliveryStatus,
} from '~/storage/deliveryNetworkStatusCache';

type QuickCategoryItem = {
  key: string;
  label: string;
  Icon: LucideIcon;
  onPress: () => void;
  iconBackgroundColor: string;
  iconTintColor: string;
  isDiscount?: boolean;
};

const SECTION_LABEL_KEYS = {
  top: 'home.sections.top',
  favorites: 'home.sections.favorites',
  orders: 'home.sections.orders',
  restaurants: 'home.sections.restaurants',
} as const;

type SectionKey = keyof typeof SECTION_LABEL_KEYS;

const CATEGORY_ICON_MAP: Partial<Record<RestaurantCategory, LucideIcon>> = {
  [RestaurantCategory.ASIAN]: Soup,
  [RestaurantCategory.BAKERY]: Croissant,
  [RestaurantCategory.BREAKFAST]: Sunrise,
  [RestaurantCategory.BURGERS]: Hamburger,
  [RestaurantCategory.CHICKEN]: Drumstick,
  [RestaurantCategory.FAST_FOOD]: CupSoda,
  [RestaurantCategory.GRILL]: Flame,
  [RestaurantCategory.ICE_CREAM]: IceCreamCone,
  [RestaurantCategory.INDIAN]: ChefHat,
  [RestaurantCategory.INTERNATIONAL]: Globe,
  [RestaurantCategory.ITALIAN]: UtensilsCrossed,
  [RestaurantCategory.MEXICAN]: UtensilsCrossed,
  [RestaurantCategory.ORIENTAL]: Sprout,
  [RestaurantCategory.PASTA]: Utensils,
  [RestaurantCategory.PIZZA]: Pizza,
  [RestaurantCategory.SALDAS]: Salad,
  [RestaurantCategory.SADWICH]: Sandwich,
  [RestaurantCategory.SEAFOOD]: Fish,
  [RestaurantCategory.SNACKS]: Cookie,
  [RestaurantCategory.SUSHI]: FishSymbol,
  [RestaurantCategory.SWEETS]: CakeSlice,
  [RestaurantCategory.TACOS]: Utensils,
  [RestaurantCategory.TEA_COFFEE]: Coffee,
  [RestaurantCategory.TRADITIONAL]: ChefHat,
  [RestaurantCategory.TUNISIAN]: Soup,
  [RestaurantCategory.TURKISH]: ChefHat,
};

const toSectionLabel = (key: SectionKey, translate: (value: string) => string) => {
  return translate(SECTION_LABEL_KEYS[key]);
};

const INITIAL_PAGE = 0;
const PAGE_SIZE = 5;

const DELIVERY_STATUS_SEVERITY: Record<DeliveryNetworkStatus, number> = {
  AVAILABLE: 0,
  BUSY: 1,
  NO_DRIVERS_AVAILABLE: 2,
};

export default function HomePage() {
  const navigation = useNavigation();
  const { open: openLocationOverlay } = useLocationOverlay();
  const { t } = useTranslation();

  const [selectedCategory, setSelectedCategory] = useState<RestaurantCategory | null>(null);
  const [isPromotionsVisible, setPromotionsVisible] = useState(false);
  const listRef = useRef<FlatList>(null);

  const handleCategoryPress = useCallback((category: RestaurantCategory) => {
    setSelectedCategory(category);
  }, []);

  const handleDiscountPress = useCallback(() => {
    setPromotionsVisible(true);
  }, []);

  const closePromotionsOverlay = useCallback(() => {
    setPromotionsVisible(false);
  }, []);

  const discountLabel = useMemo(() => t('home.categories.discount'), [t]);
  const discountLabelLower = useMemo(() => discountLabel.toLowerCase(), [discountLabel]);

  const quickCategories = useMemo<QuickCategoryItem[]>(() => {
    const discountItem: QuickCategoryItem = {
      key: 'promotions',
      label: discountLabel,
      Icon: Percent,
      onPress: handleDiscountPress,
      iconBackgroundColor: '#FACC15',
      iconTintColor: '#FFFFFF',
      isDiscount: true,
    };

    const categoryItems = (Object.values(RestaurantCategory) as RestaurantCategory[]).map((category) => {
      const labelKey = getCategoryLabelKey(category);
      const label = labelKey ? t(labelKey) : toCategoryDisplayName(category);
      const Icon = CATEGORY_ICON_MAP[category] ?? Utensils;

      return {
        key: category,
        label,
        Icon,
        onPress: () => handleCategoryPress(category),
        iconBackgroundColor: '#FFFFFF',
        iconTintColor: '#CA251B',
      } satisfies QuickCategoryItem;
    });

    return [discountItem, ...categoryItems];
  }, [discountLabel, handleCategoryPress, handleDiscountPress, t]);

  const renderQuickCategoryItem = useCallback(({ item }: { item: QuickCategoryItem }) => {
    return (
      <TouchableOpacity
        style={styles.categoryEqualWidth}
        onPress={item.onPress}
        activeOpacity={0.88}
      >
        <View
          style={[
            styles.categoryIconWrapper,
            { backgroundColor: item.iconBackgroundColor },
            item.isDiscount ? styles.discountIconWrapper : null,
          ]}
        >
          <item.Icon size={s(28)} color={item.iconTintColor} />
        </View>
        <View style={styles.categoryTextContainer}>
          <Text
            allowFontScaling={false}
            style={[styles.categoryLabelFixed, item.isDiscount ? styles.discountCategoryLabel : null]}
            numberOfLines={2}
          >
            {item.label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, []);

  const { selectedAddress } = useSelectedAddress();
  const screenWidth = Dimensions.get('screen').width;

  const userLatitude = selectedAddress?.coordinates.latitude;
  const userLongitude = selectedAddress?.coordinates.longitude;

  const {
    data: deliveryStatusData,
    refetch: refetchDeliveryStatus,
    isFetched: isDeliveryStatusFetched,
    isError: isDeliveryStatusError,
  } = useQuery<DeliveryNetworkStatusResponse>({
    queryKey: ['delivery-network-status'],
    queryFn: getDeliveryNetworkStatus,
    staleTime: 60_000,
    refetchOnMount: 'always',
  });

  const deliveryNetworkStatus = deliveryStatusData?.status ?? 'AVAILABLE';
  const deliveryStatusMessage = deliveryStatusData?.message ?? null;

  const [isSystemStatusDismissed, setSystemStatusDismissed] = useState(false);
  const [shouldShowSystemStatusOverlay, setShouldShowSystemStatusOverlay] = useState(false);
  const [hasHydratedStatusCache, setHasHydratedStatusCache] = useState(false);
  const acknowledgedDeliveryStatusRef = useRef<DeliveryNetworkStatus | null>(null);

  useEffect(() => {
    let isMounted = true;

    (async () => {
      try {
        const [cachedStatus, acknowledgedStatus] = await Promise.all([
          getCachedDeliveryStatus(),
          getAcknowledgedDeliveryStatus(),
        ]);

        if (isMounted) {
          if (acknowledgedStatus) {
            acknowledgedDeliveryStatusRef.current = acknowledgedStatus;
          } else if (cachedStatus) {
            acknowledgedDeliveryStatusRef.current = cachedStatus;
          }
        }
      } finally {
        if (isMounted) {
          setHasHydratedStatusCache(true);
        }
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!deliveryStatusData || isDeliveryStatusError || !hasHydratedStatusCache) {
      return;
    }

    const currentStatus = deliveryStatusData.status;
    const currentSeverity = DELIVERY_STATUS_SEVERITY[currentStatus] ?? 0;
    const acknowledgedStatus = acknowledgedDeliveryStatusRef.current;

    let acknowledgedSeverity = acknowledgedStatus
      ? DELIVERY_STATUS_SEVERITY[acknowledgedStatus] ?? 0
      : -1;

    if (acknowledgedStatus && currentSeverity < acknowledgedSeverity) {
      acknowledgedDeliveryStatusRef.current = currentStatus;
      acknowledgedSeverity = currentSeverity;
      setAcknowledgedDeliveryStatus(currentStatus).catch(() => undefined);
    }

    const shouldShowOverlay =
      currentStatus !== 'AVAILABLE' && currentSeverity > acknowledgedSeverity;

    if (currentStatus === 'AVAILABLE' && acknowledgedStatus !== 'AVAILABLE') {
      acknowledgedDeliveryStatusRef.current = 'AVAILABLE';
      setAcknowledgedDeliveryStatus('AVAILABLE').catch(() => undefined);
    }

    if (shouldShowOverlay) {
      setSystemStatusDismissed(false);
    }

    setShouldShowSystemStatusOverlay(shouldShowOverlay);
    setCachedDeliveryStatus(currentStatus).catch(() => undefined);
  }, [
    deliveryStatusData,
    hasHydratedStatusCache,
    isDeliveryStatusError,
  ]);

  useEffect(() => {
    if (!shouldShowSystemStatusOverlay) {
      setSystemStatusDismissed(false);
    }
  }, [shouldShowSystemStatusOverlay]);

  const handleDismissSystemStatusOverlay = useCallback(() => {
    acknowledgedDeliveryStatusRef.current = deliveryNetworkStatus;
    setAcknowledgedDeliveryStatus(deliveryNetworkStatus).catch(() => undefined);
    setSystemStatusDismissed(true);
  }, [deliveryNetworkStatus]);

  useFocusEffect(
    useCallback(() => {
      if (isDeliveryStatusFetched) {
        refetchDeliveryStatus();
      }
    }, [isDeliveryStatusFetched, refetchDeliveryStatus])
  );

  const hasValidCoordinates =
    typeof userLatitude === 'number' &&
    Number.isFinite(userLatitude) &&
    typeof userLongitude === 'number' &&
    Number.isFinite(userLongitude);

  const topQuery = useQuery<RestaurantDisplayDto[]>({
    queryKey: ['nearby-restaurants', 'top', userLatitude, userLongitude],
    queryFn: () =>
      getNearbyTopRestaurants({
        lat: userLatitude as number,
        lng: userLongitude as number,
      }),
    enabled: hasValidCoordinates,
    staleTime: 60_000,
  });

  const favoritesQuery = useQuery<RestaurantDisplayDto[]>({
    queryKey: ['nearby-restaurants', 'favorites', userLatitude, userLongitude],
    queryFn: () =>
      getNearbyFavoriteRestaurants({
        lat: userLatitude as number,
        lng: userLongitude as number,
      }),
    enabled: hasValidCoordinates,
    staleTime: 60_000,
  });

  const recentOrdersQuery = useQuery<RestaurantDisplayDto[]>({
    queryKey: ['nearby-restaurants', 'orders', userLatitude, userLongitude],
    queryFn: () =>
      getNearbyRecentOrderRestaurants({
        lat: userLatitude as number,
        lng: userLongitude as number,
      }),
    enabled: hasValidCoordinates,
    staleTime: 60_000,
  });

  const restaurantsQuery = useInfiniteQuery<PageResponse<RestaurantDisplayDto>>({
    queryKey: ['nearby-restaurants', 'list', userLatitude, userLongitude],
    queryFn: ({ pageParam = INITIAL_PAGE }) =>
      getNearbyRestaurantsPage({
        lat: userLatitude as number,
        lng: userLongitude as number,
        page: pageParam,
        pageSize: PAGE_SIZE,
      }),
    getNextPageParam: (lastPage) => {
      if (!lastPage || lastPage.items.length === 0) {
        return undefined;
      }

      const fetchedItems = (lastPage.page + 1) * lastPage.pageSize;

      if (fetchedItems >= lastPage.totalItems) {
        return undefined;
      }

      return lastPage.page + 1;
    },
    initialPageParam: INITIAL_PAGE,
    enabled: hasValidCoordinates,
  });

  const promotionsQuery = useInfiniteQuery<PageResponse<RestaurantDisplayDto>>({
    queryKey: ['nearby-promotions', userLatitude, userLongitude],
    queryFn: ({ pageParam = INITIAL_PAGE }) =>
      getNearbyPromotionsPage({
        lat: userLatitude as number,
        lng: userLongitude as number,
        page: pageParam,
        pageSize: PAGE_SIZE,
      }),
    getNextPageParam: (lastPage) => {
      if (!lastPage || !lastPage.items || lastPage.items.length === 0) {
        return undefined;
      }

      const nextPageIndex = lastPage.page + 1;
      const estimatedFetchedItems = nextPageIndex * lastPage.pageSize;

      if (estimatedFetchedItems >= lastPage.totalItems) {
        return undefined;
      }

      return nextPageIndex;
    },
    initialPageParam: INITIAL_PAGE,
    enabled: isPromotionsVisible && hasValidCoordinates,
  });

  const {
    fetchNextPage: fetchNextPromotionsPage,
    hasNextPage: promotionsHasNextPage,
    isFetchingNextPage: promotionsIsFetchingNextPage,
    isLoading: promotionsIsLoading,
    isError: promotionsIsError,
    refetch: refetchPromotions,
    isRefetching: promotionsIsRefetching,
  } = promotionsQuery;

  const topRestaurants = useMemo(() => topQuery.data ?? [], [topQuery.data]);
  const favoriteRestaurants = useMemo(
    () => favoritesQuery.data ?? [],
    [favoritesQuery.data]
  );
  const recentOrderRestaurants = useMemo(
    () => recentOrdersQuery.data ?? [],
    [recentOrdersQuery.data]
  );
  const otherRestaurants = useMemo(
    () => restaurantsQuery.data?.pages.flatMap((page) => page.items) ?? [],
    [restaurantsQuery.data]
  );

  const promotionRestaurants = useMemo(
    () => promotionsQuery.data?.pages.flatMap((page) => page.items ?? []) ?? [],
    [promotionsQuery.data]
  );

  const showPromotionsLoading = promotionsIsLoading && promotionRestaurants.length === 0;
  const showPromotionsError = promotionsIsError && promotionRestaurants.length === 0;
  const showPromotionsEmpty =
    !promotionsIsLoading && !promotionsIsError && promotionRestaurants.length === 0;

  type NearbyListItem =
    | {
        type: 'topSection';
        key: string;
        title: string;
        restaurants: RestaurantDisplayDto[];
      }
    | { type: 'carouselSection'; key: string; title: string; restaurants: RestaurantDisplayDto[] }
    | { type: 'othersHeader'; key: string; title: string }
    | { type: 'restaurant'; key: string; restaurant: RestaurantDisplayDto; position: number };

  const listData = useMemo(() => {
    const items: NearbyListItem[] = [];

    if (topRestaurants.length > 0) {
      items.push({
        type: 'topSection',
        key: 'top',
        title: toSectionLabel('top', t),
        restaurants: topRestaurants,
      });
    }

    if (favoriteRestaurants.length > 0) {
      items.push({
        type: 'topSection',
        key: 'favorites',
        title: toSectionLabel('favorites', t),
        restaurants: favoriteRestaurants,
      });
    }

    if (recentOrderRestaurants.length > 0) {
      items.push({
        type: 'carouselSection',
        key: 'orders',
        title: toSectionLabel('orders', t),
        restaurants: recentOrderRestaurants,
      });
    }

    if (otherRestaurants.length > 0) {
      items.push({
        type: 'othersHeader',
        key: 'restaurants-header',
        title: toSectionLabel('restaurants', t),
      });

      otherRestaurants.forEach((restaurant, index) => {
        items.push({
          type: 'restaurant',
          key: `restaurant-${restaurant.id}-${index}`,
          restaurant,
          position: index,
        });
      });
    }

    return items;
  }, [favoriteRestaurants, otherRestaurants, recentOrderRestaurants, t, topRestaurants]);

  const isLoading =
    topQuery.isLoading ||
    favoritesQuery.isLoading ||
    recentOrdersQuery.isLoading ||
    restaurantsQuery.isLoading;

  const isError =
    topQuery.isError ||
    favoritesQuery.isError ||
    recentOrdersQuery.isError ||
    restaurantsQuery.isError;

  const isRefetching =
    topQuery.isRefetching ||
    favoritesQuery.isRefetching ||
    recentOrdersQuery.isRefetching ||
    restaurantsQuery.isRefetching;

  const isFetchingNextPage = restaurantsQuery.isFetchingNextPage;

  const handleEndReached = useCallback(() => {
    if (!hasValidCoordinates) {
      return;
    }

    if (restaurantsQuery.hasNextPage && !restaurantsQuery.isFetchingNextPage) {
      restaurantsQuery.fetchNextPage();
    }
  }, [hasValidCoordinates, restaurantsQuery]);

  const refetchAll = useCallback(() => {
    if (!hasValidCoordinates) {
      return Promise.resolve();
    }

    return Promise.all([
      topQuery.refetch(),
      favoritesQuery.refetch(),
      recentOrdersQuery.refetch(),
      restaurantsQuery.refetch(),
    ]);
  }, [favoritesQuery, hasValidCoordinates, recentOrdersQuery, restaurantsQuery, topQuery]);

  const renderRestaurantCard = useCallback(
    (
      restaurant: RestaurantDisplayDto,
      options?: { width?: number | string; index?: number }
    ) => {
      const cardWidth = options?.width ?? screenWidth * 0.9;
      const delay = Math.min(options?.index ?? 0, 6) * 70;

      return (
        <Animated.View entering={FadeInUp.delay(delay).duration(450)}>
          <RestaurantShowcaseCard
            name={restaurant.name}
            description={restaurant.description}
            address={restaurant.address}
            rating={restaurant.rating}
            type={restaurant.type}
            imageUrl={restaurant.imageUrl}
            fallbackImageUrl={restaurant.iconUrl}
            openingHours={restaurant.openingHours}
            closingHours={restaurant.closingHours}
            width={cardWidth}
            onPress={() =>
              navigation.navigate('RestaurantDetails' as never, {
                restaurantId: restaurant.id,
              } as never)
            }
          />
        </Animated.View>
      );
    },
    [navigation, screenWidth]
  );

  const renderPromotionItem = useCallback(
    ({ item, index }: { item: RestaurantDisplayDto; index: number }) => {
      return (
        <View style={styles.promotionsCardWrapper}>
          {renderRestaurantCard(item, { index })}
        </View>
      );
    },
    [renderRestaurantCard]
  );

  const handlePromotionsEndReached = useCallback(() => {
    if (!hasValidCoordinates) {
      return;
    }

    if (promotionsHasNextPage && !promotionsIsFetchingNextPage) {
      fetchNextPromotionsPage();
    }
  }, [fetchNextPromotionsPage, hasValidCoordinates, promotionsHasNextPage, promotionsIsFetchingNextPage]);

  const renderPromotionsFooter = useCallback(() => {
    if (!promotionsIsFetchingNextPage) {
      return null;
    }

    return (
      <View style={styles.promotionsFooterLoader}>
        <ActivityIndicator size="small" color="#CA251B" />
      </View>
    );
  }, [promotionsIsFetchingNextPage]);

  const compactRestaurantCardWidth = useMemo(() => s(240), []);

  const renderTopPickCard = useCallback(
    (restaurant: RestaurantDisplayDto, options?: { index?: number }) => {
      const deliveryFee =
        typeof restaurant.deliveryFee === 'number' && Number.isFinite(restaurant.deliveryFee)
          ? restaurant.deliveryFee
          : 0;
      const deliveryLabel =
        deliveryFee > 0
          ? `${deliveryFee.toFixed(3).replace('.', ',')} DT`
          : t('home.delivery.free');

      const topPickImagePath = restaurant.iconUrl || restaurant.imageUrl;
      const delay = Math.min(options?.index ?? 0, 6) * 70;

      return (
        <Animated.View entering={FadeInDown.delay(delay).duration(450)}>
          <TouchableOpacity
            style={styles.topPickCard}
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate('RestaurantDetails' as never, {
                restaurantId: restaurant.id,
              } as never)
            }
          >
            <View style={styles.topPickMedia}>
              <Image
                source={
                  topPickImagePath
                    ? { uri: `${BASE_API_URL}/auth/image/${topPickImagePath}` }
                    : require('../../assets/baguette.png')
                }
                style={styles.topPickImage}
                contentFit="cover"
              />
            </View>
            <Text allowFontScaling={false} style={styles.topPickTitle} numberOfLines={1}>
              {restaurant.name}
            </Text>
            {(restaurant.type || restaurant.description) ? (
              <Text allowFontScaling={false} style={styles.topPickSubtitle} numberOfLines={1}>
                {restaurant.type || restaurant.description}
              </Text>
            ) : null}
            <Bike size={s(14)} color="#CA251B" />
            <Text allowFontScaling={false} style={styles.topPickMetaText} numberOfLines={1}>
              {deliveryLabel}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      );
    },
    [navigation, t],
  );

  const renderItem = useCallback(
    ({ item }: { item: NearbyListItem }) => {
      if (item.type === 'topSection') {
        return (
          <View style={styles.mainWrapper}>
            <View style={styles.sectionHeader}>
              <Text allowFontScaling={false} style={styles.sectionTitle}>{item.title}</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselList}
            >
              {item.restaurants.map((restaurant, index) => (
                <View key={restaurant.id} style={styles.topPickCarouselItem}>
                  {renderTopPickCard(restaurant, { index })}
                </View>
              ))}
            </ScrollView>
          </View>
        );
      }

      if (item.type === 'carouselSection') {
        return (
          <View style={styles.mainWrapper}>
            <View style={styles.sectionHeader}>
              <Text allowFontScaling={false} style={styles.sectionTitle}>{item.title}</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.carouselList}
            >
              {item.restaurants.map((restaurant, index) => (
                <View key={restaurant.id} style={styles.carouselCardContainer}>
                  {renderRestaurantCard(restaurant, {
                    width: compactRestaurantCardWidth,
                    index,
                  })}
                </View>
              ))}
            </ScrollView>
          </View>
        );
      }

      if (item.type === 'othersHeader') {
        return (
          <View style={styles.mainWrapper}>
            <View style={styles.sectionHeader}>
              <Text allowFontScaling={false} style={styles.sectionTitle}>{item.title}</Text>
            </View>
          </View>
        );
      }

      return (
        <View style={styles.mainWrapper}>
          <View style={styles.cardContainer}>
            {renderRestaurantCard(item.restaurant, { index: item.position })}
          </View>
        </View>
      );
    },
    [compactRestaurantCardWidth, renderRestaurantCard, renderTopPickCard]
  );

  const renderListEmpty = useCallback(() => {
    if (!hasValidCoordinates) {
      return (
        <View style={styles.mainWrapper}>
          <View style={styles.addressPrompt}>
            <Text allowFontScaling={false} style={styles.addressPromptTitle}>
              {t('home.addressPrompt.title')}
            </Text>
            <Text allowFontScaling={false} style={styles.addressPromptSubtitle}>
              {t('home.addressPrompt.subtitle')}
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.addressPromptButton}
              onPress={openLocationOverlay}
            >
              <Text allowFontScaling={false} style={styles.addressPromptButtonLabel}>
                {t('home.addressPrompt.cta')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    if (isLoading) {
      return <HomeSkeleton />;
    }

    if (isError) {
      return (
        <View style={styles.mainWrapper}>
          <View style={styles.errorWrapper}>
            <Text allowFontScaling={false} style={styles.errorTitle}>
              {t('home.error.title')}
            </Text>
            <TouchableOpacity activeOpacity={0.8} style={styles.retryButton} onPress={() => refetchAll()}>
              <Text allowFontScaling={false} style={styles.retryLabel}>{t('home.error.action')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.mainWrapper}>
        <View style={styles.emptyWrapper}>
          <Text allowFontScaling={false} style={styles.emptyTitle}>
            {t('home.empty.title')}
          </Text>
          <Text allowFontScaling={false} style={styles.emptySubtitle}>
            {t('home.empty.subtitle')}
          </Text>
        </View>
      </View>
    );
  }, [hasValidCoordinates, isError, isLoading, openLocationOverlay, refetchAll, t]);

  const renderListFooter = useCallback(() => {
    if (!isFetchingNextPage) {
      return null;
    }

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#CA251B" />
      </View>
    );
  }, [isFetchingNextPage]);

  const mainContent = <></>;

  const customHeader = (
    <Animated.View entering={FadeIn.duration(500)}>
      <View style={styles.headerWrapper}>
        <Header
          title={t('home.header.chooseAddress')}
          onBack={() => console.log('not working now !')}
          compact
        />
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('Search' as never)}
        >
          <Text allowFontScaling={false} style={styles.searchPlaceholder}>
            {t('home.search.prompt')}
          </Text>
          <Search size={s(18)} color="black" />
        </TouchableOpacity>
        <FlatList
          horizontal
          data={quickCategories}
          renderItem={renderQuickCategoryItem}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          style={styles.categoryList}
        />
      </View>
    </Animated.View>
  );

  const collapsedHeader = (
    <View style={styles.collapsedHeader}>
      
      <TouchableOpacity style={styles.collapsedUp} onPress={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })} >
        <ArrowUp size={s(16)} color="#17213A" />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.collapsedSearch}
        onPress={() => navigation.navigate('Search' as never)}
      >
        <Text style={styles.collapsedPlaceholder}>{t('home.search.collapsedPlaceholder')}</Text>
        <Search size={s(18)} color="gray" style={{ marginLeft: s(120) }} />
      </TouchableOpacity>
    </View>
  );


  return (
    <>
      <MainLayout
        headerBackgroundImage={require("../../assets/pattern1.png")}
        showHeader
        showFooter
        headerMaxHeight={vs(160)}
        headerMinHeight={vs(120)}
        customHeader={customHeader}
        collapsedHeader={collapsedHeader}
        onRefresh={refetchAll}
        isRefreshing={isRefetching}
        mainContent={mainContent}
        virtualizedListProps={{
          data: listData,
          ref: listRef,
          renderItem,
          keyExtractor: (item) => item.key,
          ListEmptyComponent: renderListEmpty,
          ListFooterComponent: renderListFooter,
          onEndReached: handleEndReached,
          onEndReachedThreshold: 0.4,
          showsVerticalScrollIndicator: false,
          contentContainerStyle: styles.listContent,
        }}
      />
      <SystemStatusOverlay
        visible={
          shouldShowSystemStatusOverlay &&
          !isDeliveryStatusError &&
          !isSystemStatusDismissed
        }
        status={deliveryNetworkStatus}
        message={deliveryStatusMessage}
        onRequestClose={handleDismissSystemStatusOverlay}
      />
      <Modal
        visible={isPromotionsVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={closePromotionsOverlay}
      >
        <View style={styles.promotionsBackdrop}>
          <View style={styles.promotionsContainer}>
            <View style={styles.promotionsHeader}>
              <Text allowFontScaling={false} style={styles.promotionsTitle}>
                {discountLabel}
              </Text>
              <TouchableOpacity
                onPress={closePromotionsOverlay}
                accessibilityRole="button"
                accessibilityLabel="Close"
                style={styles.promotionsCloseButton}
              >
                <X size={s(20)} color="#0F172A" />
              </TouchableOpacity>
            </View>
            {!hasValidCoordinates ? (
              <View style={styles.promotionsStateWrapper}>
                <Text allowFontScaling={false} style={styles.promotionsStateTitle}>
                  {t('categoryOverlay.addressPrompt')}
                </Text>
                <TouchableOpacity
                  style={styles.promotionsPrimaryButton}
                  onPress={() => {
                    closePromotionsOverlay();
                    openLocationOverlay();
                  }}
                >
                  <Text allowFontScaling={false} style={styles.promotionsPrimaryButtonLabel}>
                    {t('home.addressPrompt.cta')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : showPromotionsLoading ? (
              <View style={styles.promotionsSkeletonState}>
                {Array.from({ length: 3 }).map((_, index) => (
                  <SkeletonPulse
                    key={`promotion-skeleton-${index}`}
                    style={styles.promotionsSkeletonCard}
                  />
                ))}
              </View>
            ) : showPromotionsError ? (
              <View style={styles.promotionsStateWrapper}>
                <Text allowFontScaling={false} style={styles.promotionsStateTitle}>
                  {t('categoryOverlay.error.title', { category: discountLabelLower })}
                </Text>
                <TouchableOpacity
                  style={styles.promotionsPrimaryButton}
                  onPress={refetchPromotions}
                >
                  <Text allowFontScaling={false} style={styles.promotionsPrimaryButtonLabel}>
                    {t('home.error.action')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : showPromotionsEmpty ? (
              <View style={styles.promotionsStateWrapper}>
                <Text allowFontScaling={false} style={styles.promotionsStateTitle}>
                  {t('categoryOverlay.empty.title', { category: discountLabelLower })}
                </Text>
              </View>
            ) : (
              <FlatList
                data={promotionRestaurants}
                renderItem={renderPromotionItem}
                keyExtractor={(item) => `${item.id}`}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.promotionsListContent}
                onEndReached={handlePromotionsEndReached}
                onEndReachedThreshold={0.5}
                refreshing={promotionsIsRefetching}
                onRefresh={refetchPromotions}
                ListFooterComponent={renderPromotionsFooter}
              />
            )}
          </View>
        </View>
      </Modal>
      {selectedCategory && (
        <CategoryOverlay
          visible
          category={selectedCategory}
          onClose={() => setSelectedCategory(null)}
        />
      )}
    </>
  );
}
const { height: SCREEN_HEIGHT } = Dimensions.get("screen");
const styles = ScaledSheet.create({

  mainWrapper: { paddingHorizontal: "16@s" },
  sectionTitle: { fontSize: "18@ms", fontWeight: "700" },
  sectionHeader: {
    marginTop: '16@vs',
    marginBottom: '12@vs',
  },
  listContent: {
    paddingBottom: '32@vs',
  },
  carouselList: {
    paddingHorizontal: '4@s',
  },
  carouselCardContainer: {
    marginRight: '12@s',
  },
  footerLoader: {
    paddingVertical: '16@vs',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '32@vs',
  },
  errorWrapper: {
    alignItems: 'center',
    paddingVertical: '32@vs',
    gap: '12@vs',
  },
  errorTitle: {
    color: '#17213A',
    fontSize: '14@ms',
    textAlign: 'center',
    paddingHorizontal: '12@s',
  },
  retryButton: {
    backgroundColor: '#17213A',
    paddingHorizontal: '20@s',
    paddingVertical: '10@vs',
    borderRadius: '18@ms',
  },
  retryLabel: {
    color: '#FFFFFF',
    fontSize: '13@ms',
    fontWeight: '600',
  },
  emptyWrapper: {
    alignItems: 'center',
    paddingVertical: '28@vs',
    gap: '10@vs',
  },
  addressPrompt: {
    paddingVertical: '36@vs',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: '16@s',
  },
  addressPromptTitle: {
    fontSize: '18@ms',
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  addressPromptSubtitle: {
    marginTop: '8@vs',
    fontSize: '13@ms',
    color: '#64748B',
    textAlign: 'center',
  },
  addressPromptButton: {
    marginTop: '18@vs',
    paddingHorizontal: '20@s',
    paddingVertical: '10@vs',
    borderRadius: '20@ms',
    backgroundColor: '#CA251B',
  },
  addressPromptButtonLabel: {
    fontSize: '14@ms',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyTitle: {
    fontSize: '16@ms',
    fontWeight: '700',
    color: '#17213A',
  },
  emptySubtitle: {
    fontSize: '13@ms',
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: '12@s',
  },

  cardContainer: {
    marginBottom: '16@vs',
  },

  topPickCard: {
    width: '112@s',
    alignItems: 'center',
  },
  topPickMedia: {
    width: '90@s',
    height: '90@s',
    borderRadius: '56@ms',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: '10@vs',
    shadowColor: 'rgba(15, 23, 42, 0.08)',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: '12@ms',
    elevation: 3,
  },
  topPickImage: {
    width: '100%',
    height: '100%',
  },
  topPickTitle: {
    fontSize: '12@ms',
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  topPickSubtitle: {
    marginTop: '4@vs',
    fontSize: '12@ms',
    color: '#64748B',
    textAlign: 'center',
  },
  topPickMetaText: {
    marginTop: '6@vs',
    fontSize: '12@ms',
    color: '#CA251B',
    fontWeight: '600',
    textAlign: 'center',
  },
  topPickCarouselItem: {
    marginRight: '16@s',
  },
  topPickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: '-10@s',
  },
  topPickGridItem: {
    paddingHorizontal: '10@s',
    marginBottom: '20@vs',
    alignItems: 'center',
    width: '33%',
  },

  headerWrapper: {
    padding: "6@s",
    paddingTop:
      SCREEN_HEIGHT < 700
        ? vs(0)
        : vs(6),
  },
  headerTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { color: "white", fontSize: "16@ms", fontWeight: "400", marginLeft: "20@ms" },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: "12@ms",
    paddingHorizontal: "12@s",
    paddingVertical: "8@vs",
    marginTop: "6@vs",
  },
  searchPlaceholder: { color: 'gray', flex: 1, fontSize: '13@ms' },

  categoryList: {
    marginTop: '10@vs',
  },

 collapsedHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: '24@s', flex: 1,backgroundColor:'#F2F0EF', },
  collapsedSearch: {
  flex: 1, 
  flexDirection: "row", 
  alignItems: "center", 
  justifyContent: "space-between", 
  backgroundColor: "white", 
  borderRadius: "16@ms", 
  paddingHorizontal: "12@s", 
  paddingVertical: "6@vs", 
  borderWidth: 2,
  borderColor: "#E5E7EB",
},
  collapsedUp: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "white",
    borderRadius: "16@ms",
    paddingVertical: "8@ms",
    paddingHorizontal: "6@vs",
    marginRight: moderateScale(10),
    borderWidth: 1,
    borderColor: "#17213A",
  },

  collapsedPlaceholder: { color: "gray", fontSize: "13@ms" },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.2,
  },

  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E5E5",
    borderRadius: "50@ms",
    paddingHorizontal: "10@s",
    paddingVertical: "6@vs",
    marginLeft: "8@s",
  },
  filterText: { color: "#333", fontSize: "12@ms", marginRight: "4@s" },
  categoryEqualWidth: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '72@s',
  },

  categoryLabelFixed: {
    color: '#FFFFFF',
    fontSize: '11@ms',
    textAlign: 'center',
  },

  discountCategoryLabel: {
    fontWeight: '700',
  },

  categoryIconWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: '36@ms',
    paddingVertical: '8@vs',
    paddingHorizontal: '8@s',
  },
  discountIconWrapper: {
    shadowColor: '#FACC15',
    shadowOpacity: 0.45,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  categoryTextContainer: {
    marginTop: '6@vs',
    minHeight: '28@vs',
    justifyContent: 'center',
    paddingHorizontal: '4@s',
  },
  promotionsBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  promotionsContainer: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: '24@ms',
    borderTopRightRadius: '24@ms',
    paddingTop: '20@vs',
    paddingHorizontal: '20@s',
    paddingBottom: '12@vs',
    maxHeight: '80%',
    width: '100%',
  },
  promotionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '12@vs',
  },
  promotionsTitle: {
    fontSize: '18@ms',
    fontWeight: '700',
    color: '#0F172A',
  },
  promotionsCloseButton: {
    width: '36@s',
    height: '36@vs',
    borderRadius: '18@ms',
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  promotionsStateWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: '40@vs',
    paddingHorizontal: '16@s',
    gap: '16@vs',
  },
  promotionsSkeletonState: {
    gap: '16@vs',
    paddingVertical: '12@vs',
    width: '100%',
  },
  promotionsSkeletonCard: {
    width: '100%',
    height: '200@vs',
    borderRadius: '20@ms',
  },
  promotionsStateTitle: {
    fontSize: '15@ms',
    textAlign: 'center',
    color: '#0F172A',
    fontWeight: '600',
  },
  promotionsPrimaryButton: {
    backgroundColor: '#CA251B',
    paddingHorizontal: '24@s',
    paddingVertical: '10@vs',
    borderRadius: '22@ms',
  },
  promotionsPrimaryButtonLabel: {
    color: '#FFFFFF',
    fontSize: '13@ms',
    fontWeight: '600',
  },
  promotionsListContent: {
    paddingBottom: '20@vs',
  },
  promotionsCardWrapper: {
    marginBottom: '16@vs',
  },
  promotionsFooterLoader: {
    paddingVertical: '14@vs',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredHeaderGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: 'center',
  },
  leftHeaderButton: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50@ms",
    borderWidth: "0.5@s",
    borderColor: "white",
    padding: "4@ms"
  }
});

