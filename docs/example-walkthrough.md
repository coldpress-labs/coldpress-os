# Example Walkthrough — Building "TaskPulse" with coldpress-os

> A complete lifecycle walkthrough showing how coldpress-os drives a project from idea to deployment. Follow along or use it as a reference for what each phase produces.

---

## The Project

**TaskPulse** — A lightweight task management app for solo creators. Tracks daily tasks, measures focus time, and surfaces weekly patterns.

- **Type:** web_app
- **Domain:** productivity / saas
- **Pattern:** a (three-tier)
- **Stack pack:** convex

---

## Phase 1: Bootstrap

### What you do

```bash
mkdir taskpulse-devSandbox && cd taskpulse-devSandbox
git init
git submodule add <coldpress-os-url> coldpress-os
claude
```

```
Run coldpress-os project-init
```

### What happens

The init workflow asks you:

```
Step 1 — Gather Project Details
  Project name: TaskPulse
  Slug: taskpulse
  Type: web_app
  Domain: saas
  Stack pack: convex
  Pattern: a (three-tier)
```

Then scaffolds your directories, installs the submodule, and generates `coldpress.yaml`.

```
Run agent-scaffold
```

Generates `.claude/agents/` (9 subagents) and `.claude/skills/` (65+ thin wrappers).

### What you have after Phase 1

```
taskpulse-devSandbox/
├── coldpress-os/              # Framework
├── .claude/
│   ├── SYSTEM.md              # Butler directive
│   ├── agents/                # 9 subagent definitions
│   └── skills/                # 65+ skill wrappers
├── docs/                      # Empty — filled in Phase 2
├── _context/                   # Empty — filled in Phase 4+
├── coldpress.yaml             # Populated config
└── CLAUDE.md                  # Framework routing
```

---

## Phase 2: Discovery

### What you do

```
Run pre-project-interview
```

### What happens

Butler dispatches **@analyst** (discovery mode). The analyst asks structured questions using elicitation techniques:

```
@analyst: Let's understand your project. I'll guide you through a structured
interview to build a complete context document.

Who is the primary user of TaskPulse?
> Solo creators — freelancers, indie hackers, content creators who work alone
  and need lightweight task tracking without the overhead of Jira or Asana.

What problem does it solve?
> Existing tools are either too complex (Asana, Linear) or too simple
  (Apple Notes, sticky notes). TaskPulse sits in between — structured enough
  to track patterns, simple enough to use in 30 seconds.

What are your hard constraints?
> Free tier only (Convex free, Vercel free). Must work on mobile web.
  Solo developer (me). Ship MVP in 2-3 weeks.
```

After 10-15 questions, the analyst produces:

**Output:** `docs/context.md` — Your first sacred document. Contains project vision, user personas, constraints, domain analysis, success criteria.

### Optional follow-ups

```
Run domain-research            # → docs/domain-research.md
Run market-research            # → docs/market-research.md
Run brainstorming              # → _context/planning/brainstorming-output.md
```

---

## Phase 3: Tech Stack

### What you do

```
Run stack-evaluation
```

### What happens

Butler dispatches **@architect**. The architect reads `docs/context.md`, evaluates options against your constraints (free tier, solo dev, mobile web), and produces a recommendation.

Since you already specified `stack_pack: convex` in `coldpress.yaml`, the evaluation focuses on complementary choices:

```
@architect: Based on your constraints (free tier, solo dev, mobile web):

  Backend:   Convex (real-time, serverless, generous free tier)
  Frontend:  Next.js 14 (App Router, server components)
  Auth:      Convex Auth (built-in, no third-party cost)
  Hosting:   Vercel (free tier, auto-deploy from git)
  Styling:   Tailwind CSS (utility-first, fast iteration)
```

Then:

```
Run stack-locking
```

**Output:** `docs/tech-stack.md` — Your second sacred document. Locked decisions with rationale.

---

## Phase 4: Planning

### What you do

```
Run create-prd
```

### What happens

Butler dispatches **@pm**. The PM reads `docs/context.md` and `docs/tech-stack.md`, then walks you through a structured PRD creation workflow:

- Core features (task CRUD, focus timer, weekly patterns)
- User stories (as a solo creator, I want to...)
- Acceptance criteria
- Out of scope (team features, integrations, mobile native)
- Success metrics (daily active usage, task completion rate)

**Output:** `_context/planning/prd.md` — Third sacred document.

### Continue planning

```
Run create-architecture        # @architect → _context/planning/architecture.md [SACRED]
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

**Output:** `_context/tracking/pert-chart.md` — Fifth sacred document.

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

## Phase 8: Evolve

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
| 2. Discovery | `docs/context.md`, research docs | context.md: Yes |
| 3. Tech Stack | `docs/tech-stack.md` | Yes |
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
| 1.0 | 2026-04-13 | Alfred | Initial walkthrough — TaskPulse example across all 8 lifecycle phases |
