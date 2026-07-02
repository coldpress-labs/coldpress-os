---
step_number: 2
step_name: "Parallel Review Layers"
step_goal: "Execute three adversarial review layers against the code diff"
halts_for_input: false
next_step: "step-03-triage.md"
---

## Goal

Run three independent review perspectives against the gathered diff to maximize finding coverage.

## Instructions

Execute these three review layers. Each operates independently:

### Layer 1: Blind Hunter (Adversarial Review)

- **Input:** Diff only — no project context, no spec
- **Method:** Invoke the `adversarial-review` skill logic against the diff content
- **Focus:** Cynical analysis of the code changes in isolation
- **Output:** List of findings with severity

### Layer 2: Edge Case Hunter

- **Input:** Diff + access to full project files for context
- **Method:** Invoke the `edge-case-hunter` skill logic against changed code
- **Focus:** Every branching path, boundary condition, and unhandled edge case
- **Output:** Structured findings with location, trigger, guard snippet, consequence

### Layer 3: Acceptance Auditor (conditional)

- **Condition:** Only runs if story/spec context was found in Step 1
- **Input:** Diff + spec/story file + project context docs
- **Focus:** Does the implementation satisfy every acceptance criterion?
- **Output:** AC checklist with pass/fail/partial for each criterion

### Failure Handling

If any layer fails (e.g., diff too large for edge-case analysis), log the failure reason and continue with remaining layers. At least one layer must succeed for the review to proceed.

## Output

Collect all findings from all layers into a combined raw findings list. Update frontmatter: `step_2_complete: true`, `layers_executed: [list]`, `layers_failed: [list]`

## Navigation

→ Auto-proceed to [step-03-triage.md](step-03-triage.md)
