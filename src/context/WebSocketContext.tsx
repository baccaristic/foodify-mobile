import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Client } from '@stomp/stompjs';
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
  const { accessToken, requiresAuth } = useAuth();
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Disconnect if auth not ready
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

    // Create SockJS-backed STOMP client
    const stompClient = new Client({
      // If backend only supports SockJS:
      webSocketFactory: () => new SockJS(BASE_WS_URL + ''),
      // If backend supports plain WebSocket, you can use this instead:
      // brokerURL: `${BASE_WS_URL.replace(/^http/, 'ws')}`,

      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      debug: (msg) => console.log('[STOMP]', msg),
      reconnectDelay: 5000, // Auto-reconnect
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
    });

    stompClient.onConnect = () => {
      console.log('✅ STOMP connected');
      setIsConnected(true);
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
      console.log('🧹 Cleaning up STOMP connection...');
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
