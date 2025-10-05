import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getOngoingOrder } from '~/api/orders';
import useAuth from '~/hooks/useAuth';
import { useWebSocketContext } from '~/context/WebSocketContext';
import type { OrderNotificationDto } from '~/interfaces/Order';
import { mergeOrderLikeData } from '~/utils/order';

const TERMINAL_STATUSES = new Set(['DELIVERED', 'CANCELED', 'REJECTED']);

export type OngoingOrderData = Partial<OrderNotificationDto> & {
  orderId?: number | string | null;
};

const normalizeStatus = (status: unknown) => {
  if (!status) {
    return null;
  }

  return String(status).toUpperCase();
};

const resolveLatestStatus = (order: OngoingOrderData | null) => {
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

export default function useOngoingOrder() {
  const { requiresAuth } = useAuth();
  const { latestOrderUpdate, orderUpdates } = useWebSocketContext();

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

  const baseOrder = (requiresAuth ? queryResult.data : null) as OngoingOrderData | null;

  const websocketOrder = useMemo(() => {
    if (!requiresAuth) {
      return null;
    }

    const baseOrderId = baseOrder?.orderId ?? null;

    if (baseOrderId != null) {
      const keyedUpdate = orderUpdates[String(baseOrderId)];
      if (keyedUpdate) {
        return keyedUpdate as OngoingOrderData;
      }
    }

    if (latestOrderUpdate?.orderId != null) {
      if (!baseOrderId || latestOrderUpdate.orderId === baseOrderId) {
        return latestOrderUpdate as OngoingOrderData;
      }

      const keyedUpdate = orderUpdates[String(latestOrderUpdate.orderId)];
      if (keyedUpdate) {
        return keyedUpdate as OngoingOrderData;
      }
    }

    if (!baseOrderId) {
      const firstKey = Object.keys(orderUpdates).find((key) => orderUpdates[key]);
      if (firstKey) {
        return orderUpdates[firstKey] as OngoingOrderData;
      }
    }

    return null;
  }, [baseOrder?.orderId, latestOrderUpdate, orderUpdates, requiresAuth]);

  const mergedOrder = useMemo(() => {
    if (!requiresAuth) {
      return null;
    }

    return mergeOrderLikeData<OngoingOrderData>(baseOrder, websocketOrder);
  }, [baseOrder, requiresAuth, websocketOrder]);

  const resolvedOrderId =
    mergedOrder?.orderId ?? websocketOrder?.orderId ?? baseOrder?.orderId ?? null;

  const terminalStatus = resolveLatestStatus(mergedOrder);
  const isTerminal = terminalStatus ? TERMINAL_STATUSES.has(terminalStatus) : false;

  const order =
    requiresAuth && mergedOrder && !isTerminal
      ? ({ ...mergedOrder, orderId: resolvedOrderId } as OngoingOrderData)
      : null;

  return {
    order,
    isLoading: requiresAuth ? queryResult.isLoading : false,
    isFetching: requiresAuth ? queryResult.isFetching : false,
    refetch: queryResult.refetch,
    error: queryResult.error,
    hasFetched: requiresAuth ? queryResult.isFetched : false,
  };
}
