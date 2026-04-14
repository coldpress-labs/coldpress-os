# Architecture — coldpress-os

> How coldpress-os itself works. Internal reference for framework contributors and Alfred.

---

## 1. Design Philosophy

coldpress-os is an **AI-native development framework**. It is not a CLI tool, not a build system, not a package manager. It is a structured knowledge base that AI agents (primarily Claude Code) navigate to drive software development.

### Core Principles

1. **Single format** — One schema for subagents, one for skills, one for workflows
2. **Lifecycle-organized** — Content organized by *when* you need it, not by source module
3. **Skills are atomic** — Self-contained units with step-files and references inside
4. **Stack packs are pluggable** — Swap technology stacks without changing the framework
5. **One registry** — REGISTRY.md generated from directory structure + frontmatter
6. **Read-only framework** — Projects consume via submodule, override via `.claude/`
7. **Feedback flows upstream** — Projects propose changes via Issues/PRs
8. **Real subagents** — 9 independent Claude Code agents with their own context windows, not prompt-persona costume changes

---

## 2. Consumption Model

```
┌─────────────────────────────────────────────┐
│  Project (devSandbox)                        │
│                                              │
│  coldpress-os/  ◄── git submodule (pinned)  │
│       │                                      │
│  .claude/agents/ ──► 9 subagent definitions │
│       │                                      │
│  .claude/skills/ ──► thin wrappers ──────┐  │
│       │                                  │  │
│  coldpress.yaml ──► project config       │  │
│       │                                  │  │
│  Claude Code reads .claude/ ─────────────┘  │
│       │                                      │
│  Skill wrapper says "read coldpress-os/..." │
│       │                                      │
│  Claude loads the actual skill from submod  │
└─────────────────────────────────────────────┘
```

### Why Thin Wrappers?

Claude Code discovers skills from `.claude/skills/`. Rather than duplicating 65+ skill definitions, each wrapper is 3 lines pointing to the canonical source inside the submodule.

### Why Real Subagents?

Each subagent in `.claude/agents/` runs with its own context window, tools, and model. This means:
- **@architect** uses opus for deep reasoning without loading implementation code context
- **@scrum-master** uses haiku for organizational work without paying for expensive reasoning
- **@developer** gets a 50-turn limit for complex implementations
- Subagents cannot accidentally read or modify files outside their tool permissions

---

## 3. Multi-Agent Orchestration

```
Butler (main Claude Code session)
    │
    ├── Reads: CLAUDE.md, .claude/SYSTEM.md, coldpress.yaml
    │
    ├── Dispatches: .claude/agents/{slug}.md
    │   Each subagent gets its own context window
    │   Reads: coldpress.yaml, relevant docs, skill content
    │   Returns: final message only (results, not internal reasoning)
    │
    ├── Manages: state in coldpress.yaml, _output/ artifacts
    │
    └── Routes handoffs:
        @analyst produces context.md → Butler routes to @pm
        @pm produces prd.md → Butler routes to @architect + @ux-designer
        @scrum-master breaks into waves → Butler dispatches @developer per story
```

### Dispatch Protocol

1. User requests work (or Butler determines next lifecycle step)
2. Butler reads `coldpress.yaml` for agent mode config
3. Butler constructs a **task prompt** containing:
   - The user's request or lifecycle context
   - Relevant file paths (sacred docs, prior artifacts)
   - Mode to operate in (e.g., `developer: quick`, `qa: strategic`)
   - Prior decisions and constraints
4. Subagent executes independently
5. Subagent returns results to Butler
6. Butler synthesizes and presents to user
7. If subagent recommends handoff to another agent, Butler routes it

### The Nine Subagents

