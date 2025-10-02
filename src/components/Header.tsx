import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ArrowLeft, ChevronDown } from "lucide-react-native";

import useLocationOverlay from '~/hooks/useLocationOverlay';

interface HeaderProps {
  title: string;
  onBack?: () => void;
  onLocationPress?: () => void;
  compact?: boolean;
}

export default function Header({
  title,
  onBack,
  onLocationPress,
  compact = false,
}: HeaderProps) {
  const { open } = useLocationOverlay();

  const handleLocationPress = () => {
    open();
    onLocationPress?.();
  };

  return (
    <View className={compact ? "px-3 py-1" : "px-5 py-5"}>
      <View className="flex-row items-center justify-between">
        <TouchableOpacity
          onPress={onBack}
          className="items-center justify-center rounded-full border-2 border-white/40 p-2"
        >
          <ArrowLeft color="white" size={20} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleLocationPress}
          className="mx-auto max-w-[70%] flex-row items-center gap-2"
        >
          <Text
            allowFontScaling={false}
            className="truncate text-lg font-semibold text-white"
            numberOfLines={1}
          >
            {title}
          </Text>
          <ChevronDown color="white" size={20} />
        </TouchableOpacity>
      </View>
    </View>
  );
}
