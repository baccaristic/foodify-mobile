import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import BackButtonHeader from '~/components/BackButtonHeader';
import AuthBackground from '~/components/AuthBackGround';
import { useTranslation } from '~/localization';

const FoodifyLogo = () => (
    <View className="w-36 h-20 bg-transparent mb-10 ">
        <Image
            source={require('assets/logo.png')}
            className="w-full h-full"
            resizeMode="contain"
        />
        <View />
    </View>
);

const AcceptTerms = () => {
    const navigation = useNavigation();
    const { t } = useTranslation();

    const handleAgree = () => {
        navigation.navigate('LocationAccess');
    };

    return (
        <View className="flex-1 bg-white ">
            <View className='p-6 flex1'>

                <BackButtonHeader />


                <FoodifyLogo />

                <Text allowFontScaling={false} className="text-3xl font-bold mb-4 text-black">
                    {t('auth.common.terms.title')}
                </Text>

                <Text allowFontScaling={false} className="text-base text-gray-700 mb-12 leading-relaxed">
                    {t('auth.common.terms.description', { values: { terms: '<terms>', privacy: '<privacy>' } })
                        .split(/(<terms>|<privacy>)/)
                        .map((segment, index) => {
                            if (segment === '<terms>') {
                                return (
                                    <Text key={`terms-${index}`} className="text-[#CA251B]">
                                        {t('auth.common.terms.termsLabel')}
                                    </Text>
                                );
                            }
                            if (segment === '<privacy>') {
                                return (
                                    <Text key={`privacy-${index}`} className="text-[#CA251B]">
                                        {t('auth.common.terms.privacyLabel')}
                                    </Text>
                                );
                            }
                            return <Text key={`segment-${index}`}>{segment}</Text>;
                        })}
                </Text>

                <TouchableOpacity
                    className="w-full h-14 bg-[#17213A] rounded-lg justify-center items-center"
                    onPress={handleAgree}
                >
                    <Text allowFontScaling={false} className="text-white font-semibold text-lg">
                        {t('auth.common.terms.agreeCta')}
                    </Text>
                </TouchableOpacity>
            </View>
            <View>
                <AuthBackground />
            </View>
        </View>
    );
};

export default AcceptTerms;