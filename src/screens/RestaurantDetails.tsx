import { ArrowLeft, Clock7, Heart, MapPin, Plus, Star } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { LayoutChangeEvent, ScrollView as ScrollViewType } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  NavigationProp,
  ParamListBase,
  RouteProp,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import MainLayout from '~/layouts/MainLayout';
import FixedOrderBar from '~/components/FixedOrderBar';
import MenuDetail from './MenuDetail';
import RestaurantDetailsSkeleton from '~/components/skeletons/RestaurantDetailsSkeleton';
import RemoteImageWithSkeleton from '~/components/RemoteImageWithSkeleton';
import { getRestaurantDetails } from '~/api/restaurants';
import {
  favoriteMenuItem,
  favoriteRestaurant,
  unfavoriteMenuItem,
  unfavoriteRestaurant,
} from '~/api/favorites';
import type {
  RestaurantDetailsResponse,
  RestaurantMenuCategory,
  RestaurantMenuItemDetails,
  RestaurantMenuItemSummary,
} from '~/interfaces/Restaurant';
import { useCart } from '~/context/CartContext';
import type { CartItem, CartItemOptionSelection } from '~/context/CartContext';
import { moderateScale, vs } from 'react-native-size-matters';
import { getMenuItemBasePrice, hasActivePromotion } from '~/utils/menuPricing';
import {
  updateMenuItemFavoriteState,
  hasValidEstimatedDeliveryTime,
} from '~/utils/restaurantFavorites';
import { useTranslation, useLocalization } from '~/localization';
import { getLocalizedName, getLocalizedDescription } from '~/utils/localization';
import useSelectedAddress from '~/hooks/useSelectedAddress';

const { width, height: screenHeight } = Dimensions.get('screen');
const modalHeight = screenHeight;
const CATEGORY_TAB_HEIGHT = vs(44);
const CATEGORY_TAB_OVERLAY_TOP = vs(92);
const MENU_TAB_SHOW_THRESHOLD = vs(24);
const VIEWPORT_BUFFER_NO_TABS = vs(24);
const VIEWPORT_BUFFER_WITH_TABS = CATEGORY_TAB_HEIGHT + vs(16);
const MAX_CARD_STAGGER = 8;

const AnimatedText = Animated.createAnimatedComponent(Text);

const createMenuCardEntrance = (index: number) =>
  FadeInUp.springify()
    .mass(0.7)
    .stiffness(170)
    .damping(18)
    .withInitialValues({
      opacity: 0,
      transform: [{ translateY: 40 }, { scale: 0.92 }],
    })
    .delay(Math.min(index, MAX_CARD_STAGGER) * 70);

const createSectionHeaderEntrance = (index: number) =>
  FadeInLeft.springify()
    .stiffness(140)
    .damping(16)
    .withInitialValues({
      opacity: 0,
      transform: [{ translateX: -24 }],
    })
    .delay(index * 80);

const createHighlightChipEntrance = (index: number) =>
  FadeInUp.springify()
    .mass(0.9)
    .stiffness(150)
    .damping(18)
    .withInitialValues({
      opacity: 0,
      transform: [{ translateY: 24 }],
    })
    .delay(index * 45);

interface RestaurantDetailsRouteParams {
  RestaurantDetails: {
    restaurantId: number;
    cartItemId?: string;
    menuItemId?: number;
  };
}

type RestaurantDetailsRouteProp = RouteProp<RestaurantDetailsRouteParams, 'RestaurantDetails'>;

type MenuCardItem = RestaurantMenuItemDetails | RestaurantMenuItemSummary;

const formatCurrency = (value: number) => `${value.toFixed(3).replace('.', ',')} DT`;

