import React from 'react';
import { ThemeToggle } from './ThemeToggle';
import { StatusBadge } from './ui';
import { useBotStore } from '../store/useBotStore';

export const Header: React.FC = () => {
  const status = useBotStore((state) => state.status);
  const strategy = useBotStore((state) => state.strategy);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg">
                A
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Ascent Trading Bot
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Automated Trading Platform
                </p>
              </div>
            </div>
          </div>

          {/* Status and Controls */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Strategy:
              </span>
              <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded text-sm font-medium">
                {strategy}
              </span>
            </div>
            <StatusBadge status={status} />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
