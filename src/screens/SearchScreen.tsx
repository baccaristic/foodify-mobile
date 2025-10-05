import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { NavigationProp, ParamListBase, useNavigation } from "@react-navigation/native";
import { ScaledSheet, s, vs } from "react-native-size-matters";
import { Search, SlidersHorizontal, Star } from "lucide-react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import MainLayout from "~/layouts/MainLayout";
import Header from "~/components/Header";
import FiltersOverlay from "~/components/FiltersOverlay";
import useDebounce from "~/hooks/useDebounce";
import { searchRestaurants } from "~/api/restaurants";
import type {
  MenuItemPromotion,
  RestaurantSearchItem,
  RestaurantSearchParams,
  RestaurantSearchSort,
} from "~/interfaces/Restaurant";

const FALLBACK_IMAGE = require("../../assets/TEST.png");
const FALLBACK_MENU_IMAGE = require("../../assets/TEST.png");
const PAGE = 1;
const PAGE_SIZE = 20;

const QUICK_FILTERS_DEFAULT = Object.freeze({
  promotions: false,
  topChoice: false,
  freeDelivery: false,
});

const OVERLAY_FILTERS_DEFAULT = Object.freeze({
  sort: "picked" as RestaurantSearchSort,
  topEat: false,
  maxFee: 1.5,
});

type QuickFilterKey = keyof typeof QUICK_FILTERS_DEFAULT;

type OverlayFiltersState = {
  sort: RestaurantSearchSort;
  topEat: boolean;
  maxFee: number;
};

interface PillButtonProps {
  label?: string;
  icon?: any;
  onPress: () => void;
  isActive?: boolean;
}

const PillButton = ({ label, icon: Icon, onPress, isActive = false }: PillButtonProps) => {
  const buttonStyle = [styles.pillButton, isActive && styles.pillActive];
  const textStyle = isActive ? styles.pillTextActive : styles.pillText;
  const iconColor = textStyle.color;

  return (
    <TouchableOpacity onPress={onPress} style={buttonStyle} activeOpacity={0.85}>
      {Icon && (
        <Icon size={s(20)} color={iconColor} style={{ marginRight: label ? s(4) : 0 }} />
      )}
      {label && <Text style={textStyle}>{label}</Text>}
    </TouchableOpacity>
  );
};

const formatCurrency = (value: number) => `${value.toFixed(3).replace(".", ",")} DT`;

