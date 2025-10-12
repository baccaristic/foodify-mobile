import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { getOngoingOrder } from '~/api/orders';
import useAuth from '~/hooks/useAuth';
import type { OrderNotificationDto } from '~/interfaces/Order';
import { mergeOrderLikeData } from '~/utils/order';

const TERMINAL_STATUSES = new Set(['DELIVERED', 'CANCELED', 'REJECTED']);

export type OngoingOrderData = Partial<OrderNotificationDto> & {
  orderId?: number | string | null;
};

interface OngoingOrderContextValue {
  order: OngoingOrderData | null;
  onGoingOrder: OngoingOrderData | null;
  updateOrder: (patch: Partial<OngoingOrderData> | null | undefined) => void;
  clearOrder: () => void;
  isLoading: boolean;
  isFetching: boolean;
  hasFetched: boolean;
  refetch: UseQueryResult<OngoingOrderData | null>['refetch'];
  error: UseQueryResult<OngoingOrderData | null>['error'];
}

const OngoingOrderContext = createContext<OngoingOrderContextValue | undefined>(undefined);

const normalizeStatus = (status: unknown) => {
  if (!status) {
    return null;
  }

  return String(status).toUpperCase();
};

const resolveLatestStatus = (order: OngoingOrderData | null | undefined) => {
  if (!order) {
    return null;
  }

  if (order.statusHistory?.length) {
    const lastEntry = order.statusHistory[order.statusHistory.length - 1];
    if (lastEntry?.newStatus) {
      return normalizeStatus(lastEntry.newStatus);
    }
  }

  return normalizeStatus(order.status);
};

const sanitizeOrder = (order: OngoingOrderData | null | undefined) => {
  if (!order) {
    return null;
  }

  const status = resolveLatestStatus(order);
  if (status && TERMINAL_STATUSES.has(status)) {
    return null;
  }

  const resolvedOrderId = order.orderId ?? null;

  return {
    ...order,
    ...(resolvedOrderId != null ? { orderId: resolvedOrderId } : {}),
  } satisfies OngoingOrderData;
};

export const OngoingOrderProvider = ({ children }: { children: ReactNode }) => {
  const { requiresAuth } = useAuth();
  const [order, setOrder] = useState<OngoingOrderData | null>(null);

  const queryResult = useQuery<OngoingOrderData | null>({
    queryKey: ['orders', 'ongoing'],
    queryFn: async () => {
      const data = await getOngoingOrder();
      return data ?? null;
    },
    enabled: requiresAuth,
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: Number.POSITIVE_INFINITY,
    retry: 1,
  });

  useEffect(() => {
    if (!requiresAuth) {
      setOrder(null);
    }
  }, [requiresAuth]);

  const updateOrder = useCallback(
    (patch: Partial<OngoingOrderData> | null | undefined) => {
      if (!requiresAuth) {
        return;
      }

      if (!patch) {
        setOrder(null);
        return;
      }

      setOrder((current) => {
        const currentId = current?.orderId ?? null;
        const patchId = patch.orderId ?? null;

        if (
          currentId != null &&
          patchId != null &&
          String(currentId) !== String(patchId)
        ) {
          return current;
        }

        const merged = mergeOrderLikeData<OngoingOrderData>(
          (current ?? null) as OngoingOrderData | null,
          patch as OngoingOrderData,
        );

        const resolvedId = merged?.orderId ?? patchId ?? currentId ?? null;
        const sanitized = sanitizeOrder(
          merged ? ({ ...merged, orderId: resolvedId } as OngoingOrderData) : null,
        );

        return sanitized ?? null;
      });
    },
    [requiresAuth],
  );

  const clearOrder = useCallback(() => {
    setOrder(null);
  }, []);

  useEffect(() => {
    if (!requiresAuth) {
      return;
    }

    if (!queryResult.isFetched) {
      return;
    }

    if (!queryResult.data) {
      setOrder(null);
      return;
    }

    updateOrder(queryResult.data);
  }, [queryResult.data, queryResult.isFetched, requiresAuth, updateOrder]);

  const value = useMemo<OngoingOrderContextValue>(
    () => ({
      order,
      onGoingOrder: order,
      updateOrder,
      clearOrder,
      isLoading: requiresAuth ? queryResult.isLoading : false,
      isFetching: requiresAuth ? queryResult.isFetching : false,
      hasFetched: requiresAuth ? queryResult.isFetched : false,
      refetch: queryResult.refetch,
      error: queryResult.error,
    }),
    [
      clearOrder,
      order,
      queryResult.error,
      queryResult.isFetched,
      queryResult.isFetching,
      queryResult.isLoading,
      queryResult.refetch,
      requiresAuth,
      updateOrder,
    ],
  );

  return <OngoingOrderContext.Provider value={value}>{children}</OngoingOrderContext.Provider>;
};

export const useOngoingOrderContext = () => {
  const context = useContext(OngoingOrderContext);
  if (!context) {
    throw new Error('useOngoingOrderContext must be used within an OngoingOrderProvider');
  }
  return context;
};
