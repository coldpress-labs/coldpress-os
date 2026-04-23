---
phase: 2
name: "Discovery"
description: "Research, context gathering, and problem understanding before planning"
prerequisites:
  - "Phase 1 (Bootstrap) complete"
  - "coldpress.yaml configured"
outputs:
  - "docs/context.md (SACRED)"
  - "Research documents in _context/planning/research/"
next_phase: "3-tech-stack"
---

# Phase 2: Discovery

> Understand the problem space, users, market, and domain before making any technical or product decisions.

## What Happens Here

1. **Pre-Project Interview** — Structured interview to produce `context.md` (sacred document)
2. **Domain Research** — Deep dive into the industry/domain with web research
3. **Market Research** — Competitive analysis and market landscape
4. **Technical Research** — Technology evaluation and feasibility research
5. **Brainstorming** — Creative ideation sessions (available on demand)
6. **Design Thinking** — Human-centered design exploration (available on demand)

## Sub-Skills

| Sub-Skill | Type | Agent | Description |
|-----------|------|-------|-------------|
| [pre-project-interview](pre-project-interview/) | workflow | analyst | 10-phase structured interview → context.md |
| [domain-research](domain-research/) | workflow | analyst | Domain/industry deep-dive with web research |
| [market-research](market-research/) | workflow | analyst | Market analysis and competitive landscape |
| [technical-research](technical-research/) | workflow | analyst | Technology feasibility and evaluation |
| [brainstorming](brainstorming/) | router | analyst | → `skills/creative/brainstorming/` |
| [design-thinking](design-thinking/) | router | analyst | → `skills/creative/design-thinking/` |

## Entry Conditions

- Phase 1 complete (project initialized)
- User is ready to define the project scope

## Exit Conditions

- `docs/context.md` produced and validated (sacred document)
- At least one research document produced (domain, market, or technical)
- User feels confident enough about the problem space to proceed to tech stack selection

## Recommended Flow

```
pre-project-interview (ALWAYS first — produces context.md)
  ↓
domain-research + market-research + technical-research (parallel, as needed)
  ↓
brainstorming / design-thinking (optional, on demand)
  ↓
→ Phase 3: Tech Stack
```

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Initial Phase 2 definition |
