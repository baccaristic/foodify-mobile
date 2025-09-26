import { View, Text, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { Percent, Star, Gift, Pizza, Hamburger, ArrowLeft, ChevronDown, Search } from "lucide-react-native";
import MainLayout from "~/layouts/MainLayout";
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeIn } from "react-native-reanimated";

import {Image} from 'expo-image';
const { width } = Dimensions.get("window");



export default function HomePage() {
    const navigation = useNavigation();
  const mainContent = (
    <View className="px-4">
      {/* Nearby Restaurants Section */}
      <Text className="text-xl font-bold mb-4">Nearby Restaurants</Text>
      <View className="space-y-4">
        {[...Array(5)].map((_, idx) => (
          <TouchableOpacity key={idx} className="bg-white rounded-lg overflow-hidden shadow" onPress={() => navigation.navigate("RestaurantDetails")}>
            <Image
              source={require('../../assets/baguette.png')} // Replace with actual image URL or local asset
              style={{ width: "100%", height: 150 }}
              contentFit="cover"
            />
            <View className="p-3">
              <Text className="text-lg font-bold">BAGUETTES & BAGUETTE</Text>
              <View className="flex-row items-center mt-1">
                <Star size={16} color="gold" fill="gold" />
                <Text className="text-sm ml-1">4.5/5</Text>
              </View>
              <Text className="text-red-500 text-sm mt-1">15-25 min</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

const customHeader = (
  <Animated.View 
    entering={FadeIn.duration(500)}
  >
    <View className="bg-red-500 p-4 pb-6">
         <View className="flex-row items-center justify-between">
      <TouchableOpacity>
        <ArrowLeft size={24} color="white" />
      </TouchableOpacity>
      <Text className="text-white text-lg font-bold">San Francisco Bay Area</Text>
      <View className="w-6" /> {/* Placeholder for symmetry */}
    </View>
    <View className="bg-white rounded-full px-4 py-2 mt-4 flex-row items-center">
      <Text className="text-gray-500 flex-1">Ready to eat?</Text>
      <Search size={20} color="gray" />
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
      <TouchableOpacity className="items-center mr-6">
        <View className="bg-white rounded-full p-2">
          <Percent size={24} color="red" />
        </View>
        <Text className="text-white text-xs mt-1 text-center">Discount</Text>
      </TouchableOpacity>
      <TouchableOpacity className="items-center mr-6">
        <View className="bg-white rounded-full p-2">
          <Star size={24} color="red" />
        </View>
        <Text className="text-white text-xs mt-1 text-center">Top Restaurants</Text>
      </TouchableOpacity>
      <TouchableOpacity className="items-center mr-6">
        <View className="bg-white rounded-full p-2">
          <Gift size={24} color="red" />
        </View>
        <Text className="text-white text-xs mt-1 text-center">Rewards</Text>
      </TouchableOpacity>
      <TouchableOpacity className="items-center mr-6">
        <View className="bg-white rounded-full p-2">
          <Pizza size={24} color="red" />
        </View>
        <Text className="text-white text-xs mt-1 text-center">Pizza</Text>
      </TouchableOpacity>
      <TouchableOpacity className="items-center mr-6">
        <View className="bg-white rounded-full p-2">
          <Hamburger size={24} color="red" />
        </View>
        <Text className="text-white text-xs mt-1 text-center">Burger</Text>
      </TouchableOpacity>
    </ScrollView>
    </View>
  </Animated.View>
);

  const collapsedHeader = (
    <View className="flex-1 bg-white px-4 flex-row items-center justify-between">
      <View className="bg-gray-200 rounded-full px-4 py-2 flex-1 flex-row items-center">
        <Search size={20} color="gray" className="mr-2" />
        <Text className="text-gray-500">Search in Food</Text>
      </View>
      <TouchableOpacity className="ml-2 px-3 py-2 bg-gray-200 rounded-full flex-row items-center">
        <Text className="text-gray-800 mr-1">Food Type</Text>
        <ChevronDown size={16} color="gray" />
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
    </View>
  );
}