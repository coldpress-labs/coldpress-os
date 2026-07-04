# Quick Start — Your First 10 Minutes with coldpress-os

> Zero to a running project in 10 minutes. This guide assumes you have Claude Code installed and a terminal open.

> **Hello Butler.** Butler is your main agent — the orchestrator running in your Claude Code session, with the 8 subagents on call when their expertise is needed. Type `Hello Butler` in any session and Butler responds with `let's begin` (fresh project) or `where are we` (resumes from state). Full reference: [`butler.md`](butler.md).

---

## Prerequisites

| Requirement | Check |
|-------------|-------|
| **Node.js 22+** | `node -v` returns `v22` or higher |
| **Claude Code** | `claude` works in terminal (dev-time runtime — optional for Agent SDK users) |
| **Git** | `git --version` returns 2.x+ |
| **A project idea** | Even a vague one — the framework will help you refine it |

> The core framework needs no Python. Optional document-ingest and brownfield
> code-indexing capabilities install their own external tools on demand (via the
> brownfield capability pack); the core lifecycle has no Python dependency.

No paid services required. coldpress-os is a local framework — everything runs on your machine.

---

## Minute 0-1: Install

```bash
npm install -g @coldpress/core
```

Verify it's on your PATH:

```bash
coldpress --version   # → 0.3.0-alpha (or later)
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

1. Copies the template tree into `./my-awesome-project/` with placeholders filled (including 5 `_input/` subfolders — `assets/`, `vendor/`, `raw/`, `legacy/`, `reference/` — each with a README explaining what belongs there).
2. Copies the framework files into `./my-awesome-project/coldpress-os/`.
3. Writes `.claude/settings.json` to auto-enable the coldpress skill **plugin** (a local directory marketplace) — the plugin ships the full skill library, so there are no per-skill wrappers to generate.
4. Generates interop outputs: `AGENTS.md`, `.cursor/rules/`, `.roomodes`, `.openhands/microagents/`, `.clinerules/`.
5. Runs `git init` + makes an initial commit (`chore: coldpress init scaffold`) + installs the pre-commit secret-scan hook (`scripts/check-secrets.sh` → `.git/hooks/pre-commit`).
6. Records the project in `~/.coldpress/registry.json` (opt out with `COLDPRESS_NO_REGISTRY=1`).

Pass a positional project name argument to skip the name prompt: `coldpress init "My Project"`. Omit for full interactive mode.

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
│   ├── settings.json          # Auto-enables the coldpress skill plugin
│   └── agents/                # 8 subagent definitions
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

The git repo and pre-commit hook are already initialised by `coldpress init` (step 5 above). To re-install the hook manually after cloning an existing project:

```bash
cp scripts/check-secrets.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

---

## Minute 6-8: Start Claude Code + run your first skill

```bash
claude
```

Claude Code reads `CLAUDE.md` and loads Butler's directive automatically. In a fresh session, Butler runs **Phase 1 Bootstrap** — two skills:

- **`orient`** — quick scaffold health check, a short lifecycle intro, and handoff to `intake`.
- **`intake`** — walks you through the 5 `_input/` subfolders, classifies the project shape (greenfield / brownfield), captures your project intent in one sentence, records your working-mode preferences (cadence, team shape), and primes the graph index.

When intake exits cleanly, Butler hands off to **Phase 2 — Discovery** (`@analyst pre-project-interview`) which expands the one-sentence intent into `_context/sacred/context.md` — your first sacred document.

Other common entry points:

| Intent | What runs | Phase |
|--------|-----------|-------|
| "Run pre-project interview" | `@analyst` / `pre-project-interview` | 2 |
| "Start Phase 3 — consolidate evidence + match pack" | `@architect` / `stack-discovery-sync` | 3 |
| "Evaluate my tech stack options" | `@architect` / `stack-evaluation` | 3 |
| "Lock the tech stack" | `@architect` / `stack-locking` | 3 |
| "Provision the dev environment" | `@developer` / `env-provision` | 3 |
| "Create the PRD" | `@pm` / `create-prd` | 4 |
| "Author the architecture" | `@architect` / `architecture-design` | 6 |
| "Break into stories" | `@pm` / `story-slice` → `story-graph` → `coldpress waves` | 7 |
| "Dev this story" | `@developer` (plan mode) | 8 |
| "Verify this story" | `@verifier` (clean-room, Butler-dispatched) | 8 |
| "Check deployment readiness" | `@devops` / `readiness` | 9 |

---

## Minute 8-10: Install Anthropic companion skills (one-time)

Coldpress-os's subagents delegate to Anthropic's first-party Agent Skills where they overlap (document generation, MCP server scaffolding, webapp testing, skill creation). Install the two Anthropic marketplace plugins inside Claude Code:

```
/plugin install document-skills@anthropic-agent-skills    # DOCX / PDF / PPTX / XLSX (forkable creative/export skills)
/plugin install example-skills@anthropic-agent-skills     # webapp-testing (@verifier) / mcp-builder (@architect)
```

See [`docs/anthropic-skill-wrapping-audit.md`](anthropic-skill-wrapping-audit.md) for the full delegation table and licence hygiene notes.

---

## What's next

- Read the [Example Walkthrough](example-walkthrough.md) to see a full 11-phase Shape A project (TaskPulse) play out end-to-end.
- Keep [Troubleshooting & FAQ](troubleshooting.md) open in a tab when you hit something weird.
- Browse [`coldpress-os/lifecycle/`](../lifecycle/) to see which skills live in each phase.
- When ready to upgrade:
  ```bash
  npm update -g @coldpress/core   # get the latest release
  coldpress update                 # regenerate interop outputs in your project
  ```

Using the Agent SDK instead of Claude Code CLI? Point `@anthropic-ai/claude-agent-sdk` at your project — the `.claude/` tree loads unchanged. See `test/agent-sdk-compat.test.ts` in the framework repo for the compatibility smoke test.
