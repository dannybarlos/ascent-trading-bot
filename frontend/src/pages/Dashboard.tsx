import React, { useEffect, useRef, useState } from "react";
import useWebSocketSimple, { WebSocketMessage } from "../hooks/useWebSocket.simple";
import Header from "../components/Header";
import TradeList from "../components/TradeList";
import Controls from "../components/Controls";
import AccountPanel from "../components/AccountPanel";
import PositionTable from "../components/PositionTable";
import ActivityFeed from "../components/ActivityFeed";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Trade {
  symbol: string;
  action: string;
  price: number;
  timestamp: string;
}

const Dashboard: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [status, setStatus] = useState("Unknown"); // UPDATED VERSION 2.0

  // Connect to dedicated WebSocket service on port 8001
  const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:8001/ws`;
  const [message, socket] = useWebSocketSimple(wsUrl);

  // Fetch initial bot status
  useEffect(() => {
    fetch('/api/status')
      .then(res => res.json())
      .then(data => setStatus(data.status))
      .catch(err => console.error('Failed to fetch status:', err));
  }, []);

  // Fetch initial trades
  useEffect(() => {
    fetch('/api/trades')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formattedTrades = data.map(trade => ({
            symbol: trade.symbol,
            action: trade.action,
            price: trade.price,
            timestamp: trade.created_at
          }));
          setTrades(formattedTrades);
        }
      })
      .catch(err => console.error('Failed to fetch trades:', err));
  }, []);

  useEffect(() => {
    if (!message) return;

    switch (message.type) {
      case "trade":
        if (
          typeof message.action === "string" &&
          typeof message.symbol === "string" &&
          typeof message.price === "number"
        ) {
          toast.success(
            `Trade executed: ${message.action?.toUpperCase() || 'UNKNOWN'} ${message.symbol} @ $${message.price}`
          );

          const newTrade: Trade = {
            symbol: message.symbol,
            action: message.action,
            price: message.price,
            timestamp: message.timestamp,
          };

          setTrades((prev) => [...prev.slice(-19), newTrade]);
        } else {
          console.warn("Malformed trade message:", message);
        }
        break;

      case "strategy_change":
        toast.info(`Strategy changed to ${message.strategy}`);
        break;

      case "status":
        setStatus(message.status);
        break;

      default:
        console.warn("Unhandled message type:", message);
    }
  }, [message]);


  return (
    <div className="font-sans bg-gray-100 min-h-screen">
      <Header />
      <main className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="bg-white shadow rounded-lg p-4">
          <div className="text-lg font-bold mb-2">Bot Status</div>
          <div className="text-gray-700">{status}</div>
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <Controls
            running={status === "Running"}
            onStrategyChange={async (strategy) => {
              try {
                await fetch('/api/strategy', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ strategy })
                });
              } catch (err) {
                console.error('Failed to change strategy:', err);
              }
            }}
            onToggleRunning={async () => {
              try {
                const response = await fetch('/api/toggle', { method: 'POST' });
                const result = await response.json();
                if (result.success) {
                  setStatus(result.status);
                }
              } catch (err) {
                console.error('Failed to toggle bot:', err);
              }
            }}
          />
        </div>

        <div className="bg-white shadow rounded-lg p-4">
          <TradeList trades={trades} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white shadow rounded-lg p-4">
            <AccountPanel />
          </div>
          <div className="bg-white shadow rounded-lg p-4 lg:col-span-2">
            <PositionTable />
            <div className="mt-4">
              <ActivityFeed />
            </div>
          </div>
        </div>
      </main>

      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default Dashboard;
