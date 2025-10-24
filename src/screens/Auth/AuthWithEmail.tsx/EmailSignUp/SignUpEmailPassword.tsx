import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import BackButtonHeader from '~/components/BackButtonHeader';
import AuthBackground from '~/components/AuthBackGround';
import { useTranslation } from '~/localization';

const SignUpEmailPassword = () => {
    const navigation = useNavigation();
    const { t } = useTranslation();

    const handleContinue = () => {
        if (!isFormValid) {
            return;
        }
        navigation.navigate('EmailVerificationCode');
    };

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');


    const isFormValid =
        email.trim().length > 0 &&
        password.trim().length > 0 &&
        confirmPassword.trim().length > 0 &&
        password === confirmPassword;

    const buttonBgClass = isFormValid ? 'bg-[#17213A]' : 'bg-gray-400';


    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View className="flex-1 bg-white  ">
                <View className='p-6 flex1 py-0'>

                    <BackButtonHeader />

                    <Text allowFontScaling={false} className="text-2xl font-semibold mb-8 text-black">
                        {t('auth.email.signup.emailPassword.emailLabel')}
                    </Text>

                    <TextInput
                        className="w-full h-14 bg-gray-200 rounded-lg px-4 mb-6 text-black"
                        placeholder={t('auth.email.signup.emailPassword.emailPlaceholder')}
                        placeholderTextColor="#999"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        onChangeText={setEmail}
                        value={email}
                    />

                    <Text allowFontScaling={false} className="text-2xl font-semibold mb-8 text-black">
                        {t('auth.email.signup.emailPassword.passwordLabel')}
                    </Text>

                    <TextInput
                        className="w-full h-14 bg-gray-200 rounded-lg px-4 mb-6 text-black"
                        placeholder={t('auth.email.signup.emailPassword.passwordPlaceholder')}
                        placeholderTextColor="#999"
                        secureTextEntry={true}
                        onChangeText={setPassword}
                        value={password}
                    />

                    <Text allowFontScaling={false} className="text-2xl font-semibold mb-8 text-black">
                        {t('auth.email.signup.emailPassword.confirmLabel')}
                    </Text>

                    <TextInput
                        className="w-full h-14 bg-gray-200 rounded-lg px-4 mb-10 text-black"
                        placeholder={t('auth.email.signup.emailPassword.confirmPlaceholder')}
                        placeholderTextColor="#999"
                        secureTextEntry={true}
                        onChangeText={setConfirmPassword}
                        value={confirmPassword}
                    />

                    <TouchableOpacity
                        className={`w-full h-14  rounded-lg justify-center items-center mb-6 ${buttonBgClass}`}
                        onPress={handleContinue}
                        disabled={!isFormValid}
                    >
                        <Text allowFontScaling={false} className="text-white font-semibold text-lg">{t('common.continue')}</Text>
                    </TouchableOpacity>

                    <View className="flex-row items-center justify-center w-full">
                        <Text allowFontScaling={false} className="text-base text-gray-600">
                            {t('auth.email.signup.emailPassword.prompt.message')}
                        </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text allowFontScaling={false} className="text-base font-semibold ml-1 text-[#CA251B]" >
                                {t('auth.email.signup.emailPassword.prompt.cta')}
                            </Text>
                        </TouchableOpacity>
                    </View>

                </View>
                <View>
                    <AuthBackground />
                </View>
            </View>

        </TouchableWithoutFeedback>
    );
};

export default SignUpEmailPassword;