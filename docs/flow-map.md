# Flow Map — coldpress-os

> Visual mapping: Phases → Skills → Subagents → Outputs.
> Single pipeline. 8 subagents (Shape A v0.3.0-alpha). Unified orchestration.

> **Hello Butler.** Butler (the main orchestrator, see [`butler.md`](butler.md)) walks this map at dispatch time — invoking the right skill at the right phase and handing off to subagents via the Agent tool.

---

## Phase 1: Bootstrap

```
Pre-session (CLI):
  coldpress doctor ──────► Environment verified (Node 22+, git 2.30+, Claude Code)
  coldpress init   ──────► Project scaffolded: coldpress.yaml + .claude/ + template tree
                           + plugin/skills/ (auto-enabled by .claude/settings.json) + AGENTS.md + git init + pre-commit hook

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

## Phase 4: Planning *(PRD-only post-split under Shape A)*

```
planning-entry-sync ────► graph-first read of Phase 2+3 outputs
  Subagent: @pm

create-prd ─────────────► prd.md [SACRED] + prd.meta.json sidecar
  Subagent: @pm
  Template: authoring/documents/prd.md

validate-prd ───────────► validation-report.md
  Subagent: @pm
  --sections=<list> flag enables section-scoped re-validation
  for amendments (used when Phase 5 design-deltas surface)

legacy-assessment ──────► legacy-migration-plan-v{N}.md (brownfield only)
  Subagent: @architect
```

**On-demand subagents:**
- `@analyst` (creative mode — problem-solving, storytelling, innovation-strategy)
- forkable creative/export skills (pitch narratives, stakeholder decks; docx/pdf/pptx/xlsx exports) — no dedicated subagent

**Gate:** PRD validated → sacred. UX-design and architecture now belong to Phase 5 (Design) and Phase 6 (Architecture) respectively under Shape A.

---

## Phase 5: Design *(NEW under Shape A)*

```
design-brief ────────────► design-brief-v{N}.md
  Subagent: @ux-designer
  Output: _context/design/design-brief-v{N}.md

ux-design ──────────────► ux-design-spec.md
  Subagent: @ux-designer
  Steps: IA → flows → wireframes → spec
  Output: _context/design/ux-design-spec.md (validated distillate, not sacred)

brand-guidelines ───────► brand-guidelines-v{N}.md
  Subagent: @ux-designer
  Output: _context/design/brand-guidelines-v{N}.md

prototype ──────────────► prototype scaffold (archetype-shaped)
  Subagent: @ux-designer

narrative ──────────────► narrative wrapper around skills/creative/storytelling
  Subagent: @ux-designer

legacy-ui-assessment ───► legacy UI inventory (brownfield only, conditional)
  Subagent: @ux-designer
```

**Gate:** UX spec + brand guidelines authored. Design-deltas reconciled (4 options: accept_into_prd / reject / flag_for_architecture_ADR / park_for_phase_11). Design-deltas flagged `flag_for_architecture_ADR` carry to Phase 6 as REQUIRED ADRs.

---

## Phase 6: Architecture *(NEW under Shape A)*

```
architecture-design ────► architecture.md [SACRED]
  Subagent: @architect
  Step 01 (CRITICAL): flagged-deltas-intake — reads architecture_adrs_required[]
                      from phase-5 handoff; silent-divergence guard.
  Steps 2–4: overview / data-flow / NFR
  Step 5: ADRs (incl. REQUIRED ADRs for flagged deltas)
  Step 6: emit (MANDATORY: Component Interaction Diagram (Mermaid) +
          Failure Mode Enumeration table)
  Output: _context/sacred/architecture.md + architecture.meta.json sidecar

diagram-creator ────────► supporting Mermaid diagrams (on-demand)
  Subagent: @architect
```

**Gate:** Architecture sacred + every Phase 5 `flag_for_architecture_ADR` delta has a corresponding ADR. Silent-divergence-guard: cannot exit Phase 6 with unresolved P5 flagged deltas.

---

## Phase 7: Breakdown *(cascade rename — was old Phase 5)*

```
create-epics ───────────► epics/ directory
  Subagent: @pm
  Template: authoring/documents/epic.md

create-stories ─────────► stories within epics
  Subagent: @pm
  Template: authoring/documents/story.md

story-slice ────────────► story-graph.yaml
  Subagent: @pm
  Story graph: story nodes + dependency edges (not sacred)

[user runs: coldpress waves]
  Computes wave grouping + critical path + schedule from story-graph.yaml

implementation-readiness ► readiness-report.md
  Subagent: @verifier (clean-room, read-only)
  Cross-checks all planning artifacts
```

**Gate:** Story graph authored. Implementation readiness passed.

---

## Phase 8: Implementation *(cascade rename — was old Phase 6)*

```
dev-story ──────────────► Implemented code + tests
  Subagent: @developer (standard mode — TDD, full ceremony)

quick-dev ──────────────► Rapid implementation
  Subagent: @developer (quick mode — lean spec, minimal ceremony)

code-review ────────────► review-report.md
  Multiple perspectives (skill-driven, no single agent)

qa-automation ──────────► automated tests
  Subagent: @verifier (clean-room, read-only)

test-design ────────────► test-plan.md
  Subagent: @verifier (clean-room, read-only)

