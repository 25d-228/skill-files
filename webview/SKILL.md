# Webview

> **Invocation:** Per-prompt skill. Use only when explicitly invoked (e.g. `/webview`) in the current prompt. Do not auto-trigger on phrases like "show me a table", "make a diagram", or "render this nicely". Invocation does NOT carry over — each prompt that wants a webview must re-invoke the skill; otherwise reply in plain chat.

Render an answer, table, diagram, comparison, or any structured result as a styled HTML page in Solarized and serve it on localhost so the user can view it in their editor's built-in browser (Cursor / VS Code Simple Browser). Use this whenever the content reads better visually than as markdown chat — tables, callouts, comparison cards, timelines, diagrams, side-by-side diffs.

## When to use

The user wants to see something visually. Typical phrasing: "show in webview", "/webview this", "render the result as a page". For plain prose answers, skip the skill and reply in chat.

## Workflow

1. **Decide** a kebab-case slug for the topic (e.g. `acp-comparison`, `multi-agent-research`).
2. **Read** `style.css` from this skill's folder.
3. **Compose** an HTML page tailored to the content. No fixed template — pick the components that fit. Inline the full `style.css` inside a `<style>` block; the page must be self-contained.
4. **Write** the page to `/tmp/<slug>.html`.
5. **Start** a local HTTP server in the background:
   ```bash
   python3 -m http.server 8765 --directory /tmp --bind 127.0.0.1
   ```
   Fall back to 8766+ if busy. Reuse the running server across the session — don't start a new one per page.
6. **Tell** the user the URL `http://localhost:8765/<slug>.html` and the one-line reminder: `Ctrl+Shift+P` → "Simple Browser: Show" → paste URL.
7. **Stop** the server only when the user asks.

## Page skeleton

The minimum a page needs is:

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>...</title>
<style>/* inline contents of style.css */</style>
</head>
<body>
  <h1>...</h1>
  <!-- compose with components from the catalog below -->
</body>
</html>
```

Compose freely beyond that.

## Component catalog

All styled via classes in `style.css`. Mix and match per page; ignore what doesn't fit.

- **Headings** — `<h1>` once at top; `<h2>` per section. Optional `<span class="h2-sub">…</span>` inside `<h2>` for a softer trailing phrase.
- **Lead text** — `<p class="subtitle">…</p>` under `<h1>`, `<p class="date">…</p>` for "Compiled …", `<p class="intro">…</p>` to open a section.
- **Tables** — plain `<table>` with `<thead>` / `<tbody>`. Sticky headers, striped rows. Use for grids of consistent columns.
- **Tag pills** — `<span class="tag tag-blue">…</span>`. Variants: `tag-blue`, `tag-violet`, `tag-magenta`, `tag-green`, `tag-orange`, `tag-cyan`, `tag-yellow`, `tag-red`, `tag-muted`. One color per concept across the page.
- **Status badges** — `<span class="badge">…</span>` — pill-shaped, neutral. For version/status indicators.
- **Callouts** — `<div class="callout callout-info">…</div>`. Variants: `callout-info`, `callout-tip`, `callout-warning`, `callout-danger`. Optional `<div class="callout-title">…</div>` inside. For emphasis, warnings, asides.
- **Comparison cards in a grid** — `<div class="grid">` containing `<div class="card">…</div>` items. Use `<div class="card-title">…</div>` and optional `<div class="card-meta">…</div>`. Wraps automatically. Use when a table would be 4+ columns of free-form prose.
- **Timeline** — `<ol class="timeline">` with `<li>` items, each containing `<span class="timeline-date">…</span>` plus free-form content. Use for histories, milestones, decision logs.
- **Mermaid diagrams** — `<pre class="mermaid">graph LR; A-->B</pre>`. Load Mermaid from CDN once at the end of `<body>`:
  ```html
  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';
    mermaid.initialize({ startOnLoad: true, theme: 'base' });
  </script>
  ```
- **Side-by-side code diff** — `<div class="diff"><pre class="diff-before"><code>…</code></pre><pre class="diff-after"><code>…</code></pre></div>`. Optional `<span class="diff-add">` / `<span class="diff-remove">` on individual lines.
- **Inline code** — plain `<code>…</code>`, cyan-tinted.
- **Legend** — `<div class="legend"><strong>Legend:</strong> <span class="tag tag-blue">ACP</span>… </div>` at the top when tag meanings need explaining.
- **Takeaways** — `<div class="takeaways"><h2>Key takeaways</h2><ol><li>…</li></ol></div>` for synthesis at the bottom.
- **Sources** — `<div class="sources"><h2>Sources</h2><ul><li><a href="…">Title</a></li></ul></div>` for citations / references.

## Style rules

- **Solarized Light by default, Solarized Dark via `@media (prefers-color-scheme: dark)`.** Both at canonical saturation — do not soften.
- **One `<h1>` per page.**
- **Tag colors map to Solarized accents.** Reuse the same class for the same concept across the page.
- **No emojis** unless the user explicitly asks.
- **Inline the stylesheet.** No external `<link>`. Pages must work standalone.

## Server management

- One Python http.server process per session is enough — reuse it.
- For follow-up pages: write a new file to `/tmp/`, give the new URL on the same port.
- Stop only when the user says so.

## What this skill does NOT do

- Does not write outside `/tmp/`. The user's project stays untouched.
- Does not commit anything.
- Does not auto-open a browser. The user opens Simple Browser themselves.
- Does not run for plain prose. If the content is a normal markdown reply, just reply in chat.

## End-of-run summary

After writing + serving, give exactly: the URL and the one-line Simple Browser command. When stopping, say "stopped" — nothing else.
