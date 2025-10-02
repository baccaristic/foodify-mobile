import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackButtonHeader from '~/components/BackButtonHeader';

// Placeholder for your Location Map image/icon
const LocationIcon = () => (
    <View className="w-20 h-20 bg-transparent mb-10 items-center justify-center">
        {/* Replace this with your actual image component */}
        <Image 
            source={{ uri: 'location_map_uri' }} 
            className="w-full h-full"
            resizeMode="contain"
        />
        <View className="absolute w-12 h-12 bg-red-600 rounded-full opacity-50" />
    </View>
);

const LocationAccess = () => {
    const navigation = useNavigation();

    const handleAgree = () => {
        // FINAL STEP: Use replace() to navigate to Home and clear the entire sign-up stack
    };

    const handleClose = () => {
        // If the user closes, they are still logged in but location access is denied.
        // Still navigate to Home, replacing the stack.
    };

    return (
        <View className="flex-1 bg-white p-6">
                            <BackButtonHeader/>


            {/* This is a placeholder for your map icon image */}
            <LocationIcon />

            <Text allowFontScaling={false} className="text-3xl font-bold mb-4 text-black">
                Allow location access
            </Text>

            <Text allowFontScaling={false} className="text-base text-gray-700 mb-12 leading-relaxed">
                This lets show you which restaurants and stores you can order from.
            </Text>

            <TouchableOpacity 
                className="w-full h-14 bg-[#17213A] rounded-lg justify-center items-center mb-4"
                onPress={handleAgree}
            >
                <Text allowFontScaling={false} className="text-white font-semibold text-lg">I Agree</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                className="w-full h-14 border border-[#17213A] rounded-lg justify-center items-center"
                onPress={handleClose}
            >
                <Text allowFontScaling={false} className="text-[#17213A] font-semibold text-lg">Close</Text>
            </TouchableOpacity>
        </View>
    );
};

export default LocationAccess;