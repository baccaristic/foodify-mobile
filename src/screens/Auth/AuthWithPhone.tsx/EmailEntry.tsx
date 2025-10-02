import React, { useEffect, useMemo, useState } from 'react';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';

import EntryInfoTemplate from '~/components/EntryInfoTemplate';
import usePhoneSignup from '~/hooks/usePhoneSignup';
import { getErrorMessage } from '~/helper/apiError';
import { getRouteForPhoneSignupStep } from './stepRoutes';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PhoneEmailEntry = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { state, provideEmail } = usePhoneSignup();

  const [email, setEmail] = useState('');
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
    if (!state || !state.phoneVerified) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Guest' }],
      });
      return;
    }
    setEmail(state.email ?? '');
  }, [navigation, state]);

  const isFormValid = useMemo(() => EMAIL_REGEX.test(email.trim().toLowerCase()), [email]);

  const handleSubmit = async () => {
    if (!state || !isFormValid || isSubmitting) {
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const nextState = await provideEmail(email.trim().toLowerCase());
      const nextRoute = getRouteForPhoneSignupStep(nextState.nextStep);
      if (nextRoute && nextRoute !== 'PhoneEmailEntry') {
        navigation.navigate(nextRoute as never);
      }
    } catch (err) {
      const message = getErrorMessage(err, 'We could not save your email. Please try again.');
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!state || !state.phoneVerified) {
    return null;
  }

  return (
    <EntryInfoTemplate
      title="What's your e-mail address"
      inputPlaceholder="Enter your email"
      keyboardType="email-address"
      inputValue={email}
      setInputValue={(value) => {
        setEmail(value);
        setError(null);
      }}
      isFormValid={isFormValid}
      onContinue={handleSubmit}
      isSubmitting={isSubmitting}
      errorMessage={error}
      autoCapitalize="none"
      autoComplete="email"
    />
  );
};

export default PhoneEmailEntry;
