# Learning Docs

> **Invocation:** Per-session skill. Use only when explicitly invoked (e.g. `/learning-docs`). Do not auto-trigger on phrases like "explain this code", "write documentation", or "annotate this file". Once invoked in a session, keep applying this workflow to all subsequent learning-doc requests in the same session without re-invocation.

Build an Astro static site under `docs/learning/` that mirrors a project's source tree, with one annotated page per source file. Each interactive token has a click-to-toggle tooltip (Pattern A: definition, Python/C analogy, concrete example, why-here) with an optional Example tab. Built with Astro + Shiki + a custom transformer that turns `/*[t:id]*/` comment markers in raw source into clickable buttons that surface a separate Markdown annotation block.

## When to use

The user is learning a codebase — typically a junior dev on a new language or framework — and asks for a persistent project-wide learning record they can browse like a code editor.

## Project layout

The skill ships a complete Astro project under `template/`. On first invocation in a new project, copy that folder wholesale to `docs/learning/`:

```
docs/learning/
├── .nvmrc                              # Node 24 (latest LTS)
├── package.json                        # Astro + MDX + Shiki
├── astro.config.mjs                    # registers tooltipTransformer
├── tsconfig.json                       # @/* path alias
└── src/
    ├── components/
    │   ├── Annotations.astro           # <Annotations>
    │   ├── A.astro                     # <A id="..." kind="...">
    │   ├── Summary.astro               # <Summary>
    │   └── learning-docs.ts            # barrel re-export
    ├── layouts/
    │   ├── PageLayout.astro            # per-file page chrome
    │   └── IndexLayout.astro           # home page chrome
    ├── lib/
    │   └── tooltipTransformer.ts       # custom Shiki transformer
    ├── styles/
    │   └── learning-docs.css
    ├── scripts/
    │   └── learning-docs.js            # popover click handler
    └── pages/
        └── index.astro                 # home with file tree (starts empty)
```

Each documented source file becomes an `.mdx` under `src/pages/`, mirroring the real path. For example:

| Real source path        | Becomes                              | Served at         |
|-------------------------|--------------------------------------|-------------------|
| `src/main.rs`           | `src/pages/src/main.rs.mdx`          | `/src/main.rs/`   |
| `pyproject.toml`        | `src/pages/pyproject.toml.mdx`       | `/pyproject.toml/`|
| `src-tauri/src/lib.rs`  | `src/pages/src-tauri/src/lib.rs.mdx` | `/src-tauri/src/lib.rs/` |

## Initial setup

On the first invocation in a project where `docs/learning/` doesn't exist yet, do these steps before anything else:

1. **Copy** the skill's `template/` directory wholesale to `docs/learning/`. Read each file under `template/` and write it unchanged to the matching path under `docs/learning/`.
2. **Add** `/docs/learning/` to the project's `.gitignore`. If `.gitignore` doesn't exist, create it with that single line.
3. **Tell the user** to run, from `docs/learning/`:
   ```
   nvm install
   nvm use
   npm install
   npm run dev
   ```
   `nvm install` reads `.nvmrc` (latest Node LTS) and installs that version. `npm run dev` starts Astro at `http://localhost:4321/`. The user opens that URL in their browser; pages refresh on file save.
4. **Set the project name** in `src/pages/index.astro` (replace the `project="learning-docs"` prop on `<IndexLayout>` with the real project name).

After setup, every subsequent invocation just runs the normal per-file workflow.

## Per-file workflow

For each source file to be documented:

1. **Draft + write the `.mdx`.** Read the real source, compose the annotated MDX in working memory, then `Write` it to `src/pages/<mirrored path>.mdx`. Astro's dev server picks it up live.
2. **Update `index.astro`** — add a `<li>` entry for the new file in the appropriate folder under the `<ul>` in `<IndexLayout>`. Flip the chip from `todo` → `done` when the page is written (see "Index entries" below).
3. **Show the source code being explained.** Paste the raw source file's content (Rust / Python / etc.) into chat as a fenced code block. Do NOT paste the MDX. Do NOT list planned tooltips. The user compares the rendered page (in browser) against the source (in chat).
4. **Ask for confirmation.** End with a clear yes/no question — *"Looks good?"* or *"Move on?"*. If yes, advance to the next file. If no, fix in place.
5. **Don't expand scope silently.** Never add or remove files from the planned list without confirming with the user.

