import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as router from '../../../apps/api/src/router';

const records: any[] = [];

const mockDb = {
  insert: vi.fn(() => ({
    values: vi.fn(async (val) => {
      records.push({ id: records.length + 1, ...val });
    }),
  })),
  select: vi.fn(() => ({
    from: vi.fn(async () => records),
  })),
};

beforeEach(() => {
  records.length = 0;
  router.db.insert = mockDb.insert as any;
  router.db.select = mockDb.select as any;
});

describe('logDream', () => {
  it('creates a full vault entry with all QDPI axes', async () => {
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
    expect(records.length).toBe(1);
    expect(records[0]).toMatchObject({
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
  });
});