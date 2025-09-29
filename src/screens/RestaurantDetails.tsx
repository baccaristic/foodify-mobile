import { Clock7, Plus, Star, MapPin, Heart, ArrowLeft } from "lucide-react-native";
import { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, StyleSheet } from 'react-native';
import MainLayout from '~/layouts/MainLayout';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';
import { Image } from 'expo-image';
import MenuDetail from './MenuDetail';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height: screenHeight } = Dimensions.get('screen');
const modalHeight = screenHeight;

interface FixedOrderBarProps {
    total: string;
    onSeeCart: () => void;
}

interface CartItemDetails {
    quantity: number;
    total: number;
}

interface MenuItem {
    name: string;
    description: string;
    price: string;
}



const FixedOrderBar: React.FC<FixedOrderBarProps> = ({ total,onSeeCart }) => (
    <View className="absolute  mb-4 bottom-16 left-0 right-0 bg-white px-4 py-3 flex-row justify-between shadow-lg  overflow-hidden items-center z-50">
        <Text allowFontScaling={false} className="text-[#CA251B] text-base font-bold">Order : {total}</Text>
        <TouchableOpacity 
            onPress={onSeeCart}
            className="bg-[#CA251B] rounded-lg px-8 py-2"
        >
            <Text allowFontScaling={false} className="text-white text-base font-['roboto']">See my Cart</Text>
        </TouchableOpacity>
    </View>
);

const MenuItemCard: React.FC<{ item: MenuItem, onOpenModal: () => void }> = ({ item, onOpenModal }) => (
    <View
        style={{ width: (width / 2) - 24 }} 
        className="flex flex-col bg-white rounded-xl shadow-md overflow-hidden"
    >
        <Image
            source={require('../../assets/baguette.png')}
            style={{ width: '100%', height: 100 }}
            contentFit="cover"
        />
        
        <View className="p-3 flex flex-col gap-1">
            <Text allowFontScaling={false} className="text-sm font-bold text-[#17213A]" numberOfLines={1}>{item.name}</Text>
            <Text allowFontScaling={false} className="text-xs text-gray-500" numberOfLines={2}>{item.description}</Text>
            
            <View className="mt-2 flex-row items-center justify-between">
                <Text allowFontScaling={false} className="font-bold text-[#CA251B]">{item.price}</Text>
                
                <TouchableOpacity
                    className="bg-[#CA251B] text-white p-1.5 rounded-full shadow-md"
                    onPress={onOpenModal}>
                    <Plus size={18} color="white" />
                </TouchableOpacity>
            </View>
        </View>
    </View>
);

const STATIC_MENU_ITEMS: MenuItem[] = [
    { name: "Pizza 1/4 Plateau Thon Fromage", description: "Sauce tomate, thon, fromage, persil - Portion 2 Personnes", price: "19,300 DT" },
    { name: "Sandwich Tunisien Complet", description: "Merguez, œuf, salade méchouia, harissa, frites", price: "8,500 DT" },
    { name: "Lablebi Classique", description: "Pois chiches, cumin, huile d'olive, œufs pochés", price: "5,000 DT" },
    { name: "Jus d'Orange Frais", description: "Jus d'orange 100% naturel pressé à la minute", price: "4,000 DT" },
    { name: "Salade César", description: "Laitue, croûtons, parmesan, poulet grillé, sauce César", price: "12,000 DT" },
    { name: "Tiramisu", description: "Dessert italien classique au café et mascarpone", price: "7,500 DT" },
];
const TABS = ['Top Sales', 'Pizza Tranches', 'Pizza', 'Sandwich'];