In **batch backfill mode** (see "Backfilling existing code"), step 4's confirmation is granted ONCE for the full file list — pages are written sequentially without re-asking per file unless something surprising appears.

## .mdx file shape

Each per-file page is an `.mdx` file with this skeleton:

```mdx
---
title: src/registry.rs
layout: '@/layouts/PageLayout.astro'
---
import { Annotations, A, Summary } from '@/components/learning-docs';

<Summary>
**What is this file for?**

One short paragraph: purpose + closest analog in the user's known languages.
</Summary>

```rust
let /*[t:let-bind]*/ hklm = RegKey::predef /*[t:assoc-fn]*/ (HKEY_LOCAL_MACHINE /*[t:hkey]*/);
```

<Annotations>
  <A id="let-bind" kind="kw">
    Introduces an immutable binding. Like Python's `x = ...` or C's `const` — but the binding itself is what's frozen, not the value's type.

    ```rust
    let count = 42;
    let mut name = String::new();
    ```
  </A>
  <A id="assoc-fn" kind="fn">
    Associated-function call — `Type::method` pattern. Like a Python `@classmethod` or C++ static member: belongs to the type, not an instance.

    ```rust
    impl Point {
        fn origin() -> Self { Point { x: 0, y: 0 } }
    }
    ```
  </A>
  <A id="hkey" kind="type">
    Predefined Windows registry root key constant. Like a C `#define` exporting a magic handle — the machine-wide registry hive.

    ```rust
    // other roots:
    HKEY_CURRENT_USER
    HKEY_CLASSES_ROOT
    ```
  </A>
