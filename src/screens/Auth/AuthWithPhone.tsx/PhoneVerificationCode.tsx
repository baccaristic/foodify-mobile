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

const PhoneVerificationCode = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { state, verifyCode, resendCode } = usePhoneSignup();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState<number | null>(null);
  const [expiryCountdown, setExpiryCountdown] = useState<number | null>(null);
  const previousStepRef = useRef<PhoneSignupNextStep | null>(null);

  useEffect(() => {
    if (!state) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Guest' }],
      });
      return;
    }

    if (previousStepRef.current === null) {
      previousStepRef.current = state.nextStep;
      return;
    }

    if (state.nextStep !== previousStepRef.current) {
      previousStepRef.current = state.nextStep;
      const nextRoute = getRouteForPhoneSignupStep(state.nextStep);
      if (nextRoute && nextRoute !== 'PhoneVerificationCode') {
        navigation.navigate(nextRoute as never);
      }
    }
  }, [navigation, state]);

  const resendAvailableAt = state?.resendAvailableAt ?? null;
  const codeExpiresAt = state?.codeExpiresAt ?? null;
  const phoneVerified = state?.phoneVerified ?? false;

  useEffect(() => {
    if (!state) {
      setResendCountdown(null);
      setExpiryCountdown(null);
      return;
    }

    const updateTimers = () => {
      setResendCountdown(phoneVerified ? null : computeSecondsUntil(resendAvailableAt));
      setExpiryCountdown(phoneVerified ? null : computeSecondsUntil(codeExpiresAt));
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [codeExpiresAt, phoneVerified, resendAvailableAt, state]);

  const handleVerify = async (code: string) => {
    if (!state || isSubmitting) {
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      await verifyCode(code);
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
      await resendCode();
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
    const parts: string[] = [];
    if (typeof state.attemptsRemaining === 'number') {
      parts.push(`Attempts remaining: ${state.attemptsRemaining}`);
    }
    if (typeof state.resendsRemaining === 'number') {
      parts.push(`Resends left: ${state.resendsRemaining}`);
    }
    if (expiryCountdown !== null) {
      parts.push(`Code expires in ${expiryCountdown}s`);
    }
    return parts.length > 0 ? parts.join(' • ') : null;
  }, [expiryCountdown, state]);

  if (!state) {
    return null;
  }

  const resendLabel = resendCountdown !== null
    ? `Resend available in ${resendCountdown}s`
    : `Resend the code via SMS${typeof state.resendsRemaining === 'number' ? ` (${state.resendsRemaining} left)` : ''}`;

  const isResendDisabled =
    isResending ||
    isSubmitting ||
    state.phoneVerified ||
    state.resendsRemaining <= 0 ||
    resendCountdown !== null;

  return (
    <VerificationCodeTemplate
      contact={state.phoneNumber}
      resendMethod="SMS"
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

export default PhoneVerificationCode;
