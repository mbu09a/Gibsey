import { describe, it, expect } from 'vitest';
import { characterToSymbol } from '../../packages/utils/characterToSymbol';

describe('characterToSymbol', () => {
  it('slugifies simple names', () => {
    expect(characterToSymbol('Glyph Marrow')).toBe('glyph_marrow');
  });

  it('applies override mappings', () => {
    expect(characterToSymbol('Cop-E-Right')).toBe('cop-e-right');
  });

  it('handles mixed case and spaces', () => {
    expect(characterToSymbol('The Author')).toBe('the_author');
  });
});
