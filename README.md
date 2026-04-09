# skill-files

Version-controlled skill / prompt files for the AI agents I use.

## Layout

One folder per agent ecosystem:

```text
skill-files/
├── claude/
│   └── skills/
│       ├── development-plan/SKILL.md
│       └── leetcode-explain/SKILL.md
├── cursor/
│   └── rules/
│       └── <rule>.mdc
└── codex/
    └── prompts/
        └── <prompt>.md
```

- **Claude Code** → `claude/skills/<skill-name>/SKILL.md` ([format](https://code.claude.com/docs/en/skills))
- **Cursor** → `cursor/rules/*.mdc` (project rules format)
- **Codex CLI** → `codex/prompts/*.md` (custom prompts / slash commands)

## Symlink into each agent's config

Run from the repo root so edits here go live without copying.

**Claude Code** (personal skills):

```bash
ln -s "$(pwd)/claude/skills" ~/.claude/skills
```

**Cursor** (global rules — symlink into a project's `.cursor/`):

```bash
ln -s "$(pwd)/cursor/rules" /path/to/project/.cursor/rules
```

**Codex CLI** (custom prompts):

```bash
ln -s "$(pwd)/codex/prompts" ~/.codex/prompts
```

If the target path already exists, move it aside first — `ln -s` will not overwrite.
