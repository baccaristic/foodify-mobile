import React, { useState } from "react";
import { Trash2, Minus, Plus, ChevronDown, ArrowLeft } from "lucide-react-native";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { useNavigation, NavigationProp, ParamListBase } from "@react-navigation/native";
import MainLayout from "~/layouts/MainLayout";
import { Image } from "expo-image";

const { width } = Dimensions.get("window");
const primaryColor = "#CA251B";

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
        name: "Pizza Pepperoni",
        description: "Sauce tomate, thon, fromage, persil - Portion 2 Personnes",
        price: "19,300 DT",
        quantity: 1,
        imageSource: require("../../assets/baguette.png"),
    },
    {
        id: 2,
        name: "Pizza Pepperoni",
        description: "Sauce tomate, thon, fromage, persil - Portion 2 Personnes",
        price: "19,300 DT",
        quantity: 2,
        imageSource: require("../../assets/TEST.png"),
    },
    {
        id: 3,
        name: "Sandwich",
        description: "Sauce tomate, thon, fromage, persil - Portion 2 Personnes",
        price: "19,300 DT",
        quantity: 3,
        imageSource: require("../../assets/baguette.png"),
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
        <View className="flex-row items-center mb-4 bg-white rounded-3xl border border-gray-200">
            <View className="w-1/4 h-20 overflow-hidden mr-3 relative rounded-3xl">
                <Image source={item.imageSource} style={{ width: "100%", height: '100%' }}
              contentFit="cover" />
                <TouchableOpacity className="absolute top-1 left-1 bg-white p-1 rounded-full items-center justify-center shadow-sm">
                    <Trash2 size={12} color={primaryColor} />
                </TouchableOpacity>
            </View>

            <View className="flex-1 justify-center">
                <Text className="text-sm font-bold text-[#17213A] pr-6" numberOfLines={1}>
                    {item.name}
                </Text>
                <Text className="text-xs text-gray-500" numberOfLines={2}>
                    {item.description}
                </Text>
                <Text className="font-bold text-sm text-[#CA251B] mt-1">{item.price}</Text>
            </View>

            <View className="flex-col items-center ml-2">
                <View className="flex-row items-center">
                    <TouchableOpacity
                        onPress={handleMinus}
                        className={`p-1 rounded-full border ${isMinQuantity ? "border-gray-300 bg-[#CA251B]/20" : "border-[#CA251B] bg-[#CA251B]"}`}
                        disabled={isMinQuantity}
                    >
                        <Minus size={16} color="white" />
                    </TouchableOpacity>

                    <Text className="text-lg text-[#CA251B] font-semibold mx-3 w-4 text-center">
                        {item.quantity}
                    </Text>

                    <TouchableOpacity
                        onPress={handlePlus}
                        className="bg-[#CA251B] p-1 rounded-full border border-[#CA251B]"
                    >
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
    const restaurantName = "Di Napoli";
    const totalItems = cartItems.length;
    const totalOrderPrice = "19,300 DT";

    const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
        setCartItems((prev) =>
            prev.map((item) => (item.id === itemId ? { ...item, quantity: newQuantity } : item))
        );
    };

    const cartContent = (
        <View className="px-4">
            <Text className="text-2xl font-bold text-[#17213A] mt-6 mb-4 text-center">My cart</Text>

            <View className="flex-row items-center justify-between mb-4">
                <Text className="text-sm font-semibold text-[#CA251B]">
                    {totalItems} Product from{" "}
                    <Text className="font-bold text-xl text-[#CA251B]">{restaurantName}</Text>
                </Text>
                <TouchableOpacity>
                    <Trash2 size={42} color="#CA251B" style={{ borderWidth: 2, borderColor: "gray-600", borderRadius: 16, padding: 6 }} />
                </TouchableOpacity>
            </View>

            {cartItems.map((item) => (
                <CartItemRow key={item.id} item={item} onUpdateQuantity={handleUpdateQuantity} />
            ))}

            <TouchableOpacity className="bg-[#CA251B] rounded-xl px-2 py-2 my-4 mx-auto">
                <Text className="text-white text-lg text-center">Add more items</Text>
            </TouchableOpacity>

            <View style={{ height: 160 }} />
        </View>
    );

    const cartHeader = (
        <View className="p-4">
            <View className="flex-row items-center justify-between">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="rounded-full border-2 border-white/40 items-center justify-center p-2"
                >
                    <ArrowLeft size={20} color="white" />
                </TouchableOpacity>

                <TouchableOpacity className="flex-row items-center gap-2 px-5 py-3 max-w-[70%] mx-auto">
                    <Text className="text-white text-lg truncate font-semibold" numberOfLines={1}>
                        San Francisco Bay Area
                    </Text>
                    <ChevronDown color="white" size={20} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const fixedOrderBar = (
        <View className="absolute bottom-[80px] left-0 right-0 bg-white px-4 py-3 flex-row justify-between items-center z-50 rounded-t-xl shadow-2xl border-t border-gray-100">
            <Text className="text-[#CA251B] text-base font-semibold">
                Order : {totalOrderPrice}
            </Text>
            <TouchableOpacity
                className="bg-[#CA251B] rounded-lg px-8 py-3"
                onPress={() => console.log("Proceed to Checkout")}
            >
                <Text className="text-white text-base">Order</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View className="flex-1 bg-white">
            <MainLayout
                headerBackgroundImage={require("../../assets/pattern1.png")}
                showHeader={true}
                showFooter={true}
                headerMaxHeight={80}
                customHeader={cartHeader}
                mainContent={cartContent}
            />
            {fixedOrderBar}
        </View>
    );
}
