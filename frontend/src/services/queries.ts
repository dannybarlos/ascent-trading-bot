import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import { TradingStrategy } from '../types';
import { useBotStore } from '../store/useBotStore';
import { useAccountStore } from '../store/useAccountStore';

// Query Keys
export const queryKeys = {
  botStatus: ['bot', 'status'] as const,
  trades: ['bot', 'trades'] as const,
  account: ['account'] as const,
  positions: ['account', 'positions'] as const,
  activities: ['account', 'activities'] as const,
  health: ['health'] as const,
};

// Bot Queries
export const useBotStatus = () => {
  const setBotStatus = useBotStore((state) => state.setStatus);
  const setStrategy = useBotStore((state) => state.setStrategy);

  return useQuery({
    queryKey: queryKeys.botStatus,
    queryFn: api.bot.getStatus,
    refetchInterval: 5000, // Refetch every 5 seconds
    onSuccess: (data) => {
      setBotStatus(data.status);
      setStrategy(data.strategy);
    },
  });
};

export const useTrades = () => {
  const setTrades = useBotStore((state) => state.setTrades);

  return useQuery({
    queryKey: queryKeys.trades,
    queryFn: api.bot.getTrades,
    refetchInterval: 10000, // Refetch every 10 seconds
    onSuccess: (data) => {
      setTrades(data);
    },
  });
};

// Account Queries
export const useAccount = () => {
  const setAccount = useAccountStore((state) => state.setAccount);

  return useQuery({
    queryKey: queryKeys.account,
    queryFn: api.account.getAccount,
    refetchInterval: 30000, // Refetch every 30 seconds
    onSuccess: (data) => {
      setAccount(data);
    },
  });
};

export const usePositions = () => {
  const setPositions = useAccountStore((state) => state.setPositions);

  return useQuery({
    queryKey: queryKeys.positions,
    queryFn: api.account.getPositions,
    refetchInterval: 30000,
    onSuccess: (data) => {
      setPositions(data);
    },
  });
};

export const useActivities = () => {
  const setActivities = useAccountStore((state) => state.setActivities);

  return useQuery({
    queryKey: queryKeys.activities,
    queryFn: api.account.getActivities,
    refetchInterval: 30000,
    onSuccess: (data) => {
      setActivities(data);
    },
  });
};

// Mutations
export const useToggleBot = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.bot.toggleBot,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.botStatus });
    },
  });
};

export const useSetStrategy = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (strategy: TradingStrategy) => api.bot.setStrategy(strategy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.botStatus });
    },
  });
};

export const useExecuteTrade = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.bot.executeTrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trades });
      queryClient.invalidateQueries({ queryKey: queryKeys.positions });
    },
  });
};
