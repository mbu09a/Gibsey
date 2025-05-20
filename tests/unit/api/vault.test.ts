import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as bunTest from 'bun:test';

if (!('mock' in vi)) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
vi.mock('../../../packages/db/src/schema', () => ({ pages: {}, sections: {}, vaultEntries: {} }));
vi.mock('@trpc/server', () => ({ initTRPC: () => ({ context: () => ({ create: () => ({ router: (obj: any) => obj }) }) }) }));
vi.mock('drizzle-orm', () => ({}));
vi.mock('../../../apps/api/auth/middleware', () => ({ authMiddleware: () => {} }));
vi.mock('../../../the-corpus/symbols/metadata', () => ({ symbolMetadata: [] }));

import * as router from '../../../apps/api/src/router';

const mockDb = {
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
};

beforeEach(() => {
  router.db.insert = mockDb.insert as any;
  router.db.values = mockDb.values as any;
});

describe('logDream', () => {
  it('creates a vault entry', async () => {
    const caller = router.appRouter.createCaller({ user: null } as any);
    await caller.logDream({
      action: 'Dream',
      context: 'test',
      state: 'awake',
      role: 'tester',
      relation: 'self',
      polarity: 'neutral',
      rotation: 'N',
      content: 'hello',
      actorId: 'tester',
    });
    expect(mockDb.insert).toHaveBeenCalled();
  });
});
