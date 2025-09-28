import React, { useState } from "react";
import { View, Text, TouchableOpacity, Dimensions, ScrollView } from "react-native";
import { X, Heart, Check, Plus, Minus } from "lucide-react-native";
import { Image } from 'expo-image';

const { width } = Dimensions.get("window");

interface CartItemDetails {
    quantity: number;
    total: number;
}

interface MenuDetailProps {
    handleAddItem: (itemDetails: CartItemDetails) => void;
}

interface OptionRowProps {
    item: string;
    displayItem: string;
    isSelected: boolean;
    onToggle: (name: string) => void;
    price?: number;
}

const OptionRow: React.FC<OptionRowProps> = ({ item, displayItem, isSelected, onToggle, price }) => {
    const primaryColor = "#CA251B";

    const checkBgColor = isSelected ? primaryColor : "transparent";
    const checkBorderColor = isSelected ? primaryColor : primaryColor;
    const checkIconColor = isSelected ? "white" : primaryColor;
    
    const formatPrice = (p: number) => p.toFixed(3).replace('.', ',');

    const SupplementBadge = () => (
        <View className="bg-red-700 rounded-lg px-2 py-1 ml-2">
            <Text className="text-white text-xs font-bold">
                +{formatPrice(price!)} DT
            </Text>
        </View>
    );

    return (
        <TouchableOpacity
            onPress={() => onToggle(item)} 
            className="flex-row justify-between items-center mb-4"
        >
            <View className="flex-row items-center flex-1">
                <Text className="text-gray-800 text-base font-semibold">{displayItem}</Text>
                {price !== undefined && <SupplementBadge />}
            </View>

            <View
                style={{ 
                    width: 24, 
                    height: 24, 
                    borderRadius: 12, 
                    borderWidth: 1,
                    borderColor: checkBorderColor,
                    backgroundColor: checkBgColor
                }}
                className="flex items-center justify-center"
            >
                {isSelected ? (
                    <Check size={16} color="white" />
                ) : (
                    <Plus size={16} color={checkIconColor} />
                )}
            </View>
        </TouchableOpacity>
    );
};


