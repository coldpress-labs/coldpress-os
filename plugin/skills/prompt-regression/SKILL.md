---
name: prompt-regression
description: Run Promptfoo eval against the project's promptfooconfig.yaml and emit a ScanResult for the Phase-7 llm-regression-gate acceptance check
license: MIT
compatibility: Invoked by @verifier in Phase 7
allowed-tools: "Bash Read Write"
version: "1.0"
---

## Purpose

Run [Promptfoo](https://github.com/promptfoo/promptfoo) (MIT) against the project's `promptfooconfig.yaml`. Covers **LLM regression** — drift between current prompt outputs and pinned golden expectations, across commits.

Promptfoo's native output is normalised to the §5.1 `ScanResult` schema. A failing row becomes a `Finding` with severity = `eval.promptfoo.fail_severity` (default `medium`). The Phase-7 gate's `llm-regression-gate` acceptance_check dispatches here via `skill_ref: prompt-regression`.

## When to Use

- Phase 7 pre-deployment gate when `promptfooconfig.yaml` exists in the project root (or at a custom path declared in `eval.promptfoo.config_path`).
- After prompt-template changes — drift detection against the pinned baseline.
- Degrades to `status: "skipped"` when `promptfooconfig.yaml` is absent or `eval.promptfoo.enabled: false`.

## Prerequisites

- **Node ≥ 18 or Python** (Promptfoo ships binaries for both runtimes; use whichever aligns with the project's primary stack).
- **Promptfoo installed:** `npm install -g promptfoo` (or `pip install promptfoo`, or `npx promptfoo@latest` for a one-shot install-free invocation).
- A `promptfooconfig.yaml` at the project root (scaffolded during Phase 4 Planning if the project declares prompts).

## Process

1. Check for `promptfooconfig.yaml` at `eval.promptfoo.config_path` (default: project root). If absent, emit skipped `ScanResult` and exit `0`.
2. Invoke Promptfoo:
   ```bash
   promptfoo eval \
     --config <config_path> \
     --output <tmp>/promptfoo-raw.json
   ```
3. Run `coldpress llm-normalize promptfoo <promptfoo-raw.json> --target <name> --fail-severity <sev> --out _context/audit/security/promptfoo-{date}.json` to convert Promptfoo's JSON output to a `ScanResult` (normalizer: [`src/llm-gates/normalize-promptfoo.ts`](../../../src/llm-gates/normalize-promptfoo.ts)). Each failing row (`success: false` or `gradingResult.pass: false`) becomes one `Finding`:
   ```
   id:         promptfoo.<provider>.<prompt-label>
   severity:   <eval.promptfoo.fail_severity>   (default "medium")
   title:      "Prompt regression: <label> on <provider>"
   description: <gradingResult.reason or "score X below threshold">
   ```
4. Write `ScanResult` JSON to `_context/audit/security/promptfoo-{date}.json`.
5. Exit `0` on tool success; exit `1` on tool failure.

## Degradation — no `promptfooconfig.yaml`

Emit skipped `ScanResult` (same shape as DeepEval skipped) and exit `0`. The aggregator treats it as zero-contribution. Non-prompt-centric projects pass this gate trivially.

## Output

One `ScanResult` JSON file per invocation.

## Failure modes

- **Promptfoo not installed** — skill exits `1` with install hint covering both npm + pip paths.
- **Malformed `promptfooconfig.yaml`** — Promptfoo surfaces the YAML error; wrapper reports `status: "error"` with the message.
- **Provider unreachable** (OpenAI/Anthropic/etc. network failure) — wrapper reports `status: "error"`; does not block gate on network-level issues.

## Relationship with Promptfoo's upstream GitHub Action

Promptfoo publishes a GitHub Action upstream. Coldpress-os's `prompt-regression` skill is the CLI equivalent for local + non-Actions CI use; users who live in GitHub Actions can use the upstream action directly — the ScanResult normalisation is equivalent if they post-process the output with our `normalizePromptfoo()` function.

## Licence

Promptfoo is MIT. Subprocess invocation.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Initial Promptfoo wrapper spec — Wave 5 Block BB §5.6. Pure normalizer at `src/llm-gates/normalize-promptfoo.ts`. Subprocess adapter deferred pending Promptfoo install. |
