---
name: development-plan
description: Write a phased, executable development plan for a software project. Use when the user asks for a development plan, project plan, implementation plan, build plan, or roadmap. Produces markdown with concrete commands, expected results, and verification steps.
argument-hint: [project-name]
allowed-tools: Read Glob Grep Write
---

# Development Plan

Write a development plan that follows the order a developer would actually build things — foundation first, then each feature built bottom-up through its logical layers.

## Before writing

Ask the user only what you cannot infer from the repo:

1. What is being built? (one sentence)
2. What language or framework?
3. Where should the plan file go? (default: repo root, named `<project>-development-plan.md`)

If the answer is already in the conversation or readable from manifest files, do not ask.

## Plan structure

Every plan has these sections, in order:

```markdown
# <Project> Development Plan

## What this project is
## Repository layout
## Phase 1 — Project setup
## Phase 2 — Core foundation
## Phase 3..N — Feature phases (one per feature, in dependency order)
## Phase N+1 — Integration & polish
## Phase N+2 — Ship
## Daily workflow
## Risks & mitigations
```

### What this project is

3–6 sentences covering what it does and who uses it.

### Repository layout

A ` ```text ` block showing the current file layout. If scaffolding is part of the plan, add a second block showing the post-scaffold layout. State where commands should be run from.

## How to order phases

The plan must follow the order a developer would naturally build the project. Apply these rules:

### Rule 1: Infrastructure before features

Set up the project skeleton, dependencies, build system, and dev tooling first. Nothing else works without this. Mark DONE if the project already exists, and add a re-verify recipe.

### Rule 2: Shared foundations before any feature that uses them

Build shared layers — database schema, core types/models, auth, config, shared utilities — before any feature that depends on them. If multiple features share a foundation, that foundation is its own phase.

### Rule 3: Each feature follows its natural build order

Within each feature phase, substeps follow the order a developer would write the code:

1. **Data layer** — schema, models, migrations, seed data
2. **Logic layer** — business rules, services, transformations, validation
3. **Interface layer** — API routes, CLI commands, UI components, event handlers
4. **Wiring** — connect the layers, register routes, bind events
5. **Feature tests** — test the feature end-to-end while it is fresh

This is the order things compile, run, and make sense. You cannot write a route handler before the service it calls exists. You cannot write a service before the data model it operates on exists. Follow this order in every feature phase.

### Rule 4: Features ordered by dependency

If feature B calls feature A, build A first. Map the dependency graph and linearize it. Independent features can be in any order, but prefer simpler features first — they build confidence and often reveal integration issues early.

### Rule 5: Integration and polish after all features

Cross-cutting concerns (error handling, logging, auth guards, theming, settings, edge cases) come after the features they cut across. Testing at the integration/E2E level comes here too.

### Rule 6: Ship last

Production build, packaging, deployment, smoke tests on the packaged result. Replace with **Deploy** or **Hand-off** for projects that don't ship a binary.

## Phase format

Each phase has the following pieces, in order.

### 1. Phase header

A heading `## Phase N — <title>` followed by a one-sentence **Goal** in bold.

> ## Phase 3 — User authentication
>
> **Goal:** A user can register, log in, and receive a session token.

### 2. "What gets built in this phase" block

A bullet list of every file the phase creates or changes, with every function or class described in **one plain-English sentence, no jargon**. Say what it does for the user, not how it works.

> **What gets built in this phase:**
>
> - `models/user.py` — Defines what a user looks like in the database.
>   - `User` — Stores a user's email, hashed password, and creation date.
> - `services/auth.py` — Handles the rules for signing up and logging in.
>   - `register_user` — Creates a new user account after checking the email is not taken.
>   - `authenticate` — Checks the password and returns a session token.
> - `routes/auth.py` — Exposes sign-up and login as API endpoints.
>   - `POST /register` — Accepts email and password, creates the account.
>   - `POST /login` — Accepts email and password, returns a token.
> - `tests/test_auth.py` — Proves registration and login work correctly.

Good: "Turns a pair of line numbers into something the editor can highlight."
Bad: "Returns a `vscode.Range` from two integer parameters."

If the phase adds settings, commands, or config keys, list those too in the same plain-English style.

### 3. Substeps

Number them `N.1`, `N.2`, … so the user can say "do 3.4 for me". Order substeps by the natural build order (data → logic → interface → wiring → tests). Each substep has:

- A short heading and 1–3 sentences describing what to do.
- An exact command in a fenced ` ```bash ` block. If the action is editing a file, name the file and the change.
- A **Result:** line stating what changed (file created, build green, server running, …).
- A **Verify:** step — either a command whose output proves success, or a numbered checklist. Never say "it should work".

Use [path/to/file](path/to/file) markdown links for file references. No time estimates.

### 4. End-of-phase verification

A heading `### Verify (end of phase)` followed by a 3–5 item checklist that proves the phase goal is met.

### 5. Failure triage table

A heading `### If verification fails` followed by a small table:

| Symptom            | Check                    |
|--------------------|--------------------------|
| <observed failure> | <what to look at first>  |

3–5 rows covering the most likely failure modes for that phase.

## Daily workflow section

A small table for after Phase 2:

| Action    | How |
|-----------|-----|
| Edit code | …   |
| Rebuild   | …   |
| Run tests | …   |
| Lint      | …   |

## Risks & mitigations section

A 3–6 row table. Each risk specific to this project, each mitigation a concrete fix.

| Risk     | Mitigation |
|----------|------------|
| <risk>   | <fix>      |

## Style rules

- Plain, direct language. Short sentences.
- Imperative voice: "Run `npm install`", not "you should run npm install".
- Concrete over abstract: name the exact command, file, or field.
- Tables for prerequisites, daily workflow, failure triage, and risks. Numbered lists for ordered steps. Bullets for unordered options.
- **Tables must be padded** (columns aligned with spaces in the source). The plan file is committed to the repo, so raw markdown should be readable in a plain text editor — not just in the rendered view. Example:

  ```markdown
  | Action    | How |
  |-----------|-----|
  | Edit code | …   |
  | Rebuild   | …   |
  ```
- Type every code fence (` ```bash `, ` ```json `, ` ```text `). Never untyped.
- No emojis unless asked.
- Markdown links for file references.

## How to write the plan

1. Read the repo. Check manifest files (`package.json`, `Cargo.toml`, `pyproject.toml`, `go.mod`, …) so the plan matches reality.
2. List all features. For each feature, identify what it depends on (other features, shared foundations, external services).
3. Draw the dependency graph mentally and linearize it: shared foundations first, then features in dependency order, then integration.
4. Within each feature, order substeps by the natural build order: data → logic → interface → wiring → tests.
5. Draft the phase list — titles and one-line goals only. Walk through it: can each phase be built and verified using only what came before? If not, reorder.
6. Fill in substeps. For each one ask: what command? what does it produce? how do I prove it? If you can't answer all three, break it down further.
7. Write the plan with the Write tool. Default path: `<project-name>-development-plan.md` at the repo root.
8. After writing, send a chat summary under 10 lines: file path, phase titles, and which phase to start with.
