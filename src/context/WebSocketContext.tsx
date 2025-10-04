import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

import useAuth from '~/hooks/useAuth';
import { BASE_WS_URL } from '@env';

interface WebSocketContextValue {
  client: Client | null;
  isConnected: boolean;
  sendMessage: (destination: string, body: any) => void;
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const { accessToken, requiresAuth, user } = useAuth();
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

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
      webSocketFactory: () => new SockJS(BASE_WS_URL),
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

      const subscription = stompClient.subscribe(`/user/${user?.id}/queue/orders`, (message: IMessage) => {
        try {
          const data = JSON.parse(message.body);
          console.log('📦 Received order update:', data);
          // 👉 You can dispatch to context/global state here if needed
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
    };
  }, [accessToken, requiresAuth]);

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
    }),
    [isConnected, sendMessage],
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
