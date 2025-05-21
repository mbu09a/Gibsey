# AGENTS.md

## Welcome to Gibsey

**Gibsey** is an agentic, myth-powered, literary operating system. This repo is home to the *Gibsey Engine* — an interactive, AI-driven platform for narrative, memory, and recursive creativity.

This document is for human and AI agents. If you’re here to build, fix, or imagine, read on.

---

## Project Structure

- `apps/web`: React frontend (Vite, TanStack Router/Query, tRPC client, Tailwind)
- `apps/api`: Bun backend (Hono, tRPC server, Drizzle ORM, Better Auth)
- `packages/db`: Drizzle ORM models & migrations (shared)
- `packages/types`: Shared TS types/interfaces
- `services/ai`: Python microservice(s) for embeddings, ML, or advanced AI logic
- `services/n8n`: n8n workflow automations
- `tests/`: Playwright E2E + unit tests
- `AGENTS.md`: This file — onboarding and conventions

---

## Local Development

**Requirements:**
- [Bun](https://bun.sh/) (>= v1.0)
- [Node.js](https://nodejs.org/) (for some scripts/tools, optional)
- [Python 3.x](https://python.org/) (for `/services/ai`)
- [Docker](https://www.docker.com/) (optional, for orchestration)
- [Vite](https://vitejs.dev/)
- [Coolify](https://coolify.io/) (for deployment)

**Quickstart:**
1. `bun install` in root.
2. `bun run dev` in `apps/api` and `apps/web` (separate terminals).
3. (Optional) Start Python AI service in `services/ai`: `uvicorn main:app --reload`
4. See `README.md` for more detailed steps.

---

## Key Conventions

- **All business logic lives in tRPC procedures** (`apps/api`).
- **Database models are defined in Drizzle ORM** (`packages/db`). Migrate with `bunx drizzle-kit migrate`.
- **Types are shared** via `packages/types`.
- **Frontend uses TanStack Router/Query** for navigation and data fetching.  
- **Auth** handled by Better Auth — see `/apps/api/auth`.
- **Automations** and integration workflows in `services/n8n`.
- **E2E testing** is in `/tests/e2e` (Playwright).
- **AI logic** (embeddings, ML, external API calls) lives in `/services/ai`, called via REST/gRPC.

---

## How to Contribute (or Delegate Tasks)

- **Be specific** — Open issues with clear context: what, why, acceptance criteria.
- **Small PRs win** — One feature or fix per PR. Keep it easy to review/approve.
- **Always add types** — Type safety is enforced. No `any` except where absolutely unavoidable.
- **Write docs/comments** — Explain complex logic in code or Markdown.
- **Tests are love** — If you touch business logic or API, add/update a test.

---

## For AI Agents (e.g., Codex, Copilot, etc.)

- **Read this file and `README.md` for context.**
- **Follow existing conventions and file structure.**
- **Always run tests before proposing code.**
- **If you don’t know, ask in PR comments or leave a TODO with details.**
- **Output must be idempotent — do not overwrite data, configs, or environment variables without explicit instruction.**
- **Do not push to `main`/`prod` branches directly.**

---

## Vision & Ethos

- **Gibsey is recursive, mythic, and agentic.**
- Every component should be composable and replaceable.
- Embrace clarity, beauty, and experiment — this is a literary engine, not just CRUD.
- Code is poetry; comments are invitations; every agent (human or AI) is a collaborator, not a cog.

---

## Reference Assets

- **Entrance Way Source File:**  
  Please use `/packages/db/seed/the-entrance-way.txt` as the canonical source for all page chunking, seeding, and content tasks.

- **Corpus Symbols:**
  All baseline symbols for the Corpus are located in `/the-corpus/symbols/`.
  Each SVG file is named according to its character or archetype. Reference these when building navigation, tagging, or ritual UI elements.

---

## Entrance Way API

tRPC endpoints are served from `/trpc`:

| Procedure | Parameters | Result |
|-----------|------------|--------|
| `getPageById` | `{ section: number, index: number }` | `Page \| null` |
| `getPagesBySection` | `{ section: number }` | `Page[]` |
| `searchPages` | `{ query: string }` | `Page[]` |
| `getSections` | none | `Section[]` |
| `getSymbols` | none | `string[]` |

Example using TanStack Query:

```ts
const page = trpc.getPageById.useQuery({ section: 1, index: 5 });
```

### Object Structure

`Page` objects contain:

- `id`: numeric primary key
- `section`: section ID
- `sectionName`: human readable name
- `corpusSymbol`: symbol code
- `pageNumber`: page index within the section
- `globalIndex`: absolute ordering of pages
- `text`: page content

`Section` objects contain:

- `id`: numeric primary key
- `sectionName`: title of the section
- `corpusSymbol`: associated symbol

### Request/Response Examples

`getPageById`

```http
POST /trpc/getPageById
{ "section": 1, "index": 1 }
```

```json
{
  "id": 1,
  "section": 1,
  "sectionName": "an author's preface",
  "corpusSymbol": "A",
  "pageNumber": 1,
  "globalIndex": 1,
  "text": "..."
}
```

`getPagesBySection`

```http
POST /trpc/getPagesBySection
{ "section": 1 }
```

```json
[
  { "id": 1, "section": 1, "pageNumber": 1, ... }
]
```

`searchPages`

```http
POST /trpc/searchPages
{ "query": "Scheherazade" }
```

```json
[
  { "id": 3, "section": 1, "pageNumber": 3, ... }
]
```

`getSections`

```http
POST /trpc/getSections
{}
```

```json
[
  { "id": 1, "sectionName": "an author's preface", "corpusSymbol": "A" }
]
```

`getSymbols`

```http
POST /trpc/getSymbols
{}
```

```json
["A.svg", "B.svg"]
```

## Running Tests

- **TypeScript unit tests:** `bun test`
- **Python unit tests:** `pytest`
- **Playwright E2E tests:** `bunx playwright test` (after installing Playwright)

Sample test data lives at `/packages/db/seed/the-entrance-way-pages.json`. Many
tests expect this path during setup.

---

## QDPI System API
This section details the tRPC procedures available for interacting with the QDPI (Quantum Descriptive Phenomenological Inquiry) event logging system.

### `logQdpiMove`
Logs a QDPI (Quantum Descriptive Phenomenological Inquiry) event to the system. This is the primary way to record any significant action, state change, or interaction within the Gibsey Engine, using the full 8-axis QDPI grammar.

**Input Parameters:**
The procedure expects an object with the following fields (enums are from `packages/utils/glyphCodec.ts`):
- `action: Action` (e.g., `Action.Read`, `Action.Write`)
- `context: GlyphContext` (e.g., `GlyphContext.Page`, `GlyphContext.Reaction`)
- `state: State` (e.g., `State.Public`, `State.Private`)
- `role: Role` (e.g., `Role.Human`, `Role.Guest` - from the 6 core roles)
- `relation: Relation` (e.g., `Relation.S2O`, `Relation.O2S`)
- `polarity: Polarity` (e.g., `Polarity.Internal`, `Polarity.External`)
- `rotation: Rotation` (e.g., `Rotation.N`, `Rotation.E`)
- `modality?: Modality` (optional, defaults to `Modality.Text`; e.g., `Modality.Audio`)
- `userId?: string` (optional, identifier for the user performing the action)
- `operationDetails?: string` (optional, human-readable string or JSON string for any additional context or specific identifiers related to the move, e.g., page ID, note ID).

**Recommended Usage:**
It is highly recommended to use the event creation helper functions from `packages/qdpi/index.ts` (e.g., `createReadEventInput(...)`, `createWriteEventInput(...)`) to construct the input for `logQdpiMove`. These helpers provide sensible defaults for common actions.

**Permissions:**
This endpoint enforces action-level permissions. Based on the user's role (from `ctx.user.role`) and the specific `action` being logged, the system checks against defined capabilities in `packages/types/roleCapabilities.ts` and `packages/types/actionPermissions.ts`. Unauthorized actions will result in a 'FORBIDDEN' error.

**Example (TypeScript, using a helper):**
```typescript
// Assuming a tRPC client setup, e.g., from apps/web/src/trpc.ts
// import { trpc } from './trpcClient'; 
import { Role, GlyphContext, Modality } from 'packages/utils/glyphCodec'; // Adjust path as per your import structure
import { createPromptEventInput } from 'packages/qdpi'; // Adjust path

async function logUserPrompt(userRole: Role, promptText: string, pageId: string, userId?: string) {
  const qdpiInput = createPromptEventInput(
    userRole,
    GlyphContext.Page, // Assuming prompt is related to a page
    {
      userId: userId,
      operationDetails: JSON.stringify({ pageId, prompt: promptText }),
      modality: Modality.Text // Explicitly setting modality
    }
  );
  try {
    // const result = await trpc.logQdpiMove.mutate(qdpiInput); // Example client-side call
    // console.log('QDPI Move Logged, ID:', result.moveId);
    // On the server-side, you'd call the procedure directly if within another procedure
  } catch (error) {
    // console.error('Failed to log QDPI move:', error);
  }
}
```

### Querying QDPI Moves
The following tRPC procedures are available for querying logged QDPI events from the `qdpi_moves` table. Returned `QdpiMove` objects include all stored fields: `id`, `timestamp`, `numericGlyph`, `action`, `context`, `state`, `role`, `relation`, `polarity`, `rotation`, `modality`, `userId`, and `operationDetails`.

#### `getQdpiMoveById`
Retrieves a single QDPI move by its unique database ID.
- **Parameters:** `{ id: number }`
- **Result:** `QdpiMove | null`

#### `getQdpiMovesByNumericGlyph`
Retrieves all QDPI moves that share the same `numericGlyph` value, ordered by timestamp descending.
- **Parameters:** `{ numericGlyph: number }`
- **Result:** `QdpiMove[]`

#### `getQdpiMoves`
Retrieves a list of QDPI moves based on a flexible set of filters, with pagination and ordering by timestamp descending.
- **Parameters:** An object with:
    - `filter?: { action?: Action, context?: GlyphContext, state?: State, role?: Role, relation?: Relation, polarity?: Polarity, rotation?: Rotation, modality?: Modality, userId?: string, startDate?: number, endDate?: number }` (all filter fields are optional; `startDate` and `endDate` are Unix timestamps in milliseconds).
    - `limit?: number` (defaults to 50)
    - `offset?: number` (defaults to 0)
- **Result:** `QdpiMove[]`

**Example (TypeScript, using `getQdpiMoves`):**
```typescript
// Assuming a tRPC client setup
// import { trpc } from './trpcClient';
import { Action, Role } from 'packages/utils/glyphCodec'; // Adjust path

async function fetchRecentGuestReactions(userIdForFilter?: string) {
  try {
    const twentyFourHoursAgo = Date.now() - (24 * 60 * 60 * 1000);
    // const moves = await trpc.getQdpiMoves.query({ // Example client-side call
    //   filter: {
    //     role: Role.Guest,
    //     action: Action.React,
    //     userId: userIdForFilter, // Can be undefined
    //     startDate: twentyFourHoursAgo
    //   },
    //   limit: 20
    // });
    // console.log('Recent Guest reactions:', moves);
    // moves.forEach(move => {
    //   console.log(`Action: ${Action[move.action]}, Details: ${move.operationDetails}`);
    // });
  } catch (error) {
    // console.error('Failed to fetch QDPI moves:', error);
  }
}
```

---

## Need Help?  
- Check `/README.md`, `/docs/`, and [`docs/role-permissions.md`](docs/role-permissions.md)
- For environment or deployment issues, see `coolify.yml` and Docker configs.
- For AI/ML questions, see `/services/ai/README.md`
- Ask, don’t guess — leave issues or notes for future agents.

---

*This doc will grow. Add clarifications and wisdom as you go. Gibsey is alive, and so are you.*