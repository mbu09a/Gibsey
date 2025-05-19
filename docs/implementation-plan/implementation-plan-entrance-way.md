# Implementation Plan: The Entrance Way

This file details the multi-feature plan for building The Entrance Way system in Gibsey. Each feature can be a standalone sprint, PR, or tracked task in docs/implementation-plan/. Sequence is designed for iterative, testable progress with agent/human feedback at every stage.

---

## Feature 1: Prepare and Chunk Source Text

**Goal:** Import The Entrance Way manuscript (\~16 sections, >700 pages) and chunk into addressable pages.

**Subtasks:**

* Convert manuscript (Markdown, TXT, or other) into import-ready format.
* Write and test a chunking script (Python, Bun, or Node).
* Output: JSON/CSV/TS file(s) with page text, section, index, and metadata.
* Store in `/packages/db/seed/` or similar for DB import.

**Success Criteria:**

* All material chunked and stored in files, ready for DB seeding.
* Spot-check a sample for accuracy and order.

---

## Feature 2: Database Schema and Seeding

**Goal:** Design Drizzle ORM schema for pages, sections, metadata, and seed the database.

**Subtasks:**

* Define Drizzle models for Page, Section, etc.
* Add migration scripts in `/packages/db/migrations`.
* Write a seeder to import chunked content.
* Confirm DB is queryable by page, section, sequence.

**Success Criteria:**

* Database contains all Entrance Way content, properly indexed.
* Can fetch page/section/sequence via DB/API call.

---

## Feature 3: Basic Page/Section Querying API

**Goal:** Expose API endpoints to retrieve Entrance Way content via `/apps/api`.

**Subtasks:**

* Scaffold tRPC endpoints:

  * `getPageById(section, index)`
  * `getPagesBySection(section)`
  * `searchPages(query)`
* Add auth/permissions as needed (Better Auth).
* Unit test endpoints and types.

**Success Criteria:**

* Frontend/agents can fetch any page/section.
* Endpoints return correct metadata/content.

---

## Feature 4: Frontend Page Navigation UI

**Goal:** Build UI for reading and browsing Entrance Way content in `/apps/web`.

**Subtasks:**

* Components for page display (title, section, symbol, text), section navigation, prev/next navigation, search/jump.
* Integrate with tRPC client.
* Initial Tailwind styling, cross-browser check.

**Success Criteria:**

* Users can read and navigate by section/page.
* Symbol, metadata, navigation logic work.

---

## Feature 5: Integrate Corpus Tagging

**Goal:** Attach symbolic Corpus metadata to every page/section; display and filter by Corpus.

**Subtasks:**

* Add Corpus symbol association to Drizzle schema.
* Update API/frontend to fetch/display symbol per page.
* Enable filtering/navigation by symbol.
* Test sample data/user flows.

**Success Criteria:**

* Every page displays its symbol; users can browse by symbol.
* Symbol logic matches system docs.

---

## Feature 6: Testing and Agent Integration

**Goal:** Robust testing and early agent support.

**Subtasks:**

* Playwright E2E tests for navigation, query, and UX.
* Unit tests for endpoints and queries.
* Update AGENTS.md with endpoints, page structure, and test data.
* (Optional) Add "test agent" to simulate commentary.

**Success Criteria:**

* Tests pass; agents and users can read, navigate, and comment.

---

## Feature 7: Seeding for UI/AI/Agent Testing

**Goal:** Provide data/scenarios for full-stack and agentic testing.

**Subtasks:**

* Seed DB with Entrance Way, Corpus, and Vault data for test runs.
* Mock user/agent queries, responses, annotation logs.
* Demo flows for review and feedback.

**Success Criteria:**

* Human and AI testers can interact with The Entrance Way as a living system.

---

## Recommended Sequence (PRs/Tasks)

1. Prepare/Chunk Source Text
2. Database Schema & Seeding
3. Querying API
4. Frontend Navigation UI
5. Corpus Tagging Integration
6. Testing & Agent Integration
7. Seeding for Agent/UI Demo

---

*Reference this file before starting Entrance Way feature sprints. Each feature can have its own detailed markdown if needed.*