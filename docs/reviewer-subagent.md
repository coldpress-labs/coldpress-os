---
name: reviewer-subagent
description: @reviewer — the dedicated pure-critic subagent. Read-only tools; emits structured JSON rubrics at phase boundaries; invoked by the orchestrator, not by Butler directly
version: "1.0"
---

# `@reviewer` (§6.2)

> Coldpress-os had no pure critic before this block. PRD review was an @pm side-task; story review was a @qa side-task; architecture review was an @architect side-task. Critics that can also produce tend to collapse reviewing into re-authoring. This doc specifies a dedicated pure-critic subagent with read-only tools whose only output is a structured rubric.

**Source decision:** bmad-family-positioning-brief-2026-04-23.md §"Dedicated-critic subagent audit" — audit found no pure-critic subagent in the framework; this block fills the gap.

---

## Hard rule — pure critic

| | @reviewer | Producer subagents (@pm, @architect, …) |
|---|---|---|
| Tools | `Read`, `Grep`, `Glob` only | full toolset (Edit, Write, Bash) |
| Writes | Review reports at `_context/audit/reviews/` | sacred docs, planning artefacts, code |
| Dispatched by | Orchestrator (at phase boundaries) | Butler |
| Output shape | `ReviewRubric` JSON ([schema](../schemas/reviewer-rubric.schema.ts)) | various artefacts |
| Re-runnable | Yes — idempotent given identical inputs | No — produces new artefacts |

The read-only constraint is **load-bearing**, not aesthetic. The whole point of a dedicated critic is that they cannot be tempted to "fix it for them" — that's the producer's job. Reviewer rubrics name the gap; remediation lives in the producer's next pass.

---

## Canonical review pairings

The orchestrator invokes `@reviewer` at phase boundaries with two inputs:

| Phase | Artefact | Criteria source |
|-------|----------|-----------------|
| 4 | `_context/sacred/prd.md` | `_context/sacred/context.md` |
| 4 | `_context/sacred/architecture.md` | `_context/sacred/tech-stack.md` + `_context/sacred/prd.md` |
| 5 | `_context/planning/epics-stories/*.md` | `_context/sacred/prd.md` |
| 6 | implementation output (story-marked-done batches) | their story's acceptance criteria |
| 7 | NFR assessment | `_context/sacred/architecture.md` non-functional section |

Adding a pairing is a `coldpress.yaml` `review:` config concern (Wave 6 follow-up); the schema lands here.

---

## The rubric — `ReviewRubric` JSON

Schema at [`schemas/reviewer-rubric.schema.ts`](../schemas/reviewer-rubric.schema.ts):

```ts
interface ReviewRubric {
  schema_version: 1;
  reviewer_version: string;
  artefact_path: string;
  criteria_source: string;
  reviewed_at: string;             // ISO-8601
  overall: "pass" | "warn" | "fail";
  criteria: RubricRow[];           // ≥1 row
  notes?: string;                  // free-form observations
}

interface RubricRow {
  id: string;                      // kebab-case slug
  description: string;
  status: "pass" | "fail";
  severity: "low" | "medium" | "high";
  evidence: string;                // quote/line ref FROM THE ARTEFACT
  remediation: string;             // one-sentence gap statement; "" on pass
}
```

### Aggregation rule (computed, not declared)

`overall` is derived from `criteria[]`:
- `pass` — every row's status is `pass`
- `fail` — at least one row with `status: fail` AND `severity: high`
- `warn` — otherwise (some failures but none high)

`computeOverall()` ships with the schema. The Zod schema enforces that the declared `overall` matches `computeOverall(criteria)` — a rubric where the producer claims `pass` but has a failing high-severity row is rejected at validation time. **No fudging the verdict.**

### Where the rubric lands

`_context/audit/reviews/<artefact-basename>-review-{YYYYMMDD}.json`

Per Block R's canonical-subfolder mapping. Audit-shaped artefact under `_context/audit/`.

---

## Critical rules for the @reviewer persona

