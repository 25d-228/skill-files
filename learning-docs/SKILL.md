# Learning Docs

> **Invocation:** Use only when explicitly invoked (e.g. `/learning-docs`). Do not auto-trigger on phrases like "explain this code", "write documentation", or "annotate this file".

Build a folder of click-to-toggle annotated HTML pages for a project's source files. Language-agnostic — works for Python, C, Rust, JS, Go, Java, anything. Each source file gets a sibling `.html` mirroring its filesystem path, rendered in Solarized Light + FiraCode Nerd Font with Material elevation, click-toggle tooltips on every meaningful token, and Pattern A explanations.

## When to use

The user is learning a codebase — typically a junior dev on a new language or framework — and asks for a persistent project-wide learning record they can browse like a code editor.

## File layout

Mirror the real source tree under `docs/learning/` with `.html` appended to each filename. Add the folder to `.gitignore`.

```
docs/learning/
├── index.html              # home: file tree, done/todo state
├── styles.css              # shared (copy from this skill folder)
├── script.js               # shared (copy from this skill folder)
├── <root-manifest>.html    # mirrors any root file (pyproject.toml, Cargo.toml, package.json, Makefile, ...)
└── src/
    └── <file>.<ext>.html   # mirrors each source file by full path
```

Stylesheet + script link paths are **depth-relative** (use the same depth-prefix for both):

| Page depth (under `docs/learning/`) | Prefix |
|---|---|
| 0 (index.html) | `` (empty) |
| 1 | `../` |
| 2 | `../../` |
| 3 | `../../../` |

## Initial setup

On the first invocation in a project where `docs/learning/` doesn't exist yet, do these steps before anything else:

1. **Create** the directory `docs/learning/`.
2. **Copy** `styles.css` and `script.js` from this skill's folder (the directory holding this `SKILL.md`) into `docs/learning/`. Read each file and write its content unchanged to the target path; do not modify.
3. **Add** `/docs/learning/` to the project's `.gitignore`. If `.gitignore` doesn't exist, create it with that single line.
4. **Write** `docs/learning/index.html` from the index template below. Start with an empty `.tree` (no `<li>` entries) unless running in backfill mode (see "Backfilling existing code"), in which case pre-populate every discovered source file as `todo`.

After setup is complete, every subsequent invocation just runs the normal workflow.

## Workflow

Per code step the user takes (one new file, one edit, etc.):

1. **Explain → propose → ask → apply.** Show the proposed `.html` content, ask before writing. Treat each page as its own approved write.
2. **Write** the file's `.html` under `docs/learning/`, mirroring the source path.
3. **Update** `docs/learning/index.html`: convert that entry's `<div class="file-row todo">…<span class="chip">todo</span></div>` to `<a class="file-row" href="…"><span class="chip done">done</span></a>`.
4. **Do not add or remove** files from the planned list without confirming with the user.

## Backfilling existing code

When the user invokes the skill on a repo that already has source files (instead of writing new code one-at-a-time), switch to batch mode:

1. **Discover** source files with `Glob` using the project's primary extensions (e.g. `**/*.rs`, `**/*.py`, `**/*.ts`). Skip generated/vendored folders: `node_modules`, `target`, `dist`, `build`, `__pycache__`, `.svelte-kit`, `.next`, etc.
2. **Order** the list sensibly — entry points and manifests first (`main.py`, `lib.rs`, `index.ts`, `pyproject.toml`, `Cargo.toml`), then files closer to the leaves of the dependency graph.
3. **Pre-populate** `index.html` with every discovered file marked `todo`. Show the full ordered list to the user once.
4. **Get one approval for the whole batch** — e.g. *"Found 28 files. Write all 28 pages in this order? [list]"* — instead of asking per file.
5. **Write each `.html` in sequence** without re-asking, AS LONG AS nothing surprising appears. Stop and check in if: a file is way larger than expected, uses an unfamiliar construct that needs discussion, or seems intentionally out of scope (test fixtures, generated code).
6. **Update `index.html`** after each file (`todo` → `done`) so the user can refresh and watch progress.

For very small repos (≤5 files), skip batching — the standard per-step workflow is fast enough.

## Page template

Every annotated page (every page except `index.html`) uses this skeleton. Replace `{PREFIX}` with the depth-relative prefix from the table above and `{TITLE}` with the source path:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{TITLE} — project-name</title>
<link rel="stylesheet" href="{PREFIX}styles.css">
<script src="{PREFIX}script.js" defer></script>
</head>
<body>

<header class="app-bar">
  <a href="{PREFIX}index.html" class="back-btn" aria-label="Back to home">
    <svg viewBox="0 0 24 24"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
  </a>
  <a class="app-bar-title" href="{PREFIX}index.html">{TITLE}</a>
</header>

<main class="page">

<div class="sub">Click the dotted tokens to see the explanation.</div>

<div class="pre-summary">
  <strong>What is this file for?</strong><br>
  ... one short paragraph: purpose + closest analog in the user's known languages ...
</div>

<div class="code"><!-- source code with .tok / .tip annotations --></div>

