# Demo Checklist

This checklist summarizes existing tests and outlines the steps for demonstrating Gibsey.

## Existing Test Coverage by Feature

### Navigation (Playwright)
- `tests/e2e/navigation.spec.ts` checks next/previous buttons, section switching, direct page jumps and search.
- Also verifies symbol rendering and the retro theme classes.

### API Endpoints (Vitest)
- `tests/unit/api/entrance-way.test.ts` mocks the tRPC router to test:
  - `getPageById`
  - `getPagesBySection`
  - `searchPages`
  - `getPagesBySymbol`
  - `getSections`
  - `getSymbols`

### Text Chunking (Python)
- `tests/unit/test_chunk_text.py` covers basic and edge-case chunking logic.
- `tests/unit/test_chunk_entrance_way.py` validates additional metadata such as chapters and connected characters.

### Symbol Mapping and Seeding (Vitest)
- `tests/unit/symbol-map.test.ts` checks filename mapping for characters.
- `tests/unit/test_symbol_map.ts` tests the slug/override helper.
- `tests/unit/test_seed_symbols.ts` ensures seed data propagates symbol codes to sections and pages.

## Additional Scenarios Needed for Full Demo
- Filtering pages by symbol in the UI.
- Running the agent script to simulate a user comment.
- Logging annotation events for later review.

## Verifying DB Seed Data
1. Confirm `packages/db/seed/the-entrance-way-pages.json` matches the source `the-entrance-way.txt` (see sample checks in `docs/scratchpad.md`).
2. Check every entry in `entrance-way-section-map.json` has a symbol in `symbol-map.ts` and a corresponding SVG in `the-corpus/symbols/`.
3. Run `bun run packages/db/seed/index.ts` to seed the SQLite database.
4. Inspect a few records with a SQLite client: `select * from pages limit 5;`.

## Ordered Demo Sequence
1. Start the API server with `bun run dev` in `apps/api`.
2. Start the web frontend with `bun run dev` in `apps/web`.
3. Open the home page and view the first Entrance Way page. *(covered by navigation test)*
4. Navigate using **Next** and **Prev**. *(covered by navigation test)*
5. Switch sections via the dropdown and jump directly to a page. *(covered by navigation test)*
6. Use the search box to locate a page. *(covered by navigation test)*
7. Filter the results by symbol. *(not yet tested)*
8. Run `python services/ai/test_agent.py` to post a demo comment. *(not yet tested)*
9. Observe annotation log entries in the UI or database. *(not yet tested)*
10. Verify seeded data by querying pages and sections directly from the database.
