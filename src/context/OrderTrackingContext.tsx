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
import { BASE_API_URL } from '@env';

import type { CreateOrderResponse, OrderDto } from '~/interfaces/Order';
import useAuth from '~/hooks/useAuth';
import {
  EMPTY_ORDER,
  buildStompFrame,
  isTerminalStatus,
  mergeOrderWithUpdate,
  parseStompFrames,
  prepareOrderSnapshot,
  resolveWebSocketUrl,
} from '~/services/orderTrackingHelpers';
import { loadActiveOrderId, persistActiveOrderId } from '~/services/orderTrackingStorage';

export type OrderTrackingConnectionState = 'idle' | 'connecting' | 'connected' | 'error';

type OrderTrackingContextValue = {
  order: CreateOrderResponse | null;
  latestUpdate: OrderDto | null;
  activeOrderId: number | null;
  connectionState: OrderTrackingConnectionState;
  beginTrackingOrder: (order: CreateOrderResponse) => void;
  hydrateTrackedOrder: (order: CreateOrderResponse) => void;
  stopTrackingOrder: () => void;
};

const OrderTrackingContext = createContext<OrderTrackingContextValue | undefined>(undefined);

const coerceOrderId = (candidate: unknown): number | null => {
  if (typeof candidate === 'number' && Number.isFinite(candidate)) {
    return candidate;
  }

  const parsed = Number(candidate);
  return Number.isFinite(parsed) ? parsed : null;
};

