---
name: "decision-logger"
description: "Lightweight ADR companion. Capture non-architectural decisions (process, scope, prioritisation, vendor choice, naming, etc.) that don't warrant a full ADR but should still be auditable. Emits dated decision-log entries with context + alternatives + rationale."
type: "simple"
category: "utilities"
agent: "pm"
on-demand: true   # WS11 S4: invoked directly (no lifecycle route) — audited keep
phases: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
license: "MIT"
version: "1.0"
updated: "2026-05-03"
inputs:
  graph_queries:
    - "Decision nodes (existing decision-log entries)"
  cold_file_reads:
    - "_context/audit/decision-log.md"
  existence_checks:
    - "_context/audit/ (created if missing)"
outputs:
  - artifact: "Decision log entry"
    location: "_context/audit/decision-log.md"
    format: "markdown"
    sacred: false
---

## Purpose

ADR is heavy machinery for architectural decisions (Phase 3 + 6). Many real decisions during a project's life are **non-architectural** — vendor pick, naming choice, process tweak, scope cut, prioritisation call — but still worth durable audit. This skill is the lightweight option: append a dated row to `_context/audit/decision-log.md` with context + alternatives + rationale.

If a decision touches sacred-doc invariants (architecture, PRD scope, tech-stack lock), use the heavier `sacred-change` skill (enforced by the `sacred-guard` hook) instead.

## When to Use (Proactive Triggers)

1. User says "log this decision" / "record decision" / "audit this call"
2. Mid-phase choice with future-second-guessing potential (vendor pick, library swap, naming convention)
3. Best-call autonomous decisions during /loop or autonomous queues (mirrors `docs/autonomous-decisions-log.md` pattern)
4. Retrospective input — entries surface during Phase 11 cause analysis
5. Cross-team handoffs — "we decided X because Y" written down once

## Output Artifacts

1. **Decision log entry** appended to `_context/audit/decision-log.md` — single row per decision with: id, date, phase, question/choice, decision, reasoning, reversibility, supersedes
2. **Phase tag** — entries are phase-tagged so Phase 11 retrospective can filter (`grep "| 5 |" decision-log.md` finds Phase 5 decisions)
3. **Reversibility tag** — Trivial / High / Medium / Low — guides future "should we revisit this?" queries
4. **Optional supersedes** field — when a new decision overrides an earlier one (audit trail preserved)

## Prerequisites

- `_context/audit/` directory exists (created automatically if not)
- For first invocation: emits header + table-shape comment

## Process

1. **If `_context/audit/decision-log.md` doesn't exist**, create with header:
   ```markdown
   # Decision Log

   > Lightweight non-architectural decisions. ADRs (`_context/planning/adrs/`) are the heavier path for architectural calls.

   | # | Date | Phase | Question / Choice | Decision | Reasoning | Reversibility | Supersedes |
   |---|------|-------|-------------------|----------|-----------|---------------|-----------|
   ```

2. **Compute next ID** — `grep "^| [0-9]" decision-log.md | tail -1 | awk` for the last numeric ID; +1.

3. **Gather inputs** from user (or autonomous caller):
   - **Question / Choice** — one sentence framing the decision
   - **Decision** — what was actually decided
   - **Reasoning** — 1-3 sentences why (alternatives + tradeoffs)
   - **Reversibility** — Trivial / High / Medium / Low
   - **Supersedes** — earlier decision ID if applicable, else `—`

4. **Append row** to the decision log table.

5. **Surface to user**: "Decision #<N> logged at `_context/audit/decision-log.md`. <decision summary>. Reversibility: <level>."

## Activation-Gate Checklist

- [ ] Decision text is concrete (not "we'll figure it out later")
- [ ] Reasoning includes at least one alternative considered
- [ ] Reversibility tag set (forces explicit thinking about cost-of-reverse)
- [ ] If supersedes prior entry: the prior entry is referenced by ID (not deleted)
- [ ] Phase tag matches current lifecycle phase

## Output

Single appended row to `_context/audit/decision-log.md`. Phase 11 retrospective consumes the log for cause analysis (low-reversibility decisions that backfired are first-class signals).

## Relationship to other audit logs

- **`_context/planning/adrs/`** (heavier, sacred-doc-adjacent) — architecture decisions only
- **`_context/audit/decision-log.md`** (this skill) — everything else worth auditing
- **`docs/autonomous-decisions-log.md`** (estate-level, hq-p001-only) — autonomous-loop best-call records

A decision can graduate from this lightweight log to a full ADR if it turns out to be architectural in retrospect. Note the graduation in both files (supersede-by reference).

## Source Attribution

Pattern adapted from `alirezarezvani/claude-skills` (MIT) `decision-logger` skill. Implementation original to coldpress-os; integrates with existing `docs/autonomous-decisions-log.md` pattern.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-03 | Andy-coldpress-os (Unit #28 / U04) | Initial decision-logger skill. Authored to v0.3.0-alpha SKILL-AUTHORING-STANDARD. Pattern from alirezarezvani/claude-skills (MIT). |