const MenuItemCard: React.FC<{ item: MenuCardItem; onOpenModal: (itemId: number) => void }> = ({
  item,
  onOpenModal,
}) => {
  const { locale } = useLocalization();
  const promotionActive = hasActivePromotion(item);
  const displayPrice = formatCurrency(getMenuItemBasePrice(item));
  const localizedName = getLocalizedName(item, locale);
  const localizedDescription = getLocalizedDescription(item, locale);

  return (
    <TouchableOpacity
      style={{ width: width / 2 - 24 }}
      className="flex flex-col overflow-hidden rounded-xl bg-white shadow-md"
      onPress={() => onOpenModal(item.id)}>
      <View className="relative">
        <RemoteImageWithSkeleton
          imagePath={item.imageUrl}
          containerStyle={styles.menuImageContainer}
          imageStyle={styles.menuImage}
          skeletonStyle={styles.menuImage}
        />
        {promotionActive && item.promotionLabel ? (
          <View className="absolute left-2 top-2 rounded-full bg-[#CA251B]/90 px-2 py-1">
            <Text
              allowFontScaling={false}
              className="text-[10px] font-semibold uppercase text-white">
              {item.promotionLabel}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="flex flex-col p-3">
        <Text
          allowFontScaling={false}
          className="text-sm font-bold text-[#17213A]"
          numberOfLines={1}>
          {localizedName}
        </Text>
        <Text allowFontScaling={false} className="text-xs text-gray-500" numberOfLines={2}>
          {localizedDescription}
        </Text>

        <View className="mt-2 flex-row items-center justify-between">
          <View className="flex-row items-baseline gap-2">
            <Text allowFontScaling={false} className="font-bold text-[#CA251B]">
              {displayPrice}
            </Text>
          </View>

          <TouchableOpacity
            className="rounded-full bg-[#CA251B] p-1.5 text-white shadow-md"
            onPress={() => onOpenModal(item.id)}>
            <Plus size={18} color="white" />
          </TouchableOpacity>
        </View>
        <View>
          {promotionActive ? (
            <Text
              allowFontScaling={false}
              className="text-xs font-semibold text-gray-400 line-through">
              {formatCurrency(item.price)}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const flattenCategories = (categories?: RestaurantMenuCategory[]) =>
  (categories ?? []).reduce<RestaurantMenuItemDetails[]>((acc, category) => {
    const items = category.items ?? [];
    return acc.concat(items);
  }, []);

const mapSummaryToDetails = (summary: RestaurantMenuItemSummary): RestaurantMenuItemDetails => ({
  ...summary,
  optionGroups: [],
});

const mapCartItemToSelections = (cartItem: CartItem) => {
  const selections: Record<number, number[]> = {};

  cartItem.extras.forEach((group) => {
    selections[group.groupId] = group.extras.map((extra) => extra.id);
  });

  return selections;
};

const duplicateSelections = (selections: Record<number, number[]>) =>
  Object.entries(selections).reduce<Record<number, number[]>>((acc, [key, value]) => {
    acc[Number(key)] = [...value];
    return acc;
  }, {});

const buildInitialDraftsFromCartItem = (cartItem: CartItem) => {
  const baseSelections = mapCartItemToSelections(cartItem);

  return Array.from({ length: cartItem.quantity }, () => duplicateSelections(baseSelections));
};

export default function RestaurantDetails() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<RestaurantMenuItemDetails | null>(null);
  const [editingCartItemId, setEditingCartItemId] = useState<string | null>(null);
  const [initialDraftSelections, setInitialDraftSelections] = useState<
    Record<number, number[]>[] | null
  >(null);
  const [activeMenuSection, setActiveMenuSection] = useState<string | null>(null);
  const [showMenuTabs, setShowMenuTabs] = useState(false);
  const [pendingFavoriteMenuItemId, setPendingFavoriteMenuItemId] = useState<number | null>(null);
  const [handledMenuItemParamKey, setHandledMenuItemParamKey] = useState<string | null>(null);

  const scrollViewRef = useRef<ScrollViewType | null>(null);
  const menuContentOffsetRef = useRef<number | null>(null);
  const sectionRelativeOffsetsRef = useRef<Record<string, number>>({});

  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { locale } = useLocalization();
  const {
    addItem,
    itemCount,
    items: cartItems,
    removeItem,
    restaurant: cartRestaurant,
  } = useCart();

  const translateY = useSharedValue(modalHeight);
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<RestaurantDetailsRouteProp>();
  const restaurantId = route.params?.restaurantId;
  const cartItemIdFromParams = route.params?.cartItemId;
  const menuItemIdFromParams = route.params?.menuItemId;
  const [handledCartItemId, setHandledCartItemId] = useState<string | null>(null);
  const isRestaurantIdValid = typeof restaurantId === 'number' && !Number.isNaN(restaurantId);
  const queryClient = useQueryClient();
  const selectedAddress = useSelectedAddress();
  const userLatitude = selectedAddress.selectedAddress?.coordinates.latitude;
  const userLongitude = selectedAddress.selectedAddress?.coordinates.longitude;

  const {
    data: restaurant,
    isLoading,
    isError,
    refetch,
  } = useQuery<RestaurantDetailsResponse>({
    queryKey: ['restaurant-details', restaurantId, userLatitude, userLongitude],
    queryFn: () =>
      getRestaurantDetails({
        id: restaurantId as number,
        lat: userLatitude,
        lng: userLongitude,
      }),
    enabled: isRestaurantIdValid,
  });

  const allMenuItems = useMemo(
    () => (restaurant ? flattenCategories(restaurant.categories) : []),
    [restaurant]
  );
  const menuSections = useMemo(() => {
    if (!restaurant) {
      return [] as { key: string; label: string }[];
    }

    const sections: { key: string; label: string }[] = [];

    if (restaurant.topSales?.length) {
      sections.push({ key: 'top-sales', label: t('restaurantDetails.tabs.topSales') });
    }

    (restaurant.categories ?? []).forEach((category, index) => {
      sections.push({ key: `category-${index}`, label: getLocalizedName(category, locale) });
    });

    return sections;
  }, [restaurant, t, locale]);
  const hasMenuSections = menuSections.length > 0;

  const formatDeliveryFeeLabel = useCallback(
    (fee: number) =>
      fee > 0
        ? t('restaurantDetails.delivery.withFee', { values: { fee: formatCurrency(fee) } })
        : t('restaurantDetails.delivery.free'),
    [t]
  );

  const restaurantFavoriteMutation = useMutation({
    mutationFn: async ({
      restaurantId: targetRestaurantId,
      shouldFavorite,
    }: {
      restaurantId: number;
      shouldFavorite: boolean;
    }) => {
      if (shouldFavorite) {
        await favoriteRestaurant(targetRestaurantId);
      } else {
        await unfavoriteRestaurant(targetRestaurantId);
      }
    },
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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    sectionRelativeOffsetsRef.current = {};
    menuContentOffsetRef.current = null;
    setShowMenuTabs(false);
    setActiveMenuSection(menuSections[0]?.key ?? null);
  }, [menuSections, restaurant?.id]);

  useEffect(() => {
    if (isModalVisible) {
      translateY.value = withTiming(0, { duration: 300 });
    }
  }, [isModalVisible, translateY]);

  useEffect(() => {
    if (!cartItemIdFromParams) {
      setHandledCartItemId(null);
    }
  }, [cartItemIdFromParams]);

  useEffect(() => {
    if (!menuItemIdFromParams) {
      setHandledMenuItemParamKey(null);
    }
  }, [menuItemIdFromParams]);

  useEffect(() => {
    if (!restaurant || !cartItemIdFromParams) {
      return;
    }

    if (handledCartItemId === cartItemIdFromParams) {
      return;
    }

    if (cartRestaurant && cartRestaurant.id !== restaurant.id) {
      return;
    }

    const cartItem = cartItems.find((item) => item.id === cartItemIdFromParams);
    if (!cartItem) {
      return;
    }

    const drafts = buildInitialDraftsFromCartItem(cartItem);

    handleOpenMenuItem(cartItem.menuItemId, {
      editingCartItemId: cartItem.id,
      initialDrafts: drafts,
    });

    setHandledCartItemId(cartItemIdFromParams);
  }, [
    cartItemIdFromParams,
    cartItems,
    cartRestaurant,
    handleOpenMenuItem,
    handledCartItemId,
    restaurant,
  ]);

  useEffect(() => {
    if (!restaurant || !menuItemIdFromParams) {
      return;
    }

    const key = `${restaurant.id}-${menuItemIdFromParams}`;
    if (handledMenuItemParamKey && handledMenuItemParamKey.startsWith(key)) {
      return;
    }

    const didOpen = handleOpenMenuItem(menuItemIdFromParams, {
      editingCartItemId: null,
      initialDrafts: null,
    });

    setHandledMenuItemParamKey(`${key}-${didOpen ? 'opened' : 'missing'}`);
  }, [handleOpenMenuItem, handledMenuItemParamKey, menuItemIdFromParams, restaurant]);

  const handleMenuContentLayout = useCallback((event: LayoutChangeEvent) => {
    menuContentOffsetRef.current = event.nativeEvent.layout.y;
  }, []);

  const handleSectionLayout = useCallback((key: string, event: LayoutChangeEvent) => {
    sectionRelativeOffsetsRef.current[key] = event.nativeEvent.layout.y;
  }, []);

  const handleMenuScroll = useCallback(
    (offsetY: number) => {
      if (!hasMenuSections) {
        return;
      }

      const relativeEntries = Object.entries(sectionRelativeOffsetsRef.current);
      if (!relativeEntries.length) {
        return;
      }

      const menuContentOffset = menuContentOffsetRef.current;
      let shouldShowTabs = false;

      if (typeof menuContentOffset === 'number') {
        shouldShowTabs = offsetY >= Math.max(menuContentOffset - MENU_TAB_SHOW_THRESHOLD, 0);
        setShowMenuTabs((previous) => (previous === shouldShowTabs ? previous : shouldShowTabs));
      } else {
        shouldShowTabs = showMenuTabs;
      }

      const baseOffset = typeof menuContentOffset === 'number' ? menuContentOffset : 0;

      const entries = relativeEntries
        .map(([key, value]) => [key, value + baseOffset] as [string, number])
        .sort((a, b) => a[1] - b[1]);

      const viewportOffset =
        offsetY + (shouldShowTabs ? VIEWPORT_BUFFER_WITH_TABS : VIEWPORT_BUFFER_NO_TABS);

      let currentKey = entries[0][0];

      for (const [key, value] of entries) {
        if (!Number.isFinite(value)) {
          continue;
        }

        if (viewportOffset >= value) {
          currentKey = key;
        } else {
          break;
        }
      }

      setActiveMenuSection((previous) => (previous === currentKey ? previous : currentKey));
    },
    [hasMenuSections, showMenuTabs]
  );

  const handleTabPress = useCallback((key: string) => {
    setActiveMenuSection((previous) => (previous === key ? previous : key));

    const menuContentOffset = menuContentOffsetRef.current ?? 0;
    const relativeOffset = sectionRelativeOffsetsRef.current[key];

    if (!scrollViewRef.current || typeof relativeOffset !== 'number') {
      return;
    }

    const scrollTarget = Math.max(
      menuContentOffset + relativeOffset - VIEWPORT_BUFFER_WITH_TABS,
      0
    );
    scrollViewRef.current.scrollTo({ y: scrollTarget, animated: true });
  }, []);

  const handleOpenMenuItem = useCallback(
    (
      itemId: number,
      options?: {
        editingCartItemId?: string | null;
        initialDrafts?: Record<number, number[]>[] | null;
      }
    ): boolean => {
      if (!restaurant) {
        return false;
      }

      const detailedItem = allMenuItems.find((item) => item.id === itemId);
      if (detailedItem) {
        setSelectedMenuItem(detailedItem);
        setEditingCartItemId(options?.editingCartItemId ?? null);
        setInitialDraftSelections(options?.initialDrafts ?? null);
        setIsModalVisible(true);
        return true;
      }

      const topSaleMatch = restaurant.topSales.find((item) => item.id === itemId);
      if (topSaleMatch) {
        setSelectedMenuItem(mapSummaryToDetails(topSaleMatch));
        setEditingCartItemId(options?.editingCartItemId ?? null);
        setInitialDraftSelections(options?.initialDrafts ?? null);
        setIsModalVisible(true);
        return true;
      }

      return false;
    },
    [allMenuItems, restaurant]
  );

  const handleOpen = useCallback(
    (itemId: number) => {
      handleOpenMenuItem(itemId, { editingCartItemId: null, initialDrafts: null });
    },
    [handleOpenMenuItem]
  );

  const handleUpdateCartAndClose = useCallback(
    (items: { quantity: number; extras: CartItemOptionSelection[] }[]) => {
      if (!selectedMenuItem || !restaurant || items.length === 0) {
        setIsModalVisible(false);
        setSelectedMenuItem(null);
        setEditingCartItemId(null);
        setInitialDraftSelections(null);
        return;
      }

      if (editingCartItemId) {
        removeItem(editingCartItemId);
      }

      items.forEach((itemDetails) => {
        if (itemDetails.quantity <= 0) {
          return;
        }

        addItem({
          restaurant: { id: restaurant.id, name: getLocalizedName(restaurant, locale) },
          menuItem: {
            id: selectedMenuItem.id,
            name: getLocalizedName(selectedMenuItem, locale),
            description: getLocalizedDescription(selectedMenuItem, locale),
            imageUrl: selectedMenuItem.imageUrl,
            price: getMenuItemBasePrice(selectedMenuItem),
          },
          quantity: itemDetails.quantity,
          extras: itemDetails.extras,
        });
      });

      setIsModalVisible(false);
      setSelectedMenuItem(null);
      setEditingCartItemId(null);
      setInitialDraftSelections(null);
    },
    [addItem, editingCartItemId, removeItem, restaurant, selectedMenuItem, locale]
  );

  const handleToggleRestaurantFavorite = useCallback(() => {
    if (!restaurant || !isRestaurantIdValid) {
      return;
    }

    const nextFavorite = !(restaurant.favorite ?? false);
    const previousRestaurant = restaurant;

    queryClient.setQueryData(['restaurant-details', restaurant.id, userLatitude, userLongitude], {
      ...previousRestaurant,
      favorite: nextFavorite,
    });

    restaurantFavoriteMutation.mutate(
      { restaurantId: restaurant.id, shouldFavorite: nextFavorite },
      {
        onError: () => {
          queryClient.setQueryData(
            ['restaurant-details', previousRestaurant.id, userLatitude, userLongitude],
            previousRestaurant
          );
        },
        onSettled: () => {
          queryClient.invalidateQueries({
            queryKey: ['restaurant-details', previousRestaurant.id, userLatitude, userLongitude],
          });
        },
      }
    );
  }, [
    isRestaurantIdValid,
    queryClient,
    restaurant,
    restaurantFavoriteMutation,
    userLatitude,
    userLongitude,
  ]);

  const handleToggleMenuItemFavorite = useCallback(
    (menuItemId: number, nextFavorite: boolean) => {
      if (!isRestaurantIdValid) {
        return;
      }

      const previousData = queryClient.getQueryData<RestaurantDetailsResponse>([
        'restaurant-details',
        restaurantId,
        userLatitude,
        userLongitude,
      ]);

      if (previousData) {
        const updatedData = updateMenuItemFavoriteState(previousData, menuItemId, nextFavorite);
        queryClient.setQueryData(
          ['restaurant-details', restaurantId, userLatitude, userLongitude],
          updatedData
        );
      }

      setSelectedMenuItem((prev) =>
        prev && prev.id === menuItemId ? { ...prev, favorite: nextFavorite } : prev
      );
      setPendingFavoriteMenuItemId(menuItemId);

      menuItemFavoriteMutation.mutate(
        { menuItemId, shouldFavorite: nextFavorite },
        {
          onError: () => {
            if (previousData) {
              queryClient.setQueryData(
                ['restaurant-details', restaurantId, userLatitude, userLongitude],
                previousData
              );
            }

            setSelectedMenuItem((prev) =>
              prev && prev.id === menuItemId ? { ...prev, favorite: !nextFavorite } : prev
            );
          },
          onSettled: () => {
            setPendingFavoriteMenuItemId(null);
            queryClient.invalidateQueries({
              queryKey: ['restaurant-details', restaurantId, userLatitude, userLongitude],
            });
          },
        }
      );
    },
    [
      isRestaurantIdValid,
      menuItemFavoriteMutation,
      queryClient,
      restaurantId,
      userLatitude,
      userLongitude,
    ]
  );

  const handleSeeCart = () => {
    navigation.navigate('Cart');
  };

  const hasCartItems = itemCount > 0;

  const renderHighlights = () => {
    if (!restaurant?.highlights?.length) {
      return null;
    }

    return (
      <View className="mt-3 flex-row flex-wrap gap-2">
        {restaurant.highlights.map((highlight, index) => (
          <Animated.View
            key={`${highlight.label}-${highlight.value}`}
            entering={createHighlightChipEntrance(index)}
            className="rounded-full bg-[#FDE7E5] px-3 py-1">
            <Text allowFontScaling={false} className="text-xs font-semibold text-[#CA251B]">
              {highlight.label}: {highlight.value}
            </Text>
          </Animated.View>
        ))}
      </View>
    );
  };

  const renderTopSales = () => {
    if (!restaurant?.topSales?.length) {
      return null;
    }

    return (
      <View className="px-4" onLayout={(event) => handleSectionLayout('top-sales', event)}>
        <AnimatedText
          allowFontScaling={false}
          className="mb-4 text-lg font-semibold text-black/60"
          entering={createSectionHeaderEntrance(0)}>
          {t('restaurantDetails.sections.topSalesWithCount', {
            values: { count: restaurant.topSales.length },
          })}
        </AnimatedText>

        <View className="mb-4 flex-row flex-wrap justify-between gap-y-4">
          {restaurant.topSales.map((item, index) => (
            <View key={item.id} className="shadow-3xl overflow-hidden rounded-3xl">
              <Animated.View entering={createMenuCardEntrance(index)}>
                <MenuItemCard item={item} onOpenModal={handleOpen} />
              </Animated.View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderCategories = () => {
    if (!restaurant?.categories?.length) {
      return null;
    }

    return (
      <View className="px-4">
        {(restaurant.categories ?? []).map((category, index) => {
          const sectionKey = `category-${index}`;

          return (
            <Animated.View
              key={sectionKey}
              className="mb-8"
              onLayout={(event) => handleSectionLayout(sectionKey, event)}
              entering={FadeIn.delay((index + 1) * 90)}>
              <AnimatedText
                allowFontScaling={false}
                className="mb-4 text-lg font-semibold text-[#17213A]"
                entering={createSectionHeaderEntrance(index + 1)}>
                {getLocalizedName(category, locale)}
              </AnimatedText>
              <View className="flex-row flex-wrap justify-between gap-y-4">
                {(category.items ?? []).map((item, itemIndex) => (
                  <View key={item.id} className="shadow-3xl overflow-hidden rounded-3xl">
                    <Animated.View entering={createMenuCardEntrance(itemIndex)}>
                      <MenuItemCard item={item} onOpenModal={handleOpen} />
                    </Animated.View>
                  </View>
                ))}
              </View>
            </Animated.View>
          );
        })}
      </View>
    );
  };

  const mainContent = () => {
    if (!isRestaurantIdValid) {
      return (
        <View className="flex-1 items-center justify-center px-6 py-20">
          <Text
            allowFontScaling={false}
            className="mb-4 text-center text-lg font-semibold text-[#17213A]">
            {t('restaurantDetails.states.noSelection.title')}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="rounded-full bg-[#CA251B] px-6 py-3">
            <Text allowFontScaling={false} className="text-white">
              {t('common.back')}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (isLoading) {
      return <RestaurantDetailsSkeleton />;
    }

    if (isError || !restaurant) {
      return (
        <View className="flex-1 items-center justify-center px-6 py-20">
          <Text
            allowFontScaling={false}
            className="mb-4 text-center text-lg font-semibold text-[#17213A]">
            {t('restaurantDetails.states.error.title')}
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="rounded-full bg-[#CA251B] px-6 py-3">
            <Text allowFontScaling={false} className="text-white">
              {t('common.retry')}
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View>
        <Animated.View
          className="px-4"
          entering={FadeInDown.springify()
            .mass(0.9)
            .stiffness(130)
            .damping(16)
            .withInitialValues({
              opacity: 0,
              transform: [{ translateY: -28 }],
            })}>
          <Animated.View
            className="mt-4 flex-row items-center gap-4"
            entering={FadeInDown.springify()
              .mass(0.9)
              .stiffness(150)
              .damping(18)
              .delay(60)
              .withInitialValues({
                opacity: 0,
                transform: [{ translateY: -20 }],
              })}>
            <Animated.View
              className="rounded-3xl bg-white p-1.5 shadow-lg"
              entering={FadeIn.springify()
                .mass(0.8)
                .stiffness(160)
                .damping(18)
                .delay(80)
                .withInitialValues({ opacity: 0, transform: [{ scale: 0.85 }] })}>
              <RemoteImageWithSkeleton
                imagePath={restaurant.iconUrl ?? restaurant.imageUrl}
                containerStyle={styles.heroIconContainer}
                imageStyle={styles.heroIconImage}
                skeletonStyle={styles.heroIconImage}
              />
            </Animated.View>

            <Animated.View
              className="flex-1"
              entering={FadeInUp.springify()
                .mass(0.8)
                .stiffness(140)
                .damping(18)
                .delay(120)
                .withInitialValues({
                  opacity: 0,
                  transform: [{ translateY: 24 }],
                })}>
              <AnimatedText allowFontScaling={false} className="text-2xl font-bold text-[#17213A]">
                {getLocalizedName(restaurant, locale)}
              </AnimatedText>
              {restaurant.description ? (
                <AnimatedText
                  allowFontScaling={false}
                  className="mt-1 text-sm text-[#17213A]"
                  entering={FadeInUp.springify()
                    .mass(0.8)
                    .stiffness(150)
                    .damping(18)
                    .delay(160)
                    .withInitialValues({
                      opacity: 0,
                      transform: [{ translateY: 16 }],
                    })}>
                  {getLocalizedDescription(restaurant, locale)}
                </AnimatedText>
              ) : null}
            </Animated.View>
          </Animated.View>

          <Animated.View
            className="mt-4 flex flex-row items-center justify-center text-xs text-[#17213A]"
            entering={FadeInUp.springify()
              .mass(0.9)
              .stiffness(140)
              .damping(18)
              .delay(180)
              .withInitialValues({
                opacity: 0,
                transform: [{ translateY: 24 }],
              })}>
            <View className="border-1 mt-2 flex flex-row items-center gap-4 rounded-xl border-black/5 bg-white px-4 py-2 shadow-xl">
              <View className="flex flex-row items-center gap-1 font-sans">
                <Clock7 size={16} color="#CA251B" />
                <Text allowFontScaling={false} className="text-sm text-gray-700">
                  {restaurant.openingHours} - {restaurant.closingHours}
                </Text>
              </View>

              <View className="flex flex-row items-center gap-1 font-sans">
                <Text allowFontScaling={false} className="text-sm text-gray-700">
                  {restaurant.rating || t('restaurantDetails.rating.new')}
                </Text>
                <Star size={16} color="#CA251B" fill="#CA251B" />
              </View>

              <View className="flex flex-row items-center gap-1 font-sans">
                <MapPin size={16} color="#CA251B" />
                <Text allowFontScaling={false} className="text-sm text-gray-700">
                  {restaurant.type}
                </Text>
              </View>

              <View className="flex flex-row items-center gap-1 font-sans">
                <Text allowFontScaling={false} className="text-sm text-gray-700">
                  {formatDeliveryFeeLabel(restaurant.deliveryFee)}
                </Text>
              </View>

              {hasValidEstimatedDeliveryTime(restaurant.estimatedDeliveryTime) && (
                <View className="flex flex-row items-center gap-1 font-sans">
                  <Clock7 size={16} color="#CA251B" />
                  <Text allowFontScaling={false} className="text-sm text-gray-700">
                    {t('restaurantDetails.delivery.estimatedTime', {
                      values: { time: restaurant.estimatedDeliveryTime },
                    })}
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        </Animated.View>

        <Animated.View
          className="mb-4 mt-4 rounded-lg bg-gray-100"
          entering={FadeInUp.springify()
            .mass(0.9)
            .stiffness(140)
            .damping(18)
            .delay(220)
            .withInitialValues({
              opacity: 0,
              transform: [{ translateY: 28 }],
            })}>
          <View className="p-3 px-4">
            <AnimatedText allowFontScaling={false} className="mb-1 font-semibold text-[#17213A]">
              {t('restaurantDetails.sections.infoTitle')}
            </AnimatedText>
            {restaurant.description ? (
              <Text allowFontScaling={false} className="text-sm text-[#17213A]">
                {getLocalizedDescription(restaurant, locale)}
              </Text>
            ) : null}
            <Animated.View
              className="ml-2 mt-2 flex flex-row items-center text-[#17213A]/40"
              entering={FadeInUp.springify()
                .mass(0.9)
                .stiffness(140)
                .damping(18)
                .delay(260)
                .withInitialValues({
                  opacity: 0,
                  transform: [{ translateY: 20 }],
                })}>
              <MapPin size={20} />
              <Text allowFontScaling={false} className="ml-2 text-[#17213A]">
                {restaurant.address}
              </Text>
            </Animated.View>
          </View>
        </Animated.View>

        {hasMenuSections ? (
          <View onLayout={handleMenuContentLayout}>
            {renderTopSales()}
            {renderCategories()}
          </View>
        ) : null}

        <View style={{ height: hasCartItems ? 140 : 60 }} />
      </View>
    );
  };

  const customHeader = (
    <View style={{ width: '100%', height: '100%' }}>
      <RemoteImageWithSkeleton
        imagePath={restaurant?.imageUrl}
        containerStyle={StyleSheet.absoluteFillObject}
        imageStyle={styles.heroImage}
        skeletonStyle={styles.heroImage}
        contentFit="cover"
      />

      <View
        style={{
          paddingTop: insets.top,
          flex: 1,
          paddingHorizontal: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}>
        <TouchableOpacity
          style={{
            borderRadius: 9999,
            backgroundColor: 'white',
            padding: 8,
          }}
          onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#CA251B" />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            borderRadius: 9999,
            backgroundColor: 'white',
            padding: 8,
            opacity: restaurant && !restaurantFavoriteMutation.isPending ? 1 : 0.5,
          }}
          disabled={!restaurant || restaurantFavoriteMutation.isPending}
          onPress={handleToggleRestaurantFavorite}>
          <Heart size={24} color="#CA251B" fill={restaurant?.favorite ? '#CA251B' : 'white'} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const collapsedHeader = (
    <View className="flex-1 flex-row items-center justify-between bg-white px-4">
      <TouchableOpacity className="p-2" onPress={() => navigation.goBack()}>
        <ArrowLeft size={20} color="#CA251B" />
      </TouchableOpacity>

      <View className="flex-1 items-center justify-center px-2">
        <RemoteImageWithSkeleton
          imagePath={restaurant?.iconUrl ?? restaurant?.imageUrl}
          containerStyle={[styles.collapsedIconContainer, { marginBottom: 4 }]}
          imageStyle={styles.collapsedIconImage}
          skeletonStyle={styles.collapsedIconImage}
        />
        <Text allowFontScaling={false} className="text-center text-lg font-bold text-gray-800">
          {getLocalizedName(restaurant as RestaurantDetailsResponse, locale) ??
            t('restaurantDetails.fallbackName')}
        </Text>
      </View>

      <TouchableOpacity
        className="p-2"
        disabled={!restaurant || restaurantFavoriteMutation.isPending}
        onPress={handleToggleRestaurantFavorite}
        style={{ opacity: restaurant && !restaurantFavoriteMutation.isPending ? 1 : 0.5 }}>
        <Heart size={20} color="#CA251B" fill={restaurant?.favorite ? '#CA251B' : 'white'} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1">
      <MainLayout
        showHeader
        showFooter
        headerMaxHeight={vs(120)}
        headerMinHeight={vs(110)}
        customHeader={customHeader}
        collapsedHeader={collapsedHeader}
        mainContent={mainContent()}
        showOnGoingOrder={false}
        onScrollOffsetChange={handleMenuScroll}
        scrollRef={scrollViewRef}
      />

      {showMenuTabs && hasMenuSections && !isModalVisible ? (
        <View
          pointerEvents="box-none"
          style={{
            position: 'absolute',
            top: insets.top + CATEGORY_TAB_OVERLAY_TOP,
            left: 0,
            right: 0,
            zIndex: 40,
          }}>
          <View
            style={{
              marginHorizontal: 16,
              borderRadius: 9999,
              backgroundColor: '#FFFFFF',
              paddingVertical: 8,
              paddingHorizontal: 12,
              shadowColor: '#000',
              shadowOpacity: 0.08,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 4 },
              elevation: 6,
            }}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 4 }}
              keyboardShouldPersistTaps="handled">
              {menuSections.map((section) => {
                const isActive = activeMenuSection === section.key;

                return (
                  <TouchableOpacity
                    key={section.key}
                    activeOpacity={0.85}
                    onPress={() => handleTabPress(section.key)}
                    style={{
                      marginHorizontal: 4,
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 9999,
                    }}>
                    <Text
                      allowFontScaling={false}
                      style={{
                        fontWeight: '600',
                        color: isActive ? '#CA251B' : '#6B7280',
                        fontSize: 14,
                      }}>
                      {section.label}
                    </Text>
                    <View
                      style={{
                        marginTop: 6,
                        height: 3,
                        borderRadius: 9999,
                        backgroundColor: isActive ? '#CA251B' : 'transparent',
                      }}
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      ) : null}

      {hasCartItems && !isModalVisible && (
        <FixedOrderBar
          onSeeCart={handleSeeCart}
          style={{ bottom: moderateScale(72) + insets.bottom }}
        />
      )}

      {isModalVisible && selectedMenuItem && (
        <>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => handleUpdateCartAndClose([])}
            className="absolute inset-0 bg-black/50"
          />
          <Animated.View
            className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-t-3xl bg-white"
            style={[{ height: modalHeight }, animatedStyle]}>
            <MenuDetail
              menuItem={selectedMenuItem}
              handleAddItem={handleUpdateCartAndClose}
              onClose={() => handleUpdateCartAndClose([])}
              initialDraftSelections={initialDraftSelections ?? undefined}
              actionLabel={
                editingCartItemId ? t('menuDetail.actions.update') : t('menuDetail.actions.add')
              }
              onToggleFavorite={(nextFavorite) =>
                handleToggleMenuItemFavorite(selectedMenuItem.id, nextFavorite)
              }
              isFavoriteLoading={
                menuItemFavoriteMutation.isPending &&
                pendingFavoriteMenuItemId === selectedMenuItem.id
              }
            />
          </Animated.View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  heroIconContainer: {
    width: moderateScale(64),
    height: moderateScale(64),
    borderRadius: moderateScale(20),
  },
  heroIconImage: {
    borderRadius: moderateScale(20),
  },
  collapsedIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  collapsedIconImage: {
    borderRadius: 16,
  },
  menuImageContainer: {
    width: '100%',
    height: 110,
    borderRadius: 16,
  },
  menuImage: {
    borderRadius: 16,
  },
  heroImage: {
    borderRadius: 0,
  },
});
