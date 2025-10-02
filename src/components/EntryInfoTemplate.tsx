import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackButtonHeader from './BackButtonHeader'; 

interface EntryInfo {
    title: string;
    inputPlaceholder: string;
    keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
    secureTextEntry?: boolean;
    nextScreen: string;
    inputValue: string;
    setInputValue: (text: string) => void;
    isFormValid: boolean;
}

const EntryInfoTemplate: React.FC<EntryInfo> = ({
    title,
    inputPlaceholder,
    keyboardType = 'default',
    secureTextEntry = false,
    nextScreen,
    inputValue,
    setInputValue,
    isFormValid,
    
}) => {
    const navigation = useNavigation();
    
    const buttonBgClass = isFormValid ? 'bg-[#17213A]' : 'bg-gray-400';

    const handleContinue = () => {
        if (!isFormValid) {
            return;
        }
        navigation.navigate(nextScreen as never);
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View className="flex-1 bg-white p-6">
                
                <BackButtonHeader />

                <Text allowFontScaling={false} className="text-3xl font-bold mb-8 text-black">
                    {title}
                </Text>

                <TextInput
                    className="w-full h-14 bg-gray-300 rounded-lg px-4 mb-10 text-black"
                    placeholder={inputPlaceholder}
                    placeholderTextColor="#666"
                    keyboardType={keyboardType}
                    secureTextEntry={secureTextEntry}
                    onChangeText={setInputValue}
                    value={inputValue}
                />

                <TouchableOpacity 
                    className={`w-full h-14 rounded-lg justify-center items-center ${buttonBgClass} mb-6`}
                    onPress={handleContinue}
                    disabled={!isFormValid}
                >
                    <Text allowFontScaling={false} className="text-white font-semibold text-lg">Continue</Text>
                </TouchableOpacity>


            </View>
        </TouchableWithoutFeedback>
    );
};

export default EntryInfoTemplate;