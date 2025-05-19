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

Example using TanStack Query:

```ts
const page = trpc.getPageById.useQuery({ section: 1, index: 5 });
```

---

## Need Help?  
- Check `/README.md` and `/docs/`
- For environment or deployment issues, see `coolify.yml` and Docker configs.
- For AI/ML questions, see `/services/ai/README.md`
- Ask, don’t guess — leave issues or notes for future agents.

---

*This doc will grow. Add clarifications and wisdom as you go. Gibsey is alive, and so are you.*