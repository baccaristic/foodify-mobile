import { View, TouchableOpacity, Text, StyleProp, ViewStyle } from "react-native";


export interface FixedOrderBarProps {
    total: string;
    onSeeCart: () => void;
    style?: StyleProp<ViewStyle>;
    buttonLabel?: string;
}

const FixedOrderBar: React.FC<FixedOrderBarProps> = ({ total, onSeeCart, style, buttonLabel = "See my Cart" }) => (
    <View className="absolute left-0 right-0 bg-white px-4 py-3 flex-row justify-between shadow-lg  overflow-hidden items-center z-50" style={style}>
        <Text allowFontScaling={false} className="text-[#CA251B] text-base font-bold">Order : {total}</Text>
        <TouchableOpacity 
            onPress={onSeeCart}
            className="bg-[#CA251B] rounded-lg px-8 py-2"
        >
            <Text allowFontScaling={false} className="text-white text-base font-['roboto']">{buttonLabel}</Text>
        </TouchableOpacity>
    </View>
);

export default FixedOrderBar;