test-framework ─────────► test scaffold
  Subagent: @verifier (clean-room, read-only)

wave-orchestration ─────► Wave execution tracking
  Butler orchestrates parallel waves from the coldpress waves schedule
```

**Gate per wave:** All stories in wave complete, reviewed, tested → advance to next wave

---

## Phase 9: Deployment *(cascade rename — was old Phase 7)*

```
readiness-check ────────► deployment-readiness.md
  Subagent: @devops (meta-aggregator)
env-check ──────────────► env-validation.md
dep-health-check ───────► dependency-report.md
dependency-auditor ─────► dep license / CVE / supply-chain audit
security-scan ──────────► security-report.md
secrets-vault-manager ──► secrets posture report
observability-designer ─► observability plan + config
db-migration-check ─────► migration-validation.md
deploy ─────────────────► Deployed application
  Subagent: @devops (ship-path mode)
```

**Gate:** All checks pass → deploy

---

## Phase 10: Operate *(cascade rename — was old Phase 8)*

```
sprint-status ──────────► sprint-status-v{N}.md
  Subagent: @devops (steady-state mode)
correct-course ─────────► course-correction-v{N}.md
  Subagent: @devops
incident-response ──────► incident-{slug}-{date}-postmortem.md
  Subagent: @devops
document-project ───────► docs maintenance (on-demand)
```

**Gate:** ops-deltas aggregated for Phase 11 handoff; sprint-status current; incidents have postmortems.

---

## Phase 11: Evolve *(FINAL — cascade rename + new owner @reviewer)*

```
retrospective ──────────► retrospective-v{N}.md
  Subagent: @reviewer
  Step 0: ops-deltas reconciliation (4-option resolution)

product-evolution ──────► product-evolution-backlog-v{N}.md
  Subagent: @reviewer

innovation-strategy ────► innovation-strategy-v{N}.md
  Subagent: @reviewer
```

**Gate:** Phase 11 is final. Closure copies outputs to `_input/prior-iteration/` for next-iteration Phase 1.

---

## Subagent Summary by Phase (Shape A 11-phase)

| Phase | Primary Subagents | On-Demand |
|-------|------------------|-----------|
| 1 — Bootstrap | butler | — |
| 2 — Discovery | @analyst | @ux-designer (personas) |
| 3 — Tech Stack | @architect | @developer (env-provision); brainstorming + innovation-strategy creative routers |
| 4 — Planning | @pm | @analyst; forkable creative/export skills |
| 5 — **Design** | @ux-designer | forkable creative skills (narrative) |
| 6 — **Architecture** | @architect | — |
| 7 — Breakdown | @pm | @verifier |
| 8 — Implementation | @developer, @verifier | — |
| 9 — Deployment | @devops | @verifier |
| 10 — Operate | @devops | document-project (skill) |
| 11 — Evolve | @reviewer | @analyst; forkable creative/export skills |

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 8.0 | 2026-04-24 | ColdPress Labs | Phase II Part 3 Wave 5.3. Phase 3 section fully rewritten: warm-handoff note added; 4-skill complete flow with stack-discovery-sync (new), per-decision stack-evaluation (T1/T2/T3 tiered), stack-locking (two-output: sacred + distillate + pack + baselines), post-Phase-3 CLI step, env-provision (pack-branched + baselines activation). Subagent summary row 3 updated with @architect/@developer split and on-demand creative routers. Gate note updated to two-stage (10 + 3). |
| 7.0 | 2026-04-24 | ColdPress Labs | Phase II Part 2 Wave 5.4. Phase 2 section fully rewritten: warm-handoff note added; 8-skill complete flow (pre-project-interview → parallel research lane [domain + market + constraint + personas] → validate-idea → synthesize-research → product-brief); @ux-designer added for personas; constraint-research clarified as analyst-only (not @architect); product-brief annotated as validated distillate (not sacred); gate updated to 7-check summary (4 block + 3 warn). |
| 6.0 | 2026-04-24 | ColdPress Labs | Phase II Part 1 Wave 5.1b. Phase 1 section rewritten for the npm-era CLI / in-session split: `coldpress doctor` + `coldpress init` (pre-session) replace the retired `machine-setup` + `project-init` + `agent-scaffold` trio; Butler's new `orient` + `intake` lifecycle skills drive in-session Phase 1. Gate reference points at `lifecycle/1-bootstrap/gate.json` (6 acceptance checks). |
| 5.0 | 2026-04-23 | ColdPress Labs | 9-phase lifecycle — Phase 8 split into Operate + Evolve per Wave 4 §4.11. Phase 8 section rewritten (in-flight operational work); new Phase 9 section added (post-release learning). Subagent summary table extended to 9 rows. |
| 4.0 | 2026-04-14 | ColdPress Labs | Removed BMAD/MAO references. Renamed mao-scaffold → agent-scaffold. |
| 3.0 | 2026-04-13 | ColdPress Labs | Rewritten for 9-subagent system. Single pipeline. Added subagent summary table. |
| 2.0 | 2026-04-08 | ColdPress Labs | Updated all agent names to new naming convention |
| 1.0 | 2026-04-07 | ColdPress Labs | Initial flow map — all 8 phases with agent/skill/output mapping |
