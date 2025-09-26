import  { useState, useEffect } from 'react';
import { View, Text,  ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Heart, ArrowLeft } from 'lucide-react-native';
import MainLayout from '~/layouts/MainLayout';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import MenuDetail from './MenuDetail';
import { useNavigation } from '@react-navigation/native';
import {Image} from 'expo-image';

const { width, height: screenHeight } = Dimensions.get('window');
const modalHeight = screenHeight;

export default function RestaurantDetails() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const translateY = useSharedValue(modalHeight);
  const navigation = useNavigation();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  useEffect(() => {
    if (isModalVisible) {
      translateY.value = withTiming(0, { duration: 300 });
    }
  }, [isModalVisible]);

  const handleClose = () => {
    translateY.value = withTiming(modalHeight, { duration: 300 }, () => {
    });
    setIsModalVisible(false);
  };

  const modalContent = <MenuDetail handleOnClose={handleClose} />;

  const mainContent = (
    <View className="px-4">
      {/* Restaurant Info */}
      <Text className="mb-2 mt-4 text-2xl font-bold">Di Napoli</Text>
      <View className="mb-2 flex-row items-center space-x-4">
        <Text className="text-gray-600">25-30 mins • Delivery</Text>
        <Text className="font-semibold text-yellow-400">★ 4.9 (400+)</Text>
        <Text className="text-gray-600">1.5 DT</Text>
      </View>

      {/* Restaurant Description */}
      <View className="mb-4 rounded-lg bg-gray-100 p-3">
        <Text className="mb-1 font-semibold">Restaurant Info</Text>
        <Text className="text-sm text-gray-600">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
          ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </Text>
        <Text className="mt-2 text-gray-500">📍 Rue Mustapha Abdessalem, Ariana 2091</Text>
      </View>

      {/* Categories */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
        {['Top Sales', 'Pizza Tranches', 'Pizza', 'Sandwich'].map((cat, idx) => (
          <View key={idx} className="mr-2 rounded-full border border-red-500 px-4 py-1">
            <Text className="text-sm text-red-500">{cat}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Menu Items */}
      <Text className="mb-2 text-lg font-bold">Top Sales (9)</Text>
      <View className="flex-row flex-wrap justify-between">
        {[...Array(4)].map((_, idx) => (
          <View
            key={idx}
            className="mb-4 rounded-lg bg-white shadow"
            style={{ width: (width - 48) / 2 }}>
            <Image
              source={require('../../assets/baguette.png')}
              style={{ width: (width - 48) / 2, height: 100 }}
              contentFit="cover"
            />
            <View className="p-2">
              <Text className="text-sm font-semibold">Pizza 1/4 Plateau Thon Fromage</Text>
              <Text className="mt-1 text-xs text-gray-500">
                Sauce tomate, thon, fromage, persil - Portion 2 Personnes
              </Text>
              <View className="mt-2 flex-row items-center justify-between">
                <Text className="font-bold text-red-500">19,300 DT</Text>
                <TouchableOpacity
                  className="rounded-full bg-red-500 p-1"
                  onPress={() => setIsModalVisible(true)}>
                  <Text className="text-lg font-bold text-white">+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );

  // Full header with restaurant image
  const customHeader = (
    <View className="flex-1">
      <Image
        source={require('../../assets/TEST.png')} // replace with your actual image
        style={{ width: width, height: 160 }}
        contentFit="cover"
      />
      <View className="absolute left-4 top-8">
        <TouchableOpacity className="rounded-full bg-white p-2" onPress={() => navigation.navigate("Home")}>
          <ArrowLeft size={20} color="#CA251B" />
        </TouchableOpacity>
      </View>
      <View className="absolute right-4 top-8">
        <TouchableOpacity className="rounded-full bg-white p-2">
          <Heart size={20} color="#CA251B" />
        </TouchableOpacity>
      </View>
    </View>
  );

  // Collapsed header showing only restaurant name
const collapsedHeader = (
  <View className="flex-1 justify-center bg-white px-4 flex-row items-center">
    <TouchableOpacity className="p-2" onPress={() => navigation.navigate("Home")}>
      <ArrowLeft size={20} color="#CA251B" />
    </TouchableOpacity>
    <Text className="text-lg font-bold text-gray-800 flex-1 text-center">Di Napoli</Text>
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
      {isModalVisible && (
        <>
          <TouchableOpacity
            activeOpacity={1}
            onPress={handleClose}
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
