import { Clock7, Plus, Star, MapPin, Heart, ArrowLeft } from 'lucide-react-native';
import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import MainLayout from '~/layouts/MainLayout';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { Image } from 'expo-image';
import MenuDetail from './MenuDetail';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import FixedOrderBar from '~/components/FixedOrderBar';

const { width, height: screenHeight } = Dimensions.get('screen');
const modalHeight = screenHeight;

interface CartItemDetails {
  quantity: number;
  total: number;
}

interface MenuItem {
  name: string;
  description: string;
  price: string;
}

const MenuItemCard: React.FC<{ item: MenuItem; onOpenModal: () => void }> = ({
  item,
  onOpenModal,
}) => (
  <View
    style={{ width: width / 2 - 24 }}
    className="flex flex-col overflow-hidden rounded-xl bg-white shadow-md">
    <Image
      source={require('../../assets/baguette.png')}
      style={{ width: '100%', height: 100 }}
      contentFit="cover"
    />

    <View className="flex flex-col gap-1 p-3">
      <Text allowFontScaling={false} className="text-sm font-bold text-[#17213A]" numberOfLines={1}>
        {item.name}
      </Text>
      <Text allowFontScaling={false} className="text-xs text-gray-500" numberOfLines={2}>
        {item.description}
      </Text>

      <View className="mt-2 flex-row items-center justify-between">
        <Text allowFontScaling={false} className="font-bold text-[#CA251B]">
          {item.price}
        </Text>

        <TouchableOpacity
          className="rounded-full bg-[#CA251B] p-1.5 text-white shadow-md"
          onPress={onOpenModal}>
          <Plus size={18} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  </View>
);

const STATIC_MENU_ITEMS: MenuItem[] = [
  {
    name: 'Pizza 1/4 Plateau Thon Fromage',
    description: 'Sauce tomate, thon, fromage, persil - Portion 2 Personnes',
    price: '19,300 DT',
  },
  {
    name: 'Sandwich Tunisien Complet',
    description: 'Merguez, œuf, salade méchouia, harissa, frites',
    price: '8,500 DT',
  },
  {
    name: 'Lablebi Classique',
    description: "Pois chiches, cumin, huile d'olive, œufs pochés",
    price: '5,000 DT',
  },
  {
    name: "Jus d'Orange Frais",
    description: "Jus d'orange 100% naturel pressé à la minute",
    price: '4,000 DT',
  },
  {
    name: 'Salade César',
    description: 'Laitue, croûtons, parmesan, poulet grillé, sauce César',
    price: '12,000 DT',
  },
  {
    name: 'Tiramisu',
    description: 'Dessert italien classique au café et mascarpone',
    price: '7,500 DT',
  },
];
const TABS = ['Top Sales', 'Pizza Tranches', 'Pizza', 'Sandwich'];

