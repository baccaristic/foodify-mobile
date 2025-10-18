import React from 'react';
import { View, TouchableOpacity, Text, StyleProp, ViewStyle } from 'react-native';

import { useCart } from '~/context/CartContext';
import { useTranslation } from '~/localization';

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
  buttonLabel,
  disabled,
}) => {
  const { subtotal, itemCount: cartItemCount } = useCart();
  const { t } = useTranslation();

  const computedTotal = Number.isFinite(total ?? subtotal) ? (total ?? subtotal) : 0;
  const computedCount = itemCount ?? cartItemCount;
  const isDisabled = disabled ?? computedCount === 0;
  const baseOrderLabel =
    computedCount > 0
      ? t('fixedOrderBar.orderWithCount', { values: { count: computedCount } })
      : t('fixedOrderBar.order');
  const orderSummary = t('fixedOrderBar.orderSummary', {
    values: { order: baseOrderLabel, total: formatTotal(computedTotal) },
  });
  const resolvedButtonLabel = buttonLabel ?? t('fixedOrderBar.seeCart');

  return (
    <View
      className="absolute left-0 right-0 z-50 flex-row items-center justify-between bg-white px-4 py-3 shadow-lg"
      style={style}>
      <Text allowFontScaling={false} className="text-base font-bold text-[#CA251B]">
        {orderSummary}
      </Text>
      <TouchableOpacity
        onPress={onSeeCart}
        className={`${isDisabled ? 'bg-gray-300' : 'bg-[#CA251B]'} rounded-lg px-8 py-2`}
        disabled={isDisabled}>
        <Text
          allowFontScaling={false}
          className={`text-base font-['roboto'] ${isDisabled ? 'text-gray-500' : 'text-white'}`}>
          {resolvedButtonLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default FixedOrderBar;
