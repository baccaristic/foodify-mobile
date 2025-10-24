import React, { useEffect, useMemo, useState } from 'react';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';

import EntryInfoTemplate from '~/components/EntryInfoTemplate';
import useEmailSignup from '~/hooks/useEmailSignup';
import { getErrorMessage } from '~/helper/apiError';
import { useTranslation } from '~/localization';
import { getRouteForEmailSignupStep } from './stepRoutes';

const PhoneNumberEntry = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { state, providePhone } = useEmailSignup();
  const { t } = useTranslation();

  const [phoneNumber, setPhoneNumber] = useState('');
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

    if (!state.emailVerified) {
      navigation.navigate('EmailVerificationCode' as never);
      return;
    }

    setPhoneNumber(state.phoneNumber ?? '');

    if (state.nextStep !== 'PROVIDE_PHONE') {
      const nextRoute = getRouteForEmailSignupStep(state.nextStep);
      if (nextRoute && nextRoute !== 'PhoneNumberEntry') {
        navigation.navigate(nextRoute as never);
      }
    }
  }, [navigation, state]);

  const isFormValid = useMemo(() => phoneNumber.trim().length > 0, [phoneNumber]);

  const handleContinue = async () => {
    if (!state || !isFormValid || isSubmitting) {
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const nextState = await providePhone(phoneNumber.trim());
      const nextRoute = getRouteForEmailSignupStep(nextState.nextStep);
      if (nextRoute && nextRoute !== 'PhoneNumberEntry') {
        navigation.navigate(nextRoute as never);
      }
    } catch (err) {
      const message = getErrorMessage(err, t('auth.email.signup.phone.errors.generic'));
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!state || !state.emailVerified) {
    return null;
  }

  return (
    <EntryInfoTemplate
      title={t('auth.email.signup.phone.title')}
      inputPlaceholder={t('auth.email.signup.phone.placeholder')}
      keyboardType="phone-pad"
      inputValue={phoneNumber}
      setInputValue={(value) => {
        setPhoneNumber(value);
        setError(null);
      }}
      isFormValid={isFormValid}
      onContinue={handleContinue}
      isSubmitting={isSubmitting}
      errorMessage={error}
    />
  );
};

export default PhoneNumberEntry;
