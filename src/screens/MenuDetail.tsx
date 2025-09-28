import React, { useState } from "react";
import { View, Text, TouchableOpacity, Dimensions, ScrollView } from "react-native";
import { X, Heart, Check, Plus, Minus, ArrowLeft } from "lucide-react-native";
import { Image } from "expo-image";
import MainLayout from "~/layouts/MainLayout";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const primaryColor = "#CA251B";

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

const OptionRow: React.FC<OptionRowProps> = ({
  item,
  displayItem,
  isSelected,
  onToggle,
  price,
}) => {
  const formatPrice = (p: number) => p.toFixed(3).replace(".", ",");

  return (
    <TouchableOpacity
      onPress={() => onToggle(item)}
      className="flex-row justify-between items-center mb-4"
    >
      <View className="flex-row items-center flex-1">
        <Text allowFontScaling={false} className="text-gray-800 text-base font-semibold">
          {displayItem}
        </Text>
        {price !== undefined && (
          <View className="bg-red-700 rounded-lg px-2 py-1 ml-2">
            <Text allowFontScaling={false} className="text-white text-xs font-bold">
              +{formatPrice(price)} DT
            </Text>
          </View>
        )}
      </View>

      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: primaryColor,
          backgroundColor: isSelected ? primaryColor : "transparent",
        }}
        className="flex items-center justify-center"
      >
        {isSelected ? (
          <Check size={16} color="white" />
        ) : (
          <Plus size={16} color={primaryColor} />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function MenuDetail({ handleAddItem }: MenuDetailProps) {
  const navigation = useNavigation();
  const basePrice = 19.3;
  const initialDescription =
    "2 galette tortillas à la farine de blé, 2 viandes au choix, sauce fromagère, garniture et frites.";

  const [quantity, setQuantity] = useState(1);
  const [selectedToppings, setSelectedToppings] = useState<string[]>(["Onion"]);
  const [selectedMeats, setSelectedMeats] = useState<string[]>([]);
  const [selectedSupplements, setSelectedSupplements] = useState<string[]>([]);
    const insets = useSafeAreaInsets();

  const toppingsList = ["Lettuce", "Caramelised onion", "Onion"];
  const meatsList = ["Cordon bleu", "Toasted escalope", "Kebab", "Nuggets"];
  const supplementsList = [
    { name: "Cheddar", price: 3.0 },
    { name: "Mozzarella", price: 3.0 },
    { name: "Bacon", price: 3.0 },
  ];

  const calculateTotal = () => {
    const supPrice = selectedSupplements.reduce((sum, name) => {
      const sup = supplementsList.find((s) => s.name === name);
      return sum + (sup ? sup.price : 0);
    }, 0);
    return (basePrice + supPrice) * quantity;
  };

  const total = calculateTotal();
  const formatPrice = (p: number) => p.toFixed(3).replace(".", ",");

  const handleAdd = () => {
    handleAddItem({ quantity, total });
  };

  const detailHeader = (
    <View className="flex-1">
      <Image
        source={require("../../assets/TEST.png")}
        style={{ width, height: 160 }}
        contentFit="cover"
      />
      <View className="absolute left-4 top-8">
        <TouchableOpacity
          className="rounded-full bg-white p-2"
          onPress={() => navigation.goBack()}
        >
          <X size={20} color={primaryColor} />
        </TouchableOpacity>
      </View>
      <View className="absolute right-4 top-8">
        <TouchableOpacity className="rounded-full bg-white p-2">
          <Heart size={20} color={primaryColor} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const collapsedHeader = (
    <View className="flex-1 justify-center bg-white px-4 flex-row items-center">
      <TouchableOpacity className="p-2" onPress={() => navigation.goBack()}>
        <ArrowLeft size={20} color={primaryColor} />
      </TouchableOpacity>
      <Text allowFontScaling={false} className="text-lg font-bold text-gray-800 flex-1 text-center">
        Di Napoli
      </Text>
      <TouchableOpacity className="p-2">
        <Heart size={20} color={primaryColor} />
      </TouchableOpacity>
    </View>
  );

  const mainContent = (
    <ScrollView className="px-4 -mt-4 bg-white rounded-t-2xl pt-4">
      <Text allowFontScaling={false} className="text-3xl font-bold text-[#17213A] mt-2">Tacos XL</Text>
      <Text allowFontScaling={false} className="text-xl font-bold text-[#CA251B] mt-1">
        {formatPrice(basePrice)} DT
      </Text>
      <Text allowFontScaling={false} className="text-sm text-[#17213A] mt-2 mb-6">
        {initialDescription}
      </Text>

      <Text allowFontScaling={false} className="text-xl font-bold mb-1">Choose your toppings</Text>
      {toppingsList.map((item) => (
        <OptionRow
          key={item}
          item={item}
          displayItem={item}
          isSelected={selectedToppings.includes(item)}
          onToggle={(n) =>
            setSelectedToppings((prev) =>
              prev.includes(n) ? prev.filter((t) => t !== n) : [...prev, n]
            )
          }
        />
      ))}

      <View className="h-[1px] bg-gray-200 my-4" />

      <Text allowFontScaling={false} className="text-xl font-bold mb-1">Choose your meat</Text>
      {meatsList.map((item) => (
        <OptionRow
          key={item}
          item={item}
          displayItem={item}
          isSelected={selectedMeats.includes(item)}
          onToggle={(n) =>
            setSelectedMeats((prev) =>
              prev.includes(n) ? prev.filter((m) => m !== n) : [...prev, n]
            )
          }
        />
      ))}

      <View className="h-[1px] bg-gray-200 my-4" />

      <Text allowFontScaling={false} className="text-xl font-bold mb-1">Supplements</Text>
      {supplementsList.map((item) => (
        <OptionRow
          key={item.name}
          item={item.name}
          displayItem={item.name}
          isSelected={selectedSupplements.includes(item.name)}
          onToggle={(n) =>
            setSelectedSupplements((prev) =>
              prev.includes(n) ? prev.filter((s) => s !== n) : [...prev, n]
            )
          }
          price={item.price}
        />
      ))}

      <View className="h-20" />
    </ScrollView>
  );

  const orderBar = (
    <View style={{paddingBottom: insets.bottom}} className="absolute bottom-0 left-0 right-0 w-full bg-white p-4 shadow-2xl border-t border-gray-100">
      <View className="flex-row items-center justify-center mb-4">
        <TouchableOpacity
          onPress={() => setQuantity((q) => Math.max(1, q - 1))}
          className={`p-2 rounded-full border border-[#CA251B] ${
            quantity > 1 ? "bg-[#CA251B]" : "bg-transparent"
          }`}
          disabled={quantity <= 1}
        >
          <Minus size={24} color={quantity > 1 ? "white" : primaryColor} />
        </TouchableOpacity>
        <Text allowFontScaling={false} className="text-2xl font-bold mx-6">{quantity}</Text>
        <TouchableOpacity
          onPress={() => setQuantity((q) => q + 1)}
          className="bg-[#CA251B] p-2 rounded-full border border-[#CA251B]"
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="w-full bg-[#CA251B] py-4 rounded-xl shadow-lg"
        onPress={handleAdd}
      >
        <Text allowFontScaling={false} className="text-white text-lg font-bold text-center">
          Add {quantity} for {formatPrice(total)} DT
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <MainLayout
        showHeader
        showFooter={false}
        customHeader={detailHeader}
        collapsedHeader={collapsedHeader}
        mainContent={mainContent}
        headerMaxHeight={160}
        headerMinHeight={120}
      />
      {orderBar}
    </View>
  );
}
