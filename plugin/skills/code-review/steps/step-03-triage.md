---
step_number: 3
step_name: "Triage Findings"
step_goal: "Normalize, deduplicate, and classify all findings into actionable categories"
halts_for_input: false
next_step: "step-04-present.md"
---

## Goal

Take the raw findings from all review layers and produce a clean, deduplicated, categorized list ready for user review.

## Instructions

1. **Normalize format.** Convert all findings to a unified structure:
   - `source` — Which review layer found it (blind, edge-case, acceptance)
   - `severity` — Critical / High / Medium / Low
   - `location` — File and line reference
   - `description` — What the issue is
   - `recommendation` — How to fix it

2. **Deduplicate.** When multiple layers find the same issue:
   - Keep the most detailed version
   - Note which layers independently found it (strengthens confidence)
   - Merge complementary details from different layers

3. **Classify into action categories:**
   - **decision_needed** — Ambiguous issues requiring user judgment (design trade-offs, intentional choices)
   - **patch** — Clear fixes that can be applied (bugs, missing guards, typos)
   - **defer** — Valid issues but not blocking (tech debt, optimization opportunities)
   - **dismiss** — False positives or already-handled cases

4. **Drop dismissed findings** from the final report (but note the count).

5. **Warn if layers failed.** If any review layer failed in Step 2, note which perspectives are missing from the triage.

## Output

Update output document with triaged findings organized by category. Update frontmatter: `step_3_complete: true`, `total_findings: N`, `by_category: {decision_needed: N, patch: N, defer: N, dismissed: N}`

## Navigation

→ Auto-proceed to [step-04-present.md](step-04-present.md)
