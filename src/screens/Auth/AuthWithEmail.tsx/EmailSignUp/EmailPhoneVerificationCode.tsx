import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavigationProp, ParamListBase, useNavigation } from '@react-navigation/native';

import VerificationCodeTemplate from '~/components/VerificationCodeTemplate';
import useEmailSignup from '~/hooks/useEmailSignup';
import { getErrorMessage } from '~/helper/apiError';
import type { EmailSignupNextStep } from '~/interfaces/Auth/interfaces';
import { useTranslation } from '~/localization';
import { getRouteForEmailSignupStep } from './stepRoutes';

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

const EmailPhoneVerificationCode = () => {
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const { state, verifyPhoneCode, resendPhoneCode } = useEmailSignup();
  const { t } = useTranslation();

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCountdown, setResendCountdown] = useState<number | null>(null);
  const [expiryCountdown, setExpiryCountdown] = useState<number | null>(null);
  const previousStepRef = useRef<EmailSignupNextStep | null>(null);

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

    if (previousStepRef.current === null) {
      previousStepRef.current = state.nextStep;
      return;
    }

    if (state.nextStep !== previousStepRef.current) {
      previousStepRef.current = state.nextStep;
      const nextRoute = getRouteForEmailSignupStep(state.nextStep);
      if (nextRoute && nextRoute !== 'EmailPhoneVerificationCode') {
        navigation.navigate(nextRoute as never);
      }
    }
  }, [navigation, state]);

  useEffect(() => {
    if (!state) {
      setResendCountdown(null);
      setExpiryCountdown(null);
      return;
    }

    if (!state.phoneProvided) {
      navigation.navigate('PhoneNumberEntry' as never);
      return;
    }

    if (!state.emailVerified) {
      navigation.navigate('EmailVerificationCode' as never);
      return;
    }

    const updateTimers = () => {
      setResendCountdown(
        state.phoneVerified ? null : computeSecondsUntil(state.phoneResendAvailableAt),
      );
      setExpiryCountdown(
        state.phoneVerified ? null : computeSecondsUntil(state.phoneCodeExpiresAt),
      );
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [navigation, state]);

  const handleVerify = async (code: string) => {
    if (!state || isSubmitting) {
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      const nextState = await verifyPhoneCode(code);
      const nextRoute = getRouteForEmailSignupStep(nextState.nextStep);
      if (nextRoute && nextRoute !== 'EmailPhoneVerificationCode') {
        navigation.navigate(nextRoute as never);
      }
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
      await resendPhoneCode();
    } catch (err) {
      const message = getErrorMessage(err, t('auth.common.verification.errors.resendFailed'));
      setError(message);
    } finally {
      setIsResending(false);
    }
  };

  const helperMessage = useMemo(() => {
    if (!state || !state.phoneProvided || !state.emailVerified) {
      return null;
    }
    const messageLines: string[] = [];
    const metaParts: string[] = [];

    if (typeof state.phoneAttemptsRemaining === 'number') {
      metaParts.push(
        t('auth.common.helper.attempts', { values: { count: state.phoneAttemptsRemaining } }),
      );
    }

    metaParts.push(
      t('auth.common.helper.resends', { values: { count: state.phoneResendsRemaining } }),
    );

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

  if (!state || !state.phoneProvided || !state.emailVerified) {
    return null;
  }

  const methodLabel = t('auth.common.resend.methods.sms');
  const defaultResendLabel = t('auth.common.resend.withRemaining', {
    values: { method: methodLabel, count: state.phoneResendsRemaining },
  });

  const resendLabel =
    resendCountdown !== null
      ? t('auth.common.resend.countdown', { values: { seconds: resendCountdown } })
      : defaultResendLabel;

  const isResendDisabled =
    isResending ||
    isSubmitting ||
    state.phoneVerified ||
    state.phoneResendsRemaining <= 0 ||
    resendCountdown !== null;

  return (
    <VerificationCodeTemplate
      contact={state.phoneNumber ?? ''}
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
      onBackPress={() => navigation.navigate('PhoneNumberEntry' as never)}
    />
  );
};

export default EmailPhoneVerificationCode;
