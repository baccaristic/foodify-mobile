import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

interface BackButtonHeaderProps {
  onPress?: () => void;
  paddingTop?: string;
}

const BackButtonHeader: React.FC<BackButtonHeaderProps> = ({ onPress, paddingTop = 'pt-16' }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      if (navigation.canGoBack()) {
        navigation.goBack();
      }
    }
  };

  return (
    <View className={`${paddingTop} mb-12`}>
      <TouchableOpacity
        className="w-16 h-16 px-8 py-8 items-center justify-center rounded-full border border-[#CA251B]"
        onPress={handlePress}
      >
        <ArrowLeft color="#CA251B" size={24} />
      </TouchableOpacity>
    </View>
  );
};

export default BackButtonHeader;