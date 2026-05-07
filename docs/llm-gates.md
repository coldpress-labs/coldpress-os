---
name: llm-gates
description: 3 LLM-specific gates — DeepEval (correctness), Promptfoo (regression), Giskard (adversarial) — each emits the §5.1 ScanResult schema and composes through the Phase-7 aggregator
version: "1.0"
---

# LLM Gates (§5.5–§5.7)

> The five §5.1 classical scanners (Semgrep / Gitleaks / Trivy / OSV / Syft) cover code / dep / secret surfaces but are blind to LLM-specific failure modes: an agent that hallucinates facts; a prompt template that drifted since last release; a jailbreak that leaks a system prompt. This doc specifies three non-overlapping LLM gates that close that gap.

**Source decision:** [fourth-pass-oss-survey-2026-04-23.md §"Wave 5 additions"](../../../lab-hq-projects/hq-p001-coldpress-os/docs/fourth-pass-oss-survey-2026-04-23.md).

---

## The three gates

| Surface | Tool | Licence | Skill |
|---------|------|---------|-------|
| **Correctness** (faithfulness / hallucination / G-Eval / answer relevancy) | [DeepEval](https://github.com/confident-ai/deepeval) | Apache-2.0 | [`skills/deployment/llm-quality-gate`](../skills/deployment/llm-quality-gate/) |
| **Regression** (drift between commits vs. pinned golden baseline) | [Promptfoo](https://github.com/promptfoo/promptfoo) | MIT | [`skills/deployment/prompt-regression`](../skills/deployment/prompt-regression/) |
| **Adversarial** (prompt injection / jailbreak / harmful output / bias) | [Giskard](https://github.com/Giskard-AI/giskard) | Apache-2.0 | [`skills/deployment/llm-security-scan`](../skills/deployment/llm-security-scan/) |

**Non-overlapping by design.** DeepEval can't catch prompt injection (no adversarial harness); Giskard can't catch faithfulness drift (no golden baseline); Promptfoo can't catch hallucination (no metric-scoring inner loop). Running all three is the only way to get Phase-7 LLM-surface coverage.

---

## Shared schema — everything is a ScanResult

All three tools emit their native JSON, and the coldpress-os wrappers normalise to the §5.1 [`ScanResult`](../schemas/security-gate-result.schema.ts) schema. This means:

- The Phase-7 aggregator (`aggregate-gate-results`) reads them uniformly — no bespoke "LLM gate" layer.
- Waiver mechanism (`.coldpress/signoffs/security-gate/<finding-id>.yaml`) applies to LLM findings identically to classical ones.
- Downstream tooling (visualizers, reports) treats the 8 scanners (5 classical + 3 LLM) as a single pool.

Normalizer functions:
- [`src/llm-gates/normalize-deepeval.ts`](../src/llm-gates/normalize-deepeval.ts)
- [`src/llm-gates/normalize-promptfoo.ts`](../src/llm-gates/normalize-promptfoo.ts)
- [`src/llm-gates/normalize-giskard.ts`](../src/llm-gates/normalize-giskard.ts)

Each is a pure function taking the tool's parsed JSON + options, returning a `ScanResult`. Unit-testable with hand-authored fixture strings, no install required.

---

## Configuration — the `eval:` block

Projects opt in via `coldpress.yaml`:

```yaml
eval:
  targets:
    - id: customer-support-agent
      description: "Front-line triage agent"
      prompt_ref: "src/agents/triage.py"          # DeepEval + Giskard read this
    - id: marketing-copy-gen
      prompt_ref: "https://api.example.com/v1/gen"  # Giskard endpoint
  deepeval:
    enabled: true
    metrics: [faithfulness, hallucination, g_eval, answer_relevancy]
    fail_severity: high
  promptfoo:
    enabled: true
    config_path: promptfooconfig.yaml
    fail_severity: medium
  giskard:
    enabled: true
    checks: [prompt-injection, jailbreak, harmful-output, bias, hallucination]
    fail_severity: high
```

Schema: [`schemas/eval-config.schema.ts`](../schemas/eval-config.schema.ts) — validated at skill-invocation time; malformed config fails loud.

**Absence semantics:** when the `eval:` block is absent entirely, all three LLM gates emit `status: "skipped"` ScanResults with empty findings. Non-LLM projects pass the Phase-7 LLM gates trivially. The gates never force a project to adopt LLM evaluation it doesn't need.

**Per-tool disable:** set `eval.<tool>.enabled: false` to skip one gate while running the other two. Useful during transition periods (e.g., migrating from one eval framework to another).

---

## Severity mapping — the 5-rung ladder

Every tool uses a different native vocabulary. The wrappers normalise to the shared 5-rung ladder (`critical > high > medium > low > info`):

### DeepEval

Binary pass/fail per metric; no native severity. A failing metric maps to `eval.deepeval.fail_severity` (default `high`).

### Promptfoo

Binary pass/fail per row; no native severity. A failing row maps to `eval.promptfoo.fail_severity` (default `medium`). Regression defaults to medium — drift is important but typically less urgent than correctness or adversarial findings.

### Giskard

Native severity levels `major / medium / minor` map to `high / medium / low`. `eval.giskard.fail_severity` (default `high`) acts as a **floor** — minor/medium findings are raised to the floor; major stays major. Rationale: a project with security-critical posture wants ALL Giskard findings to block, but a project with relaxed posture still wants Giskard's own high-severity assessments to remain high.

---

## Phase-7 gate wiring

[`lifecycle/9-deployment/gate.json`](../lifecycle/9-deployment/gate.json) declares three acceptance_checks that dispatch to these skills:

```json
{
  "id": "llm-correctness-gate",
  "kind": "automated",
  "severity": "warn",
  "skill_ref": "llm-quality-gate",
  "remediation": "Only applies when the project declares an `eval:` block in coldpress.yaml"
},
{
  "id": "llm-regression-gate",
  "kind": "automated",
  "severity": "warn",
  "skill_ref": "prompt-regression",
  "remediation": "Only applies when `promptfooconfig.yaml` exists"
},
{
  "id": "llm-adversarial-scan",
  "kind": "automated",
  "severity": "block",
  "skill_ref": "llm-security-scan",
  "remediation": "Only applies when the project declares LLM endpoints/agents"
}
```

Correctness + regression are `severity: warn` (surface findings, require human sign-off to proceed). Adversarial is `severity: block` (HIGH findings stop the deploy). Rationale:
- Correctness fails often during development; demanding sign-off is right but blocking would paralyse experimentation.
- Regression fails when intentional prompt changes ship; users need to decide whether drift is expected.
- Adversarial findings (prompt injection, harmful output, jailbreak) are always deploy-blockers at HIGH severity — they are security vulnerabilities.

---

## Why these three, and not the others

Per plan §5.5–§5.7 explicit skips:

- **Ragas** — RAG-specific. Skipped until coldpress-os ships RAG templates (Wave 6 archetype work). Revisit then.
- **OpenAI Evals + LangChain benchmarks** — redundant with DeepEval's correctness coverage. DeepEval subsumes them and has better structured output.
- **TruLens** — niche tracing tool; overlaps with OpenTelemetry-based observability that coldpress-os will integrate in Wave 6.
- **MLflow LLM** — framing mismatch; MLflow's strength is experiment tracking, not gate evaluation.

Three non-overlapping tools is the minimum viable LLM-surface coverage. More tools is more install friction without more coverage.

---

## What's NOT in these gates

- **Live-traffic evaluation.** DeepEval/Promptfoo/Giskard run against declared prompts/endpoints in batch, pre-deploy. Runtime-traffic evaluation (shadow eval, traffic mirroring) is out of scope; OTel + downstream observability tools own that surface.
- **Automatic remediation.** Same rule as §5.1: scanners report, humans + agents remediate. A failing DeepEval metric doesn't trigger a prompt rewrite.
- **Cross-tool finding dedup.** If Giskard and DeepEval both flag the same hallucination, we keep both findings — each tool's reasoning is different and valuable. Dedup is a human-review task.

---

## Extending

### Adding a fourth LLM gate

1. Write a SKILL.md at `skills/deployment/<gate-name>/SKILL.md`.
2. Write a normalizer at `src/llm-gates/normalize-<tool>.ts` that maps the tool's native output → `ScanResult`.
3. Extend `EvalConfigSchema` with a `<tool>:` subsection (pattern: `enabled` boolean + tool-specific knobs + `fail_severity`).
4. Add an `acceptance_check` entry to `lifecycle/9-deployment/gate.json` with the new skill's `skill_ref`.
5. Write unit tests for the normalizer using a hand-authored fixture of the tool's documented JSON output.

### Tightening or loosening a gate's severity

Edit `eval.<tool>.fail_severity` in the project's `coldpress.yaml`. Tightening (e.g., `medium` → `high`) makes more findings block the gate; loosening does the inverse. For the Giskard floor semantics, tightening elevates minor findings but never downgrades major ones.

---

## Testing

- **Unit tests** per normalizer in `test/llm-gates.test.ts` using hand-authored fixture JSON matching each tool's documented output shape. Exercises: success/failure parsing, severity mapping, severity floor (Giskard), edge cases (empty results, unknown levels, missing fields).
- **End-to-end tests** against real tool outputs deferred pending Python installs — same pattern as Block Y scanner-install-deferred. Add per-tool smoke test when installs land.

---

## See also

- [`security-gate.md`](security-gate.md) — §5.1 classical scanner stack; sibling gate with shared `ScanResult` schema + aggregator.
- [`phase-gate-protocol.md`](phase-gate-protocol.md) — §5.0 gate protocol these three plug into as `acceptance_check` entries.
- [`coldpress-yaml-schema.md`](coldpress-yaml-schema.md) — `coldpress.yaml` schema (the `eval:` section lives here).
