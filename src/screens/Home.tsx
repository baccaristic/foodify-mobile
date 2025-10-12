import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from "react-native";
import { Percent, Star, Pizza, Hamburger, ChevronDown, Search, Utensils } from "lucide-react-native";
import MainLayout from "~/layouts/MainLayout";
import { useNavigation } from "@react-navigation/native";
import { useInfiniteQuery } from "@tanstack/react-query";
import Animated, { FadeIn } from "react-native-reanimated";
import { Image } from "expo-image";
import { ScaledSheet, s, vs } from "react-native-size-matters";
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

const formatDeliveryFee = (fee: number) =>
  fee > 0 ? `${fee.toFixed(3).replace('.', ',')} DT delivery fee` : 'Free delivery';

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
      const imageStyles = [styles.cardImage, variant === 'compact' && styles.cardImageCompact];

      return (
        <TouchableOpacity
          style={cardStyles}
          onPress={() =>
            navigation.navigate('RestaurantDetails' as never, { restaurantId: restaurant.id } as never)
          }
          activeOpacity={0.85}
        >
          <Image
            source={
              restaurant.imageUrl
                ? { uri: `${BASE_API_URL}/auth/image/${restaurant.imageUrl}` }
                : require('../../assets/baguette.png')
            }
            style={imageStyles}
            contentFit="cover"
          />
          <View style={styles.cardBody}>
            <Text allowFontScaling={false} style={styles.cardTitle}>{restaurant.name}</Text>
            <View style={styles.ratingRow}>
              <Star size={s(14)} color="#FACC15" fill="#FACC15" />
              <Text allowFontScaling={false} style={styles.ratingText}>
                {restaurant.rating ? `${restaurant.rating}/5` : 'New'}
              </Text>
            </View>
            <Text allowFontScaling={false} style={styles.deliveryTime}>{restaurant.type || 'Restaurant'}</Text>
            <Text allowFontScaling={false} style={styles.deliveryFee}>{formatDeliveryFee(restaurant.deliveryFee)}</Text>
          </View>
        </TouchableOpacity>
      );
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: NearbyListItem }) => {
      if (item.type === 'section') {
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
                  <View key={restaurant.id} style={styles.carouselCardContainer}>
                    {renderRestaurantCard(restaurant, 'compact')}
                  </View>
                ))}
              </ScrollView>
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
        <View style={styles.cardContainer}>
          {renderRestaurantCard(item.restaurant)}
        </View>
      );
    },
    [renderRestaurantCard]
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
    paddingHorizontal: '16@s',
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
    backgroundColor: "white",
    borderRadius: "12@ms",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: "6@ms",
    elevation: 3,
  },
  cardCompact: {
    width: '220@s',
  },
  cardContainer: {
    marginBottom: '12@vs',
  },
  cardImage: { width: "100%", height: "140@vs" },
  cardImageCompact: {
    height: '120@vs',
  },
  cardBody: { padding: "10@s" },
  cardTitle: { fontSize: "16@ms", fontWeight: "700" },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: "4@vs" },
  ratingText: { fontSize: "12@ms", marginLeft: "4@s" },
  deliveryTime: { color: "red", fontSize: "12@ms", marginTop: "4@vs" },
  deliveryFee: { color: "#4B5563", fontSize: "11@ms", marginTop: "2@vs" },

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

