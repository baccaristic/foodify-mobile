import { ArrowLeft, Clock7, Heart, MapPin, Plus, Star } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { NavigationProp, ParamListBase, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';

import MainLayout from '~/layouts/MainLayout';
import FixedOrderBar from '~/components/FixedOrderBar';
import MenuDetail from './MenuDetail';
import { getRestaurantDetails } from '~/api/restaurants';
import type {
  RestaurantDetailsResponse,
  RestaurantMenuCategory,
  RestaurantMenuItemDetails,
  RestaurantMenuItemSummary,
} from '~/interfaces/Restaurant';
import { BASE_API_URL } from '@env';
import { useCart } from '~/context/CartContext';
import type { CartItemOptionSelection } from '~/context/CartContext';

const { width, height: screenHeight } = Dimensions.get('screen');
const modalHeight = screenHeight;

interface RestaurantDetailsRouteParams {
  RestaurantDetails: {
    restaurantId: number;
  };
}

type RestaurantDetailsRouteProp = RouteProp<RestaurantDetailsRouteParams, 'RestaurantDetails'>;

type MenuCardItem = RestaurantMenuItemDetails | RestaurantMenuItemSummary;

const FALLBACK_IMAGE = require('../../assets/baguette.png');

const formatCurrency = (value: number) => `${value.toFixed(3).replace('.', ',')} DT`;

const resolveImageSource = (imagePath?: string | null) => {
  if (imagePath) {
    return { uri: `${BASE_API_URL}/auth/image/${imagePath}` };
  }
  return FALLBACK_IMAGE;
};

const MenuItemCard: React.FC<{ item: MenuCardItem; onOpenModal: (itemId: number) => void }> = ({ item, onOpenModal }) => (
  <View style={{ width: width / 2 - 24 }} className="flex flex-col overflow-hidden rounded-xl bg-white shadow-md">
    <Image source={resolveImageSource(item.imageUrl)} style={{ width: '100%', height: 110 }} contentFit="cover" />

    <View className="flex flex-col gap-1 p-3">
      <Text allowFontScaling={false} className="text-sm font-bold text-[#17213A]" numberOfLines={1}>
        {item.name}
      </Text>
      <Text allowFontScaling={false} className="text-xs text-gray-500" numberOfLines={2}>
        {item.description}
      </Text>

      <View className="mt-2 flex-row items-center justify-between">
        <Text allowFontScaling={false} className="font-bold text-[#CA251B]">
          {formatCurrency(item.price)}
        </Text>

        <TouchableOpacity className="rounded-full bg-[#CA251B] p-1.5 text-white shadow-md" onPress={() => onOpenModal(item.id)}>
          <Plus size={18} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const flattenCategories = (categories: RestaurantMenuCategory[]) =>
  categories.reduce<RestaurantMenuItemDetails[]>((acc, category) => acc.concat(category.items), []);

const mapSummaryToDetails = (summary: RestaurantMenuItemSummary): RestaurantMenuItemDetails => ({
  ...summary,
  optionGroups: [],
});

export default function RestaurantDetails() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState<RestaurantMenuItemDetails | null>(null);

  const insets = useSafeAreaInsets();
  const { addItem, itemCount } = useCart();

  const translateY = useSharedValue(modalHeight);
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const route = useRoute<RestaurantDetailsRouteProp>();
  const restaurantId = route.params?.restaurantId;
  const isRestaurantIdValid = typeof restaurantId === 'number' && !Number.isNaN(restaurantId);

  const {
    data: restaurant,
    isLoading,
    isError,
    refetch,
  } = useQuery<RestaurantDetailsResponse>({
    queryKey: ['restaurant-details', restaurantId],
    queryFn: () => getRestaurantDetails(restaurantId as number),
    enabled: isRestaurantIdValid,
  });

  const allMenuItems = useMemo(() => (restaurant ? flattenCategories(restaurant.categories) : []), [restaurant]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    if (isModalVisible) {
      translateY.value = withTiming(0, { duration: 300 });
    }
  }, [isModalVisible, translateY]);

  const handleOpenMenuItem = useCallback(
    (itemId: number) => {
      if (!restaurant) {
        return;
      }

      const detailedItem = allMenuItems.find((item) => item.id === itemId);
      if (detailedItem) {
        setSelectedMenuItem(detailedItem);
        setIsModalVisible(true);
        return;
      }

      const topSaleMatch = restaurant.topSales.find((item) => item.id === itemId);
      if (topSaleMatch) {
        setSelectedMenuItem(mapSummaryToDetails(topSaleMatch));
        setIsModalVisible(true);
      }
    },
    [allMenuItems, restaurant]
  );

  const handleOpen = useCallback(
    (itemId: number) => {
      handleOpenMenuItem(itemId);
    },
    [handleOpenMenuItem]
  );

  const handleUpdateCartAndClose = useCallback(
    (items: { quantity: number; extras: CartItemOptionSelection[] }[]) => {
      if (!selectedMenuItem || !restaurant || items.length === 0) {
        setIsModalVisible(false);
        setSelectedMenuItem(null);
        return;
      }

      items.forEach((itemDetails) => {
        if (itemDetails.quantity <= 0) {
          return;
        }

        addItem({
          restaurant: { id: restaurant.id, name: restaurant.name },
          menuItem: {
            id: selectedMenuItem.id,
            name: selectedMenuItem.name,
            description: selectedMenuItem.description,
            imageUrl: selectedMenuItem.imageUrl,
            price: selectedMenuItem.price,
          },
          quantity: itemDetails.quantity,
          extras: itemDetails.extras,
        });
      });

      setIsModalVisible(false);
      setSelectedMenuItem(null);
    },
    [addItem, restaurant, selectedMenuItem]
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
        {restaurant.highlights.map((highlight) => (
          <View key={`${highlight.label}-${highlight.value}`} className="rounded-full bg-[#FDE7E5] px-3 py-1">
            <Text allowFontScaling={false} className="text-xs font-semibold text-[#CA251B]">
              {highlight.label}: {highlight.value}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderQuickFilters = () => {
    if (!restaurant?.quickFilters?.length) {
      return null;
    }

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="scrollbar-hide flex gap-2 overflow-x-auto p-4 py-2">
        {restaurant.quickFilters.map((filter, idx) => (
          <View
            key={`${filter}-${idx}`}
            className={`mr-2 rounded-xl border border-[#CA251B] px-4 py-2 ${idx === 0 ? 'bg-[#CA251B]' : 'bg-white'}`}>
            <Text
              allowFontScaling={false}
              className={`font-['roboto'] text-sm font-semibold ${idx === 0 ? 'text-white' : 'text-[#CA251B]'}`}>
              {filter}
            </Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  const renderTopSales = () => {
    if (!restaurant?.topSales?.length) {
      return null;
    }

    return (
      <View className="px-4">
        <Text allowFontScaling={false} className="mb-4 text-lg font-semibold text-black/60">
          Top Sales ({restaurant.topSales.length})
        </Text>

        <View className="mb-4 flex-row flex-wrap justify-between gap-y-4">
          {restaurant.topSales.map((item) => (
            <View key={item.id} className="overflow-hidden rounded-3xl shadow-3xl">
              <MenuItemCard item={item} onOpenModal={handleOpen} />
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
        {restaurant.categories.map((category) => (
          <View key={category.name} className="mb-8">
            <Text allowFontScaling={false} className="mb-4 text-lg font-semibold text-[#17213A]">
              {category.name}
            </Text>
            <View className="flex-row flex-wrap justify-between gap-y-4">
              {category.items.map((item) => (
                <View key={item.id} className="overflow-hidden rounded-3xl shadow-3xl">
                  <MenuItemCard item={item} onOpenModal={handleOpen} />
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    );
  };

  const mainContent = () => {
    if (!isRestaurantIdValid) {
      return (
        <View className="flex-1 items-center justify-center px-6 py-20">
          <Text allowFontScaling={false} className="mb-4 text-center text-lg font-semibold text-[#17213A]">
            No restaurant selected.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="rounded-full bg-[#CA251B] px-6 py-3">
            <Text allowFontScaling={false} className="text-white">
              Go back
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (isLoading) {
      return (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color="#CA251B" />
        </View>
      );
    }

    if (isError || !restaurant) {
      return (
        <View className="flex-1 items-center justify-center px-6 py-20">
          <Text allowFontScaling={false} className="mb-4 text-center text-lg font-semibold text-[#17213A]">
            We could not load this restaurant.
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            className="rounded-full bg-[#CA251B] px-6 py-3">
            <Text allowFontScaling={false} className="text-white">
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View>
        <View className="px-4">
          <Text allowFontScaling={false} className="ml-2 mt-4 text-2xl font-bold text-[#17213A]">
            {restaurant.name}
          </Text>
          {restaurant.description ? (
            <Text allowFontScaling={false} className="ml-2 mt-2 text-sm text-[#17213A]">
              {restaurant.description}
            </Text>
          ) : null}

          <View className="mt-3 flex flex-row items-center justify-center text-xs text-[#17213A]">
            <View className="border-1 mt-2 flex flex-row items-center gap-4 rounded-xl border-black/5 bg-white px-4 py-2 shadow-xl">
              <View className="flex flex-row items-center gap-1 font-sans">
                <Clock7 size={16} color="#CA251B" />
                <Text allowFontScaling={false} className="text-sm text-gray-700">
                  {restaurant.openingHours} - {restaurant.closingHours}
                </Text>
              </View>

              <View className="flex flex-row items-center gap-1 font-sans">
                <Text allowFontScaling={false} className="text-sm text-gray-700">
                  {restaurant.rating || 'New'}
                </Text>
                <Star size={16} color="#CA251B" fill="#CA251B" />
              </View>

              <View className="flex flex-row items-center gap-1 font-sans">
                <MapPin size={16} color="#CA251B" />
                <Text allowFontScaling={false} className="text-sm text-gray-700">
                  {restaurant.type}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View className="mb-4 mt-4 rounded-lg bg-gray-100">
          <View className="p-3 px-4">
            <Text allowFontScaling={false} className="mb-1 font-semibold text-[#17213A]">
              Restaurant Info
            </Text>
            {restaurant.description ? (
              <Text allowFontScaling={false} className="text-sm text-[#17213A]">
                {restaurant.description}
              </Text>
            ) : null}
            {renderHighlights()}
            <View className="ml-2 mt-2 flex flex-row items-center text-[#17213A]/40">
              <MapPin size={20} />
              <Text allowFontScaling={false} className="ml-2 text-[#17213A]">
                {restaurant.address}
              </Text>
            </View>
          </View>
        </View>

        {renderQuickFilters()}
        {renderTopSales()}
        {renderCategories()}

        <View style={{ height: hasCartItems ? 140 : 60 }} />
      </View>
    );
  };

  const customHeader = (
    <View style={{ width: '100%', height: '100%' }}>
      <Image source={resolveImageSource(restaurant?.imageUrl)} style={StyleSheet.absoluteFillObject} contentFit="cover" />

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
          }}>
          <Heart size={24} color="#CA251B" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const collapsedHeader = (
    <View className="flex-1 flex-row items-center justify-center bg-white px-4">
      <TouchableOpacity className="p-2" onPress={() => navigation.goBack()}>
        <ArrowLeft size={20} color="#CA251B" />
      </TouchableOpacity>
      <Text allowFontScaling={false} className="flex-1 text-center text-lg font-bold text-gray-800">
        {restaurant?.name ?? 'Restaurant'}
      </Text>
      <TouchableOpacity className="p-2">
        <Heart size={20} color="#CA251B" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1">
      <MainLayout
        showHeader
        showFooter
        customHeader={customHeader}
        collapsedHeader={collapsedHeader}
        mainContent={mainContent()}
      />

      {hasCartItems && !isModalVisible && (
        <FixedOrderBar onSeeCart={handleSeeCart} style={{ bottom: 60 + insets.bottom }} />
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
            />
          </Animated.View>
        </>
      )}
    </View>
  );
}
