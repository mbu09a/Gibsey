import { describe, it, expect } from 'vitest';
import {
  decodeGlyph,
  encodeGlyph,
  Action,
  Context,
  State,
  Role,
  Relation,
  Polarity,
  Orientation,
  Modality,
} from '../../packages/utils/glyphCodec';

describe('glyphCodec', () => {
  it('decodes 7-axis glyphs with default Text modality', () => {
    const result = decodeGlyph('0123456');
    expect(result).toEqual({
      action: 0,
      context: 1,
      state: 2,
      role: 3,
      relation: 4,
      polarity: 5,
      orientation: 6,
      modality: Modality.Text,
    });
  });

  it('encodes and decodes video modality', () => {
    const code = encodeGlyph({
      action: Action.Read,
      context: Context.Page,
      state: State.Public,
      role: Role.Human,
      relation: Relation.Subject,
      polarity: Polarity.Internal,
      orientation: Orientation.N,
      modality: Modality.Video,
    });
    const decoded = decodeGlyph(code);
    expect(decoded).toEqual({
      action: Action.Read,
      context: Context.Page,
      state: State.Public,
      role: Role.Human,
      relation: Relation.Subject,
      polarity: Polarity.Internal,
      orientation: Orientation.N,
      modality: Modality.Video,
    });
  });
});
