# Orchestrator — Generalized Parallelization Engine

> Transforms dependency graphs into parallel execution waves with human approval gates. Works for epics, research streams, planning tracks, test suites, and deployment steps.

---

## What This Is

The orchestrator takes **any set of tasks with dependencies** and produces:

1. **A DAG** (Directed Acyclic Graph) — defining what depends on what
2. **Waves** — groups of tasks that can run in parallel (via topological sort)
3. **A PERT chart** — critical path analysis with time estimates
4. **Human gates** — approval checkpoints between waves
5. **Status tracking** — real-time progress of waves and tasks

## Origin

Generalized from a prior ColdPress Labs project's epic orchestrator, which parallelized epic execution. The original reduced a 16-week sequential timeline to ~8 weeks through 4 parallel waves.

## How It Works

```
Input: Tasks + Dependencies (DAG)
  ↓
Step 1: Topological Sort → assign tasks to waves
  ↓
Step 2: Critical Path Analysis → identify bottlenecks
  ↓
Step 3: PERT Generation → time estimates, calendar projections
  ↓
Step 4: Execution → run wave, human gate, next wave
```

### Example

Given 9 epics with dependencies:
```
Epic 1: Foundation (no deps)
Epic 2: Auth (depends on 1)
Epic 3: Core Features (depends on 2, 6)
Epic 6: API Layer (depends on 1)
...
```

Topological sort produces:
```
Wave 1: [Epic 1]               — sequential
Wave 2: [Epic 2, Epic 6]       — parallel
Wave 3: [Epic 3, Epic 5, Epic 7] — parallel
Wave 4: [Epic 4, Epic 8, Epic 9] — parallel
```

Critical path: `Epic 1 → Epic 2 → Epic 3 → Epic 4` (8 weeks vs 16 sequential).

## Applicability Across Lifecycle

| Phase | Parallelization Use Case |
|-------|--------------------------|
| 2 (Discovery) | Market + domain + technical research → parallel streams, converge at synthesis |
| 4 (Planning) | PRD + UX + architecture → partially parallel with dependency awareness |
| 5 (Breakdown) | Generate full-project PERT chart at sprint planning |
| 6 (Implementation) | Epic waves — the core use case |
| 7 (Deployment) | Parallel environment setup, canary rollouts |

## Directory Structure

```
orchestrator/
├── README.md                          # This file
├── engine/                            # Core algorithms and protocols
│   ├── dag-parser.md                  # How to define dependency DAGs
│   ├── wave-grouper.md               # Topological sort → wave assignment
│   ├── pert-generator.md             # PERT chart and critical path generation
│   ├── gate-protocol.md              # Human approval gate specification
│   └── runtime-adapters.md           # Inngest, GitHub Actions, local execution
├── strategies/                        # Pre-built orchestration strategies
│   ├── epic-orchestration/            # Phase 6: parallel epic waves
│   ├── research-orchestration/        # Phase 2: parallel research streams
│   ├── planning-orchestration/        # Phase 4: parallel planning tracks
│   ├── test-orchestration/            # Phase 6: parallel test suites
│   └── deployment-orchestration/      # Phase 7: parallel env setup
├── templates/                         # Reusable templates
│   ├── dag-template.yaml              # DAG definition format
│   ├── pert-template.md               # PERT chart output format
│   └── wave-status-template.yaml      # Wave progress tracking
└── code/                              # Reference implementation
    └── orchestrator-complete.ts       # Production Inngest implementation
```

## Key Design Decisions

1. **DAG-first.** Everything starts with declaring dependencies. The engine does the rest.
2. **Human gates are mandatory.** No wave advances without explicit approval. "Reflection agent proposes; humans explicitly promote."
3. **Runtime-agnostic.** The engine describes patterns; runtime adapters implement them. Inngest for production, local for development.
4. **Free tier first.** Inngest's 100K invocations/month handles any single-developer project for free.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Alfred | Initial orchestrator — generalized from BMAD Epic Orchestrator |
