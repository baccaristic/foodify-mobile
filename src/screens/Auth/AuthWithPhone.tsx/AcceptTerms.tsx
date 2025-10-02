import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';

import BackButtonHeader from '~/components/BackButtonHeader';
import usePhoneSignup from '~/hooks/usePhoneSignup';
import { getErrorMessage } from '~/helper/apiError';

const PhoneAcceptTerms = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { state, acceptTerms } = usePhoneSignup();

  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setError('You must accept the terms to continue.');
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
      const message = getErrorMessage(err, 'We could not complete your registration. Please try again.');
      setError(message);
      setIsSubmitting(false);
    }
  };

  if (!state || !state.nameProvided) {
    return null;
  }

  return (
    <View className="flex-1 bg-white p-6">
      <BackButtonHeader />

      <View className="mt-6 mb-10">
        <Text allowFontScaling={false} className="text-3xl font-bold text-black mb-4">
          Accept Foodify’s Terms & Review privacy notice
        </Text>
        <Text allowFontScaling={false} className="text-base text-gray-700 leading-relaxed">
          By selecting “I agree” below, I have reviewed and agree to the
          <Text className="text-[#CA251B]"> terms of use</Text> and acknowledge the
          <Text className="text-[#CA251B]"> privacy notice</Text>. I am at least 18 years of age.
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
          I agree to the terms and privacy notice
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
            I Agree
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default PhoneAcceptTerms;
