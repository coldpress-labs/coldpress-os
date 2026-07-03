---
workflow_version: "3.0"
output_file: "_context/audit/readiness-v{N}.md"
total_steps: 3
resume_from: "frontmatter"
---

## Overview

The Phase 9 **scripted hard checklist** — the meta-aggregator that decides whether
a build may deploy. Three steps: scope the release + confirm entry (with a
`coldpress trace release` preview), run the scripted checklist (build, env,
dep+vuln scan, SBOM, security headers, `.env`/sourcemap probe, DNS/robots/sitemap,
license re-run, Lighthouse-vs-budgets, T2 lockfile pinning, conditional
db-migration), and emit the schema'd readiness report the `deploy-gate` reads.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | [step-01-scope.md](steps/step-01-scope.md) | Scope the release (`trace release`) + confirm Phase 9 entry conditions |
| 2 | [step-02-gates.md](steps/step-02-gates.md) | Run the scripted hard checklist (all block-severity) |
| 3 | [step-03-report.md](steps/step-03-report.md) | Emit the schema'd readiness report + SBOM with a ready/blocked verdict |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Step 2 is scripted + non-halting.** Run the full checklist — do not stop at the first FAIL; report every blocker at once.
4. **No skipping.** Every check exists for a reason; T2-only and conditional checks skip by rule, not by choice.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.

## Completion Criteria

- Every checklist item executed with a PASS/FAIL + findings
- SBOM emitted + attached to the release record
- Readiness report written at `_context/audit/readiness-v{N}.md` (schema-valid)
- A `ready` / `blocked` verdict issued for the `deploy-gate` to read
