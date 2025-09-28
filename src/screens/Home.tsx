import { View, Text, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { Percent, Star, Gift, Pizza, Hamburger, ArrowLeft, ChevronDown, Search } from "lucide-react-native";
import MainLayout from "~/layouts/MainLayout";
import { useNavigation } from '@react-navigation/native';
import Animated, { FadeIn } from "react-native-reanimated";
import { Image } from 'expo-image';

const { width } = Dimensions.get("window");

export default function HomePage() {
  const navigation = useNavigation();
  const mainContent = (
    <View className="px-4">
      <Text className="text-xl font-bold mb-4 mt-4">Nearby Restaurants</Text>
      <View className="space-y-4">
        {[...Array(5)].map((_, idx) => (
          <TouchableOpacity
            key={idx}
            className="bg-white rounded-lg overflow-hidden shadow"
            onPress={() => navigation.navigate("RestaurantDetails")}
          >
            <Image
              source={require('../../assets/baguette.png')}
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
    <Animated.View entering={FadeIn.duration(500)}>
      <View className="p-4 pb-6">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity>
            <ArrowLeft size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-lg font-bold">San Francisco Bay Area</Text>
          <View className="w-6" />
        </View>
        <View className="bg-white rounded-full px-4 py-2 mt-4 flex-row items-center">
          <Text className="text-gray-500 flex-1">Ready to eat?</Text>
          <Search size={20} color="gray" />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mt-4"
          contentContainerStyle={{ paddingHorizontal: 16, alignItems: "center" }}
        >
          {[
            { icon: Percent, label: "Discount" },
            { icon: Star, label: "Top Restaurants" },
            { icon: Gift, label: "Rewards" },
            { icon: Pizza, label: "Pizza" },
            { icon: Hamburger, label: "Burger" },
          ].map((item, idx) => (
            <TouchableOpacity key={idx} className="items-center mx-3">
              <View className="bg-white rounded-full p-3">
                <item.icon size={24} color="red" />
              </View>
              <Text className="text-white text-xs mt-1 text-center">{item.label}</Text>
            </TouchableOpacity>
          ))}
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
        headerBackgroundImage={require("../../assets/pattern1.png")}
        showHeader={true}
        showFooter={true}
        headerMaxHeight={190}
        headerMinHeight={100}
        customHeader={customHeader}
        collapsedHeader={collapsedHeader}
        mainContent={mainContent}
      />
    </View>
  );
}
