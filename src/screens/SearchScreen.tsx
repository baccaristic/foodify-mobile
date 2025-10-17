import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { NavigationProp, ParamListBase, useNavigation } from "@react-navigation/native";
import { ScaledSheet, s, vs } from "react-native-size-matters";
import { Search, SlidersHorizontal, Star } from "lucide-react-native";
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import MainLayout from "~/layouts/MainLayout";
import Header from "~/components/Header";
import FiltersOverlay from "~/components/FiltersOverlay";
import useDebounce from "~/hooks/useDebounce";
import MenuDetail from "./MenuDetail";
import { getRestaurantDetails, searchRestaurants } from "~/api/restaurants";
import { favoriteMenuItem, unfavoriteMenuItem } from "~/api/favorites";
import type {
  MenuItemPromotion,
  RestaurantDetailsResponse,
  RestaurantMenuCategory,
  RestaurantMenuItemDetails,
  RestaurantMenuItemSummary,
  RestaurantSearchItem,
  RestaurantSearchParams,
  RestaurantSearchSort,
} from "~/interfaces/Restaurant";
import { useCart } from "~/context/CartContext";
import type { CartItemOptionSelection } from "~/context/CartContext";
import { getMenuItemBasePrice } from "~/utils/menuPricing";
import { updateMenuItemFavoriteState } from "~/utils/restaurantFavorites";
import { BASE_API_URL } from "@env";

const FALLBACK_IMAGE = require("../../assets/TEST.png");
const FALLBACK_MENU_IMAGE = require("../../assets/TEST.png");
const INITIAL_PAGE = 0;
const PAGE_SIZE = 20;
const { height: SCREEN_HEIGHT } = Dimensions.get("screen");
const MODAL_HEIGHT = SCREEN_HEIGHT;

const QUICK_FILTERS_DEFAULT = Object.freeze({
  promotions: false,
  topChoice: false,
  freeDelivery: false,
});

