import { create } from 'zustand';
import { BotStore, BotStatus, TradingStrategy, Trade, WebSocketMessage } from '../types';

export const useBotStore = create<BotStore>((set) => ({
  status: 'stopped',
  strategy: 'momentum',
  trades: [],
  lastMessage: null,

  setStatus: (status: BotStatus) => set({ status }),

  setStrategy: (strategy: TradingStrategy) => set({ strategy }),

  addTrade: (trade: Trade) =>
    set((state) => ({
      trades: [trade, ...state.trades].slice(0, 100), // Keep last 100 trades
    })),

  setTrades: (trades: Trade[]) => set({ trades }),

  setLastMessage: (message: WebSocketMessage | null) => set({ lastMessage: message }),

  clearTrades: () => set({ trades: [] }),
}));
