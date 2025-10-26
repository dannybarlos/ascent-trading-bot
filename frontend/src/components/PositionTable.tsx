import React from 'react';
import { motion } from 'framer-motion';
import { usePositions } from '../services/queries';
import { Card, LoadingOverlay, TableSkeleton } from './ui';
import { Position } from '../types';

const PositionRow: React.FC<{ position: Position; index: number }> = ({ position, index }) => {
  const unrealizedPl = position.unrealized_pl || 0;
  const isProfit = unrealizedPl >= 0;

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
    >
      <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
        {position.symbol}
      </td>
      <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
        {position.qty}
      </td>
      <td className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">
        ${parseFloat(position.avg_entry_price.toString()).toFixed(2)}
      </td>
      <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">
        ${parseFloat(position.market_value.toString()).toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </td>
      <td className="px-4 py-3 text-right">
        <span
          className={`inline-flex items-center px-2 py-1 rounded text-sm font-medium ${
            isProfit
              ? 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400'
              : 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400'
          }`}
        >
          {isProfit ? '▲' : '▼'} ${Math.abs(unrealizedPl).toFixed(2)}
        </span>
      </td>
    </motion.tr>
  );
};

export const PositionTable: React.FC = () => {
  const { data: positions, isLoading, isError, error, refetch } = usePositions();

  if (isError) {
    return (
      <Card
        title="Open Positions"
        action={
          <button onClick={() => refetch()} className="text-primary-500 hover:text-primary-600">
            🔄 Retry
          </button>
        }
      >
        <div className="text-center py-8">
          <p className="text-danger-600 dark:text-danger-400">
            Failed to load positions
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {error instanceof Error ? error.message : 'Unknown error'}
          </p>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card title="Open Positions">
        <TableSkeleton rows={5} cols={5} />
      </Card>
    );
  }

  const positionList = positions || [];

  return (
    <Card
      title="Open Positions"
      subtitle={`${positionList.length} position${positionList.length !== 1 ? 's' : ''}`}
      action={
        <button
          onClick={() => refetch()}
          className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
          aria-label="Refresh positions"
        >
          🔄
        </button>
      }
    >
      {positionList.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No open positions
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                  Symbol
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                  Entry Price
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                  Market Value
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">
                  P/L
                </th>
              </tr>
            </thead>
            <tbody>
              {positionList.map((position, index) => (
                <PositionRow key={position.symbol} position={position} index={index} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
};

export default PositionTable;
