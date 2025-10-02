import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import BackButtonHeader from '~/components/BackButtonHeader';

const FoodifyLogo = () => (
    <View className="w-20 h-20 bg-transparent mb-10 items-center justify-center">
        <Image
            
            className="w-full h-full"
            resizeMode="contain"
        />
        <View className="absolute w-12 h-12 bg-red-600 rounded-full opacity-50" />
    </View>
);

const AcceptTerms = () => {
    const navigation = useNavigation();

    const handleAgree = () => {
        navigation.navigate('LocationAccess');
    };

    return (
        <View className="flex-1 bg-white p-6">
            <BackButtonHeader />


            <FoodifyLogo />

            <Text allowFontScaling={false} className="text-3xl font-bold mb-4 text-black">
                Accept Foodify&apos;s Terms & Review privacy notice
            </Text>

            <Text allowFontScaling={false} className="text-base text-gray-700 mb-12 leading-relaxed">
                By selecting &quot;I agree&quot; below, i have reviewed and agree to the
                <Text className="text-[#CA251B]"> terms of use</Text> and acknowledge the
                <Text className="text-[#CA251B]"> privacy notice</Text>. i am at least 18 years of age.
            </Text>

            <TouchableOpacity
                className="w-full h-14 bg-[#17213A] rounded-lg justify-center items-center"
                onPress={handleAgree}
            >
                <Text allowFontScaling={false} className="text-white font-semibold text-lg">I Agree</Text>
            </TouchableOpacity>
        </View>
    );
};

export default AcceptTerms;