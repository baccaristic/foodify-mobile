import React from 'react';
import { Trash2, Minus, Plus } from 'lucide-react-native';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import MainLayout from '~/layouts/MainLayout';
import { Image } from 'expo-image';
import FixedOrderBar from '~/components/FixedOrderBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { vs } from 'react-native-size-matters';
import Header from '~/components/Header';

import { BASE_API_URL } from '@env';
import { useCart } from '~/context/CartContext';
import type { CartItem } from '~/context/CartContext';

const primaryColor = '#CA251B';
const FALLBACK_IMAGE = require('../../assets/baguette.png');
const EMPTY_CART_IMAGE = require('../../assets/empty-cart.png');

const formatCurrency = (value: number) => `${value.toFixed(3).replace('.', ',')} DT`;

const resolveImageSource = (imagePath?: string | null) => {
  if (imagePath) {
    return { uri: `${BASE_API_URL}/auth/image/${imagePath}` };
  }
  return FALLBACK_IMAGE;
};

const CartItemRow: React.FC<{
  item: CartItem;
  onUpdateQuantity: (itemId: string, newQuantity: number) => void;
  onRemove: (itemId: string) => void;
  onModify: (item: CartItem) => void;
}> = ({ item, onUpdateQuantity, onRemove, onModify }) => {
  const isMinQuantity = item.quantity <= 1;

  const handleMinus = () => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1));
  const handlePlus = () => onUpdateQuantity(item.id, item.quantity + 1);

  return (
    <View className="mb-4 flex-row items-center rounded-3xl border border-gray-200 bg-white">
      <View className="relative mr-3 h-20 w-1/4 overflow-hidden rounded-3xl">
        <Image source={resolveImageSource(item.imageUrl)} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        <TouchableOpacity
          className="absolute left-1 top-1 items-center justify-center rounded-full bg-white p-1 shadow-sm"
          onPress={() => onRemove(item.id)}>
          <Trash2 size={12} color={primaryColor} />
        </TouchableOpacity>
      </View>

      <View className="flex-1 justify-center">
        <Text allowFontScaling={false} className="pr-6 text-sm font-bold text-[#17213A]" numberOfLines={1}>
          {item.name}
        </Text>
        <TouchableOpacity onPress={() => onModify(item)} className="mt-1 self-start rounded-full bg-[#FDE7E5] px-3 py-1">
          <Text allowFontScaling={false} className="text-xs font-semibold uppercase text-[#CA251B]">
            Modify
          </Text>
        </TouchableOpacity>
        {item.description ? (
          <Text allowFontScaling={false} className="text-xs text-gray-500" numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        {item.extras.length > 0 ? (
          <View className="mt-1 flex-col gap-1">
            {item.extras.map((group) => (
              <Text key={`${item.id}-${group.groupId}`} allowFontScaling={false} className="text-xs text-gray-500">
                {group.groupName}: {group.extras.map((extra) => extra.name).join(', ')}
              </Text>
            ))}
          </View>
        ) : null}

        <Text allowFontScaling={false} className="mt-1 text-sm font-bold text-[#CA251B]">
          {formatCurrency(item.totalPrice)}
        </Text>
        {item.quantity > 1 ? (
          <Text allowFontScaling={false} className="text-xs text-gray-500">
            {formatCurrency(item.pricePerItem)} each
          </Text>
        ) : null}
      </View>

      <View className="ml-2 flex-col items-center">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={handleMinus}
            className={`rounded-full border p-1 ${isMinQuantity ? 'border-gray-300 bg-[#CA251B]/20' : 'border-[#CA251B] bg-[#CA251B]'}`}
            disabled={isMinQuantity}>
            <Minus size={16} color={isMinQuantity ? primaryColor : 'white'} />
          </TouchableOpacity>

          <Text allowFontScaling={false} className="mx-3 w-4 text-center text-lg font-semibold text-[#CA251B]">
            {item.quantity}
          </Text>

          <TouchableOpacity onPress={handlePlus} className="rounded-full border border-[#CA251B] bg-[#CA251B] p-1">
            <Plus size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function Cart() {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { items, restaurant, subtotal, itemCount, updateItemQuantity, removeItem, clearCart } = useCart();
  const insets = useSafeAreaInsets();

  const hasItems = items.length > 0;
  const restaurantName = restaurant?.name ?? 'Restaurant';
  const totalItems = itemCount;
  const totalOrderPrice = subtotal;

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    updateItemQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId);
  };

  const handleModifyItem = (item: CartItem) => {
    if (!restaurant?.id) {
      return;
    }

    navigation.navigate('RestaurantDetails', {
      restaurantId: restaurant.id,
      cartItemId: item.id,
    });
  };

  const handleClearCart = () => {
    clearCart();
  };

  const handleAddMoreItems = () => {
    if (restaurant?.id) {
      navigation.navigate('RestaurantDetails', { restaurantId: restaurant.id });
      return;
    }
    navigation.navigate('Home');
  };

  const cartContent = (
    <View className="px-4">
      <Text allowFontScaling={false} className="mb-4 mt-6 text-center text-2xl font-bold text-[#17213A]">
        My cart
      </Text>

      <View className="mb-4 flex-row items-center justify-between">
        <Text allowFontScaling={false} className="text-sm font-semibold text-[#CA251B]">
          {totalItems} {totalItems === 1 ? 'Product' : 'Products'} from{' '}
          <Text allowFontScaling={false} className="text-xl font-bold text-[#CA251B]">
            {restaurantName}
          </Text>
        </Text>
        <TouchableOpacity onPress={handleClearCart} disabled={!hasItems}>
          <View
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: '#FFF',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 2,
              opacity: hasItems ? 1 : 0.4,
            }}>
            <Trash2 size={30} color="#CA251B" strokeWidth={2} />
          </View>
        </TouchableOpacity>
      </View>

      {hasItems ? (
        items.map((item) => (
          <CartItemRow
            key={item.id}
            item={item}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemoveItem}
            onModify={handleModifyItem}
          />
        ))
      ) : (
        <View className="mt-10 items-center px-6">
          <Image source={EMPTY_CART_IMAGE} style={{ width: 160, height: 160 }} contentFit="contain" />
          <Text allowFontScaling={false} className="mt-6 text-center text-lg font-bold text-[#17213A]">
            Add items to start a basket
          </Text>
          <Text allowFontScaling={false} className="mt-2 text-center text-sm text-gray-500">
            Once you add items from a restaurant or store, your basket will appear here.
          </Text>
          <TouchableOpacity
            className="mt-6 w-full max-w-xs rounded-2xl bg-[#CA251B] py-3"
            onPress={handleAddMoreItems}>
            <Text allowFontScaling={false} className="text-center text-base font-semibold text-white">
              Add items
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {hasItems ? (
        <TouchableOpacity className="mx-auto my-4 rounded-xl bg-[#CA251B] px-4 py-2" onPress={handleAddMoreItems}>
          <Text allowFontScaling={false} className="text-center text-lg text-white">
            Add more items
          </Text>
        </TouchableOpacity>
      ) : null}

      <View style={{ height: 160 }} />
    </View>
  );

  const cartHeader = (
    <Header
      title="San Francisco Bay Area"
      compact
      onBack={() => navigation.goBack()}
      onLocationPress={() => console.log('Location pressed')}
    />
  );

  return (
    <View className="flex-1 bg-white">
      <MainLayout
        enableHeaderCollapse={false}
        headerBackgroundImage={require('../../assets/pattern1.png')}
        showHeader
        showFooter
        headerMaxHeight={vs(110)}
        headerMinHeight={vs(110)}
        enforceResponsiveHeaderSize={false}
        customHeader={cartHeader}
        mainContent={cartContent}
      />
      <FixedOrderBar
        total={totalOrderPrice}
        itemCount={totalItems}
        onSeeCart={() => navigation.navigate('CheckoutOrder')}
        buttonLabel="Checkout"
        style={{ bottom: 60 + insets.bottom }}
        disabled={!hasItems}
      />
    </View>
  );
}
