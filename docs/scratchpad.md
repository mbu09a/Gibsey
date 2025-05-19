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

## 2025-05-19: Page data enrichment

Regenerated `the-entrance-way-pages.json` using `chunk_entrance_way.py`. The script detected 710 pages and wrote them back to disk. Section headings are pulled from any first bolded line (`**like this**`) on a page. The `entrance-way-section-map.json` file provides the official section and chapter ranges.

Sample assignments:
- **Page 1** – Section 1 "an author’s preface" (no chapter)
- **Page 25** – Section 3 "An Unexpected Disappearance: A Glyph Marrow Mystery", Chapter 1 "The Queue and Station"
- **Page 58** – Section 3, Chapter 2 "The Tunnel"
- **Page 204** – Section 4 "An Expected Appearance: A Phillip Bafflemint Noir", Chapter 1 "The Tunneled Vision"
- **Page 612** – Section 14 "An Unexpected Disappearance: A Glyph Marrow Mystery", Chapter 10 "The Geyser"

Issue: the heading on page 9 is parsed as "London Fox Who Dreams of Synchronistic Extraction" but the section map names this portion "London Fox Who Vertically Disintegrates". The map values are kept as canonical. No other special handling was required.
