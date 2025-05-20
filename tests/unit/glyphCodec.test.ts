import { describe, it, expect } from 'vitest';
import {
  encodeGlyph,
  decodeGlyph,
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
  it('round trips with explicit modality', () => {
    const glyph: Glyph = {
      action: Action.Write,
      context: Context.Generation,
      state: State.Public,
      role: Role.AI,
      relation: Relation.S2O,
      polarity: Polarity.Internal,
      rotation: Rotation.N,
      modality: Modality.Image,
    };
    const code = encodeGlyph(glyph);
    const decoded = decodeGlyph(code);
    expect(decoded).toEqual(glyph);
  });

  it('defaults modality to Text when missing', () => {
    const glyph: Glyph = {
      action: Action.Read,
      context: Context.Page,
      state: State.Private,
      role: Role.Human,
      relation: Relation.O2S,
      polarity: Polarity.External,
      rotation: Rotation.E,
    };
    const code = encodeGlyph(glyph);
    const decoded = decodeGlyph(code);
    expect(decoded).toEqual({ ...glyph, modality: Modality.Text });
  });
});
