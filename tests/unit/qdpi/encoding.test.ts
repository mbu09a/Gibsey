import { describe, it, expect } from 'vitest';
import { encode, decode, linkPages, mergeContributions, VaultEntry } from '../../../packages/qdpi';

describe('QDPI encode/decode', () => {
  it('round-trips a move object', () => {
    const move = { action: 'Read', context: 'Page', target: '1', data: { foo: 'bar' } };
    const encoded = encode(move);
    expect(typeof encoded).toBe('string');
    const decoded = decode(encoded);
    expect(decoded).toEqual(move);
  });
});

describe('Vault state transitions', () => {
  it('links two pages', () => {
    const vault: Record<string, VaultEntry> = {
      A: { id: 'A', pageId: '1', links: [] },
      B: { id: 'B', pageId: '2', links: [] },
    };
    linkPages(vault, 'A', 'B');
    expect(vault.A.links).toContain('B');
  });

  it('merges contributions', () => {
    const entry: VaultEntry = { id: 'A', contributions: ['one'] };
    mergeContributions(entry, ['two', 'three']);
    expect(entry.contributions).toEqual(['one', 'two', 'three']);
  });
});
