# Example Walkthrough — Building "TaskPulse" with coldpress-os

> A complete lifecycle walkthrough showing how coldpress-os drives a project from idea to deployment. Follow along or use it as a reference for what each phase produces.

---

## The Project

**TaskPulse** — A lightweight task management app for solo creators. Tracks daily tasks, measures focus time, and surfaces weekly patterns.

- **Type:** web_app
- **Domain:** productivity / saas
- **Pattern:** a (three-tier)
- **Stack pack:** vibe-coder-fullstack (auto-matched in Phase 3 stack-discovery-sync)

---

## Phase 1: Bootstrap

### What you do

```bash
cd ~/code
coldpress init taskpulse        # positional name skips the first prompt
cd taskpulse
claude                          # open Claude Code in the scaffolded project
```

### What happens in the CLI (pre-session)

`coldpress init`:

1. Runs `coldpress doctor` (silent pre-flight) — verifies Node ≥ 20, git ≥ 2.30, Claude Code CLI.
2. Prompts for slug + user name (only the ones not provided as flags).
3. Copies the template tree (including 5 `_input/` subfolders: `assets/`, `vendor/`, `raw/`, `legacy/`, `reference/` — each with a README explaining purpose).
4. Copies the coldpress-os framework into `coldpress-os/`.
5. Generates ~66 `.claude/skills/` wrappers + interop outputs (AGENTS.md, Cursor, Roo, OpenHands, Cline).
6. Runs `git init` + initial commit + installs the pre-commit secret-scan hook.

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
│   ├── agents/                # 9 subagent definitions
│   └── skills/                # 66+ skill wrappers
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
@ux-designer personas          # → _context/planning/personas-{date}.md
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

`synthesize-research` consolidates all research + validation using Systems Thinking + Morphological Analysis, then runs `adversarial-review` + `editorial-structure` for quality. `product-brief` is a 1-2 page executive brief read from the synthesis — a **validated distillate**, not a sacred doc. It's versioned and regeneratable.

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

Decision 2 of 5: Backend.
  Pack pre-picks Convex (T1). Accept or override?
  > accept
  ...

Decision 5 of 5: Testing.
  No pack pre-pick. Pre-loaded options (T2): Vitest / Jest / Playwright.
  [rubric walk: fit 8, cost 10, familiarity 9, ecosystem 9, lock-in 10, vibe_fit 9 → Vitest]
```

**Output:** `_context/planning/adrs/adr-{area}-v1.md` per decision-area.

### Step 3: stack-locking

```
Run stack-locking
```

Butler dispatches **@architect**:

```
@architect: ADR inventory — 5 decisions, all accepted. No red flags. (Step 3a passed.)

  Baselines confirmation (Step 5a):
  ✅ accessibility — covered by pack (Tailwind + Clerk) → confirm
  ✅ security — covered by pack (Clerk + Convex row-security) → confirm
  → seo_aeo_llm — not covered by pack → confirm (adds llms.txt + sitemap in env-provision)
  → future_proof — not covered → confirm (adds tsconfig strict + ES2022 targets)
```

```
coldpress update --post-phase-3   ← run this in terminal before continuing
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

## Phase 4: Planning

### What you do

```
Run create-prd
```

### What happens

Butler dispatches **@pm**. The PM reads `_context/sacred/context.md` and `_context/sacred/tech-stack.md`, then walks you through a structured PRD creation workflow:

- Core features (task CRUD, focus timer, weekly patterns)
- User stories (as a solo creator, I want to...)
- Acceptance criteria
- Out of scope (team features, integrations, mobile native)
- Success metrics (daily active usage, task completion rate)

**Output:** `_context/sacred/prd.md` — Third sacred document.

### Continue planning

```
Run create-architecture        # @architect → _context/sacred/architecture.md [SACRED]
Run create-ux-design           # @ux-designer → _context/design/ux-design-spec.md
```

After this phase, you have 4 sacred documents and a UX spec.

---

## Phase 5: Breakdown

### What you do

```
Run create-epics
```

### What happens

Butler dispatches **@pm** to break the PRD into epics:

```
Epic 1: Core Task Management (CRUD, categories, priorities)
Epic 2: Focus Timer (start/stop, session tracking, daily totals)
Epic 3: Weekly Patterns (aggregation, visualization, insights)
Epic 4: Auth & Onboarding (sign-up, login, first-run experience)
```

**Output:** `_context/planning/epics/`

Then:

```
Run create-stories             # Breaks epics into implementable stories
Run parallelization-strategy   # Generates PERT chart + wave execution plan
Run sprint-planning            # Organizes stories into sprints
```

