import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as fs from 'fs';

vi.mock('hono', () => ({ Hono: class {} }));
vi.mock('@hono/trpc-server', () => ({ trpcServer: () => {} }));
vi.mock('drizzle-orm/bun-sqlite', () => ({ drizzle: () => ({}) }));
vi.mock('bun:sqlite', () => ({ Database: class {} }));
vi.mock('@trpc/server', () => ({ initTRPC: () => ({ context: () => ({ create: () => ({ router: (obj: any) => obj }) }) }) }));
vi.mock('drizzle-orm', () => ({ eq: () => ({}), and: () => ({}), like: () => ({}) }));
vi.mock('../../../apps/api/auth/middleware', () => ({ authMiddleware: () => {} }));
vi.mock('zod', () => ({ z: { object: () => ({}), number: () => ({}), string: () => ({}) } }));

import * as router from '../../../apps/api/src/router';

const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn(),
};

beforeEach(() => {
  mockDb.select.mockReturnThis();
  mockDb.from.mockReturnThis();
  router.db.select = mockDb.select as any;
  router.db.from = mockDb.from as any;
  router.db.where = mockDb.where as any;
});

describe('getPageById', () => {
  it('returns page when found', async () => {
    mockDb.where.mockResolvedValue([{ id: 1 }]);
    const caller = router.appRouter.createCaller({ user: null } as any);
    const result = await caller.getPageById({ section: 1, index: 1 });
    expect(result).toEqual({ id: 1 });
  });

  it('returns null when not found', async () => {
    mockDb.where.mockResolvedValue([]);
    const caller = router.appRouter.createCaller({ user: null } as any);
    const result = await caller.getPageById({ section: 1, index: 2 });
    expect(result).toBeNull();
  });
});

describe('getPagesBySection', () => {
  it('returns pages list', async () => {
    const pages = [{ id: 1 }, { id: 2 }];
    mockDb.where.mockResolvedValue(pages);
    const caller = router.appRouter.createCaller({ user: null } as any);
    const result = await caller.getPagesBySection({ section: 1 });
    expect(result).toEqual(pages);
  });
});

describe('searchPages', () => {
  it('returns matched pages', async () => {
    const pages = [{ id: 3 }];
    mockDb.where.mockResolvedValue(pages);
    const caller = router.appRouter.createCaller({ user: null } as any);
    const result = await caller.searchPages({ query: 'hello' });
    expect(result).toEqual(pages);
  });
});

describe('getPagesBySymbol', () => {
  it('returns pages for a symbol', async () => {
    const pages = [{ id: 4 }];
    mockDb.where.mockResolvedValue(pages);
    const caller = router.appRouter.createCaller({ user: null } as any);
    const result = await caller.getPagesBySymbol({ symbol: 'london_fox' });
    expect(result).toEqual(pages);
  });
});

describe('getSections', () => {
  it('returns sections list', async () => {
    const sections = [{ id: 1, sectionName: 'Intro' }];
    const selectMock = vi.fn(() => ({ from: vi.fn().mockResolvedValue(sections) }));
    router.db.select = selectMock as any;
    const caller = router.appRouter.createCaller({ user: null } as any);
    const result = await caller.getSections();
    expect(result).toEqual(sections);
  });
});

describe('getSymbols', () => {
  it('returns svg file names', async () => {
    vi.spyOn(fs, 'readdirSync').mockReturnValue(['a.svg', 'b.png'] as any);
    const caller = router.appRouter.createCaller({ user: null } as any);
    const result = await caller.getSymbols();
    expect(result).toEqual(['a.svg']);
  });
});

