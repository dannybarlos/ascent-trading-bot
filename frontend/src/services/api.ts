import { Account, Position, Activity, Trade, BotStatusData, TradingStrategy } from '../types';

const API_BASE = '/api';

// Generic fetch wrapper with error handling
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

// Bot API
export const botAPI = {
  getStatus: () => fetchAPI<BotStatusData>('/status'),

  toggleBot: () => fetchAPI<{ status: string }>('/toggle', { method: 'POST' }),

  setStrategy: (strategy: TradingStrategy) =>
    fetchAPI<{ strategy: TradingStrategy }>('/strategy', {
      method: 'POST',
      body: JSON.stringify({ strategy }),
    }),

  getTrades: () => fetchAPI<Trade[]>('/trades'),

  executeTrade: (data: { symbol: string; action: 'buy' | 'sell'; quantity: number }) =>
    fetchAPI<Trade>('/execute_trade', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Account API
export const accountAPI = {
  getAccount: () => fetchAPI<Account>('/account'),

  getPositions: () => fetchAPI<Position[]>('/positions'),

  getActivities: () => fetchAPI<Activity[]>('/activities'),

  validateAlpaca: () => fetchAPI<{ valid: boolean; message?: string }>('/validate-alpaca'),
};

// Health API
export const healthAPI = {
  getHealth: () => fetchAPI<{ status: string; timestamp: string }>('/health'),
};

// Export all APIs
export const api = {
  bot: botAPI,
  account: accountAPI,
  health: healthAPI,
};
