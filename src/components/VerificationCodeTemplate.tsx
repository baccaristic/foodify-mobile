import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackButtonHeader from './BackButtonHeader'; 

interface VerificationCodeTemplateProps {
    contact: string; 
    nextScreen: string; 
    resendMethod: 'Email' | 'SMS'; 
    onResendPress: () => void; 
    codeLength?: number; 
}

const VerificationCodeTemplate: React.FC<VerificationCodeTemplateProps> = ({
    contact,
    nextScreen,
    resendMethod,
    onResendPress,
    codeLength = 5,
}) => {
    const navigation = useNavigation();
    
    const [code, setCode] = useState<string[]>(Array(codeLength).fill(''));
    const [hasError, setHasError] = useState(false); 
    
    const inputRefs = Array(codeLength).fill(0).map(() => React.createRef<TextInput>());

    const isFormValid = code.every(digit => digit.length === 1);

    const buttonBgClass = isFormValid ? 'bg-[#17213A]' : 'bg-gray-400';

    const handleCodeChange = (text: string, index: number) => {
        setHasError(false); 
        
        const newCode = [...code];
        
        newCode[index] = text.slice(0, 1);
        setCode(newCode);

        if (text.length === 1 && index < codeLength - 1) {
            inputRefs[index + 1].current?.focus();
        } 
        else if (text.length === 0 && index > 0) {
             inputRefs[index - 1].current?.focus();
        }
    };
    
    const handleContinue = () => {
        if (!isFormValid) {
            return;
        }
        

        
        navigation.navigate(nextScreen as never);

    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
           
                <View className="flex-1 bg-white p-6">
                <BackButtonHeader/>

                <Text allowFontScaling={false} className="text-2xl font-semibold mb-10 text-black">
                    Enter the {codeLength} digit code sent to you at 
                    <Text className="font-bold"> {contact}</Text>
                </Text>

                <View className="flex-row justify-between mb-4">
                    {code.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={inputRefs[index]}
                            className={`w-[18%] h-16 text-2xl font-bold text-center rounded-lg border-2 text-black
                                ${
                                    hasError ? 'border-red-500 text-red-500' : 
                                    digit ? 'border-[#CA251B] text-[#CA251B]' : 'border-gray-300'
                                }
                            `}
                            onChangeText={(text) => handleCodeChange(text, index)}
                            value={digit}
                            keyboardType="number-pad"
                            maxLength={1}
                            autoFocus={index === 0 && code[0] === ''} 
                        />
                    ))}
                </View>

                {hasError && (
                    <Text className="text-center text-red-500 font-semibold mb-4">
                        Wrong code ! Please try again
                    </Text>
                )}

                <TouchableOpacity 
                    className={`w-full h-14 rounded-lg justify-center items-center mb-4 ${buttonBgClass}`}
                    onPress={handleContinue}
                    disabled={!isFormValid}
                >
                    <Text allowFontScaling={false} className="text-white font-semibold text-lg">Continue</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                    className="w-full h-14 border border-[#17213A] rounded-lg justify-center items-center"
                    onPress={onResendPress}
                >
                    <Text allowFontScaling={false} className="text-[#17213A] font-semibold text-lg">
                        Resend the code via {resendMethod}
                    </Text>
                </TouchableOpacity>

            </View>
        </TouchableWithoutFeedback>
    );
};

export default VerificationCodeTemplate;