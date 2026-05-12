# Webview

> **Invocation:** Per-prompt skill. Use only when explicitly invoked (e.g. `/webview`) in the current prompt. Do not auto-trigger on phrases like "show me a table", "make a diagram", or "render this nicely". Invocation does NOT carry over — each prompt that wants a webview must re-invoke the skill; otherwise reply in plain chat.

Render an answer, table, diagram, comparison, walkthrough, or any structured result as a styled HTML page in Solarized and serve it on localhost so the user can view it in their editor's built-in browser (Cursor / VS Code Simple Browser). Use this whenever the content reads better visually than as markdown chat.

## When to use

The user wants to see something visually. Typical phrasing: "show in webview", "/webview this", "render the result as a page". For plain prose answers, skip the skill and reply in chat.

## What the skill ships

```
SKILL.md          ← this file
style.css         ← Solarized + all component styles
components/       ← drop-in snippets, copy into the page when needed
  math.html       ← KaTeX (any math notation)
  code.html       ← Prism (code blocks longer than ~3 lines)
  chart.html      ← bar / line / dot SVG charts
  heatmap.html    ← table cells colored by value
  dag.html        ← D3 + dagre auto-layout node-link diagrams
  tabs.html       ← click-driven tabs
  stepper.html    ← interactive step-by-step walkthrough
  building-up.html ← reveal pattern notes (used inside stepper)
```

## Layered design — pick what the content needs

Most pages stay in Layer 1. Reach for Layer 2/3 only when the content demands it.

### Layer 1 — Core (always available, styled by `style.css`)

Headings, lead text, **tables**, tag pills, status badges, callouts, comparison cards, timeline, side-by-side code diff, inline code, **Mermaid diagrams**, legend, takeaways, sources, **simple charts** (`.chart` wrapper), **heatmaps** (`.heatmap`), **details/collapsible**.

### Layer 2 — On demand, inlined from `components/`

| Content has… | Inline this snippet |
|---|---|
| Math notation (`$…$`, equations) | `components/math.html` → KaTeX |
| Code blocks longer than ~3 lines | `components/code.html` → Prism |
| Bar / line / scatter chart | `components/chart.html` → `chartBar / chartLine / chartDot` |
| Matrix of values, attention map, confusion matrix | `components/heatmap.html` → `heatmap(...)` |
| Custom node-link diagram Mermaid can't lay out | `components/dag.html` → `renderDag(...)` |
| 3+ alternatives that don't all fit | `components/tabs.html` |

### Layer 3 — Interactive (rare, but expensive to reinvent)

| Content needs… | Inline these snippets |
|---|---|
| Step-by-step explanation, one click = one new piece | `components/stepper.html` + `components/building-up.html` (notes) |

## Decision flowchart

```
Tables / comparisons / lists / cards         → Layer 1 only
Workflow / flow / state / class / ER / gantt → Mermaid (Layer 1)
Numbers I want to chart                      → .chart + chart.html
Matrix / attention map / heatmap             → .heatmap + heatmap.html
Math notation present                        → + math.html
Code blocks longer than 3 lines              → + code.html
Diagram Mermaid can't lay out                → + dag.html
3+ alternatives that don't fit on screen     → + tabs.html
Step-by-step "click to build it up"          → + stepper.html (+ building-up.html notes)
```

## Workflow

1. **Decide** a kebab-case slug for the topic (e.g. `acp-comparison`, `attention-explainer`).
2. **Read** `style.css` from this skill folder.
3. **Pick layers** for the content (see flowchart above). For each Layer 2/3 snippet you need, read the snippet file and inline its contents at the location its USAGE block specifies (head vs. before `</body>`).
4. **Compose** the HTML page. Inline the full `style.css` inside one `<style>` block in `<head>`. The page must be self-contained.
5. **Write** to `/tmp/<slug>.html`.
6. **Start** a local HTTP server in the background on a free port (see "Server management" — do NOT hardcode 8765). Reuse the running server across the session.
7. **Tell** the user the URL with the actual port and the one-line Simple Browser reminder: `Ctrl+Shift+P` → "Simple Browser: Show" → paste URL.
8. **Stop** the server only when the user asks.

## Page skeleton

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>...</title>
<style>/* inline contents of style.css */</style>
<!-- inline component <head> snippets here (math.html, code.html) -->
</head>
<body>
  <h1>...</h1>
  <!-- compose with Layer 1 components + Layer 2/3 markup as needed -->

  <!-- Mermaid loader at end of body, if used -->
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: true, theme: 'base' });
  </script>

  <!-- inline component <script> snippets here (chart, heatmap, dag, tabs, stepper) -->
