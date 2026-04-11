---
name: commit-split
description: Split a working tree full of mixed uncommitted changes into a small number of focused, reviewable commits. Use when the user has many pending changes spanning multiple concerns and asks for them to be committed separately, grouped logically, or "broken into commits".
allowed-tools: Bash Read Edit Grep Glob
---

# Commit Split

Turn a dirty working tree into a clean, focused commit history where each commit represents one logical change — one feature, one refactor, one fix, one packaging tweak.

## Before splitting

Ask nothing the repo can already answer. Run these first:

1. `git status` — every dirty file and every untracked file.
2. `git diff --stat` — scale of each file's changes.
3. `git log --oneline -10` — match the repo's existing commit message style.
4. Read every diff. Do not guess what a file's changes are about — read the actual hunks.

Do not start committing until you can say one sentence about what every change in the working tree does. Unknown changes might be the user's in-progress work, and committing what you don't understand is how you lose it.

## How to group commits

Group by **concern**, not by file. Aim for 2–5 commits for a typical mixed working tree. Fewer than 2 means you weren't asked to split. More than 5 usually means you're slicing too finely or the working tree genuinely has that much unrelated work.

### Rule 1: One concern per commit

- **One feature = one commit.** A new capability the user would name.
- **One refactor = one commit.** Renaming, restructuring, extracting helpers — even if it touches many files.
- **One destructive change = one commit.** Removing a feature, deleting files, dropping a dependency. Do not bundle a deletion with its replacement unless the replacement is trivial.

### Rule 2: Release prep stands alone

Version bumps, changelog entries, and packaging hygiene (`.gitignore`, `.vscodeignore`, CI config) go in their own commit. Do not bundle them with the feature that motivated the release.

### Rule 3: Docs travel with the change that motivated them

Untracked dev docs, README updates, and inline comments ride in the commit whose feature or fix they describe — never alone as a "docs" commit unless the work is purely documentation.

### Rule 4: Bundle only when genuinely inseparable

If two pieces of work truly belong together — a schema change and the code that uses it, a type rename and every call site — one commit is fine. If they don't, split them.

## Handling files with mixed hunks

A single file often contains hunks from multiple logical groups — e.g. a `README.md` with a feature addition *and* a removal *and* a typo fix. You cannot always `git add <file>` cleanly. Three strategies, in order of preference:

### Strategy 1: File-level where possible

Most files belong entirely to one commit. Stage them whole with `git add <file>`. Only reach for hunk splitting when a file genuinely spans multiple commits. Check `git diff --stat` first — most working trees have fewer mixed files than you'd expect.

### Strategy 2: Revert-and-reapply (preferred for complex files)

For files with mixed hunks across commits, edit the working tree to reflect the *intermediate state* you want for the current commit, then commit, then edit it forward for the next commit.

Concrete workflow:

1. The working tree currently holds all changes ("final state").
2. Use `Edit` to revert the hunks that belong to *later* commits back to their HEAD form. The working tree now holds only commit 1's changes.
3. `git add <file>` and commit.
4. Use `Edit` to re-apply the hunks you reverted in step 2. The working tree now holds the state needed for commit 2.
5. `git add <file>` and commit.
6. Repeat for further commits.

This is more reliable than `git add -p` because `Edit` gives exact control and no interactive prompts. It also works when a single line holds changes from two different logical groups (e.g. one import line that both removes an old symbol and adds a new one) — `git add -p` cannot split that, but `Edit` can.

Keep a mental note of which hunks belong to which commit before you start reverting, so you know what to re-apply.

### Strategy 3: git add -p (when strategy 2 is heavy)

For files with many well-separated hunks that each cleanly belong to exactly one commit, `git add -p <file>` works:

- `y` — include this hunk.
- `n` — skip this hunk.
- `s` — split this hunk into smaller pieces if git offers.
- `q` — quit.

Avoid `git add -p` when any single hunk straddles two logical groups. Use strategy 2 instead.

## Smoke check between commits

**Run the fast smoke check after every intermediate commit.** If commit 1 breaks the build in isolation — even though the full working tree is fine — the history is broken. You've introduced a bisect landmine.

| Stack        | Fast check                                     |
| ------------ | ---------------------------------------------- |
| TypeScript   | `npx tsc --noEmit`                             |
| Rust         | `cargo check`                                  |
| Go           | `go build ./...`                               |
| Python       | `python -c "import <pkg>"` or a targeted test  |
| Node.js (JS) | `node --check <entry>` or a smoke test         |

