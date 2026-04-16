---
name: changelog-update
description: Create or update the project CHANGELOG so it accurately records what has changed in the repository. Use when the user asks to write a changelog, add a changelog entry, refresh a stale changelog, or document a release that has outpaced its changelog.
allowed-tools: Read Edit Write Glob Grep Bash
---

# Changelog Update

Create or update the project's root changelog (`CHANGELOG.md`, `CHANGES.md`, `HISTORY.md`, or similar) so it accurately records what has changed in the repository since the last entry.

## Before writing

Understand the repo before touching the file:

1. `ls` the repo root and check for an existing changelog under common names (`CHANGELOG.md`, `CHANGES.md`, `HISTORY.md`, `NEWS`).
2. If a changelog exists, read it in full. Note the heading style, date format, grouping (Added / Changed / Fixed, or flat bullets), tense, and the version and date of the topmost entry.
3. Read the project manifest (`package.json`, `Cargo.toml`, `pyproject.toml`, `go.mod`, etc.) for the current version number.
4. Run `git log --oneline` since the most recent entry's date — or since the last tagged release — to see what has actually landed. Also check `git status` and `git diff` for uncommitted user-visible work if the user is cutting a release now.

Do not start writing until you can list every user-visible change that belongs in the new entry.

## When to create vs. update

**Create** when the repo has no changelog file. Start from scratch using the structure below, with a single entry covering the project's current state.

**Update** when a changelog already exists. Never rewrite historical entries — they are a permanent record of what users saw. Only add new entries, or append to the topmost unreleased section if one exists.

Two update patterns:

- **New dated version entry.** Prepend a `## <version> - <YYYY-MM-DD>` section directly below the top-level heading. Use when a version bump has landed and you are recording what it contains.
- **Append to an Unreleased section.** If the changelog has a `## [Unreleased]` or equivalent at the top, add bullets to it without changing its heading. Use when work is ongoing and no version has been cut.

## What to check for staleness

A changelog is stale when the repo has changed in user-visible ways that are not recorded.

Look for:

- **Commits since the last entry.** Run `git log` since the date or tag of the most recent entry. Any user-visible commit is a candidate bullet.
- **A version in the manifest that is newer than the top entry.** The release happened; the changelog did not keep up.
- **Uncommitted user-visible work.** If the user is cutting a release now, working tree changes belong in the entry.
- **Reverted work.** Do not rewrite history — if a bullet describes something that was later undone, add a note in a later entry instead.

## Structure for a new changelog

Default to a [Keep a Changelog](https://keepachangelog.com) style unless the surrounding ecosystem expects something else. Minimum shape:

```markdown
# Changelog

## <version> - <YYYY-MM-DD>

- <user-visible change>
- <user-visible change>
```

Use today's date in `YYYY-MM-DD` format. If the project groups changes by type — **Added**, **Changed**, **Fixed**, **Removed**, **Deprecated**, **Security** — use those subheadings. Otherwise a flat bullet list is fine. Pick one shape and stay consistent with it across entries.

## Deriving bullets from git log

Convert commits into bullets that describe the change to the user, not the commit that made it.

- **One bullet per user-visible change**, not per commit. Squash related commits into one bullet.
- **Imperative mood, no trailing punctuation**, unless the existing changelog uses a different voice.
- **Drop conventional-commit prefixes** (`feat:`, `fix:`, `chore:`) unless the changelog already keeps them.
- **Skip internal-only commits**: merges, pure version bumps, CI tweaks, lint fixes, refactors with no user-visible effect, typo fixes in internal docs.
- **Skip commits that were later reverted** in the same range. Find the revert and drop both.
- **Flag breaking changes explicitly** — prefix with `BREAKING:` or group them under a dedicated heading.

If you cannot tell from a commit subject whether the change is user-visible, read the diff.

## Writing style

- Plain, direct language. Short bullets.
- Write for the user of the project, not for a future maintainer. A library user cares about the API surface; an app user cares about behavior.
- Match the existing changelog's voice and tense. Terse imperative ("Add X flag") is common; past tense is fine if that is the convention.
- Do not include commit hashes or author names unless the existing changelog already does.
- Do not link every bullet to a PR unless the project already does so consistently.
- Do not use emojis unless the existing changelog already does.

## Rules

- **Never rewrite existing entries.** A published changelog is historical — users rely on its text not changing. Corrections go in the next entry, not by editing old ones.
- **Never invent changes.** If you cannot tie a bullet to an actual commit or uncommitted diff, do not write it.
- **Match existing format exactly.** Heading levels, date format, section grouping, bullet style — follow what is already there.
- **Version numbers must match the manifest.** Do not write a version in the changelog that does not exist in `package.json` / `Cargo.toml` / wherever the project's source of truth lives.
- **Dates in `YYYY-MM-DD`** unless the existing changelog uses something else.
- **Keep diffs minimal on updates.** You are adding a new entry or appending to Unreleased — nothing else should change.