</Annotations>
```

### Required pieces

- **Frontmatter** — `title` (the real source path, used in the app bar) and `layout` (always `'@/layouts/PageLayout.astro'`).
- **Component import** — one line: `import { Annotations, A, Summary } from '@/components/learning-docs';`.
- **`<Summary>`** — one short paragraph framing the file. Renders as the pre-summary card.
- **Fenced code block** — the real source file's content (or the relevant excerpt), with `/*[t:id]*/` markers tagging the tokens that will have tooltips.
- **`<Annotations>` block** — one `<A id="..." kind="...">` per marker id, body is Markdown.

### Marker syntax

Place `/*[t:id]*/` immediately before the token to tag. Whitespace between the marker and the token is preserved; only the marker comment is removed. The marker tags the *first non-whitespace token* that follows it on the same line.

```rust
let /*[t:let-bind]*/ hklm = ...
```

For a multi-segment call like `RegKey::predef`, the marker tags only `RegKey` (the first span). Clicking `RegKey` opens the explanation for the whole call — that's fine.

Use comment syntax appropriate for the file's language at the marker position **except** that the `/*…*/` form works for any language because the transformer matches the literal `/*[t:…]*/` pattern. For languages without block comments, the marker is still parsed correctly as long as it appears in the source string (it will look syntactically broken to the language, but the transformer strips it before Shiki tokenizes). Stick to `/*[t:…]*/` regardless of language.

### Annotation body — Markdown

Each `<A>` body is plain Markdown. Use:

- Backticks for inline code: `` `Type::method` ``
- Fenced code blocks for the Example tab. **The first fenced code block inside the `<A>` body becomes the Example tab; everything else is the Explanation.**
- Standard Markdown emphasis, lists, links

### `kind` attribute

`<A kind="...">` accepts: `kw` (green), `type` (yellow), `fn` (blue), `str` (cyan), `ident` (blue), `attr` (blue). Sets the popover's left-border color. Defaults to `ident` if omitted.

## Backfilling existing code

When the user invokes the skill on a repo that already has source files (instead of writing new code one-at-a-time), switch to batch mode:

1. **Discover** source files with `Glob` using the project's primary extensions (e.g. `**/*.rs`, `**/*.py`, `**/*.ts`). Skip generated/vendored folders: `node_modules`, `target`, `dist`, `build`, `__pycache__`, `.svelte-kit`, `.next`, `docs/learning/**`, etc.
2. **Order** the list sensibly — entry points and manifests first (`main.py`, `lib.rs`, `index.ts`, `pyproject.toml`, `Cargo.toml`), then files closer to the leaves of the dependency graph.
3. **Pre-populate** `index.astro` with every discovered file marked `todo`. Show the full ordered list to the user once.
4. **Get one approval for the whole batch** — e.g. *"Found 28 files. Write all 28 pages in this order? [list]"* — instead of asking per file.
5. **Write each `.mdx` in sequence** without re-asking, as long as nothing surprising appears. Stop and check in if a file is way larger than expected, uses an unfamiliar construct that needs discussion, or seems intentionally out of scope (test fixtures, generated code).
6. **Update `index.astro`** after each file (`todo` → `done`) so the user can refresh and watch progress.

For very small repos (≤5 files), skip batching — the standard per-step workflow is fast enough.

## Doc-first mode (new code)

When the user is **building** the project rather than learning an existing one — they want docs for a code file or snippet that hasn't been written to disk yet — invert the order: render the doc first as a preview, then write the source only after approval.

1. **Draft + write the `.mdx` first.** Compose the annotated MDX for the proposed code (same template, same Pattern A tooltips), `Write` it to `src/pages/<path>.mdx`, and add the row to `index.astro` as `done`. The rendered page is now live — the user can read it in their browser as a preview of what the source file will be.
2. **Paste the proposed source** in chat as a fenced code block, exactly as it would appear on disk. The user compares the rendered page (in browser) against the proposed source (in chat).
3. **Ask for permission to write the source file.** End with a clear yes/no question, e.g. *"Write `src/foo.rs` now?"*. Until the user approves, do NOT touch any source file.
4. **On approval**, `Write` the source file at the real path. On rejection or revision requests, update both the `.mdx` and the proposed snippet in chat, then re-ask — never write a source file the user has not approved.

The doc functions as a spec/preview the user reviews before authorizing the code write. This is the only mode in which this skill writes source files.

## Index entries

`src/pages/index.astro` holds the file tree. Each new page added needs a corresponding `<li>` entry; flipping `todo` → `done` is just swapping the wrapper element.

### Folder row (non-clickable, holds nested `<ul>`):

```astro
<li>
  <div class="folder-row">
    <span class="icon"><svg viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg></span>
    src/
  </div>
  <ul>
    {/* child rows */}
  </ul>
</li>
```

### File row — done (clickable link, green chip):

```astro
<li>
  <a class="file-row" href="/src/main.py/">
    <span class="icon"><svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/></svg></span>
    main.py
    <span class="chip done">done</span>
  </a>
</li>
```

### File row — todo (not clickable, grey chip):

```astro
<li>
  <div class="file-row todo">
    <span class="icon"><svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/></svg></span>
    helpers.py
    <span class="chip">todo</span>
  </div>
