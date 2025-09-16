import { useEffect, useState, useRef, useCallback } from "react";

export type TradeMessage = {
  type: "trade";
  symbol: string;
  action: string;
  price: number;
  timestamp: string;
};

export type StrategyChangeMessage = {
  type: "strategy_change";
  strategy: string;
};

export type StatusMessage = {
  type: "status";
  status: string;
};

export type WebSocketMessage = TradeMessage | StrategyChangeMessage | StatusMessage;

const useWebSocket = (url: string, onOpen?: (ws: WebSocket) => void): [WebSocketMessage | null, WebSocket | null] => {
  const [message, setMessage] = useState<WebSocketMessage | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const urlRef = useRef(url);
  const onOpenRef = useRef(onOpen);

  // Update refs when props change
  urlRef.current = url;
  onOpenRef.current = onOpen;

  const connect = useCallback(() => {
    if (!isMountedRef.current) return;

    // Clean up any existing connection
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      wsRef.current.close();
    }

    const ws = new WebSocket(urlRef.current);
    wsRef.current = ws;

    ws.onopen = () => {
      console.info(`[WS] Connected to ${urlRef.current}`);
      onOpenRef.current?.(ws);
    };

    ws.onmessage = (event) => {
      if (!isMountedRef.current) return;

      try {
        const parsed = JSON.parse(event.data);

        if (
          parsed &&
          typeof parsed.type === "string" &&
          ["trade", "strategy_change", "status"].includes(parsed.type)
        ) {
          setMessage(parsed as WebSocketMessage);
        } else {
          console.warn("[WS] Ignoring unknown message format:", parsed);
        }
      } catch (err) {
        console.error("[WS] Failed to parse message:", event.data, err);
      }
    };

    ws.onerror = (err) => {
      console.error("[WS] Error occurred:", err);
    };

    ws.onclose = (event) => {
      console.info(`[WS] Connection closed (code: ${event.code})`);
      wsRef.current = null;

      // Only reconnect if component is still mounted and close wasn't intentional
      if (isMountedRef.current && event.code !== 1000 && event.code !== 1001) {
        console.info("[WS] Attempting to reconnect in 3 seconds...");
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      }
    };
  }, []); // Remove dependencies to prevent reconnections on every render

  useEffect(() => {
    isMountedRef.current = true;
    connect();

    return () => {
      isMountedRef.current = false;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      if (wsRef.current &&
          (wsRef.current.readyState === WebSocket.OPEN ||
           wsRef.current.readyState === WebSocket.CONNECTING)) {
        wsRef.current.close(1000, "Component unmounted");
      }
    };
  }, []); // Remove connect dependency to prevent reconnection loops

  return [message, wsRef.current];
};

export default useWebSocket;
