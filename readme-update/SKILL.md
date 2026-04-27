# README Update

> **Invocation:** Use only when explicitly invoked (e.g. `/readme-update`). Do not auto-trigger on phrases like "write a README", "update the README", or "the README is stale".

Create or update the project's root README (`README.md`, `README.rst`, `README`, or similar) so it accurately describes what the repository contains right now.

## Before writing

Understand the repo before touching the file:

1. `ls` the repo root — know every top-level file and directory.
2. Read key entry points, configs, and manifests (`package.json`, `Cargo.toml`, `pyproject.toml`, `go.mod`, etc.) to learn the project's name, purpose, and dependencies.
3. If a README already exists, read it in full. Note what is accurate, what is stale, and what is missing.
4. Scan for user-visible entry points: CLI commands, exported modules, skills, subcommands, API endpoints, scripts in `bin/` or `scripts/`.

Do not start writing until you can explain in one sentence what the project does and what its major parts are.

## When to create vs. update

**Create** when the repo has no root README at all. Start from scratch using the structure below.

**Update** when the repo already has a README. Preserve the author's structure, tone, and scope. Only change what is wrong or missing — do not rewrite for style. A README update is a surgical edit, not a rewrite.

## What to check for staleness

A README that lists files, skills, modules, commands, or features is an index — when the repo adds, renames, or removes one of those, the README lies until it is fixed.

Look for:

- **New top-level entries** the README would normally list — a new file, skill, module, subcommand, or subdirectory.
- **Renames and removals** — if a listed entry disappeared or moved, the README still points at the old name.
- **New user-visible behavior** — a new flag, a new entry point, a changed default that the README documents.
- **Stale examples** — code snippets or command examples that reference old names, removed flags, or outdated output.
- **Dependency changes** — if a major dependency was added or removed, install instructions may be wrong.

## Structure for a new README

When creating from scratch, include only what the project needs. Not every section applies to every repo. A three-file utility does not need the same README as a framework.

### Required sections

1. **Title and one-line description.** What this project is, in one sentence.
2. **Layout or contents.** If the repo has multiple top-level modules, skills, packages, or directories, list them so the reader knows what is here. Use a tree or table — not prose.

### Optional sections (include when relevant)

3. **Installation / setup.** How to get the project running locally. Include exact commands. If there are prerequisites (a runtime, a tool, credentials), state them.
4. **Usage.** How to use the project once installed. Show the most common command or API call. One or two examples, not a reference manual.
5. **Configuration.** If the project reads config files, environment variables, or flags, summarize them briefly or point to where they are documented.
6. **Contributing.** Only if the project accepts outside contributions and has specific rules.

Do not include sections that would be empty or contain only boilerplate. A short, accurate README is better than a long, padded one.

## Writing style

- Plain, direct language. Short sentences.
- Use the project's own terminology. Do not invent new names for things the code already names.
- Show, don't describe. A code block with the actual command beats a paragraph explaining it.
- Keep the tree or file listing in sync with reality — run `ls` or `glob` to verify before writing.
- Do not add badges, shields, or decorative elements unless the existing README already uses them.
- Do not add a license section unless the user asks or the project has a LICENSE file that should be referenced.
- Do not use emojis unless the existing README already does.

## Rules

- **Accuracy over completeness.** Never document something you cannot verify by reading the repo. If you are unsure what a module does, read its code before describing it.
- **Match existing tone.** If the README is terse, stay terse. If it uses full paragraphs, write full paragraphs.
- **Do not delete user content you don't understand.** If a section seems irrelevant but you cannot verify it is wrong, leave it alone.
- **Keep diffs minimal on updates.** Change only what needs changing. Reviewers should see exactly what was added, removed, or corrected — not a full-file rewrite that obscures the real delta.
- **Verify listings.** Before writing a file tree, directory listing, or feature list, confirm every entry exists. Run `ls` or `glob`. Do not copy a stale listing from the old README without checking.
