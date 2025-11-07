import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { useLocalization } from '~/localization';

interface BackButtonHeaderProps {
  onPress?: () => void;
  paddingTop?: string;
}

const BackButtonHeader: React.FC<BackButtonHeaderProps> = ({ onPress, paddingTop = 'pt-16' }) => {
  const navigation = useNavigation();
  const { isRTL } = useLocalization();

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
        {isRTL ? (
          <ArrowRight color="#CA251B" size={38} />
        ) : (
          <ArrowLeft color="#CA251B" size={38} />
        )}
      </TouchableOpacity>
    </View>
  );
};

export default BackButtonHeader;