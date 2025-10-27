import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Dashboard from './pages/Dashboard';
import { ToastContainer } from './components/ui';
import { ErrorBoundary } from './components/ui';

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000, // 30 seconds
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Dashboard />
        <ToastContainer />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
