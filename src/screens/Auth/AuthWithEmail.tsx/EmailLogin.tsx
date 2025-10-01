import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation, NavigationProp, ParamListBase } from '@react-navigation/native';

const EmailLogin = () => {
    const navigation = useNavigation<NavigationProp<ParamListBase>>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const isFormValid = email.trim().length > 0 && password.trim().length > 0;
    const buttonBgClass = isFormValid ? 'bg-[#17213A]' : 'bg-gray-400';

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View className="flex-1 bg-white p-6">

                <View className="pt-16 mb-8">
                    <TouchableOpacity
                        className="w-16 h-16 px-8 py-8 items-center justify-center rounded-full border border-[#CA251B]"
                        onPress={() => navigation.goBack()}>

                        <ArrowLeft color="#CA251B" size={38} />
                    </TouchableOpacity>
                </View>

                <View className="pt-6 ">

                    <Text allowFontScaling={false} className="text-xl font-medium mb-2 text-black">
                        Enter your e-mail address
                    </Text>

                    <TextInput
                        className="w-full h-14 bg-gray-100 rounded-lg px-4 mb-6 text-black border border-gray-200"
                        placeholder="Your email eg.yourmail@email.com"
                        placeholderTextColor="#a0a0a0"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        returnKeyType="next"
                        onSubmitEditing={Keyboard.dismiss}
                        onChangeText={setEmail}
                        value={email}
                    />

                    <Text allowFontScaling={false} className="text-xl font-medium mb-2 text-[#17213A]">
                        Enter your password
                    </Text>

                    <TextInput
                        className="w-full h-14 bg-gray-100 rounded-lg px-4 mb-8 text-[#17213A] border border-gray-200"
                        placeholder="password"
                        placeholderTextColor="#a0a0a0"
                        secureTextEntry={true}
                        keyboardType="default"
                        returnKeyType="done"
                        onSubmitEditing={Keyboard.dismiss}
                        onChangeText={setPassword}
                        value={password}
                    />

                    <TouchableOpacity
                        className={`w-full h-14 rounded-lg justify-center items-center mb-6 ${buttonBgClass}`}
                        disabled={!isFormValid}
                    >
                        <Text allowFontScaling={false} className="text-white font-semibold text-lg">Continue</Text>
                    </TouchableOpacity>

                    <View className="flex-row items-center justify-center w-full">
                        <Text allowFontScaling={false} className="text-base text-[#17213A] font-['Roboto']">
                            you don&apos;t have an account?
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('SignUpEmailPassword')}>
                            <Text allowFontScaling={false} className="text-base font-semibold ml-1 text-[#CA251B]" >
                                Sign up
                            </Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </View>
        </TouchableWithoutFeedback>
    );
};

export default EmailLogin;
