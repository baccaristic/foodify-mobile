import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';

import VerificationCodeTemplate from '~/components/VerificationCodeTemplate';
import usePhoneSignup from '~/hooks/usePhoneSignup';
import { getErrorMessage } from '~/helper/apiError';
import type { PhoneSignupNextStep } from '~/interfaces/Auth/interfaces';
import { useTranslation } from '~/localization';
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
  const { t } = useTranslation();
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

    if (hasAuthPayload || state.completed) {
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
  }, [hasAuthPayload, navigation, state]);

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
      const message = getErrorMessage(err, t('auth.common.verification.errors.invalidCode'));
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
      const message = getErrorMessage(err, t('auth.common.verification.errors.resendFailed'));
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
      messageLines.push(t('auth.common.helper.existingAccount'));
    }

    if (typeof state.attemptsRemaining === 'number') {
      metaParts.push(
        t('auth.common.helper.attempts', { values: { count: state.attemptsRemaining } }),
      );
    }
    if (typeof state.resendsRemaining === 'number') {
      metaParts.push(
        t('auth.common.helper.resends', { values: { count: state.resendsRemaining } }),
      );
    }
    if (expiryCountdown !== null) {
      metaParts.push(
        t('auth.common.helper.expires', { values: { seconds: expiryCountdown } }),
      );
    }

    if (metaParts.length > 0) {
      messageLines.push(metaParts.join(' • '));
    }

    return messageLines.length > 0 ? messageLines.join('\n') : null;
  }, [expiryCountdown, state, t]);

  if (!state) {
    return null;
  }

  const methodLabel = t('auth.common.resend.methods.sms');
  const defaultResendLabel =
    typeof state.resendsRemaining === 'number'
      ? t('auth.common.resend.withRemaining', {
          values: { method: methodLabel, count: state.resendsRemaining },
        })
      : t('auth.common.resend.default', { values: { method: methodLabel } });

  const resendLabel =
    resendCountdown !== null
      ? t('auth.common.resend.countdown', { values: { seconds: resendCountdown } })
      : defaultResendLabel;

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
