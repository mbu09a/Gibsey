import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc } from './trpc';
import { httpBatchLink } from '@trpc/client';
import './index.css';

const client = trpc.createClient({
  links: [httpBatchLink({ url: '/trpc' })],
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <trpc.Provider client={client} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <div className="p-4">Gibsey Web</div>
    </QueryClientProvider>
  </trpc.Provider>
);
