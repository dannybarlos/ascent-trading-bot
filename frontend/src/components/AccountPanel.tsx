import React from 'react';
import { motion } from 'framer-motion';
import { useAccount } from '../services/queries';
import { Card, LoadingOverlay, CardSkeleton } from './ui';

export const AccountPanel: React.FC = () => {
  const { data: account, isLoading, isError, error, refetch } = useAccount();

  if (isError) {
    return (
      <Card
        title="Account Information"
        action={
          <button onClick={() => refetch()} className="text-primary-500 hover:text-primary-600">
            🔄 Retry
          </button>
        }
      >
        <div className="text-center py-8">
          <p className="text-danger-600 dark:text-danger-400">
            Failed to load account data
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </Card>
    );
  }

  if (isLoading || !account) {
    return (
      <Card title="Account Information">
        <LoadingOverlay message="Loading account data..." />
      </Card>
    );
  }

  const cash = parseFloat(account.cash?.toString() || '0');
  const portfolioValue = parseFloat(account.portfolio_value?.toString() || '0');
  const buyingPower = parseFloat(account.buying_power?.toString() || '0');

  const stats = [
    {
      label: 'Cash',
      value: `$${cash.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: '💵',
      color: 'text-success-600 dark:text-success-400',
    },
    {
      label: 'Portfolio Value',
      value: `$${portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: '📊',
      color: 'text-primary-600 dark:text-primary-400',
    },
    {
      label: 'Buying Power',
      value: `$${buyingPower.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: '⚡',
      color: 'text-yellow-600 dark:text-yellow-400',
    },
  ];

  return (
    <Card
      title="Account Information"
      subtitle={account.account_number || 'Paper Trading'}
      action={
        <button
          onClick={() => refetch()}
          className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
          aria-label="Refresh account data"
        >
          🔄
        </button>
      }
    >
      <div className="space-y-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.label}
              </span>
            </div>
            <span className={`text-lg font-bold ${stat.color}`}>
              {stat.value}
            </span>
          </motion.div>
        ))}

        {account.pattern_day_trader && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-400">
              ⚠️ Pattern Day Trader
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AccountPanel;
