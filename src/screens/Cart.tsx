import React, { useState } from 'react';
import { Trash2, Minus, Plus, ChevronDown, ArrowLeft } from 'lucide-react-native';
import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import MainLayout from '~/layouts/MainLayout';
import { Image } from 'expo-image';
import FixedOrderBar from '~/components/FixedOrderBar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { vs } from 'react-native-size-matters';
import Header from '~/components/Header';

const { width } = Dimensions.get('window');
const primaryColor = '#CA251B';

interface CartItem {
  id: number;
  name: string;
  description: string;
  price: string;
  quantity: number;
  imageSource: any;
}

const INITIAL_CART_ITEMS: CartItem[] = [
  {
    id: 1,
    name: 'Pizza Pepperoni',
    description: 'Sauce tomate, thon, fromage, persil - Portion 2 Personnes',
    price: '19,300 DT',
    quantity: 1,
    imageSource: require('../../assets/baguette.png'),
  },
  {
    id: 2,
    name: 'Pizza Pepperoni',
    description: 'Sauce tomate, thon, fromage, persil - Portion 2 Personnes',
    price: '19,300 DT',
    quantity: 2,
    imageSource: require('../../assets/TEST.png'),
  },
  {
    id: 3,
    name: 'Sandwich',
    description: 'Sauce tomate, thon, fromage, persil - Portion 2 Personnes',
    price: '19,300 DT',
    quantity: 3,
    imageSource: require('../../assets/baguette.png'),
  },
];

const CartItemRow: React.FC<{
  item: CartItem;
  onUpdateQuantity: (itemId: number, newQuantity: number) => void;
}> = ({ item, onUpdateQuantity }) => {
  const isMinQuantity = item.quantity <= 1;

  const handleMinus = () => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1));
  const handlePlus = () => onUpdateQuantity(item.id, item.quantity + 1);

  return (
    <View className="mb-4 flex-row items-center rounded-3xl border border-gray-200 bg-white">
      <View className="relative mr-3 h-20 w-1/4 overflow-hidden rounded-3xl">
        <Image
          source={item.imageSource}
          style={{ width: '100%', height: '100%' }}
          contentFit="cover"
        />
        <TouchableOpacity className="absolute left-1 top-1 items-center justify-center rounded-full bg-white p-1 shadow-sm">
          <Trash2 size={12} color={primaryColor} />
        </TouchableOpacity>
      </View>

      <View className="flex-1 justify-center">
        <Text
          allowFontScaling={false}
          className="pr-6 text-sm font-bold text-[#17213A]"
          numberOfLines={1}>
          {item.name}
        </Text>
        <Text allowFontScaling={false} className="text-xs text-gray-500" numberOfLines={2}>
          {item.description}
        </Text>
        <Text allowFontScaling={false} className="mt-1 text-sm font-bold text-[#CA251B]">
          {item.price}
        </Text>
      </View>

      <View className="ml-2 flex-col items-center">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={handleMinus}
            className={`rounded-full border p-1 ${isMinQuantity ? 'border-gray-300 bg-[#CA251B]/20' : 'border-[#CA251B] bg-[#CA251B]'}`}
            disabled={isMinQuantity}>
            <Minus size={16} color="white" />
          </TouchableOpacity>

          <Text
            allowFontScaling={false}
            className="mx-3 w-4 text-center text-lg font-semibold text-[#CA251B]">
            {item.quantity}
          </Text>

          <TouchableOpacity
            onPress={handlePlus}
            className="rounded-full border border-[#CA251B] bg-[#CA251B] p-1">
            <Plus size={16} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function Cart() {
  const [cartItems, setCartItems] = useState(INITIAL_CART_ITEMS);
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const restaurantName = 'Di Napoli';
  const totalItems = cartItems.length;
  const totalOrderPrice = '19,300 DT';
  const insets = useSafeAreaInsets();

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item))
    );
  };

  const cartContent = (
    <View className="px-4">
      <Text
        allowFontScaling={false}
        className="mb-4 mt-6 text-center text-2xl font-bold text-[#17213A]">
        My cart
      </Text>

      <View className="mb-4 flex-row items-center justify-between">
        <Text allowFontScaling={false} className="text-sm font-semibold text-[#CA251B]">
          {totalItems} Product from{' '}
          <Text allowFontScaling={false} className="text-xl font-bold text-[#CA251B]">
            {restaurantName}
          </Text>
        </Text>
        <TouchableOpacity>
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
            }}>
            <Trash2 size={30} color="#CA251B" strokeWidth={2} />
          </View>
        </TouchableOpacity>
      </View>

      {cartItems.map((item) => (
        <CartItemRow key={item.id} item={item} onUpdateQuantity={handleUpdateQuantity} />
      ))}

      <TouchableOpacity className="mx-auto my-4 rounded-xl bg-[#CA251B] px-2 py-2">
        <Text allowFontScaling={false} className="text-center text-lg text-white">
          Add more items
        </Text>
      </TouchableOpacity>

      <View style={{ height: 160 }} />
    </View>
  );

  const cartHeader = (
    <Header
    title="San Francisco Bay Area"
    compact={false}
    onBack={() => navigation.goBack()}
    onLocationPress={() => console.log("Location pressed")}
  />
  );

  

  return (
    <View className="flex-1 bg-white">
      <MainLayout
      enableHeaderCollapse={false}
        headerBackgroundImage={require('../../assets/pattern1.png')}
        showHeader={true}
        showFooter={true}
        headerMaxHeight={vs(10)}
        headerMinHeight={vs(10)}
        customHeader={cartHeader}
        mainContent={cartContent}
      />
      <FixedOrderBar
        total={totalOrderPrice}
        onSeeCart={() => null}
        style={{ bottom: 60 + insets.bottom }}
      />
    </View>
  );
}
