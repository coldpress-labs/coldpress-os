# Quick Start — Your First 10 Minutes with coldpress-os

> Zero to a running project in 10 minutes. This guide assumes you have Claude Code installed and a terminal open.

---

## Prerequisites

| Requirement | Check |
|-------------|-------|
| **Node.js 20+** | `node -v` returns `v20` or higher |
| **Claude Code** | `claude` works in terminal (dev-time runtime — optional for Agent SDK users) |
| **Git** | `git --version` returns 2.x+ |
| **Python 3.10+** *(optional)* | `python3 --version` — needed for `coldpress graph rebuild` and the document-ingest skill. `pip install graphifyy markitdown docling` when you reach Phase 2 Discovery. |
| **A project idea** | Even a vague one — the framework will help you refine it |

No paid services required. coldpress-os is a local framework — everything runs on your machine.

---

## Minute 0-1: Install

```bash
npm install -g @coldpress/core
```

Verify it's on your PATH:

```bash
coldpress --version   # → 0.2.0-alpha (or later)
coldpress --help      # → lists init / update / feedback / upgrade
```

---

## Minute 1-4: Scaffold the project

```bash
cd ~/code   # or wherever you keep projects
coldpress init
```

You'll be prompted for:

| Field | Example |
|-------|---------|
| Project name | `My Awesome Project` |
| Project slug | `my-awesome-project` (auto-suggested from the name; kebab-case) |
| Your name | `Aastha` (used in Butler's prose) |

The scaffold confirms the target directory and then:

1. Copies the template tree into `./my-awesome-project/` with placeholders filled.
2. Copies the framework files into `./my-awesome-project/coldpress-os/`.
3. Generates ~66 `.claude/skills/` wrappers pointing at canonical skills.
4. Generates interop outputs: `AGENTS.md`, `.cursor/rules/`, `.roomodes`, `.openhands/microagents/`, `.clinerules/`.
5. Records the project in `~/.coldpress/registry.json` (opt out with `COLDPRESS_NO_REGISTRY=1`).

Pass `--project-name "My Project"` to skip the name prompt, or omit for full interactive mode.

---

## Minute 4-6: Tour the scaffolded project

```bash
cd my-awesome-project
ls -a
```

```
.
├── .claude/
│   ├── SYSTEM.md              # Butler's directive
│   ├── agents/                # 9 subagent definitions
│   └── skills/                # ~66 thin-wrapper SKILL.md files
├── .clinerules/               # Cline / Roo compat
├── .cursor/rules/             # Cursor .mdc rules (one per subagent)
├── .cursorrules               # Legacy Cursor fallback
├── .gitignore                 # Ignores .coldpress/, secure/.env*, node_modules/, etc.
├── .openhands/microagents/    # OpenHands repo-type microagents
├── .roomodes                  # Roo / Kilo customModes YAML
├── AGENTS.md                  # Vendor-neutral agent manifest
├── CLAUDE.md                  # Framework routing for your main Claude Code session
├── coldpress-os/              # Framework files (read-only; upgrade via `coldpress update`)
├── coldpress.yaml             # Project config (Phase-1 fields filled; rest written later)
├── _context/                  # Produced artefacts (planning/design/.../sacred)
├── _input/                    # Inputs (raw/legacy/reference/vendor/assets)
├── docs/                      # Project-specific docs
├── scripts/
│   └── check-secrets.sh       # Pre-commit secret-scan hook (install via .git/hooks)
└── secure/
    └── manifest.yaml          # Declared credential shape (values in secure/.env*, git-ignored)
```

Install the pre-commit secret-scan hook (one-time per clone):

```bash
cp scripts/check-secrets.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

Initialise git and make the first commit:

```bash
git init
git add .
git commit -m "init coldpress-os project"
```

---

## Minute 6-8: Start Claude Code + run your first skill

```bash
claude
```

Claude Code reads `CLAUDE.md` and loads Butler's directive automatically. You can now ask for any coldpress-os workflow by name or intent. A common Phase-2 starting point:

```
Run pre-project interview
```

Butler dispatches `@analyst` (Phase 2 — Discovery), which walks you through a structured interview. The output lands at `_context/sacred/context.md` — your first sacred document.

Other common entry points:

| Intent | What runs | Phase |
|--------|-----------|-------|
| "Run pre-project interview" | `@analyst` / `pre-project-interview` | 2 |
| "Evaluate my tech stack options" | `@architect` / `stack-evaluation` | 3 |
| "Lock the tech stack" | `@architect` / `stack-locking` | 3 |
| "Create the PRD" | `@pm` / `create-prd` | 4 |
| "Create architecture" | `@architect` / `create-architecture` | 4 |
| "Break into epics and stories" | `@pm` + `@scrum-master` | 5 |
| "Dev this story" | `@developer` (standard) | 6 |
| "Quick-dev this feature" | `@developer` (quick) | 6 |
| "Run code review" | `@qa` / `code-review` | 6 |
| "Check deployment readiness" | `@qa` / `readiness-check` | 7 |

---

## Minute 8-10: Install Anthropic companion skills (one-time)

Coldpress-os's subagents delegate to Anthropic's first-party Agent Skills where they overlap (document generation, MCP server scaffolding, webapp testing, skill creation). Install the two Anthropic marketplace plugins inside Claude Code:

```
/plugin install document-skills@anthropic-agent-skills    # for @communicator (DOCX / PDF / PPTX / XLSX)
/plugin install example-skills@anthropic-agent-skills     # for @qa / @architect / @valet
```

See [`docs/anthropic-skill-wrapping-audit.md`](anthropic-skill-wrapping-audit.md) for the full delegation table and licence hygiene notes.

---

## What's next

- Read the [Example Walkthrough](example-walkthrough.md) to see a full 8-phase project (TaskPulse) play out end-to-end.
- Keep [Troubleshooting & FAQ](troubleshooting.md) open in a tab when you hit something weird.
- Browse [`coldpress-os/lifecycle/`](../lifecycle/) to see which skills live in each phase.
- When ready to upgrade:
  ```bash
  npm update -g @coldpress/core   # get the latest release
  coldpress update                 # regenerate interop outputs in your project
  ```

Using the Agent SDK instead of Claude Code CLI? Point `@anthropic-ai/claude-agent-sdk` at your project — the `.claude/` tree loads unchanged. See `test/agent-sdk-compat.test.ts` in the framework repo for the compatibility smoke test.
