import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from "react-native";
import {
  Percent,
  Star,
  Pizza,
  Hamburger,
  ChevronDown,
  Search,
  Utensils,
  Heart,
  Bike,
  Clock3,
} from "lucide-react-native";
import MainLayout from "~/layouts/MainLayout";
import { useNavigation } from "@react-navigation/native";
import { useInfiniteQuery } from "@tanstack/react-query";
import Animated, { FadeIn } from "react-native-reanimated";
import { Image } from "expo-image";
import { ScaledSheet, s, vs } from "react-native-size-matters";
import { LinearGradient } from "expo-linear-gradient";
import Header from "~/components/Header";
import { getNearbyRestaurants } from "~/api/restaurants";
import type {
  NearbyRestaurantsResponse,
  RestaurantCategorySection,
  RestaurantSummary,
} from "~/interfaces/Restaurant";
import { BASE_API_URL } from "@env";
import CategoryOverlay from '~/components/CategoryOverlay';

type SectionLayout = 'carousel' | 'flatList';

const SECTION_LABELS: Record<string, string> = {
  topPicks: 'Top picks for you',
  orderAgain: 'Order again',
  promotions: 'Promotions',
  others: 'Other restaurants',
};

const toSectionLabel = (key: string) => {
  if (SECTION_LABELS[key]) {
    return SECTION_LABELS[key];
  }

  const spaced = key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .toLowerCase();

  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

const resolveLayout = (displayType?: string | null): SectionLayout => {
  if (typeof displayType === 'string' && displayType.toLowerCase() === 'carousel') {
    return 'carousel';
  }

  return 'flatList';
};

const INITIAL_PAGE = 0;
const PAGE_SIZE = 20;

export default function HomePage() {
  const navigation = useNavigation();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category);
  };

  // TODO: replace with actual user location from location services
  const userLatitude = 36.8065;
  const userLongitude = 10.1815;
  const radiusKm = 5;

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useInfiniteQuery<NearbyRestaurantsResponse>({
    queryKey: ['nearby-restaurants', userLatitude, userLongitude, radiusKm],
    queryFn: ({ pageParam = INITIAL_PAGE }) =>
      getNearbyRestaurants({
        lat: userLatitude,
        lng: userLongitude,
        radiusKm,
        page: pageParam,
        pageSize: PAGE_SIZE,
      }),
    getNextPageParam: (lastPage) => {
      const { page, pageSize, totalElements } = lastPage.others;
      const fetchedItems = (page + 1) * pageSize;

      if (fetchedItems >= totalElements) {
        return undefined;
      }

      return page + 1;
    },
    initialPageParam: INITIAL_PAGE,
  });

  type NearbyListItem =
    | {
        type: 'section';
        key: string;
        title: string;
        layout: SectionLayout;
        restaurants: RestaurantSummary[];
      }
    | { type: 'othersHeader'; key: string; title: string }
    | { type: 'restaurant'; key: string; restaurant: RestaurantSummary };

  const topSections = useMemo(() => {
    const firstPage = data?.pages[0];
    if (!firstPage) {
      return [] as NearbyListItem[];
    }

    const sections: { key: string; section?: RestaurantCategorySection }[] = [
      { key: 'topPicks', section: firstPage.topPicks },
      { key: 'orderAgain', section: firstPage.orderAgain },
      { key: 'promotions', section: firstPage.promotions },
    ];

    return sections
      .filter((entry): entry is { key: string; section: RestaurantCategorySection } =>
        Boolean(entry.section && entry.section.restaurants.length > 0)
      )
      .map((entry) => ({
        type: 'section' as const,
        key: entry.key,
        title: toSectionLabel(entry.key),
        layout: resolveLayout(entry.section.displayType),
        restaurants: entry.section.restaurants,
      }));
  }, [data]);

  const otherRestaurants = useMemo(
    () => data?.pages.flatMap((page) => page.others.restaurants) ?? [],
    [data]
  );

  const othersLayout = useMemo(
    () => resolveLayout(data?.pages[0]?.others.displayType),
    [data]
  );

  const listData = useMemo(() => {
    const items: NearbyListItem[] = [...topSections];

    if (otherRestaurants.length > 0) {
      if (othersLayout === 'carousel') {
        items.push({
          type: 'section',
          key: 'others-carousel',
          title: toSectionLabel('others'),
          layout: 'carousel',
          restaurants: otherRestaurants,
        });
      } else {
        items.push({
          type: 'othersHeader',
          key: 'others-header',
          title: toSectionLabel('others'),
        });
        otherRestaurants.forEach((restaurant, index) => {
          items.push({
            type: 'restaurant',
            key: `restaurant-${restaurant.id}-${index}`,
            restaurant,
          });
        });
      }
    }

    return items;
  }, [otherRestaurants, othersLayout, topSections]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const renderRestaurantCard = useCallback(
    (restaurant: RestaurantSummary, variant: 'default' | 'compact' = 'default') => {
      const cardStyles = [styles.card, variant === 'compact' && styles.cardCompact];
      const imageWrapperStyles = [
        styles.cardImageWrapper,
        variant === 'compact' && styles.cardImageWrapperCompact,
      ];
      const titleStyles = [styles.cardTitle, variant === 'compact' && styles.cardTitleCompact];
      const subtitleStyles = [styles.cardSubtitle, variant === 'compact' && styles.cardSubtitleCompact];
      const metaTextStyles = [styles.cardMetaText, variant === 'compact' && styles.cardMetaTextCompact];
      const metaTagTextStyles = [styles.cardMetaTagText, variant === 'compact' && styles.cardMetaTagTextCompact];

      const deliveryLabel =
        restaurant.deliveryFee > 0
          ? `${restaurant.deliveryFee.toFixed(3).replace('.', ',')} DT`
          : 'Free delivery';

      return (
        <TouchableOpacity
          style={cardStyles}
          onPress={() =>
            navigation.navigate('RestaurantDetails' as never, { restaurantId: restaurant.id } as never)
          }
          activeOpacity={0.9}
        >
          <View style={imageWrapperStyles}>
            <Image
              source={
                restaurant.imageUrl
                  ? { uri: `${BASE_API_URL}/auth/image/${restaurant.imageUrl}` }
                  : require('../../assets/baguette.png')
              }
              style={styles.cardImage}
              contentFit="cover"
            />
            <LinearGradient
              colors={["rgba(15, 23, 42, 0)", "rgba(15, 23, 42, 0.35)", "rgba(15, 23, 42, 0.85)"]}
              locations={[0, 0.55, 1]}
              style={styles.cardOverlay}
            />
            {restaurant.hasPromotion && restaurant.promotionSummary ? (
              <View
                style={[
                  styles.promotionStickerContainer,
                  variant === 'compact' && styles.promotionStickerContainerCompact,
                ]}
              >
                <LinearGradient
                  colors={["#FACC15", "#F97316"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={[
                    styles.promotionSticker,
                    variant === 'compact' && styles.promotionStickerCompact,
                  ]}
                >
                  <Percent
                    size={variant === 'compact' ? s(11) : s(13)}
                    color="#0F172A"
                  />
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.promotionStickerText,
                      variant === 'compact' && styles.promotionStickerTextCompact,
                    ]}
                    numberOfLines={1}
                  >
                    {restaurant.promotionSummary}
                  </Text>
                </LinearGradient>
              </View>
            ) : null}
            <View style={styles.cardBadgeRow}>
              <View style={styles.ratingChip}>
                <Star size={s(14)} color="#FACC15" fill="#FACC15" />
                <Text allowFontScaling={false} style={styles.ratingText}>
                  {restaurant.rating ? `${restaurant.rating.toFixed(1)}` : 'New'}
                </Text>
              </View>
              <View
                style={[
                  styles.favoriteChip,
                  restaurant.favorite && styles.favoriteChipActive,
                ]}
              >
                <Heart
                  size={s(16)}
                  color={restaurant.favorite ? '#FFFFFF' : '#CA251B'}
                  fill={restaurant.favorite ? '#FFFFFF' : 'none'}
                />
              </View>
            </View>
            <View style={styles.cardInfoOverlay}>
              <Text allowFontScaling={false} style={titleStyles} numberOfLines={1}>
                {restaurant.name}
              </Text>
              {(restaurant.description || restaurant.address) && (
                <Text allowFontScaling={false} style={subtitleStyles} numberOfLines={1}>
                  {restaurant.description || restaurant.address}
                </Text>
              )}
              <View style={styles.cardMetaRow}>
                <View style={styles.cardMetaItem}>
                  <Utensils size={s(14)} color="#F8FAFC" />
                  <Text allowFontScaling={false} style={metaTextStyles} numberOfLines={1}>
                    {restaurant.type || 'Restaurant'}
                  </Text>
                </View>
                <View style={styles.cardMetaDivider} />
                <View style={styles.cardMetaItem}>
                  <Bike size={s(14)} color="#F8FAFC" />
                  <Text allowFontScaling={false} style={metaTextStyles} numberOfLines={1}>
                    {deliveryLabel}
                  </Text>
                </View>
              </View>
              {restaurant.closingHours ? (
                <View style={styles.cardMetaTag}>
                  <Clock3 size={s(12)} color="#F8FAFC" />
                  <Text allowFontScaling={false} style={metaTagTextStyles} numberOfLines={1}>
                    Closes {restaurant.closingHours}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [navigation]
  );

  const renderTopPickCard = useCallback(
    (restaurant: RestaurantSummary) => {
      const deliveryLabel =
        restaurant.deliveryFee > 0
          ? `${restaurant.deliveryFee.toFixed(3).replace('.', ',')} DT`
          : 'Free delivery';

      return (
        <TouchableOpacity
          style={styles.topPickCard}
          activeOpacity={0.9}
          onPress={() =>
            navigation.navigate('RestaurantDetails' as never, {
              restaurantId: restaurant.id,
            } as never)
          }
        >
          <View style={styles.topPickImageWrapper}>
            <Image
              source={
                restaurant.imageUrl
                  ? { uri: `${BASE_API_URL}/auth/image/${restaurant.imageUrl}` }
                  : require('../../assets/baguette.png')
              }
              style={styles.topPickImage}
              contentFit="cover"
            />
            {restaurant.rating ? (
              <View style={styles.topPickRatingChip}>
                <Star size={s(12)} color="#111827" fill="#111827" />
                <Text allowFontScaling={false} style={styles.topPickRatingText}>
                  {restaurant.rating.toFixed(1)}
                </Text>
              </View>
            ) : null}
            {restaurant.hasPromotion && restaurant.promotionSummary ? (
              <View style={styles.topPickPromotionStickerContainer}>
                <LinearGradient
                  colors={["#FACC15", "#F97316"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={styles.topPickPromotionSticker}
                >
                  <Percent size={s(10)} color="#0F172A" />
                  <Text
                    allowFontScaling={false}
                    style={styles.topPickPromotionText}
                    numberOfLines={1}
                  >
                    {restaurant.promotionSummary}
                  </Text>
                </LinearGradient>
              </View>
            ) : null}
          </View>
          <Text allowFontScaling={false} style={styles.topPickTitle} numberOfLines={1}>
            {restaurant.name}
          </Text>
          <View style={styles.topPickMetaRow}>
            <Bike size={s(12)} color="#64748B" />
            <Text allowFontScaling={false} style={styles.topPickMetaText} numberOfLines={1}>
              {deliveryLabel}
            </Text>
          </View>
        </TouchableOpacity>
      );
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: NearbyListItem }) => {
      if (item.type === 'section') {
        const isTopPicks = item.key === 'topPicks';
        return (
          <View style={styles.mainWrapper}>
            <View style={styles.sectionHeader}>
              <Text allowFontScaling={false} style={styles.sectionTitle}>{item.title}</Text>
            </View>
            {item.layout === 'carousel' ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselList}
              >
                {item.restaurants.map((restaurant) => (
                  <View
                    key={restaurant.id}
                    style={
                      isTopPicks ? styles.topPickCarouselItem : styles.carouselCardContainer
                    }
                  >
                    {isTopPicks
                      ? renderTopPickCard(restaurant)
                      : renderRestaurantCard(restaurant, 'compact')}
                  </View>
                ))}
              </ScrollView>
            ) : isTopPicks ? (
              <View style={styles.topPickGrid}>
                {item.restaurants.map((restaurant) => (
                  <View key={restaurant.id} style={styles.topPickGridItem}>
                    {renderTopPickCard(restaurant)}
                  </View>
                ))}
              </View>
            ) : (
              <View>
                {item.restaurants.map((restaurant) => (
                  <View key={restaurant.id} style={styles.cardContainer}>
                    {renderRestaurantCard(restaurant)}
                  </View>
                ))}
              </View>
            )}
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
    [renderRestaurantCard, renderTopPickCard]
  );

  const renderListEmpty = useCallback(() => {
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
              We can&apos;t fetch restaurants right now.
            </Text>
            <TouchableOpacity activeOpacity={0.8} style={styles.retryButton} onPress={() => refetch()}>
              <Text allowFontScaling={false} style={styles.retryLabel}>Try again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.mainWrapper}>
        <View style={styles.emptyWrapper}>
          <Text allowFontScaling={false} style={styles.emptyTitle}>
            No restaurants in range.
          </Text>
          <Text allowFontScaling={false} style={styles.emptySubtitle}>
            Expand your search radius or update your location to discover great meals nearby.
          </Text>
        </View>
      </View>
    );
  }, [isError, isLoading, refetch]);

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
          title="San Francisco Bay Area"
          onBack={() => console.log("not working now !")}
          compact
        />
        <TouchableOpacity style={styles.searchBar} onPress={() => navigation.navigate('Search' as never)}
        >
          <Text allowFontScaling={false} style={styles.searchPlaceholder}>Ready to eat?</Text>
          <Search size={s(18)} color="black" />
        </TouchableOpacity>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginTop: vs(10) }}
        >
          {[
            { icon: Percent, label: "Discount" },
            { icon: Star, label: "Top Restaurants" },
            { icon: Utensils, label: "Dishes" },
            { icon: Pizza, label: "Pizza" },
            { icon: Hamburger, label: "Burger" },
          ].map((item, idx) => (
            <TouchableOpacity key={idx} style={styles.categoryEqualWidth} onPress={() => handleCategoryPress(item.label)}
            >
              <View style={styles.categoryIconWrapper}>
                <item.icon size={s(32)} color="#CA251B" />
              </View>
              <View style={styles.categoryTextContainer}>
                <Text
                  allowFontScaling={false}
                  style={styles.categoryLabelFixed}
                  numberOfLines={2}
                >
                  {item.label}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </Animated.View>
  );

  const collapsedHeader = (
    <View style={styles.collapsedHeader}>
      <TouchableOpacity style={styles.collapsedSearch} onPress={() => navigation.navigate('Search' as never)}>
        <Search size={s(18)} color="gray" style={{ marginRight: s(6) }} />
        <Text style={styles.collapsedPlaceholder}>Search in Food</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.filterButton}>
        <Text style={styles.filterText}>Food Type</Text>
        <ChevronDown size={s(14)} color="gray" />
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
        onRefresh={() => {
          refetch();
        }}
        isRefreshing={isRefetching}
        mainContent={mainContent}
        virtualizedListProps={{
          data: listData,
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

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '20@ms',
    shadowColor: 'rgba(15, 23, 42, 0.2)',
    shadowOpacity: 0.4,
    shadowRadius: '16@ms',
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  cardCompact: {
    width: '220@s',
  },
  cardContainer: {
    marginBottom: '16@vs',
  },
  cardImageWrapper: {
    width: '100%',
    aspectRatio: 16 / 11,
    borderRadius: '20@ms',
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  cardImageWrapperCompact: {
    aspectRatio: 16 / 12,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  cardOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
  },
  cardBadgeRow: {
    position: 'absolute',
    left: '12@s',
    right: '12@s',
    top: '12@vs',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '12@s',
    paddingVertical: '6@vs',
    borderRadius: '16@ms',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  ratingText: {
    fontSize: '12@ms',
    marginLeft: '6@s',
    fontWeight: '600',
    color: '#1F2937',
  },
  favoriteChip: {
    width: '32@s',
    height: '32@s',
    borderRadius: '18@ms',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  favoriteChipActive: {
    backgroundColor: '#CA251B',
  },
  cardInfoOverlay: {
    position: 'absolute',
    left: '16@s',
    right: '16@s',
    bottom: '16@vs',
  },
  cardTitle: {
    fontSize: '18@ms',
    fontWeight: '700',
    color: '#F8FAFC',
    textShadowColor: 'rgba(15, 23, 42, 0.3)',
    textShadowRadius: 6,
    textShadowOffset: { width: 0, height: 2 },
  },
  cardTitleCompact: {
    fontSize: '16@ms',
  },
  cardSubtitle: {
    fontSize: '12@ms',
    color: 'rgba(248, 250, 252, 0.85)',
    marginTop: '4@vs',
  },
  cardSubtitleCompact: {
    fontSize: '11@ms',
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '10@vs',
  },
  promotionStickerContainer: {
    position: 'absolute',
    right: '-10@s',
    top: '28@vs',
  },
  promotionStickerContainerCompact: {
    top: '20@vs',
    right: '-8@s',
  },
  promotionSticker: {
    paddingVertical: '8@vs',
    paddingHorizontal: '14@s',
    borderTopLeftRadius: '18@ms',
    borderBottomLeftRadius: '18@ms',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: 'rgba(15, 23, 42, 0.35)',
    shadowOpacity: 0.25,
    shadowOffset: { width: -2, height: 4 },
    shadowRadius: '12@ms',
    elevation: 6,
  },
  promotionStickerCompact: {
    paddingVertical: '6@vs',
    paddingHorizontal: '12@s',
    borderTopLeftRadius: '16@ms',
    borderBottomLeftRadius: '16@ms',
  },
  promotionStickerText: {
    fontSize: '12@ms',
    fontWeight: '700',
    color: '#0F172A',
    letterSpacing: 0.2,
    marginLeft: '6@s',
  },
  promotionStickerTextCompact: {
    fontSize: '10@ms',
    marginLeft: '4@s',
  },
  cardMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  cardMetaDivider: {
    width: 1,
    height: '60%',
    backgroundColor: 'rgba(248, 250, 252, 0.3)',
    marginHorizontal: '12@s',
  },
  cardMetaText: {
    fontSize: '12@ms',
    color: '#F8FAFC',
    marginLeft: '6@s',
  },
  cardMetaTextCompact: {
    fontSize: '11@ms',
  },
  cardMetaTag: {
    marginTop: '8@vs',
    alignSelf: 'flex-start',
    paddingHorizontal: '12@s',
    paddingVertical: '4@vs',
    borderRadius: '14@ms',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardMetaTagText: {
    fontSize: '11@ms',
    color: '#F8FAFC',
    marginLeft: '6@s',
    fontWeight: '500',
  },
  cardMetaTagTextCompact: {
    fontSize: '10@ms',
  },

  topPickCard: {
    width: '112@s',
    borderRadius: '28@ms',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: '12@s',
    paddingVertical: '14@vs',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: 'rgba(15, 23, 42, 0.1)',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: '12@ms',
    elevation: 4,
  },
  topPickImageWrapper: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: '20@ms',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    marginBottom: '12@vs',
    alignSelf: 'stretch',
  },
  topPickImage: {
    width: '100%',
    height: '100%',
  },
  topPickRatingChip: {
    position: 'absolute',
    top: '6@vs',
    right: '6@s',
    borderRadius: '12@ms',
    paddingHorizontal: '8@s',
    paddingVertical: '4@vs',
    backgroundColor: '#FACC15',
    flexDirection: 'row',
    alignItems: 'center',
  },
  topPickRatingText: {
    fontSize: '10@ms',
    fontWeight: '600',
    color: '#111827',
    marginLeft: '4@s',
  },
  topPickPromotionStickerContainer: {
    position: 'absolute',
    right: '-8@s',
    top: '12@vs',
  },
  topPickPromotionSticker: {
    borderTopLeftRadius: '14@ms',
    borderBottomLeftRadius: '14@ms',
    paddingHorizontal: '12@s',
    paddingVertical: '6@vs',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: 'rgba(15, 23, 42, 0.3)',
    shadowOpacity: 0.25,
    shadowRadius: '8@ms',
    shadowOffset: { width: -2, height: 3 },
    elevation: 4,
  },
  topPickPromotionText: {
    fontSize: '9@ms',
    fontWeight: '600',
    color: '#0F172A',
    marginLeft: '4@s',
  },
  topPickTitle: {
    fontSize: '13@ms',
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  topPickMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '6@vs',
    paddingHorizontal: '10@s',
    paddingVertical: '4@vs',
    borderRadius: '12@ms',
    backgroundColor: '#F8FAFC',
  },
  topPickMetaText: {
    fontSize: '11@ms',
    color: '#64748B',
    marginLeft: '6@s',
  },
  topPickCarouselItem: {
    marginRight: '16@s',
  },
  topPickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: '-6@s',
  },
  topPickGridItem: {
    paddingHorizontal: '6@s',
    marginBottom: '16@vs',
    alignItems: 'center',
    width: '50%',
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
  searchPlaceholder: { color: "gray", flex: 1, fontSize: "13@ms" },

  categoryButton: { alignItems: "center", marginHorizontal: "8@s" },
  categoryLabel: { color: "white", fontSize: "11@ms", marginTop: "4@vs", textAlign: "center" },

  collapsedHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: "12@s",
    backgroundColor: "white",
    flex: 1,
  },
  collapsedSearch: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E5E5",
    borderRadius: "50@ms",
    paddingHorizontal: "12@s",
    paddingVertical: "6@vs",
  },
  collapsedPlaceholder: { color: "gray", fontSize: "13@ms" },
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
    alignItems: "center",
    width: "25%",
  },

  categoryLabelFixed: {
    color: "white",
    fontSize: "11@ms",
    textAlign: "center"
  },

  categoryIconWrapper: {
    backgroundColor: "white",
    borderRadius: "50@ms",
    padding: "8@s"
  },
  categoryTextContainer: {
    height: "20@vs",
    justifyContent: 'center',
    width: '150%',
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

