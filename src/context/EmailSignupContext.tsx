import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  acceptEmailSignupTerms,
  getEmailSignupState,
  provideEmailSignupPhone,
  provideEmailSignupProfile,
  resendEmailSignupCode,
  resendEmailSignupPhoneCode,
  startEmailSignup,
  verifyEmailSignupCode,
  verifyEmailSignupPhoneCode,
} from '~/api/auth';
import { useAuthContext } from '~/context/AuthContext';
import type {
  CompleteEmailSignupResponse,
  EmailSignupStateResponse,
} from '~/interfaces/Auth/interfaces';

interface EmailSignupContextValue {
  state: EmailSignupStateResponse | null;
  isLoading: boolean;
  startSignup: (email: string, password: string) => Promise<EmailSignupStateResponse>;
  resendEmailCode: () => Promise<EmailSignupStateResponse>;
  verifyEmailCode: (code: string) => Promise<EmailSignupStateResponse>;
  providePhone: (phoneNumber: string) => Promise<EmailSignupStateResponse>;
  resendPhoneCode: () => Promise<EmailSignupStateResponse>;
  verifyPhoneCode: (code: string) => Promise<EmailSignupStateResponse>;
  provideProfile: (
    firstName: string,
    lastName: string,
    dateOfBirth: string,
  ) => Promise<EmailSignupStateResponse>;
  acceptTerms: () => Promise<CompleteEmailSignupResponse>;
  loadSession: (sessionId: string) => Promise<EmailSignupStateResponse>;
  reset: () => void;
}

const EmailSignupContext = createContext<EmailSignupContextValue | undefined>(undefined);

export const EmailSignupProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<EmailSignupStateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { applyAuthResponse } = useAuthContext();

  const applyAuthFromState = useCallback(
    async (nextState: EmailSignupStateResponse) => {
      if (nextState.accessToken && nextState.refreshToken && nextState.user) {
        await applyAuthResponse({
          accessToken: nextState.accessToken,
          refreshToken: nextState.refreshToken,
          user: nextState.user,
        });
      }
    },
    [applyAuthResponse],
  );

  const updateState = useCallback(
    async (
      nextState: EmailSignupStateResponse,
      options: { applyAuth?: boolean } = {},
    ) => {
      setState(nextState);
      if (options.applyAuth ?? true) {
        await applyAuthFromState(nextState);
      }
      return nextState;
    },
    [applyAuthFromState],
  );

  const requireSessionId = useCallback(() => {
    if (!state?.sessionId) {
      throw new Error('Missing signup session.');
    }
    return state.sessionId;
  }, [state?.sessionId]);

  const startSignupHandler = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true);
      try {
        const response = await startEmailSignup({ email, password });
        return await updateState(response);
      } finally {
        setIsLoading(false);
      }
    },
    [updateState],
  );

  const resendEmailCodeHandler = useCallback(async () => {
    const sessionId = requireSessionId();
    setIsLoading(true);
    try {
      const response = await resendEmailSignupCode({ sessionId });
      return await updateState(response);
    } finally {
      setIsLoading(false);
    }
  }, [requireSessionId, updateState]);

  const verifyEmailCodeHandler = useCallback(
    async (code: string) => {
      const sessionId = requireSessionId();
      setIsLoading(true);
      try {
        const response = await verifyEmailSignupCode({ sessionId, code });
        return await updateState(response);
      } finally {
        setIsLoading(false);
      }
    },
    [requireSessionId, updateState],
  );

  const providePhoneHandler = useCallback(
    async (phoneNumber: string) => {
      const sessionId = requireSessionId();
      setIsLoading(true);
      try {
        const response = await provideEmailSignupPhone({ sessionId, phoneNumber });
        return await updateState(response);
      } finally {
        setIsLoading(false);
      }
    },
    [requireSessionId, updateState],
  );

  const resendPhoneCodeHandler = useCallback(async () => {
    const sessionId = requireSessionId();
    setIsLoading(true);
    try {
      const response = await resendEmailSignupPhoneCode({ sessionId });
      return await updateState(response);
    } finally {
      setIsLoading(false);
    }
  }, [requireSessionId, updateState]);

  const verifyPhoneCodeHandler = useCallback(
    async (code: string) => {
      const sessionId = requireSessionId();
      setIsLoading(true);
      try {
        const response = await verifyEmailSignupPhoneCode({ sessionId, code });
        return await updateState(response);
      } finally {
        setIsLoading(false);
      }
    },
    [requireSessionId, updateState],
  );

  const provideProfileHandler = useCallback(
    async (firstName: string, lastName: string, dateOfBirth: string) => {
      const sessionId = requireSessionId();
      setIsLoading(true);
      try {
        const response = await provideEmailSignupProfile({
          sessionId,
          firstName,
          lastName,
          dateOfBirth,
        });
        return await updateState(response);
      } finally {
        setIsLoading(false);
      }
    },
    [requireSessionId, updateState],
  );

  const acceptTermsHandler = useCallback(async () => {
    const sessionId = requireSessionId();
    setIsLoading(true);
    try {
      const response = await acceptEmailSignupTerms({ sessionId, accepted: true });
      await updateState(response.state, { applyAuth: false });
      await applyAuthResponse({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
        user: response.user,
      });
      return response;
    } finally {
      setIsLoading(false);
    }
  }, [applyAuthResponse, requireSessionId, updateState]);

  const loadSessionHandler = useCallback(
    async (sessionId: string) => {
      setIsLoading(true);
      try {
        const response = await getEmailSignupState(sessionId);
        return await updateState(response);
      } finally {
        setIsLoading(false);
      }
    },
    [updateState],
  );

  const reset = useCallback(() => {
    setState(null);
  }, []);

  const value = useMemo<EmailSignupContextValue>(
    () => ({
      state,
      isLoading,
      startSignup: startSignupHandler,
      resendEmailCode: resendEmailCodeHandler,
      verifyEmailCode: verifyEmailCodeHandler,
      providePhone: providePhoneHandler,
      resendPhoneCode: resendPhoneCodeHandler,
      verifyPhoneCode: verifyPhoneCodeHandler,
      provideProfile: provideProfileHandler,
      acceptTerms: acceptTermsHandler,
      loadSession: loadSessionHandler,
      reset,
    }),
    [
      state,
      isLoading,
      startSignupHandler,
      resendEmailCodeHandler,
      verifyEmailCodeHandler,
      providePhoneHandler,
      resendPhoneCodeHandler,
      verifyPhoneCodeHandler,
      provideProfileHandler,
      acceptTermsHandler,
      loadSessionHandler,
      reset,
    ],
  );

  return <EmailSignupContext.Provider value={value}>{children}</EmailSignupContext.Provider>;
};

export const useEmailSignupContext = () => {
  const context = useContext(EmailSignupContext);
  if (!context) {
    throw new Error('useEmailSignupContext must be used within an EmailSignupProvider');
  }
  return context;
};
