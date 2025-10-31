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
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { getOngoingOrder } from '~/api/orders';
import useAuth from '~/hooks/useAuth';
import type { OrderNotificationDto } from '~/interfaces/Order';
import { ensureOngoingOrderNotificationChannel, ONGOING_ORDER_NOTIFICATION_CHANNEL_ID } from '~/services/notifications';
import { mergeOrderLikeData } from '~/utils/order';

const TERMINAL_STATUSES = new Set(['DELIVERED', 'CANCELED', 'REJECTED']);

export type OngoingOrderData = Partial<OrderNotificationDto> & {
  orderId?: number | string | null;
};

interface OngoingOrderContextValue {
  order: OngoingOrderData | null;
  updateOrder: (patch: Partial<OngoingOrderData> | null | undefined) => void;
  clearOrder: () => void;
  isLoading: boolean;
  isFetching: boolean;
  hasFetched: boolean;
  refetch: UseQueryResult<OngoingOrderData | null>['refetch'];
  error: UseQueryResult<OngoingOrderData | null>['error'];
  deliveredCelebration: OngoingOrderData | null;
  dismissDeliveredCelebration: () => void;
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

const formatStatusForDisplay = (status: string | null) => {
  if (!status) {
    return null;
  }

  return status
    .toLowerCase()
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
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
  const [deliveredCelebration, setDeliveredCelebration] =
    useState<OngoingOrderData | null>(null);
  const ongoingNotificationIdRef = useRef<string | null>(null);
  const lastNotificationKeyRef = useRef<string | null>(null);

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
      setDeliveredCelebration(null);
    }
  }, [requiresAuth]);

  const updateOrder = useCallback(
    (patch: Partial<OngoingOrderData> | null | undefined) => {
      if (!requiresAuth) {
        return;
      }

      if (!patch) {
        setOrder(null);
        setDeliveredCelebration(null);
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
        const mergedOrder = (merged ?? patch ?? null) as OngoingOrderData | null;
        const nextOrder =
          mergedOrder != null
            ? ({
                ...mergedOrder,
                ...(resolvedId != null ? { orderId: resolvedId } : {}),
              } as OngoingOrderData)
            : null;

        const nextStatus = resolveLatestStatus(nextOrder);

        if (nextStatus === 'DELIVERED' && nextOrder) {
          setDeliveredCelebration((previous) => {
            if (!previous) {
              return nextOrder;
            }

            const previousId = previous.orderId != null ? String(previous.orderId) : null;
            const nextNormalizedId = nextOrder.orderId != null ? String(nextOrder.orderId) : null;

            if (previousId && nextNormalizedId && previousId === nextNormalizedId) {
              return previous;
            }

            return nextOrder;
          });
        }

        const sanitized = sanitizeOrder(nextOrder);

        return sanitized ?? null;
      });
    },
    [requiresAuth],
  );

  const dismissDeliveredCelebration = useCallback(() => {
    setDeliveredCelebration(null);
  }, []);

  const clearOrder = useCallback(() => {
    setOrder(null);
    setDeliveredCelebration(null);
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    let isMounted = true;

    const syncOngoingNotification = async () => {
      const currentOrder = order ?? null;

      if (!currentOrder) {
        lastNotificationKeyRef.current = null;
        const existingId = ongoingNotificationIdRef.current;
        if (existingId) {
          try {
            await Notifications.dismissNotificationAsync(existingId);
          } catch (error) {
            console.warn('Failed to dismiss ongoing order notification', error);
          } finally {
            ongoingNotificationIdRef.current = null;
          }
        }
        return;
      }

      if (Platform.OS === 'android') {
        try {
          await ensureOngoingOrderNotificationChannel();
        } catch (error) {
          console.warn('Failed to ensure ongoing order notification channel', error);
        }
      }

      const latestStatus = resolveLatestStatus(currentOrder);
      const formattedStatus = formatStatusForDisplay(latestStatus);
      const normalizedOrderId =
        currentOrder.orderId != null ? String(currentOrder.orderId) : null;

      const notificationKey = `${normalizedOrderId ?? 'unknown'}|${formattedStatus ?? ''}`;

      if (notificationKey === lastNotificationKeyRef.current && ongoingNotificationIdRef.current) {
        return;
      }

      lastNotificationKeyRef.current = notificationKey;

      const title = normalizedOrderId ? `Order #${normalizedOrderId}` : 'Your order';
      const body = formattedStatus
        ? `Current status: ${formattedStatus}`
        : 'Your order is still in progress.';

      const notificationContent: Notifications.NotificationContentInput = {
        title,
        body,
        data: {
          orderId: normalizedOrderId,
          status: latestStatus ?? null,
          type: 'ongoing-order',
        },
        sticky: true,
        autoDismiss: false,
      };

      if (Platform.OS === 'android') {
        notificationContent.channelId = ONGOING_ORDER_NOTIFICATION_CHANNEL_ID;
        notificationContent.priority = Notifications.AndroidNotificationPriority.MAX;
      }

      const existingId = ongoingNotificationIdRef.current;
      if (existingId) {
        try {
          await Notifications.dismissNotificationAsync(existingId);
        } catch (error) {
          console.warn('Failed to dismiss previous ongoing order notification', error);
        }
      }

      try {
        const identifier = await Notifications.scheduleNotificationAsync({
          content: notificationContent,
          trigger: null,
        });

        if (!isMounted) {
          return;
        }

        ongoingNotificationIdRef.current = identifier;
      } catch (error) {
        console.warn('Failed to update ongoing order notification', error);
      }
    };

    void syncOngoingNotification();

    return () => {
      isMounted = false;
    };
  }, [order]);

  useEffect(() => {
    return () => {
      if (Platform.OS === 'web') {
        return;
      }

      const existingId = ongoingNotificationIdRef.current;
      if (!existingId) {
        return;
      }

      void Notifications.dismissNotificationAsync(existingId).catch((error) => {
        console.warn('Failed to dismiss ongoing order notification on cleanup', error);
      });
    };
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
      updateOrder,
      clearOrder,
      isLoading: requiresAuth ? queryResult.isLoading : false,
      isFetching: requiresAuth ? queryResult.isFetching : false,
      hasFetched: requiresAuth ? queryResult.isFetched : false,
      refetch: queryResult.refetch,
      error: queryResult.error,
      deliveredCelebration,
      dismissDeliveredCelebration,
    }),
    [
      clearOrder,
      deliveredCelebration,
      dismissDeliveredCelebration,
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
