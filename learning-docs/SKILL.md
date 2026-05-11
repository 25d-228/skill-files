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
4. **Write** `docs/learning/index.html` by copying `index-template.html` from this skill's folder and replacing `{PROJECT_NAME}` (twice). Start with an empty `.tree` (no `<li>` entries) unless running in backfill mode (see "Backfilling existing code"), in which case pre-populate every discovered source file as `todo`.

After setup is complete, every subsequent invocation just runs the normal workflow.

## Workflow

Per file to be documented:

1. **Draft + write.** Read the source, compose the annotated HTML in working memory, then `Write` it to disk and `Edit` `docs/learning/index.html` to flip that entry from `todo` → `done` (i.e., replace `<div class="file-row todo">…<span class="chip">todo</span></div>` with `<a class="file-row" href="…">…<span class="chip done">done</span></a>`). The rendered page is now live — the user can refresh their browser to verify it renders correctly with proper tooltips and styling.
2. **Show the source code being explained.** Paste the raw source file's content (Rust / Python / etc.) into chat as a fenced code block. Do NOT paste the HTML markup. Do NOT list planned tooltips. The user compares the rendered page (in browser) against the source (in chat).
3. **Ask for confirmation.** End with a clear yes/no question — *"Looks good?"* or *"Move on?"*. If yes, advance to the next file. If no, fix in place.
4. **Don't expand scope silently.** Never add or remove files from the planned list without confirming with the user.

In **batch backfill mode** (see "Backfilling existing code"), step 3's confirmation is granted ONCE for the full file list — the agent writes pages sequentially without re-asking per file unless something surprising appears.

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

Every annotated page (everything except `index.html`) uses the skeleton in `page-template.html` next to this SKILL.md. Copy it, replace these placeholders:

- `{PROJECT_NAME}` — the project's display name (e.g., `steam-mate`).
- `{TITLE}` — the source file's path inside the repo (e.g., `src-tauri/src/error.rs`).
- `{PREFIX}` — the depth-relative prefix from the table above (empty / `../` / `../../` / ...).

Then fill in the `What is this file for?` paragraph and replace the `<!-- source code with .tok / .tip annotations -->` placeholder with the annotated source (see "Tooltip syntax" below).

## Index template

The home `index.html` has its own markup — app bar without a back button (title is a `<div>`, not an `<a>`), an intro card, then the file tree. Skeleton lives in `index-template.html` next to this SKILL.md. Copy it, replace `{PROJECT_NAME}` (twice — title and app bar), and populate `.tree` with `<li>` entries per file/folder. The HTML comment inside the template shows the exact markup for folder rows, file rows in `done` state, and file rows in `todo` state.

When a file moves from `todo` → `done`, replace the `<div class="file-row todo">…</div>` with the `<a class="file-row" href="…">…</a>` form, and flip the chip span from `<span class="chip">todo</span>` to `<span class="chip done">done</span>`.

## Tooltip syntax

Each interactive token has two pages: an **Explanation** (default) and an **Example** (minimal boilerplate showing the concept in isolation). Tabs at the top of the popup switch between them.

```html
<span class="tok tip-left" tabindex="0"><span class="kw">def</span><span class="tip"><div class="tip-tabs"><button class="tip-tab active" data-target="explain">Explanation</button><button class="tip-tab" data-target="example">Example</button></div><div class="tip-page tip-page-explain active">Explanation text with inline <code class="type">Type</code> and <code class="fn">method</code> references.</div><div class="tip-page tip-page-example"><pre><code><span class="kw">def</span> <span class="fn">greet</span><span class="punc">(</span><span class="ident">name</span><span class="punc">):</span>
    <span class="kw">return</span> <span class="fn">f</span><span class="str">"Hello, {name}"</span></code></pre></div></span></span>
```

