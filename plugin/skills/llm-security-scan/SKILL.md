---
name: llm-security-scan
description: Run Giskard adversarial scan against project-declared LLM endpoints and emit a ScanResult for the Phase-7 llm-adversarial-scan acceptance check
license: MIT
compatibility: Invoked by @verifier in Phase 7
allowed-tools: "Bash Read Write"
version: "1.0"
---

## Purpose

Run [Giskard](https://github.com/Giskard-AI/giskard) (Apache-2.0) `scan` against each declared LLM endpoint/agent. Covers **adversarial** surface: prompt injection, jailbreak attempts, harmful-output classification, bias detection, hallucination detection.

Giskard's native `issues[]` output is normalised to the §5.1 `ScanResult` schema. Severity mapping: `major → high`, `medium → medium`, `minor → low`. `eval.giskard.fail_severity` acts as a **floor** — tightening the config elevates minor findings but does NOT downgrade Giskard's native major-severity assessments. The Phase-7 gate's `llm-adversarial-scan` acceptance_check dispatches here via `skill_ref: llm-security-scan`.

## When to Use

- Phase 7 pre-deployment gate when the project declares LLM endpoints (`eval.targets[]` non-empty) AND `eval.giskard.enabled: true` (default when the block is present).
- After deploy-target changes or LLM provider swaps — adversarial posture can shift with the model behind the endpoint.
- Degrades to `status: "skipped"` when no LLM endpoints declared or `eval.giskard.enabled: false`.

## Prerequisites

- **Python ≥ 3.10** on PATH.
- **Giskard installed:** `pip install giskard`. First run pulls detector models (~500MB).
- Project declares one or more LLM endpoints under `eval.targets[]` with reachable `prompt_ref` URLs.

## Process

1. Parse `eval.targets[]` + `eval.giskard`. If empty or disabled, emit skipped `ScanResult` and exit `0`.
2. For each target endpoint, invoke Giskard:
   ```bash
   giskard scan \
     --target <target.prompt_ref> \
     --checks <prompt-injection,jailbreak,harmful-output,bias,hallucination> \
     --format json \
     --output <tmp>/giskard-raw.json
   ```
3. Normalise Giskard's JSON output (shape documented in [`src/llm-gates/normalize-giskard.ts`](../../../src/llm-gates/normalize-giskard.ts)) to a `ScanResult`. Each `issue` becomes one `Finding`:
   ```
   id:         giskard.<group>.<detector>
   severity:   <mapped from Giskard level, raised to fail_severity floor>
   title:      <issue.title>
   description: <issue.description>
   ```
4. Write `ScanResult` JSON to `_context/audit/security/giskard-{date}.json`.
5. Exit `0` on tool success; exit `1` on tool failure.

## Severity-floor mechanics

Giskard's native levels map:
- `major` → `high`
- `medium` → `medium`
- `minor` → `low`
- unknown → `info`

`eval.giskard.fail_severity` (default `high`) is applied as a **floor**: findings below the floor are raised; findings at-or-above are left untouched. Example:
- `fail_severity: high` + Giskard `major` issue → stays `high`
- `fail_severity: high` + Giskard `minor` issue → raised to `high`
- `fail_severity: critical` + Giskard `major` issue → raised to `critical`

Rationale: a project that has opted into security-critical posture wants ALL Giskard findings to block; a project with `fail_severity: low` still wants Giskard's own HIGH assessments to remain HIGH.

## Degradation — no LLM endpoints

Same as §5.5/§5.6: emit skipped `ScanResult`, exit `0`. Non-LLM projects pass this gate trivially.

## Output

One `ScanResult` JSON file per invocation.

## Failure modes

- **Giskard not installed** — skill exits `1` with `pip install giskard` hint.
- **Endpoint unreachable** — wrapper reports `status: "error"` with the network error message. Does not silently produce a clean scan.
- **Detector model download fails** (first run, offline) — Giskard surfaces as tool error.

## Relationship with §5.1 classical scanners

The five §5.1 scanners (Semgrep / Gitleaks / Trivy / OSV / Syft) cover classical code / dep / secret surfaces. The three §5.5–§5.7 LLM gates cover LLM-specific surfaces (correctness / regression / adversarial). They are **non-overlapping**: Giskard catches prompt injection that Semgrep is blind to; Semgrep catches SQL injection that Giskard is blind to. The aggregator (`aggregate-gate-results`) merges all 8 into one Phase-7 gate decision.

## Licence

Giskard is Apache-2.0. Subprocess invocation.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Initial Giskard wrapper spec — Wave 5 Block BB §5.7. Pure normalizer at `src/llm-gates/normalize-giskard.ts`. Severity-floor mechanics codified. Subprocess adapter deferred pending Giskard install. |
