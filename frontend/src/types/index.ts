// Trading Bot Types

export type TradingStrategy = 'momentum' | 'rsi' | 'breakout' | 'sma_crossover';
export type BotStatus = 'running' | 'stopped' | 'paused' | 'error';
export type TradeAction = 'buy' | 'sell';
export type OrderSide = 'buy' | 'sell';
export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit';

// Trade Interface
export interface Trade {
  id?: string;
  symbol: string;
  action: TradeAction;
  price: number;
  quantity?: number;
  timestamp: string;
  strategy?: TradingStrategy;
  profit?: number;
}

// Bot Status
export interface BotStatusData {
  status: BotStatus;
  strategy: TradingStrategy;
  uptime?: number;
  trades_today?: number;
  total_trades?: number;
  last_trade?: Trade;
}

// Account Information
export interface Account {
  account_number?: string;
  cash: number;
  portfolio_value: number;
  buying_power?: number;
  equity?: number;
  last_equity?: number;
  multiplier?: string;
  pattern_day_trader?: boolean;
  trading_blocked?: boolean;
  transfers_blocked?: boolean;
  account_blocked?: boolean;
  currency?: string;
  status?: string;
}

// Position
export interface Position {
  symbol: string;
  qty: number;
  avg_entry_price: number;
  market_value: number;
  current_price?: number;
  unrealized_pl?: number;
  unrealized_plpc?: number;
  side: 'long' | 'short';
  asset_class?: string;
  exchange?: string;
}

// Activity
export interface Activity {
  id: string;
  activity_type: string;
  transaction_time: string;
  type?: string;
  status?: string;
  symbol?: string;
  side?: OrderSide;
  qty?: number;
  price?: number;
  net_amount?: number;
  description?: string;
}

// WebSocket Message Types
export interface TradeMessage {
  type: 'trade';
  data: Trade;
}

export interface StrategyChangeMessage {
  type: 'strategy_change';
  strategy: TradingStrategy;
}

export interface StatusMessage {
  type: 'status';
  status: BotStatus;
}

export interface ErrorMessage {
  type: 'error';
  message: string;
}

export type WebSocketMessage =
  | TradeMessage
  | StrategyChangeMessage
  | StatusMessage
  | ErrorMessage;

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Chart Data
export interface ChartDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}

export interface PerformanceMetrics {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  total_profit: number;
  avg_profit_per_trade: number;
  max_drawdown: number;
  sharpe_ratio?: number;
}

// Theme
export type Theme = 'light' | 'dark' | 'system';

// UI State
export interface UIState {
  theme: Theme;
  sidebarOpen: boolean;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: number;
  duration?: number;
}

// Store Types
export interface BotStore {
  status: BotStatus;
  strategy: TradingStrategy;
  trades: Trade[];
  lastMessage: WebSocketMessage | null;
  setStatus: (status: BotStatus) => void;
  setStrategy: (strategy: TradingStrategy) => void;
  addTrade: (trade: Trade) => void;
  setTrades: (trades: Trade[]) => void;
  setLastMessage: (message: WebSocketMessage | null) => void;
  clearTrades: () => void;
}

export interface AccountStore {
  account: Account | null;
  positions: Position[];
  activities: Activity[];
  setAccount: (account: Account) => void;
  setPositions: (positions: Position[]) => void;
  setActivities: (activities: Activity[]) => void;
}

export interface UIStore extends UIState {
  setTheme: (theme: Theme) => void;
  toggleSidebar: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}
