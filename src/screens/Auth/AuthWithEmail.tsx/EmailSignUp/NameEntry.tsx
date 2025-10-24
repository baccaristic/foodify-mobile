import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import BackButtonHeader from '~/components/BackButtonHeader';
import AuthBackground from '~/components/AuthBackGround';
import { useTranslation } from '~/localization';

const NameEntry = () => {
    const navigation = useNavigation();
    const { t } = useTranslation();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const handleContinue = () => {
        if (!isFormValid) {
            return;
        }
        navigation.navigate('AcceptTerms');
    };

    const isFormValid = firstName.trim().length > 0 && lastName.trim().length > 0;
    const buttonBgClass = isFormValid ? 'bg-[#17213A]' : 'bg-gray-400';

    return (
        <View className="flex-1 bg-white ">
            <View className='p-6 flex1'>

                <BackButtonHeader />

                <Text allowFontScaling={false} className="text-3xl font-bold mb-8 text-black">
                    {t('auth.email.signup.name.title')}
                </Text>

                <TextInput
                    className="w-full h-14 bg-gray-300 rounded-lg px-4 mb-4 text-black"
                    placeholder={t('auth.email.signup.name.firstNamePlaceholder')}
                    placeholderTextColor="#666"
                    autoCapitalize="words"
                    onChangeText={setFirstName}
                    value={firstName}
                />

                <TextInput
                    className="w-full h-14 bg-gray-300 rounded-lg px-4 mb-10 text-black"
                    placeholder={t('auth.email.signup.name.lastNamePlaceholder')}
                    placeholderTextColor="#666"
                    autoCapitalize="words"
                    onChangeText={setLastName}
                    value={lastName}
                />

                <TouchableOpacity
                    className={`w-full h-14 rounded-lg justify-center items-center ${buttonBgClass}`}
                    onPress={handleContinue}
                    disabled={!isFormValid}
                >
                    <Text allowFontScaling={false} className="text-white font-semibold text-lg">{t('common.continue')}</Text>
                </TouchableOpacity>
            </View>
            <View>
                <AuthBackground />
            </View>
        </View>
    );
};

export default NameEntry;
