# LeetCode Link Explanations

> **Invocation:** Per-prompt skill. Use only when explicitly invoked (e.g. `/leetcode-explain [leetcode-url]`) in the current prompt. Do not auto-trigger on phrases like "explain this leetcode problem", "walk me through this", or a bare LeetCode URL. Invocation does NOT carry over — each prompt with a new LeetCode URL must re-invoke the skill; otherwise treat the URL as plain context.

Fetch a LeetCode problem with `fetch_problem.py` (which runs locally to bypass the 403 that WebFetch hits), then produce a styled HTML explanation matching the `attention-explainer` walkthrough pattern (Solarized Light, no shadows, no animations, two-panel d3 stage with array-and-pointer diagrams). Output is a self-contained HTML file under `docs/` — not a chat reply, not a localhost service.

## When to use

The user provides a `leetcode.com` or `leetcode.cn` URL and asks to understand or solve it.

## What this skill ships

```
SKILL.md           ← this file
template.html      ← complete working page (problem 167 used as the reference).
                    Inline CSS (Solarized Light, attention-explainer .wt styles),
                    d3 + Prism via CDN, walkthrough engine, default
                    array-and-pointers renderer. Copy this layout and adapt
                    content for each new problem.
fetch_problem.py   ← local GraphQL fetcher (modeled on the user's lc_get.py).
                    Writes <tmpdir>/lc-<slug>.json with title, difficulty,
                    content (HTML), translatedContent, exampleTestcases,
                    codeSnippets, topicTags, plus sourceUrl and isCN flags.
```

Never call `WebFetch` for a LeetCode URL — it returns HTTP 403. Always use `fetch_problem.py`.

## Workflow

Pages are persisted under `docs/<id>-<slug>.html` (relative to the current working directory — i.e. the project the agent was invoked in), so the same problem is never re-explained twice. `<id>` is the `questionFrontendId` **zero-padded to 4 digits** (e.g. `167` → `0167`, `1` → `0001`) and `<slug>` is the LeetCode URL slug (e.g. `two-sum-ii-input-array-is-sorted`). Combined: `docs/0167-two-sum-ii-input-array-is-sorted.html`.

1. **Derive the slug** from the URL (the path segment after `/problems/`).

2. **Short-circuit if cached.** Glob `docs/*-<slug>.html`. If a match exists, skip steps 3–6 and jump to step 7. Only re-render when the user explicitly asks to refresh.

3. **First-use setup.** If `docs/` does not yet exist, create it. Adding the directory to the project's `.gitignore` is optional — these pages are reproducible artifacts.

4. **Fetch** the problem data locally with this skill's `fetch_problem.py`:

   ```bash
   python3 fetch_problem.py "<URL>"
   ```

   The script prints the JSON output path on stdout (default: `<tempfile.gettempdir()>/lc-<slug>.json`). Works for both `leetcode.com` and `leetcode.cn`.

5. **Read** the JSON. Extract: `questionFrontendId` (use as `<id>`), `title` (or `translatedTitle` if `isCN`), `difficulty`, the relevant `content` field (HTML), the matching `codeSnippets[?lang=cpp]` starter, and the worked examples from the rendered content.

6. **Read** `template.html` from this skill folder, then **write** the filled-in page to `docs/<id>-<slug>.html`. The page must keep:

   - the full `<style>` block (inlined Solarized vars + `.wt` chrome + `.arch-*` SVG styles + Prism Solarized theme),
   - the `d3` + Prism `<script>` tags,
   - the walkthrough engine and `renderArrayArch` helper in the trailing `<script>`,
   - the overall HTML scaffold (`<h1>` + subtitle, six `<h2>` sections, one `.wt` per example, complexity table).

   What changes per problem: title text, the prose under each `<h2>`, the `.wt[data-id="exN"]` cards (one per example), the `MODELS` / `STEPS` objects, the implementation code, and the complexity numbers.

7. **Report** the written file path (e.g. `docs/0167-two-sum-ii-input-array-is-sorted.html`). The page is self-contained — the user can open it directly in any browser (Simple Browser, `file://`, drag-and-drop, etc.) without a server. Do not duplicate the explanation in chat.

