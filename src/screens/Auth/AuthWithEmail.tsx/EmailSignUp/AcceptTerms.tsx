import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';

import BackButtonHeader from '~/components/BackButtonHeader';
import AuthBackground from '~/components/AuthBackGround';
import useEmailSignup from '~/hooks/useEmailSignup';
import { getErrorMessage } from '~/helper/apiError';
import { useTranslation } from '~/localization';
import { getRouteForEmailSignupStep } from './stepRoutes';

const FoodifyLogo = () => (
  <View className="w-36 h-20 bg-transparent mb-10 ">
    <Image
      source={require('assets/logo.png')}
      className="w-full h-full"
      resizeMode="contain"
    />
    <View />
  </View>
);

const AcceptTerms = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { state, acceptTerms } = useEmailSignup();
  const { t } = useTranslation();

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!state) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignUpEmailPassword' }],
      });
      return;
    }

    if (state.completed || (state.accessToken && state.refreshToken && state.user)) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
      return;
    }

    if (!state.profileProvided) {
      navigation.navigate('NameEntry' as never);
      return;
    }

    if (state.nextStep !== 'ACCEPT_LEGAL_TERMS') {
      const nextRoute = getRouteForEmailSignupStep(state.nextStep);
      if (nextRoute && nextRoute !== 'AcceptTerms') {
        navigation.navigate(nextRoute as never);
      }
    }
  }, [navigation, state]);

  const handleAgree = async () => {
    if (!state || isSubmitting) {
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await acceptTerms();
    } catch (err) {
      const message = getErrorMessage(err, t('auth.email.signup.acceptTerms.errors.generic'));
      setError(message);
      setIsSubmitting(false);
    }
  };

  if (!state || !state.profileProvided) {
    return null;
  }

  return (
    <View className="flex-1 bg-white ">
      <View className='p-6 flex1'>
        <BackButtonHeader />

        <FoodifyLogo />

        <Text allowFontScaling={false} className="text-3xl font-bold mb-4 text-black">
          {t('auth.common.terms.title')}
        </Text>

        <Text allowFontScaling={false} className="text-base text-gray-700 mb-12 leading-relaxed">
          {t('auth.common.terms.description', { values: { terms: '<terms>', privacy: '<privacy>' } })
            .split(/(<terms>|<privacy>)/)
            .map((segment, index) => {
              if (segment === '<terms>') {
                return (
                  <Text allowFontScaling={false} key={`terms-${index}`} className="text-[#CA251B]">
                    {t('auth.common.terms.termsLabel')}
                  </Text>
                );
              }
              if (segment === '<privacy>') {
                return (
                  <Text allowFontScaling={false} key={`privacy-${index}`} className="text-[#CA251B]">
                    {t('auth.common.terms.privacyLabel')}
                  </Text>
                );
              }
              return <Text allowFontScaling={false} key={`segment-${index}`}>{segment}</Text>;
            })}
        </Text>

        {error ? (
          <Text allowFontScaling={false} className="text-sm text-red-500 mb-4">
            {error}
          </Text>
        ) : null}

        <TouchableOpacity
          className={`w-full h-14 ${isSubmitting ? 'bg-gray-400' : 'bg-[#17213A]'} rounded-lg justify-center items-center`}
          onPress={handleAgree}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text allowFontScaling={false} className="text-white font-semibold text-lg">
              {t('auth.common.terms.agreeCta')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
      <View>
        <AuthBackground />
      </View>
    </View>
  );
};

export default AcceptTerms;
