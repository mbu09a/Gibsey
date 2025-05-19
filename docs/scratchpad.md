# Scratchpad

## Spot-check: the-entrance-way-pages.json

Manual verification of a subset of pages generated from `the-entrance-way.txt`.

Pages checked:

- **Page 1** – Section detected as "an author's preface". Text matches the source preface.
- **Page 2** – No section heading; content begins with "Again, I do not know..." as in the source.
- **Page 3** – No section heading; lines match the source including "Or secondly, this could...".
- **Page 4** – No section heading; paragraph about the Walt Disney Company matches.
- **Page 5** – No section heading; suspect list matches the text file.
- **Page 6** – Warning from the Malt Gibsey Company matches source lines.
- **Page 10** – London Fox description matches the excerpt around the kitchen scene.

All reviewed pages accurately reflect the text in `the-entrance-way.txt` and page numbers correspond correctly.

## 2025-05-19 – Regenerated `the-entrance-way-pages.json`

- Re-ran `chunk_entrance_way.py` to rebuild the pages file from the canonical text.
- Cross-checked output with `entrance-way-section-map.json`.
  - **Page 1** → Section 1: an author’s preface
  - **Page 25** → Section 3: An Unexpected Disappearance – Chapter 1 *The Queue and Station*
  - **Page 204** → Section 4: An Expected Appearance – Chapter 1 *The Tunneled Vision*
  - **Page 565** → Section 14: An Unexpected Disappearance – Chapter 7 *The Rainbows*
  - **Page 678** → Section 16: The Author's Preface
- Noted mismatched headings:
  - Page 9 heading differs from mapped section name.
  - Minor typographic variations on pages 1, 236 and 355.

