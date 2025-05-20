import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as bunTest from 'bun:test';
import type { GateMessage } from '../../packages/types/gate';

if (!('mock' in vi)) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (vi as any).mock = (bunTest as any).mock;
}

const insertMock = vi.fn();

vi.mock('drizzle-orm/sqlite-core', () => ({
  sqliteTable: () => ({}),
  integer: () => ({ primaryKey: () => ({}) }),
  text: () => ({ notNull: () => ({ unique: () => ({}) }) }),
}));
vi.mock('drizzle-orm', () => ({ eq: () => ({}) }));

const vaultTable = {};

import { createGate } from '../../services/mnr/gate';

const { sendGateMessage, onGateMessage } = createGate(
  { insert: () => ({ values: insertMock }) },
  vaultTable
);

describe('GateMessage flow', () => {
  beforeEach(() => {
    insertMock.mockClear();
  });

  it('stores and processes message', async () => {
    const received: GateMessage[] = [];
    onGateMessage(msg => received.push(msg));
    const msg: GateMessage = {
      id: '1',
      action: 'Read',
      context: 'Page',
      state: 'Public',
      role: 'Human',
      relation: 'SubjectToObject',
      polarity: 'Internal',
      orientation: 'N',
      fromWorld: 'A',
      toWorld: 'B',
      payload: { ok: true },
    };
    await sendGateMessage(msg);
    expect(received).toHaveLength(1);
    expect(received[0].id).toBe('1');
    expect(insertMock).toHaveBeenCalled();
  });

  it('deduplicates messages by id', async () => {
    const msg: GateMessage = {
      id: 'dedupe',
      action: 'Read',
      context: 'Page',
      state: 'Public',
      role: 'Human',
      relation: 'SubjectToObject',
      polarity: 'Internal',
      orientation: 'N',
      fromWorld: 'A',
      toWorld: 'B',
      payload: null,
    };
    await sendGateMessage(msg);
    await sendGateMessage(msg);
    expect(insertMock).toHaveBeenCalledTimes(1);
  });
});