const OVERLAY_FILTERS_DEFAULT = Object.freeze({
  sort: "picked" as RestaurantSearchSort,
  topEat: false,
  maxFee: 2.5,
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
  const iconColor = "#CA251B";

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
const formatDeliveryFee = (fee: number) => (fee > 0 ? `${formatCurrency(fee)} delivery fee` : "Free delivery");

const flattenCategories = (categories: RestaurantMenuCategory[] = []) =>
  categories.reduce<RestaurantMenuItemDetails[]>((acc, category) => acc.concat(category.items), []);

const mapSummaryToDetails = (summary: RestaurantMenuItemSummary): RestaurantMenuItemDetails => ({
  ...summary,
  optionGroups: [],
});

const findMenuItemDetails = (
  restaurant: RestaurantDetailsResponse,
  itemId: number
): RestaurantMenuItemDetails | null => {
  const categoryMatch = flattenCategories(restaurant.categories).find((item) => item.id === itemId);
  if (categoryMatch) {
    return categoryMatch;
  }

  const topSaleMatch = restaurant.topSales.find((item) => item.id === itemId);
  if (topSaleMatch) {
    return mapSummaryToDetails(topSaleMatch);
  }

  return null;
};

const RestaurantCard = ({
  data,
  onPress,
}: {
  data: RestaurantSearchItem;
  onPress: () => void;
}) => {
  const { name, deliveryTimeRange, rating, isTopChoice, hasFreeDelivery, imageUrl, deliveryFee } = data;

  const imageSource = imageUrl ? { uri: `${BASE_API_URL}/auth/image/${imageUrl}` } : FALLBACK_IMAGE;
  const formattedRating = Number.isFinite(rating) ? `${rating}/5` : "-";

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9} onPress={onPress}>
      <Image source={imageSource} style={styles.cardImage} />

      {isTopChoice && (
        <View style={styles.badgeTopRight}>
          <Star size={s(16)} color="white" fill="#CA251B" />
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

        <Text style={styles.deliveryFee}>{formatDeliveryFee(deliveryFee)}</Text>

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
  onPress,
}: {
  item: MenuItemPromotion;
  restaurantName: string;
  onPress: () => void;
}) => {
  const { name, promotionLabel, price, promotionPrice, imageUrl } = item;
  const imageSource = imageUrl ? { uri: `${BASE_API_URL}/auth/image/${imageUrl}` } : FALLBACK_MENU_IMAGE;
  const hasPromoPrice = typeof promotionPrice === "number" && Number.isFinite(promotionPrice);

  return (
    <TouchableOpacity style={styles.menuCard} activeOpacity={0.9} onPress={onPress}>
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

const RestaurantResult = ({
  restaurant,
  onRestaurantPress,
  onPromotedItemPress,
}: {
  restaurant: RestaurantSearchItem;
  onRestaurantPress: (restaurantId: number) => void;
  onPromotedItemPress: (restaurant: RestaurantSearchItem, item: MenuItemPromotion) => void;
}) => {
  const promotions = restaurant.promotedMenuItems ?? [];

  return (
    <View style={styles.restaurantResult}>
      <RestaurantCard data={restaurant} onPress={() => onRestaurantPress(restaurant.id)} />
      {promotions.length > 0 && (
        <View style={styles.promotedMenuList}>
          <Text style={styles.promotedMenuHeading}>Promoted items</Text>
          {promotions.map((item) => (
            <PromotedMenuItemCard
              key={`promotion-${restaurant.id}-${item.id}`}
              item={item}
              restaurantName={restaurant.name}
              onPress={() => onPromotedItemPress(restaurant, item)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default function SearchScreen() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const queryClient = useQueryClient();
  const { addItem } = useCart();
  const userLatitude = 36.8065;
  const userLongitude = 10.1815;

  const [isMenuModalVisible, setIsMenuModalVisible] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<RestaurantMenuItemDetails | null>(null);
  const [pendingFavoriteMenuItemId, setPendingFavoriteMenuItemId] = useState<number | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<{ id: number; name: string } | null>(null);
  const [isFetchingMenuItem, setIsFetchingMenuItem] = useState(false);

  const selectedRestaurantId = selectedRestaurant?.id ?? null;

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [quickFilters, setQuickFilters] = useState(() => ({ ...QUICK_FILTERS_DEFAULT }));
  const [overlayFilters, setOverlayFilters] = useState<OverlayFiltersState>(() => ({
    ...OVERLAY_FILTERS_DEFAULT,
  }));

  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const translateY = useSharedValue(MODAL_HEIGHT);

  const animatedModalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    translateY.value = withTiming(isMenuModalVisible ? 0 : MODAL_HEIGHT, { duration: 300 });
  }, [isMenuModalVisible, translateY]);

  useEffect(() => {
    if (!isMenuModalVisible && selectedMenuItem) {
      const timeout = setTimeout(() => {
        setSelectedMenuItem(null);
        setSelectedRestaurant(null);
      }, 300);

      return () => clearTimeout(timeout);
    }

    return undefined;
  }, [isMenuModalVisible, selectedMenuItem]);

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

  const searchParamsBase = useMemo<RestaurantSearchParams>(() => {
    const trimmedQuery = debouncedSearchTerm.trim();

    return {
      lat: userLatitude,
      lng: userLongitude,
      query: trimmedQuery,
      hasPromotion: promotions,
      isTopChoice: topChoice,
      hasFreeDelivery: freeDelivery,
      sort,
      topEatOnly: topEat,
      maxDeliveryFee: maxFee,
      pageSize: PAGE_SIZE,
    };
  }, [debouncedSearchTerm, promotions, topChoice, freeDelivery, sort, topEat, maxFee, userLatitude, userLongitude]);

  const {
    data,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isRefetching,
  } = useInfiniteQuery({
    queryKey: ["restaurants-search", searchParamsBase],
    queryFn: ({ pageParam = INITIAL_PAGE }) =>
      searchRestaurants({
        ...searchParamsBase,
        page: pageParam,
      }),
    getNextPageParam: (lastPage) => {
      const fetchedItems = lastPage.page * lastPage.pageSize + lastPage.items.length;
      if (fetchedItems >= lastPage.totalItems) {
        return undefined;
      }

      return lastPage.page + 1;
    },
    initialPageParam: INITIAL_PAGE,
  });

  const menuItemFavoriteMutation = useMutation({
    mutationFn: async ({
      menuItemId,
      shouldFavorite,
    }: {
      menuItemId: number;
      shouldFavorite: boolean;
    }) => {
      if (shouldFavorite) {
        await favoriteMenuItem(menuItemId);
      } else {
        await unfavoriteMenuItem(menuItemId);
      }
    },
  });

  const handleRestaurantPress = useCallback(
    (restaurantId: number) => {
      navigation.navigate("RestaurantDetails" as never, { restaurantId } as never);
    },
    [navigation]
  );

  const handlePromotedItemPress = useCallback(
    async (restaurant: RestaurantSearchItem, promotion: MenuItemPromotion) => {
      if (isFetchingMenuItem) {
        return;
      }

      setIsFetchingMenuItem(true);

      try {
        const details = await queryClient.fetchQuery({
          queryKey: ["restaurant-details", restaurant.id, userLatitude, userLongitude],
          queryFn: () =>
            getRestaurantDetails({ id: restaurant.id, lat: userLatitude, lng: userLongitude }),
        });

        const menuItemDetails = findMenuItemDetails(details, promotion.id);

        if (!menuItemDetails) {
          Alert.alert(
            "Menu item unavailable",
            "We couldn't load this promoted item right now. Please try again later."
          );
          return;
        }

        setSelectedMenuItem(menuItemDetails);
        setSelectedRestaurant({ id: details.id, name: details.name });
        setIsMenuModalVisible(true);
      } catch {
        Alert.alert("Something went wrong", "We couldn't load this promoted item. Please try again.");
      } finally {
        setIsFetchingMenuItem(false);
      }
    },
    [isFetchingMenuItem, queryClient, userLatitude, userLongitude]
  );

  const handleToggleMenuItemFavorite = useCallback(
    (menuItemId: number, nextFavorite: boolean) => {
      const previousData =
        selectedRestaurantId !== null
          ? queryClient.getQueryData<RestaurantDetailsResponse>([
              "restaurant-details",
              selectedRestaurantId,
              userLatitude,
              userLongitude,
            ])
          : undefined;

      if (previousData && selectedRestaurantId !== null) {
        const updatedData = updateMenuItemFavoriteState(previousData, menuItemId, nextFavorite);
        queryClient.setQueryData(
          ["restaurant-details", selectedRestaurantId, userLatitude, userLongitude],
          updatedData
        );
      }

      setSelectedMenuItem((prev) => (prev && prev.id === menuItemId ? { ...prev, favorite: nextFavorite } : prev));
      setPendingFavoriteMenuItemId(menuItemId);

      menuItemFavoriteMutation.mutate(
        { menuItemId, shouldFavorite: nextFavorite },
        {
          onError: () => {
            if (previousData && selectedRestaurantId !== null) {
              queryClient.setQueryData(
                ["restaurant-details", selectedRestaurantId, userLatitude, userLongitude],
                previousData
              );
            }

            setSelectedMenuItem((prev) =>
              prev && prev.id === menuItemId ? { ...prev, favorite: !nextFavorite } : prev
            );
          },
          onSettled: () => {
            setPendingFavoriteMenuItemId(null);

            if (selectedRestaurantId !== null) {
              queryClient.invalidateQueries({
                queryKey: ["restaurant-details", selectedRestaurantId, userLatitude, userLongitude],
              });
            }
          },
        }
      );
    },
    [menuItemFavoriteMutation, queryClient, selectedRestaurantId, userLatitude, userLongitude]
  );

  const handleAddMenuItem = useCallback(
    (items: { quantity: number; extras: CartItemOptionSelection[] }[]) => {
      if (!selectedMenuItem || !selectedRestaurant) {
        setIsMenuModalVisible(false);
        return;
      }

      if (items.length === 0) {
        setIsMenuModalVisible(false);
        return;
      }

      items.forEach((item) => {
        if (item.quantity <= 0) {
          return;
        }

        addItem({
          restaurant: selectedRestaurant,
          menuItem: {
            id: selectedMenuItem.id,
            name: selectedMenuItem.name,
            description: selectedMenuItem.description,
            imageUrl: selectedMenuItem.imageUrl,
            price: getMenuItemBasePrice(selectedMenuItem),
          },
          quantity: item.quantity,
          extras: item.extras,
        });
      });

      setIsMenuModalVisible(false);
    },
    [addItem, selectedMenuItem, selectedRestaurant]
  );

  const handleCloseMenuModal = useCallback(() => {
    setIsMenuModalVisible(false);
  }, []);

  const restaurants = useMemo(
    () => data?.pages.flatMap((page) => page.items) ?? [],
    [data]
  );
  const totalItems = data?.pages?.[0]?.totalItems ?? 0;

  const showResultCount = useMemo(() => {
    const baseQueryActive = debouncedSearchTerm.trim().length > 0;
    const quickFiltersActive = promotions || topChoice || freeDelivery;
    const overlayChanged =
      sort !== OVERLAY_FILTERS_DEFAULT.sort ||
      topEat !== OVERLAY_FILTERS_DEFAULT.topEat ||
      maxFee !== OVERLAY_FILTERS_DEFAULT.maxFee;

    return baseQueryActive || quickFiltersActive || overlayChanged;
  }, [debouncedSearchTerm, promotions, topChoice, freeDelivery, sort, topEat, maxFee]);

  const showInlineSpinner = isRefetching && !isFetchingNextPage && restaurants.length > 0;
  const isEmpty = !isLoading && !isError && !isRefetching && restaurants.length === 0;

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const renderResultItem = useCallback(
    ({ item }: { item: RestaurantSearchItem }) => (
      <RestaurantResult
        restaurant={item}
        onRestaurantPress={handleRestaurantPress}
        onPromotedItemPress={handlePromotedItemPress}
      />
    ),
    [handlePromotedItemPress, handleRestaurantPress]
  );

  const renderListHeader = useCallback(() => (
    <View style={styles.mainWrapper}>
      <View style={{ height: vs(10) }} />

      {showResultCount && (
        <Text style={styles.resultsCount}>
          {isLoading
            ? "Searching..."
            : `${totalItems} Results${debouncedSearchTerm ? ` for “${debouncedSearchTerm}”` : ""}`}
        </Text>
      )}

      {showInlineSpinner && (
        <View style={styles.inlineSpinner}>
          <ActivityIndicator size="small" color="#CA251B" />
          <Text style={styles.inlineSpinnerText}>Updating results...</Text>
        </View>
      )}
    </View>
  ), [debouncedSearchTerm, isLoading, showInlineSpinner, showResultCount, totalItems]);

  const renderListEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color="#CA251B" />
          <Text style={styles.stateText}>Loading restaurants...</Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>We couldn’t load restaurants. Please try again.</Text>
          <TouchableOpacity style={styles.retryButton} activeOpacity={0.8} onPress={() => refetch()}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (isEmpty) {
      return (
        <View style={styles.stateContainer}>
          <Text style={styles.stateText}>No restaurants match your filters yet.</Text>
        </View>
      );
    }

    return null;
  }, [isEmpty, isError, isLoading, refetch]);

  const renderListFooter = useCallback(() => {
    if (!isFetchingNextPage) {
      return null;
    }

    return (
      <View style={styles.listFooter}>
        <ActivityIndicator size="small" color="#CA251B" />
        <Text style={styles.inlineSpinnerText}>Loading more restaurants...</Text>
      </View>
    );
  }, [isFetchingNextPage]);

  const listItemSeparator = useCallback(() => <View style={styles.itemSeparator} />, []);

  const mainContent = <></>;

  const isRefreshing = isRefetching && !isFetchingNextPage;

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
        style={{ marginTop: vs(14) }}
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
        isRefreshing={isRefreshing}
        onRefresh={() => {
          refetch();
        }}
        virtualizedListProps={{
          data: restaurants,
          renderItem: renderResultItem,
          keyExtractor: (item) => `restaurant-${item.id}`,
          ListHeaderComponent: renderListHeader,
          ListEmptyComponent: renderListEmpty,
          ListFooterComponent: renderListFooter,
          ItemSeparatorComponent: listItemSeparator,
          onEndReached: handleEndReached,
          onEndReachedThreshold: 0.4,
          showsVerticalScrollIndicator: false,
          contentContainerStyle: styles.listContent,
        }}
      />
      <FiltersOverlay
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleApplyOverlayFilters}
        onClearAll={handleClearAll}
        initialFilters={overlayFilters}
      />
      {isMenuModalVisible && (
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={handleCloseMenuModal} />
      )}
      {selectedMenuItem && (
        <Animated.View style={[styles.menuModalContainer, { height: MODAL_HEIGHT }, animatedModalStyle]}>
          <MenuDetail
            menuItem={selectedMenuItem}
            handleAddItem={handleAddMenuItem}
            onClose={handleCloseMenuModal}
            actionLabel="Add"
            onToggleFavorite={(nextFavorite) =>
              handleToggleMenuItemFavorite(selectedMenuItem.id, nextFavorite)
            }
            isFavoriteLoading={
              menuItemFavoriteMutation.isPending &&
              pendingFavoriteMenuItemId === selectedMenuItem.id
            }
          />
        </Animated.View>
      )}
      {isFetchingMenuItem && (
        <View style={styles.menuLoadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      )}
    </>
  );
}

const styles = ScaledSheet.create({
  headerWrapper: {
    paddingHorizontal: "6@s",
    paddingBottom: "14@vs",
    paddingTop:"4@vs"
  },
  searchBarContainer: {
    marginTop: "2@vs",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: "16@ms",
  paddingHorizontal: Platform.OS === "ios" ? vs(8) : 10,
    marginHorizontal: "10@s",
    marginVertical:"2@s",
      paddingVertical: Platform.OS === "ios" ? vs(10) : 0,

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
    backgroundColor: "transparent",
    borderTopLeftRadius: "24@ms",
    borderTopRightRadius: "24@ms",
    overflow: "hidden",
    paddingHorizontal: "16@s",
    paddingBottom: "16@vs",
  },
  listContent: {
    paddingHorizontal: '16@s',
    paddingBottom: '80@vs',
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
  listFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8@s',
    paddingVertical: '16@vs',
  },
  itemSeparator: {
    height: '16@vs',
  },
  restaurantResult: { gap: "12@vs" },
  promotedMenuList: { gap: "12@vs", marginTop: "6@vs" },
  promotedMenuHeading: {
    fontFamily: "Roboto",
    fontSize: "13@ms",
    fontWeight: "600",
    color: "#CA251B",
    marginLeft: "6@s",
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
  deliveryFee: {
    color: "#4B5563",
    fontFamily: "Roboto",
    fontSize: "13@ms",
    marginTop: "4@vs",
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
  modalOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    zIndex: 30,
  },
  menuModalContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "white",
    borderTopLeftRadius: "24@ms",
    borderTopRightRadius: "24@ms",
    overflow: "hidden",
    zIndex: 40,
  },
  menuLoadingOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },
});
