<!--
Pattern 4 — Tripartite code-review CoT scaffold (§6.7).

Copy-paste into @reviewer / code-review skill Process sections. The
triangle forces grounding along three orthogonal axes; without it,
reviews degrade into vibes ("the code looks fine" / "this needs work").

Snippet lives at templates/prompt-snippets/review-cot-triangle.md;
see docs/prompt-patterns.md §Pattern 4 for rationale.
-->

### Review triangle

For every artefact under review, answer all three:

1. **Is it correct?** Does it do what the spec / acceptance criteria / PRD actually says — no more, no less? For each criterion in the criteria source, produce a `pass` or `fail` rubric row.
2. **Is it safe?** No security regressions, no data-loss paths, no silent failure modes. For implementation review, run the security-scan lens even if the criteria source didn't ask. For spec review, name the threat model the criteria source implies.
3. **Is it maintainable?** Can another agent/human change this without a map? Look for: undocumented cross-file coupling, stringly-typed interfaces where Zod/TS would serve, silent swallowing of errors, decisions encoded by absence.

### Results — every finding cites evidence

Every rubric row's `evidence` field MUST:
- Reference `file:line` for code/doc artefacts — `src/auth.ts:42`.
- Quote the offending fragment verbatim — ```"catch (e) { throw e }"```.
- Never source evidence from the criteria file — the criteria are what you're checking AGAINST, not what the artefact claims about itself.

### Threshold-driven remediation

If a row fails at `severity: high`, the `remediation` field MUST name a concrete fix path in one sentence:
- ✅ "Wrap in retry-with-exponential-backoff (see lib/retry.ts); log at error level before throwing."
- ❌ "Improve the error handling."

If a row fails at `severity: low` or `medium`, the remediation can be terser but still MUST identify the gap (not the fix — rewriting is the producer's job).
