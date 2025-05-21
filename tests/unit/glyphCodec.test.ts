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
      role: Role.AICharacter,
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

  it('encodes/decodes with Action.Read (0) and Modality.Text (0)', () => {
    const glyph: Glyph = {
      action: Action.Read, // Value 0
      context: Context.Page,
      state: State.Public,
      role: Role.Human,
      relation: Relation.S2O,
      polarity: Polarity.External,
      rotation: Rotation.N,
      modality: Modality.Text, // Value 0
    };
    const code = encodeGlyphNumeric(glyph);
    const decoded = decodeGlyphNumeric(code);
    expect(decoded).toEqual(glyph);
    // Check that the numeric values are indeed 0 for action and modality in the decoded glyph
    expect(decoded.action).toBe(0);
    expect(decoded.modality).toBe(0);
  });

  it('encodes/decodes with max enum values (Action.Dream, Modality.Tactile, Role.PartSystem)', () => {
    const glyph: Glyph = {
      action: Action.Dream, // Value 9
      context: Context.Prompt,
      state: State.Sacrifice,
      role: Role.PartSystem, // Value 5
      relation: Relation.O2S,
      polarity: Polarity.Internal,
      rotation: Rotation.S,
      modality: Modality.Tactile, // Value 5
    };
    const code = encodeGlyphNumeric(glyph);
    const decoded = decodeGlyphNumeric(code);
    expect(decoded).toEqual(glyph);
    expect(decoded.action).toBe(Action.Dream);
    expect(decoded.modality).toBe(Modality.Tactile);
    expect(decoded.role).toBe(Role.PartSystem);
  });
});

