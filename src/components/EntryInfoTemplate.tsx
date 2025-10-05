import React from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Keyboard,
    TouchableWithoutFeedback,
    ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackButtonHeader from './BackButtonHeader';
import AuthBackground from './AuthBackGround';

interface EntryInfo {
    title: string;
    inputPlaceholder: string;
    keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
    secureTextEntry?: boolean;
    nextScreen?: string;
    inputValue: string;
    setInputValue: (text: string) => void;
    isFormValid: boolean;
    onContinue?: () => void | Promise<void>;
    isSubmitting?: boolean;
    errorMessage?: string | null;
    autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
    autoComplete?: TextInput['props']['autoComplete'];
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
    onContinue,
    isSubmitting = false,
    errorMessage,
    autoCapitalize = 'none',
    autoComplete,

}) => {
    const navigation = useNavigation();

    const buttonBgClass = isFormValid && !isSubmitting ? 'bg-[#17213A]' : 'bg-gray-400';

    const handleContinue = async () => {
        if (!isFormValid || isSubmitting) {
            return;
        }
        if (onContinue) {
            await onContinue();
            return;
        }
        if (nextScreen) {
            navigation.navigate(nextScreen as never);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View className="flex-1 bg-white ">
                <View className='p-6 flex1'>

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
                        editable={!isSubmitting}
                        autoCapitalize={autoCapitalize}
                        autoComplete={autoComplete}
                    />

                    <TouchableOpacity
                        className={`w-full h-14 rounded-lg justify-center items-center ${buttonBgClass} mb-6`}
                        onPress={handleContinue}
                        disabled={!isFormValid || isSubmitting}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#FFFFFF" />
                        ) : (
                            <Text allowFontScaling={false} className="text-white font-semibold text-lg">Continue</Text>
                        )}
                    </TouchableOpacity>

                    {errorMessage ? (
                        <Text allowFontScaling={false} className="text-sm text-red-500 mt-[-10px]">
                            {errorMessage}
                        </Text>
                    ) : null}


                </View>
                <View>
                    <AuthBackground />
                </View>
            </View>

        </TouchableWithoutFeedback>
    );
};

export default EntryInfoTemplate;