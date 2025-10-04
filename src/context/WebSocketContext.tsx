import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { BASE_WS_URL } from '@env';

import useAuth from '~/hooks/useAuth';

type SendMessageData = Parameters<WebSocket['send']>[0];

interface WebSocketContextValue {
  socket: WebSocket | null;
  isConnected: boolean;
  sendMessage: (data: SendMessageData) => void;
}

const WebSocketContext = createContext<WebSocketContextValue | undefined>(undefined);

export const WebSocketProvider = ({ children }: { children: ReactNode }) => {
  const { accessToken, requiresAuth } = useAuth();
  const socketRef = useRef<WebSocket | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!requiresAuth || !accessToken) {
      const existingSocket = socketRef.current;
      if (existingSocket) {
        if (
          existingSocket.readyState === WebSocket.OPEN ||
          existingSocket.readyState === WebSocket.CONNECTING
        ) {
          existingSocket.close();
        }
      }
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      return;
    }

    if (!BASE_WS_URL) {
      console.warn('BASE_WS_URL is not defined. Skipping WebSocket connection.');
      return;
    }

    const nextSocket = new WebSocket(BASE_WS_URL, undefined, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    socketRef.current = nextSocket;
    setSocket(nextSocket);

    const handleOpen = () => {
      setIsConnected(true);
    };

    const handleClose = () => {
      setIsConnected(false);
    };

    const handleError = (event: WebSocketErrorEvent) => {
      console.warn('WebSocket encountered an error.', event.message);
    };

    const handleMessage = (event: WebSocketMessageEvent) => {
      console.log('WebSocket message received:', event.data);
    };

    nextSocket.onopen = handleOpen;
    nextSocket.onclose = handleClose;
    nextSocket.onerror = (event) => {
      handleError(event);
      handleClose();
    };
    nextSocket.onmessage = handleMessage;

    return () => {
      nextSocket.onopen = null;
      nextSocket.onclose = null;
      nextSocket.onerror = null;
      nextSocket.onmessage = null;

      if (
        nextSocket.readyState === WebSocket.OPEN ||
        nextSocket.readyState === WebSocket.CONNECTING
      ) {
        nextSocket.close();
      }

      if (socketRef.current === nextSocket) {
        socketRef.current = null;
      }

      setSocket((currentSocket) => (currentSocket === nextSocket ? null : currentSocket));
      setIsConnected(false);
    };
  }, [accessToken, requiresAuth]);

  const sendMessage = useCallback((data: SendMessageData) => {
    const currentSocket = socketRef.current;

    if (!currentSocket || currentSocket.readyState !== WebSocket.OPEN) {
      console.warn('Unable to send message. WebSocket is not connected.');
      return;
    }

    currentSocket.send(data);
  }, []);

  const value = useMemo<WebSocketContextValue>(
    () => ({
      socket,
      isConnected,
      sendMessage,
    }),
    [socket, isConnected, sendMessage],
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
