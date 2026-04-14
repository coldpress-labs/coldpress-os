# Flow Map — coldpress-os

> Visual mapping: Phases → Skills → Subagents → Outputs.
> Single pipeline. 9 subagents. Unified orchestration.

---

## Phase 1: Bootstrap

```
project-init ──────────► Scaffolded project structure
agent-scaffold ────────► .claude/agents/ + .claude/skills/ generated
machine-setup ─────────► Dev environment ready
```

**Subagents:** None (Butler-driven, framework scaffolding)
**Gate:** Project structure verified, coldpress.yaml populated

---

## Phase 2: Discovery

```
pre-project-interview ──► context.md [SACRED]
  Subagent: @analyst (discovery mode)
  Data: elicitation-methods.csv (50 methods)

domain-research ────────► domain-research.md
  Subagent: @analyst (discovery mode)

market-research ────────► market-research.md
  Subagent: @analyst (discovery mode)

technical-research ─────► technical-research.md
  Subagent: @analyst (discovery mode)
  Support: @architect (technical feasibility questions)

brainstorming ──────────► brainstorming-output.md
  Subagent: @analyst (creative mode — brainstorming)
  Data: brainstorming-techniques.csv (60 techniques)

design-thinking ────────► design-thinking-output.md
  Subagent: @analyst (creative mode — design thinking)
  Data: design-thinking-methods.csv (29 methods)
```

**Gate:** context.md complete and accepted → becomes sacred

---

## Phase 3: Tech Stack

```
stack-evaluation ───────► evaluation-report.md + ADRs
  Subagent: @architect

stack-locking ──────────► tech-stack.md [SACRED]
  Subagent: @architect

vibe-coder-setup ───────► Dev environment configured
  Subagent: @developer
```

**Gate:** tech-stack.md locked → becomes sacred

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

## Phase 8: Evolve

```
retrospective ──────────► retrospective.md
  Subagent: @scrum-master

correct-course ─────────► course-correction.md
  Subagents: @scrum-master + @pm

product-evolution ──────► evolution-proposals.md
  Subagent: @pm
  On-demand: @analyst (creative mode — innovation-strategy)

sprint-status ──────────► sprint-status.yaml
  Subagent: @scrum-master

document-project ───────► project-documentation/
  Subagent: @communicator (documentation mode)
```

---

## Subagent Summary by Phase

| Phase | Primary Subagents | On-Demand |
|-------|------------------|-----------|
| 1 — Bootstrap | (Butler) | — |
| 2 — Discovery | @analyst | @architect |
| 3 — Tech Stack | @architect | @developer |
| 4 — Planning | @pm, @ux-designer, @architect | @analyst, @communicator |
| 5 — Breakdown | @pm, @scrum-master | @qa |
| 6 — Implementation | @developer, @qa | @scrum-master |
| 7 — Deployment | @qa, @developer | — |
| 8 — Evolve | @scrum-master, @pm | @analyst, @communicator |

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 4.0 | 2026-04-14 | Alfred | Removed BMAD/MAO references. Renamed mao-scaffold → agent-scaffold. |
| 3.0 | 2026-04-13 | Alfred | Rewritten for 9-subagent system. Single pipeline. Added subagent summary table. |
| 2.0 | 2026-04-08 | Alfred | Updated all agent names to new naming convention |
| 1.0 | 2026-04-07 | Alfred | Initial flow map — all 8 phases with agent/skill/output mapping |
