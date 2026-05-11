# skill-files

Version-controlled skill files shared across AI agents.

## Layout

Each skill is a directory at the repo root with a `SKILL.md`:

```text
skill-files/
├── beamer-slides/SKILL.md
├── learning-docs/SKILL.md
├── leetcode-explain/SKILL.md
└── master-thesis/SKILL.md
```

All agents point at the same directory — no per-agent copies.

## Link into each agent's config

**macOS / Linux** — from the repo root:

```bash
ln -s "$(pwd)" ~/.claude/skills    # Claude Code
ln -s "$(pwd)" ~/.cursor/skills    # Cursor
ln -s "$(pwd)" ~/.agents/skills    # Codex
```

**Windows** — from `cmd.exe` (junctions don't need admin):

```cmd
mklink /J %USERPROFILE%\.claude\skills C:\gIThUB\skill-files
mklink /J %USERPROFILE%\.cursor\skills C:\gIThUB\skill-files
mklink /J %USERPROFILE%\.agents\skills C:\gIThUB\skill-files
```

If the target path already exists, move it aside first — neither `ln -s` nor `mklink` will overwrite.
