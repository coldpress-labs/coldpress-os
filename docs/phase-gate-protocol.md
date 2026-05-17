---
name: phase-gate-protocol
description: Phase exit criteria as machine-readable contracts — schema, per-phase gate.json files, evaluator skill, orchestrator integration
version: "1.0"
---

# Phase-Gate Protocol

> Before this protocol, phase exit criteria were prose in each phase's README — "user feels confident the PRD is complete." Prose is unverifiable: different subagents and humans interpret the same sentence differently; phase transitions slip; "complete" becomes whatever the last person to look at it said. This protocol replaces prose with a structured contract — `gate.json` per phase, Zod-validated, evaluator-driven.

**Source decision:** [framework-audit-2026-04-23.md §3, §9](../../../lab-hq-projects/hq-p001-coldpress-os/docs/framework-audit-2026-04-23.md) — audit flagged prose-only exit criteria as a scaling blocker.

**Supersedes:** the prose-only spec previously in `orchestrator/engine/gate-protocol.md` (retained for historical reference; this doc is the v1+ authoritative protocol).

---

## The four layers

| Layer | What | Where |
|-------|------|-------|
| **1. Schema** | Zod definitions for `PhaseGate` + `AcceptanceCheck` + `GateEvaluation` | [`schemas/phase-gate.schema.ts`](../schemas/phase-gate.schema.ts) |
| **2. Per-phase gate JSON** | One `gate.json` per phase defining exit criteria | `lifecycle/<N>-<phase-dir>/gate.json` (9 files, one per phase) |
| **3. Evaluator skill** | Runs the checks, emits structured result | [`skills/governance/evaluate-phase-gate/`](../skills/governance/evaluate-phase-gate/) |
| **4. Orchestrator integration** | Phase transitions gated on evaluator pass | Wired into `wave-orchestration` phase-transition logic |

---

## `AcceptanceCheck` — the three kinds

Every acceptance check is one of three shapes. The `kind` discriminator drives which optional fields matter.

### `kind: "artefact-present"`

The simplest: a file must exist at a specified path. Used for sacred docs, structured artefacts, sidecar handoffs.

```json
{
  "id": "prd-authored",
  "description": "Sacred document _context/sacred/prd.md exists",
  "kind": "artefact-present",
  "severity": "block",
  "artefact_path": "_context/sacred/prd.md",
  "remediation": "Run @pm create-prd"
}
```

Evaluator: checks file exists + is readable. No content validation (that's `automated`'s job).

### `kind: "automated"`

A named skill runs and returns pass/fail. Used for schema validation, scanner gates, test results, any deterministic check.

```json
{
  "id": "prd-meta-sidecar",
  "description": "PRD sidecar validates against handoff schema",
  "kind": "automated",
  "severity": "block",
  "skill_ref": "validate-handoff"
}
```

Evaluator: dispatches to `skill_ref`. Skill exit code → check status (0 = pass, non-zero = fail). Skill stdout/stderr → check message.

### `kind: "human"`

A named approver (user, `@qa`, `@architect`, etc.) must sign off. Not a phase blocker by default — but sign-off is recorded in `.coldpress/signoffs/` for audit.

```json
{
  "id": "prd-sacred-signoff",
  "description": "User accepts PRD as complete (sacred-doc protection active)",
  "kind": "human",
  "severity": "block",
  "human_approver": "user"
}
```

Evaluator: checks for a sign-off record at `.coldpress/signoffs/<gate_id>/<check_id>.yaml`. If missing, result is `pending-human`. Present record satisfies the check.

---

## `severity` — how a FAIL is treated

| `severity` | FAIL behaviour |
|------------|----------------|
| `block` | Phase transition refused. User must resolve or explicitly override. |
| `warn` | Warning surfaced; user sign-off required to proceed. Good for checks that are usually-but-not-always critical (e.g., product-brief at Phase 2 exit — required for standard flows, skippable for prototypes). |
| `info` | Logged only. Does not affect pass/fail. Used for observability. |

`block` is the default expectation for sacred-doc handoffs, structural integrity checks, security HIGH findings. `warn` is the default for discretionary content checks. `info` for audit/telemetry.

---

## `GateEvaluation` — the evaluator's output

```json
{
  "gate_id": "phase-4-exit",
  "phase": 4,
  "evaluated_at": "2026-04-24T15:00:00Z",
  "overall": "fail",
  "results": [
    { "id": "prd-authored", "status": "pass" },
    { "id": "prd-meta-sidecar", "status": "fail", "message": "Sidecar missing at _context/sacred/prd.meta.json" }
  ],
  "blockers": ["prd-meta-sidecar"],
  "warnings": []
}
```

- `overall` is `pass` | `fail` | `pending-human`.
- `results[]` records every check by id + status.
- `blockers[]` lists the block-severity failures (what actually halted the transition).
- `warnings[]` lists warn-severity failures (what needs user sign-off to proceed).

Consumers (skills, orchestrator, the `coldpress` CLI) read this structure directly. Prose-only summaries are a rendering concern, not the source of truth.

---

## Orchestrator integration

