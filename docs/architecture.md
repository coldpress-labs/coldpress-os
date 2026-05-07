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
    ├── Manages: state in coldpress.yaml, _context/ artifacts
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

### Warm Handoff (Phase 2)

Phase 2 Discovery uses a **warm-handoff** pattern: rather than asking the user to re-state what Phase 1 intake already captured, Butler passes `_context/sacred/context.md` (status: seed), `.coldpress/local-config.yaml`, and the graph to @analyst as pre-read context. The analyst confirms the seed intent rather than starting from scratch. This is implemented via `src/orchestration/condition-reader.ts` (reads local-config) + `src/graph/staleness.ts` (validates graph freshness before handoff).

### Phase 3 — The Commit-Point

Phase 3 Tech Stack is the **commit-point** of the build. Phase 3 begins with a rich evidence packet from Phase 2 (personas, constraint-research, idea-validation, product-brief, graph) and uses it to shortlist + evaluate + lock the tech stack. Three structural elements make Phase 3 the commit-point rather than just "pick a stack":

1. **`coldpress update --post-phase-3` exit hook** — runs manually between stack-lock and env-provision. Regenerates stack-specific skill wrappers. The `post_phase_3_update_ran: true` flag in local-config gates env-provision start. Implemented in `src/commands/update.ts` (`runPostPhase3`).
2. **Two-stage gate** — Stage 1 verifies all ADRs + sacred doc + baselines at lock time; Stage 2 verifies env-provision completion separately. The split lets Phase 3 lock cleanly and provision independently.
3. **Pack branching** — `stack_pack` written at lock time determines whether env-provision dispatches to an archetype quickstart skill or the generic install path.

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
Output artifact         ← "_context/sacred/prd.md"
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
| `template/.claude/agents/` | Real subagent definitions (9 files) | Framework |
| `skills/` | Atomic skill definitions with step-files | Framework |
| `orchestrator/` | Parallelization engine specs and strategies | Framework |
| `governance/` | Sacred doc protection and change workflows | Framework |
| `data/` | Portable knowledge assets (CSV/YAML) | Framework |
| `templates/` | Document and infrastructure templates | Framework |
| `install/archetypes/` | Document archetypes referenced by template-builder meta skill | Framework |
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
| Sprint tracking | `_context/tracking/` | YAML/Markdown |
| Handoff artifacts | `_context/handoffs/` | Markdown |
| Audit artifacts | `_context/audit/` | Markdown |
| Input material | `_input/{raw,legacy,reference,vendor}/` | Mixed |
| Runtime state | `.coldpress/{graph,cache}/` | SQLite + JSONL (git-ignored) |
| Credential shape | `secure/manifest.yaml` | YAML (values in `secure/.env*`, git-ignored) |

`_context/audit/` is the backward-looking filing cabinet: retrospectives, code reviews, security scans, deployment-readiness reports. Content here reflects on work already done, distinct from `_context/planning/` (forward-looking specs) and `_context/tracking/` (in-flight state).

`_input/` holds material fed *into* the project — raw source docs (`raw/`), archived prior versions (`legacy/`), cross-project references (`reference/`), vendored third-party assets (`vendor/`), and binary assets like brand imagery, screenshots, or design exports (`assets/`). Distinct from `_context/`, which holds material produced *by* the project.

`.coldpress/` is machine-local runtime state — the Graphify index (Wave 3), tool caches, and any scratch files Butler materialises during a session. Git-ignored wholesale; lifetime = the working copy. Subfolders (`graph/`, `cache/`) are created lazily on first use, not pre-stubbed in the template.

`secure/manifest.yaml` declares expected credentials by name. Actual values live in `secure/.env*` (git-ignored). See `docs/secure-pattern.md` for the loader pattern and the pre-commit scan installed from `scripts/check-secrets.sh`.

---

## 7. Extension Points

### Stack Packs
Add `skills/stack-packs/{pack-name}/` with skills following the skill schema.

### New Subagents
Add to `template/.claude/agents/{name}.md` following Claude Code subagent format. Update `agents/_schema.md`, `data/agents/agent-roster.csv`, and `REGISTRY.md`.

### New Skills
Add `skills/{category}/{skill-name}/` following the skill schema. Update `data/agents/skill-catalog.csv`.

### New Lifecycle Sub-phases
Add subdirectories to existing `lifecycle/{N}-{phase}/` directories.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 6.0 | 2026-04-24 | Cadbury-hq | Phase II Part 3 Wave 5.3. Added "Phase 3 — The Commit-Point" subsection under Dispatch Protocol: exit-hook wiring (update.ts runPostPhase3 + local-config flag), two-stage gate rationale, pack-branching at env-provision. |
| 5.0 | 2026-04-24 | Cadbury-hq | Phase II Part 2 Wave 5.4. Added "Warm Handoff (Phase 2)" subsection under Dispatch Protocol — documents the warm-handoff orchestration pattern: seed context.md + local-config.yaml + graph passed to @analyst as pre-read, implemented via condition-reader + staleness check. |
| 4.0 | 2026-04-24 | Cadbury-hq | Phase II Part 1 Wave 5.1b. Directory-role row updated: `install/` → `install/archetypes/` (the project-scaffolding skill under `install/` was retired in Wave 4.4; `archetypes/` is what remains). |
| 3.0 | 2026-04-14 | Alfred | Removed MAO acronym from section heading. |
| 2.0 | 2026-04-13 | Alfred | Added multi-agent orchestration section (dispatch protocol, 9 subagents, mode config). Updated info flow for Butler dispatch model. Updated directory roles. Added handoff artifacts to state management. |
| 1.0 | 2026-04-07 | Alfred | Initial architecture document — consumption model, info flow, directory roles |