## Page anatomy

The page has six `<h2>` sections in order:

| Section            | Element                                                                |
|--------------------|------------------------------------------------------------------------|
| Problem summary    | `<p class="intro">…</p>` — 2–4 sentences                               |
| Key insight        | `<div class="callout callout-tip">…</div>`                             |
| Algorithm          | `<ol><li>…</li>…</ol>`                                                 |
| Worked example     | one `<div class="wt" data-id="exN" data-color="…">` per example        |
| Implementation     | `<pre><code class="language-cpp">…</code></pre>`                       |
| Complexity         | `<table>` with Time / Space columns                                    |

Each `.wt` card uses the attention-explainer structure:

```html
<div class="wt" data-id="ex1" data-color="blue" tabindex="0">
  <div class="wt-header">
    <div class="wt-title-row">
      <span class="wt-section-num">EX 1</span>
      <span class="tag tag-blue">two pointers</span>
      <span class="wt-title">numbers = [...], target = ... → [...]</span>
    </div>
  </div>
  <nav class="wt-pipeline"></nav>          <!-- engine fills pip buttons -->
  <div class="wt-stage">
    <div class="wt-arch"></div>            <!-- d3 SVG renders here -->
    <div class="wt-data">                  <!-- per-step math + code -->
      <div class="wt-data-title"></div>
      <div class="wt-data-body"></div>
    </div>
  </div>
  <div class="wt-desc">                    <!-- per-step prose -->
    <div class="wt-desc-title"></div>
    <div class="wt-desc-body"></div>
  </div>
  <div class="wt-controls">
    <button class="wt-btn wt-prev">← Prev</button>
    <span class="wt-counter"></span>
    <button class="wt-btn wt-next">Next →</button>
  </div>
</div>
```

`data-color` valid values: `blue`, `magenta`, `green`, `orange`. Pick one per example. Difficulty pill colors in the page subtitle: Easy → `tag-green`, Medium → `tag-yellow`, Hard → `tag-red`.

## Walkthrough data schema

The trailing `<script>` defines `MODELS` (visual state per example) and `STEPS` (per-step text + data panel). The engine wires them to each `.wt[data-id]` card by id.

```js
const MODELS = {
  ex1: {
    array: [2, 7, 11, 15],
    // ONE entry per stage the pointers are at — duplicate when they don't move:
    pointerConfigs: [
      { stage: 1, left: 0, right: 3 },   // init
      { stage: 2, left: 0, right: 3 },   // unchanged while sum=17 is compared
      { stage: 3, left: 0, right: 2 },
      { stage: 4, left: 0, right: 1 },
    ],
    // sum / decision log — rows persist once revealed (full opacity)
    sumStages: [
      { stage: 2, text: 'step 1: 2 + 15 = 17 → 17 > 9, move right left', color: 'var(--red)' },
      { stage: 3, text: 'step 2: 2 + 11 = 13 → 13 > 9, move right left', color: 'var(--red)' },
      { stage: 4, text: 'step 3: 2 +  7 =  9 ✓ return [1, 2]',           color: 'var(--green)', match: true },
    ],
  },
  // ex2, ex3, …
};

const STEPS = {
  ex1: [
    { label: 'Init',  stage: 1, title: '…', desc: '…',
      dataTitle: 'Initial state',
      dataBody: '<div class="vals">…</div><pre><code class="language-cpp">…</code></pre>' },
    { label: '17',    stage: 2, /* … */ },
    { label: '13',    stage: 3, /* … */ },
    { label: 'Match', stage: 4, /* … */ },
  ],
  // …
};
```

Conventions:

- `stage` numbers are 1-based and dense; `STEPS[id][i].stage === i + 1` is the convention.
- Each `pointerConfigs` entry corresponds to ONE stage. The engine shows only the active stage's pointers (past/future are hidden), so duplicate the entry when pointers don't move between stages.
- `sumStages` rows persist at full opacity once their stage is reached — past rows render in muted gray, the active row uses its `color`, the match row stays green.
- `dataBody` is HTML. Use `<div class="vals">` for monospace data (preserves whitespace), `<div class="eqn">` for an equation line, and `<pre><code class="language-cpp">` for code (Prism handles highlighting).

