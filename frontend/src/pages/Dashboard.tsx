import React from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Controls from '../components/Controls';
import TradeList from '../components/TradeList';
import AccountPanel from '../components/AccountPanel';
import PositionTable from '../components/PositionTable';
import { ErrorBoundary } from '../components/ui';
import useWebSocket from '../hooks/useWebSocket';
import { useBotStatus, useTrades } from '../services/queries';

const Dashboard: React.FC = () => {
  // Initialize WebSocket connection
  const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.hostname}:8001/ws`;

  useWebSocket({
    url: wsUrl,
    onConnect: () => console.log('[Dashboard] WebSocket connected'),
    onDisconnect: () => console.log('[Dashboard] WebSocket disconnected'),
  });

  // Load initial data
  useBotStatus();
  useTrades();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Controls Section */}
          <motion.div variants={itemVariants}>
            <ErrorBoundary>
              <Controls />
            </ErrorBoundary>
          </motion.div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Account & Trades */}
            <motion.div variants={itemVariants} className="space-y-6">
              <ErrorBoundary>
                <AccountPanel />
              </ErrorBoundary>
            </motion.div>

            {/* Middle & Right Columns - Positions & Trades */}
            <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
              <ErrorBoundary>
                <PositionTable />
              </ErrorBoundary>

              <ErrorBoundary>
                <TradeList />
              </ErrorBoundary>
            </motion.div>
          </div>

          {/* Footer Info */}
          <motion.div
            variants={itemVariants}
            className="text-center text-sm text-gray-500 dark:text-gray-400 py-4"
          >
            <p>Ascent Trading Bot v2.0 - Powered by Alpaca Markets</p>
            <p className="text-xs mt-1">
              Real-time updates via WebSocket • Automatic data refresh
            </p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
