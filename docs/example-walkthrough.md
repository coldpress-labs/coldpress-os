# Example Walkthrough — Building "TaskPulse" with coldpress-os

> A complete lifecycle walkthrough showing how coldpress-os drives a project from idea to deployment under **Shape A (11 phases — v0.3.0-alpha)**. Follow along or use it as a reference for what each phase produces.

---

## The Project

**TaskPulse** — A lightweight task management app for solo creators. Tracks daily tasks, measures focus time, and surfaces weekly patterns.

- **Type:** web_app
- **Domain:** productivity / saas
- **Archetype:** Production
- **Pattern:** A (three-tier, see [`archetypes-guide.md`](archetypes-guide.md))
- **Stack pack:** `vibe-coder-fullstack` (auto-matched in Phase 3 stack-discovery-sync)

---

## Hello Butler — let's begin

Every session starts the same way. Open Claude Code in your project directory and type:

```
Hello Butler
```

Butler is your main agent — the orchestrator that routes your intent to the right skill, dispatches the 11 subagents when their expertise is needed, runs gates, and writes handoff artefacts. (See [`butler.md`](butler.md) for the full reference.)

On a fresh project Butler runs `orient` + `intake`. On a returning session it reads state and reports `where are we`. The rest of this walkthrough is just real exchanges with Butler across all 11 phases.

---

## Phase 1: Bootstrap

### What you do

```bash
cd ~/code
coldpress init taskpulse        # positional name skips the first prompt
cd taskpulse
claude                          # open Claude Code in the scaffolded project
```

Then in the Claude Code session:

```
Hello Butler
```

### What happens in the CLI (pre-session)

`coldpress init`:

1. Runs `coldpress doctor` (silent pre-flight) — verifies Node ≥ 22, git ≥ 2.30, Claude Code CLI.
2. Prompts for slug + user name (only the ones not provided as flags).
3. Copies the template tree (including 5 `_input/` subfolders: `assets/`, `vendor/`, `raw/`, `legacy/`, `reference/` — each with a README explaining purpose).
4. Copies the coldpress-os framework into `coldpress-os/`.
5. Generates ~128 `.claude/skills/` wrappers + interop outputs (AGENTS.md, Cursor, Roo, OpenHands, Cline).
6. Runs `git init` + initial commit (with fallback identity if git isn't globally configured) + installs the pre-commit secret-scan hook.

### What happens in-session (Butler's Phase 1)

Butler runs two skills when you open Claude Code for the first time:

- **`orient`** (cheap, read-only): detects this is a first session, prints a greeting, runs a scaffold sanity check (`coldpress doctor` silent mode + yaml validator + template file probes + pre-commit hook check), offers a 30-second lifecycle tour, then hands off to `intake`.

- **`intake`** (6 steps, the real work):

  1. **Material solicitation** — Butler walks through the 5 `_input/` folders, asking if you have anything to drop in (URLs auto-fetched into `reference/`; files > 50KB auto-sharded).
  2. **Shape determination** — inspects `_input/legacy/` to classify `project_shape` as `greenfield` or `brownfield`.
  3. **Intent seed** — asks for one sentence describing the project; writes `_context/sacred/context.md` with frontmatter + `status: seed`.
  4. **Working mode** — four quick questions: preferred IDEs, cadence (silent/summary/verbose), team shape (solo/team/client-project), Butler's display name.
  5. **Graph prime** — runs `coldpress graph rebuild`; warn-not-block on failure (orient retries next session).
  6. **Gate and route** — runs the 6-check Phase 1 exit gate; on pass, writes a handoff artefact and dispatches `@analyst pre-project-interview` (Phase 2).

### What you have after Phase 1

```
taskpulse/
├── coldpress-os/              # Framework (copied, not a submodule)
├── .claude/
│   ├── SYSTEM.md              # Butler's directive
│   ├── agents/                # 11 subagent definitions
│   └── skills/                # ~128 skill wrappers
├── .coldpress/
│   ├── graph/graph.json       # Primed knowledge graph
│   └── local-config.yaml      # phase_1_completed: true
├── _context/
│   ├── sacred/
│   │   └── context.md         # Seed (one-sentence intent)
│   ├── tracking/
│   │   ├── orient-2026-04-24.md
│   │   └── intake-2026-04-24.md
│   └── handoffs/
│       └── intake-to-phase2-2026-04-24.md
├── _input/                    # Material walked and indexed
├── scripts/check-secrets.sh   # Pre-commit hook source
├── secure/manifest.yaml       # Credential shape (values in .env* git-ignored)
├── coldpress.yaml             # Now includes user.preferred_ides / cadence / team_shape
└── CLAUDE.md                  # Framework routing + {butler.display_name}
```

---

## Phase 2: Discovery

Phase 2 warm-starts from Phase 1 — Butler reads the intake seed rather than asking you to repeat it.

### What you do

```
# Phase-transition hands off automatically at the end of Phase 1.
# Butler will say: "Starting Phase 2 — first up: @analyst pre-project-interview"
```

For solo vibe-coder (minimum viable path):
```
pre-project-interview → 1-2 research skills → synthesize-research → product-brief
```

For structured solo or team project:
```
pre-project-interview → domain + market + constraint + personas (parallel) →
validate-idea → synthesize-research → product-brief
```

### What happens — pre-project-interview

Butler dispatches **@analyst** (discovery mode). The analyst reads the seed intent from `context.md` and confirms it rather than re-asking:

```
@analyst: Your intake captured: "TaskPulse — a lightweight task tracker for
solo creators." Let's build the bigger vision around that. Does this still
match what you're after, or has anything shifted since Phase 1?

> Still right — but I want to be clearer on the target user.

@analyst: Who is the primary user of TaskPulse?
> Solo creators — freelancers, indie hackers, content creators who work alone.

@analyst: Why does this need to exist?
> Existing tools are either too complex (Asana, Linear) or too simple
  (Apple Notes). TaskPulse sits in between — structured enough to track
  patterns, simple enough to use in 30 seconds.

@analyst: What are your hard constraints? (5 non-technical questions cover
  budget, time, team, compliance, and org constraints.)
> Free tier only (Convex free, Vercel free). Must work on mobile web.
  Solo developer (me). Ship MVP in 2-3 weeks. No compliance obligations.
```

**Output:** `_context/sacred/context.md` — status promoted from `seed` → `authored`. Your first sacred document. Requires explicit user sign-off, which activates sacred-doc governance (future edits go through the context change-workflow).

### What happens — research lane (parallel)

```
@analyst domain-research       # → _context/planning/research/domain-research-{date}.md
@analyst market-research       # → _context/planning/research/market-research-{date}.md
@analyst constraint-research   # → _context/planning/research/constraint-{topic}-{date}.md
@analyst personas              # → _context/planning/personas-{date}.md
```

Research skills query the knowledge graph first (material pre-loaded in `_input/` during intake), then supplement with web research. If a graph-first finding contradicts `_input/` material, the supersede-check fires — Butler surfaces the conflict and asks for confirmation.

### What happens — validate-idea

```
@analyst validate-idea         # → _context/planning/idea-validation-v1.md
```

9 steps: problem validation, hypotheses + risks, differentiation, problem-solution fit, success metrics, prior art, and (if team) stakeholder alignment. Step 9 is a red-flag escape hatch — if the validation surfaces a critical weakness, Butler pauses before proceeding.

### What happens — synthesis + brief

```
@analyst synthesize-research   # → _context/planning/research-synthesis-v1.md
@analyst product-brief         # → _context/planning/product-brief-v1.md
```

`synthesize-research` consolidates all research + validation using Systems Thinking + Morphological Analysis, then runs `adversarial-review` + `editorial-structure` for quality. `product-brief` is a 1-2 page executive brief — a **validated distillate**, not a sacred doc. It's versioned and regeneratable.

### Phase 2 exit

Butler invokes `phase-transition`:
- Runs the Phase 2 exit gate (4 block + 3 warn checks)
- Rebuilds the knowledge graph (or flags as stale if Graphify unavailable)
- Writes `_context/handoffs/phase-2-to-phase-3-{date}.md`
- Detects if product-brief is stale vs context.md + synthesis (prompts regen if so)

---

## Phase 3: Tech Stack

Phase 3 warm-starts from Phase 2 — Butler reads the product-brief, idea-validation, personas, and constraint-research rather than asking you to re-state them.

### What you do

```
# Phase-transition hands off automatically at the end of Phase 2.
# Butler will say: "Starting Phase 3 — first up: @architect stack-discovery-sync"
```

### Step 1: stack-discovery-sync

```
@architect: Reading Phase 2 evidence...
  project_type: web_app (productivity/saas) | domain_complexity: low | team_shape: solo
  Personas: solo creator, mobile web user, accessibility: standard

  Pack-match scoring:
  ✅ vibe-coder-fullstack — score: 0.91 (strong match)
     Pre-picks: Next.js + Convex + Clerk + Vercel + Tailwind
     Baselines out-of-box: accessibility (Tailwind primitives), security (Clerk + Convex row-security)

  Propose this pack? (y / override individual areas / independent evaluation)
  > y
```

**Output:** `_context/planning/stack-shortlist-v1.md` — tiered candidates per decision-area.

### Step 2: stack-evaluation (per decision-area, T1 fast-path for pack areas)

```
@architect: Decision 1 of 5: Frontend framework.
  Pack pre-picks Next.js (T1). Accept or override?
  > accept

  Decision 5 of 5: Testing.
  No pack pre-pick. Pre-loaded options (T2): Vitest / Jest / Playwright.
  [rubric walk: fit 8, cost 10, familiarity 9, ecosystem 9, lock-in 10, vibe_fit 9 → Vitest]
```

**Output:** `_context/planning/adrs/adr-{area}-v1.md` per decision-area.

### Step 3: stack-locking + Step 4: env-provision

```
Run stack-locking
```

```
@architect: ADR inventory — 5 decisions, all accepted. No red flags. (Step 3a passed.)

  Baselines confirmation (Step 5a):
  ✅ accessibility — covered by pack (Tailwind + Clerk) → confirm
  ✅ security — covered by pack (Clerk + Convex row-security) → confirm
  → seo_aeo_llm — not covered by pack → confirm (adds llms.txt + sitemap in env-provision)
  → future_proof — not covered → confirm (adds tsconfig strict + ES2022 targets)
```

Then in the terminal:

```
coldpress update --post-phase-3
```

Then run `env-provision`:

```
@developer: pack=vibe-coder-fullstack → dispatching to pack quickstart skill.
  Installing: Next.js 14 + Convex CLI + Clerk + Vercel CLI + Tailwind CSS
  Baselines activation: seo_aeo_llm (llms.txt + sitemap) + future_proof (tsconfig strict)
  Verify: npm run dev → ✅
```

**Outputs:**
- `_context/sacred/tech-stack.md` — Your second sacred document. Locked decisions with rationale.
- `_context/planning/stack-selection-summary-v1.md` — Validated distillate.
- `coldpress.yaml`: `stack_pack: vibe-coder-fullstack` + `baselines:` block written.

---

## Phase 4: Planning (PRD-only post-split)

Under Shape A, Phase 4 is **PRD-only** — UX and architecture moved to dedicated phases 5 and 6.

### What you do

```
Run create-prd
```

### What happens

Butler dispatches **@pm**. The PM runs `planning-entry-sync` first (graph-first read of all Phase 2 + 3 outputs), then walks you through a structured PRD creation workflow:

- Core features (task CRUD, focus timer, weekly patterns)
- User stories (as a solo creator, I want to...)
- Acceptance criteria
- Out of scope (team features, integrations, mobile native)
- Success metrics (daily active usage, task completion rate)

**Output:** `_context/sacred/prd.md` — Third sacred document. Plus `prd.meta.json` sidecar (the `prd-to-architecture` handoff payload — feature count, NFR axes, ADR references, brownfield modules count, baselines active).

### `validate-prd --sections=<list>` for amendments

If you need to amend a small slice later (after a Phase 5 design-delta surfaces), you don't need to re-validate the whole PRD:

```
coldpress validate-prd --sections=success-metrics,out-of-scope
```

Emits `prd-validation-amendment-{date}.md` — a lightweight per-section amendment that downstream phases reconcile.

---

## Phase 5: Design *(NEW under Shape A)*

The new Design phase consolidates UX + brand work that used to be scattered. Owner: **@ux-designer**.

### What you do

```
Run ux-design
Run brand-guidelines
Run prototype                # optional — only if archetype calls for it
```

### What happens — ux-design

```
@ux-designer: Reading PRD + personas + product-brief + tech-stack...

  Building UX spec across 4 steps:
  1. Information architecture (sitemap, navigation, content model)
  2. User flows (signup → task entry → focus session → weekly review)
  3. Wireframes (low-fi mockups per flow)
  4. UX spec (consolidated, validated against personas + acceptance criteria)
```

**Output:** `_context/design/ux-design-spec.md` (validated distillate — NOT sacred, per decision #11).

### What happens — brand-guidelines

```
@ux-designer brand-guidelines    # → _context/design/brand-guidelines-v1.md
```

5 steps: scope, voice, tokens (colour/typography/spacing), identity (logo, iconography), a11y rules. The output is a validated distillate.

### Design-deltas — the first instance of the forward-carry quartet

During Phase 5, @ux-designer may surface design-deltas — places where the design intent diverges from the PRD or PERT chart. Each delta resolves at Phase 5 exit (in @pm scope) via four reconciliation options:

| Option | Effect |
|---|---|
| `accept_into_prd` | PRD amendment via `validate-prd --sections` |
| `reject` | Design must conform; loop back to source skill |
| `flag_for_architecture_ADR` | Carries forward to Phase 6 — silent-divergence guard target |
| `park_for_phase_11` | Phase 11 retrospective revisits |

**Outputs:**
- `_context/design/ux-design-spec.md`
- `_context/design/brand-guidelines-v1.md`
- `_context/design/design-deltas-v1.md` (deltas with their resolution decisions)
- `_context/handoffs/phase-5-to-phase-6-{date}.md` (handoff incl. `architecture_adrs_required[]`)

---

## Phase 6: Architecture *(NEW under Shape A)*

The new Architecture phase is the first phase where PRD + UX-spec + brand-guidelines + tech-stack are all simultaneously available. Owner: **@architect**.

### What you do

```
Run architecture-design
```

### What happens

```
@architect: Reading Phase 4 + Phase 5 outputs...

  Step 01 — flagged-deltas-intake (CRITICAL):
    Reading `architecture_adrs_required[]` from phase-5 handoff...
    Queueing 2 REQUIRED ADRs:
      - ADR-0003: timer-vs-storage-precedence (P5 delta flagged_for_architecture_ADR)
      - ADR-0004: pattern-aggregation-cadence  (P5 delta flagged_for_architecture_ADR)

  Step 2-4 — architecture overview + data flow + NFR axes...

  Step 5 — ADR authoring (3 + 2 required = 5 ADRs)...

  Step 6 — emit:
    MANDATORY: Component Interaction Diagram (Mermaid graph LR)
    MANDATORY: Failure Mode Enumeration table (≥5 rows, top-3 NFR axes)
```

**Sacred output:** `_context/sacred/architecture.md` — Fourth sacred document. With `architecture.meta.json` sidecar.

### Silent-divergence guard

The Phase 6 exit gate REQUIRES that every `flag_for_architecture_ADR` delta from Phase 5 has a corresponding ADR. You cannot exit Phase 6 with unresolved P5 design-deltas. This is the structural guarantee that design intent and architecture stay in sync — silent divergence is impossible at the gate.

### Architecture-deltas

Phase 6 may itself surface architecture-deltas (places where the architecture diverges from PRD assumptions). These carry forward to Phase 7 entry (`breakdown-entry-sync` Step 1) for reconciliation by @pm + @architect.

---

## Phase 7: Breakdown *(cascade rename — was old Phase 5)*

### What you do

```
Run create-epics
```

### What happens

Butler dispatches **@pm** to read PRD + architecture, then break into epics:

```
@pm breakdown-entry-sync       # Step 1: reconcile architecture-deltas from P6
                                # Step 2: scope memo
Epic 1: Core Task Management (CRUD, categories, priorities)
Epic 2: Focus Timer (start/stop, session tracking, daily totals)
Epic 3: Weekly Patterns (aggregation, visualization, insights)
Epic 4: Auth & Onboarding (sign-up, login, first-run experience)
```

**Output:** `_context/planning/epics/`

Then:

```
Run create-stories               # @pm → per-story files
Run parallelization-strategy     # @scrum-master sub-dispatched → PERT chart
Run sprint-planning              # @scrum-master → sprint grouping
```

The **@scrum-master** (haiku — fast + organisational) is sub-dispatched by @pm. PERT chart includes mandatory Dependency DAG (Mermaid) + Wave Grouping Table + Critical Path Table — all forcing-function artefacts per §6.7 prompt-patterns.

**Sacred output:** `_context/sacred/pert-chart.md` — Fifth sacred document.

### Your wave plan might look like

```
Wave 1 (parallel):
  - Story 1.1: Convex schema + task mutations
  - Story 4.1: Auth setup (Convex Auth)

Wave 2 (parallel, depends on Wave 1):
  - Story 1.2: Task list UI
  - Story 1.3: Task detail view
  - Story 4.2: Onboarding flow

Wave 3 (depends on Wave 2):
  - Story 2.1: Focus timer component
  - Story 2.2: Session persistence

Wave 4 (depends on Waves 1-3):
  - Story 3.1: Weekly aggregation query
  - Story 3.2: Pattern visualization
```

---

## Phase 8: Implementation *(cascade rename — was old Phase 6)*

### What you do

```
Build story 1.1: Convex schema and task mutations
```

### What happens

Butler dispatches **@developer** (mode from `coldpress.yaml` — standard or quick):

**Standard mode** (`dev-story`):
- Reads the story spec
- Creates implementation plan
- Writes code with TDD
- Runs tests
- Creates handoff artifact

**Quick mode** (`quick-dev`):
- Lean spec
- Rapid implementation
- Minimal ceremony

```
@developer: Implementing Story 1.1 — Convex schema + task mutations.

Created:
  convex/schema.ts        — Task table (title, status, priority, category, createdAt)
  convex/tasks.ts         — Mutations: create, update, delete, toggleComplete
  convex/tasks.queries.ts — Queries: listByStatus, listByCategory, getTask

Tests:
  convex/tasks.test.ts    — 12 tests, all passing
```

After implementation, run reviews:

```
Run code-review                # @qa sub-dispatched, reviews per story
Run qa-automation              # @qa generates/runs test suites
```

### For parallel stories (Wave 1)

```
Build stories 1.1 and 4.1 in parallel
```

Butler dispatches two **@developer** subagents concurrently (one per story), since the wave plan shows they have no dependencies.

### Implementation-deltas

Phase 8 may surface implementation-deltas (places where the implementation diverges from the architecture or PRD). These deferred-batch carry forward to Phase 11 retrospective.

---

## Phase 9: Deployment *(cascade rename — was old Phase 7)*

Owner: **@devops** (Phase 9 ship-path mode — new in v0.3.0-alpha).

### What you do

```
Run readiness-check
```

### What happens

```
@devops readiness-check         # Phase 9 meta-aggregator
  ✅ All stories in current sprint: implemented
  ✅ Test coverage: 87% (target: 80%)
  ✅ No critical security findings (security-scan, secrets-vault-manager)
  ✅ Environment variables configured (env-check)
  ✅ Dependency health: clean (dep-health-check, dependency-auditor)
  ⚠️  No error monitoring configured (observability-designer recommends Sentry free tier)

Recommendation: READY TO DEPLOY with advisory on monitoring.
```

Then:

```
Run security-scan
Run env-check
Run db-migration-check
Run dep-health-check
Run deploy                     # @devops executes deployment
```

---

## Phase 10: Operate *(cascade rename — was old Phase 8)*

Owner: **@devops** continues from Phase 9 — no agent change at the P9 → P10 entry (Pattern 7 transition #16: same-agent phase boundary). New phase-mode: steady-state.

### What you do (continuous)

```
Run sprint-status              # weekly check-in
```

```
@devops sprint-status
  Sprint 1 in flight (4 of 10 stories complete; on track for 7-day finish)
  Open incidents: 0
  SLO breaches: 0
  Last deploy: 2026-04-26 (Story 1.1 + 4.1 → prod)
```

When something breaks:

```
Run incident-response          # Phase 10's primary correction loop
```

```
@devops incident-response
  Trigger: 502 spike at /api/tasks (Sentry alert)
  Severity: P1 (production impact, < 5% users)
  Mitigation: rollback Story 1.3 (last deploy)
  Root cause: pagination edge case (empty cursor)
  Postmortem: _context/audit/incident-pagination-edge-2026-04-28-postmortem.md
```

### Ops-deltas — the fourth instance of the forward-carry quartet

Operational findings that should change PRD, architecture, or roadmap become **ops-deltas** — aggregated through Phase 10 and reconciled at Phase 11 retrospective entry.

---

## Phase 11: Evolve *(FINAL — cascade rename + new owner)*

Owner: **@reviewer** (new in v0.3.0-alpha — takes over from @devops at Phase 11 entry).

### What you do (after each iteration)

```
Run retrospective
```

### What happens

```
@reviewer retrospective
  Step 0: ops-deltas reconciliation pass (4-option resolution)
    - ops-delta #1: "pagination edge cases need PRD coverage" → accept_into_prd
    - ops-delta #2: "Sentry alerting noise threshold" → park_for_phase_11_product_evolution

  Iteration 1 results:
    Velocity: 34 story points (8/10 stories completed; 2 deferred)
    Implementation-deltas reconciled: 3 (2 accepted, 1 rejected)

  What went well:
    - Convex schema design was clean, no migrations needed
    - Parallel waves saved ~3 days vs sequential
    - Phase 5 → 6 silent-divergence guard caught one missing ADR before P6 exit

  What to improve:
    - UX spec for weekly patterns was underspecified
    - Should have run design-thinking earlier in Phase 5 for this feature
```

Then:

```
Run product-evolution          # next-iteration backlog
Run innovation-strategy        # long-horizon ideation (optional)
```

### Inter-iteration cycle — Phase 11 → next iteration's Phase 1

Phase 11 is **final** under Shape A — there is no Phase 12. Instead, on closure, `phase-transition` (with `is_final_phase: true`) copies:

```
_context/audit/retrospective-v{latest}.md             → _input/prior-iteration/
_context/planning/product-evolution-backlog-v1.md     → _input/prior-iteration/
_context/planning/innovation-strategy-v1.md           → _input/prior-iteration/
```

Next iteration's Phase 1 `intake` skill detects `_input/prior-iteration/` and reads it — brownfield-style branching that warm-starts the next cycle.

---

## Summary: What Each Phase Produced (Shape A 11-phase)

| Phase | Name | Owner | Key Outputs | Sacred? |
|-------|------|-------|-------------|---------|
| 1 | Bootstrap | butler | Project structure, `coldpress.yaml`, 11 agent wrappers, seed `context.md` | seed |
| 2 | Discovery | @analyst | `context.md` (authored), research, idea-validation, product-brief | context: ✓ |
| 3 | Tech Stack | @architect | `tech-stack.md`, ADRs, stack-selection-summary, baselines | tech-stack: ✓ |
| 4 | Planning | @pm | `prd.md` + meta.json sidecar | prd: ✓ |
| 5 | **Design** | @ux-designer | ux-design-spec, brand-guidelines, design-deltas | distillates |
| 6 | **Architecture** | @architect | `architecture.md` (REQUIRED ADRs for flagged-deltas), arch-deltas | architecture: ✓ |
| 7 | Breakdown | @pm + @scrum-master | epics, stories, `pert-chart.md`, sprint plan | pert: ✓ |
| 8 | Implementation | @developer + @qa | Application code, tests, implementation-deltas | — |
| 9 | Deployment | @devops | Readiness report, deployed application, deploy-log | — |
| 10 | Operate | @devops | sprint-status, course-corrections, incident postmortems, ops-deltas | — |
| 11 | Evolve *(final)* | @reviewer | retrospective, product-evolution-backlog, innovation-strategy → next iteration | — |

**Total sacred documents:** 5 (context, tech-stack, PRD, architecture, PERT)
**Total subagents available:** 11 (analyst, architect, pm, ux-designer, scrum-master, developer, qa, devops, reviewer, communicator, valet)
**Forward-carry deltas:** design-deltas (P5) · architecture-deltas (P6→P7) · implementation-deltas (P8→P11) · ops-deltas (P10→P11)

---

## See also

- [`butler.md`](butler.md) — the orchestrator reference (Hello Butler, dispatch tree, cadence, gates)
- [`quick-start.md`](quick-start.md) — first-10-minutes hands-on
- [`flow-map.md`](flow-map.md) — visual mapping of phases, skills, and subagents
- [`decision-trees.md`](decision-trees.md) — Butler's routing rules
- [`troubleshooting.md`](troubleshooting.md) — common issues and solutions

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 4.0 | 2026-05-17 | ColdPress Labs | **Shape A rewrite for v0.3.0-alpha.** Restructured from 8 phases to 11. Old Phase 4 (Planning) split into Phase 4 (Planning, PRD-only) + Phase 5 (Design, NEW) + Phase 6 (Architecture, NEW). Old phases 5–9 cascade-renamed to 7–11. Added Hello Butler kickoff at top. Added forward-carry quartet documentation (design-deltas at P5 exit, architecture-deltas at P7 entry, implementation-deltas at P11 batch, ops-deltas at P11 retrospective). Added silent-divergence guard P5 → P6 (REQUIRED ADRs for flagged deltas). Added inter-iteration cycle P11 → next-iteration P1. Subagent count 9 → 11 (added @reviewer for P11, @devops for P9+P10). Updated phase ownership (@pm 4+7; @architect 3+6; @ux-designer 5; @devops 9+10; @reviewer 11). Updated counts (skill wrappers ~66 → ~128; sacred docs still 5). Node ≥20 → ≥22. |
| 3.0 | 2026-04-24 | ColdPress Labs | Phase II Part 3 Wave 5.3. Phase 3 section rewritten: warm-handoff noted; 4-step flow (stack-discovery-sync with pack-match, stack-evaluation T1 fast-path + T2 rubric, stack-locking with baselines confirm + post-CLI, env-provision pack-branch); stack_pack changed from "convex" to "vibe-coder-fullstack" (pack renamed in Wave 6); summary table Phase 3 row expanded with all outputs. |
| 2.0 | 2026-04-24 | ColdPress Labs | Phase II Part 1 Wave 5.1b. Phase 1 section rewritten for the npm-era flow: `coldpress init` (pre-session CLI) replaces the retired `project-init` + `agent-scaffold` workflow; Butler's new `orient` + `intake` skills drive in-session Phase 1 (6 intake steps enumerated). Post-Phase-1 directory tree updated to include `.coldpress/`, `_context/sacred/context.md` (seed), `_context/tracking/`, `_context/handoffs/`, `_input/` (with READMEs), `scripts/check-secrets.sh`, `secure/manifest.yaml`. |
| 1.0 | 2026-04-13 | ColdPress Labs | Initial walkthrough — TaskPulse example across all 8 lifecycle phases |
