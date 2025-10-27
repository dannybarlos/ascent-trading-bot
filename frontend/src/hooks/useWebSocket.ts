import { useEffect, useRef, useCallback } from 'react';
import { WebSocketMessage, TradeMessage, StrategyChangeMessage, StatusMessage } from '../types';
import { useBotStore } from '../store/useBotStore';
import { useUIStore } from '../store/useUIStore';

interface UseWebSocketOptions {
  url: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export const useWebSocket = ({
  url,
  reconnectAttempts = 5,
  reconnectInterval = 1000,
  onConnect,
  onDisconnect,
  onError,
}: UseWebSocketOptions) => {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const addTrade = useBotStore((state) => state.addTrade);
  const setStatus = useBotStore((state) => state.setStatus);
  const setStrategy = useBotStore((state) => state.setStrategy);
  const setLastMessage = useBotStore((state) => state.setLastMessage);
  const addNotification = useUIStore((state) => state.addNotification);

  const handleMessage = useCallback((message: WebSocketMessage) => {
    setLastMessage(message);

    switch (message.type) {
      case 'trade': {
        const tradeMsg = message as TradeMessage;
        addTrade(tradeMsg.data);
        addNotification({
          type: 'success',
          message: `Trade executed: ${tradeMsg.data.action.toUpperCase()} ${tradeMsg.data.symbol} @ $${tradeMsg.data.price}`,
          duration: 5000,
        });
        break;
      }

      case 'strategy_change': {
        const strategyMsg = message as StrategyChangeMessage;
        setStrategy(strategyMsg.strategy);
        addNotification({
          type: 'info',
          message: `Strategy changed to ${strategyMsg.strategy}`,
          duration: 3000,
        });
        break;
      }

      case 'status': {
        const statusMsg = message as StatusMessage;
        setStatus(statusMsg.status);
        addNotification({
          type: 'info',
          message: `Bot status: ${statusMsg.status}`,
          duration: 3000,
        });
        break;
      }

      case 'error': {
        addNotification({
          type: 'error',
          message: message.message,
          duration: 5000,
        });
        break;
      }

      default:
        console.warn('[WebSocket] Unknown message type:', message);
    }
  }, [addTrade, setStatus, setStrategy, setLastMessage, addNotification]);

  const connect = useCallback(() => {
    try {
      console.log(`[WebSocket] Connecting to ${url}...`);
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('[WebSocket] Connected successfully');
        reconnectAttemptsRef.current = 0;
        wsRef.current = ws;
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data) as WebSocketMessage;
          console.log('[WebSocket] Message received:', parsed);
          handleMessage(parsed);
        } catch (err) {
          console.error('[WebSocket] Failed to parse message:', event.data, err);
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        onError?.(error);
      };

      ws.onclose = (event) => {
        console.log(`[WebSocket] Connection closed (code: ${event.code})`);
        wsRef.current = null;
        onDisconnect?.();

        // Attempt to reconnect if it wasn't a clean close
        if (
          event.code !== 1000 &&
          reconnectAttemptsRef.current < reconnectAttempts
        ) {
          reconnectAttemptsRef.current++;
          const delay = Math.min(
            reconnectInterval * Math.pow(2, reconnectAttemptsRef.current),
            30000
          );
          console.log(
            `[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current}/${reconnectAttempts})`
          );

          reconnectTimeoutRef.current = setTimeout(connect, delay);
        } else if (reconnectAttemptsRef.current >= reconnectAttempts) {
          addNotification({
            type: 'error',
            message: 'WebSocket connection lost. Please refresh the page.',
            duration: 0, // Persistent notification
          });
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('[WebSocket] Failed to create connection:', error);
    }
  }, [url, reconnectAttempts, reconnectInterval, handleMessage, onConnect, onDisconnect, onError, addNotification]);

  useEffect(() => {
    connect();

    return () => {
      console.log('[WebSocket] Cleaning up...');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
        wsRef.current.close(1000, 'Component unmounted');
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('[WebSocket] Cannot send message, connection not open');
    }
  }, []);

  return {
    sendMessage,
    socket: wsRef.current,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
  };
};

export default useWebSocket;