If an intermediate state fails to compile, the split is wrong. Bundle the offending hunks together into one commit, or split differently. Do not commit broken intermediate states and "fix it in the next commit" — that defeats the point of splitting.

## Commit messages

Match the repo's existing style. Check `git log --oneline -10` first. If the history uses conventional commits (`feat:`, `fix:`, `chore:`), follow that. If it uses sentence-case imperative titles, follow that. Do not impose a style the repo doesn't already use.

Lacking a strong local convention, default to:

1. **Title line, ≤72 chars.** Sentence case, imperative. Describes what the commit does, not what it's responding to. No trailing period.
2. **Blank line.**
3. **Body.** 2–5 short paragraphs or a bullet list. Explains *why* the change exists — the motivation, the tradeoff, the incident it came from. The *what* is usually visible in the diff; the *why* is not.
4. **Co-author trailer** if the project wants one.

Example body that earns its space:

```text
Improve Claude MCP protocol compliance

Brings the WebSocket server closer to the shape claudecode.nvim uses,
so Claude Code's context-gathering works reliably even when focus has
left the preview.

- Adds getLatestSelection: caches the most recent non-empty preview
  selection so Claude can still retrieve it after the user clicks into
  the terminal. Fixes the race where selection → Claude button →
  terminal focus → getCurrentSelection would return empty.
- Reshapes getCurrentSelection to the 0-indexed LSP format the
  protocol expects, with isEmpty nested inside the selection object.
- Registers getDiagnostics as a stub returning an empty list so
  markdown context-gathering doesn't log method-not-found.
```

Always pass the message via a HEREDOC so newlines and quotes survive:

```bash
git commit -m "$(cat <<'EOF'
Title line

Body paragraph explaining why.
EOF
)"
```

## Style rules

- Plain, direct language. Short sentences. Imperative voice.
- Don't restate the diff. "Change X from A to B" is visible — explain *why*.
- Don't reference conversation state. "As we discussed" rots.
- Don't use phrases like "this commit" or "in this PR" — they read as noise in `git log`.
- Don't write TODOs into commit messages. Fix them or file them.
- Don't claim a behavior the commit doesn't implement.
- **Never amend published commits.** Create a new commit if something is wrong.
- **Never use `--no-verify`** to skip hooks. Fix the underlying issue — a hook failure means the commit shouldn't land as-is.
- **Never `git add .` or `git add -A`.** Stage specific files so you cannot accidentally include `.env`, credentials, `node_modules`, build artifacts, or other junk.
- **Never commit files you haven't read.** Unknown state in the working tree is probably the user's in-progress work.
- **Never force-push.** Splitting is additive — you're adding new commits on top, not rewriting shared history.
- **Do not push.** Committing is local; pushing is visible to others. Wait for explicit consent.

## How to split

1. Run `git status`, `git diff --stat`, `git log --oneline -10`.
2. Read every diff. Decide the grouping.
3. **Tell the user the plan** before committing: *"I'll do N commits: (1) ..., (2) ..., (N) ..."*. Do not just start. If the user pushes back, reshape.
4. For each commit, in order:
   1. Edit mixed files to the intermediate state for this commit.
   2. `git add <file>` / `git rm <file>` for files in scope.
   3. Run the fast smoke check.
   4. `git commit` with a HEREDOC message.
   5. Restore mixed files for the next commit.
5. Run `git log --oneline -N` to verify the final history reads cleanly.
6. Run `git status` to verify the working tree is clean (or holds only what you intentionally left uncommitted).
7. **Do not `git push`** unless the user asks.

## Edge cases

- **Untracked files that shouldn't be committed at all** (scratch notes, test outputs, one-off data dumps): leave them alone. Ask the user if unsure. Do not `git add` them into any commit.
- **Deleted files**: use `git rm <file>`, not `git add`. A deletion is a logical change like any other and belongs in the commit whose concern motivated it.
- **Renames**: git detects renames from content similarity, so a rename appears as a delete + add in `git status` but as one rename in `git log`. Commit both sides together.
- **Lockfile drift** (`package-lock.json`, `Cargo.lock`, `uv.lock`): bundle with the dependency change that caused it. If the lockfile is stale from an *earlier* change the user didn't commit, include it with the most closely related commit.
- **Binary files** (images, generated assets): stage them with the commit whose concern introduced them. Never use `git add -p` on binaries — it doesn't apply.