</li>
```

The `href` is `/<mirrored path>/` — Astro maps `src/pages/src/main.py.mdx` to URL `/src/main.py/`.

## Tooltip granularity

Each marker should teach exactly **one** concept. Wrap sub-expressions and named concepts, not whole expressions. Aim for 3–6 markers per non-trivial line.

**Bad** — one marker on a whole expression mixing multiple ideas:

```rust
/*[t:everything]*/ let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
```

**Good** — three markers, one concept each:

```rust
let /*[t:let-bind]*/ hklm = RegKey::predef /*[t:assoc-fn]*/ (HKEY_LOCAL_MACHINE /*[t:hkey]*/);
```

**Skip pure syntactic glue** (`=`, `(`, `;`, `,`, `{}`). Wrapping every punctuation mark is noise. Named concepts, sub-expressions, operators with semantics (`?`, `&`, `as`), keywords, type names, and call patterns get tooltips. Raw punctuation doesn't.

## Explanation style — Pattern A

Each `<A>` body hits up to **four beats** in order. Drop beats that don't apply, but never skip beat 1.

1. **Definition.** One short line — what the token *is* in language terms.
2. **Analogy.** Anchor analogies on **Python** and **C** by default — they cover most concepts a beginner-to-intermediate programmer recognizes. Pivot to other languages only if memory tells you the user knows them better.
   - **C** — pointers, references, lifetimes (`&T` ≈ `T*`, immutable strings ≈ `const char *` in `.rodata`), manual memory (`malloc`/`free`), tagged unions, `#ifdef`, stack vs heap, function pointers, header/source split.
   - **Python** — nullable / optional types (≈ `None` or exceptions), iterators, closures (≈ lambdas), decorators (`@decorator` ≈ attribute macros / annotations), dict/list/tuple ↔ HashMap/Vec/tuple, duck typing (≈ structural typing / trait bounds), `__init__.py` ≈ module entry point.
3. **Concrete example or signature.** What shape the token takes in *this* code — actual JSON, actual return type, actual sample input/output. (Longer-form runnable examples belong in a separate fenced code block — that becomes the Example tab.)
4. **Why-here.** Connect to the surrounding code's intent — why this token was used in this spot.

**Example tab content.** Place a ~3–6 line, self-contained code snippet as a fenced code block inside the `<A>` body. Use generic identifiers (`add`, `Point`, `User`, `greet`) rather than identifiers from the current file — the example should make sense even if the reader hasn't seen the project. Shiki highlights it automatically.

**Coverage depth — file-scoped, not project-scoped.** Every meaningful token gets a full Pattern A tooltip in its **first appearance per file**, even when that concept appeared in another file. The reader of any single file may have never opened another — each file must stand alone as a complete learning unit. *Within* the same file, repeat appearances of a concept can be skipped (no second marker on the same idea).

In practice: write each file's annotations as if you've never explained anything before. The skill never "remembers" prior files.

## Data flow (reference)

What happens when the user clicks a token:

1. **Agent writes** `src/pages/<path>.mdx` with frontmatter + Summary + fenced code (with markers) + Annotations block.
2. **Astro/MDX parser** splits the file: frontmatter becomes page metadata; fenced code is handed to Shiki; the `<Annotations>` JSX tree is rendered by Astro.
3. **Shiki + custom transformer** (`src/lib/tooltipTransformer.ts`):
   - `preprocess` hook scans source for `/*[t:id]*/`, records `{line, col, id}`, strips the marker.
   - `span` hook wraps the span at the recorded position with `data-tip="id"` and class `tok`.
4. **`<Annotations>` + `<A>` components** render to a hidden `<aside class="annotations" hidden>` containing one `<div data-anno="id" data-kind="...">…rendered Markdown…</div>` per annotation.
5. **Astro emits static HTML** combining page chrome + code block + hidden aside, plus the shared `learning-docs.css` and bundled `learning-docs.js`.
6. **Browser runtime** — `learning-docs.js` listens for clicks on `[data-tip]`, finds the matching `[data-anno]`, clones its content into a `.tip` popover positioned next to the clicked token. The first `<pre>` in the cloned content becomes the Example tab; the rest is the Explanation. Esc closes; viewport-aware positioning keeps the popover on-screen.

## What this skill does NOT do

- **Does not edit source code without explicit approval.** Source files are read-only by default — only `.mdx` files under `docs/learning/src/pages/` are written. The single exception is **doc-first mode** (above): the user reviews the rendered preview, then explicitly approves writing a brand-new source file. Existing source files are never modified.
- **Does not commit.** `docs/learning/` is gitignored by convention; nothing here is meant for the repo's history.
- **Does not auto-track new source files.** When a new source file lands, this skill writes its `.mdx` only when asked.
- **Does not run the dev server.** The user runs `npm run dev` themselves.

## End-of-run summary

After each `.mdx` write, tell the user the absolute path created/updated and (if applicable) which `index.astro` entry flipped from `todo` → `done`. One sentence.
