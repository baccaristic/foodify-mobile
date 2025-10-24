import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';

import BackButtonHeader from '~/components/BackButtonHeader';
import usePhoneSignup from '~/hooks/usePhoneSignup';
import { getErrorMessage } from '~/helper/apiError';
import AuthBackground from '~/components/AuthBackGround';
import { useTranslation } from '~/localization';

const PhoneAcceptTerms = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { state, acceptTerms } = usePhoneSignup();
  const { t } = useTranslation();

  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasAuthPayload = Boolean(state?.accessToken && state?.refreshToken && state?.user);

  useEffect(() => {
    if (!state) {
      return;
    }

    if (hasAuthPayload) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    }
  }, [hasAuthPayload, navigation, state]);

  useEffect(() => {
    if (!state || !state.nameProvided) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Guest' }],
      });
      return;
    }
    setAccepted(Boolean(state.termsAccepted));
  }, [navigation, state]);

  useEffect(() => {
    if (state?.completed) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    }
  }, [navigation, state?.completed]);

  const handleAccept = async () => {
    if (!state || isSubmitting) {
      return;
    }
    if (!accepted) {
      setError(t('auth.common.errors.mustAcceptTerms'));
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await acceptTerms();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch (err) {
      const message = getErrorMessage(err, t('auth.phone.acceptTerms.errors.generic'));
      setError(message);
      setIsSubmitting(false);
    }
  };

  if (!state || !state.nameProvided) {
    return null;
  }

  return (
    <View className="flex-1 bg-white ">
      <View className='flex-1 p-6'>
      <BackButtonHeader />

      <View className="mt-6 mb-10">
        <Text allowFontScaling={false} className="text-3xl font-bold text-black mb-4">
          {t('auth.common.terms.title')}
        </Text>
        <Text allowFontScaling={false} className="text-base text-gray-700 leading-relaxed">
          {t('auth.common.terms.description', { values: { terms: '<terms>', privacy: '<privacy>' } })
            .split(/(<terms>|<privacy>)/)
            .map((segment, index) => {
              if (segment === '<terms>') {
                return (
                  <Text key={`terms-${index}`} className="text-[#CA251B]">
                    {t('auth.common.terms.termsLabel')}
                  </Text>
                );
              }
              if (segment === '<privacy>') {
                return (
                  <Text key={`privacy-${index}`} className="text-[#CA251B]">
                    {t('auth.common.terms.privacyLabel')}
                  </Text>
                );
              }
              return <Text key={`segment-${index}`}>{segment}</Text>;
            })}
        </Text>
      </View>

      <TouchableOpacity
        className="flex-row items-center mb-6"
        onPress={() => {
          if (!isSubmitting) {
            setAccepted((prev) => !prev);
            setError(null);
          }
        }}
        activeOpacity={0.8}
      >
        <View
          className={`w-6 h-6 mr-3 rounded border-2 ${accepted ? 'bg-[#17213A] border-[#17213A]' : 'border-gray-400'}`}
        />
        <Text allowFontScaling={false} className="text-base text-black">
          {t('auth.common.terms.checkbox')}
        </Text>
      </TouchableOpacity>

      {error ? (
        <Text allowFontScaling={false} className="text-sm text-red-500 mb-4">
          {error}
        </Text>
      ) : null}

      <TouchableOpacity
        className={`w-full h-14 rounded-lg justify-center items-center ${
          accepted && !isSubmitting ? 'bg-[#17213A]' : 'bg-gray-400'
        }`}
        onPress={handleAccept}
        disabled={!accepted || isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text allowFontScaling={false} className="text-white font-semibold text-lg">
            {t('auth.common.terms.agreeCta')}
          </Text>
        )}
      </TouchableOpacity>
      <View>
          <AuthBackground/>
      </View>
      </View>
        
    </View>
  );
};

export default PhoneAcceptTerms;
