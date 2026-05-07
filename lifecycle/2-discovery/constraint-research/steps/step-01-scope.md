---
step_number: 1
step_name: "Scope"
step_goal: "Define the constraint topic and the classification axes that apply"
halts_for_input: true
next_step: "step-02-research.md"
---

## Instructions

1. **Ask:** "Which constraint area do you want to research? (compliance, protocols, performance envelopes, accessibility, regulatory, locale, device coverage)"
2. **Classify applicable axes:** compliance (GDPR/HIPAA/SOC2/ISO27001/…), protocols (REST/WS/gRPC/MQTT/…), algorithmic (throughput, latency), performance budgets, accessibility (WCAG level), device/browser matrix, locale/language support, regulatory (industry-specific).
3. **Check `_input/`:** note any pre-loaded material in `_input/reference/` (regulatory reading) or `_input/vendor/` (SDK / integration compliance docs) that should be consulted first. Prefer graph-indexed material over fresh web search.
4. **Initialize output document** at `_context/planning/research/constraint-{topic}-{date}.md`.

## Output

Constraint scope defined. `step_1_complete: true`

## Navigation

→ Proceed to [step-02-research.md](step-02-research.md)
