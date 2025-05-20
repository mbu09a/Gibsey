import { initTRPC } from '@trpc/server';
import type { Context } from 'hono';

export type AppContext = Context & { user: unknown };

export const t = initTRPC.context<AppContext>().create();
