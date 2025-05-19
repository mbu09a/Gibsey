import { describe, it, expect } from 'vitest';
import { characterToSymbol } from '../../packages/db/seed/symbol-map';

describe('characterToSymbol', () => {
  it('returns mapped slug for known character', () => {
    expect(characterToSymbol('Glyph Marrow')).toBe('glyph_marrow');
    expect(characterToSymbol('The Author')).toBe('The_Author');
    expect(characterToSymbol('Cop-E-Right')).toBe('cop-e-right');
  });

  it('slugifies unknown names', () => {
    expect(characterToSymbol('Unknown Character')).toBe('unknown_character');
    expect(characterToSymbol('A  B  C')).toBe('a_b_c');
  });
});
