import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/useUIStore';
import { Notification } from '../../types';

const ToastIcon: React.FC<{ type: Notification['type'] }> = ({ type }) => {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  const colors = {
    success: 'text-success-600 dark:text-success-400',
    error: 'text-danger-600 dark:text-danger-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-primary-600 dark:text-primary-400',
  };

  return (
    <span className={`text-lg font-bold ${colors[type]}`}>{icons[type]}</span>
  );
};

const ToastItem: React.FC<{ notification: Notification }> = ({ notification }) => {
  const removeNotification = useUIStore((state) => state.removeNotification);

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        removeNotification(notification.id);
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.id, notification.duration, removeNotification]);

  const bgColors = {
    success: 'bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800',
    error: 'bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
    info: 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.95 }}
      className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg ${bgColors[notification.type]} backdrop-blur-sm`}
    >
      <ToastIcon type={notification.type} />
      <p className="flex-1 text-sm text-gray-800 dark:text-gray-200">
        {notification.message}
      </p>
      <button
        onClick={() => removeNotification(notification.id)}
        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        aria-label="Close notification"
      >
        ✕
      </button>
    </motion.div>
  );
};

export const ToastContainer: React.FC = () => {
  const notifications = useUIStore((state) => state.notifications);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      <AnimatePresence>
        {notifications.map((notification) => (
          <ToastItem key={notification.id} notification={notification} />
        ))}
      </AnimatePresence>
    </div>
  );
};
