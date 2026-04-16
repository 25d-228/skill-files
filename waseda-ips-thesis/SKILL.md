---
name: waseda-ips-thesis
description: Conventions and required structure for a Waseda IPS (Graduate School of Information, Production and Systems) master's thesis written with the EBMT/NLP lab LaTeX template (styles/ebmtnlplab, styles/analogy, styles/jupyter). Use when drafting, editing, or compiling a thesis that uses these styles, or when adding/removing chapters or appendices in such a thesis.
---

# Waseda IPS Master's Thesis (EBMT/NLP lab template)

Apply these rules when working on a thesis that loads `styles/ebmtnlplab`, `styles/analogy`, and `styles/jupyter`. The template is authored by Prof. Yves Lepage's lab and has a fixed front/back matter structure that graders expect.

## Document class and preamble

- `\documentclass[12pt,a4paper]{book}` — do not switch to `article` or `report`.
- Load styles in this order — order is load-bearing:
  1. `styles/jupyter` — Jupyter notebook rendering (tcolorbox, Pygments colors).
  2. `styles/ebmtnlplab` — page layout, title page, `abstracts` / `acknowledgements` environments, natbib, booktabs, hyperref.
  3. `styles/analogy` — the `\analogy{...}{...}{...}{...}` macro.
- `\usepackage{silence}` + `\WarningFilter{latex}{You have requested package}` suppresses template noise; keep it.
- `\usepackage{minted}` requires `-shell-escape` at compile time **and** the `pygmentize` executable on PATH (install `python3-pygments`). Without both, compilation fails.
- Keep `\nobibliography*` in the preamble — it lets `\bibentry{key}` print a single bibliography entry inline (used in the Publications appendix).
- `\setlength{\headheight}{14.49998pt}` silences a fancyhdr warning; don't touch it.

## Frontmatter macros (title page)

Set these before `\begin{document}`:

- `\title{...}` — thesis title.
- `\author{FAMILY_NAME, Given_Name(s)}` — family name in ALL CAPS, comma, given names.
- `\collegeordept{Graduate School of Information, Production and Systems}` — do not abbreviate.
- `\university{Waseda University}`.
- `\crest{\includegraphics[width=45mm]{styles/waseda-fse.png}}` — keep the Waseda FSE crest.
- `\degree{Master of Engineering}`.
- `\degreedate{Month, Year}` — e.g. `January, 2027`. Month name in English, then comma, then year.
- `\supervisor{Professor Yves Lepage}` — full honorific + name.

## Document skeleton (strict order)

```latex
\begin{document}
\maketitle
\frontmatter
\pagenumbering{roman}

\begin{abstracts} ... {\bf Keywords:} k1, k2, k3 \end{abstracts}
\begin{acknowledgements} ... \end{acknowledgements}

\tableofcontents
\listoffigures
\listoftables

\mainmatter
% Chapter 1: Introduction (label chapter:introduction)
% ...
% Final chapter: Conclusion (label chapter:conclusion)

\appendix
% Required appendices, in this order — see below.

\backmatter
\renewcommand{\bibname}{References}
\bibliographystyle{apalike}
\bibliography{thesis}     % reads thesis.bib
\end{document}
```

Do not reorder `\frontmatter` / `\mainmatter` / `\appendix` / `\backmatter`. Do not drop `\listoffigures` / `\listoftables` even if empty — reviewers expect them.

## Required appendices (do not remove)

These are part of the submission requirement, not optional scaffolding:

1. **Pledge for Master's Thesis Submission** — academic-integrity declaration. Fill in the student's name, thesis title, student number, and leave blanks for handwritten signature and date.
2. **Use of Writing Assistance and Generative Language Models** — uses the custom `todolist` environment. Tick applicable items with `\item[\done]`; leave others as plain `\item`. The six categories are copied from the ACL 2023 AI-writing policy — do not rewrite them.
3. **Publications** — list using `\item \bibentry{key}`. Requires `\nobibliography*` in the preamble. Keys must also exist in `thesis.bib`.
4. **List of programs** — brief documentation of code artifacts produced for the thesis, with a pointer to where they live (lab server path or repo URL).
5. **Notebooks** — Jupyter notebooks rendered verbatim. Workflow: in Jupyter, *File → Download as → LaTeX (.tex)*, then copy everything between `\begin{document}` and `\end{document}` in the exported file into this chapter. Do not hand-format cells; let the export do it.

If the student has nothing to report for (3)–(5), still keep the appendix chapter with a short note — don't delete the heading.

