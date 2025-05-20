import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as router from '../../../apps/api/src/router';
import { metrics, resetMetrics } from '../../../apps/api/src/metrics';

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
  resetMetrics();
  router.db.insert = mockDb.insert as any;
  router.db.select = mockDb.select as any;
});

describe('logDream and replayDreams', () => {
  it('increments metrics on logDream', async () => {
    const caller = router.appRouter.createCaller({ user: null } as any);
    await caller.logDream({ actorId: 'a', state: 'dream', content: 'one' });
    await caller.logDream({ actorId: 'b', state: 'gift', content: 'two' });
    expect(metrics.dreamsLoggedTotal).toBe(2);
    expect(metrics.dreamGiftsRecent).toBe(1);
  });

  it('filters replayDreams correctly', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(1000);
    const caller = router.appRouter.createCaller({ user: null } as any);
    await caller.logDream({ actorId: 'a', state: 'dream', content: 'one' });
    vi.setSystemTime(2000);
    await caller.logDream({ actorId: 'b', state: 'gift', content: 'two' });

    const all = await caller.replayDreams({});
    expect(all.length).toBe(2);

    const byActor = await caller.replayDreams({ actorId: 'a' });
    expect(byActor.length).toBe(1);

    const byState = await caller.replayDreams({ state: 'gift' });
    expect(byState[0].actorId).toBe('b');

    const byDate = await caller.replayDreams({ start: 1500 });
    expect(byDate.length).toBe(1);
    vi.useRealTimers();
  });
});
