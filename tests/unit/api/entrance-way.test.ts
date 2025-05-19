import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as bunTest from 'bun:test';
import * as fs from 'fs';

// Bun's vi helper lacks `mock`, so map it when missing
if (!('mock' in vi)) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (vi as any).mock = (bunTest as any).mock;
}

vi.mock('hono', () => ({ Hono: class {} }));
vi.mock('@hono/trpc-server', () => ({ trpcServer: () => {} }));
vi.mock('drizzle-orm/bun-sqlite', () => ({ drizzle: () => ({}) }));
vi.mock('bun:sqlite', () => ({ Database: class {} }));
vi.mock('@trpc/server', () => ({ initTRPC: () => ({ context: () => ({ create: () => ({ router: (obj: any) => obj }) }) }) }));
vi.mock('drizzle-orm', () => ({ eq: () => ({}), and: () => ({}), like: () => ({}) }));
vi.mock('../../../apps/api/auth/middleware', () => ({ authMiddleware: () => {} }));

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

  it('throws error when input is missing', async () => {
    const caller = router.appRouter.createCaller({ user: null } as any);
    await expect(caller.getPageById({} as any)).rejects.toThrow();
  });

  it('throws error on invalid input types', async () => {
    const caller = router.appRouter.createCaller({ user: null } as any);
    // section should be number, index should be number
    await expect(caller.getPageById({ section: 'a', index: 'b' } as any)).rejects.toThrow();
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

  it('returns empty array when no pages found', async () => {
    mockDb.where.mockResolvedValue([]);
    const caller = router.appRouter.createCaller({ user: null } as any);
    const result = await caller.getPagesBySection({ section: 99 });
    expect(result).toEqual([]);
  });

  it('throws error when input is missing', async () => {
    const caller = router.appRouter.createCaller({ user: null } as any);
    await expect(caller.getPagesBySection({} as any)).rejects.toThrow();
  });

  it('throws error on invalid input type', async () => {
    const caller = router.appRouter.createCaller({ user: null } as any);
    await expect(caller.getPagesBySection({ section: 'x' } as any)).rejects.toThrow();
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

  it('returns empty array when no pages match', async () => {
    mockDb.where.mockResolvedValue([]);
    const caller = router.appRouter.createCaller({ user: null } as any);
    const result = await caller.searchPages({ query: 'missing' });
    expect(result).toEqual([]);
  });

  it('throws error when input is missing', async () => {
    const caller = router.appRouter.createCaller({ user: null } as any);
    await expect(caller.searchPages({} as any)).rejects.toThrow();
  });

  it('throws error on invalid input type', async () => {
    const caller = router.appRouter.createCaller({ user: null } as any);
    await expect(caller.searchPages({ query: 123 as any } as any)).rejects.toThrow();
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

