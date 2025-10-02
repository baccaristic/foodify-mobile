import React from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import BackButtonHeader from '~/components/BackButtonHeader';

const VerificationCode = () => {
    const navigation = useNavigation();
    // Example state for code fields (you would manage this with React.useState)
    const code = ['6', '', '', '', ''];
    const email = "flenfoulani@email.com";
    const hasError = false; // Example error state

    const handleContinue = () => {
        // Navigate to the next step: Phone Number Entry
        navigation.navigate('PhoneNumberEntry');
    };

    return (
        <View className="flex-1 bg-white p-6">
                            <BackButtonHeader/>


            <Text allowFontScaling={false} className="text-2xl font-semibold mb-10 text-black">
                Enter the 5 digit code sent to you at 
                <Text className="font-bold"> {email}</Text>
            </Text>

            <View className="flex-row justify-between mb-8">
                {code.map((digit, index) => (
                    <TextInput
                        key={index}
                        className={`w-1/6 h-16 text-2xl font-bold text-center rounded-lg border-2 ${
                            hasError ? 'border-red-500 text-red-500' : 
                            digit ? 'border-[#CA251B] text-[#CA251B]' : 'border-gray-300'
                        }`}
                        defaultValue={digit}
                        keyboardType="number-pad"
                        maxLength={1}
                    />
                ))}
            </View>

            {hasError && (
                <Text className="text-center text-red-500 font-semibold mb-4">
                    Wrong code ! Please try again
                </Text>
            )}

            <TouchableOpacity 
                className="w-full h-14 bg-[#17213A] rounded-lg justify-center items-center mb-4"
                onPress={handleContinue}
            >
                <Text allowFontScaling={false} className="text-white font-semibold text-lg">Continue</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                className="w-full h-14 border border-[#17213A] rounded-lg justify-center items-center"
                onPress={() => { /* Logic to resend email */ }}
            >
                <Text allowFontScaling={false} className="text-[#17213A] font-semibold text-lg">Resend the code via Email</Text>
            </TouchableOpacity>

        </View>
    );
};

export default VerificationCode;