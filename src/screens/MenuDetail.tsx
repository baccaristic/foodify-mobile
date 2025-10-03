import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { X, Heart, Check, Plus, Minus, ArrowLeft } from 'lucide-react-native';
import { Image } from 'expo-image';
import MainLayout from '~/layouts/MainLayout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type {
  RestaurantMenuItemDetails,
  RestaurantMenuItemExtra,
  RestaurantMenuOptionGroup,
} from '~/interfaces/Restaurant';
import { BASE_API_URL } from '@env';

const { width } = Dimensions.get('window');
const primaryColor = '#CA251B';

interface CartItemDetails {
  quantity: number;
  total: number;
}

interface MenuDetailProps {
  menuItem: RestaurantMenuItemDetails;
  handleAddItem: (itemDetails: CartItemDetails) => void;
  onClose?: () => void;
}

interface OptionRowProps {
  group: RestaurantMenuOptionGroup;
  extra: RestaurantMenuItemExtra;
  isSelected: boolean;
  isLast: boolean;
  onToggle: (group: RestaurantMenuOptionGroup, extra: RestaurantMenuItemExtra) => void;
}

const formatPrice = (p: number) => `${p.toFixed(3).replace('.', ',')} DT`;

const resolveImageSource = (imagePath?: string | null) => {
  if (imagePath) {
    return { uri: `${BASE_API_URL}/auth/image/${imagePath}` };
  }
  return require('../../assets/baguette.png');
};

const OptionRow: React.FC<OptionRowProps> = ({ group, extra, isSelected, isLast, onToggle }) => (
  <TouchableOpacity
    onPress={() => onToggle(group, extra)}
    className={`flex-row items-center justify-between py-3 ${isLast ? '' : 'border-b border-gray-100'}`}>
    <View className="flex-1">
      <Text
        allowFontScaling={false}
        className={`text-base font-semibold ${isSelected ? 'text-[#CA251B]' : 'text-gray-800'}`}>
        {extra.name}
      </Text>
      {extra.price > 0 ? (
        <Text allowFontScaling={false} className="mt-1 text-sm font-medium text-gray-500">
          +{formatPrice(extra.price)}
        </Text>
      ) : null}
    </View>

    <View
      className={`h-8 w-8 items-center justify-center rounded-full ${
        isSelected ? 'bg-[#CA251B]' : 'bg-[#FDE7E5]'
      }`}>
      {isSelected ? <Check size={18} color="white" /> : <Plus size={18} color={primaryColor} />}
    </View>
  </TouchableOpacity>
);

const describeGroupSelection = (group: RestaurantMenuOptionGroup) => {
  if (group.minSelect > 0 && group.maxSelect > 0) {
    if (group.minSelect === group.maxSelect) {
      return `Choose ${group.minSelect} ${group.minSelect === 1 ? 'item' : 'items'}`;
    }
    return `Choose ${group.minSelect}-${group.maxSelect} items`;
  }

  if (group.minSelect > 0) {
    return `Choose at least ${group.minSelect} ${group.minSelect === 1 ? 'item' : 'items'}`;
  }

  if (group.maxSelect > 0) {
    return `Choose up to ${group.maxSelect} ${group.maxSelect === 1 ? 'item' : 'items'}`;
  }

  return 'Choose any item';
};

const buildInitialSelection = (item: RestaurantMenuItemDetails) => {
  const selections: Record<number, number[]> = {};

  item.optionGroups.forEach((group) => {
    const defaults = group.extras.filter((extra) => extra.defaultOption).map((extra) => extra.id);

    if (defaults.length > 0) {
      selections[group.id] = defaults;
      return;
    }

    if (group.required && group.minSelect > 0) {
      selections[group.id] = group.extras.slice(0, group.minSelect).map((extra) => extra.id);
      return;
    }

    selections[group.id] = [];
  });

  return selections;
};

const calculateExtrasTotal = (
  optionGroups: RestaurantMenuOptionGroup[],
  selections: Record<number, number[]>
) =>
  optionGroups.reduce((sum, group) => {
    const selectedIds = selections[group.id] ?? [];
    const groupTotal = group.extras.reduce((groupSum, extra) => {
      if (selectedIds.includes(extra.id)) {
        return groupSum + extra.price;
      }
      return groupSum;
    }, 0);
    return sum + groupTotal;
  }, 0);

const isSelectionValid = (
  optionGroups: RestaurantMenuOptionGroup[],
  selections: Record<number, number[]>
) =>
  optionGroups.every((group) => {
    const selectedCount = selections[group.id]?.length ?? 0;
    const minRequired = group.required ? Math.max(group.minSelect, 1) : group.minSelect;
    return selectedCount >= minRequired;
  });

