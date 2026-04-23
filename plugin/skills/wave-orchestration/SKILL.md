---
name: wave-orchestration
description: Execute parallel epic waves from the PERT chart with human gates
license: MIT
compatibility: Invoked by @scrum-master in Phase 6
version: "1.0"
---

## Purpose

Orchestrates parallel execution of epic waves as defined by the PERT chart. Identifies which stories can be worked in parallel, tracks wave completion, manages human approval gates between waves, and updates the project PERT chart.

## When to Use

- "start wave execution"
- "what can I work on in parallel?"
- "next wave"
- When implementing multiple stories across epics
- When maximizing parallelization during implementation

## Prerequisites

- PERT chart with wave assignments
- sprint-status.yaml with current statuses

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

Wave status tracking document with completion progress and next wave recommendations.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Alfred | New skill for coldpress-os parallel execution |
