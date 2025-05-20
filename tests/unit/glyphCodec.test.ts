import { describe, it, expect } from 'vitest';
import {
  encodeGlyphNumeric,
  decodeGlyphNumeric,
  Action,
  Context,
  State,
  Role,
  Relation,
  Polarity,
  Rotation,
  Modality,
  Glyph,
} from '../../packages/utils/glyphCodec';

describe('glyphCodec', () => {
  it('round-trips with all explicit axes (modality: Audio)', () => {
    const glyph: Glyph = {
      action: Action.Write,
      context: Context.Generation,
      state: State.Gift,
      role: Role.AI,
      relation: Relation.S2O,
      polarity: Polarity.Internal,
      rotation: Rotation.W,
      modality: Modality.Audio,
    };
    const code = encodeGlyphNumeric(glyph);
    const decoded = decodeGlyphNumeric(code);
    expect(decoded).toEqual(glyph);
  });

  it('defaults modality to Text if not present', () => {
    const glyph: Glyph = {
      action: Action.Read,
      context: Context.Page,
      state: State.Public,
      role: Role.Human,
      relation: Relation.O2S,
      polarity: Polarity.External,
      rotation: Rotation.E,
      // modality omitted!
    };
    const code = encodeGlyphNumeric(glyph);
    const decoded = decodeGlyphNumeric(code);
    expect(decoded).toEqual({ ...glyph, modality: Modality.Text });
  });

  it('can round-trip a Dream/AR move', () => {
    const glyph: Glyph = {
      action: Action.Dream,
      context: Context.Reaction,
      state: State.Private,
      role: Role.WholeSystem,
      relation: Relation.O2S,
      polarity: Polarity.Internal,
      rotation: Rotation.S,
      modality: Modality.AR,
    };
    const code = encodeGlyphNumeric(glyph);
    const decoded = decodeGlyphNumeric(code);
    expect(decoded).toEqual(glyph);
  });
});