const MenuDetail: React.FC<MenuDetailProps> = ({ menuItem, handleAddItem, onClose }) => {
  const insets = useSafeAreaInsets();

  const [quantity, setQuantity] = useState(1);
  const [selections, setSelections] = useState<Record<number, number[]>>(() => buildInitialSelection(menuItem));

  useEffect(() => {
    setQuantity(1);
    setSelections(buildInitialSelection(menuItem));
  }, [menuItem]);

  const toggleExtra = (group: RestaurantMenuOptionGroup, extra: RestaurantMenuItemExtra) => {
    setSelections((prev) => {
      const current = prev[group.id] ?? [];
      const isSelected = current.includes(extra.id);

      if (isSelected) {
        const minRequired = group.required ? Math.max(group.minSelect, 1) : group.minSelect;
        if (current.length <= minRequired) {
          return prev;
        }
        return {
          ...prev,
          [group.id]: current.filter((id) => id !== extra.id),
        };
      }

      if (group.maxSelect > 0 && current.length >= group.maxSelect) {
        return prev;
      }

      return {
        ...prev,
        [group.id]: [...current, extra.id],
      };
    });
  };

  const extrasTotal = useMemo(
    () => calculateExtrasTotal(menuItem.optionGroups, selections),
    [menuItem.optionGroups, selections]
  );

  const itemTotal = useMemo(() => (menuItem.price + extrasTotal) * quantity, [menuItem.price, extrasTotal, quantity]);

  const canAddToCart = useMemo(
    () => isSelectionValid(menuItem.optionGroups, selections),
    [menuItem.optionGroups, selections]
  );

  const handleAdd = () => {
    if (!canAddToCart) {
      return;
    }
    handleAddItem({ quantity, total: itemTotal });
  };

  const detailHeader = (
    <View>
      <Image source={resolveImageSource(menuItem.imageUrl)} style={{ width, height: '100%' }} contentFit="cover" />
      <View className="absolute left-4 top-8">
        <TouchableOpacity className="rounded-full bg-white p-2" onPress={onClose}>
          <X size={20} color={primaryColor} />
        </TouchableOpacity>
      </View>
      <View className="absolute right-4 top-8">
        <TouchableOpacity className="rounded-full bg-white p-2">
          <Heart size={20} color={primaryColor} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const collapsedHeader = (
    <View className="flex-1 flex-row items-center justify-center bg-white px-4">
      <TouchableOpacity className="p-2" onPress={onClose}>
        <ArrowLeft size={20} color={primaryColor} />
      </TouchableOpacity>
      <Text allowFontScaling={false} className="flex-1 text-center text-lg font-bold text-gray-800">
        {menuItem.name}
      </Text>
      <TouchableOpacity className="p-2">
        <Heart size={20} color={primaryColor} />
      </TouchableOpacity>
    </View>
  );

  const mainContent = (
    <ScrollView className="-mt-4 rounded-t-2xl bg-white px-4 pt-4" contentContainerStyle={{ paddingBottom: 120 }}>
      <Text allowFontScaling={false} className="mt-2 text-3xl font-bold text-[#17213A]">
        {menuItem.name}
      </Text>
      <Text allowFontScaling={false} className="mt-1 text-xl font-bold text-[#CA251B]">
        {formatPrice(menuItem.price)}
      </Text>
      {menuItem.description ? (
        <Text allowFontScaling={false} className="mt-2 mb-4 text-sm text-[#17213A]">
          {menuItem.description}
        </Text>
      ) : null}

      {menuItem.tags?.length ? (
        <View className="mb-4 flex-row flex-wrap gap-2">
          {menuItem.tags.map((tag) => (
            <View key={tag} className="rounded-full bg-[#FDE7E5] px-3 py-1">
              <Text allowFontScaling={false} className="text-xs font-semibold text-[#CA251B]">
                {tag}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      {menuItem.optionGroups.map((group) => (
        <View key={group.id} className="mb-8">
          <Text allowFontScaling={false} className="text-xl font-bold text-[#17213A]">
            {group.name}
          </Text>
          <View className="mt-2 flex-row items-center gap-2">
            <Text allowFontScaling={false} className="text-sm text-gray-600">
              {describeGroupSelection(group)}
            </Text>
            <View
              className={`rounded-full px-2 py-1 ${group.required ? 'bg-[#CA251B]' : 'bg-gray-200'}`}>
              <Text
                allowFontScaling={false}
                className={`text-xs font-semibold uppercase ${group.required ? 'text-white' : 'text-gray-700'}`}>
                {group.required ? 'Required' : 'Optional'}
              </Text>
            </View>
          </View>

          <View className="mt-4 rounded-2xl border border-gray-100 bg-white">
            {group.extras.map((extra, index) => (
              <View key={extra.id} className="px-3">
                <OptionRow
                  group={group}
                  extra={extra}
                  isSelected={(selections[group.id] ?? []).includes(extra.id)}
                  isLast={index === group.extras.length - 1}
                  onToggle={toggleExtra}
                />
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const orderBar = (
    <View style={{ paddingBottom: insets.bottom }} className="absolute bottom-0 left-0 right-0 w-full border-t border-gray-100 bg-white p-4 shadow-2xl">
      <View className="mb-4 flex-row items-center justify-center">
        <TouchableOpacity
          onPress={() => setQuantity((q) => Math.max(1, q - 1))}
          className={`rounded-full border border-[#CA251B] p-2 ${quantity > 1 ? 'bg-[#CA251B]' : 'bg-transparent'}`}
          disabled={quantity <= 1}>
          <Minus size={24} color={quantity > 1 ? 'white' : primaryColor} />
        </TouchableOpacity>
        <Text allowFontScaling={false} className="mx-6 text-2xl font-bold">
          {quantity}
        </Text>
        <TouchableOpacity onPress={() => setQuantity((q) => q + 1)} className="rounded-full border border-[#CA251B] bg-[#CA251B] p-2">
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className={`w-full rounded-xl py-4 shadow-lg ${canAddToCart ? 'bg-[#CA251B]' : 'bg-gray-300'}`}
        onPress={handleAdd}
        disabled={!canAddToCart}>
        <Text allowFontScaling={false} className="text-center text-lg font-bold text-white">
          Add {quantity} for {formatPrice(itemTotal)}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <MainLayout
        showHeader
        showFooter={false}
        customHeader={detailHeader}
        collapsedHeader={collapsedHeader}
        mainContent={mainContent}
        headerMaxHeight={160}
        headerMinHeight={140}
      />
      {orderBar}
    </View>
  );
};

export default MenuDetail;
