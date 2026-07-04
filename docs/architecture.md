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
│  .claude/agents/ ──► 8 subagent definitions │
│       │                                      │
│  .claude/settings.json ──► auto-enables   │  │
│       │        the coldpress skill plugin │  │
│  coldpress.yaml ──► project config       │  │
│       │                                  │  │
│  Claude Code reads .claude/ ─────────────┘  │
│       │                                      │
│  The plugin ships the full skill library ── │
│       │        (plugin/skills/, bundled)    │
│  Claude loads skills from the plugin        │
└─────────────────────────────────────────────┘
```

### Why a Plugin (not thin wrappers)?

Claude Code discovers skills from enabled plugins. Rather than generating a per-skill wrapper into every project (the pre-v0.4 model), coldpress ships the full skill library as a self-contained Claude Code **plugin** (`plugin/skills/`, each skill bundled with its `steps/`), and the scaffolded `.claude/settings.json` auto-enables it via a local directory marketplace. One artefact, no wrapper generation, validated with `claude plugin validate`.

### Why Real Subagents?

Each subagent in `.claude/agents/` runs with its own context window, tools, and model. This means:
- **@architect** uses opus for deep reasoning without loading implementation code context
- **@verifier** runs clean-room — Butler dispatches it with the spec + acceptance + diff, never the developer's reasoning, so verification is structurally independent
- **@developer** works one story at a time in plan mode within its packet boundary
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
        @pm slices the story graph → `coldpress waves` computes the schedule → Butler dispatches @developer per story → @verifier confirms clean-room
```

### Dispatch Protocol

1. User requests work (or Butler determines next lifecycle step)
2. Butler reads `coldpress.yaml` for agent mode config
3. Butler constructs a **task prompt** containing:
   - The user's request or lifecycle context
   - Relevant file paths (sacred docs, prior artifacts)
   - Mode to operate in (e.g., `developer: quick`)
   - Prior decisions and constraints
4. Subagent executes independently
5. Subagent returns results to Butler
6. Butler synthesizes and presents to user
7. If subagent recommends handoff to another agent, Butler routes it

### Warm Handoff (Phase 2)

Phase 2 Discovery uses a **warm-handoff** pattern: rather than asking the user to re-state what Phase 1 intake already captured, Butler passes `_context/sacred/context.md` (status: authored by Phase 1 exit), `.coldpress/local-config.yaml`, and the trace context to @analyst as pre-read context. The analyst confirms the seed intent rather than starting from scratch. (The retired Graphify staleness checker is gone — the trace graph is derived in-memory on each `coldpress trace` call, so there is no persistent index to validate.)

### Phase 3 — The Commit-Point

Phase 3 Tech Stack is the **commit-point** of the build. Phase 3 begins with a rich evidence packet from Phase 2 (personas, constraint-research, idea-validation, product-brief, graph) and uses it to shortlist + evaluate + lock the tech stack. Three structural elements make Phase 3 the commit-point rather than just "pick a stack":

1. **Deploy-pack selection** — `deploy-select` at stack-lock binds a `deploy_pack` to the locked `stack_pack` (compatibility matrix ∩ locked stack), so "where it ships" is decided at the same commit-point as "what it's built with".
2. **Two-stage gate** — Stage 1 verifies all ADRs + sacred doc + baselines at lock time; Stage 2 verifies env-provision completion separately. The split lets Phase 3 lock cleanly and provision independently.
3. **Pack branching** — `stack_pack` written at lock time determines whether env-provision dispatches to the pack's quickstart skill or the generic install path.

### The 8 Subagents

| Slug | Model | Tools | Role |
|------|-------|-------|------|
| `analyst` | sonnet | Read, Grep, Glob, Bash, WebSearch, WebFetch | Discovery, research, personas, idea validation, product brief |
| `architect` | opus | Read, Grep, Glob, Bash | Stack + deploy lock, walking skeleton; sacred architecture + ADRs |
| `pm` | sonnet | Read, Grep, Glob, Bash, Edit, Write | PRD lifecycle; story-graph breakdown + estimates |
| `ux-designer` | sonnet | Read, Grep, Glob, Bash, Edit, Write | tokens.json, styleguide + live route, ux-spec, budgets |
| `developer` | sonnet | Read, Grep, Glob, Bash, Edit, Write | Implementation in plan mode within the packet boundary |
| `verifier` | sonnet | Read, Grep, Glob, Bash | **Clean-room** verification vs spec + tokens — Butler-dispatched only, read-only (cannot edit code) |
| `devops` | sonnet | Read, Grep, Glob, Bash, Edit, Write | Readiness + deploy packs (P9); steady-state ops (P10) |
| `reviewer` | opus | Read, Grep, Glob | Evidence-linked retrospective (cites run-log event IDs) (P11) |

