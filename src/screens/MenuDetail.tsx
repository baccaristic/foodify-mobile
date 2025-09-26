import { useState } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { X, Heart, Check, Plus } from "lucide-react-native";
import MainLayout from "~/layouts/MainLayout";
import {Image} from 'expo-image';

const { width } = Dimensions.get("window");

export default function MenuDetail({handleOnClose}) {
  const basePrice = 19.3;
  const [quantity, setQuantity] = useState(1);
  const [selectedToppings, setSelectedToppings] = useState<string[]>(["Onion"]);
  const [selectedMeats, setSelectedMeats] = useState<string[]>(["Cordon bleu"]);
  const [selectedSupplements, setSelectedSupplements] = useState<string[]>([]);

  const toppingsList = ["Lettuce", "Caramelised onion", "Onion"];
  const meatsList = [
    "Cordon bleu",
    "Toasted escalope",
    "Veal escalope",
    "Kebab",
    "Nugget",
    "Cheeseball",
  ];
  const supplementsList = [
    { name: "Cheddar", price: 1.0 },
    { name: "Raclette", price: 3.0 },
    { name: "Mozzarella", price: 3.0 },
    { name: "Gruyere", price: 3.0 },
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

  const formatPrice = (price: number) => `${price.toFixed(3)} DT`;

  const toggleTopping = (name: string) => {
    if (selectedToppings.includes(name)) {
      setSelectedToppings(selectedToppings.filter((t) => t !== name));
    } else if (selectedToppings.length < 3) {
      setSelectedToppings([...selectedToppings, name]);
    }
  };

  const toggleMeat = (name: string) => {
    if (selectedMeats.includes(name)) {
      setSelectedMeats(selectedMeats.filter((m) => m !== name));
    } else if (selectedMeats.length < 2) {
      setSelectedMeats([...selectedMeats, name]);
    }
  };

  const toggleSupplement = (name: string) => {
    if (selectedSupplements.includes(name)) {
      setSelectedSupplements(selectedSupplements.filter((s) => s !== name));
    } else if (selectedSupplements.length < 6) {
      setSelectedSupplements([...selectedSupplements, name]);
    }
  };

  const customHeader = (
    <View className="flex-1">
      <Image
        source={require("../../assets/TEST.png")} // replace with your actual image
        style={{ width: width, height: 160 }}
        contentFit="cover"
      />
      <View className="absolute top-8 left-4">
        <TouchableOpacity className="bg-white p-2 rounded-full"  onPress={() => handleOnClose()}>
          <X size={20} color="#CA251B" />
        </TouchableOpacity>
      </View>
      <View className="absolute top-8 right-4">
        <TouchableOpacity className="bg-white p-2 rounded-full">
          <Heart size={20} color="#CA251B" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const collapsedHeader = (
  <View className="flex-1 justify-center bg-white px-4 flex-row items-center">
    <TouchableOpacity className="p-2" onPress={() => handleOnClose()}>
      <X size={20} color="#CA251B" />
    </TouchableOpacity>
    <Text className="text-lg font-bold text-gray-800 flex-1 text-center">Di Napoli</Text>
    <TouchableOpacity className="p-2">
      <Heart size={20} color="#CA251B" />
    </TouchableOpacity>
  </View>
);

  const mainContent = (
    <View className="px-4">
      <Text className="text-2xl font-bold mt-4 mb-2">Tacos XL</Text>
      <Text className="text-red-500 font-bold text-lg">19.300 DT</Text>
      <Text className="text-gray-600 mb-4">
        2 galette tortillas à la farine de ble, 2 viandes au choix, sauce fromage, garniture et frites.
      </Text>

      <Text className="text-lg font-bold mb-1">Choose your toppings</Text>
      <Text className="text-gray-500 mb-2">Choose maximum 3 products</Text>
      {toppingsList.map((item) => (
        <TouchableOpacity
          key={item}
          onPress={() => toggleTopping(item)}
          className="flex-row justify-between items-center mb-2"
        >
          <Text className="text-gray-800">{item}</Text>
          <View
            className={
              selectedToppings.includes(item)
                ? "bg-green-500 rounded-full p-1"
                : "bg-red-100 rounded-full p-1"
            }
          >
            {selectedToppings.includes(item) ? (
              <Check size={16} color="white" />
            ) : (
              <Plus size={16} color="#CA251B" />
            )}
          </View>
        </TouchableOpacity>
      ))}

      <Text className="text-lg font-bold mb-1 mt-4">Choose your meat</Text>
      <View className="flex-row items-center mb-2">
        <Text className="text-gray-500 mr-2">Choose 2 items</Text>
        <View className="bg-red-500 rounded px-2 py-1">
          <Text className="text-white text-sm font-semibold">Required</Text>
        </View>
      </View>
      {meatsList.map((item) => (
        <TouchableOpacity
          key={item}
          onPress={() => toggleMeat(item)}
          className="flex-row justify-between items-center mb-2"
        >
          <Text className="text-gray-800">{item}</Text>
          <View
            className={
              selectedMeats.includes(item)
                ? "bg-green-500 rounded-full p-1"
                : "bg-red-100 rounded-full p-1"
            }
          >
            {selectedMeats.includes(item) ? (
              <Check size={16} color="white" />
            ) : (
              <Plus size={16} color="#CA251B" />
            )}
          </View>
        </TouchableOpacity>
      ))}

      <Text className="text-lg font-bold mb-1 mt-4">Choose your supplements</Text>
      <Text className="text-gray-500 mb-2">Choose maximum of 6 products</Text>
      {supplementsList.map((item) => (
        <TouchableOpacity
          key={item.name}
          onPress={() => toggleSupplement(item.name)}
          className="flex-row justify-between items-center mb-2"
        >
          <Text className="text-gray-800 flex-1">{item.name}</Text>
          <Text className="text-red-500 mr-4">+{item.price.toFixed(3)} DT</Text>
          <View
            className={
              selectedSupplements.includes(item.name)
                ? "bg-green-500 rounded-full p-1"
                : "bg-red-100 rounded-full p-1"
            }
          >
            {selectedSupplements.includes(item.name) ? (
              <Check size={16} color="white" />
            ) : (
              <Plus size={16} color="#CA251B" />
            )}
          </View>
        </TouchableOpacity>
      ))}

      <View className="h-20" />
    </View>
  );

  return (
    <View className="flex-1">
      <MainLayout
        showHeader={true}
        showFooter={false}
        customHeader={customHeader}
        collapsedHeader={collapsedHeader}
        mainContent={mainContent}
      />
    </View>
  );
}