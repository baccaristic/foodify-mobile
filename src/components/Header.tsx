import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ArrowLeft, ChevronDown } from "lucide-react-native";

interface HeaderProps {
  onBack?: () => void;
  onLocationPress?: () => void;
}

export default function Header({
  onBack,
  onLocationPress,
}: HeaderProps) {
  return (
    <View className="px-5 py-5 flex-row items-center justify-between relative">
      {/* Back Button */}
      <TouchableOpacity
        onPress={onBack}
        className="rounded-full border-2 border-white/40 items-center justify-center p-2"
      >
        <ArrowLeft color="white" size={20} />
      </TouchableOpacity>

      {/* Location */}
      <TouchableOpacity
        onPress={onLocationPress}
        className="flex-row items-center gap-2 px-5 py-3 max-w-[70%]"
      >
        <Text
          className="text-white truncate"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          Av. 8 New York, City
        </Text>
        <ChevronDown color="white" size={20} />
      </TouchableOpacity>
    </View>
  );
}
