---
name: llm-quality-gate
description: Run DeepEval against project-declared prompts/agents and emit a ScanResult for the Phase-7 llm-correctness-gate acceptance check
license: MIT
compatibility: Invoked by @qa in Phase 7
version: "1.0"
---

## Purpose

Run [DeepEval](https://github.com/confident-ai/deepeval) (Apache-2.0) against every prompt/agent the project declares under `coldpress.yaml` `eval.targets[]`. Covers **LLM correctness** — faithfulness, hallucination, G-Eval, answer relevancy (default metrics per plan §5.5).

DeepEval's native output is normalised to the §5.1 `ScanResult` schema so the Phase-7 aggregator consumes it like any other scanner finding. A failing metric becomes a `Finding` with severity = `eval.deepeval.fail_severity` (default `high`).

Emits one `ScanResult` at `_context/audit/security/deepeval-{date}.json`. The Phase-7 gate's `llm-correctness-gate` acceptance_check dispatches here via `skill_ref: llm-quality-gate`.

## When to Use

- Phase 7 pre-deployment gate when the project declares `eval.deepeval.enabled: true` (or omits the flag — default is `true` if the `eval:` block is present).
- After meaningful prompt-template changes — run locally before a PR to catch regressions in correctness.
- Degrades to a no-op when `eval:` is absent from `coldpress.yaml` (project is not LLM-centric; emits `status: "skipped"` with empty findings).

## Prerequisites

- **Python ≥ 3.10** on PATH.
- **DeepEval installed:** `pip install deepeval`. First run may download evaluator-LLM model weights depending on the metrics selected.
- `coldpress.yaml` has an `eval.targets[]` block listing prompts/agents to evaluate.

## Process

1. Parse `coldpress.yaml` `eval.targets[]` + `eval.deepeval`. If no targets declared or the block is absent, emit a `status: "skipped"` `ScanResult` and exit `0`.
2. For each target, invoke DeepEval with the configured metrics:
   ```bash
   deepeval test run <target.prompt_ref> \
     --format json \
     --metrics <metric1>,<metric2>,…
   ```
3. Normalise DeepEval's JSON output (shape documented in [`src/llm-gates/normalize-deepeval.ts`](../../../src/llm-gates/normalize-deepeval.ts)) to a `ScanResult`. Each failing metric on each test case becomes one `Finding`:
   ```
   id:         deepeval.<metric>.<test_name>
   severity:   <eval.deepeval.fail_severity>   (default "high")
   title:      "DeepEval <metric> failed for <test>"
   description: <metric.reason or "score X below threshold Y">
   ```
4. Write `ScanResult` JSON to `_context/audit/security/deepeval-{date}.json`.
5. Exit `0` on tool success (findings-present does not affect exit code; the aggregator applies the policy). Exit `1` only on tool failure (DeepEval not installed, config error).

## Degradation — no `eval:` block

When `coldpress.yaml` has no `eval:` section, or `eval.targets[]` is empty, or `eval.deepeval.enabled: false`, emit this stub ScanResult and exit `0`:

```json
{
  "schema_version": 1,
  "scanner": "deepeval",
  "scanned_at": "<now>",
  "target": "project",
  "status": "skipped",
  "findings": [],
  "summary": {"critical":0,"high":0,"medium":0,"low":0,"info":0,"total":0}
}
```

The aggregator treats skipped scanners as zero-contribution — the Phase-7 gate passes on this dimension for non-LLM projects.

## Output

One `ScanResult` JSON file per invocation.

## Failure modes

- **DeepEval not installed** — skill exits `1` with `pip install deepeval` hint. Does not silently skip.
- **Evaluator-LLM unavailable** (network error on first run) — DeepEval surfaces as tool failure; wrapper reports `status: "error"` with `error_message` populated.
- **`coldpress.yaml` invalid `eval:` block** — the `EvalConfigSchema` Zod validator catches it; skill exits `1` with the Zod issue list.

## Licence

DeepEval is Apache-2.0. Subprocess invocation.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Initial DeepEval wrapper spec — Wave 5 Block BB §5.5. Pure normalizer at `src/llm-gates/normalize-deepeval.ts` (unit-testable). Subprocess adapter deferred pending DeepEval install. |
