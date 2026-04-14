---
step_number: 4
step_name: "Present & Resolve"
step_goal: "Present triaged findings to user and resolve action items"
halts_for_input: true
next_step: "complete"
---

## Goal

Walk the user through findings, resolve decisions, and optionally apply patches.

## Instructions

1. **Present summary** to user:
   - Total findings by category
   - Critical/High items highlighted first
   - Missing review layer warnings (if any)

2. **Resolve `decision_needed` items** one at a time:
   - Present the issue, context, and options
   - User decides: fix now, defer, or dismiss with rationale
   - Update the finding's category based on decision

3. **Handle `patch` findings:**
   - Present list of patchable items
   - Offer options:
     - **(A) Auto-fix all** — Apply all patches automatically
     - **(W) Walk through** — Review and approve each patch individually
     - **(L) Leave as list** — Document as action items, don't fix now
   - Apply approved patches to the codebase

4. **Document `defer` items** as tracked tech debt in the output report.

5. **Write final report** to output location with:
   - Review metadata (date, scope, layers executed)
   - Resolved findings with decisions
   - Applied patches
   - Deferred items for future attention
   - Summary statistics

6. **Present follow-up options:**
   - Run review again on the patched code
   - Proceed to code audit for deeper analysis
   - Mark review as complete

## User Interaction

Halt at each `decision_needed` item and at the patch resolution menu.

## Output

Finalized code review report at `_output/reviews/code-review-{date}.md`

## Navigation

→ Review complete.
