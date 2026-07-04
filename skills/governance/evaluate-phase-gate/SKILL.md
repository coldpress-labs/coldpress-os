---
name: "evaluate-phase-gate"
description: "Evaluate a phase's gate.json against the project state — runs automated checks, reports human-check pending state, emits pass/fail with severity roll-up"
type: "simple"
category: "governance"
agent: "butler"
status: "wire-in-every-phase-transition"
phases: [1, 2, 3, 4, 5, 6, 7, 8, 9]
inputs:
  - "phase number (1-9)"
  - "`lifecycle/<N>-<name>/gate.json`"
  - "project state (files on disk)"
outputs:
  - artifact: "Gate Evaluation Report"
    location: "_context/audit/gate-eval-phase-{N}-{date}.json"
    format: "json"
version: "1.0"
---

## Purpose

The machine-checkable counterpart to prose exit conditions. Reads a phase's `gate.json`, executes every `acceptance_check` (artefact-present / automated / human), aggregates block + warn severities, and emits a structured `GateEvaluation` result that the orchestrator consumes at phase-transition time.

Without this skill, phase exit was always prose — "the user feels confident the PRD is complete." With this skill, exit is a contract: specific checks, specific severities, specific remediation.

## When to Use

- Before transitioning to Phase N+1 — verify the outgoing phase's exit gate is green
- End of any wave in Phase 6 — verify exit conditions before Phase 7 transition
- Before `deploy-prod` in Phase 9 — the readiness + security stack + LLM gates are all acceptance_checks in Phase 9's gate.json
- Auditing a project's phase-transition history — re-run against archived state

## Prerequisites

- The phase's `gate.json` exists at `coldpress-os/lifecycle/<phase-dir>/gate.json`
- The project is in a consistent state (no half-finished sacred-doc edits)

## Process

1. **Locate the gate** for the target phase at `coldpress-os/lifecycle/<phase>/gate.json`. Load and validate against `schemas/phase-gate.schema.ts` — malformed JSON halts with a clear error.

1a. **Stage filtering (optional).** If invoked with `--stage N`, evaluate only checks where `check.stage == N` (or checks with no `stage` annotation). Skip all other checks. This enables two-stage evaluation at Phase 3 exit: `--stage 1` at stack-locking Step 5 (pre-env-provision) and `--stage 2` after `coldpress update --post-phase-3` confirms (post-provision). Phase 3 gate.json has 10 stage-1 checks + 3 stage-2 checks (13 total).

2. **Evaluate each check** in `acceptance_checks[]`:
   - `kind: "artefact-present"` — assert the file at `artefact_path` exists and is readable.
   - `kind: "automated"` — dispatch to the referenced skill (`skill_ref`) and interpret its exit code: 0 = pass, non-zero = fail with message on stderr.
   - `kind: "human"` — check whether a sign-off record exists (e.g., a git note or `.coldpress/signoffs/<gate_id>-<check_id>.yaml`). If missing, report `status: "pending-human"`.

3. **Aggregate by severity:**
   - Any `severity: "block"` failure → overall `fail`.
   - Any `severity: "warn"` failure → collect into `warnings[]`; overall `pass` with user-visible warning prompts required.
   - `severity: "info"` → logged but does not affect pass/fail.
   - Any `pending-human` result → overall `pending-human`.

4. **Emit the `GateEvaluation`** as structured JSON matching `schemas/phase-gate.schema.ts` §GateEvaluationSchema. Write to `_context/audit/gate-eval-phase-{N}-{date}.json` for audit trail; also print to stdout for orchestrator consumption.

5. **Exit code:**
   - `0` — overall pass (including warn-pass-with-signoff).
   - `1` — overall fail (at least one block-severity failure).
   - `2` — pending-human (one or more human approvers not yet signed off).

Orchestrator uses the exit code + structured output to decide whether to transition the phase.

## Output

One JSON report per evaluation. Archived per phase per date for audit. Orchestrator consumes stdout directly.

```json
{
  "gate_id": "phase-4-exit",
  "phase": 4,
  "evaluated_at": "2026-04-24T15:00:00Z",
  "overall": "fail",
  "results": [
    { "id": "prd-authored", "status": "pass" },
    { "id": "prd-meta-sidecar", "status": "fail", "message": "Sidecar missing at _context/sacred/prd.meta.json" },
    { "id": "architecture-authored", "status": "pass" }
  ],
  "blockers": ["prd-meta-sidecar"],
  "warnings": []
}
```

## Failure modes

- **gate.json missing or malformed** — skill aborts with `exit 1` and a Zod issue list. Fix the gate file, re-run.
- **skill_ref points at an unknown skill** — aborts with the specific skill id in the error message.
- **Automated check hangs** — each skill invocation has a configurable timeout (default 120s). Timeout = fail with a remediation hint.
- **No `.coldpress/signoffs/` directory** — treated as "no sign-offs yet"; pending-human results surface.

## Sign-off mechanics

Human sign-offs land as YAML records at `.coldpress/signoffs/<gate_id>/<check_id>.yaml`:

```yaml
check_id: "prd-sacred-signoff"
signed_by: "user"
signed_at: "2026-04-24T15:00:00Z"
comment: "PRD reviewed — v1.0 locked"
```

Signed records satisfy `human` checks at evaluation time. Re-running the gate re-reads signoffs — no state leakage between runs.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1 | 2026-04-24 | Cadbury-hq | Phase II Part 3 Wave 4.14. Added `--stage N` flag: when set, evaluates only checks where `check.stage == N`. Documents two-stage Phase 3 pattern (stage 1 at stack-locking; stage 2 post-provision). |
| 1.0 | 2026-04-23 | Cadbury-hq | Initial evaluate-phase-gate skill — part of Wave 5 Block X. Reads per-phase gate.json, runs automated + artefact-present + human checks, emits structured GateEvaluation. |
