import {
  packQdpiGlyphs,
  unpackQdpiGlyphs,
} from '../../packages/utils/qdpiPackedCodec';

describe('packQdpiGlyphs and unpackQdpiGlyphs - Round Trip', () => {
  function RountTripTest(glyphs: number[]) {
    const packed = packQdpiGlyphs(glyphs);
    const unpacked = unpackQdpiGlyphs(packed);
    expect(unpacked).toEqual(glyphs);
  }

  it('should correctly pack and unpack an empty glyph array', () => {
    const glyphs: number[] = [];
    const packed = packQdpiGlyphs(glyphs);
    expect(packed).toEqual(new Uint8Array([]));
    const unpacked = unpackQdpiGlyphs(packed);
    expect(unpacked).toEqual(glyphs);
  });

  it('should correctly pack and unpack a single glyph', () => {
    RountTripTest([12345]);
  });

  it('should correctly pack and unpack multiple glyphs that result in perfect byte alignment', () => {
    const glyphs = Array(8)
      .fill(0)
      .map((_, i) => i + 1); // 8 glyphs * 17 bits = 136 bits = 17 bytes
    RountTripTest(glyphs);
  });

  it('should correctly pack and unpack multiple glyphs with leftover bits', () => {
    RountTripTest([1, 2, 3]); // 3 glyphs * 17 bits = 51 bits
  });

  it('should correctly pack and unpack glyphs with value 0', () => {
    RountTripTest([0, 0, 0]);
  });

  it('should correctly pack and unpack glyphs with maximum 17-bit value', () => {
    RountTripTest([131071, 131071]); // 2^17 - 1
  });

  it('should correctly pack and unpack mixed glyph values', () => {
    RountTripTest([0, 131071, 123, 45678, 99999]);
  });

  it('should correctly pack and unpack a longer sequence of pseudo-random glyphs', () => {
    const glyphs: number[] = [];
    for (let i = 0; i < 100; i++) {
      glyphs.push(Math.floor(Math.random() * 131072)); // Generate numbers between 0 and 2^17 - 1
    }
    RountTripTest(glyphs);
  });
});

describe('packQdpiGlyphs - Error Handling', () => {
  it('should throw RangeError for glyph value too large', () => {
    expect(() => packQdpiGlyphs([131072])).toThrow(RangeError);
    expect(() => packQdpiGlyphs([2 ** 17])).toThrow(RangeError);
  });

  it('should throw RangeError for negative glyph value', () => {
    expect(() => packQdpiGlyphs([-1])).toThrow(RangeError);
  });

  it('should throw RangeError for mixed valid and invalid glyphs (too large)', () => {
    expect(() => packQdpiGlyphs([10, 20, 131072, 30])).toThrow(RangeError);
  });

  it('should throw RangeError for mixed valid and invalid glyphs (negative)', () => {
    expect(() => packQdpiGlyphs([10, 20, -5, 30])).toThrow(RangeError);
  });
});
