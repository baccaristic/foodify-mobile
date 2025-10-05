import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AppState, AppStateStatus } from 'react-native';

import { getOngoingOrder } from '~/api/orders';
import type { OrderDto } from '~/interfaces/Order';
import useAuth from '~/hooks/useAuth';
import { useWebSocketContext } from '~/context/WebSocketContext';
import { isOrderStatusActive } from '~/utils/orderStatus';

export const ONGOING_ORDER_QUERY_KEY = ['orders', 'ongoing'] as const;

type SetOngoingOrderAction =
  | OrderDto
  | null
  | ((previous: OrderDto | null) => OrderDto | null);

type SetBannerCollapsedAction = boolean | ((previous: boolean) => boolean);

interface OngoingOrderContextValue {
  order: OrderDto | null;
  isLoading: boolean;
  isFetching: boolean;
  refetch: () => Promise<OrderDto | null>;
  setOrder: (action: SetOngoingOrderAction) => void;
  isBannerCollapsed: boolean;
  setBannerCollapsed: (action: SetBannerCollapsedAction) => void;
}

const OngoingOrderContext = createContext<OngoingOrderContextValue | undefined>(undefined);

export const OngoingOrderProvider = ({ children }: { children: ReactNode }) => {
  const { requiresAuth } = useAuth();
  const { latestOrderUpdate } = useWebSocketContext();
  const queryClient = useQueryClient();
  const isMountedRef = useRef(true);
  const [isBannerCollapsed, setIsBannerCollapsed] = useState(false);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const setOrder = useCallback(
    (action: SetOngoingOrderAction) => {
      queryClient.setQueryData<OrderDto | null>(ONGOING_ORDER_QUERY_KEY, (previous) => {
        const current = previous ?? null;
        if (typeof action === 'function') {
          return action(current);
        }
        return action ?? null;
      });
    },
    [queryClient],
  );

  useEffect(() => {
    if (!requiresAuth) {
      setOrder(null);
      setIsBannerCollapsed(false);
    }
  }, [requiresAuth, setIsBannerCollapsed, setOrder]);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ONGOING_ORDER_QUERY_KEY,
    queryFn: getOngoingOrder,
    enabled: requiresAuth,
    staleTime: 30_000,
    gcTime: 0,
    refetchInterval: (order) => {
      if (!order) {
        return false;
      }

      return isOrderStatusActive(order.status) ? 60_000 : false;
    },
    refetchIntervalInBackground: false,
    retry: 1,
  });

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (!requiresAuth) {
        return;
      }

      if (nextState !== 'active') {
        return;
      }

      refetch().catch((error) => {
        if (__DEV__) {
          console.warn('Failed to refresh ongoing order after app focus:', error);
        }
      });
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [refetch, requiresAuth]);

  const refetchOrder = useCallback(async () => {
    const result = await refetch();
    if (result.error) {
      throw result.error;
    }

    return (result.data ?? null) as OrderDto | null;
  }, [refetch]);

  useEffect(() => {
    if (!requiresAuth) {
      return;
    }

    if (!latestOrderUpdate?.orderId) {
      return;
    }

    refetch().catch((error) => {
      if (__DEV__) {
        console.warn('Failed to refresh ongoing order after update:', error);
      }
    });
  }, [latestOrderUpdate, refetch, requiresAuth]);

  const setBannerCollapsed = useCallback(
    (action: SetBannerCollapsedAction) => {
      setIsBannerCollapsed((previous) => {
        const next = typeof action === 'function' ? action(previous) : action;
        return Boolean(next);
      });
    },
    [],
  );

  useEffect(() => {
    if (!data || !isOrderStatusActive(data.status)) {
      setIsBannerCollapsed(false);
    }
  }, [data, setIsBannerCollapsed]);

  const value = useMemo<OngoingOrderContextValue>(
    () => ({
      order: data ?? null,
      isLoading: requiresAuth ? isLoading : false,
      isFetching,
      refetch: async () => {
        try {
          return await refetchOrder();
        } catch (error) {
          if (__DEV__) {
            console.warn('Failed to refetch ongoing order:', error);
          }
          if (!isMountedRef.current) {
            throw error;
          }
          return data ?? null;
        }
      },
      setOrder,
      isBannerCollapsed,
      setBannerCollapsed,
    }),
    [
      data,
      isBannerCollapsed,
      isFetching,
      isLoading,
      refetchOrder,
      requiresAuth,
      setBannerCollapsed,
      setOrder,
    ],
  );

  return <OngoingOrderContext.Provider value={value}>{children}</OngoingOrderContext.Provider>;
};

export const useOngoingOrderContext = () => {
  const context = React.useContext(OngoingOrderContext);
  if (!context) {
    throw new Error('useOngoingOrderContext must be used within an OngoingOrderProvider');
  }
  return context;
};