export default function MenuDetail({ handleAddItem }: MenuDetailProps) {
    const basePrice = 19.300;
    const initialDescription = "2 galette tortillas à la farine de blé, 2 viandes au choix, sauce fromagère, garniture et frites.";
    const primaryColor = "#CA251B";

    const [quantity, setQuantity] = useState(1);
    
    const toppingsList = ["Lettuce", "Caramelised onion", "Onion"];
    const [selectedToppings, setSelectedToppings] = useState<string[]>(["Onion"]);

    const meatsList = [
        "Cordon bleu",
        "Toasted escalope",
        "Year escalope",
        "Kebab",
        "Nuggets",
        "Cheeseball",
    ];
    const [selectedMeats, setSelectedMeats] = useState<string[]>([]);

    const supplementsList = [
        { name: "Cheddar", price: 3.000 },
        { name: "Raclette", price: 3.000 },
        { name: "Mozzarella", price: 3.000 },
        { name: "Gruyère", price: 3.000 },
        { name: "Bacon", price: 3.000 },
    ];
    const [selectedSupplements, setSelectedSupplements] = useState<string[]>([]);

    const calculateTotal = () => {
        const supPrice = selectedSupplements.reduce((sum, name) => {
            const sup = supplementsList.find((s) => s.name === name);
            return sum + (sup ? sup.price : 0);
        }, 0);
        return (basePrice + supPrice) * quantity;
    };

    const total = calculateTotal();
    const formatPrice = (price: number) => price.toFixed(3).replace('.', ',');

    const toggleTopping = (name: string) => {
        const isSelected = selectedToppings.includes(name);
        if (isSelected) {
            setSelectedToppings(selectedToppings.filter((t) => t !== name));
        } else if (selectedToppings.length < 3) {
            setSelectedToppings([...selectedToppings, name]);
        }
    };

    const toggleMeat = (name: string) => {
        const isSelected = selectedMeats.includes(name);
        if (isSelected) {
            setSelectedMeats(selectedMeats.filter((m) => m !== name));
        } else if (selectedMeats.length < 2) {
            setSelectedMeats([...selectedMeats, name]);
        }
    };

    const toggleSupplement = (name: string) => {
        const isSelected = selectedSupplements.includes(name);
        if (isSelected) {
            setSelectedSupplements(selectedSupplements.filter((s) => s !== name));
        } else if (selectedSupplements.length < 6) {
            setSelectedSupplements([...selectedSupplements, name]);
        }
    };

    const handleAdd = () => {
        handleAddItem({ quantity, total });
    };

    const Header = () => (
        <View style={{ width: width, height: 160 }} className="relative">
            <Image
                source={require("../../assets/TEST.png")} 
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
            />
            <View className="absolute inset-0 bg-[#17213A]/30" />
            
            <View className="absolute top-8 left-4">
                <TouchableOpacity className="bg-white/80 p-2 rounded-full" onPress={() => handleAddItem({ quantity: 0, total: 0 })}>
                    <X size={20} color={primaryColor} />
                </TouchableOpacity>
            </View>
            <View className="absolute top-8 right-4">
                <TouchableOpacity className="bg-white/80 p-2 rounded-full">
                    <Heart size={20} color={primaryColor} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View className="flex-1">
            <Header />

            <ScrollView 
                className="flex-1 bg-white" 
                contentContainerStyle={{ paddingBottom: 150 }}
            >
                <View className="px-4 -mt-4 bg-white rounded-t-2xl pt-4">
                    
                    <Text className="text-3xl font-bold text-[#17213A] mt-2">Tacos XL</Text>
                    <Text className="text-xl font-bold text-[#CA251B] mt-1">{formatPrice(basePrice)} DT</Text>
                    <Text className="text-sm text-[#17213A] mt-2 mb-6">{initialDescription}</Text>

                    <Text className="text-xl font-bold mb-1">Choose your toppings</Text>
                    <Text className="text-[#17213A] mb-4">Choose maximum 3 products</Text>
                    {toppingsList.map((item) => (
                        <OptionRow
                            key={item}
                            item={item}
                            displayItem={item + " +"}
                            isSelected={selectedToppings.includes(item)}
                            onToggle={toggleTopping}
                        />
                    ))}
                    
                    <View className="h-[1px] bg-gray-200 my-4" />

                    <Text className="text-xl font-bold mb-1">Choose your meat</Text>
                    <View className="flex-row items-center mb-4">
                        <Text className="text-[#17213A] mr-2">Choose 2 items</Text>
                        <View className="bg-[#CA251B] rounded px-2 py-0.5">
                            <Text className="text-white text-sm font-semibold">Required</Text>
                        </View>
                    </View>
                    {meatsList.map((item) => (
                        <OptionRow
                            key={item}
                            item={item}
                            displayItem={item}
                            isSelected={selectedMeats.includes(item)}
                            onToggle={toggleMeat}
                        />
                    ))}
                    
                    <View className="h-[1px] bg-gray-200 my-4" />

                    <Text className="text-xl font-bold mb-1">Choose your supplements</Text>
                    <Text className="text-gray-500 mb-4">Choose maximum of 6 products</Text>
                    {supplementsList.map((item) => (
                        <OptionRow
                            key={item.name}
                            item={item.name}
                            displayItem={item.name + " ++"}
                            isSelected={selectedSupplements.includes(item.name)}
                            onToggle={toggleSupplement}
                            price={item.price}
                        />
                    ))}

                    <View className="h-10" />
                </View>
            </ScrollView>

            <View className="absolute bottom-0 left-0 right-0 w-full bg-white p-4 shadow-2xl border-t border-gray-100">
                
                <View className="flex-row items-center justify-center mb-4">
                    <TouchableOpacity
                        onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                        className={`p-2 rounded-full border border-[#CA251B] ${quantity > 1 ? 'bg-[#CA251B]' : 'bg-transparent'}`}
                        disabled={quantity <= 1}
                    >
                        <Minus size={24} color={quantity > 1 ? 'white' : primaryColor} />
                    </TouchableOpacity>
                    <Text className="text-2xl font-bold mx-6">{quantity}</Text>
                    <TouchableOpacity
                        onPress={() => setQuantity((q) => q + 1)}
                        className="bg-[#CA251B] p-2 rounded-full border border-[#CA251B]"
                    >
                        <Plus size={24} color="white" />
                    </TouchableOpacity>
                </View>

                {/* FIXED: The core add button correctly calls handleAdd, which calls the parent prop */}
                <TouchableOpacity
                    className="w-full bg-[#CA251B] text-white font-bold py-4 rounded-xl shadow-lg"
                    onPress={handleAdd} 
                >
                    <Text className="text-white text-lg font-bold text-center">
                        Add {quantity} for {formatPrice(total)} DT
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}