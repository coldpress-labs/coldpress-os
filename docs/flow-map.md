# Flow Map — coldpress-os

> Visual mapping: Phases → Skills → Subagents → Outputs.
> Single pipeline. 9 subagents. Unified orchestration.

---

## Phase 1: Bootstrap

```
Pre-session (CLI):
  coldpress doctor ──────► Environment verified (Node 20+, git 2.30+, Claude Code)
  coldpress init   ──────► Project scaffolded: coldpress.yaml + .claude/ + template tree
                           + .claude/skills/ wrappers + AGENTS.md + git init + pre-commit hook

In-session (Butler):
  orient ─────────────────► Scaffold health report + lifecycle intro
  intake ─────────────────► _input/ walked, project_shape determined,
                           _context/sacred/context.md seeded (one-sentence intent),
                           working-mode written to coldpress.yaml, graph primed
```

**Subagents:** None (Butler runs orient + intake directly)
**Gate:** `lifecycle/1-bootstrap/gate.json` — 6 acceptance checks (see phase README)

---

## Phase 2: Discovery

```
Warm-handoff: reads Phase 1 intake outputs (context.md seed +
local-config.yaml + graph.json) — no re-asking what intake captured.

pre-project-interview ──► _context/sacred/context.md [SACRED]  (seed → authored)
  Subagent: @analyst (discovery mode)
  Data: elicitation-methods.csv (50 methods)
  Supersede-check fires if user answers contradict _input/ material

(parallel research lane:)
domain-research ────────► _context/planning/research/domain-research-{date}.md
  Subagent: @analyst (discovery mode)

market-research ────────► _context/planning/research/market-research-{date}.md
  Subagent: @analyst (discovery mode)

constraint-research ────► _context/planning/research/constraint-{topic}-{date}.md
  Subagent: @analyst (discovery mode)
  (compliance + protocols + performance envelopes + accessibility — NOT tech comparison)

personas ───────────────► _context/planning/personas-{date}.md
  Subagent: @ux-designer
  Tier 1: User Interviews, Empathy Mapping, JTBD, Journey Mapping

(sequential, after research:)
validate-idea ──────────► _context/planning/idea-validation-v1.md
  Subagent: @analyst
  Warn-severity — solo vibe-coder may skip; team + client must run

synthesize-research ────► _context/planning/research-synthesis-v1.md
  Subagent: @analyst
  Wires: distillator + adversarial-review + editorial-structure

product-brief ──────────► _context/planning/product-brief-v1.md
  Subagent: @analyst
  Validated distillate — NOT sacred; versioned + regeneratable
```

**Subagents:** @analyst (primary), @ux-designer (personas)
**Gate:** `lifecycle/2-discovery/gate.json` — 7 checks (4 block + 3 warn)
  Block: context.md authored + user sign-off + synthesis exists + product-brief authored
  Warn: idea-validation exists + graph fresh + supersessions log if applicable

---

## Phase 3: Tech Stack

```
Warm-handoff: reads Phase 2 outputs (product-brief, idea-validation, personas,
constraint-research, research-synthesis, graph) — no re-asking what Phase 2 captured.

stack-discovery-sync ──►  _context/planning/stack-shortlist-v{N}.md
  Subagent: @architect
  Consolidates Phase 2 evidence → archetype classification → pack-match scoring
  → tiered shortlist (T1 pack pre-pick / T2 catalog / T3 independent) per area.

(per-decision-area loop:)
stack-evaluation ───────►  _context/planning/adrs/adr-{area}-v{N}.md
  Subagent: @architect
  T1: fast-path confirm → brief ADR
  T2: 6-dim rubric walk with pre-loaded catalog (data/stack-catalog/{area}.yaml)
  T3: graph-query + web-search + broader universe

stack-locking ──────────►  _context/sacred/tech-stack.md [SACRED]
  Subagent: @architect                        _context/planning/adrs/ (sealed)
  ADR inventory + product-type-aware check    _context/planning/stack-selection-summary-v{N}.md
  + Step 3a red-flag escape hatch             coldpress.yaml stack_pack field
  + Step 5a baselines confirmation            coldpress.yaml baselines: block
  Validated distillate: stack-selection-summary

[user runs: coldpress update --post-phase-3]
  Regenerates stack-specific wrappers. Sets post_phase_3_update_ran: true.

env-provision ──────────►  Dev environment configured + baselines activated
  Subagent: @developer
  Branch: stack_pack non-empty → pack quickstart skill
           stack_pack empty    → generic runtime-install
  Step 3: baselines activation loop (per confirmed category)
```

**Subagents:** @architect (discovery / evaluation / locking), @developer (env-provision)
**Gate:** Two-stage — Stage 1 (10 checks at stack-lock: sacred + ADRs + summary + pack + baselines); Stage 2 (3 checks post-provision: env-provisioned + post-phase-3-update-ran + graph-freshness)

---

## Phase 4: Planning

```
product-brief ──────────► product-brief.md + trigger-map.md
  Subagent: @analyst (brief mode)

create-prd ─────────────► prd.md [SACRED]
  Subagent: @pm
  Template: templates/documents/prd.md

validate-prd ───────────► validation-report.md
  Subagent: @pm

create-ux-design ───────► ux-design-spec.md
  Subagent: @ux-designer (standard or full-spec mode)
  Template: templates/documents/ux-design-spec.md

create-architecture ────► architecture.md [SACRED]
  Subagent: @architect
  Template: templates/documents/architecture.md

design-brief ───────────► design-brief.md
  Subagent: @ux-designer (full-spec mode)
  Bridge: imports product-brief, starts at content strategy
```