1. **Review only against the explicit criteria source.** Don't invent requirements. The orchestrator hands you the criteria — those are the rubric rows, no more.
2. **Evidence comes from the artefact.** Quote from the artefact under review, not from the criteria file. Pure grounding.
3. **Don't propose rewrites.** `remediation` is one sentence identifying the gap. Rewriting is the producer's job.
4. **No editorial opinions.** "This PRD could be more compelling" is not a rubric row. "The vision statement lacks a time bound" is.
5. **Idempotent.** Running you twice on the same inputs produces identical rubric rows (modulo `reviewed_at`).
6. **Emit `<NEED_INFO>` when criteria are silent.** Don't score generously. Default routing for `acceptance-criteria-unclear` goes to @pm to decide whether to defer the check or escalate.

---

## Wiring with the rest of the framework

### Phase-gate protocol (§5.0)

A failing-`high` rubric row is a gate blocker. The phase-gate evaluator (`evaluate-phase-gate`) MAY consume `_context/audit/reviews/*.json` as automated `acceptance_check` inputs — wires in a Wave 6 follow-up; Block EE ships the schema substrate.

### EventStream (§6.4)

`@reviewer` dispatches emit `skill-invoke` (skill: a notional `review-artefact` skill that the orchestrator dispatches) and `skill-result` (with `artifact_path` pointing at the rubric JSON). The reviewer itself doesn't emit events directly; the orchestrator that invoked it does.

### `<NEED_INFO>` (§5.4)

Reviewer's `## When to Emit <NEED_INFO>` section in `template/.claude/agents/reviewer.md` defaults to `acceptance-criteria-unclear` (routes to @pm). Reviewers don't typically emit `prd-ambiguity` themselves — the PM owns that route as the receiver.

### Interop generator (Wave 2 §2.8)

`runInterop` reads `template/.claude/agents/*.md` dynamically — no code change needed; reviewer.md is auto-included in AGENTS.md, .cursor/rules/reviewer.mdc, .roomodes (8 customModes), .openhands/microagents/reviewer.md, and .clinerules. Test counts track the agent roster in `test/interop.test.ts`.

---

## Why haiku, not sonnet

Reviewing against an explicit rubric is a high-recall, low-creativity task — the model just needs to ground every criterion in evidence. Haiku is faster + cheaper + more deterministic for this shape than Sonnet, and the read-only tool restriction means there's no risk of haiku "guessing" its way into bad writes. Override per-project if a particular review surface (e.g., security NFR review) needs deeper reasoning — `coldpress.yaml` agent-mode override TBD in the archetypes block (FF).

---

## What's NOT in this protocol

- **Auto-remediation.** `remediation` is a one-sentence gap statement, not a fix. Rewriting is the producer's job.
- **Cross-artefact rubrics.** One review = one artefact. Reviewing the PRD AND architecture together is two invocations.
- **Rubric versioning across runs.** Each run produces a new dated JSON; diffing two runs is a downstream concern (dashboard, dedicated diff skill).
- **Reviewer dispatching skills.** Reviewer reads + emits JSON; it never invokes other skills. If a check requires running something (e.g., type-checking the implementation), that's an `automated` `acceptance_check` in the phase gate, not a reviewer responsibility.

---

## See also

- [`schemas/reviewer-rubric.schema.ts`](../schemas/reviewer-rubric.schema.ts) — the typed contract.
- [`template/.claude/agents/reviewer.md`](../template/.claude/agents/reviewer.md) — the persona.
- [`subagent-phase-matrix.md`](subagent-phase-matrix.md) — global subagent × phase matrix; `@reviewer` slots in at phase boundaries.
- [`phase-gate-protocol.md`](phase-gate-protocol.md) — §5.0 gate protocol; failing-high rubric rows feed in as gate blockers.
- [`need-info-protocol.md`](need-info-protocol.md) — `<NEED_INFO>` protocol; reviewer emits `acceptance-criteria-unclear` when stumped.