</main>
</body>
</html>
```

## Index template

The home `index.html` has its own markup — app bar without a back button (title is a `<div>`, not an `<a>`), an intro card, then the file tree. Use this template; populate the `.tree` with `<li>` entries per file/folder. Replace `{PROJECT_NAME}` with the project's display name:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{PROJECT_NAME} — learning docs</title>
<link rel="stylesheet" href="styles.css">
<script src="script.js" defer></script>
</head>
<body>

<header class="app-bar">
  <div class="app-bar-title">{PROJECT_NAME} — learning docs</div>
</header>

<main class="page">

<div class="intro">
  <strong>What is this?</strong><br>
  Hover-annotated explanations for every source file in the project, mirroring
  the real directory layout under <code>docs/learning/</code>. Click a file
  below to read the code with inline tooltips. Files marked <em>todo</em> will
  be filled in as we add or revisit them.
</div>

<div class="tree">
  <ul>
    <!-- Folder + file rows go here. See markup snippets below. -->
  </ul>
</div>

<div class="legend">
  Tap a <strong>done</strong> file to open its annotated page. Todo entries
  fill in as we write or revisit their source.
</div>

</main>
</body>
</html>
```

**Folder row** (non-clickable, holds a nested `<ul>` for its children):

```html
<li>
  <div class="folder-row">
    <span class="icon"><svg viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg></span>
    src/
  </div>
  <ul>
    <!-- child file/folder rows -->
  </ul>
</li>
```

**File row — done** (page exists, link is live, green chip):

```html
<li>
  <a class="file-row" href="src/main.py.html">
    <span class="icon"><svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/></svg></span>
    main.py
    <span class="chip done">done</span>
  </a>
</li>
```

**File row — todo** (no page yet, not clickable, grey chip):

```html
<li>
  <div class="file-row todo">
    <span class="icon"><svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/></svg></span>
    helpers.py
    <span class="chip">todo</span>
  </div>
</li>
```

When a file moves from todo → done, replace the `<div class="file-row todo">…</div>` with the `<a class="file-row" href="…">…</a>` form and flip the chip from `<span class="chip">todo</span>` to `<span class="chip done">done</span>`.

## Tooltip syntax

Wrap any token whose meaning isn't obvious:

```html
<span class="tok tip-left" tabindex="0"><span class="kw">def</span><span class="tip">Explanation with inline <code class="type">Type</code> and <code class="fn">method</code> references.</span></span>
```

- **`.tok`** — interactive token; shows a dotted underline. Always include `tabindex="0"` for keyboard access.
- **`.tip`** — explanation popover, child of `.tok`. Hidden until the `.tok` is clicked.
- **`.tip-left`** / **`.tip-right`** — anchor the popover to the left/right edge instead of centering. Use `.tip-left` near the start of a line, `.tip-right` near the end of a line, and no modifier in the middle.

Click-to-toggle is handled entirely by `script.js`. No per-page wiring needed.

## Token color classes

Use the same classes inside `.code`, inside `.tip code`, and inside `.pre-summary code`:

| Class | Color | For |
|---|---|---|
| `.kw` | green | Language keywords — Python `def`/`class`/`if`/`for`, C `struct`/`static`/`return`, JS `function`/`const`, Rust `use`/`fn`, etc. |
| `.type` | yellow | Type names — built-ins (`int`, `str`, `void`, `bool`) and user-defined classes/structs/enums; enum variants |
| `.fn` | blue | Function names, method calls, macro names, decorator/annotation names |
| `.str` | cyan | String literals, char literals |
| `.ident` | blue | Plain identifiers, parameter names, variable names |
| `.punc` | muted | `()`, `[]`, `{}`, `.`, `,`, `::`, `->`, operators |
| `.comment` | muted italic | `#`, `//`, `/* */` — any comment syntax |
| `.attr` | blue | Decorators / annotations / attribute macros — Python `@decorator`, Java `@Annotation`, Rust `#[attr]` |

## Explanation style — Pattern A

Each tooltip hits up to **four beats** in order. Drop beats that don't apply, but never skip beat 1.

1. **Definition.** One short line — what the token *is* in language terms.
2. **Analogy.** Anchor analogies on **Python** and **C** by default — they cover most concepts a beginner-to-intermediate programmer recognizes. Pivot to other languages only if `user_role.md` says the user knows them better.
   - **C** — pointers, references, lifetimes (`&T` ≈ `T*`, immutable strings ≈ `const char *` in `.rodata`), manual memory (`malloc`/`free`), tagged unions, `#ifdef`, stack vs heap, function pointers, header/source split.
   - **Python** — nullable / optional types (≈ `None` or exceptions), iterators, closures (≈ lambdas), decorators (`@decorator` ≈ attribute macros / annotations), dict/list/tuple ↔ HashMap/Vec/tuple, duck typing (≈ structural typing / trait bounds), `__init__.py` ≈ module entry point.
3. **Concrete example or signature.** What shape the token takes in *this* code — actual JSON, actual return type, actual sample input/output.
4. **Why-here.** Connect to the surrounding code's intent — why this token was used in this spot.

**Coverage depth:** every meaningful token in every file, even when the concept appeared in an earlier file. The reader may open files in any order. Brief restatement on repeat appearances is fine; never assume prior reading.

## What this skill does NOT do

- **Does not edit source code.** Only writes/updates `.html` files under `docs/learning/`. Source files are read-only from this skill's perspective.
- **Does not commit.** `docs/learning/` is gitignored by convention; nothing here is meant for the repo's history.
- **Does not auto-track new source files.** When a new source file lands, this skill writes its `.html` only when asked.

## End-of-run summary

After each write, tell the user the absolute path created/updated and (if applicable) which `index.html` entry flipped from `todo` → `done`. One sentence.