**On-demand subagents:**
- `@analyst` (creative mode — problem-solving, storytelling, innovation-strategy)
- `@communicator` (narrative mode — pitch narratives, presentation mode — stakeholder decks)

**Gate:** PRD validated, architecture complete → both become sacred

---

## Phase 5: Breakdown

```
create-epics ───────────► epics/ directory
  Subagent: @pm
  Support: @scrum-master
  Template: templates/documents/epic.md

create-stories ─────────► stories within epics
  Subagent: @pm
  Template: templates/documents/story.md

parallelization-strategy ► pert-chart.md [SACRED]
  Subagent: @scrum-master
  Orchestrator: DAG → topological sort → waves
  Template: templates/documents/pert-chart.md

sprint-planning ────────► sprint-plan.yaml
  Subagent: @scrum-master

implementation-readiness ► readiness-report.md
  Subagent: @qa
  Cross-checks all planning artifacts
```

**Gate:** PERT chart accepted → becomes sacred. Implementation readiness passed.

---

## Phase 6: Implementation

```
dev-story ──────────────► Implemented code + tests
  Subagent: @developer (standard mode — TDD, full ceremony)

quick-dev ──────────────► Rapid implementation
  Subagent: @developer (quick mode — lean spec, minimal ceremony)

code-review ────────────► review-report.md
  Multiple perspectives (skill-driven, no single agent)

qa-automation ──────────► automated tests
  Subagent: @qa (rapid mode)

test-design ────────────► test-plan.md
  Subagent: @qa (strategic mode)

test-framework ─────────► test scaffold
  Subagent: @qa (strategic mode)

wave-orchestration ─────► Wave execution tracking
  Subagent: @scrum-master
  Orchestrator: execute parallel waves from PERT
```

**Gate per wave:** All stories in wave complete, reviewed, tested → advance to next wave

---

## Phase 7: Deployment

```
readiness-check ────────► deployment-readiness.md
  Subagent: @qa
env-check ──────────────► env-validation.md
dep-health-check ───────► dependency-report.md
security-scan ──────────► security-report.md
db-migration-check ─────► migration-validation.md
deploy ─────────────────► Deployed application
  Subagent: @developer
```

**Gate:** All checks pass → deploy

---

## Subagent Summary by Phase

| Phase | Primary Subagents | On-Demand |
|-------|------------------|-----------|
| 1 — Bootstrap | (Butler) | — |
| 2 — Discovery | @analyst | @architect |
| 3 — Tech Stack | @architect (discovery/evaluation/locking) | @developer (env-provision); brainstorming + innovation-strategy (creative routers, on-demand) |
| 4 — Planning | @pm, @ux-designer, @architect | @analyst, @communicator |
| 5 — Breakdown | @pm, @scrum-master | @qa |
| 6 — Implementation | @developer, @qa | @scrum-master |
| 7 — Deployment | @qa, @developer | — |
| 8 — Operate | @scrum-master, @communicator | — |
| 9 — Evolve | @scrum-master, @pm | @analyst, @communicator |

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 8.0 | 2026-04-24 | Cadbury-hq | Phase II Part 3 Wave 5.3. Phase 3 section fully rewritten: warm-handoff note added; 4-skill complete flow with stack-discovery-sync (new), per-decision stack-evaluation (T1/T2/T3 tiered), stack-locking (two-output: sacred + distillate + pack + baselines), post-Phase-3 CLI step, env-provision (pack-branched + baselines activation). Subagent summary row 3 updated with @architect/@developer split and on-demand creative routers. Gate note updated to two-stage (10 + 3). |
| 7.0 | 2026-04-24 | Cadbury-hq | Phase II Part 2 Wave 5.4. Phase 2 section fully rewritten: warm-handoff note added; 8-skill complete flow (pre-project-interview → parallel research lane [domain + market + constraint + personas] → validate-idea → synthesize-research → product-brief); @ux-designer added for personas; constraint-research clarified as analyst-only (not @architect); product-brief annotated as validated distillate (not sacred); gate updated to 7-check summary (4 block + 3 warn). |
| 6.0 | 2026-04-24 | Cadbury-hq | Phase II Part 1 Wave 5.1b. Phase 1 section rewritten for the npm-era CLI / in-session split: `coldpress doctor` + `coldpress init` (pre-session) replace the retired `machine-setup` + `project-init` + `agent-scaffold` trio; Butler's new `orient` + `intake` lifecycle skills drive in-session Phase 1. Gate reference points at `lifecycle/1-bootstrap/gate.json` (6 acceptance checks). |
| 5.0 | 2026-04-23 | Cadbury-hq | 9-phase lifecycle — Phase 8 split into Operate + Evolve per Wave 4 §4.11. Phase 8 section rewritten (in-flight operational work); new Phase 9 section added (post-release learning). Subagent summary table extended to 9 rows. |
| 4.0 | 2026-04-14 | Alfred | Removed BMAD/MAO references. Renamed mao-scaffold → agent-scaffold. |
| 3.0 | 2026-04-13 | Alfred | Rewritten for 9-subagent system. Single pipeline. Added subagent summary table. |
| 2.0 | 2026-04-08 | Alfred | Updated all agent names to new naming convention |
| 1.0 | 2026-04-07 | Alfred | Initial flow map — all 8 phases with agent/skill/output mapping |
