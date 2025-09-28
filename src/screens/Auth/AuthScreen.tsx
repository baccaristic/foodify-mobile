import React, { useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Image } from 'expo-image';
import { FontAwesome } from '@expo/vector-icons'; // For Google icon
import { Mail } from 'lucide-react-native'; // For email icon
import { LinearGradient } from 'expo-linear-gradient';

const AuthScreen = () => {
  const textInputRef = useRef(null);

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View className="flex-1 bg-white">
        {/* Content with padding */}
        <View className="items-center px-6 pt-16">
          {/* Logo */}
          <Image
            source={require('../../../assets/logo.png')}
            style={{ width: '40%', height: '15%', marginBottom: 20 }}
            contentFit="contain"
          />

          {/* Enter mobile number text */}
          <Text className="text-xl font-bold mb-6 text-gray-800">
            Enter your mobile number
          </Text>

          {/* Mobile number input */}
          <TextInput
            ref={textInputRef}
            className="w-full h-12 bg-gray-200 rounded-lg px-4 mb-6 text-gray-800"
            placeholder="Your Number eg.98765432"
            placeholderTextColor="gray"
            keyboardType="phone-pad"
            returnKeyType="done" // Adds a "Done" button on the keyboard
            onSubmitEditing={Keyboard.dismiss} // Dismisses keyboard when "Done" is pressed
          />

          {/* Continue button */}
          <TouchableOpacity className="w-full h-12 bg-blue-950 rounded-lg justify-center items-center mb-4">
            <Text className="text-white font-semibold text-lg">Continue</Text>
          </TouchableOpacity>

          {/* Or separator */}
          <View className="flex-row items-center w-full mb-4">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="mx-4 text-gray-500">or</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Continue with Google */}
          <TouchableOpacity className="w-full h-12 bg-red-600 rounded-lg flex-row justify-center items-center mb-4">
            <FontAwesome name="google" size={20} color="white" className="mr-2" />
            <Text className="text-white font-semibold text-lg">Continue with Google</Text>
          </TouchableOpacity>

          {/* Continue with email */}
          <TouchableOpacity className="w-full h-12 bg-white border border-gray-400 rounded-lg flex-row justify-center items-center mb-6">
            <Mail size={20} color="gray" className="mr-2" />
            <Text className="text-gray-800 font-semibold text-lg">Continue with e-mail</Text>
          </TouchableOpacity>
        </View>

        {/* Background Image with Gradient */}
        <View style={{ width: '100%' }}>
          <Image
            source={require('../../../assets/background.png')}
            style={{ width: '100%', height: '100%' }} // Adjust height as needed to match design
            contentFit="cover"
          />
          <LinearGradient
            colors={['rgba(255, 255, 255, 1)', 'rgba(255, 255, 255, 0)']} // White at top, transparent at bottom
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, height: '100%' }} // Match image height
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default AuthScreen;