| Slug | Model | Tools | Role |
|------|-------|-------|------|
| `analyst` | sonnet | Read, Grep, Glob, Bash, WebSearch, WebFetch | Discovery, research, briefs, creative ideation |
| `pm` | sonnet | Read, Grep, Glob, Bash, Edit, Write | PRD lifecycle, product decisions, epics |
| `ux-designer` | sonnet | Read, Grep, Glob, Bash, Edit, Write | UX specs, design systems, scenarios |
| `architect` | opus | Read, Grep, Glob, Bash | Architecture, tech stack, ADRs |
| `developer` | sonnet | Read, Grep, Glob, Bash, Edit, Write | Implementation (standard + quick) |
| `qa` | sonnet | Read, Grep, Glob, Bash, Edit, Write | Testing (rapid + strategic) |
| `scrum-master` | haiku | Read, Grep, Glob | Sprint planning, PERT, retrospectives |
| `communicator` | sonnet | Read, Grep, Glob, Write | Docs, narratives, presentations |
| `valet` | sonnet | Read, Grep, Glob, Edit, Write, Bash | Framework evolution, meta skills |

### Mode Configuration

Subagent modes are configured in `coldpress.yaml` and passed by Butler in the task prompt:

```yaml
agents:
  analyst:
    mode: full          # full | brief | creative | strategic
  developer:
    mode: standard      # standard | quick
  qa:
    depth: rapid        # rapid | strategic
  ux-designer:
    mode: standard      # standard | full-spec
```

---

## 4. Information Flow

```
coldpress.yaml          ← Project config (user edits)
    │
    ▼
Lifecycle Phase         ← "I'm in Phase 4"
    │
    ▼
Skills (within phase)   ← "Run create-prd"
    │
    ▼
Butler dispatches       ← "@pm — create PRD from product-brief"
    │
    ▼
Subagent (@pm)          ← Independent context, reads prd template
    │
    ▼
Step-files              ← "Step 1: Executive summary"
    │
    ▼
Data assets             ← "Load elicitation methods CSV"
    │
    ▼
Templates               ← "Use PRD template"
    │
    ▼
Output artifact         ← "_output/planning/prd.md"
    │
    ▼
Butler receives result  ← Presents to user, routes handoff
```

---

## 5. Directory Roles

| Directory | Role | Mutability |
|-----------|------|-----------|
| `lifecycle/` | Phase organization — contains phase-level READMEs, skills, and routing | Framework |
| `agents/` | Legacy agent persona archive + schema documentation | Framework |
| `install/project-template/.claude/agents/` | Real subagent definitions (9 files) | Framework |
| `skills/` | Atomic skill definitions with step-files | Framework |
| `orchestrator/` | Parallelization engine specs and strategies | Framework |
| `governance/` | Sacred doc protection and change workflows | Framework |
| `data/` | Portable knowledge assets (CSV/YAML) | Framework |
| `templates/` | Document and infrastructure templates | Framework |
| `install/` | Project scaffolding skills + project template | Framework |
| `docs/` | Internal framework documentation | Framework |

---

## 6. State Management

coldpress-os is **stateless**. All state lives in the consuming project:

| State | Stored In | Format |
|-------|-----------|--------|
| Project identity | `coldpress.yaml` | YAML |
| Agent mode config | `coldpress.yaml` | YAML |
| Workflow progress | Output document frontmatter | YAML |
| Sacred doc versions | Document version control panels | Markdown table |
| Sprint tracking | `_output/tracking/` | YAML/Markdown |
| Handoff artifacts | `_output/handoffs/` | Markdown |

---

## 7. Extension Points

### Stack Packs
Add `skills/stack-packs/{pack-name}/` with skills following the skill schema.

### New Subagents
Add to `install/project-template/.claude/agents/{name}.md` following Claude Code subagent format. Update `agents/_schema.md`, `data/agents/agent-roster.csv`, and `REGISTRY.md`.

### New Skills
Add `skills/{category}/{skill-name}/` following the skill schema. Update `data/agents/skill-catalog.csv`.

### New Lifecycle Sub-phases
Add subdirectories to existing `lifecycle/{N}-{phase}/` directories.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0 | 2026-04-14 | Alfred | Removed MAO acronym from section heading. |
| 2.0 | 2026-04-13 | Alfred | Added multi-agent orchestration section (dispatch protocol, 9 subagents, mode config). Updated info flow for Butler dispatch model. Updated directory roles. Added handoff artifacts to state management. |
| 1.0 | 2026-04-07 | Alfred | Initial architecture document — consumption model, info flow, directory roles |
