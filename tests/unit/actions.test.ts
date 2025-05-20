import { describe, it, expect } from 'vitest';
import { Action, encodeAction, decodeAction } from '../../packages/types/qdpi/actions';

describe('Action enum encode/decode', () => {
  it('encodes actions to numeric slots', () => {
    expect(encodeAction(Action.Read)).toBe(0);
    expect(encodeAction(Action.Merge)).toBe(9);
  });

  it('decodes numeric slots to actions', () => {
    expect(decodeAction(0)).toBe(Action.Read);
    expect(decodeAction(9)).toBe(Action.Merge);
  });

  it('throws on invalid decode slot', () => {
    expect(() => decodeAction(99)).toThrow();
  });
});
