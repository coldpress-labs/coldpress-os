# Runtime Adapters — Execution Backends

> The orchestrator's algorithms are runtime-agnostic. Adapters map them to specific execution platforms.

---

## Available Runtimes

| Runtime | Best For | Cost | Durability | Gate Support |
|---------|----------|------|------------|--------------|
| **Inngest** | Production projects with multiple agents | Free (100K/mo) | Full (survives restarts) | Native event-based |
| **Claude Code (Local)** | Solo developer, single session | Free | Session-only | Conversational |
| **GitHub Actions** | CI/CD integrated projects | Free (2K min/mo) | Workflow-based | Environment protection rules |

## Inngest Adapter

The primary production runtime. Uses durable workflows with event-driven coordination.

### Key Patterns

- **`step.run(name, fn)`** — Durable step with automatic retry (3x)
- **`step.waitForEvent(name, opts)`** — Async wait for external event
- **`Promise.all([...])`** — Parallel execution within a wave
- **`inngest.send(event)`** — Trigger downstream functions

### Event Schema

```
orchestration/start     → Kicks off the orchestrator
epic/run                → Triggers individual epic execution
epic/complete           → Signals epic completion
orchestration/approve   → Human gate approval
orchestration/halt      → Emergency stop
```

### Cost Analysis

For a typical project (9 epics × 4 agents per epic):
- ~36 function invocations
- ~36 step executions
- Well within Inngest free tier (100K/month)

## Claude Code (Local) Adapter

For solo developers working in a single Claude Code session.

### How It Works

Butler acts as the orchestrator directly:
1. Reads the DAG and wave grouping
2. Presents current wave tasks
3. User works through tasks (invoking skills)
4. Butler tracks completion in wave-status.yaml
5. Butler presents gate for approval
6. On approval, Butler presents next wave

### Limitations

- No true parallelism (single agent)
- State only persists within session (relies on wave-status.yaml for resume)
- Best for sequential execution of waves, even if tasks within a wave are independent

## GitHub Actions Adapter

For teams using GitHub as their development platform.

### How It Works

- Each wave maps to a GitHub Actions workflow job
- Job dependencies enforce wave ordering
- Environment protection rules serve as human gates
- Parallel tasks run as matrix jobs within a wave

### Limitations

- 2,000 free minutes/month on private repos
- Gate approval requires GitHub web UI
- Less flexible than Inngest for complex orchestration

## Choosing a Runtime

```
Solo developer, single session?
  → Claude Code (Local)

Need durability across sessions?
  → Inngest

Already deep in GitHub ecosystem?
  → GitHub Actions

Multiple concurrent developers?
  → Inngest
```

## All Runtimes Share

Regardless of runtime choice:
- Same DAG format (dag-template.yaml)
- Same wave-status tracking (wave-status-template.yaml)
- Same PERT chart output (pert-template.md)
- Same gate criteria and approval flow
- Same skill invocations within tasks

The runtime only affects HOW tasks are triggered and HOW gates are enforced — not WHAT runs.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Alfred | Initial runtime adapters spec |
