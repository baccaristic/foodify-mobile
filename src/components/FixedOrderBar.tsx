import React from 'react';
import { View, TouchableOpacity, Text, StyleProp, ViewStyle } from 'react-native';

import { useCart } from '~/context/CartContext';

const formatTotal = (value: number) =>
  `${(Number.isFinite(value) ? value : 0).toFixed(3).replace('.', ',')} DT`;

export interface FixedOrderBarProps {
  total?: number;
  itemCount?: number;
  onSeeCart: () => void;
  style?: StyleProp<ViewStyle>;
  buttonLabel?: string;
  disabled?: boolean;
}

const FixedOrderBar: React.FC<FixedOrderBarProps> = ({
  total,
  itemCount,
  onSeeCart,
  style,
  buttonLabel = 'See my Cart',
  disabled,
}) => {
  const { subtotal, itemCount: cartItemCount } = useCart();

  const computedTotal = Number.isFinite(total ?? subtotal) ? (total ?? subtotal) : 0;
  const computedCount = itemCount ?? cartItemCount;
  const isDisabled = disabled ?? computedCount === 0;

  return (
    <View
      className="absolute left-0 right-0 z-50 flex-row items-center justify-between bg-white px-4 py-3 shadow-lg"
      style={style}>
      <Text allowFontScaling={false} className="text-base font-bold text-[#CA251B]">
        Order{computedCount > 0 ? ` (${computedCount})` : ''} : {formatTotal(computedTotal)}
      </Text>
      <TouchableOpacity
        onPress={onSeeCart}
        className={`${isDisabled ? 'bg-gray-300' : 'bg-[#CA251B]'} rounded-lg px-8 py-2`}
        disabled={isDisabled}>
        <Text
          allowFontScaling={false}
          className={`text-base font-['roboto'] ${isDisabled ? 'text-gray-500' : 'text-white'}`}>
          {buttonLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default FixedOrderBar;