const RestaurantCard = ({ data }: { data: RestaurantSearchItem }) => {
  const {
    name,
    deliveryTimeRange,
    rating,
    isTopChoice,
    hasFreeDelivery,
    promotionLabel,
    imageUrl,
  } = data;

  const imageSource = imageUrl ? { uri: imageUrl } : FALLBACK_IMAGE;
  const formattedRating = Number.isFinite(rating) ? `${rating}/5` : "-";

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9}>
      <Image source={imageSource} style={styles.cardImage} />

      {isTopChoice && (
        <View style={styles.badgeTopRight}>
          <Star size={s(16)} color="white" fill="#CA251B" />
        </View>
      )}

      {promotionLabel && (
        <View style={styles.discountBadge}>
          <Text style={styles.discountText}>{promotionLabel}</Text>
        </View>
      )}

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{name}</Text>
        <View style={styles.timeRatingRow}>
          <Text style={styles.deliveryTime}>{deliveryTimeRange}</Text>
          <View style={styles.ratingRow}>
            <Star size={s(14)} color="#FACC15" fill="#FACC15" />
            <Text style={styles.ratingText}>{formattedRating}</Text>
          </View>
        </View>

        {hasFreeDelivery && (
          <View style={styles.promoContainer}>
            <View style={styles.freeDeliveryPill}>
              <Text style={styles.promoText}>Free Delivery</Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const PromotedMenuItemCard = ({
  item,
  restaurantName,
}: {
  item: MenuItemPromotion;
  restaurantName: string;
}) => {
  const { name, promotionLabel, price, promotionPrice, imageUrl } = item;
  const imageSource = imageUrl ? { uri: imageUrl } : FALLBACK_MENU_IMAGE;
  const hasPromoPrice = typeof promotionPrice === "number" && Number.isFinite(promotionPrice);

  return (
    <TouchableOpacity style={styles.menuCard} activeOpacity={0.9}>
      <Image source={imageSource} style={styles.menuImage} />
      <View style={styles.menuInfo}>
        <Text style={styles.menuTitle} numberOfLines={2}>
          {name}
        </Text>
        <Text style={styles.menuSubtitle} numberOfLines={1}>
          {restaurantName}
        </Text>
        {promotionLabel && <Text style={styles.menuBadge}>{promotionLabel}</Text>}
      </View>
      <View style={styles.menuPriceColumn}>
        {hasPromoPrice ? (
          <>
            <Text style={styles.menuOriginalPrice}>{formatCurrency(price)}</Text>
            <Text style={styles.menuPrice}>{formatCurrency(promotionPrice ?? price)}</Text>
          </>
        ) : (
          <Text style={styles.menuPrice}>{formatCurrency(price)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function SearchScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [quickFilters, setQuickFilters] = useState(() => ({ ...QUICK_FILTERS_DEFAULT }));
  const [overlayFilters, setOverlayFilters] = useState<OverlayFiltersState>(() => ({
    ...OVERLAY_FILTERS_DEFAULT,
  }));

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const toggleQuickFilter = useCallback((key: QuickFilterKey) => {
    setQuickFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const handleApplyOverlayFilters = useCallback(
    (next: { sort: string; topEat: boolean; maxFee: number }) => {
      setOverlayFilters({
        sort: next.sort as RestaurantSearchSort,
        topEat: next.topEat,
        maxFee: next.maxFee,
      });
    },
    []
  );

  const handleClearAll = useCallback(() => {
    setQuickFilters({ ...QUICK_FILTERS_DEFAULT });
    setOverlayFilters({ ...OVERLAY_FILTERS_DEFAULT });
  }, []);

  const { promotions, topChoice, freeDelivery } = quickFilters;
  const { sort, topEat, maxFee } = overlayFilters;

  const queryParams = useMemo<RestaurantSearchParams>(() => {
    const trimmedQuery = debouncedSearchTerm.trim();

    return {
      query: trimmedQuery,
      hasPromotion: promotions,
      isTopChoice: topChoice,
      hasFreeDelivery: freeDelivery,
      sort,
      topEatOnly: topEat,
      maxDeliveryFee: maxFee,
      page: PAGE,
      pageSize: PAGE_SIZE,
    };
  }, [debouncedSearchTerm, promotions, topChoice, freeDelivery, sort, topEat, maxFee]);

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["restaurants-search", queryParams],
    queryFn: () => searchRestaurants(queryParams),
    keepPreviousData: true,
  });

  const restaurants = data?.items ?? [];
  const totalItems = data?.totalItems ?? 0;

  const combinedResults = useMemo(
    () =>
      restaurants.flatMap((restaurant) => {
        const entries: (
          | { type: "restaurant"; restaurant: RestaurantSearchItem }
          | {
              type: "promotion";
              restaurantId: number;
              restaurantName: string;
              item: MenuItemPromotion;
            }
        )[] = [
          {
            type: "restaurant",
            restaurant,
          },
        ];

        (restaurant.promotedMenuItems ?? []).forEach((item) => {
          entries.push({
            type: "promotion",
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            item,
          });
        });

        return entries;
      }),
    [restaurants]
  );

  const showResultCount = useMemo(() => {
    const baseQueryActive = debouncedSearchTerm.trim().length > 0;
    const quickFiltersActive = promotions || topChoice || freeDelivery;
    const overlayChanged =
      sort !== OVERLAY_FILTERS_DEFAULT.sort ||
      topEat !== OVERLAY_FILTERS_DEFAULT.topEat ||
      maxFee !== OVERLAY_FILTERS_DEFAULT.maxFee;

    return baseQueryActive || quickFiltersActive || overlayChanged;
  }, [debouncedSearchTerm, promotions, topChoice, freeDelivery, sort, topEat, maxFee]);

  const showInlineSpinner = isFetching && !isLoading;
  const isEmpty = !isLoading && !isFetching && !isError && restaurants.length === 0;

  const customHeader = (
    <Animated.View entering={FadeIn.duration(500)} style={styles.headerWrapper}>
      <Header
        title="San Francisco Bay Area"
        onBack={() => navigation.goBack()}
        onLocationPress={() => console.log("Location pressed")}
        compact
      />

      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            placeholderTextColor="#666"
            autoCorrect={false}
            returnKeyType="search"
          />
          <Search size={s(18)} color="black" />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginTop: vs(20) }}
        contentContainerStyle={styles.pillsContainer}
      >
        <PillButton icon={SlidersHorizontal} onPress={() => setShowFilters(true)} isActive={showFilters} />

        <PillButton
          label="Promotions"
          onPress={() => toggleQuickFilter("promotions")}
          isActive={promotions}
        />
        <PillButton
          label="Top Choice"
          onPress={() => toggleQuickFilter("topChoice")}
          isActive={topChoice}
        />
        <PillButton
          label="Free Delivery"
          onPress={() => toggleQuickFilter("freeDelivery")}
          isActive={freeDelivery}
        />
      </ScrollView>
    </Animated.View>
  );

  const mainContent = (
    <View style={styles.mainWrapper}>
      <View style={{ height: vs(10) }} />

      {showResultCount && (
        <Text style={styles.resultsCount}>
          {isLoading ? "Searching..." : `${totalItems} Results${debouncedSearchTerm ? ` for “${debouncedSearchTerm}”` : ""}`}
        </Text>
      )}

      {showInlineSpinner && (
        <View style={styles.inlineSpinner}>
          <ActivityIndicator size="small" color="#CA251B" />
          <Text style={styles.inlineSpinnerText}>Updating results...</Text>
        </View>
      )}

      <View style={styles.cardList}>
        {isLoading ? (
          <View style={styles.stateContainer}>
            <ActivityIndicator size="large" color="#CA251B" />
            <Text style={styles.stateText}>Loading restaurants...</Text>
          </View>
        ) : isError ? (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>We couldn't load restaurants. Please try again.</Text>
            <TouchableOpacity style={styles.retryButton} activeOpacity={0.8} onPress={() => refetch()}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : isEmpty ? (
          <View style={styles.stateContainer}>
            <Text style={styles.stateText}>No restaurants match your filters yet.</Text>
          </View>
        ) : (
          combinedResults.map((entry) =>
            entry.type === "restaurant" ? (
              <RestaurantCard key={`restaurant-${entry.restaurant.id}`} data={entry.restaurant} />
            ) : (
              <PromotedMenuItemCard
                key={`promotion-${entry.restaurantId}-${entry.item.id}`}
                item={entry.item}
                restaurantName={entry.restaurantName}
              />
            )
          )
        )}
      </View>
    </View>
  );

  return (
    <>
      <MainLayout
        headerBackgroundImage={require("../../assets/pattern1.png")}
        showHeader
        showFooter
        activeTab="Search"
        headerMaxHeight={vs(160)}
        headerMinHeight={vs(120)}
        customHeader={customHeader}
        enableHeaderCollapse={false}
        mainContent={mainContent}
      />
      <FiltersOverlay
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleApplyOverlayFilters}
        onClearAll={handleClearAll}
        initialFilters={overlayFilters}
      />
    </>
  );
}

const styles = ScaledSheet.create({
  headerWrapper: {
    padding: "6@s",
    paddingBottom: "20@vs",
  },
  searchBarContainer: {
    marginTop: "10@vs",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: "12@ms",
    paddingHorizontal: "12@s",
    paddingVertical: "2@vs",
    marginHorizontal: "4@s",
  },
  searchInput: {
    flex: 1,
    fontSize: "15@ms",
    fontFamily: "Roboto",
    fontWeight: "500",
    color: "black",
  },
  pillsContainer: {
    paddingHorizontal: "6@s",
    gap: "8@s",
    paddingBottom: "10@vs",
  },
  pillButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: "20@ms",
    paddingHorizontal: "14@s",
    paddingVertical: "8@vs",
    borderWidth: 1,
    borderColor: "#CA251B",
  },
  pillActive: {
    backgroundColor: "#CA251B",
    borderColor: "white",
  },
  pillText: {
    color: "#CA251B",
    fontFamily: "Roboto",
    fontSize: "14@ms",
    fontWeight: "500",
  },
  pillTextActive: {
    color: "white",
    fontFamily: "Roboto",
    fontSize: "14@ms",
    fontWeight: "500",
  },
  mainWrapper: {
    flex: 1,
    backgroundColor: "transparent",
    borderTopLeftRadius: "24@ms",
    borderTopRightRadius: "24@ms",
    overflow: "hidden",
    paddingHorizontal: "16@s",
    paddingBottom: "100@vs",
  },
  resultsCount: {
    fontFamily: "Roboto",
    fontSize: "14@ms",
    fontWeight: "600",
    marginBottom: "12@vs",
    color: "#8B909D",
    textAlign: "center",
  },
  inlineSpinner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: "8@s",
    marginBottom: "12@vs",
  },
  inlineSpinnerText: {
    color: "#8B909D",
    fontFamily: "Roboto",
    fontSize: "13@ms",
    fontWeight: "500",
  },
  cardList: { gap: "16@vs" },
  card: {
    backgroundColor: "white",
    borderRadius: "12@ms",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: "6@ms",
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    height: "180@vs",
    resizeMode: "cover",
  },
  badgeTopRight: {
    position: "absolute",
    top: "10@vs",
    right: "10@s",
    backgroundColor: "white",
    borderRadius: "50@ms",
    padding: "4@s",
    elevation: 3,
  },
  discountBadge: {
    position: "absolute",
    top: "10@vs",
    right: "10@s",
    backgroundColor: "#CA251B",
    borderRadius: "8@ms",
    paddingHorizontal: "8@s",
    paddingVertical: "4@vs",
    elevation: 3,
  },
  discountText: {
    color: "white",
    fontFamily: "Roboto",
    fontSize: "14@ms",
    fontWeight: "700",
  },
  cardBody: { padding: "10@s" },
  cardTitle: {
    fontFamily: "Roboto",
    fontSize: "18@ms",
    fontWeight: "700",
    color: "#333",
    marginBottom: "4@vs",
  },
  timeRatingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  deliveryTime: {
    color: "#6B7280",
    fontFamily: "Roboto",
    fontSize: "14@ms",
  },
  ratingRow: { flexDirection: "row", alignItems: "center" },
  ratingText: {
    fontFamily: "Roboto",
    fontSize: "14@ms",
    marginLeft: "4@s",
    color: "#333",
    fontWeight: "600",
  },
  promoContainer: {
    flexDirection: "row",
    marginTop: "8@vs",
  },
  freeDeliveryPill: {
    backgroundColor: "#CA251B",
    borderRadius: "6@ms",
    paddingHorizontal: "10@s",
    paddingVertical: "4@vs",
  },
  promoText: {
    color: "white",
    fontFamily: "Roboto",
    fontSize: "13@ms",
    fontWeight: "600",
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: "16@ms",
    padding: "10@s",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
    gap: "12@s",
  },
  menuImage: {
    width: "64@s",
    height: "64@s",
    borderRadius: "12@ms",
    backgroundColor: "#F3F4F6",
  },
  menuInfo: { flex: 1, gap: "4@vs" },
  menuTitle: {
    fontFamily: "Roboto",
    fontSize: "15@ms",
    fontWeight: "700",
    color: "#111827",
  },
  menuSubtitle: {
    fontFamily: "Roboto",
    fontSize: "12.5@ms",
    color: "#6B7280",
  },
  menuBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#FEE2E2",
    color: "#B91C1C",
    fontFamily: "Roboto",
    fontSize: "11.5@ms",
    fontWeight: "600",
    paddingHorizontal: "8@s",
    paddingVertical: "2@vs",
    borderRadius: "10@ms",
  },
  menuPriceColumn: {
    alignItems: "flex-end",
    gap: "2@vs",
  },
  menuOriginalPrice: {
    fontFamily: "Roboto",
    fontSize: "12@ms",
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  menuPrice: {
    fontFamily: "Roboto",
    fontSize: "14@ms",
    fontWeight: "700",
    color: "#047857",
  },
  stateContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: "40@vs",
    gap: "16@vs",
  },
  stateText: {
    textAlign: "center",
    color: "#6B7280",
    fontFamily: "Roboto",
    fontSize: "14@ms",
    fontWeight: "500",
    maxWidth: "240@s",
  },
  retryButton: {
    backgroundColor: "#CA251B",
    borderRadius: "24@ms",
    paddingHorizontal: "24@s",
    paddingVertical: "10@vs",
  },
  retryText: {
    color: "white",
    fontFamily: "Roboto",
    fontSize: "14@ms",
    fontWeight: "600",
  },
});
