# Example Walkthrough — Building "TaskPulse" with coldpress-os

> A complete lifecycle walkthrough showing how coldpress-os drives a project from idea to deployment on the **full lane (11 phases — v0.4.0-alpha)**. Follow along or use it as a reference for what each phase produces.
>
> **Two lanes.** This walkthrough covers the **full lane**. The scaffolded default is the **lite lane** — four moves (Spec → Build → Verify → Ship) for projects that don't need the full ceremony; `coldpress lane-upgrade` moves a project to the full lane when it outgrows lite. See [`quick-start.md`](quick-start.md) for the lite path.
>
> **Validated against real builds.** TaskPulse is illustrative, but the flow below is not hypothetical: v0.4.0-alpha's ship gate required two end-to-end validation runs of exactly this machinery — a lite-lane build (a multi-page Astro site: Spec → Build → Verify → Ship, clean-room verifier pass, deploy-gate exercised in both directions) and a full-lane build (an interactive React/TypeScript app driven through all phase gates by a real agent team — plan-approved stories, `@developer` implementing wave-by-wave, the `@verifier` clean-room re-verifying every story, `@devops` shipping staging → production). Every seam this document describes was exercised, and the findings were fixed and regression-pinned before release (see [CHANGELOG](../CHANGELOG.md)).

---

## The Project

**TaskPulse** — A lightweight task management app for solo creators. Tracks daily tasks, measures focus time, and surfaces weekly patterns.

- **Type:** web_app
- **Domain:** productivity / saas
- **Archetype:** Production
- **Pattern:** A (three-tier)
- **Stack pack:** `vibe-coder-fullstack` (auto-matched in Phase 3 stack-discovery-sync)

---

## Hello Butler — let's begin

Every session starts the same way. Open Claude Code in your project directory and type:

```
Hello Butler
```

