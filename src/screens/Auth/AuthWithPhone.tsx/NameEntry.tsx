import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';

import BackButtonHeader from '~/components/BackButtonHeader';
import usePhoneSignup from '~/hooks/usePhoneSignup';
import { getErrorMessage } from '~/helper/apiError';
import { getRouteForPhoneSignupStep } from './stepRoutes';

const PhoneNameEntry = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { state, provideName } = usePhoneSignup();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hasAuthPayload = Boolean(state?.accessToken && state?.refreshToken && state?.user);

  useEffect(() => {
    if (!state) {
      return;
    }

    if (hasAuthPayload || state.completed) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    }
  }, [hasAuthPayload, navigation, state]);

  useEffect(() => {
    if (!state || !state.emailProvided) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Guest' }],
      });
      return;
    }
    setFirstName(state.firstName ?? '');
    setLastName(state.lastName ?? '');
  }, [navigation, state]);

  const isFormValid = useMemo(
    () => firstName.trim().length > 0 && lastName.trim().length > 0,
    [firstName, lastName],
  );

  const handleContinue = async () => {
    if (!state || !isFormValid || isSubmitting) {
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const nextState = await provideName(firstName.trim(), lastName.trim());
      const nextRoute = getRouteForPhoneSignupStep(nextState.nextStep);
      if (nextRoute && nextRoute !== 'PhoneNameEntry') {
        navigation.navigate(nextRoute as never);
      }
    } catch (err) {
      const message = getErrorMessage(err, 'We could not save your name details. Please try again.');
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!state || !state.emailProvided) {
    return null;
  }

  const buttonDisabled = !isFormValid || isSubmitting;

  return (
    <View className="flex-1 bg-white p-6">
      <BackButtonHeader />

      <Text allowFontScaling={false} className="text-3xl font-bold mb-8 text-black">
        What’s your name
      </Text>

      <TextInput
        className="w-full h-14 bg-gray-300 rounded-lg px-4 mb-4 text-black"
        placeholder="First Name"
        placeholderTextColor="#666"
        autoCapitalize="words"
        value={firstName}
        onChangeText={(value) => {
          setFirstName(value);
          setError(null);
        }}
        editable={!isSubmitting}
      />

      <TextInput
        className="w-full h-14 bg-gray-300 rounded-lg px-4 mb-4 text-black"
        placeholder="Last Name"
        placeholderTextColor="#666"
        autoCapitalize="words"
        value={lastName}
        onChangeText={(value) => {
          setLastName(value);
          setError(null);
        }}
        editable={!isSubmitting}
      />

      {error ? (
        <Text allowFontScaling={false} className="text-sm text-red-500 mb-2">
          {error}
        </Text>
      ) : null}

      <TouchableOpacity
        className={`w-full h-14 rounded-lg justify-center items-center ${
          buttonDisabled ? 'bg-gray-400' : 'bg-[#17213A]'
        }`}
        onPress={handleContinue}
        disabled={buttonDisabled}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text allowFontScaling={false} className="text-white font-semibold text-lg">
            Continue
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default PhoneNameEntry;
