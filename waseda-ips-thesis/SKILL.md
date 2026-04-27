---
name: waseda-ips-thesis
description: Maintenance edits (add, update, delete content) on an existing Waseda IPS (Graduate School of Information, Production and Systems) master's thesis built on a LaTeX template that loads `styles/ebmtnlplab`, `styles/analogy`, and `styles/jupyter`. Not a setup guide. ONLY use when the user explicitly invokes this skill by name (e.g. `/waseda-ips-thesis`). Do NOT auto-trigger on phrases like "edit this thesis", "compile the thesis", or "add a chapter" — wait for an explicit invocation.
---

# Waseda IPS Master's Thesis — maintenance edits

Updates to an existing thesis that loads `styles/ebmtnlplab`, `styles/analogy`, and `styles/jupyter`. Scaffolding (preamble, title-page macros, skeleton, required appendices, bibliography setup) is treated as **read-only** unless the user explicitly asks to change it.

## Edit posture

- Minimal diff. Touch only what the user named.
- Do not "also fix" adjacent things — not indentation, not a label convention, not a stray unicode dash, not a commented-out block, not the author's `% TODO` notes.
- Match the surrounding file's existing conventions (bib key style, label prefix, dash style, table style).
- If a request would require a **structural edit** (below), stop and confirm before editing.

## Preflight

**Content edits — proceed.** Paragraphs, sections, subsections inside an existing chapter; citations; figures; tables; code listings; analogy examples; ticking the AI-writing checklist (`\item[\done]`); adding entries to Publications / List of programs / Notebooks; typos.

**Structural edits — stop and confirm first.** Preamble (packages, options, load order); title-page macros; `\frontmatter` / `\mainmatter` / `\appendix` / `\backmatter`; adding, removing, or reordering chapters or required appendices; bibliography style or natbib options; `.bib` filename; integrity-pledge or AI-writing category text; `.latexmkrc` or compile flags.

## Do not

- Do not reorder or add/remove packages in the preamble.
- Do not change `\documentclass`, the three `styles/` loads, or their order.
- Do not edit the title-page macros unless the user asked for that specific field.
- Do not rewrite the integrity pledge or the AI-writing category descriptions — only tick items with `\item[\done]`.
- Do not switch bibliography style away from `apalike` or natbib options away from `[round,colon]`.
- Do not rename existing bib keys, labels, or filenames to "normalize" them.
- Do not delete the author's `% TODO` comments or commented-out blocks.
- Do not remove `\listoffigures` / `\listoftables` or the `Keywords:` line from the abstract.
- Do not run `latexmk -C` without asking.
- Do not "fix" harmless warnings: duplicate `\bibitem` from `\bibentry`, `silence` package notices, fancyhdr headheight.

## Conventions (when adding content)

**Citations.** `\cite{key}` for "Author (Year)" as sentence subject; `\citep{key}` for "(Author, Year)" asides. Always prefix with `~`. Match the existing `thesis.bib` key style. ASCII `--` for page ranges.

**Labels.** `chapter:`, `section:`, `subsection:`, `figure:`, `table:` (or `tab:` if the chapter uses that). Reference with `~\ref{...}`.

**Tables.** booktabs (`\toprule`, `\midrule`, `\bottomrule`) — no `\hline` between data rows. `l` / `r` / `c` for text / numeric / symbol columns. The SATS example table's grid layout is the one exception.

**Figures.** Files under `assets/`; include with `\includegraphics[width=0.75\textwidth]{./assets/foo.png}`.

**Analogy.** Use `\analogy{A}{B}{C}{D}` — do not roll your own `$A:B::C:D$`. Variants: `\analogy[:][::]{A}{B}{C}{D}[i|r|d]`.

**Code listings.** Python via `minted`. `-shell-escape` and `pygmentize` are already configured; if a listing fails to compile, surface the error rather than reconfiguring the build.

**Required-appendix entries.**
- Publications: `\item \bibentry{key}` (key must exist in `thesis.bib`; duplicate-`\bibitem` warning is expected).
- List of programs: brief note + pointer to where code lives.
- Notebooks: export from Jupyter via *File → Download as → LaTeX (.tex)* and paste the body. Don't hand-format cells.
- AI-writing checklist: tick with `\item[\done]`; don't rewrite the category text.

## Compiling

- `latexmk thesis.tex` from the `thesis/` directory (reads `.latexmkrc`, handles bibliography passes).
- Do not run `latexmk -C` without asking — it deletes the PDF and aux files.
- Generated paths are expected: `_minted/`, `_minted-thesis/`, `.aux`, `.bbl`, `.blg`, `.log`, `.out`, `.toc`, `.lof`, `.lot`, `.fls`, `.fdb_latexmk` — don't clean them mid-edit.
- If compilation fails after an edit, report the error; do not revert the author's content to a template default.
