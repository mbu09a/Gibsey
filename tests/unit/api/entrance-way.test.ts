import { describe, it, expect, vi, beforeEach } from 'vitest';
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

