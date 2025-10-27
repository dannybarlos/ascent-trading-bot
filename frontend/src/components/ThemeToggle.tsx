import React from 'react';
import { useUIStore } from '../store/useUIStore';
import { Theme } from '../types';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useUIStore();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'system':
        return '💻';
      default:
        return '☀️';
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return 'Light';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 px-3 py-2 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
      aria-label={`Switch theme (current: ${getLabel()})`}
      title={`Current theme: ${getLabel()}`}
    >
      <span className="text-lg">{getIcon()}</span>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
        {getLabel()}
      </span>
    </button>
  );
};