Phase transitions are gated on evaluator pass:

```
wave-orchestration finishes Wave N of Phase 8
  ↓
evaluate-phase-gate (phase=6)
  ↓
exit code 0 (pass)         → wave-orchestration continues; transition to Phase 9 cleared
exit code 1 (fail)         → halt; surface blockers to user + remediation hints
exit code 2 (pending-human) → halt; prompt user for the specific human check sign-offs
```

No separate "gate" concept outside `evaluate-phase-gate`. Every gate — security, LLM, handoff-sidecar — is an `acceptance_check` inside the relevant phase's `gate.json`.

### §5.1 security stack is an acceptance_check

Phase 9's `gate.json` has a `security-scan-classical` check with `skill_ref: "aggregate-gate-results"` — the aggregator skill that composes the 5-scanner outputs. The aggregator emits exit 0/1; `evaluate-phase-gate` consumes that result like any other automated check. No bespoke "security gate" layer — gates compose.

### §5.5–§5.7 LLM gates are acceptance_checks

Same pattern: `llm-quality-gate` (DeepEval), `prompt-regression` (Promptfoo), `llm-security-scan` (Giskard) each slot in as distinct `acceptance_check` entries in Phase 9's `gate.json`. Each has its own `skill_ref`, its own severity. When all four (classical + 3 LLM) are block-severity and all pass, Phase 9 transitions clean.

---

## Sign-off mechanics

Human sign-offs persist at `.coldpress/signoffs/<gate_id>/<check_id>.yaml`:

```yaml
check_id: "prd-sacred-signoff"
signed_by: "user"
signed_at: "2026-04-24T15:00:00Z"
comment: "PRD v1.0 locked — reviewed with @architect"
```

- **Write-time:** skills that require sign-off (e.g., `create-prd` when the sacred-doc signoff check exists) prompt the user + write the record.
- **Read-time:** `evaluate-phase-gate` reads the record; present + recent → satisfies the check.
- **Audit-time:** the records form a git-trackable sign-off log. Grep `.coldpress/signoffs/` to reconstruct who approved what when.

Sign-offs **don't expire by default** but individual checks can set a staleness threshold (future schema extension). For sensitive gates — e.g., security findings re-signoff when scanner catalogue updates — ops can explicitly invalidate.

---

## Migration from prose exit conditions

Each of the 11 phase READMEs (Shape A) still has prose entry/exit conditions. The `gate.json` file replaces the *exit* conditions as authoritative; prose entry conditions remain (they're contextual guidance, not machine-verifiable).

Policy: **when prose disagrees with `gate.json`, trust `gate.json`.** The schema is load-bearing.

---

## What's NOT in the protocol

- **Automatic remediation.** The evaluator reports; it does not fix. Skills-level remediation (e.g., "re-run @pm create-prd") is hinted via `remediation:` fields but never auto-invoked.
- **Cross-phase gates.** Each gate scopes to one phase. "Project-wide health check" is a separate concern — call it the project-health skill if demand surfaces; don't bake it into phase transitions.
- **Bypass switches.** There's no `--skip-gate` flag. If a check is wrong for your project, edit `gate.json` — the schema tolerates that, and the edit is git-trackable.

---

## Extending

### Add a new acceptance_check to an existing gate

Edit `lifecycle/<phase>/gate.json`. Add a row to `acceptance_checks[]`. Gate re-loads on next evaluator run.

### Add a new gate for a new phase

1. Create `lifecycle/<new-phase>/gate.json`. Validate against `schemas/phase-gate.schema.ts`.
2. Update the subagent-phase matrix + skill index for the new phase.
3. Update `evaluate-phase-gate` dispatcher if any new check `kind` is introduced.

### Schema bump (breaking)

`schema_version: 1` today. Bumping to `2` (renaming a `kind`, removing severity, etc.) requires:
1. New major version in `schemas/phase-gate.schema.ts`.
2. Migration script for existing `gate.json` files.
3. Evaluator update to accept either version during a transition window.
4. DECISIONS-LOG entry at estate level.

---

## See also

- [`schemas/phase-gate.schema.ts`](../schemas/phase-gate.schema.ts) — source types.
- [`skills/governance/evaluate-phase-gate/`](../skills/governance/evaluate-phase-gate/) — the evaluator skill.
- [`docs/handoff-schema-spec.md`](handoff-schema-spec.md) — complementary protocol for inter-phase typed handoffs.
- [`governance/sacred-docs.md`](../governance/sacred-docs.md) — sacred-doc governance (content protection; this doc handles shape + transition).

---

## Orchestration context

> **Hello Butler.** Butler is coldpress-os's main orchestrator agent — your default Claude Code session running with `CLAUDE.md` as its directive. Butler dispatches the 11 Shape A subagents (analyst · architect · pm · ux-designer · scrum-master · developer · qa · devops · reviewer · communicator · valet) and runs the phase gates. The protocol / spec / schema documented above is invoked by Butler (or by a Butler-dispatched subagent) at the relevant phase. See [`butler.md`](butler.md) for the orchestrator reference and the canonical `Hello Butler` entry point.

