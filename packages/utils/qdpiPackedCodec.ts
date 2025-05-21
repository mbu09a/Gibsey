export function packQdpiGlyphs(glyphs: number[]): Uint8Array {
  const outputBytes: number[] = [];
  let bitBuffer = 0n;
  let bitsInBuffer = 0;

  for (const glyph of glyphs) {
    // Input Validation
    if (glyph < 0 || glyph > 131071) {
      throw new RangeError(
        `Glyph value ${glyph} is out of the 17-bit range (0-131071).`
      );
    }

    // Add the 17 bits of the current glyph to the bitBuffer
    bitBuffer = (bitBuffer << 17n) | BigInt(glyph);
    bitsInBuffer += 17;

    // While bitsInBuffer >= 8
    while (bitsInBuffer >= 8) {
      // Extract the most significant 8 bits from bitBuffer
      const byteToWrite = Number(
        (bitBuffer >> BigInt(bitsInBuffer - 8)) & 0xffn
      );
      outputBytes.push(byteToWrite);
      bitsInBuffer -= 8;
      // Remove the extracted bits from bitBuffer (optional, as the shift in byteToWrite handles it, but good for clarity if bitBuffer is masked)
      bitBuffer &= (1n << BigInt(bitsInBuffer)) - 1n; // Keep only the remaining lower bits
    }
  }

  // After processing all glyphs, if bitsInBuffer > 0
  if (bitsInBuffer > 0) {
    // There are leftover bits. These should be written as the final byte, MSB-aligned and padded with zeros at the LSB end.
    const finalByte = Number(
      (bitBuffer & ((1n << BigInt(bitsInBuffer)) - 1n)) <<
        BigInt(8 - bitsInBuffer)
    );
    outputBytes.push(finalByte);
  }

  return Uint8Array.from(outputBytes);
}

export function unpackQdpiGlyphs(packed: Uint8Array): number[] {
  let bitBuffer = 0n;
  let bitsInBuffer = 0;
  const outputGlyphs: number[] = [];
  const GLYPH_BITS = 17;
  const GLYPH_MASK = (1n << BigInt(GLYPH_BITS)) - 1n;

  for (const byte of packed) {
    bitBuffer = (bitBuffer << 8n) | BigInt(byte);
    bitsInBuffer += 8;

    while (bitsInBuffer >= GLYPH_BITS) {
      const glyph = Number(
        (bitBuffer >> BigInt(bitsInBuffer - GLYPH_BITS)) & GLYPH_MASK
      );
      outputGlyphs.push(glyph);
      bitsInBuffer -= GLYPH_BITS;
      // Optional: Mask bitBuffer to keep only remaining lower bits
      bitBuffer &= (1n << BigInt(bitsInBuffer)) - 1n;
    }
  }

  // Trailing bits that are less than GLYPH_BITS are ignored,
  // as they represent padding from the packQdpiGlyphs function.

  return outputGlyphs;
}