Butler is your main agent — the orchestrator that routes your intent to the right skill, dispatches the 8 subagents when their expertise is needed, runs gates, and writes handoff artefacts. (See [`butler.md`](butler.md) for the full reference.)

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
5. Installs the Claude Code skills plugin (`plugin/skills/`, auto-enabled by the scaffolded `.claude/settings.json`) + interop outputs (AGENTS.md, Cursor, Roo, OpenHands, Cline).
6. Runs `git init` + initial commit (with fallback identity if git isn't globally configured) + installs the pre-commit secret-scan hook.

### What happens in-session (Butler's Phase 1)

Butler runs two skills when you open Claude Code for the first time:

- **`orient`** (cheap, read-only): detects this is a first session, prints a greeting, runs a scaffold sanity check (`coldpress doctor` silent mode + yaml validator + template file probes + pre-commit hook check), offers a 30-second lifecycle tour, then hands off to `intake`.

- **`intake`** (6 steps, the real work):

  1. **Material solicitation** — Butler walks through the 5 `_input/` folders, asking if you have anything to drop in (URLs auto-fetched into `reference/`; files > 50KB auto-sharded).
  2. **Shape determination** — inspects `_input/legacy/` to classify `project_shape` as `greenfield` or `brownfield`.
  3. **Intent seed** — asks for one sentence describing the project; writes `_context/sacred/context.md` with frontmatter + `status: seed`.
  4. **Working mode** — four quick questions: preferred IDEs, cadence (silent/summary/verbose), team shape (solo/team/client-project), Butler's display name.
  5. **Gate and route** — runs the 6-check Phase 1 exit gate; on pass, writes a handoff artefact and dispatches `@analyst` (Phase 2).

### What you have after Phase 1

```
taskpulse/
├── coldpress-os/              # Framework (copied, not a submodule)
├── .claude/
│   ├── SYSTEM.md              # Butler's directive
│   ├── agents/                # 8 subagent definitions
│   └── settings.json          # Auto-enables the skills plugin
├── plugin/skills/             # Skills plugin (auto-enabled via .claude/settings.json)
├── .coldpress/
│   ├── state.yaml             # Orchestration state (phase / lane / gates)
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
# Butler will say: "Starting Phase 2 — first up: @analyst research"
```

For solo vibe-coder (minimum viable path):
```
research (1-2 passes) → product-brief
```

For structured solo or team project:
```
research (domain / market / constraints / users, as many passes as needed) +
personas → validate-idea → product-brief
```

### What happens — the discovery interview

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
@analyst research              # → _context/planning/research/research-{focus}-{date}.md
                                # (one pass per focus: domain, market, constraints, ...)
@analyst personas              # → _context/planning/personas-{date}.md
```

The `research` skill reads the material indexed in `_input/` first, then supplements with web research. If a new finding contradicts `_input/` material, Butler surfaces the conflict and asks for confirmation rather than silently superseding it.

### What happens — validate-idea

```
@analyst validate-idea         # → _context/planning/idea-validation-v1.md
```

9 steps: problem validation, hypotheses + risks, differentiation, problem-solution fit, success metrics, prior art, and (if team) stakeholder alignment. Step 9 is a red-flag escape hatch — if the validation surfaces a critical weakness, Butler pauses before proceeding.

### What happens — the brief

```
@analyst product-brief         # → _context/planning/product-brief-v1.md
```

`product-brief` consolidates all research passes + validation into a 1-2 page executive brief — a **validated distillate**, not a sacred doc. It's versioned and regeneratable, and it names the product's **north-star metric** (the seed of the outcome contract Phase 4 formalizes).

### Phase 2 exit

Butler invokes `phase-transition`:
- Runs the Phase 2 exit gate (`coldpress gate check` — block + warn checks, evaluation emitted to `_context/audit/`)
- Writes `_context/handoffs/phase-2-to-phase-3-{date}.md`
- Detects if product-brief is stale vs context.md + the research corpus (prompts regen if so)

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

### Step 5: deploy-select + walking-skeleton

```
Run deploy-select              # locks deploy_pack: in coldpress.yaml (e.g. vercel)
Run walking-skeleton           # thinnest end-to-end slice, built + smoked
```

The walking skeleton is a Phase-3 exit requirement: the thinnest possible end-to-end slice of the locked stack, built for real and smoke-tested — **local-first is a first-class path** (smoke through the deploy pack's local adapter now, owe the remote staging deploy to Phase 9 as structured deploy-debt). The Phase-3 gate verifies the stack lock landed in `coldpress.yaml` and the skeleton smoked green.

---

## Phase 4: Planning (PRD-only)

Phase 4 is **PRD-only** — UX and architecture have their own dedicated phases (5 and 6).

### What you do

```
Run create-prd
Run outcome-contract
```

### What happens

Butler dispatches **@pm**. The PM reads all Phase 2 + 3 outputs first, then walks you through a structured PRD creation workflow:

- Core features (task CRUD, focus timer, weekly patterns)
- User stories (as a solo creator, I want to...)
- Acceptance criteria
- Out of scope (team features, integrations, mobile native)
- Success metrics (daily active usage, task completion rate)

**Output:** `_context/sacred/prd.md` — Third sacred document. Plus `prd.meta.json` sidecar (the `prd-to-architecture` handoff payload — feature count, NFR axes, ADR references, brownfield modules count, baselines active).

Then `outcome-contract` turns the PRD's success metrics into `_context/planning/outcomes.yaml` — the machine-readable **outcome contract** (schema-validated, block-gated at Phase-4 exit). It threads through the rest of the lifecycle: Phase 6's analytics plan maps events to it, Phase 8 instruments those events on stories, and Phase 10's ops digest reports **actual vs target** against it.

### `validate-prd --sections=<list>` for amendments

If you need to amend a small slice later (after a Phase 5 design-delta surfaces), you don't need to re-validate the whole PRD:

```
coldpress validate-prd --sections=success-metrics,out-of-scope
```

Emits `prd-validation-amendment-{date}.md` — a lightweight per-section amendment that downstream phases reconcile.

---

## Phase 5: Design

The Design phase consolidates UX + brand work into one machine-verified design system. Owner: **@ux-designer**.

### What you do

```
Run design-brief
Run ux-design
Run brand-guidelines
Run design-tokens            # → tokens.json (the machine-readable design system)
Run budgets                  # → budgets.yaml (route weight / perf budgets)
Run styleguide               # → styleguide.md + a live /styleguide route in the app
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

### The machine artifacts — tokens, budgets, styleguide

Phase 5's four machine artifacts are what make the design system *enforceable* rather than aspirational:

- **`tokens.json`** — every colour/type/spacing decision as data. Builds consume tokens **by construction** (the tokens-build binding), so a token edit propagates with no manual code change.
- **`coldpress tokens contrast`** — the WCAG contrast validator runs over every declared theme (light *and* dark), alpha-composites rgba/hsl values, and **block-gates Phase-5 exit** on AA failures.
- **`budgets.yaml`** — route-level performance budgets, verified against real builds in Phase 8.
- **`styleguide.md` + the live `/styleguide` route** — the human-facing spec plus a rendered page in the app itself, so drift is visible.

### Design-deltas — the first instance of the forward-carry quartet

During Phase 5, @ux-designer may surface design-deltas — places where the design intent diverges from the PRD. Each delta resolves at Phase 5 exit (in @pm scope) via four reconciliation options:

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

## Phase 6: Architecture

Architecture is the first phase where PRD + UX-spec + brand-guidelines + tech-stack are all simultaneously available. Owner: **@architect**. (Phases 5 and 6 may partially overlap.)

### What you do

```
Run architecture-design
Run data-model                 # entities + relationships
Run api-contract               # endpoint/interface contracts
Run integration-inventory      # external services, failure modes, infra cost
Run threat-model               # + security-registry for the security posture
Run analytics-plan             # maps outcomes.yaml metrics to concrete events
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

## Phase 7: Breakdown

### What you do

```
Run story-slice
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
Run story-slice                  # @pm → per-story files (contract stories)
Run story-graph                  # @pm → story-graph.yaml (nodes + dependency edges)
Run implementation-readiness     # per-story READY check before Phase 8
coldpress waves                  # CLI → computes waves / critical path / schedule
```

**@pm** builds the story graph. The `coldpress waves` scheduler then computes the wave grouping, critical path, and schedule from `story-graph.yaml` — Dependency DAG (Mermaid) + Wave Grouping Table + Critical Path Table are the forcing-function artefacts per §6.7 prompt-patterns.

**Output:** `story-graph.yaml` — the dependency graph the scheduler reads. Not a sacred doc; the sacred set stays four (context, tech-stack, PRD, architecture).

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

## Phase 8: Implementation

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
Run code-review                # Butler dispatches @verifier (clean-room, read-only), reviews per story
Run verify-story              # @verifier (clean-room, read-only) exercises the test suites
```

### For parallel stories (Wave 1)

```
Build stories 1.1 and 4.1 in parallel
```

Butler dispatches two **@developer** subagents concurrently (one per story), since the wave plan shows they have no dependencies.

### Implementation-deltas

Phase 8 may surface implementation-deltas (places where the implementation diverges from the architecture or PRD). These deferred-batch carry forward to Phase 11 retrospective.

---

## Phase 9: Deployment

Owner: **@devops**. Deployment runs through the project's locked **deploy pack** (`deploy_pack:` in `coldpress.yaml` — e.g. vercel, cloudflare-pages, netlify, self-hosted): the pack supplies the staging/preview/prod verbs, the smoke checks, and the rollback recipe for that target.

### What you do

```
Run readiness
```

### What happens

```
@devops readiness               # → _context/operations/readiness-v1.md (schema-validated)
  ✅ All stories in current wave: verified (@verifier clean-room)
  ✅ Security scans clean (scan-code, scan-deps-and-containers, scan-secrets)
  ✅ Environment variables configured (env-check, secrets-vault-manager)
  ✅ Budgets met against the production build (budgets.yaml)
  ⚠️  No error monitoring configured (observability-designer recommends Sentry free tier)

Recommendation: READY TO DEPLOY with advisory on monitoring.
```

Then the staged ship path:

```
Run deploy-staging             # @devops → staging target via the deploy pack
Run smoke                      # smoke checks against the staging URL — staging never red
Run deploy-preview             # optional: per-story preview deployments
Run client-acceptance          # client/UAT sign-off record (team/client projects)
Run deploy-prod                # HUMAN-TRIGGERED, never automatic
Run handover                   # release record + runbooks → _context/operations/
```

**The deploy-gate hook enforces the ordering**: a prod deploy is blocked unless the same commit has a green staging smoke, and prod is always human-triggered — the framework will stage and verify autonomously, but shipping to production is your call. `rollback` rehearses the pack's rollback recipe so the first time you need it isn't the first time you've run it.

---

## Phase 10: Operate

Owner: **@devops** continues from Phase 9 — no agent change at the P9 → P10 boundary. Phase-mode: steady-state.

### What you do (continuous)

```
Run ops-check                  # point-in-time health check
Run operate-loop               # the recurring ops digest
```

```
@devops operate-loop
  Uptime: 100% (last 7 days) | Open incidents: 0 | SLO breaches: 0
  Last deploy: 2026-04-26 (Story 1.1 + 4.1 → prod)

  Outcomes (actual vs target, from outcomes.yaml):
    daily_active_usage:    14 / 20   (70% of target, trending up)
    task_completion_rate:  0.61 / 0.55 ✅
```

The ops digest closes the outcome-contract loop: the metrics you committed to in Phase 4's `outcomes.yaml` are reported as **actual vs target** from real telemetry — the framework doesn't just verify that you built the thing, it measures whether the thing worked. `client-health-report` produces the client-facing version on team/client projects.

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

## Phase 11: Evolve *(FINAL)*

Owner: **@reviewer** (read-only — takes over from @devops at Phase 11 entry; every claim in the retrospective cites a run-log event).

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
Run pack-harvest               # graduate what worked → reusable packs / a new profile
Run framework-feedback         # learnings → coldpress-os issues (the improvement loop intake)
```

`pack-harvest` is how solutions compound: components, configs, and patterns that proved themselves in this build graduate into stack packs, capability packs, or a new project profile — so the next project of this shape starts further ahead. `framework-feedback` sends process failures upstream to the framework's own improvement loop.

### Inter-iteration cycle — Phase 11 → next iteration's Phase 1

Phase 11 is **final** — there is no Phase 12. Instead, on closure, `phase-transition` (with `is_final_phase: true`) copies:

```
_context/audit/retrospective-v{latest}.md             → _input/prior-iteration/
_context/planning/product-evolution-backlog-v1.md     → _input/prior-iteration/
```

Next iteration's Phase 1 `intake` skill detects `_input/prior-iteration/` and reads it — brownfield-style branching that warm-starts the next cycle.

---

## Summary: What Each Phase Produced (full lane, 11 phases)

| Phase | Name | Owner | Key Outputs | Sacred? |
|-------|------|-------|-------------|---------|
| 1 | Bootstrap | butler | Project structure, `coldpress.yaml`, 8 agent definitions, seed `context.md` | seed |
| 2 | Discovery | @analyst | `context.md` (authored), research, idea-validation, product-brief | context: ✓ |
| 3 | Tech Stack | @architect | `tech-stack.md`, ADRs, stack-selection-summary, baselines | tech-stack: ✓ |
| 4 | Planning | @pm | `prd.md` + meta.json sidecar, `outcomes.yaml` (outcome contract) | prd: ✓ |
| 5 | **Design** | @ux-designer | ux-design-spec, brand-guidelines, `tokens.json`, `budgets.yaml`, styleguide + live route, design-deltas | distillates |
| 6 | **Architecture** | @architect | `architecture.md` (REQUIRED ADRs for flagged-deltas), data-model, api-contract, analytics-plan, arch-deltas | architecture: ✓ |
| 7 | Breakdown | @pm | epics, stories, `story-graph.yaml`, computed waves (`coldpress waves`) | — |
| 8 | Implementation | @developer + @verifier | Application code, tests (clean-room verified per story), implementation-deltas | — |
| 9 | Deployment | @devops | readiness record, staging smoke, human-triggered prod deploy, release record | — |
| 10 | Operate | @devops | ops digests (actual-vs-target outcomes), incident postmortems, ops-deltas | — |
| 11 | Evolve *(final)* | @reviewer | retrospective, product-evolution backlog, pack-harvest, framework-feedback → next iteration | — |

**Total sacred documents:** 4 (context, tech-stack, PRD, architecture)
**Total subagents available:** 8 (analyst, architect, pm, ux-designer, developer, verifier, devops, reviewer)
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
| 5.0 | 2026-07-26 | Butler (v0.4.0-alpha release bookkeeping) | **v0.4 refresh — the last v0.3-era public doc brought to shipped reality.** Header reframed: full lane at v0.4.0-alpha (Shape A label dropped), lite lane + `lane-upgrade` introduced, and a "validated against real builds" note added — the flow is anchored to the two §12 ship-gate validation runs (lite: Astro multi-page site; full: interactive React/TS app driven by the real agent team through clean-room verification and a staged production deploy). Body de-staled: knowledge graph/Graphify → native state + `_input/`-first reads; Phase 2 skills → `research`/`personas`/`validate-idea`/`product-brief`; Phase 3 gains `deploy-select` + `walking-skeleton` (local-first path); Phase 4 gains `outcome-contract`/`outcomes.yaml` thread; Phase 5 gains the four machine artifacts (tokens.json, `tokens contrast` block gate, budgets.yaml, styleguide + live route); Phase 6 lists the full skill set; Phase 7 label swap fixed + `implementation-readiness`; Phase 9 rewritten to the deploy-pack staged ship path (readiness → deploy-staging → smoke → human-triggered deploy-prod → handover; deploy-gate ordering); Phase 10 → `ops-check`/`operate-loop` with actual-vs-target outcomes; Phase 11 gains `pack-harvest` + `framework-feedback` (innovation-strategy ref dropped). Summary table updated to match. |
| 4.0 | 2026-05-17 | ColdPress Labs | **Shape A rewrite for v0.3.0-alpha.** Restructured from 8 phases to 11. Old Phase 4 (Planning) split into Phase 4 (Planning, PRD-only) + Phase 5 (Design, NEW) + Phase 6 (Architecture, NEW). Old phases 5–9 cascade-renamed to 7–11. Added Hello Butler kickoff at top. Added forward-carry quartet documentation (design-deltas at P5 exit, architecture-deltas at P7 entry, implementation-deltas at P11 batch, ops-deltas at P11 retrospective). Added silent-divergence guard P5 → P6 (REQUIRED ADRs for flagged deltas). Added inter-iteration cycle P11 → next-iteration P1. Subagent count 9 → 11 (added @reviewer for P11, @devops for P9+P10). Updated phase ownership (@pm 4+7; @architect 3+6; @ux-designer 5; @devops 9+10; @reviewer 11). Updated counts (skill wrappers ~66 → ~128; sacred docs still 5). Node ≥20 → ≥22. |
| 3.0 | 2026-04-24 | ColdPress Labs | Phase II Part 3 Wave 5.3. Phase 3 section rewritten: warm-handoff noted; 4-step flow (stack-discovery-sync with pack-match, stack-evaluation T1 fast-path + T2 rubric, stack-locking with baselines confirm + post-CLI, env-provision pack-branch); stack_pack changed from "convex" to "vibe-coder-fullstack" (pack renamed in Wave 6); summary table Phase 3 row expanded with all outputs. |
| 2.0 | 2026-04-24 | ColdPress Labs | Phase II Part 1 Wave 5.1b. Phase 1 section rewritten for the npm-era flow: `coldpress init` (pre-session CLI) replaces the retired `project-init` + `agent-scaffold` workflow; Butler's new `orient` + `intake` skills drive in-session Phase 1 (6 intake steps enumerated). Post-Phase-1 directory tree updated to include `.coldpress/`, `_context/sacred/context.md` (seed), `_context/tracking/`, `_context/handoffs/`, `_input/` (with READMEs), `scripts/check-secrets.sh`, `secure/manifest.yaml`. |
| 1.0 | 2026-04-13 | ColdPress Labs | Initial walkthrough — TaskPulse example across all 8 lifecycle phases |