</body>
</html>
```

## Component catalog — Layer 1 reference

- **Headings** — `<h1>` once at top; `<h2>` per section. Optional `<span class="h2-sub">…</span>` inside `<h2>` for a softer trailing phrase.
- **Lead text** — `<p class="subtitle">…</p>` under `<h1>`, `<p class="date">…</p>`, `<p class="intro">…</p>` to open a section.
- **Tables** — plain `<table>` with `<thead>` / `<tbody>`. Sticky headers, striped rows. Left-align text, right-align comparable numbers. Place comparable rows/columns close together.
- **Tag pills** — `<span class="tag tag-blue">…</span>`. Variants: `tag-blue`, `tag-violet`, `tag-magenta`, `tag-green`, `tag-orange`, `tag-cyan`, `tag-yellow`, `tag-red`, `tag-muted`. **One color per concept across the page.**
- **Status badges** — `<span class="badge">…</span>` — pill-shaped, neutral.
- **Callouts** — `<div class="callout callout-info">…</div>`. Variants: `callout-info`, `callout-tip`, `callout-warning`, `callout-danger`. Optional `<div class="callout-title">…</div>` inside.
- **Comparison cards** — `<div class="grid">` containing `<div class="card">…</div>` items. Use `<div class="card-title">` / `<div class="card-meta">`. Wraps automatically.
- **Timeline** — `<ol class="timeline">` with `<li>` items, each containing `<span class="timeline-date">…</span>` plus content.
- **Mermaid diagrams** — `<pre class="mermaid">…</pre>`. Mermaid covers: `flowchart`, `sequenceDiagram`, `classDiagram` (UML), `stateDiagram-v2`, `erDiagram`, `gantt`, `gitGraph`, `mindmap`, `timeline`, `pie`. Prefer Mermaid before reaching for `dag.html`.
- **Side-by-side code diff** — `<div class="diff"><pre class="diff-before"><code>…</code></pre><pre class="diff-after"><code>…</code></pre></div>`. Optional `<span class="diff-add">` / `<span class="diff-remove">` on lines.
- **Inline code** — plain `<code>…</code>`, cyan-tinted.
- **Charts** — `<div class="chart" id="…"></div>` + inline `chart.html` and call `chartBar/Line/Dot`.
- **Heatmap** — `<div id="…"></div>` + inline `heatmap.html` and call `heatmap(…)`.
- **Details** — native `<details><summary>Title</summary>Body</details>`.
- **Legend** — `<div class="legend"><strong>Legend:</strong> <span class="tag tag-blue">…</span></div>`.
- **Takeaways** — `<div class="takeaways"><h2>Key takeaways</h2><ol><li>…</li></ol></div>`.
- **Sources** — `<div class="sources"><h2>Sources</h2><ul><li><a href="…">Title</a></li></ul></div>`.

## Style rules

- **Solarized Light default, Solarized Dark via `@media (prefers-color-scheme: dark)`.** Canonical saturation — do not soften.
- **One `<h1>` per page.**
- **Tag colors map to Solarized accents.** Reuse the same class for the same concept across the page.
- **Sentence case** for headings and slide-like titles. No random ALL CAPS.
- **No emojis** unless the user explicitly asks.
- **Inline the stylesheet.** No external `<link>` to local CSS. Pages must work standalone.
- **Every chart needs axis labels and units.** Use ↑ / ↓ arrows to mark "higher/lower is better" when comparing metrics.
- **Every figure should support one takeaway sentence.** If you can't write that sentence, the figure doesn't belong.
- **Fixed-height rule for interactive containers.** Any container whose contents change between steps (the `.wt-body` inside a stepper, a card that swaps content) MUST set `min-height` so the page doesn't shift on each click. `style.css` already does this for `.wt-body` (360px) and `.wt-desc` (4.5em).

## Anti-patterns

Don't do these — there's a Layer 2/3 snippet that does it correctly:

- **Don't hand-roll syntax highlighting.** Use `components/code.html` (Prism).
- **Don't hand-roll math rendering.** Use `components/math.html` (KaTeX).
- **Don't hand-lay-out a DAG with absolute coordinates.** Use Mermaid first, then `components/dag.html` (D3+dagre) if Mermaid can't.
- **Don't let an interactive card resize between steps.** Set `min-height`. See the fixed-height rule above.
- **Don't auto-cycle animations** when the user is meant to drive cadence. Steppers are user-driven (prev/next + arrow keys), not on a timer.
- **Don't wipe past content** in a building-up walkthrough. Past elements stay visible (faded via `.is-past`). See `components/building-up.html`.

## Server management

- **Do NOT hardcode port 8765.** The user works across WSL and Windows; previous sessions may already be serving on that port. Probe for a free port in the 8765–8800 range:

  ```bash
  PORT=$(python3 -c "
  import socket
  for p in range(8765, 8801):
      try:
          s = socket.socket(); s.bind(('127.0.0.1', p)); s.close()
          print(p); break
      except OSError:
          continue
  ")
  python3 -m http.server "$PORT" --directory /tmp --bind 127.0.0.1
  ```

  Then report the actual `$PORT` in the URL you give the user.

- **One server per session is enough — reuse it.** Before starting a new one, check if you already have a background server running this session and reuse its port. Only start a fresh server if the current one died or you don't have one yet.
- For follow-up pages: write a new file to `/tmp/` and give the URL on the same port.
- Stop only when the user says so.

## What this skill does NOT do

- Does not write outside `/tmp/`. The user's project stays untouched.
- Does not commit anything.
- Does not auto-open a browser. The user opens Simple Browser themselves.
- Does not run for plain prose. If the content is a normal markdown reply, just reply in chat.

## End-of-run summary

After writing + serving, give exactly: the URL (with the actual port) and the one-line Simple Browser command. When stopping, say "stopped" — nothing else.