The **@scrum-master** (haiku — fast and organizational) generates the PERT chart showing dependencies and the critical path.

**Output:** `_context/sacred/pert-chart.md` — Fifth sacred document.

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

## Phase 6: Implementation

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
Run code-review                # @qa reviews the code
Run qa-automation              # @qa generates/runs test suites
```

### For parallel stories (Wave 1)

```
Build stories 1.1 and 4.1 in parallel
```

Butler dispatches two **@developer** subagents concurrently (one per story), since the wave plan shows they have no dependencies.

---

## Phase 7: Deployment

### What you do

```
Run readiness-check
```

### What happens

Butler dispatches **@qa** to verify:

```
@qa: Deployment readiness assessment:

  ✅ All stories in current sprint: implemented
  ✅ Test coverage: 87% (target: 80%)
  ✅ No critical security findings
  ✅ Environment variables configured
  ✅ Convex deployment: production ready
  ⚠️  No error monitoring configured (recommend Sentry free tier)

Recommendation: READY TO DEPLOY with advisory on monitoring.
```

Then:

```
Run security-scan              # Check for vulnerabilities
Run env-check                  # Verify environment configuration
Run deploy                     # Execute deployment
```

---

## Phase 8: Operate & Phase 9: Evolve

*(Post-split: operational work — correct-course / sprint-status / document-project — is Phase 8; post-release learning — retrospective / product-evolution / innovation-strategy — is Phase 9. The walkthrough below covers a representative Phase 9 retrospective.)*

### What you do (after your first sprint ships)

```
Run retrospective
```

### What happens

Butler dispatches **@scrum-master**:

```
@scrum-master: Sprint 1 Retrospective

  Completed: 8/10 stories (80%)
  Velocity: 34 story points
  Blocked: Story 3.2 (pattern viz) — deferred to Sprint 2

  What went well:
  - Convex schema design was clean, no migrations needed
  - Parallel waves saved ~3 days vs sequential

  What to improve:
  - UX spec for weekly patterns was underspecified
  - Should have run design-thinking before Phase 4 for this feature

  Actions:
  - Run design-thinking for weekly patterns before Sprint 2
  - Add pattern viz wireframes to UX spec
```

### Course correction

```
Run correct-course             # Adjust plan based on learnings
Run product-evolution          # Evolve the product vision
```

---

## Summary: What Each Phase Produced

| Phase | Key Outputs | Sacred? |
|-------|-------------|---------|
| 1. Bootstrap | Project structure, `coldpress.yaml`, agent wrappers | No |
| 2. Discovery | `_context/sacred/context.md`, research docs | context.md: Yes |
| 3. Tech Stack | `_context/sacred/tech-stack.md`, ADRs, `stack-selection-summary-v1.md`, `coldpress.yaml` (stack_pack + baselines) | tech-stack.md: Yes |
| 4. Planning | PRD, architecture, UX spec | PRD + architecture: Yes |
| 5. Breakdown | Epics, stories, PERT chart, sprint plan | PERT: Yes |
| 6. Implementation | Application code, tests, handoff artifacts | No |
| 7. Deployment | Readiness report, deployed application | No |
| 8. Evolve | Retrospective, course corrections | No |

**Total sacred documents:** 5 (context, tech-stack, PRD, architecture, PERT)
**Total subagents used:** All 9 across the lifecycle
**Total skills invoked:** ~20 (out of 65+ available)

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0 | 2026-04-24 | Cadbury-hq | Phase II Part 3 Wave 5.3. Phase 3 section rewritten: warm-handoff noted; 4-step flow (stack-discovery-sync with pack-match, stack-evaluation T1 fast-path + T2 rubric, stack-locking with baselines confirm + post-CLI, env-provision pack-branch); stack_pack changed from "convex" to "vibe-coder-fullstack" (pack renamed in Wave 6); summary table Phase 3 row expanded with all outputs. |
| 2.0 | 2026-04-24 | Cadbury-hq | Phase II Part 1 Wave 5.1b. Phase 1 section rewritten for the npm-era flow: `coldpress init` (pre-session CLI) replaces the retired `project-init` + `agent-scaffold` workflow; Butler's new `orient` + `intake` skills drive in-session Phase 1 (6 intake steps enumerated). Post-Phase-1 directory tree updated to include `.coldpress/`, `_context/sacred/context.md` (seed), `_context/tracking/`, `_context/handoffs/`, `_input/` (with READMEs), `scripts/check-secrets.sh`, `secure/manifest.yaml`. |
| 1.0 | 2026-04-13 | Alfred | Initial walkthrough — TaskPulse example across all 8 lifecycle phases |
