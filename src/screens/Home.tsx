import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  FlatList,
  StyleSheet,
} from 'react-native';
import {
  Pizza,
  Hamburger,
  Search,
  Utensils,
  Bike,
  MoveUp,
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
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import MainLayout from "~/layouts/MainLayout";
import { useNavigation } from "@react-navigation/native";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import Animated, {
  FadeIn,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Image } from "expo-image";
import { ScaledSheet, moderateScale, s, vs } from "react-native-size-matters";
import Header from "~/components/Header";
import RestaurantShowcaseCard from '~/components/RestaurantShowcaseCard';
import {
  getNearbyFavoriteRestaurants,
  getNearbyRecentOrderRestaurants,
  getNearbyRestaurantsPage,
  getNearbyTopRestaurants,
} from "~/api/restaurants";
import { PageResponse, RestaurantCategory, RestaurantDisplayDto } from "~/interfaces/Restaurant";
import { BASE_API_URL } from "@env";
import CategoryOverlay from '~/components/CategoryOverlay';
import PromotionsOverlay from '~/components/PromotionsOverlay';
import useSelectedAddress from '~/hooks/useSelectedAddress';
import useLocationOverlay from '~/hooks/useLocationOverlay';
import { useTranslation } from '~/localization';
import { getCategoryLabelKey, toCategoryDisplayName } from '~/localization/categoryKeys';

type QuickCategoryBase = {
  key: string;
  label: string;
  Icon: LucideIcon;
  iconColor: string;
  iconBackgroundColor: string;
  labelColor: string;
  labelBackgroundColor?: string;
};

type QuickCategoryItem =
  | (QuickCategoryBase & {
      type: 'promotions';
    })
  | (QuickCategoryBase & {
      type: 'category';
      category: RestaurantCategory;
    });

type PromotionsQuickCategoryItem = Extract<QuickCategoryItem, { type: 'promotions' }>;

const PromotionsCategoryButton = React.memo(
  ({
    item,
    onPress,
  }: {
    item: PromotionsQuickCategoryItem;
    onPress: (item: QuickCategoryItem) => void;
  }) => {
    const pulse = useSharedValue(1);
    const float = useSharedValue(0);
    const glow = useSharedValue(0.45);

    React.useEffect(() => {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 1200, easing: Easing.out(Easing.quad) }),
          withTiming(0.98, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
          withTiming(1.02, { duration: 900, easing: Easing.out(Easing.quad) })
        ),
        -1,
        false
      );

      float.value = withRepeat(
        withSequence(
          withTiming(-4, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
          withTiming(1.5, { duration: 950, easing: Easing.out(Easing.quad) }),
          withTiming(0, { duration: 850, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        false
      );

      glow.value = withRepeat(
        withSequence(
          withTiming(0.68, { duration: 1100, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.32, { duration: 1100, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      );
    }, [float, glow, pulse]);

    const iconWrapperStyle = useAnimatedStyle(() => ({
      transform: [
        { translateY: float.value },
        { scale: pulse.value },
      ],
    }));

    const glowStyle = useAnimatedStyle(() => ({
      opacity: glow.value,
      transform: [{ scale: pulse.value * 1.4 }],
    }));

    return (
      <TouchableOpacity
        style={styles.categoryEqualWidth}
        onPress={() => onPress(item)}
        activeOpacity={0.88}
      >
        <View style={styles.promotionsIconContainer}>
          <Animated.View
            pointerEvents="none"
            style={[styles.promotionsGlow, glowStyle]}
          />
          <Animated.View
            style={[
              styles.categoryIconWrapper,
              styles.promotionsIconWrapper,
              styles.promotionsIconFloating,
              iconWrapperStyle,
            ]}
          >
            <item.Icon size={s(28)} color={item.iconColor} />
          </Animated.View>
        </View>
        <View
          style={[
            styles.categoryTextContainer,
            item.labelBackgroundColor
              ? [styles.categoryLabelPill, { backgroundColor: item.labelBackgroundColor }]
              : null,
          ]}
        >
          <Text
            allowFontScaling={false}
            style={[styles.categoryLabelFixed, { color: item.labelColor }]}
            numberOfLines={2}
          >
            {item.label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }
);

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

export default function HomePage() {
  const navigation = useNavigation();
  const { open: openLocationOverlay } = useLocationOverlay();
  const { t } = useTranslation();

  const [selectedCategory, setSelectedCategory] = useState<RestaurantCategory | null>(null);
  const [promotionsVisible, setPromotionsVisible] = useState(false);
  const listRef = useRef<FlatList>(null);

  const handleQuickCategoryPress = useCallback(
    (item: QuickCategoryItem) => {
      if (item.type === 'promotions') {
        setPromotionsVisible(true);
        return;
      }

      setSelectedCategory(item.category);
    },
    [setSelectedCategory, setPromotionsVisible]
  );

  const quickCategories = useMemo<QuickCategoryItem[]>(() => {
    const discountItem: QuickCategoryItem = {
      key: 'promotions',
      type: 'promotions',
      label: t('home.categories.discount'),
      Icon: Percent,
      iconColor: '#B45309',
      iconBackgroundColor: '#FEF3C7',
      labelColor: '#92400E',
      labelBackgroundColor: '#FDE68A',
    };

    const categoryItems = (Object.values(RestaurantCategory) as RestaurantCategory[]).map((category) => {
      const labelKey = getCategoryLabelKey(category);
      const label = labelKey ? t(labelKey) : toCategoryDisplayName(category);
      const Icon = CATEGORY_ICON_MAP[category] ?? Utensils;

      return {
        key: category,
        type: 'category' as const,
        category,
        label,
        Icon,
        iconColor: '#CA251B',
        iconBackgroundColor: '#FFFFFF',
        labelColor: '#17213A',
      };
    });

    return [discountItem, ...categoryItems];
  }, [t]);

  const renderQuickCategoryItem = useCallback(({ item }: { item: QuickCategoryItem }) => {
    if (item.type === 'promotions') {
      return <PromotionsCategoryButton item={item} onPress={handleQuickCategoryPress} />;
    }

    return (
      <TouchableOpacity
        style={styles.categoryEqualWidth}
        onPress={() => handleQuickCategoryPress(item)}
        activeOpacity={0.88}
      >
        <View
          style={[
            styles.categoryIconWrapper,
            { backgroundColor: item.iconBackgroundColor },
          ]}
        >
          <item.Icon size={s(28)} color={item.iconColor} />
        </View>
        <View
          style={[
            styles.categoryTextContainer,
            item.labelBackgroundColor
              ? [styles.categoryLabelPill, { backgroundColor: item.labelBackgroundColor }]
              : null,
          ]}
        >
          <Text
            allowFontScaling={false}
            style={[styles.categoryLabelFixed, { color: item.labelColor }]}
            numberOfLines={2}
          >
            {item.label}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }, [handleQuickCategoryPress]);

  const { selectedAddress } = useSelectedAddress();
  const screenWidth = Dimensions.get('screen').width;

  const userLatitude = selectedAddress?.coordinates.latitude;
  const userLongitude = selectedAddress?.coordinates.longitude;

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

  type NearbyListItem =
    | {
        type: 'topSection';
        key: string;
        title: string;
        restaurants: RestaurantDisplayDto[];
      }
    | { type: 'carouselSection'; key: string; title: string; restaurants: RestaurantDisplayDto[] }
    | { type: 'othersHeader'; key: string; title: string }
    | { type: 'restaurant'; key: string; restaurant: RestaurantDisplayDto };

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
    (restaurant: RestaurantDisplayDto, options?: { width?: number | string }) => {
      const cardWidth = options?.width ?? screenWidth * 0.9;

      return (
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
      );
    },
    [navigation, screenWidth]
  );

  const compactRestaurantCardWidth = useMemo(() => s(240), []);

  const renderTopPickCard = useCallback(
    (restaurant: RestaurantDisplayDto) => {
      const deliveryFee =
        typeof restaurant.deliveryFee === 'number' && Number.isFinite(restaurant.deliveryFee)
          ? restaurant.deliveryFee
          : 0;
      const deliveryLabel =
        deliveryFee > 0
          ? `${deliveryFee.toFixed(3).replace('.', ',')} DT`
          : t('home.delivery.free');

      const topPickImagePath = restaurant.iconUrl || restaurant.imageUrl;

      return (
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
              {item.restaurants.map((restaurant) => (
                <View key={restaurant.id} style={styles.topPickCarouselItem}>
                  {renderTopPickCard(restaurant)}
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
              {item.restaurants.map((restaurant) => (
                <View key={restaurant.id} style={styles.carouselCardContainer}>
                  {renderRestaurantCard(restaurant, { width: compactRestaurantCardWidth })}
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
            {renderRestaurantCard(item.restaurant)}
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
      return (
        <View style={styles.mainWrapper}>
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="large" color="#CA251B" />
          </View>
        </View>
      );
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
      <ImageBackground
        source={require("../../assets/pattern1.png")}
        imageStyle={{ borderRadius: s(50) }}
        style={styles.backgroundImage}
      />
      <TouchableOpacity style={styles.collapsedUp} onPress={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })} >
        <MoveUp size={s(22)} color="gray" />
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
      {selectedCategory && (
        <CategoryOverlay
          visible
          category={selectedCategory}
          onClose={() => setSelectedCategory(null)}
        />
      )}
      {promotionsVisible && (
        <PromotionsOverlay
          visible={promotionsVisible}
          onClose={() => setPromotionsVisible(false)}
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

  collapsedHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: '16@s', flex: 1, },
  collapsedSearch: {
    flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "white", borderRadius: "16@ms", paddingHorizontal: "12@s", paddingVertical: "6@vs", borderWidth: 2,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  collapsedUp: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "white",
    borderRadius: "16@ms",
    paddingVertical: "6@vs",
    paddingHorizontal: "6@vs",
    marginRight: moderateScale(10),
    borderWidth: 2,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
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
    color: '#17213A',
    fontSize: '11@ms',
    textAlign: 'center',
  },

  categoryIconWrapper: {
    backgroundColor: '#FFFFFF',
    borderRadius: '36@ms',
    paddingVertical: '8@vs',
    paddingHorizontal: '8@s',
  },
  promotionsIconWrapper: {
    borderColor: '#FCD34D',
    borderWidth: StyleSheet.hairlineWidth,
    zIndex: 1,
  },
  promotionsIconFloating: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 6,
  },
  promotionsIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '72@s',
    height: '72@s',
  },
  promotionsGlow: {
    position: 'absolute',
    width: '62@s',
    height: '62@s',
    borderRadius: '32@ms',
    backgroundColor: '#FDE047',
  },
  categoryTextContainer: {
    marginTop: '6@vs',
    minHeight: '28@vs',
    justifyContent: 'center',
    paddingHorizontal: '4@s',
    alignItems: 'center',
  },
  categoryLabelPill: {
    borderRadius: '16@ms',
    paddingHorizontal: '8@s',
    paddingVertical: '4@vs',
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