export default function RestaurantDetails() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [cartVisible, setCartVisible] = useState(false);
  const [cartTotal, setCartTotal] = useState({ price: '0,000 DT', count: 0 });
  const [barHeight, setBarHeight] = useState(0);

  const insets = useSafeAreaInsets();

  const translateY = useSharedValue(modalHeight);
  const navigation = useNavigation<NavigationProp<ParamListBase>>();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    if (isModalVisible) {
      translateY.value = withTiming(0, { duration: 300 });
    }
  }, [isModalVisible, translateY]);

  const handleOpen = useCallback(() => {
    setIsModalVisible(true);
  }, []);

  const handleUpdateCartAndClose = useCallback(
    (itemDetails: CartItemDetails) => {
      if (itemDetails.quantity > 0) {
        // Convert price string to number for calculation
        const currentTotalNum = parseFloat(cartTotal.price.replace(',', '.')) || 0;
        const newTotalNum = currentTotalNum + itemDetails.total;
        const newCount = cartTotal.count + itemDetails.quantity;

        setCartTotal({
          price: newTotalNum.toFixed(3).replace('.', ','),
          count: newCount,
        });
        setCartVisible(true);
      }
      setIsModalVisible(false);
    },
    [cartTotal, translateY]
  );

  const handleSeeCart = () => {
    navigation.navigate('Cart');
  };

  const modalContent = <MenuDetail handleAddItem={handleUpdateCartAndClose} />;

  const mainContent = (
    <View>
      <View className="px-4 ">
        <Text allowFontScaling={false} className="ml-2 mt-4 text-2xl font-bold text-[#17213A]">
          Di Napoli
        </Text>
        <Text allowFontScaling={false} className="ml-2 mt-4 text-sm text-[#17213A]">
          Pizzas en tranches, Plats exquis, sandwich!!
        </Text>

        <View className="mt-2 flex flex-row items-center justify-center text-xs text-[#17213A]">
          <View className="border-1 mt-2 flex flex-row items-center gap-4 rounded-xl border-black/5 bg-white px-4 py-2 shadow-xl">
            <View className="flex flex-row items-center gap-1 font-sans">
              <Clock7 size={16} color="#CA251B" />
              <Text allowFontScaling={false} className="text-sm text-gray-700">
                25 - 30 mins
              </Text>
            </View>

            <View className="flex flex-row items-center gap-1 font-sans">
              <Text allowFontScaling={false} className="text-sm text-gray-700">
                4.9
              </Text>
              <Star size={16} color="#CA251B" fill="#CA251B" />
            </View>

            <View className="flex flex-row items-center gap-1 font-sans">
              <MapPin size={16} color="#CA251B" />
              <Text allowFontScaling={false} className="text-sm text-gray-700">
                1,5 DT
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
          <Text allowFontScaling={false} className="text-sm text-[#17213A]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </Text>
          <View className="ml-2 mt-2 flex flex-row items-center text-[#17213A]/40">
            <MapPin size={20} />
            <Text allowFontScaling={false} className="ml-2 text-[#17213A]">
              Rue Mustapha Abdessalem, Ariana 2091
            </Text>
          </View>
        </View>
      </View>

      <View className="px-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="scrollbar-hide flex gap-2 overflow-x-auto p-4 py-2">
          {TABS.map((cat, idx) => (
            <TouchableOpacity
              key={idx}
              className={`mr-2 rounded-xl border border-[#CA251B] px-4 py-2 ${idx === 0 ? 'bg-[#CA251B]' : 'bg-white'}`}>
              <Text
                allowFontScaling={false}
                className={`font-['roboto'] text-sm font-semibold ${idx === 0 ? 'text-white' : 'text-[#CA251B]'}`}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text allowFontScaling={false} className="mb-4 text-lg font-semibold text-black/60">
          Top Sales ({STATIC_MENU_ITEMS.length})
        </Text>

        <View className="mb-4 flex-row flex-wrap justify-between gap-y-4">
          {STATIC_MENU_ITEMS.map((item, idx) => (
            <View key={idx} className="shadow-3xl overflow-hidden rounded-3xl ">
              <MenuItemCard item={item} onOpenModal={handleOpen} />
            </View>
          ))}
        </View>

        <View style={{ height: barHeight }} />
      </View>
    </View>
  );

  const customHeader = (
    <View style={{ width: '100%', height: 160 }}>
      {/* Background image */}
      <Image
        source={require('../../assets/TEST.png')}
        style={StyleSheet.absoluteFillObject} // fills parent
        contentFit="cover"
      />

      {/* Foreground row */}
      <View
        style={{
          paddingTop: 0 + insets.top,
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
        Di Napoli
      </Text>
      <TouchableOpacity className="p-2">
        <Heart size={20} color="#CA251B" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1">
      <MainLayout
        showHeader={true}
        showFooter={true}
        customHeader={customHeader}
        collapsedHeader={collapsedHeader}
        mainContent={mainContent}
      />

      {cartVisible && cartTotal.count > 0 && !isModalVisible && (
        <FixedOrderBar
          total={cartTotal.price}
          onSeeCart={handleSeeCart}
          style={{ bottom: 60 + insets.bottom }}
        />
      )}

      {isModalVisible && (
        <>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => handleUpdateCartAndClose({ quantity: 0, total: 0 })}
            className="absolute inset-0 bg-black/50"
          />
          <Animated.View
            className="absolute bottom-0 left-0 right-0 overflow-hidden rounded-t-3xl bg-white"
            style={[{ height: modalHeight }, animatedStyle]}>
            {modalContent}
          </Animated.View>
        </>
      )}
    </View>
  );
}
