import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from "react-native";
import { Percent, Star, Gift, Pizza, Hamburger, ChevronDown, Search, Utensils } from "lucide-react-native";
import MainLayout from "~/layouts/MainLayout";
import { useNavigation } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import Animated, { FadeIn } from "react-native-reanimated";
import { Image } from "expo-image";
import { ScaledSheet, s, vs } from "react-native-size-matters";
import Header from "~/components/Header";
import { getNearbyRestaurants } from "~/api/restaurants";
import type { RestaurantSummary } from "~/interfaces/Restaurant";
import { BASE_API_URL } from "@env";
import CategoryOverlay from '~/components/CategoryOverlay';

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

  const { data: restaurants, isLoading, isError, refetch, isFetching } = useQuery<RestaurantSummary[]>({
    queryKey: ['nearby-restaurants', userLatitude, userLongitude, radiusKm],
    queryFn: () => getNearbyRestaurants({ lat: userLatitude, lng: userLongitude, radiusKm }),
  });

  const sectionTitle = isLoading ? 'Loading nearby restaurants...' : 'Nearby Restaurants';

  let contentBody: React.ReactNode;
  if (isLoading) {
    contentBody = (
      <View style={styles.loadingWrapper}>
        <ActivityIndicator size="large" color="#CA251B" />
      </View>
    );
  } else if (isError) {
    contentBody = (
      <View style={styles.errorWrapper}>
        <Text allowFontScaling={false} style={styles.errorTitle}>
          We can't fetch restaurants right now.
        </Text>
        <TouchableOpacity activeOpacity={0.8} style={styles.retryButton} onPress={() => refetch()}>
          <Text allowFontScaling={false} style={styles.retryLabel}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  } else if (!restaurants || restaurants.length === 0) {
    contentBody = (
      <View style={styles.emptyWrapper}>
        <Text allowFontScaling={false} style={styles.emptyTitle}>
          No restaurants in range.
        </Text>
        <Text allowFontScaling={false} style={styles.emptySubtitle}>
          Expand your search radius or update your location to discover great meals nearby.
        </Text>
      </View>
    );
  } else {
    const resolvedRestaurants = restaurants ?? [];
    contentBody = (
      <View style={styles.cardList}>
        {resolvedRestaurants.map((restaurant) => (
          <TouchableOpacity
            key={restaurant.id}
            style={styles.card}
            onPress={() => navigation.navigate('RestaurantDetails' as never, { restaurantId: restaurant.id } as never)}
            activeOpacity={0.85}
          >
            <Image
              source={restaurant.imageUrl ? { uri: `${BASE_API_URL}/auth/image/${restaurant.imageUrl}` } : require('../../assets/baguette.png')}
              style={styles.cardImage}
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
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  const mainContent = (
    <View style={styles.mainWrapper}>
      <Text allowFontScaling={false} style={styles.sectionTitle}>{sectionTitle}</Text>
      {contentBody}
    </View>
  );

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
          contentContainerStyle={{}}
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
        headerMinHeight={vs(140)}
        customHeader={customHeader}
        collapsedHeader={collapsedHeader}
        onRefresh={() => {
          refetch();
        }}
        isRefreshing={isFetching}
        mainContent={mainContent}
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

const styles = ScaledSheet.create({
  mainWrapper: { paddingHorizontal: "16@s" },
  sectionTitle: { fontSize: "18@ms", fontWeight: "700", marginTop: "16@vs", marginBottom: "12@vs" },
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

  cardList: { gap: "12@vs" },
  card: {
    backgroundColor: "white",
    borderRadius: "12@ms",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: "6@ms",
    elevation: 3,
  },
  cardImage: { width: "100%", height: "140@vs" },
  cardBody: { padding: "10@s" },
  cardTitle: { fontSize: "16@ms", fontWeight: "700" },
  ratingRow: { flexDirection: "row", alignItems: "center", marginTop: "4@vs" },
  ratingText: { fontSize: "12@ms", marginLeft: "4@s" },
  deliveryTime: { color: "red", fontSize: "12@ms", marginTop: "4@vs" },

  headerWrapper: { padding: "6@s", paddingBottom: "20@vs" },
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