## D3 renderer

The template ships `renderArrayArch(container, model, uniqueId)` — a d3 renderer for **sorted-array + pointers** problems. It draws array boxes with index labels above, `left` / `right` arrow pointers below, and the accumulating sum log under that.

For other problem shapes, write a sibling renderer that follows the same conventions so the existing CSS + engine keep working:

- give each visual element a `data-stage` matching the step it's "owned by",
- use class `arch-node` for groups, `arch-box` for rectangles, `arch-arrow` for path arrows, `arch-label` / `arch-tok` / `arch-cap` for text,
- never set inline `style` on text (use `attr('fill', …)` so CSS can override past/active states),
- never add `text-shadow`, `box-shadow`, `filter: drop-shadow`, or animations.

Common shapes worth a custom renderer:

- **Linked list** — node boxes in a row connected by `next` arrows; pointer arrows (`head` / `slow` / `fast`) hang below.
- **Binary tree** — `d3-hierarchy.tree()` layout; visited-node highlighting per stage.
- **Grid / matrix** — a 2D grid of cells with row / column headers; active cell + path highlights per stage.
- **Sliding window** — array boxes plus a window rect that translates per stage.
- **DP table** — a 2D table filled cell-by-cell, current cell active, computed cells past.

## Response language

Set both `<html lang="…">` and all visible text accordingly. Use the JSON's `isCN` field to decide:

- `leetcode.com` / `isCN: false` → `<html lang="en">`, page in **English** (use `title`, `content`).
- `leetcode.cn` / `isCN: true` → `<html lang="zh-Hans">`, page in **Chinese** (use `translatedTitle`, `translatedContent`); translate the static labels per the table below.

An explicit user request ("explain in English", "用中文解释") overrides auto-detection.

### Chinese label map (`zh-Hans`)

| English                                                         | 中文                              |
|-----------------------------------------------------------------|-----------------------------------|
| Problem summary                                                 | 题目概述                          |
| Key insight                                                     | 核心思路                          |
| Why this works                                                  | 为什么可行                        |
| Algorithm                                                       | 算法步骤                          |
| Worked example                                                  | 示例追踪                          |
| Implementation                                                  | 代码实现                          |
| Complexity                                                      | 复杂度                            |
| Time / Space                                                    | 时间 / 空间                       |
| This solution                                                   | 本解法                            |
| Easy / Medium / Hard                                            | 简单 / 中等 / 困难                |
| EX 1 / EX 2 …                                                   | 示例 1 / 示例 2 …                 |
| Step N of M                                                     | 第 N 步,共 M 步                  |
| ← Prev / Next →                                                 | ← 上一步 / 下一步 →               |

## Programming language

- Default to **C++** (`class="language-cpp"`) for both the Implementation section and the `dataBody` snippets.
- Honor explicit requests: `"in Python"` → `language-python`, `"using Java"` → `language-java`, etc.
- Use the matching `codeSnippets[?langSlug=…]` entry as the starter, then add the full solution on top.
- Do not ask a follow-up about language — pick the default and proceed.

## Style rules

The template is **Solarized Light, no shadows, no animations**:

- The dark-mode `:root` media query is overridden back to light values — the page looks the same regardless of OS theme.
- No `box-shadow` anywhere (cards, tables, callouts, active pips).
- No `text-shadow`, no `filter: drop-shadow` on `.is-active` (a `.wt .is-active { filter: none }` override kills the inherited halo from the inlined webview CSS).
- No dashed-flow animation on active arrows — they render as plain solid strokes.
- One `<h1>` per page. Sentence case for headings. No emojis. Inline everything (modulo the d3 / Prism CDNs).

If you adapt or extend, keep these invariants. They are why the page reads cleanly.

## End-of-run

Report just the relative path of the written HTML (e.g. `docs/0167-two-sum-ii-input-array-is-sorted.html`). The user opens it themselves.
