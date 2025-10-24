import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';

import BackButtonHeader from '~/components/BackButtonHeader';
import usePhoneSignup from '~/hooks/usePhoneSignup';
import { getErrorMessage } from '~/helper/apiError';
import { getRouteForPhoneSignupStep } from './stepRoutes';
import AuthBackground from '~/components/AuthBackGround';

const DOB_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const PhoneNameEntry = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { state, provideName } = usePhoneSignup();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
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
    if (!state) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Guest' }],
      });
      return;
    }

    if (!state.emailProvided) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Guest' }],
      });
      return;
    }

    if (!state.emailVerified) {
      navigation.navigate('PhoneEmailVerificationCode' as never);
      return;
    }

    setFirstName(state.firstName ?? '');
    setLastName(state.lastName ?? '');
    setDateOfBirth(state.dateOfBirth ?? '');
  }, [navigation, state]);

  const isDateValid = useMemo(() => {
    const trimmed = dateOfBirth.trim();
    if (!DOB_REGEX.test(trimmed)) {
      return false;
    }
    const parsed = new Date(trimmed);
    if (Number.isNaN(parsed.getTime())) {
      return false;
    }
    return parsed.toISOString().slice(0, 10) === trimmed;
  }, [dateOfBirth]);

  const isFormValid = useMemo(
    () => firstName.trim().length > 0 && lastName.trim().length > 0 && isDateValid,
    [firstName, isDateValid, lastName],
  );

  const handleContinue = async () => {
    if (!state || !isFormValid || isSubmitting) {
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const nextState = await provideName(firstName.trim(), lastName.trim(), dateOfBirth.trim());
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

  if (!state || !state.emailProvided || !state.emailVerified) {
    return null;
  }

  const buttonDisabled = !isFormValid || isSubmitting;
  const showDateFormatHint = dateOfBirth.trim().length > 0 && !isDateValid;

  return (
    <View className="flex-1 bg-white ">
      <View className='p-6 flex1'>

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

        <TextInput
          className="w-full h-14 bg-gray-300 rounded-lg px-4 mb-2 text-black"
          placeholder="Date of Birth (YYYY-MM-DD)"
          placeholderTextColor="#666"
          value={dateOfBirth}
          onChangeText={(value) => {
            setDateOfBirth(value);
            setError(null);
          }}
          editable={!isSubmitting}
          keyboardType="numbers-and-punctuation"
          maxLength={10}
        />

        {showDateFormatHint ? (
          <Text allowFontScaling={false} className="text-sm text-red-500 mb-2">
            Please enter a valid date in YYYY-MM-DD format.
          </Text>
        ) : null}

        {error ? (
          <Text allowFontScaling={false} className="text-sm text-red-500 mb-2">
            {error}
          </Text>
        ) : null}

        <TouchableOpacity
          className={`w-full h-14 rounded-lg justify-center items-center ${buttonDisabled ? 'bg-gray-400' : 'bg-[#17213A]'
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
      <View>
        <AuthBackground />
      </View>
    </View>
  );
};

export default PhoneNameEntry;
