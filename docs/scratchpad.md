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

Regenerated `the-entrance-way-pages.json` using `chunk_entrance_way.py` (`python chunk_entrance_way.py --output the-entrance-way-pages.json`). The script detected 710 pages and wrote them back to disk. Section headings are pulled from any first bolded line (`**like this**`) on a page. The `entrance-way-section-map.json` file provides the official section and chapter ranges.

Sample assignments:
- **Page 1** – Section 1 "an author’s preface" (no chapter)
- **Page 25** – Section 3 "An Unexpected Disappearance: A Glyph Marrow Mystery", Chapter 1 "The Queue and Station"
- **Page 58** – Section 3, Chapter 2 "The Tunnel"
- **Page 204** – Section 4 "An Expected Appearance: A Phillip Bafflemint Noir", Chapter 1 "The Tunneled Vision"
- **Page 612** – Section 14 "An Unexpected Disappearance: A Glyph Marrow Mystery", Chapter 10 "The Geyser"

Issue: the heading on page 9 is parsed as "London Fox Who Dreams of Synchronistic Extraction" but the section map names this portion "London Fox Who Vertically Disintegrates". The map values are kept as canonical. No other special handling was required.

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

## 2025-05-20 – Web UI smoke test

- Verified new React components load in local dev server.
- Cross-browser check in Chrome 116 and Firefox 118 shows consistent rendering of navigation and search results.
- Edge case: symbol data currently derived from SVG filenames only; may need metadata for titles or descriptions.
- Open question: should search auto-focus results on page navigation?
=======
## 2025-05-19 – UI cross-browser attempt

- Attempted to open the built site in Chrome and Firefox to verify navigation and styling.
- The container environment lacks GUI browsers, so cross-browser behavior could not be confirmed.

## 2025-05-20 – Regenerating `the-entrance-way-pages.json`

Steps to rebuild the pages file from the canonical text:

1. Ensure **Python 3.11+** is available (the repo ships with a `.venv` under `services/ai/`). Activate it or use your system interpreter.
2. Navigate to `packages/db/seed/`.
3. Run the CLI-enhanced script:

   ```bash
   python chunk_entrance_way.py --source the-entrance-way.txt --output the-entrance-way-pages.json --section-map entrance-way-section-map.json
   ```

   The command prints how many pages were written and supports `--source`, `--output`, and `--section-map` options.
4. Verify the new JSON aligns with `entrance-way-section-map.json`.

The heading on **page 9** is parsed as "London Fox Who Dreams of Synchronistic Extraction" while the mapping file lists "London Fox Who Vertically Disintegrates". Keep the mapping value as canonical.

## 2025-05-21 – UI edge cases & cross-browser summary

- **Libraries:** React 18, TanStack Router/Query, tRPC, Tailwind CSS, and Vite.
- **Styling quirks:** dark theme uses a black background with the custom `terminal-green` accent. Disabled buttons rely on `opacity-50` which may look muted in high-contrast mode.
- **Edge cases:** symbol images are derived from SVG filenames; missing metadata means alt text falls back to the section name. Prev/next navigation disables correctly but should be re-tested with dynamic sections.
- **Cross-browser summary:** navigation and search render consistently in Chrome 116 and Firefox 118. Safari and mobile browsers have not yet been tested.
- **TODOs:** add Safari/mobile checks, improve symbol metadata for accessibility, and revisit search focus behavior after navigation.

## 2025-05-22 – Test suite results

- **Playwright:** `npx playwright test` failed to download the Playwright package (`EHOSTUNREACH`). No E2E tests were executed.
- **Vitest:** `bun test` attempted to run the API unit tests but failed with `Cannot find package 'hono'` during module resolution.
- **pytest:** could not run because the local Python environment lacks the `pytest` module.

Follow-up: install missing dependencies and rerun all suites to confirm baseline behavior.
