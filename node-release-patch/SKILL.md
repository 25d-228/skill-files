---
name: node-release-patch
description: Bump the patch version of a Node project, build it, and produce a distributable artifact (npm tarball, VS Code VSIX, etc.). Use when the user says "release", "cut a build", "package it", or similar without specifying a minor/major bump, on any project with a package.json.
allowed-tools: Bash Read Edit Grep Glob
---

# Node Release Patch

Cut a fresh patch release of a Node project: bump `x.y.z` → `x.y.(z+1)` in `package.json`, run the build, and produce the project's distributable artifact at the repo root.

This skill is generic — it works for plain npm packages, VS Code extensions, CLIs, libraries, or any other Node project with a `package.json`. It auto-detects the build and packaging commands from what the project declares.

## Version bump rule — do not get this wrong

- **Default is always patch.** `0.2.1` → `0.2.2`, `1.4.9` → `1.4.10`. Never touch the minor or major component.
- **Only bump minor (`x.y.z` → `x.(y+1).0`) if the user explicitly says so** — e.g. "new feature release", "minor bump", "bump to 0.3.0", "bump minor".
- **Only bump major (`x.y.z` → `(x+1).0.0`) if the user is extremely explicit** — e.g. "1.0 release", "ship 1.0", "major bump", "breaking release". When in doubt, ask.
- **Never change `version` to anything the user didn't ask for.** If they say "0.3.0", use exactly `0.3.0`. If they say "patch", compute `z+1`.
- **Respect pre-release tags.** If the current version is `1.2.3-beta.4`, ask the user what they want — bumping pre-release tags is not a patch bump and the convention varies by project.
- **First release starts at `0.0.0`.** If no prior build artifact exists in the repo (no `.vsix`, no `.tgz`, no matching `<name>-*.zip` — whatever this project produces), this is the first release. Set the version to exactly `0.0.0` instead of bumping, regardless of what `package.json` currently says. Do not bump to `0.0.1`, and do not start at `0.1.0` or `1.0.0`. The *next* run of this skill will bump `0.0.0` → `0.0.1` naturally.

When unsure whether the user wants a patch or a feature bump, ask before editing `package.json`.

## Workflow

Run these steps in order from the project root. Do not skip steps. Do not run them in parallel — each depends on the previous.

Throughout this workflow, **assume the current working directory is the project root** unless the user has told you otherwise. Do not hardcode absolute paths.

### 1. Read current version and detect project type

Read `package.json`. Note:

- The `"version"` field — parse as `major.minor.patch`. Compute the new version per the rule above.
- The `"name"` field — used later to predict artifact filenames.
- The `"scripts"` object — find the build/package script (see step 4).
- The `"devDependencies"` — look for `@vscode/vsce` (VS Code extension), `electron-builder`, or other packagers that influence what the final artifact is.
- The `"private": true` flag — if present, `npm pack` still works but the project isn't meant for npm publish. That's fine for this skill.

Then check whether a prior build artifact exists at the repo root:

```bash
ls *.vsix *.tgz 2>/dev/null
```

If nothing matches — no `.vsix`, no `.tgz`, no prior artifact of any kind — this is a first release. Set the target version to exactly `0.0.0` (see the first-release rule above). Skip the "bump" arithmetic entirely; you are not bumping, you are establishing the starting version. If `package.json` already has a version like `0.0.1` or `1.2.3`, overwrite it with `0.0.0` for this run — the first-release rule takes precedence over whatever arbitrary starting value the project scaffolded with.

If any prior artifact does exist, proceed with the normal bump arithmetic against the `package.json` version.

### 2. Confirm the plan

Tell the user, in one sentence: *"Bumping `x.y.z` → `x.y.(z+1)`, building, and packaging."* Do not start editing yet.

If the user has not asked for this in the current turn (i.e. you are triggering this skill off a slash command), skip the confirmation and proceed — they already asked.

### 3. Bump `package.json`

Use `Edit` to change the `"version"` line. Only touch that one line.

```
Edit package.json
  old_string: "version": "x.y.z",
  new_string: "version": "x.y.(z+1)",
```

Do **not** modify `package-lock.json` by hand. `npm install` does that; we don't need to touch it for a version-only bump — but if the build step updates it, keep the update.

Prefer `Edit` over `npm version patch`. The npm command creates a git tag and a commit by default, which this skill explicitly does not do (see "What this skill does NOT do"). You can use `npm version patch --no-git-tag-version` if you prefer, but a single-line edit is simpler and has no side effects.

