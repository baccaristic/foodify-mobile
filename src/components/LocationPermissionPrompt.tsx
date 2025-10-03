import { useMemo } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import {Image} from 'expo-image';
import BackButtonHeader from '~/components/BackButtonHeader';

import locationIcon from '../../assets/locationIcon.png';

type LocationPermissionPromptProps = {
  title?: string;
  description?: string;
  agreeLabel?: string;
  closeLabel?: string;
  onAgree: () => void;
  onClose: () => void;
  isProcessing?: boolean;
  errorMessage?: string | null;
  showBackButton?: boolean;
};

const LocationPermissionPrompt = ({
  title = 'Allow location access',
  description = 'This lets us show you which restaurants and stores you can order from.',
  agreeLabel = 'I Agree',
  closeLabel = 'Close',
  onAgree,
  onClose,
  isProcessing = false,
  errorMessage = null,
  showBackButton = true,
}: LocationPermissionPromptProps) => {
  const agreeButtonStyle = useMemo(
    () =>
      `w-full h-14 rounded-lg justify-center items-center mb-4 ${
        isProcessing ? 'opacity-80 bg-[#17213A]' : 'bg-[#17213A]'
      }`,
    [isProcessing],
  );

  return (
    <View className="flex-1 bg-white px-6 pb-6">
      {showBackButton ? <BackButtonHeader /> : <View className="pt-16 mb-12" />}

      <View className="flex-1">
        <View className="w-32 h-32 mb-10 items-center justify-center self-center">
          <Image source={locationIcon} style={StyleSheet.absoluteFillObject} contentFit="contain" />
        </View>

        <Text allowFontScaling={false} className="text-3xl font-bold mb-4 text-black">
          {title}
        </Text>

        <Text allowFontScaling={false} className="text-base text-gray-700 mb-12 leading-relaxed">
          {description}
        </Text>

        {errorMessage ? (
          <Text allowFontScaling={false} className="text-sm text-red-500 mb-4">
            {errorMessage}
          </Text>
        ) : null}
      </View>

      <TouchableOpacity className={agreeButtonStyle} onPress={onAgree} disabled={isProcessing} activeOpacity={0.85}>
        {isProcessing ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text allowFontScaling={false} className="text-white font-semibold text-lg">
            {agreeLabel}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        className="w-full h-14 border border-[#17213A] rounded-lg justify-center items-center"
        onPress={onClose}
        disabled={isProcessing}
        activeOpacity={0.85}
      >
        <Text allowFontScaling={false} className="text-[#17213A] font-semibold text-lg">
          {closeLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LocationPermissionPrompt;
