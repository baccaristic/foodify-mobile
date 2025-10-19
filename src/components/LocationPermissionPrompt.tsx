import { useMemo } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import BackButtonHeader from '~/components/BackButtonHeader';
import locationIcon from '../../assets/locationIcon.png';
import AuthBackground from './AuthBackGround';
import { useTranslation } from '~/localization';

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
  title,
  description,
  agreeLabel,
  closeLabel,
  onAgree,
  onClose,
  isProcessing = false,
  errorMessage = null,
  showBackButton = true,
}: LocationPermissionPromptProps) => {
  const { t } = useTranslation();
  const agreeButtonStyle = useMemo(
    () =>
      `w-full h-14 rounded-lg justify-center items-center mb-4 ${isProcessing ? 'opacity-80 bg-[#17213A]' : 'bg-[#17213A]'
      }`,
    [isProcessing],
  );

  const resolvedTitle = title ?? t('locationPermission.prompt.title');
  const resolvedDescription = description ?? t('locationPermission.prompt.description');
  const resolvedAgreeLabel = agreeLabel ?? t('locationPermission.prompt.agree');
  const resolvedCloseLabel = closeLabel ?? t('common.close');

  return (
    <View className="flex-1 bg-white ">
      <View className='p-6 flex1'>

        {/* Header */}
        {showBackButton ? <BackButtonHeader /> : <View className="pt-16 mb-12" />}

        {/* Main content */}
        <View className="items-center">
          {/* Icon */}
          <View className="w-32 h-32 mb-10 items-center justify-center">
            <Image source={locationIcon} style={StyleSheet.absoluteFillObject} contentFit="contain" />
          </View>

          {/* Title */}
          <Text allowFontScaling={false} className="text-3xl font-bold mb-4 text-black text-center">
            {resolvedTitle}
          </Text>

          {/* Description */}
          <Text
            allowFontScaling={false}
            className="text-base text-gray-700 mb-6 leading-relaxed text-center"
          >
            {resolvedDescription}
          </Text>

          {/* Error message */}
          {errorMessage ? (
            <Text allowFontScaling={false} className="text-sm text-red-500 mb-4 text-center">
              {errorMessage}
            </Text>
          ) : null}

          {/* Buttons directly under text */}
          <TouchableOpacity
            className={agreeButtonStyle}
            onPress={onAgree}
            disabled={isProcessing}
            activeOpacity={0.85}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text allowFontScaling={false} className="text-white font-semibold text-lg">
                {resolvedAgreeLabel}
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
              {resolvedCloseLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View>
        <AuthBackground />
      </View>
    </View>
  );
};

export default LocationPermissionPrompt;
