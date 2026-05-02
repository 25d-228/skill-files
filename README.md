# skill-files

Version-controlled skill files shared across AI agents.

## Layout

Each skill is a directory at the repo root with a `SKILL.md`:

```text
skill-files/
├── beamer-slides/SKILL.md
├── leetcode-explain/SKILL.md
├── node-release-patch/SKILL.md
└── waseda-ips-thesis/SKILL.md
```

All agents point at the same directory — no per-agent copies.

## Symlink into each agent's config

Run from the repo root:

```bash
ln -s "$(pwd)" ~/.claude/skills    # Claude Code
ln -s "$(pwd)" ~/.cursor/skills    # Cursor
ln -s "$(pwd)" ~/.agents/skills    # Codex
```

If the target path already exists, move it aside first — `ln -s` will not overwrite.
