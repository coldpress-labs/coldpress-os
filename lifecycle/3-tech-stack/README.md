---
phase: 3
name: "Tech Stack"
description: "Evaluate technology options, lock the stack, and set up the development environment"
prerequisites:
  - "Phase 2 (Discovery) complete"
  - "_context/sacred/context.md produced and validated"
outputs:
  - "_context/sacred/tech-stack.md (SACRED)"
  - "ADRs in _context/planning/adr-{decision}-{date}.md"
  - "Configured development environment"
next_phase: "4-planning"
---

# Phase 3: Tech Stack

> Choose your tools deliberately, lock them authoritatively, and set up the environment so you can start building with confidence.

## What Happens Here

1. **Stack Evaluation** — Evaluate technology options for each decision area and produce Architecture Decision Records (ADRs)
2. **Stack Locking** — Consolidate all ADRs into `_context/sacred/tech-stack.md` (sacred document)
3. **Vibe Coder Setup** — Install dependencies, configure tooling, and verify the dev environment works

## Sub-Skills

| Sub-Skill | Type | Agent | Description |
|-----------|------|-------|-------------|
| [stack-evaluation](stack-evaluation/) | workflow | architect | Evaluate tech options and produce ADRs |
| [stack-locking](stack-locking/) | workflow | architect | Consolidate ADRs into sacred tech-stack.md |
| [vibe-coder-setup](vibe-coder-setup/) | workflow | developer | Set up dev environment from locked stack |

## Entry Conditions

- Phase 2 complete (discovery finished)
- `_context/sacred/context.md` exists and is validated
- User has enough domain/market/technical understanding to make stack decisions

## Exit Conditions

- All major technology decisions documented as ADRs
- `_context/sacred/tech-stack.md` produced, validated, and marked as sacred
- Development environment configured and verified (build, lint, test all pass)
- User is confident in the chosen stack and ready to plan implementation

## Recommended Flow

```
stack-evaluation (repeat for each technology decision area)
  ↓
stack-locking (consolidate all ADRs into tech-stack.md)
  ↓
vibe-coder-setup (install, configure, verify)
  ↓
→ Phase 4: Planning
```

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Initial Phase 3 definition |
