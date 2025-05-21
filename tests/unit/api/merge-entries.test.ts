import { describe, it, expect, vi } from 'vitest';
import * as bunTest from 'bun:test';

if (!('mock' in vi)) {
  (vi as any).mock = (bunTest as any).mock;
}

vi.mock('hono', () => ({ Hono: class {} }));
vi.mock('@hono/trpc-server', () => ({ trpcServer: () => {} }));
vi.mock('drizzle-orm/bun-sqlite', () => ({ drizzle: () => ({}) }));
vi.mock('bun:sqlite', () => ({ Database: class {} }));
vi.mock('drizzle-orm/sqlite-core', () => ({
  sqliteTable: () => ({}),
  integer: () => ({ primaryKey: () => ({}) }),
  text: () => ({ notNull: () => ({}) })
}));
vi.mock('../../../packages/db/src/schema', () => ({ pages: {}, sections: {} }));
vi.mock('@trpc/server', () => ({
  initTRPC: () => ({
    context: () => ({
      create: () => {
        const chain: any = {};
        chain.input = () => chain;
        chain.use = () => chain;
        chain.query = (fn: any) => (input: any) => fn({ input } as any);
        chain.mutation = (fn: any) => (input: any) => fn({ input } as any);
        return {
          router: (obj: any) => ({ ...obj, createCaller: () => obj }),
          middleware: (fn: any) => fn,
          procedure: chain,
        };
      }
    })
  })
}));
vi.mock('drizzle-orm', () => ({ eq: () => ({}), and: () => ({}), like: () => ({}) }));
vi.mock('../../../apps/api/auth/middleware', () => ({ authMiddleware: () => {} }));
vi.mock('../../../the-corpus/symbols/metadata', () => ({ symbolMetadata: [] }));
vi.mock('../../../packages/db/src/schema.ts', () => ({ pages: {}, sections: {} }));

import * as router from '../../../apps/api/src/router';

describe('mergeEntries', () => {
  it('allows MythicGuardian role', async () => {
    const caller = router.appRouter.createCaller({ user: { role: 'MythicGuardian' } } as any);
    const result = await caller.mergeEntries({ sourceId: 1, targetId: 2 });
    expect(result).toEqual({ success: true });
  });

  it('rejects other roles', async () => {
    const caller = router.appRouter.createCaller({ user: { role: 'Scribe' } } as any);
    await expect(caller.mergeEntries({ sourceId: 1, targetId: 2 })).rejects.toThrow();
  });
});
