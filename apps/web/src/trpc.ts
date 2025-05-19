import { createTRPCReact, httpBatchLink } from '@trpc/react-query';
import { QueryClient } from '@tanstack/react-query';
import type { AppRouter } from '../../api/src/router';

export const trpc = createTRPCReact<AppRouter>();

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({ url: '/trpc' }),
  ],
});

export const queryClient = new QueryClient();

// Convenience hooks
export const useGetPageById = trpc.getPageById.useQuery;
export const useGetPagesBySection = trpc.getPagesBySection.useQuery;
export const useSearchPages = trpc.searchPages.useQuery;