import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBotStore } from '../store/useBotStore';
import { Card, Skeleton } from './ui';
import { Trade } from '../types';

const TradeItem: React.FC<{ trade: Trade; index: number }> = ({ trade, index }) => {
  const isBuy = trade.action.toLowerCase() === 'buy';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.05 }}
      className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${
            isBuy
              ? 'bg-success-500'
              : 'bg-danger-500'
          }`}
        >
          {isBuy ? '↑' : '↓'}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 dark:text-white">
              {trade.symbol}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                isBuy
                  ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400'
                  : 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400'
              }`}
            >
              {trade.action.toUpperCase()}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(trade.timestamp).toLocaleString()}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-gray-900 dark:text-white">
          ${trade.price.toFixed(2)}
        </p>
        {trade.quantity && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Qty: {trade.quantity}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export const TradeList: React.FC = () => {
  const trades = useBotStore((state) => state.trades);

  return (
    <Card title="Recent Trades" subtitle={`${trades.length} trades`}>
      <div className="max-h-96 overflow-y-auto scrollbar-thin">
        {trades.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              No trades yet. Start the bot to begin trading.
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {trades.slice(0, 20).map((trade, index) => (
              <TradeItem key={`${trade.timestamp}-${index}`} trade={trade} index={index} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </Card>
  );
};

export default TradeList;
