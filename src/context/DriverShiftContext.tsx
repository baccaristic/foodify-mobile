import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState } from 'react-native';

import { getDriverShift } from '~/api/driver';
import type { DriverShiftDto } from '~/interfaces/Driver/Shift';
import useAuth from '~/hooks/useAuth';

interface DriverShiftContextValue {
  shift: DriverShiftDto | null;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<DriverShiftDto | null>;
  isDriver: boolean;
}

const DriverShiftContext = createContext<DriverShiftContextValue | undefined>(undefined);

export const DriverShiftProvider = ({ children }: { children: ReactNode }) => {
  const { user, requiresAuth } = useAuth();
  const [shift, setShift] = useState<DriverShiftDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);

  const isDriver = Boolean(
    requiresAuth && user?.role && user.role.toUpperCase().includes('DRIVER'),
  );

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchShift = useCallback(async (): Promise<DriverShiftDto | null> => {
    if (!isDriver) {
      if (isMountedRef.current) {
        setShift(null);
        setError(null);
        setIsLoading(false);
      }
      return null;
    }

    if (isMountedRef.current) {
      setIsLoading(true);
        setError(null);
    }

    try {
      const data = await getDriverShift();
      if (isMountedRef.current) {
        setShift(data ?? null);
      }
      return data ?? null;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch driver shift.'));
      }
      return null;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [isDriver]);

  useEffect(() => {
    if (!isDriver) {
      setShift(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    fetchShift().catch((err) => {
      console.warn('Failed to fetch driver shift on mount:', err);
    });
  }, [fetchShift, isDriver]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        fetchShift().catch((err) => {
          console.warn('Failed to refresh driver shift on app focus:', err);
        });
      }
    });

    return () => {
      subscription.remove();
    };
  }, [fetchShift]);

  const value = useMemo<DriverShiftContextValue>(
    () => ({
      shift,
      isLoading,
      error,
      refresh: fetchShift,
      isDriver,
    }),
    [shift, isLoading, error, fetchShift, isDriver],
  );

  return <DriverShiftContext.Provider value={value}>{children}</DriverShiftContext.Provider>;
};

export const useDriverShiftContext = () => {
  const context = useContext(DriverShiftContext);
  if (!context) {
    throw new Error('useDriverShiftContext must be used within a DriverShiftProvider');
  }
  return context;
};
