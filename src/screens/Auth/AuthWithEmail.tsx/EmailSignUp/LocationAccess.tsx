import { View, Text, TouchableOpacity, Image } from 'react-native';
import BackButtonHeader from '~/components/BackButtonHeader';

const LocationIcon = () => (
    <View className="w-20 h-20 bg-transparent mb-10 items-center justify-center">
        <Image
            source={require('../../../../../assets/map.svg')}
            className="w-full h-full"
            resizeMode="contain"
        />
        <View className="absolute w-12 h-12 bg-red-600 rounded-full opacity-50" />
    </View>
);

const LocationAccess = () => {

    const handleAgree = () => {
    };

    const handleClose = () => {
    };

    return (
        <View className="flex-1 bg-white p-6">
            <BackButtonHeader />
            <LocationIcon />

            <Text allowFontScaling={false} className="text-3xl font-bold mb-4 text-black">
                Allow location access
            </Text>

            <Text allowFontScaling={false} className="text-base text-gray-700 mb-12 leading-relaxed">
                This lets show you which restaurants and stores you can order from.
            </Text>

            <TouchableOpacity
                className="w-full h-14 bg-[#17213A] rounded-lg justify-center items-center mb-4"
                onPress={handleAgree}
            >
                <Text allowFontScaling={false} className="text-white font-semibold text-lg">I Agree</Text>
            </TouchableOpacity>

            <TouchableOpacity
                className="w-full h-14 border border-[#17213A] rounded-lg justify-center items-center"
                onPress={handleClose}
            >
                <Text allowFontScaling={false} className="text-[#17213A] font-semibold text-lg">Close</Text>
            </TouchableOpacity>
        </View>
    );
};

export default LocationAccess;