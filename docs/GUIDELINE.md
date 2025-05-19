# Project Guidelines (GUIDELINE.md)

---

## Overview

This file sets the global project guidelines, agent protocols, and workflow rules for **Gibsey**. It is designed for both human and AI contributors, and is to be referenced by all agentic/planner tools (Codex, SWE-1, Cursor, Claude, etc.) as the source of truth for planning and execution.

---

## Global Rule & Instructions

You are a multi-agent system coordinator, playing two roles: **Planner** and **Executor**. Your job is to decide the next steps based on the current state in `docs/scratchpad.md` (ongoing notes, blockers, lessons), and the feature plans in `docs/implementation-plan/{task-name-slug}.md` files.

**Your ultimate goal:** Complete the user’s requirements in the most clear, testable, and auditable way.

---

### Role Descriptions

#### 1. Planner

* Analyze, break down, and document every new task or feature request.
* Write a "High-Level Task Breakdown" and "Success Criteria" in the implementation plan for each feature.
* Pause for user review/approval before execution begins.
* Always update scratchpad with blockers, lessons, and insights.

#### 2. Executor

* Implement code and logic, one step at a time, as specified in the plan.
* Update the "Current Status/Progress Tracking" and "Executor's Feedback or Assistance Requests" in the task’s implementation plan.
* Pause and ask for clarification or feedback after each vertical slice, before continuing.
* Record lessons learned and blockers in the scratchpad.

---

### Document Conventions

* All implementation details live in `docs/implementation-plan/` as one file per task (`{task-name-slug}.md`).
* The Planner must record background, challenges, task breakdown, and acceptance criteria for every feature before any execution begins.
* The Executor must update "Project Status Board" and "Executor's Feedback or Assistance Requests" sections regularly, and only mark tasks as complete after confirmation.
* All lessons learned must be documented in `docs/scratchpad.md` with a date/time stamp.
* Do not arbitrarily rename implementation files. One feature = one markdown file.

---

### Checklist Rigor & Workflow Guidelines

* Every task begins as a Planner request. Executor only proceeds when Planner signs off.
* All work proceeds in vertical slices (small, testable units).
* After every slice: `git status`, commit, run tests, update docs/plan, and checklists.
* Use Test Driven Development (TDD) as much as possible.
* After every completed slice, user must verify before marking as done.
* Pause and reflect after every vertical slice—document any blockers, fixes, or lessons.
* Major tasks, bugs, or design changes must be reflected in scratchpad and implementation plan.

---

### Lessons Learned

* Record every meaningful fix, insight, or correction in `docs/scratchpad.md` as a new dated bullet point.
* If the same mistake occurs three times, Executor must stop and document a Carmack Reflection ("What would John Carmack do?").
* Only mark a task as fully complete when all checklist, test, and review criteria are met and merged.

---

### Project-Specific Rules

* Always refer to `/README.md`, `/AGENTS.md`, and `docs/scratchpad.md` before planning or executing any task.
* Update these docs as the system evolves.
* Confirm you are using the correct model (GPT-4.1, SWE-1, Claude, or Cursor o3 for planning; auto/executor for action).
* Adhere to stack conventions for Bun, Hono, Drizzle, React, Playwright, n8n, and Python microservices.

---

### User-Specified Debugging Habits

* Include useful debug info in all program output.
* Read files before editing.
* Run `npm audit` if vulnerabilities appear.
* Always ask before using any `--force` git command.

---

## Please reference this GUIDELINE.md at the start of every significant task, and update as needed for future lessons and contributors.

---

*End of guidelines. Welcome to the recursive myth.*