import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as SecureStore from 'expo-secure-store';

import { login as loginRequest, logout as logoutRequest, refreshToken } from '~/api/auth';
import { setAccessToken as applyClientAccessToken } from '~/api/client';
import type { AuthResponse, AuthState, LoginRequest, User } from '~/interfaces/Auth/interfaces';

const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'authUser';

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const syncClientToken = useCallback((token: string | null) => {
    setAccessToken(token);
    applyClientAccessToken(token);
  }, []);

  const persistSession = useCallback(async (refreshTokenValue: string, nextUser: User) => {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshTokenValue);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(nextUser));
  }, []);

  const clearPersistedSession = useCallback(async () => {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
  }, []);

  const restoreSession = useCallback(async () => {
    try {
      const [refreshTokenValue, storedUser] = await Promise.all([
        SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
        SecureStore.getItemAsync(USER_KEY),
      ]);

      if (!refreshTokenValue) {
        setUser(null);
        syncClientToken(null);
        return;
      }

      let parsedUser: User | null = null;
      if (storedUser) {
        try {
          parsedUser = JSON.parse(storedUser) as User;
        } catch (error) {
          console.warn('Failed to parse stored user. Clearing persisted data.', error);
          await SecureStore.deleteItemAsync(USER_KEY);
        }
      }

      const { accessToken: refreshedAccessToken } = await refreshToken({
        refreshToken: refreshTokenValue,
      });

      syncClientToken(refreshedAccessToken);
      setUser(parsedUser);
    } catch (error) {
      console.warn('Failed to restore auth session.', error);
      await clearPersistedSession();
      setUser(null);
      syncClientToken(null);
    } finally {
      setIsLoading(false);
    }
  }, [clearPersistedSession, syncClientToken]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  const applyAuthResponse = useCallback(
    async (response: AuthResponse) => {
      syncClientToken(response.accessToken);
      setUser(response.user);
      await persistSession(response.refreshToken, response.user);
      setIsLoading(false);
    },
    [persistSession, syncClientToken],
  );

  const login = useCallback(
    async (credentials: LoginRequest) => {
      const response = await loginRequest(credentials);
      await applyAuthResponse(response);
    },
    [applyAuthResponse],
  );

  const logout = useCallback(async () => {
    try {
      const refreshTokenValue = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (refreshTokenValue) {
        await logoutRequest({ refreshToken: refreshTokenValue });
      }
    } catch (error) {
      console.warn('Failed to call logout endpoint.', error);
    } finally {
      await clearPersistedSession();
      setUser(null);
      syncClientToken(null);
      setIsLoading(false);
    }
  }, [clearPersistedSession, syncClientToken]);

  const value = useMemo<AuthState>(
    () => ({
      user,
      accessToken,
      isLoading,
      login,
      logout,
      restoreSession,
      applyAuthResponse,
      requiresAuth: Boolean(user && accessToken),
    }),
    [user, accessToken, isLoading, login, logout, restoreSession, applyAuthResponse],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};
