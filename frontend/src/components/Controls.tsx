import React from 'react';
import { motion } from 'framer-motion';
import { useBotStore } from '../store/useBotStore';
import { useToggleBot, useSetStrategy } from '../services/queries';
import { TradingStrategy } from '../types';
import { LoadingSpinner } from './ui';

const STRATEGIES: { value: TradingStrategy; label: string; description: string }[] = [
  { value: 'momentum', label: 'Momentum', description: 'Trend-following strategy' },
  { value: 'rsi', label: 'RSI', description: 'Relative Strength Index' },
  { value: 'breakout', label: 'Breakout', description: 'Price breakout detection' },
  { value: 'sma_crossover', label: 'SMA Crossover', description: 'Moving average crossover' },
];

export const Controls: React.FC = () => {
  const { status, strategy } = useBotStore();
  const toggleBot = useToggleBot();
  const setStrategy = useSetStrategy();

  const isRunning = status === 'running';
  const isLoading = toggleBot.isPending || setStrategy.isPending;

  const handleToggleBot = async () => {
    try {
      await toggleBot.mutateAsync();
    } catch (error) {
      console.error('Failed to toggle bot:', error);
    }
  };

  const handleStrategyChange = async (newStrategy: TradingStrategy) => {
    if (newStrategy === strategy) return;

    try {
      await setStrategy.mutateAsync(newStrategy);
    } catch (error) {
      console.error('Failed to change strategy:', error);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Strategy Selection */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Trading Strategy
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {STRATEGIES.map((strat) => (
              <motion.button
                key={strat.value}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleStrategyChange(strat.value)}
                disabled={isLoading || isRunning}
                className={`p-3 rounded-lg border-2 transition-all ${
                  strategy === strat.value
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                } ${
                  isLoading || isRunning
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
              >
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    {strategy === strat.value && (
                      <span className="text-primary-500">✓</span>
                    )}
                    <span className="font-medium text-gray-900 dark:text-white">
                      {strat.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {strat.description}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
          {isRunning && (
            <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">
              ⚠ Stop the bot to change strategy
            </p>
          )}
        </div>

        {/* Bot Control */}
        <div className="flex flex-col items-center gap-3 lg:w-48">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggleBot}
            disabled={isLoading}
            className={`w-full px-6 py-3 rounded-lg font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${
              isRunning
                ? 'bg-danger-500 hover:bg-danger-600 active:bg-danger-700'
                : 'bg-success-500 hover:bg-success-600 active:bg-success-700'
            } ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
              <LoadingSpinner size="sm" className="border-white border-t-transparent" />
            ) : (
              <>
                <span className="text-xl">{isRunning ? '⏸' : '▶'}</span>
                <span>{isRunning ? 'Stop Bot' : 'Start Bot'}</span>
              </>
            )}
          </motion.button>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {isRunning ? 'Bot is actively trading' : 'Bot is paused'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Controls;
