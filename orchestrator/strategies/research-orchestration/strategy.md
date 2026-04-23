# Research Orchestration Strategy

> Phase 2: Parallelizing research streams during discovery.

> **Status: reference-only.** This strategy is not auto-invoked by any skill. It is documented as a pattern for ad-hoc use by `parallelization-strategy` / `wave-orchestration` when the Phase-2 research DAG warrants it. If a future wave wires it in as a formal sub-strategy, this banner will be replaced with "wired in Wave N".

---

## When to Use

When a project requires multiple research tracks (domain, market, technical) that can run independently and converge for synthesis.

## How It Works

Research streams are mostly independent — they can run in parallel and converge at a synthesis step.

## Typical DAG

```yaml
dag:
  scope: "research"
  tasks:
    - id: "context-interview"
      name: "Pre-Project Interview"
      depends_on: []
      estimated_duration: "1d"
      
    - id: "domain-research"
      name: "Domain Research"
      depends_on: ["context-interview"]    # Needs context first
      estimated_duration: "2d"
      
    - id: "market-research"
      name: "Market Research"
      depends_on: ["context-interview"]    # Parallel with domain
      estimated_duration: "2d"
      
    - id: "technical-research"
      name: "Technical Research"
      depends_on: ["context-interview"]    # Parallel with both
      estimated_duration: "2d"
      
    - id: "synthesis"
      name: "Research Synthesis"
      depends_on: ["domain-research", "market-research", "technical-research"]
      estimated_duration: "1d"
```

## Produces

```
Wave 1: [context-interview]
Wave 2: [domain-research, market-research, technical-research]  — all parallel
Wave 3: [synthesis]
```

## Gate Criteria

- **Gate 1:** Context document reviewed and approved
- **Gate 2:** All research streams complete, findings documented with citations

## Note on Parallelism

For a solo developer with Claude Code, "parallel" research means: all three research tasks are available simultaneously, and the developer can work on them in any order. True simultaneous execution requires the Inngest runtime with separate agent sessions.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Alfred | Initial research orchestration strategy |
