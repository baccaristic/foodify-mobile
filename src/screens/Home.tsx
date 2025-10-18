import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions, ImageBackground, FlatList, StyleSheet } from "react-native";
import {
  Percent,
  Star,
  Pizza,
  Hamburger,
  Search,
  Utensils,
  Heart,
  Bike,
  Clock3,
  MoveUp,
} from "lucide-react-native";
import MainLayout from "~/layouts/MainLayout";
import { useNavigation } from "@react-navigation/native";
import { useInfiniteQuery } from "@tanstack/react-query";
import Animated, { FadeIn } from "react-native-reanimated";
import { Image } from "expo-image";
import { ScaledSheet, moderateScale, s, vs } from "react-native-size-matters";
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
import useSelectedAddress from '~/hooks/useSelectedAddress';
import useLocationOverlay from '~/hooks/useLocationOverlay';

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
  const { open: openLocationOverlay } = useLocationOverlay();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

  const handleCategoryPress = (category: string) => {
    setSelectedCategory(category);
  };

  const { selectedAddress } = useSelectedAddress();
  const hasSelectedAddress = Boolean(selectedAddress?.coordinates);

  const userLatitude = selectedAddress?.coordinates.latitude;
  const userLongitude = selectedAddress?.coordinates.longitude;

  const radiusKm = 10;

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
    enabled: hasSelectedAddress,
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
    if (!hasSelectedAddress) {
      return;
    }

    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, hasSelectedAddress, isFetchingNextPage]);

  const renderRestaurantCard = useCallback(
    (restaurant: RestaurantSummary, variant: 'default' | 'compact' = 'default') => {
      const isCompact = variant === 'compact';
      const cardStyles = [styles.card, isCompact && styles.cardCompact];
      const mediaStyles = [styles.cardMedia, isCompact && styles.cardMediaCompact];
      const contentStyles = [styles.cardContent, isCompact && styles.cardContentCompact];
      const titleStyles = [styles.cardTitle, isCompact && styles.cardTitleCompact];
      const subtitleStyles = [styles.cardSubtitle, isCompact && styles.cardSubtitleCompact];
      const metaTextStyles = [styles.cardMetaText, isCompact && styles.cardMetaTextCompact];
      const closingTextStyles = [
        styles.cardClosingText,
        isCompact && styles.cardClosingTextCompact,
      ];
      const ratingPillStyles = [styles.ratingPill, isCompact && styles.ratingPillCompact];

      const ratingLabel = restaurant.rating ? restaurant.rating.toFixed(1) : 'New';
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
          activeOpacity={0.88}
        >
          <View style={mediaStyles}>
            <Image
              source={
                restaurant.imageUrl
                  ? { uri: `${BASE_API_URL}/auth/image/${restaurant.imageUrl}` }
                  : require('../../assets/baguette.png')
              }
              style={styles.cardImage}
              contentFit="cover"
            />
            {restaurant.hasPromotion && restaurant.promotionSummary ? (
              <View
                style={[
                  styles.promotionStickerContainer,
                  isCompact && styles.promotionStickerContainerCompact,
                ]}
              >
                <LinearGradient
                  colors={['#CA251B', '#CA251B']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={[styles.promotionSticker, isCompact && styles.promotionStickerCompact]}
                >
                  <Percent size={isCompact ? s(10) : s(12)} color="#FFFFFF" />
                  <Text
                    allowFontScaling={false}
                    style={[
                      styles.promotionStickerText,
                      isCompact && styles.promotionStickerTextCompact,
                    ]}
                    numberOfLines={1}
                  >
                    {restaurant.promotionSummary}
                  </Text>
                </LinearGradient>
              </View>
            ) : null}
            <View
              style={[
                styles.favoriteButton,
                restaurant.favorite && styles.favoriteButtonActive,
              ]}
            >
              <Heart
                size={isCompact ? s(16) : s(18)}
                color={restaurant.favorite ? '#FFFFFF' : '#CA251B'}
                fill={restaurant.favorite ? '#FFFFFF' : 'none'}
              />
            </View>
          </View>
          <View style={contentStyles}>
            <View style={styles.cardTitleRow}>
              <Text allowFontScaling={false} style={titleStyles} numberOfLines={1}>
                {restaurant.name}
              </Text>
              <View style={ratingPillStyles}>
                <Star size={isCompact ? s(12) : s(14)} color="#F97316" fill="#F97316" />
                <Text allowFontScaling={false} style={styles.ratingPillText}>
                  {ratingLabel}
                </Text>
              </View>
            </View>
            {(restaurant.description || restaurant.type || restaurant.address) ? (
              <Text allowFontScaling={false} style={subtitleStyles} numberOfLines={1}>
                {restaurant.description || restaurant.type || restaurant.address}
              </Text>
            ) : null}
            <View style={styles.cardMetaRow}>
              <Bike size={isCompact ? s(12) : s(14)} color="#CA251B" />
              <Text allowFontScaling={false} style={metaTextStyles} numberOfLines={1}>
                {deliveryLabel}
              </Text>
            </View>
            {restaurant.closingHours ? (
              <View style={[styles.cardMetaRow, styles.cardMetaRowSecondary]}>
                <Clock3 size={isCompact ? s(12) : s(14)} color="#0F172A" />
                <Text allowFontScaling={false} style={closingTextStyles} numberOfLines={1}>
                  Closes {restaurant.closingHours}
                </Text>
              </View>
            ) : null}
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
                restaurant.imageUrl
                  ? { uri: `${BASE_API_URL}/auth/image/${restaurant.imageUrl}` }
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
    [navigation],
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
    if (!hasSelectedAddress) {
      return (
        <View style={styles.mainWrapper}>
          <View style={styles.addressPrompt}>
            <Text allowFontScaling={false} style={styles.addressPromptTitle}>
              Choose an address to explore restaurants nearby.
            </Text>
            <Text allowFontScaling={false} style={styles.addressPromptSubtitle}>
              Set your delivery location so we can show options available in your area.
            </Text>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.addressPromptButton}
              onPress={openLocationOverlay}
            >
              <Text allowFontScaling={false} style={styles.addressPromptButtonLabel}>
                Select address
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
  }, [hasSelectedAddress, isError, isLoading, openLocationOverlay, refetch]);

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
          title="Please choose your address."
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
            <TouchableOpacity key={idx} style={styles.categoryEqualWidth} onPress={() => handleCategoryPress(item.label.toLowerCase())}
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
      <ImageBackground
        source={require("../../assets/pattern1.png")}
        imageStyle={{ borderRadius: s(50) }}
        style={styles.backgroundImage}
      />
      <TouchableOpacity style={styles.collapsedUp} onPress={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })} >
        <MoveUp size={s(22)} color="gray" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.collapsedSearch} onPress={() => navigation.navigate("Search" as never)} >
        <Text style={styles.collapsedPlaceholder}>Search in Food</Text>
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
        onRefresh={() => {
          refetch();
        }}
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

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '20@ms',
    overflow: 'hidden',
    shadowColor: 'rgba(15, 23, 42, 0.12)',
    shadowOpacity: 0.18,
    shadowRadius: '18@ms',
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  cardCompact: {
    width: '220@s',
  },
  cardContainer: {
    marginBottom: '16@vs',
  },
  cardMedia: {
    width: '100%',
    aspectRatio: 16 / 11,
    backgroundColor: '#F3F4F6',
    position: 'relative',
  },
  cardMediaCompact: {
    aspectRatio: 1.25,
  },
  cardImage: {
    width: '100%',
    height: '100%',
  },
  promotionStickerContainer: {
    position: 'absolute',
    left: 0,
    top: '14@vs',
  },
  promotionStickerContainerCompact: {
    top: '10@vs',
  },
  promotionSticker: {
    paddingVertical: '6@vs',
    paddingHorizontal: '14@s',
    borderTopRightRadius: '16@ms',
    borderBottomRightRadius: '16@ms',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: 'rgba(15, 23, 42, 0.18)',
    shadowOpacity: 0.25,
    shadowOffset: { width: 2, height: 4 },
    shadowRadius: '10@ms',
    elevation: 5,
  },
  promotionStickerCompact: {
    paddingHorizontal: '12@s',
    borderTopRightRadius: '14@ms',
    borderBottomRightRadius: '14@ms',
  },
  promotionStickerText: {
    fontSize: '7@ms',
    fontWeight: '500',
    color: '#ffffff',
    marginLeft: '6@s',
  },
  promotionStickerTextCompact: {
    fontSize: '10@ms',
    marginLeft: '4@s',
  },
  favoriteButton: {
    position: 'absolute',
    top: '12@vs',
    right: '12@s',
    width: '34@s',
    height: '34@s',
    borderRadius: '18@ms',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  favoriteButtonActive: {
    backgroundColor: '#CA251B',
  },
  cardContent: {
    paddingHorizontal: '16@s',
    paddingVertical: '14@vs',
  },
  cardContentCompact: {
    paddingHorizontal: '14@s',
    paddingVertical: '12@vs',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: '18@ms',
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    marginRight: '12@s',
  },
  cardTitleCompact: {
    fontSize: '16@ms',
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: '8@s',
    paddingVertical: '4@vs',
    borderRadius: '14@ms',
    backgroundColor: '#F1F5F9',
  },
  ratingPillCompact: {
    paddingHorizontal: '6@s',
    paddingVertical: '3@vs',
  },
  ratingPillText: {
    fontSize: '12@ms',
    fontWeight: '600',
    color: '#111827',
    marginLeft: '4@s',
  },
  cardSubtitle: {
    marginTop: '6@vs',
    fontSize: '13@ms',
    color: '#64748B',
  },
  cardSubtitleCompact: {
    fontSize: '12@ms',
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: '12@vs',
  },
  cardMetaRowSecondary: {
    marginTop: '6@vs',
  },
  cardMetaText: {
    marginLeft: '8@s',
    fontSize: '13@ms',
    fontWeight: '500',
    color: '#CA251B',
  },
  cardMetaTextCompact: {
    fontSize: '12@ms',
  },
  cardClosingText: {
    marginLeft: '8@s',
    fontSize: '12@ms',
    color: '#64748B',
  },
  cardClosingTextCompact: {
    fontSize: '11@ms',
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
  searchPlaceholder: { color: "gray", flex: 1, fontSize: "13@ms" },

  categoryButton: { alignItems: "center", marginHorizontal: "8@s" },
  categoryLabel: { color: "white", fontSize: "11@ms", marginTop: "4@vs", textAlign: "center" },

  collapsedHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: "16@s", flex: 1, },
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

