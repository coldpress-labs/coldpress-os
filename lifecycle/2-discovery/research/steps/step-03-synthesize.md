---
step_number: 3
step_name: "Synthesize"
step_goal: "Transform raw findings into insights (domain/market) or a classified, severity-tagged constraint set (constraints)"
halts_for_input: false
next_step: "step-04-report.md"
---

## Goal

Distill research into what actually matters for the project. This step's shape differs the most across foci: `domain`/`market` produce narrative insight; `constraints` produces a structured, severity-tagged set — it is **not** a technology comparison (that's Phase 3's job).

## Instructions

### §Domain

1. **Identify key themes** across findings.
2. **Extract implications** for the project — how does this domain knowledge affect product decisions?
3. **Note opportunities and risks** specific to the domain.
4. **Compile a terminology glossary** for the domain.

### §Market

1. **Build a competitive matrix** comparing features, pricing, positioning.
2. **Identify market gaps** — where competitors are weak or absent.
3. **Define a positioning opportunity** for this project.
4. **Assess market viability** — is there room for another player?

### §Constraints

1. **Group constraints by axis** (compliance / protocol / performance / accessibility / regulatory / locale / device).
2. **De-duplicate overlapping sources** — one constraint may surface from multiple authorities; keep the most authoritative, cite the rest.
3. **Tag severity:**
   - **Blocking** — violation means the product cannot ship or cannot serve a key audience.
   - **Preferred** — violation degrades quality but doesn't block.
   - **Aspirational** — stretch target for later phases.
4. **Surface conflicts** — when two constraints pull in opposite directions (e.g., local-first latency vs multi-region residency), flag explicitly for Phase 3 to resolve.
5. **Draft implications** — for each blocking constraint, note the downstream phase most affected (Phase 3 stack / Phase 4 architecture / Phase 4 UX).

## Output

Synthesized insights (domain/market) or a classified, de-duplicated, severity-tagged constraint set with conflict flags (constraints). `step_3_complete: true`

## Navigation

→ Auto-proceed to [step-04-report.md](step-04-report.md)

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 to 2026-04-24 | Alfred, Cadbury-hq | Original per-skill Step 3s (`domain-research`/`market-research` "Synthesize", `constraint-research` "Synthesise Constraints"). |
| 2.0 | 2026-07-02 | Butler | Merged into `research` Step 3 with focus branches (WS5-B, §8 item 6). |