- **`.tok`** — interactive token; shows a dotted underline. Always include `tabindex="0"` for keyboard access.
- **`.tip`** — popover, child of `.tok`. Hidden until the `.tok` is clicked.
- **`.tip-left`** / **`.tip-right`** — anchor the popover to the left/right edge instead of centering. Use `.tip-left` near the start of a line, `.tip-right` near the end of a line, and no modifier in the middle.
- **`.tip-tabs`** — the tab bar at the top of the popup. Two buttons with `data-target="explain"` and `data-target="example"`.
- **`.tip-page-explain`** — the explanation page; gets `.active` by default.
- **`.tip-page-example`** — the example page; contains a `<pre><code>...</code></pre>` block. Highlight the example with the same token color classes used in the main code block (`.kw`, `.type`, `.fn`, etc.).

Click-to-toggle and tab switching are handled entirely by `script.js`. No per-page wiring needed. The script also auto-positions the popup to stay inside the viewport — tooltips near a page edge get shifted to remain fully visible.

**Granularity rule.** Each `.tok` should teach exactly **one** concept. Wrap sub-expressions and named concepts, not whole lines. Aim for 3–6 separate tooltips per non-trivial line.

Bad — one giant tooltip on a whole line mixing multiple ideas:

```html
<span class="tok"><span class="kw">let</span> <span class="ident">hklm</span> <span class="punc">=</span> <span class="type">RegKey</span><span class="punc">::</span><span class="fn">predef</span><span class="punc">(</span><span class="type">HKEY_LOCAL_MACHINE</span><span class="punc">);</span><span class="tip">Long paragraph explaining `let`, the associated-function pattern, and the constant all at once...</span></span>
```

Good — three separate tooltips, one concept each:

```html
<span class="tok"><span class="kw">let</span><span class="tip">Introduces an immutable binding...</span></span>
<span class="ident">hklm</span> <span class="punc">=</span>
<span class="tok"><span class="type">RegKey</span><span class="punc">::</span><span class="fn">predef</span><span class="tip">Associated-function call — Type::name() pattern...</span></span><span class="punc">(</span><span class="tok"><span class="type">HKEY_LOCAL_MACHINE</span><span class="tip">Predefined Windows registry root key constant...</span></span><span class="punc">);</span>
```

**Skip pure syntactic glue** (`=`, `(`, `;`, `,`, `{}`). Wrapping every punctuation mark is noise. Named concepts, sub-expressions, operators with semantics (`?`, `&`, `as`), keywords, type names, and call patterns get tooltips. Raw punctuation doesn't.

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
3. **Concrete example or signature.** What shape the token takes in *this* code — actual JSON, actual return type, actual sample input/output. (Longer-form runnable examples belong on the **Example** tab as a separate `<pre><code>` block, not crammed into the explanation prose.)
4. **Why-here.** Connect to the surrounding code's intent — why this token was used in this spot.

**Example tab content.** Every tooltip's Example tab should hold a ~3–6 line, self-contained, syntax-highlighted snippet showing the concept in isolation. Use generic identifiers (`add`, `Point`, `User`, `greet`) rather than identifiers from the current file — the example should make sense even if the reader hasn't seen the project. Highlight with the same token color classes (`.kw`, `.type`, `.fn`, `.str`, `.ident`, `.punc`, `.attr`, `.comment`) as the main code block.

**Coverage depth — file-scoped, not project-scoped.** Every meaningful token gets a full Pattern A tooltip in its **first appearance per file**, even when that concept appeared in another file. The reader of any single file may have never opened another — each file must stand alone as a complete learning unit. *Within* the same file, repeat appearances of a concept can be skipped (no second tooltip on the same idea).

In practice: write each file's tooltips as if you've never explained anything before. The skill never "remembers" prior files.

## What this skill does NOT do

- **Does not edit source code.** Only writes/updates `.html` files under `docs/learning/`. Source files are read-only from this skill's perspective.
- **Does not commit.** `docs/learning/` is gitignored by convention; nothing here is meant for the repo's history.
- **Does not auto-track new source files.** When a new source file lands, this skill writes its `.html` only when asked.

## End-of-run summary

After each write, tell the user the absolute path created/updated and (if applicable) which `index.html` entry flipped from `todo` → `done`. One sentence.
