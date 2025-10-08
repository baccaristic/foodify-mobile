import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import * as Notifications from 'expo-notifications';

import useAuth from '~/hooks/useAuth';
import { BASE_WS_URL } from '@env';
import { useOngoingOrderContext } from '~/context/OngoingOrderContext';
import useDriverShift from '~/hooks/useDriverShift';
import type {
  CreateOrderResponse,
  OrderNotificationDto,
  OrderStatusHistoryDto,
  OrderWorkflowStepDto,
} from '~/interfaces/Order';

interface WebSocketContextValue {
  client: Client | null;
  isConnected: boolean;
  sendMessage: (destination: string, body: any) => void;
  latestOrderUpdate: OrderUpdatePayload | null;
  orderUpdates: Record<string, OrderUpdatePayload>;
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined);

export type OrderStatusHistoryEntry = OrderStatusHistoryDto;

export type OrderUpdatePayload = Partial<OrderNotificationDto> &
  Partial<CreateOrderResponse> & {
    orderId?: number;
    status?: string;
    statusHistory?: OrderStatusHistoryEntry[];
    workflow?: OrderWorkflowStepDto[];
    [key: string]: unknown;
  };

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const { accessToken, requiresAuth, user } = useAuth();
  const { updateOrder: updateOngoingOrder } = useOngoingOrderContext();
  const { refresh: refreshDriverShift, isDriver } = useDriverShift();
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [latestOrderUpdate, setLatestOrderUpdate] = useState<OrderUpdatePayload | null>(null);
  const [orderUpdates, setOrderUpdates] = useState<Record<string, OrderUpdatePayload>>({});
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      appStateRef.current = nextState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const displayOrderStatusNotification = useCallback(async (payload: OrderUpdatePayload) => {
    const { orderId, status, statusHistory } = payload;

    const latestStatus = statusHistory?.length
      ? statusHistory[statusHistory.length - 1]?.newStatus ?? status
      : status;

    const orderIdentifier = orderId ? `Order #${orderId}` : 'Your order';

    const formattedStatus = latestStatus
      ? latestStatus
          .toString()
          .toLowerCase()
          .split('_')
          .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
          .join(' ')
      : 'has been updated';

    try {
      const notificationInput = {
        title: `${orderIdentifier} update`,
        body: latestStatus
          ? `${orderIdentifier} is now ${formattedStatus}.`
          : `${orderIdentifier} has a new update.`,
        data: {
          orderId: orderId ?? null,
          status: latestStatus ?? null,
        },
      } satisfies Notifications.NotificationContentInput;

      if (appStateRef.current === 'active') {
        await Notifications.presentNotificationAsync({ content: notificationInput });
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: notificationInput,
        trigger: null,
      });
    } catch (error) {
      console.warn('Failed to schedule order update notification:', error);
    }
  }, []);

  useEffect(() => {
    if (!requiresAuth || !accessToken) {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    if (!BASE_WS_URL) {
      console.warn('BASE_WS_URL is not defined. Skipping WebSocket connection.');
      return;
    }

    const stompClient = new Client({
      webSocketFactory: () => new SockJS(BASE_WS_URL + ''),
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      debug: (msg) => console.log('[STOMP]', msg),
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    // ✅ Subscribe to personal user queue once connected
    stompClient.onConnect = () => {
      console.log('✅ STOMP connected');
      setIsConnected(true);

      if (isDriver) {
        refreshDriverShift().catch((err) => {
          console.warn('Failed to refresh driver shift after socket connect:', err);
        });
      }

      stompClient.subscribe(`/user/${user?.id}/queue/orders`, (message: IMessage) => {
        try {
          const data = JSON.parse(message.body) as OrderUpdatePayload;
          console.log('📦 Received order update:', data);
          setLatestOrderUpdate(data);
          if (data?.orderId != null) {
            const key = String(data.orderId);
            setOrderUpdates((previous) => ({
              ...previous,
              [key]: {
                ...previous[key],
                ...data,
              },
            }));
          }
          updateOngoingOrder(data);
          displayOrderStatusNotification(data);
        } catch {
          console.warn('Received non-JSON message from /user/queue/orders:', message.body);
        }
      });
    };

    stompClient.onDisconnect = () => {
      console.log('❌ STOMP disconnected');
      setIsConnected(false);
    };

    stompClient.onStompError = (frame) => {
      console.error('Broker error:', frame.headers['message'], frame.body);
    };

    stompClient.activate();
    clientRef.current = stompClient;

    return () => {
      stompClient.deactivate();
      clientRef.current = null;
      setIsConnected(false);
      setLatestOrderUpdate(null);
      setOrderUpdates({});
    };
  }, [
    accessToken,
    requiresAuth,
    user?.id,
    displayOrderStatusNotification,
    updateOngoingOrder,
    isDriver,
    refreshDriverShift,
  ]);

  const sendMessage = useCallback((destination: string, body: any) => {
    const client = clientRef.current;
    if (!client || !client.connected) {
      console.warn('Unable to send message — STOMP client not connected.');
      return;
    }

    try {
      client.publish({
        destination,
        body: typeof body === 'string' ? body : JSON.stringify(body),
      });
    } catch (err) {
      console.error('Error sending STOMP message:', err);
    }
  }, []);

  const value = useMemo<WebSocketContextValue>(
    () => ({
      client: clientRef.current,
      isConnected,
      sendMessage,
      latestOrderUpdate,
      orderUpdates,
    }),
    [isConnected, latestOrderUpdate, orderUpdates, sendMessage],
  );

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};

export const useWebSocketContext = () => {
  const context = React.useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};