export default function RestaurantDetails() {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [cartVisible, setCartVisible] = useState(false); 
    const [cartTotal, setCartTotal] = useState({ price: "0,000 DT", count: 0 }); 
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

    

    const handleUpdateCartAndClose = useCallback((itemDetails: CartItemDetails) => {
        
        if (itemDetails.quantity > 0) {
            const currentTotalNum = parseFloat(cartTotal.price.replace(',', '.')) || 0;
            const newTotalNum = currentTotalNum + itemDetails.total;
            const newCount = cartTotal.count + itemDetails.quantity;
            
            setCartTotal({
                price: newTotalNum.toFixed(3).replace('.', ','),
                count: newCount
            });
            setCartVisible(true);
        }
        setIsModalVisible(false);
    }, [cartTotal, translateY]);
    
    const handleSeeCart = () => {
         navigation.navigate('Cart'); 
    };

    const modalContent = <MenuDetail handleAddItem={handleUpdateCartAndClose} />;

    const mainContent = (
        <ScrollView className="flex-1"> 
            <View className="px-4 ">
                <Text allowFontScaling={false} className="text-2xl font-bold ml-2 mt-4 text-[#17213A]">Di Napoli</Text>
                <Text allowFontScaling={false} className="text-sm ml-2 mt-4 text-[#17213A]">Pizzas en tranches, Plats exquis, sandwich!!</Text>
                
                <View className="flex flex-row items-center text-xs text-[#17213A] mt-2 justify-center">
                    <View className="flex flex-row items-center gap-4 bg-white px-4 py-2 rounded-xl border-1 border-black/5 shadow-xl mt-2">
                        
                        <View className="flex flex-row items-center gap-1 font-sans">
                            <Clock7 size={16} color="#CA251B" />
                            <Text allowFontScaling={false} className="text-sm text-gray-700">25 - 30 mins</Text>
                        </View>
                        
                        <View className="flex flex-row items-center gap-1 font-sans">
                            <Text allowFontScaling={false} className="text-sm text-gray-700">4.9</Text>
                            <Star size={16} color="#CA251B" fill="#CA251B" />
                        </View>

                        <View className="flex flex-row items-center gap-1 font-sans">
                            <MapPin size={16} color="#CA251B" />
                            <Text allowFontScaling={false} className="text-sm text-gray-700">1,5 DT</Text>
                        </View>
                    </View>
                </View>
            </View>

            <View className="mb-4 rounded-lg bg-gray-100 mt-4">
                <View className="p-3 px-4">
                    <Text allowFontScaling={false} className="mb-1 font-semibold text-[#17213A]">Restaurant Info</Text>
                    <Text allowFontScaling={false} className="text-sm text-[#17213A]">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
                        ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                        ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </Text>
                    <View className="mt-2 ml-2 flex flex-row items-center text-[#17213A]/40">
                        <MapPin size={20} />
                        <Text allowFontScaling={false} className="text-[#17213A] ml-2">Rue Mustapha Abdessalem, Ariana 2091</Text>
                    </View>
                </View>
            </View>

            <View className="px-4">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex overflow-x-auto gap-2 py-2 scrollbar-hide p-4">
                    {TABS.map((cat, idx) => (
                        <TouchableOpacity key={idx} className={`mr-2 rounded-xl border border-[#CA251B] px-4 py-2 ${idx === 0 ? 'bg-[#CA251B]' : 'bg-white'}`}>
                            <Text allowFontScaling={false} className={`text-sm font-semibold font-['roboto'] ${idx === 0 ? 'text-white' : 'text-[#CA251B]'}`}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            
                <Text allowFontScaling={false} className="text-lg font-semibold text-black/60 mb-4">Top Sales ({STATIC_MENU_ITEMS.length})</Text>
                
                <View className="flex-row flex-wrap justify-between gap-y-4 mb-4 "> 
                    {STATIC_MENU_ITEMS.map((item, idx) => (
                        <View key={idx} className="rounded-3xl overflow-hidden shadow-3xl " >
                        <MenuItemCard  item={item} onOpenModal={handleOpen}    />
                        </View>
                    ))}
                </View>
                
                <View style={{ height: cartVisible ? 120 : 20 }} /> 
            </View>
        </ScrollView>
    );

    const customHeader = (
    <View style={{ width: "100%", height: 160 }}>
      {/* Background image */}
      <Image
        source={require("../../assets/TEST.png")}
        style={StyleSheet.absoluteFillObject} // fills parent
        contentFit="cover"
      />

      {/* Foreground row */}
      <View
        style={{
            paddingTop: 0 + insets.top,
          flex: 1,
          paddingHorizontal: 16,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <TouchableOpacity
          style={{
            borderRadius: 9999,
            backgroundColor: "white",
            padding: 8,
          }}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="#CA251B" />
        </TouchableOpacity>

        <TouchableOpacity
          style={{
            borderRadius: 9999,
            backgroundColor: "white",
            padding: 8,
          }}
        >
          <Heart size={24} color="#CA251B" />
        </TouchableOpacity>
      </View>
    </View>
    );

    const collapsedHeader = (
        <View className="flex-1 justify-center bg-white px-4 flex-row items-center">
            <TouchableOpacity className="p-2" onPress={() => navigation.goBack()}>
                <ArrowLeft size={20} color="#CA251B" />
            </TouchableOpacity>
            <Text allowFontScaling={false} className="text-lg font-bold text-gray-800 flex-1 text-center">Di Napoli</Text>
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
                        style={[{ height: modalHeight }, animatedStyle]}
                    >
                        {modalContent}
                    </Animated.View>
                </>
            )}
        </View>
    );
}