### 4. Build (production)

Pick the build script from `package.json` in this order of preference:

1. `npm run package` — if the project defines a `package` script that produces a production build. Common in VS Code extensions and similar tooling.
2. `npm run build` — the conventional production build target.
3. `npm run compile` — older projects, or ones that distinguish dev compile from prod build.
4. If none of the above exist, ask the user which script to run. Do not guess.

```bash
npm run <selected-script>
```

This typically runs type checking, lint, and a bundler (esbuild/webpack/rollup/tsc) in sequence. All steps must succeed.

If any fails:

- **Type error** → read the error, fix the underlying code, re-run the build. Do not cast to `any`, add `@ts-ignore`, or silence the diagnostic. Fix the root cause.
- **Lint error** → fix it. Do not disable the rule.
- **Bundler error** → usually a missing dependency or a bad import path; fix the source.
- **Missing script** → if you chose a script that doesn't exist, go back to step 4's list and pick another, or ask the user.

Do not continue to packaging until the build step is green.

### 5. Package the artifact

Detect what kind of artifact this project produces and run the matching command:

- **VS Code extension** (`@vscode/vsce` in `devDependencies`, or an `engines.vscode` field in `package.json`):
  ```bash
  npx vsce package
  ```
  This writes `<name>-<version>.vsix` at the repo root.

- **Electron app** (`electron-builder` in `devDependencies`): the project usually wires this into `npm run package` or `npm run dist`. If step 4 already produced the artifact, skip this step. Otherwise run the project's own packaging script — do not invent a new one.

- **Plain npm package / library / CLI**:
  ```bash
  npm pack
  ```
  This writes `<name>-<version>.tgz` at the repo root. Scoped packages (`@scope/name`) produce `scope-name-<version>.tgz`.

- **Unknown / custom**: if the project has a `release`, `dist`, or `bundle` script in `package.json`, ask the user whether to run it. Do not run publishing commands (`npm publish`, `vsce publish`, `gh release create`) — those are separate, destructive actions.

Common failures:

- **`vsce` not installed** → it's usually in `devDependencies` as `@vscode/vsce`; `npx vsce package` should work. If it doesn't, try `npx @vscode/vsce package`.
- **`vsce` complains about missing LICENSE / README / repository field** → address the specific complaint in `package.json` or the filesystem. Don't suppress the warning unless the user asks.
- **Files accidentally included in the VSIX / tarball** → check `.vscodeignore` (VS Code) or the `files` field / `.npmignore` (npm). Dev docs, source maps, and the `src/` tree should typically be excluded.
- **`npm pack` includes too much or too little** → the `files` array in `package.json` is the source of truth. `.npmignore` is a fallback.

### 6. Verify

```bash
ls -la <expected-artifact-path>
```

Confirm the file exists and its size looks reasonable. For reference:

- VS Code extensions are usually 100 KB – 5 MB.
- npm library tarballs are usually 10 KB – 2 MB.
- Electron app bundles are much larger (tens to hundreds of MB) and are the exception, not the rule.

If the size is way outside the expected range, something is wrong — likely `node_modules/` leaked into the bundle, or the build produced an empty artifact. Investigate before reporting success.

Report the absolute path to the user.

## What this skill does NOT do

- **Does not commit.** The user commits when they're ready. If they say "release *and* commit", that's a separate request — do the release first, then run the normal commit flow.
- **Does not push.** Never push to remote from this skill.
- **Does not publish.** `npm publish`, `vsce publish`, `gh release create`, and similar are destructive actions that must be user-initiated.
- **Does not create git tags.** Tagging is part of a real release workflow and happens after the user validates the artifact.
- **Does not delete older artifacts.** Previous `.vsix` / `.tgz` files accumulate in the repo root; the user decides when to clean them up.
- **Does not modify anything outside `package.json`** — except side effects of the build step itself (`dist/`, `out/`, `build/`, or whatever the project writes).
- **Does not update `CHANGELOG.md`.** If the project maintains a changelog, the user writes the entry; this skill is about producing the artifact.

## End-of-run summary

One or two sentences. Tell the user:

1. The old version and new version.
2. The absolute path to the produced artifact.

Example: *"Packaged `ask-markdown-0.2.2.vsix` (bumped from 0.2.1). File is at `/absolute/path/to/ask-markdown-0.2.2.vsix`."*
