---
name: development-plan
description: Write a phased, executable development plan for a software project. Use when the user asks for a development plan, project plan, implementation plan, build plan, or roadmap. Produces markdown with concrete commands, expected results, and verification steps.
argument-hint: [project-name]
allowed-tools: Read Glob Grep Write
---

# Development Plan

Write a phased development plan that is detailed enough to follow step by step.

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
## Phase 1 — Bootstrap
## Phase 2 — First run
## Phase 3..N — Feature phases
## Phase N+1 — Polish
## Phase N+2 — Testing
## Phase N+3 — Ship
## Daily workflow
## Risks & mitigations
```

### What this project is

3–6 sentences covering what it does and who uses it.

### Repository layout

A ` ```text ` block showing the current file layout. If scaffolding is part of the plan, add a second block showing the post-scaffold layout. State where commands should be run from.

## Phases

Order phases by dependency — each must be verifiable using only earlier phases. Each phase has the following pieces, in order.

### 1. Phase header

A heading `## Phase N — <title>` followed by a one-sentence **Goal** in bold.

> ## Phase 3 — HTTP server skeleton
>
> **Goal:** A request to `/health` returns a JSON response.

### 2. "What gets built in this phase" block

A bullet list of every file the phase creates or changes, with every function or class described in **one plain-English sentence, no jargon**. Say what it does for the user, not how it works.

> **What gets built in this phase:**
>
> - `server.ts` — Starts the web server when the app launches.
>   - `startServer` — Opens a port and listens for requests.
>   - `healthRoute` — Replies "ok" so we can tell the server is alive.

Good: "Turns a pair of line numbers into something the editor can highlight."
Bad: "Returns a `vscode.Range` from two integer parameters."

If the phase adds settings, commands, or config keys, list those too in the same plain-English style.

### 3. Substeps

Number them `N.1`, `N.2`, … so the user can say "do 3.4 for me". Each substep has:

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

## Required phases

Every plan has these, in order:

1. **Bootstrap** — set up an empty buildable project. Mark DONE if it already exists, and add a re-verify recipe.
2. **First run** — make sure the empty project actually runs. This is the base for every later verify step.
3. **Feature phases** — one phase per chunk of work, ordered by dependency.
4. **Polish** — UX, theming, settings, edge cases.
5. **Testing** — unit and integration tests. Say what each test covers.
6. **Ship** — production build, packaging, smoke test on the packaged result. Replace with **Deploy** or **Hand-off** for projects that don't ship a binary.

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
2. Draft the phase list first — titles and one-line goals only. Verify the order: each phase reachable using only earlier phases.
3. Fill in substeps. For each one ask: what command? what does it produce? how do I prove it? If you can't answer all three, break it down further.
4. Write the plan with the Write tool. Default path: `<project-name>-development-plan.md` at the repo root.
5. After writing, send a chat summary under 10 lines: file path, phase titles, and which phase to start with.
