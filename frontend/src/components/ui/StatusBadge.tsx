import React from 'react';
import { BotStatus } from '../../types';

interface StatusBadgeProps {
  status: BotStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const statusConfig = {
    running: {
      label: 'Running',
      className: 'status-running status-badge',
      icon: '●',
    },
    stopped: {
      label: 'Stopped',
      className: 'status-stopped status-badge',
      icon: '●',
    },
    paused: {
      label: 'Paused',
      className: 'status-pending status-badge',
      icon: '●',
    },
    error: {
      label: 'Error',
      className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 status-badge',
      icon: '⚠',
    },
  };

  const config = statusConfig[status] || statusConfig.stopped;

  return (
    <span className={`${config.className} ${className}`}>
      <span className="mr-1">{config.icon}</span>
      {config.label}
    </span>
  );
};
