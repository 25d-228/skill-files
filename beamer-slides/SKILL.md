---
name: beamer-slides
description: Academic slide conventions for wording, figures, notation, tables, and integrity. Use when drafting, revising, or reviewing Beamer (or other LaTeX-based) academic slide decks — especially research talks and course lectures.
---

# Beamer Slides

Apply these conventions when writing or reviewing academic Beamer decks. They cover neutral phrasing, layout, figures, notation, tables, and honest reporting of datasets and publication status.

## Wording

- Prefer neutral, comparative wording: **higher/lower on metric X**, not vague "good/bad" or "better/worse".
- **Give examples** — illustrate abstract concepts with concrete instances on the slide, not just definitions.

## Visual design

- Add **page numbers** to every slide.
- Do **not overuse frames** — combine closely related points onto one slide rather than splitting every bullet into its own frame.

## Figures and sources

- **Illustrate the method** — when presenting a method or algorithm, include a visual diagram or worked example, not just text.
- If a figure is copied, write exactly **Copied from …** — not vague "credits" or "sourced from".
- Always place a **comma after the author name(s)** and after **"et al."** in citations: `(Smith, 2020)`, `(Smith et al., 2020)` — not `(Smith 2020)` or `(Smith et al. 2020)`.
- Distinguish **(Author, Year)** for citing a paper from **Author (Year)** for citing a person. Slides should use each form appropriately.
- In figure/table captions, always use the paper-citing form: **Figure/Table: (Author, Year)**, not the person-citing form.

## Typography and notation

- Keep **notation consistent** across the deck.
- **Define every abbreviation** on first use. Avoid unnecessary abbreviations altogether.
- Distinguish **similar concepts** explicitly (e.g. analogical mean vs generalized mean).
- Avoid random **ALL CAPS**. Let typography rules handle casing.
- In LaTeX / Beamer, prefer **relative units** (`em`, `ex`) over absolute (`pt`, `cm`) where applicable.
- Aim for **≤ 7 lines per slide** and **≤ 9 words per line** when feasible. The word limit encourages concise sentences — do **not** artificially break a natural sentence across lines just to hit the target.
- Use **clear vector notation** consistently (e.g. arrow form for vectors).

## Tables and graphs

- Every graph needs **axis labels and units**.
- **Mark comparison direction with arrows** (↑ higher is better, ↓ lower is better) so readers instantly know which way is good.
- **Left-align** text; **right-align** comparable numbers.
- Place **comparable rows or columns close together** in tables.
- Prefer readable spoken forms over scientific notation when appropriate (e.g. "40 million", not `4.3e7`).
- Every figure should support **one takeaway sentence**. If you can't write that sentence, the figure doesn't belong.

## Datasets and publication

- When introducing a dataset, show an **example**, its **size**, and the **language(s)** when relevant.
- Be honest about publication status — say **"only on arXiv"** if that's the case.
