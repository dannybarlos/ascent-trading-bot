import { useEffect, useState, useRef } from "react";

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

const useWebSocketSimple = (url: string): [WebSocketMessage | null, WebSocket | null] => {
  const [message, setMessage] = useState<WebSocketMessage | null>(null);
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    let ws: WebSocket;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      try {
        console.log(`[WS] Connecting to ${url}...`);
        ws = new WebSocket(url);

        ws.onopen = () => {
          console.log(`[WS] Connected successfully`);
          reconnectAttempts.current = 0;
          setSocket(ws);
        };

        ws.onmessage = (event) => {
          try {
            const parsed = JSON.parse(event.data);
            console.log(`[WS] Message received:`, parsed);

            if (parsed && parsed.type && ["trade", "strategy_change", "status"].includes(parsed.type)) {
              setMessage(parsed as WebSocketMessage);
            } else {
              console.warn("[WS] Unknown message format:", parsed);
            }
          } catch (err) {
            console.error("[WS] Failed to parse message:", event.data, err);
          }
        };

        ws.onerror = (error) => {
          console.error("[WS] Error:", error);
        };

        ws.onclose = (event) => {
          console.log(`[WS] Connection closed (code: ${event.code})`);
          setSocket(null);

          // Only reconnect if it was unexpected and we haven't exceeded max attempts
          if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
            reconnectAttempts.current++;
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
            console.log(`[WS] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`);

            reconnectTimeout = setTimeout(connect, delay);
          } else {
            console.log(`[WS] Not reconnecting (code: ${event.code}, attempts: ${reconnectAttempts.current})`);
          }
        };

      } catch (error) {
        console.error("[WS] Failed to create WebSocket:", error);
      }
    };

    connect();

    return () => {
      console.log("[WS] Cleaning up...");
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      if (ws && ws.readyState !== WebSocket.CLOSED) {
        ws.close(1000, "Component unmounted");
      }
    };
  }, [url]); // Only depend on URL

  return [message, socket];
};

export default useWebSocketSimple;