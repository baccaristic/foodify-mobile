import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';

import BackButtonHeader from '~/components/BackButtonHeader';
import AuthBackground from '~/components/AuthBackGround';
import useEmailSignup from '~/hooks/useEmailSignup';
import { getErrorMessage } from '~/helper/apiError';
import { useTranslation } from '~/localization';
import { getRouteForEmailSignupStep } from './stepRoutes';

const DOB_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const NameEntry = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { state, provideProfile } = useEmailSignup();
  const { t } = useTranslation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
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

    if (!state.phoneVerified) {
      const nextRoute = getRouteForEmailSignupStep(state.nextStep);
      if (nextRoute && nextRoute !== 'NameEntry') {
        navigation.navigate(nextRoute as never);
      } else {
        navigation.navigate('PhoneNumberEntry' as never);
      }
      return;
    }

    setFirstName(state.firstName ?? '');
    setLastName(state.lastName ?? '');
    setDateOfBirth(state.dateOfBirth ?? '');

    if (state.nextStep !== 'PROVIDE_PROFILE') {
      const nextRoute = getRouteForEmailSignupStep(state.nextStep);
      if (nextRoute && nextRoute !== 'NameEntry') {
        navigation.navigate(nextRoute as never);
      }
    }
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
      const nextState = await provideProfile(
        firstName.trim(),
        lastName.trim(),
        dateOfBirth.trim(),
      );
      const nextRoute = getRouteForEmailSignupStep(nextState.nextStep);
      if (nextRoute && nextRoute !== 'NameEntry') {
        navigation.navigate(nextRoute as never);
      }
    } catch (err) {
      const message = getErrorMessage(err, t('auth.email.signup.name.errors.generic'));
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!state || !state.phoneVerified) {
    return null;
  }

  const buttonDisabled = !isFormValid || isSubmitting;
  const showDateFormatHint = dateOfBirth.trim().length > 0 && !isDateValid;

  return (
    <View className="flex-1 bg-white ">
      <View className='p-6 flex1'>
        <BackButtonHeader />

        <Text allowFontScaling={false} className="text-3xl font-bold mb-8 text-black">
          {t('auth.email.signup.name.title')}
        </Text>

        <TextInput
          className="w-full h-14 bg-gray-300 rounded-lg px-4 mb-4 text-black"
          placeholder={t('auth.email.signup.name.firstNamePlaceholder')}
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
          placeholder={t('auth.email.signup.name.lastNamePlaceholder')}
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
          placeholder={t('auth.email.signup.name.dobPlaceholder')}
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
            {t('auth.common.dateHint')}
          </Text>
        ) : null}

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
              {t('common.continue')}
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

export default NameEntry;