## Citation and bibliography conventions

- natbib is loaded with `[round,colon]` — so citation brackets are round, and the separator in `\citealp`-style is a colon.
- **`\cite{key}`** → textual form: "Author (Year)". Use when the author is a sentence subject: *`\cite{yan2024transformer}` propose ...*
- **`\citep{key}`** → parenthetical form: "(Author, Year)". Use for aside citations: *... prior work ~`\citep{Aamodt:1994:aicomm}`.*
- Always prefix with a non-breaking space: `~\cite{...}` / `~\citep{...}`.
- Bibliography style is `apalike` — do not switch to `plain`, `ieeetr`, etc.
- `.bib` file is `thesis.bib`. Follow the existing BibDesk-style key convention: `LastName:YY` or `LastName:YY:venue` (e.g. `Fam:17:icca`). For newer entries a longer key like `yan2024transformer` is also accepted.

## Section labels

Follow the template convention so cross-references read naturally:

- `\label{chapter:<name>}` for chapters
- `\label{section:<name>}` for sections
- `\label{subsection:<name>}` for subsections
- `\label{figure:<name>}` / `\label{table:<name>}` — the template also uses `\label{tab:<name>}` in places; either is fine but stay consistent within a chapter.

Reference with `\ref{...}` after a non-breaking space: `Table~\ref{table:formatting}`, `Section~\ref{section:background}`.

## Tables and figures

- Tables use **booktabs** (`\toprule`, `\midrule`, `\bottomrule`). Do **not** use vertical rules or `\hline` between data rows — the one exception in this template is the SATS example table which uses `|` and `\hline` for a grid layout; match that only if you're copying that specific style.
- Inside a table: left-align text columns (`l`), right-align numeric columns (`r`), center for symbols (`c`).
- Figures go in `assets/` and are included with `\includegraphics[width=0.75\textwidth]{./assets/foo.png}`. Use relative paths starting with `./assets/`.

## Analogy macro

From `styles/analogy.sty`:

```latex
\analogy{man}{woman}{king}{queen.}   % default: italic, A : B :: C : D
\analogy[:][::]{A}{B}{C}{D}[i]        % explicit separators + italic style
\analogy[:][::]{A}{B}{C}{D}[r]        % roman
\analogy[:][::]{A}{B}{C}{D}[d]        % display math mode
```

Prefer `\analogy{...}` for prose examples — don't roll your own `$A:B::C:D$` by hand.

## Code listings

Python snippets use `minted`:

```latex
\begin{minted}{python}
import numpy as np

def add_two_numbers(i, j):
    return i + j
\end{minted}
```

If compilation fails with "You must invoke LaTeX with the -shell-escape flag" or "Pygments is not installed":

1. Confirm `pygmentize --version` works on the shell.
2. Confirm the build uses `-shell-escape` — the project's `.latexmkrc` already sets `$pdflatex = 'pdflatex -shell-escape %O %S';`, so running `latexmk` picks it up. For VS Code, add `-shell-escape` to `latex-workshop.latex.recipes`.

## Compiling

- Preferred command: `latexmk thesis.tex` run from the `thesis/` directory (uses `.latexmkrc`).
- Clean build: `latexmk -C thesis.tex` removes aux files and the PDF before recompiling.
- Ignore these generated directories — they're safe to delete and are regenerated:
  - `_minted/`, `_minted-thesis/` — Pygments cache for `minted`.
  - Standard latex aux files: `.aux`, `.bbl`, `.blg`, `.log`, `.out`, `.toc`, `.lof`, `.lot`, `.fls`, `.fdb_latexmk`.
- Bibliography changes need two passes — `latexmk` handles this automatically; plain `pdflatex` does not.

## Common pitfalls

- **Duplicate `\bibitem` warning for a cite key** — expected when a paper is both cited in the body and listed via `\bibentry` in Publications. Harmless; don't try to "fix" it by removing one.
- **Unicode dashes in the source** (`–`, `—`) render correctly under `babel=english`, but searches for `-` in BibTeX page ranges won't match them. Use ASCII `--` for page ranges in `thesis.bib` (`pages = {311--318}`).
- **The template's ~/share path** `http://itigo/files/Tools/` in "List of programs" is lab-internal — replace with the actual location (GitLab URL, repo path) when the student publishes code.
- **Do not remove** the `Keywords:` line from the abstract or the `% TODO`-style comments the author leaves for themselves — respect the author's working notes unless asked to clean them up.
