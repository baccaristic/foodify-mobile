import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';

import VerificationCodeTemplate from '~/components/VerificationCodeTemplate';
import usePhoneSignup from '~/hooks/usePhoneSignup';
import { getErrorMessage } from '~/helper/apiError';
import type { PhoneSignupNextStep } from '~/interfaces/Auth/interfaces';
import { getRouteForPhoneSignupStep } from './stepRoutes';

const computeSecondsUntil = (timestamp: string | null) => {
  if (!timestamp) {
    return null;
  }
  const target = new Date(timestamp).getTime();
  if (Number.isNaN(target)) {
    return null;
  }
  const diff = Math.ceil((target - Date.now()) / 1000);
  return diff > 0 ? diff : null;
};

const PhoneEmailVerificationCode = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { state, verifyEmailCode, resendEmailCode } = usePhoneSignup();

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState<number | null>(null);
  const [expiryCountdown, setExpiryCountdown] = useState<number | null>(null);
  const previousStepRef = useRef<PhoneSignupNextStep | null>(null);

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

    if (!state.phoneVerified) {
      navigation.navigate('PhoneVerificationCode' as never);
      return;
    }

    if (!state.emailProvided) {
      navigation.navigate('PhoneEmailEntry' as never);
      return;
    }

    if (hasAuthPayload || state.completed || state.emailVerified) {
      const nextRoute = getRouteForPhoneSignupStep(state.nextStep);
      if (nextRoute && nextRoute !== 'PhoneEmailVerificationCode') {
        navigation.navigate(nextRoute as never);
      }
      return;
    }

    if (previousStepRef.current === null) {
      previousStepRef.current = state.nextStep;
      return;
    }

    if (state.nextStep !== previousStepRef.current) {
      previousStepRef.current = state.nextStep;
      const nextRoute = getRouteForPhoneSignupStep(state.nextStep);
      if (nextRoute && nextRoute !== 'PhoneEmailVerificationCode') {
        navigation.navigate(nextRoute as never);
      }
    }
  }, [hasAuthPayload, navigation, state]);

  const emailResendAvailableAt = state?.emailResendAvailableAt ?? null;
  const emailCodeExpiresAt = state?.emailCodeExpiresAt ?? null;
  const emailVerified = state?.emailVerified ?? false;

  useEffect(() => {
    if (!state) {
      setResendCountdown(null);
      setExpiryCountdown(null);
      return;
    }

    const updateTimers = () => {
      setResendCountdown(emailVerified ? null : computeSecondsUntil(emailResendAvailableAt));
      setExpiryCountdown(emailVerified ? null : computeSecondsUntil(emailCodeExpiresAt));
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [emailCodeExpiresAt, emailVerified, emailResendAvailableAt, state]);

  const handleVerify = async (code: string) => {
    if (!state || isSubmitting) {
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      await verifyEmailCode(code);
    } catch (err) {
      const message = getErrorMessage(err, 'The verification code is invalid or has expired.');
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!state || isResending) {
      return;
    }
    setError(null);
    setIsResending(true);
    try {
      await resendEmailCode();
    } catch (err) {
      const message = getErrorMessage(err, 'Unable to resend the code right now. Please try again later.');
      setError(message);
    } finally {
      setIsResending(false);
    }
  };

  const helperMessage = useMemo(() => {
    if (!state) {
      return null;
    }

    const messageLines: string[] = [];
    const metaParts: string[] = [];

    if (state.loginAttempt) {
      messageLines.push('We found an existing Foodify account. Enter the code to sign in.');
    }

    if (typeof state.emailAttemptsRemaining === 'number') {
      metaParts.push(`Attempts remaining: ${state.emailAttemptsRemaining}`);
    }
    if (typeof state.emailResendsRemaining === 'number') {
      metaParts.push(`Resends left: ${state.emailResendsRemaining}`);
    }
    if (expiryCountdown !== null) {
      metaParts.push(`Code expires in ${expiryCountdown}s`);
    }

    if (metaParts.length > 0) {
      messageLines.push(metaParts.join(' • '));
    }

    return messageLines.length > 0 ? messageLines.join('\n') : null;
  }, [expiryCountdown, state]);

  if (!state || !state.emailProvided) {
    return null;
  }

  const resendLabel = resendCountdown !== null
    ? `Resend available in ${resendCountdown}s`
    : `Resend the code via Email${
        typeof state.emailResendsRemaining === 'number' ? ` (${state.emailResendsRemaining} left)` : ''
      }`;

  const isResendDisabled =
    isResending ||
    isSubmitting ||
    state.emailVerified ||
    state.emailResendsRemaining <= 0 ||
    resendCountdown !== null;

  return (
    <VerificationCodeTemplate
      contact={state.email ?? 'your email'}
      resendMethod="Email"
      onResendPress={handleResend}
      onSubmit={handleVerify}
      codeLength={6}
      isSubmitting={isSubmitting}
      isResendDisabled={isResendDisabled}
      resendButtonLabel={resendLabel}
      errorMessage={error}
      helperMessage={helperMessage}
      onClearError={() => setError(null)}
    />
  );
};

export default PhoneEmailVerificationCode;
