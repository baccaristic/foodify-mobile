import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const NotifLogo = () => (
    <View className="w-36 h-36 bg-transparent mb-10 ">
        <Image
            source={require('assets/notif.png')}
            className="w-full h-full"
            resizeMode="contain"
        />
        <View  />
    </View>
);
const Notification = () => {
    const navigation = useNavigation();

    const NEXT_SCREEN = 'AppHome';

    const handleEnableNotifications = () => {
    navigation.goBack();
    };

    const handleSkip = () => {
        navigation.navigate('Home'  as never);
    };

    return (
        <View className="flex-1 bg-white p-6 justify-between pt-20 pb-10">
            
            <View className=" items-center px-4">
                
               <NotifLogo/>
                
                <Text allowFontScaling={false} className="text-3xl   mb-4 text-black">
                    Always know the status of your order
                </Text>
                
                <Text allowFontScaling={false} className="text-base text-gray-700  leading-relaxed mb-12">
                    Push notification are used to provide updates on your order. You can change this in settings at any time.
                </Text>
                <TouchableOpacity
                    className="w-full h-14 bg-[#17213A] rounded-lg justify-center items-center mb-4"
                    onPress={handleEnableNotifications}
                >
                    <Text allowFontScaling={false} className="text-white font-semibold text-lg">Enable Push Notifiaction</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="w-full h-14 rounded-lg justify-center items-center"
                    onPress={handleSkip}
                >
                    <Text allowFontScaling={false} className="text-gray-600 font-semibold text-lg">Skip for now</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
};

export default Notification;