Butler is the main Claude Code session (not a file), and dispatches these 8. The pre-v0.4 `@qa` / `@scrum-master` / `@communicator` / `@valet` were removed — see the roster-surgery note in the README.

### Mode Configuration

Subagent modes are configured in `coldpress.yaml` and passed by Butler in the task prompt:

```yaml
agents:
  analyst:
    mode: full          # full | brief | creative | strategic
  developer:
    mode: standard      # standard | quick
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
| `agents/` | Subagent schema + generated roster (`data/agents/agent-roster.csv`) | Framework |
| `template/.claude/agents/` | Real subagent definitions (8 files) | Framework |
| `skills/` | Atomic skill definitions with step-files | Framework |
| `plugin/` | Generated Claude Code plugin (the skill-distribution vehicle) | Generated |
| `governance/` | Sacred doc protection and change workflows | Framework |
| `data/` | Portable knowledge assets (CSV/YAML method playbook, profiles, deploy packs, failure taxonomy) | Framework |
| `authoring/` | Document and infrastructure templates | Framework |
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
| Runtime state | `.coldpress/{runs,cache}/` | JSONL EventStream run-logs (git-ignored) |
| Credential shape | `secure/manifest.yaml` | YAML (values in `secure/.env*`, git-ignored) |

`_context/audit/` is the backward-looking filing cabinet: retrospectives, code reviews, security scans, deployment-readiness reports. Content here reflects on work already done, distinct from `_context/planning/` (forward-looking specs) and `_context/tracking/` (in-flight state).

`_input/` holds material fed *into* the project — raw source docs (`raw/`), archived prior versions (`legacy/`), cross-project references (`reference/`), vendored third-party assets (`vendor/`), and binary assets like brand imagery, screenshots, or design exports (`assets/`). Distinct from `_context/`, which holds material produced *by* the project.

`.coldpress/` is machine-local runtime state — the EventStream run-logs (`runs/<run>/events.jsonl`), tool caches, and any scratch files Butler materialises during a session. Git-ignored wholesale; lifetime = the working copy. Subfolders are created lazily on first use, not pre-stubbed in the template.

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
| 7.0 | 2026-07-04 | Butler (v0.4 post-audit F2) | Public-accuracy pass: purged pre-v0.4 drift. `.claude/skills/` thin wrappers → the auto-enabled Claude Code **plugin**; "The Nine Subagents" → **the 8 subagents** (qa→verifier; scrum-master/communicator/valet removed); orchestration + Phase-3 examples rewritten (story-graph + `coldpress waves` + clean-room `@verifier`; deploy-select commit-point; retired the post-phase-3 wrapper regen); warm-handoff no longer cites the deleted `staleness.ts`; Directory-Roles + State-Management corrected (`orchestrator/` and `install/archetypes/` removed, `plugin/` added, Graphify index → EventStream run-logs / native `coldpress trace`). Historical VC rows below left as-is. |
| 6.0 | 2026-04-24 | ColdPress Labs | Phase II Part 3 Wave 5.3. Added "Phase 3 — The Commit-Point" subsection under Dispatch Protocol: exit-hook wiring (update.ts runPostPhase3 + local-config flag), two-stage gate rationale, pack-branching at env-provision. |
| 5.0 | 2026-04-24 | ColdPress Labs | Phase II Part 2 Wave 5.4. Added "Warm Handoff (Phase 2)" subsection under Dispatch Protocol — documents the warm-handoff orchestration pattern: seed context.md + local-config.yaml + graph passed to @analyst as pre-read, implemented via condition-reader + staleness check. |
| 4.0 | 2026-04-24 | ColdPress Labs | Phase II Part 1 Wave 5.1b. Directory-role row updated: `install/` → `install/archetypes/` (the project-scaffolding skill under `install/` was retired in Wave 4.4; `archetypes/` is what remains). |
| 3.0 | 2026-04-14 | ColdPress Labs | Removed MAO acronym from section heading. |
| 2.0 | 2026-04-13 | ColdPress Labs | Added multi-agent orchestration section (dispatch protocol, 9 subagents, mode config). Updated info flow for Butler dispatch model. Updated directory roles. Added handoff artifacts to state management. |
| 1.0 | 2026-04-07 | ColdPress Labs | Initial architecture document — consumption model, info flow, directory roles |
