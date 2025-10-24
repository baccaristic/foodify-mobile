import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { requestPushNotificationPermissions } from '~/services/notifications';
import AuthBackground from '~/components/AuthBackGround';
import { useTranslation } from '~/localization';

const NotifLogo = () => (
  <View className="w-36 h-36 bg-transparent mb-10">
    <Image
      source={require('assets/notif.png')}
      className="w-full h-full"
      resizeMode="contain"
    />
  </View>
);

type NotificationProps = {
  onComplete?: () => void;
  onSkip?: () => void;
};

const Notification = ({ onComplete, onSkip }: NotificationProps) => {
  const navigation = useNavigation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { t } = useTranslation();

  const NEXT_SCREEN = 'Home';

  const handleEnableNotifications = useCallback(async () => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const result = await requestPushNotificationPermissions();

      if (result.granted) {
        onComplete?.();
        navigation.navigate(NEXT_SCREEN as never);
        return;
      }

      if (result.error) {
        setErrorMessage(result.error);
      } else if (!result.isDevice) {
        setErrorMessage(t('auth.email.signup.notifications.errors.physicalDevice'));
      } else if (!result.canAskAgain) {
        setErrorMessage(t('auth.email.signup.notifications.errors.settings'));
      } else {
        setErrorMessage(t('auth.email.signup.notifications.errors.permission'));
      }
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, navigation, onComplete, t]);

  const handleSkip = () => {
    onSkip?.();
    navigation.navigate(NEXT_SCREEN as never);
  };

  return (
    <View className="flex-1 bg-white  justify-between pt-20 pb-10">
      <View className='p-6 flex1'>

        <View className="items-center px-4">
          <NotifLogo />

          <Text allowFontScaling={false} className="text-3xl mb-4 text-black text-center">
            {t('auth.email.signup.notifications.title')}
          </Text>

          <Text
            allowFontScaling={false}
            className="text-base text-gray-700 leading-relaxed mb-12 text-center"
          >
            {t('auth.email.signup.notifications.description')}
          </Text>

          <TouchableOpacity
            className={`w-full h-14 bg-[#17213A] rounded-lg justify-center items-center mb-4 ${isProcessing ? 'opacity-70' : ''
              }`}
            onPress={handleEnableNotifications}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text allowFontScaling={false} className="text-white font-semibold text-lg">
                {t('auth.email.signup.notifications.enableCta')}
              </Text>
            )}
          </TouchableOpacity>

          {errorMessage ? (
            <Text allowFontScaling={false} className="text-sm text-red-500 text-center mb-4">
              {errorMessage}
            </Text>
          ) : null}

          <TouchableOpacity
            className="w-full h-14 rounded-lg justify-center items-center"
            onPress={handleSkip}
            disabled={isProcessing}
          >
            <Text allowFontScaling={false} className="text-gray-600 font-semibold text-lg">
              {t('auth.email.signup.notifications.skipCta')}
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

export default Notification;