export const OrderTrackingProvider = ({ children }: { children: ReactNode }) => {
  const { accessToken } = useAuth();
  const [order, setOrder] = useState<CreateOrderResponse | null>(null);
  const [latestUpdate, setLatestUpdate] = useState<OrderDto | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<number | null>(null);
  const [connectionState, setConnectionState] = useState<OrderTrackingConnectionState>('idle');

  const websocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasSubscribedRef = useRef(false);
  const activeOrderIdRef = useRef<number | null>(null);
  const initialLoadRef = useRef(false);

  useEffect(() => {
    activeOrderIdRef.current = activeOrderId;
  }, [activeOrderId]);

  const applyOrderSnapshot = useCallback(
    (snapshot: CreateOrderResponse, resetLatestUpdate: boolean) => {
      const nextOrderId = coerceOrderId(snapshot?.orderId);
      if (nextOrderId == null) {
        console.warn('Cannot track order without a numeric identifier.', snapshot?.orderId);
        return;
      }

      setOrder((previous) => {
        const prepared = prepareOrderSnapshot(snapshot, previous?.status ?? EMPTY_ORDER.status);
        if (previous && previous.orderId === nextOrderId) {
          return {
            ...previous,
            ...prepared,
            orderId: nextOrderId,
            restaurant: {
              ...previous.restaurant,
              ...prepared.restaurant,
            },
            delivery: {
              ...previous.delivery,
              ...prepared.delivery,
            },
            payment: {
              ...previous.payment,
              ...prepared.payment,
            },
            workflow: prepared.workflow,
          } satisfies CreateOrderResponse;
        }

        return {
          ...prepared,
          orderId: nextOrderId,
        } satisfies CreateOrderResponse;
      });

      setActiveOrderId(nextOrderId);
      setLatestUpdate((current) => {
        if (resetLatestUpdate) {
          return null;
        }

        return current && current.id === nextOrderId ? current : null;
      });
    },
    [],
  );

  const beginTrackingOrder = useCallback(
    (snapshot: CreateOrderResponse) => {
      applyOrderSnapshot(snapshot, true);
    },
    [applyOrderSnapshot],
  );

  const hydrateTrackedOrder = useCallback(
    (snapshot: CreateOrderResponse) => {
      applyOrderSnapshot(snapshot, false);
    },
    [applyOrderSnapshot],
  );

  const stopTrackingOrder = useCallback(() => {
    setActiveOrderId(null);
    setLatestUpdate(null);
  }, []);

  useEffect(() => {
    if (initialLoadRef.current) {
      return;
    }

    initialLoadRef.current = true;
    let cancelled = false;

    loadActiveOrderId()
      .then((stored) => {
        if (!cancelled && stored != null) {
          setActiveOrderId((current) => (current == null ? stored : current));
        }
      })
      .catch((error) => {
        console.warn('Failed to restore active order identifier.', error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const persistedOrderIdRef = useRef<number | null | undefined>(undefined);
  useEffect(() => {
    if (persistedOrderIdRef.current === activeOrderId) {
      return;
    }

    persistedOrderIdRef.current = activeOrderId;
    persistActiveOrderId(activeOrderId).catch((error) =>
      console.warn('Failed to persist active order identifier.', error),
    );
  }, [activeOrderId]);

  useEffect(() => {
    if (!accessToken || activeOrderId == null) {
      setConnectionState('idle');

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      const socket = websocketRef.current;
      websocketRef.current = null;

      if (socket) {
        if (socket.readyState === WebSocket.OPEN) {
          try {
            socket.close();
          } catch {
            // ignore
          }
        } else {
          socket.close();
        }
      }

      return undefined;
    }

    const { url, hostHeader } = resolveWebSocketUrl(BASE_API_URL);
    let cancelled = false;

    const connect = () => {
      if (cancelled) {
        return;
      }

      setConnectionState('connecting');

      const socket = new WebSocket(url, [], {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      websocketRef.current = socket;
      hasSubscribedRef.current = false;

      socket.onopen = () => {
        if (cancelled) {
          return;
        }

        socket.send(
          buildStompFrame('CONNECT', {
            'accept-version': '1.2',
            host: hostHeader,
            Authorization: `Bearer ${accessToken}`,
            'heart-beat': '0,0',
          }),
        );
      };

      socket.onmessage = (event) => {
        if (cancelled || typeof event.data !== 'string') {
          return;
        }

        parseStompFrames(event.data).forEach((frame) => {
          const command = frame.command.toUpperCase();

          if (command === 'CONNECTED') {
            setConnectionState('connected');
            if (!hasSubscribedRef.current) {
              socket.send(
                buildStompFrame('SUBSCRIBE', {
                  id: `order-tracking-${activeOrderId}`,
                  destination: '/user/queue/orders',
                  ack: 'auto',
                }),
              );
              hasSubscribedRef.current = true;
            }
            return;
          }

          if (command === 'MESSAGE') {
            const body = frame.body?.trim();
            if (!body) {
              return;
            }

            try {
              const payload = JSON.parse(body) as OrderDto;
              const trackedId = activeOrderIdRef.current;

              if (payload?.id && trackedId && payload.id === trackedId) {
                setLatestUpdate(payload);
                setOrder((previous) => mergeOrderWithUpdate(previous, payload));

                if (isTerminalStatus(payload.status)) {
                  setActiveOrderId((current) => (current === payload.id ? null : current));
                }
              }
            } catch (error) {
              console.warn('Failed to parse order update payload.', error);
            }
            return;
          }

          if (command === 'ERROR') {
            setConnectionState('error');
          }
        });
      };

      socket.onerror = () => {
        if (!cancelled) {
          setConnectionState('error');
        }
      };

      socket.onclose = () => {
        if (cancelled) {
          return;
        }

        setConnectionState('connecting');

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = null;
          connect();
        }, 5000);
      };
    };

    connect();

    return () => {
      cancelled = true;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      const socket = websocketRef.current;
      websocketRef.current = null;

      if (socket) {
        if (socket.readyState === WebSocket.OPEN) {
          try {
            socket.send(buildStompFrame('DISCONNECT', {}));
          } catch (error) {
            console.warn('Failed to send disconnect frame.', error);
          }
          socket.close();
        } else {
          socket.close();
        }
      }
    };
  }, [accessToken, activeOrderId]);

  useEffect(() => {
    if (activeOrderId == null) {
      setConnectionState('idle');
    }
  }, [activeOrderId]);

  const value = useMemo<OrderTrackingContextValue>(
    () => ({
      order,
      latestUpdate,
      activeOrderId,
      connectionState,
      beginTrackingOrder,
      hydrateTrackedOrder,
      stopTrackingOrder,
    }),
    [
      order,
      latestUpdate,
      activeOrderId,
      connectionState,
      beginTrackingOrder,
      hydrateTrackedOrder,
      stopTrackingOrder,
    ],
  );

  return <OrderTrackingContext.Provider value={value}>{children}</OrderTrackingContext.Provider>;
};

export const useOrderTrackingContext = () => {
  const context = useContext(OrderTrackingContext);
  if (!context) {
    throw new Error('useOrderTrackingContext must be used within an OrderTrackingProvider');
  }
  return context;
};
