import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc } from './trpc';
import { httpBatchLink } from '@trpc/client';
import { getModality } from './utils/modalityStore';
import './index.css';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

const client = trpc.createClient({
  links: [
    httpBatchLink({
      url: '/trpc',
      headers: ({ op }) => ({
        'x-modality': op.context?.modality ?? getModality(),
      }),
    }),
  ],
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <ErrorBoundary>
    <trpc.Provider client={client} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </trpc.Provider>
  </ErrorBoundary>
);
