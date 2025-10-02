import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  acceptPhoneSignupTerms,
  getPhoneSignupState,
  providePhoneSignupEmail,
  providePhoneSignupName,
  resendPhoneSignupCode,
  startPhoneSignup,
  verifyPhoneSignupCode,
} from '~/api/auth';
import { useAuthContext } from '~/context/AuthContext';
import type { CompletePhoneSignupResponse, PhoneSignupStateResponse } from '~/interfaces/Auth/interfaces';

interface PhoneSignupContextValue {
  state: PhoneSignupStateResponse | null;
  isLoading: boolean;
  startSignup: (phoneNumber: string) => Promise<PhoneSignupStateResponse>;
  verifyCode: (code: string) => Promise<PhoneSignupStateResponse>;
  resendCode: () => Promise<PhoneSignupStateResponse>;
  provideEmail: (email: string) => Promise<PhoneSignupStateResponse>;
  provideName: (firstName: string, lastName: string) => Promise<PhoneSignupStateResponse>;
  acceptTerms: () => Promise<CompletePhoneSignupResponse>;
  loadSession: (sessionId: string) => Promise<PhoneSignupStateResponse>;
  reset: () => void;
}

const PhoneSignupContext = createContext<PhoneSignupContextValue | undefined>(undefined);

export const PhoneSignupProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<PhoneSignupStateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { applyAuthResponse } = useAuthContext();

  const applyAuthFromState = useCallback(
    async (nextState: PhoneSignupStateResponse) => {
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
      nextState: PhoneSignupStateResponse,
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
    async (phoneNumber: string) => {
      setIsLoading(true);
      try {
        const response = await startPhoneSignup({ phoneNumber });
        return await updateState(response);
      } finally {
        setIsLoading(false);
      }
    },
    [updateState],
  );

  const verifyCodeHandler = useCallback(
    async (code: string) => {
      const sessionId = requireSessionId();
      setIsLoading(true);
      try {
        const response = await verifyPhoneSignupCode({ sessionId, code });
        return await updateState(response);
      } finally {
        setIsLoading(false);
      }
    },
    [requireSessionId, updateState],
  );

  const resendCodeHandler = useCallback(async () => {
    const sessionId = requireSessionId();
    setIsLoading(true);
    try {
      const response = await resendPhoneSignupCode({ sessionId });
      return await updateState(response);
    } finally {
      setIsLoading(false);
    }
  }, [requireSessionId, updateState]);

  const provideEmailHandler = useCallback(
    async (email: string) => {
      const sessionId = requireSessionId();
      setIsLoading(true);
      try {
        const response = await providePhoneSignupEmail({ sessionId, email });
        return await updateState(response);
      } finally {
        setIsLoading(false);
      }
    },
    [requireSessionId, updateState],
  );

  const provideNameHandler = useCallback(
    async (firstName: string, lastName: string) => {
      const sessionId = requireSessionId();
      setIsLoading(true);
      try {
        const response = await providePhoneSignupName({ sessionId, firstName, lastName });
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
      const response = await acceptPhoneSignupTerms({ sessionId, accepted: true });
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
        const response = await getPhoneSignupState(sessionId);
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

  const value = useMemo<PhoneSignupContextValue>(
    () => ({
      state,
      isLoading,
      startSignup: startSignupHandler,
      verifyCode: verifyCodeHandler,
      resendCode: resendCodeHandler,
      provideEmail: provideEmailHandler,
      provideName: provideNameHandler,
      acceptTerms: acceptTermsHandler,
      loadSession: loadSessionHandler,
      reset,
    }),
    [
      state,
      isLoading,
      startSignupHandler,
      verifyCodeHandler,
      resendCodeHandler,
      provideEmailHandler,
      provideNameHandler,
      acceptTermsHandler,
      loadSessionHandler,
      reset,
    ],
  );

  return <PhoneSignupContext.Provider value={value}>{children}</PhoneSignupContext.Provider>;
};

export const usePhoneSignupContext = () => {
  const context = useContext(PhoneSignupContext);
  if (!context) {
    throw new Error('usePhoneSignupContext must be used within a PhoneSignupProvider');
  }
  return context;
};
