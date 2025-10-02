import type { PhoneSignupNextStep } from '~/interfaces/Auth/interfaces';

const STEP_TO_ROUTE: Record<PhoneSignupNextStep, string | null> = {
  VERIFY_PHONE_CODE: 'PhoneVerificationCode',
  PROVIDE_EMAIL: 'PhoneEmailEntry',
  PROVIDE_NAME: 'PhoneNameEntry',
  ACCEPT_LEGAL_TERMS: 'PhoneAcceptTerms',
  COMPLETED: null,
};

export const getRouteForPhoneSignupStep = (step: PhoneSignupNextStep | null | undefined) => {
  if (!step) {
    return null;
  }
  return STEP_TO_ROUTE[step] ?? null;
};

export const PHONE_SIGNUP_STEP_TO_ROUTE = STEP_TO_ROUTE;
