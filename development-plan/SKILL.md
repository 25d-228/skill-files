# Development Plan

> **Invocation:** Use only when explicitly invoked (e.g. `/development-plan [project-name]`). Do not auto-trigger on phrases like "write a development plan", "plan this project", or "give me a roadmap".

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
```

### What this project is

3–6 sentences covering what it does and who uses it.

### Repository layout

A ` ```text ` block showing the current file layout. If scaffolding is part of the plan, add a second block showing the post-scaffold layout. State where commands should be run from.

## How to order phases

The plan must follow **incremental construction**: each phase produces a working system that the next phase extends. At no point should the developer build everything at once. Every phase adds exactly one visible capability on top of what already works.

### Rule 1: Infrastructure before features

Set up the project skeleton, dependencies, build system, and dev tooling first. Nothing else works without this. Mark DONE if the project already exists, and add a re-verify recipe.

**Always isolate the project in a managed environment.** Phase 1 must pin a language version and create an isolated environment before installing any dependency. Pick the tool that matches the stack:

| Stack              | Tool                   | What to pin / create                           |
| ------------------ | ---------------------- | ----------------------------------------------- |
| Python             | `uv`                   | `uv init`, `uv python pin <version>`, `uv venv` |
| Node.js / TS       | `nvm` + `pnpm`/`npm`   | `.nvmrc`, `nvm use`, lockfile committed         |
| Rust               | `rustup`               | `rust-toolchain.toml`                           |
| Go                 | `go.mod`               | `go 1.XX` directive                             |
| Ruby               | `rbenv` / `asdf`       | `.ruby-version`, `bundle install`               |
| Other              | `asdf` or `mise`       | `.tool-versions`                                |

The phase must include the exact command to create the environment, the command to activate it, and a **Verify:** step that prints the resolved interpreter path or version (e.g. `uv run python -c "import sys; print(sys.executable)"`, `node -v`, `which python`). Every later phase assumes commands run inside this environment — do not install packages globally.

### Rule 2: Shared foundations before any feature that uses them

Build shared layers — database schema, core types/models, auth, config, shared utilities — before any feature that depends on them. If multiple features share a foundation, that foundation is its own phase. Do not build all foundations at once — only introduce a foundation when the next feature needs it.

### Rule 3: Each feature follows its natural build order

Within each feature phase, substeps follow the order a developer would write the code:

1. **Data layer** — schema, models, migrations, seed data
2. **Logic layer** — business rules, services, transformations, validation
3. **Interface layer** — API routes, CLI commands, UI components, event handlers
4. **Wiring** — connect the layers, register routes, bind events
5. **Feature tests** — test the feature end-to-end while it is fresh

This is the order things compile, run, and make sense. You cannot write a route handler before the service it calls exists. You cannot write a service before the data model it operates on exists. Follow this order in every feature phase.

### Rule 4: One important feature per phase

Never put two important features in the same phase. If a phase would contain more than one significant feature, split it into separate phases — one feature each. It is fine to increase the total number of phases. Minor helpers or small utilities can share a phase with a feature, but anything the user would recognize as a distinct capability gets its own phase.

### Rule 5: Stack features — each phase builds on the last

Arrange features so each phase **extends** the working system from the previous phase. The developer should be able to run and verify the system after every single phase.

- If feature B calls feature A, build A first.
- Map the dependency graph and linearize it into a stack: the simplest, most foundational feature at the bottom, the most complex or dependent feature at the top.
- Prefer the order that lets the developer see tangible progress at each step — a feature that produces visible output early is a good foundation for features that refine or extend that output later.
- Independent features can be in any order, but prefer simpler features first — they build confidence and often reveal integration issues early.

**Anti-pattern:** Do not group all "backend" work into one phase and all "frontend" work into another. Instead, build one complete vertical slice (data → logic → UI for one feature), verify it works, then build the next slice on top.

### Rule 6: Introduce complexity gradually

Do not front-load the plan with all the hard parts. Arrange phases so that:

- Early phases are small and self-contained — they establish patterns and prove the architecture works.
- Middle phases add the core features one at a time, each building on the patterns established earlier.
- Later phases tackle harder features that depend on multiple earlier ones.

If a feature is large, split it into a basic version (earlier phase) and an enhanced version (later phase). The basic version should be functional on its own.

### Rule 7: Integration and polish after all features

Cross-cutting concerns (error handling, logging, auth guards, theming, settings, edge cases) come after the features they cut across. Testing at the integration/E2E level comes here too.

### Rule 8: Ship last

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

### 4. Test method

A heading `### Test method` at the end of each phase. Describe exactly how the phase's output is tested:

- **What to test** — the specific behaviors or contracts introduced in this phase.
- **How to test** — the testing approach (unit tests, integration tests, manual smoke test, CLI invocation, curl commands, UI walkthrough, etc.) with concrete commands or steps.
- **Expected result** — what a passing run looks like (exit code, output snippet, UI state).

> ### Test method
>
> **What to test:** Registration rejects duplicate emails; login returns a valid JWT.
>
> **How to test:**
> ```bash
> pytest tests/test_auth.py -v
> ```
>
> **Expected result:** All 4 tests pass. `test_duplicate_email` returns 409. `test_login_success` response body contains a `token` field.

### 5. Phase completion summary

End every phase with a `### What was implemented` section. This section tells the agent executing the plan to stop and report to the user what was built in this phase. The agent reading this plan is not the same agent that wrote it — it needs an explicit instruction to communicate progress.

> ### What was implemented
>
> After completing this phase, tell the user:
>
> - Which files were created or changed.
> - What the system can now do that it could not do before this phase.
> - How to verify it works (repeat the key verify command).

## Style rules

- **No code snippets in the plan.** Describe what to build in natural language — name the function, its inputs, its behavior, and its return value, but do not write the implementation. The agent executing the plan writes the code; the plan tells it *what* to build, not *how* to type it. Shell commands the user or agent can run (install, build, test, migrate) are fine — those are actions, not implementations.
- Plain, direct language. Short sentences.
- Imperative voice: "Run `npm install`", not "you should run npm install".
- Concrete over abstract: name the exact command, file, or field.
- Tables for prerequisites. Numbered lists for ordered steps. Bullets for unordered options.
- **Tables must be padded** (columns aligned with spaces in the source). The plan file is committed to the repo, so raw markdown should be readable in a plain text editor — not just in the rendered view.
- Type every code fence (` ```bash `, ` ```json `, ` ```text `). Never untyped.
- No emojis unless asked.
- Markdown links for file references.

## How to write the plan

1. Read the repo. Check manifest files (`package.json`, `Cargo.toml`, `pyproject.toml`, `go.mod`, …) so the plan matches reality.
2. List all features. For each feature, identify what it depends on (other features, shared foundations, external services).
3. Draw the dependency graph and linearize it into a stack: the simplest standalone feature at the bottom, features that extend earlier ones above. Each feature should clearly build on what the previous phase delivered.
4. Check the stack: after completing phase N, does the system work and do something useful? Can the developer demo it? If a phase leaves the system in a broken or half-finished state, merge it with the next phase or split differently.
5. Within each feature, order substeps by the natural build order: data → logic → interface → wiring → tests.
6. Draft the phase list — titles and one-line goals only. Walk through it: can each phase be built and verified using only what came before? Does each phase add exactly one visible capability? If not, reorder or split.
7. Fill in substeps. For each one ask: what command? what does it produce? how do I prove it? If you can't answer all three, break it down further.
8. Write the plan with the Write tool. Default path: `<project-name>-development-plan.md` at the repo root.
9. After writing, send a chat summary under 10 lines: file path, phase titles, and which phase to start with.
