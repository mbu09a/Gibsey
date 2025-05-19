import { describe, it, expect } from 'vitest';
import { characterToSymbol } from '../../packages/db/seed/symbol-map';

describe('characterToSymbol', () => {
  it('returns mapped filename for known character', () => {
    expect(characterToSymbol('Glyph Marrow')).toBe('glyph_marrow.svg');
    expect(characterToSymbol('The Author')).toBe('The_Author.svg');
    expect(characterToSymbol('Cop-E-Right')).toBe('cop-e-right.svg');
  });

  it('slugifies and appends .svg for unknown names', () => {
    expect(characterToSymbol('Unknown Character')).toBe('unknown_character.svg');
    expect(characterToSymbol('A  B  C')).toBe('a_b_c.svg');
  });
});
