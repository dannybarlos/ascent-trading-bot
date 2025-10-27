import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UIStore, Theme, Notification } from '../types';

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      theme: 'system',
      sidebarOpen: true,
      notifications: [],

      setTheme: (theme: Theme) => {
        set({ theme });
        // Apply theme to document
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else if (theme === 'light') {
          document.documentElement.classList.remove('dark');
        } else {
          // System theme
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (prefersDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },

      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            {
              ...notification,
              id: `${Date.now()}-${Math.random()}`,
              timestamp: Date.now(),
            },
          ],
        })),

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ theme: state.theme, sidebarOpen: state.sidebarOpen }),
    }
  )
);

// Initialize theme on load
const initTheme = () => {
  const { theme } = useUIStore.getState();
  useUIStore.getState().setTheme(theme);
};

// Watch for system theme changes
if (typeof window !== 'undefined') {
  initTheme();
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { theme } = useUIStore.getState();
    if (theme === 'system') {
      useUIStore.getState().setTheme('system');
    }
  });
}
