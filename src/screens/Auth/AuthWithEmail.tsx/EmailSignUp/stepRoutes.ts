import type { EmailSignupNextStep } from '~/interfaces/Auth/interfaces';

const STEP_TO_ROUTE: Record<EmailSignupNextStep, string | null> = {
  VERIFY_EMAIL_CODE: 'EmailVerificationCode',
  PROVIDE_PHONE: 'PhoneNumberEntry',
  VERIFY_PHONE_CODE: 'EmailPhoneVerificationCode',
  PROVIDE_PROFILE: 'NameEntry',
  ACCEPT_LEGAL_TERMS: 'AcceptTerms',
  COMPLETED: null,
};

export const getRouteForEmailSignupStep = (
  step: EmailSignupNextStep | null | undefined,
): string | null => {
  if (!step) {
    return null;
  }
  return STEP_TO_ROUTE[step] ?? null;
};
