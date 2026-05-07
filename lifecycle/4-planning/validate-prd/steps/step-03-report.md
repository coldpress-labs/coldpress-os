---
step_number: 3
step_name: "Report"
step_goal: "Generate validation report with findings, recommendations, and overall verdict"
halts_for_input: true
next_step: null
---

## Goal

Compile all validation findings into a structured report. Give the user a clear verdict and actionable next steps.

## Instructions

1. **Generate the validation report** with this structure:

```markdown
# PRD Validation Report — {project.name}

**PRD Version:** {version from frontmatter}
**Validated:** {date}
**Validator:** @pm via coldpress-os validate-prd

---

## Overall Verdict: {READY / NEEDS REVISION / BLOCKED}

{One paragraph summary — is this PRD ready for Phase 5 breakdown?}

## Validation Results

| Dimension | Verdict | Issues |
|-----------|---------|--------|
| Completeness | {PASS/WARNING/FAIL} | {count} issues |
| Consistency | {PASS/WARNING/FAIL} | {count} issues |
| Testability | {PASS/WARNING/FAIL} | {count} issues |
| Alignment | {PASS/WARNING/FAIL} | {count} issues |
| Feasibility | {PASS/WARNING/FAIL} | {count} issues |
| Implementability | {PASS/WARNING/FAIL} | {count} issues |

## Detailed Findings

### Completeness
{List each issue with PRD section reference and severity}

### Consistency
{...}

### Testability
{...}

### Alignment
{...}

### Feasibility
{...}

### Implementability
{...}

## Recommendations

### Must Fix (before proceeding to Phase 5)
1. {Issue + specific fix suggestion}

### Should Fix (improve quality)
1. {Issue + specific fix suggestion}

### Consider (nice to have)
1. {Issue + specific fix suggestion}
```

2. **Determine overall verdict:**
   - **READY:** Zero FAIL verdicts, at most 2 WARNING verdicts with minor issues
   - **NEEDS REVISION:** One or more FAIL verdicts, or 3+ WARNING verdicts. PRD needs edits before proceeding.
   - **BLOCKED:** Multiple FAIL verdicts in critical dimensions (completeness, feasibility). Cannot proceed until fundamental issues resolved.

3. **Write the report:**
   - Save to `_context/planning/prd-validation-{date}.md`

4. **Present to user:**
   - Show the verdict and summary table
   - Walk through Must Fix items

5. **Loop-back routing based on verdict:**

   **READY:**
   > "The PRD is solid and ready for Phase 5. Proceeding to Phase 5 Design is recommended. Say 'next phase' or 'validate-prd complete' to trigger the phase transition."

   **NEEDS REVISION:**
   > "The PRD needs revision before proceeding. I found [N] must-fix items. Options:
   > - **(A)** Fix now — route to `create-prd` edit mode, section [X] (I'll pre-load the issues)
   > - **(B)** Show me the full issue list first, then I'll decide
   > - **(C)** Proceed anyway (override — not recommended)"

   [Wait for user input]

   If **(A)**: invoke `create-prd` in edit mode, pre-load the specific Must Fix items from this report as the edit context. After edits: offer to re-run `validate-prd` immediately.

   **BLOCKED:**
   > "There are fundamental issues that need resolution. I cannot recommend proceeding. Options:
   > - **(A)** Let's discuss the FAIL items and I'll help resolve them now
   > - **(B)** Route to create-prd to rework the affected sections
   > - **(C)** Escalate — some of these may require Phase 2 or Phase 3 re-entry (I'll explain which)"

   [Wait for user input]

6. **Write partial completion clear:**
   Clear `partial_completion` from `coldpress.yaml`.

## Output

Validation report written to `_context/planning/prd-validation-{date}.md`. `step_3_complete: true`

## Navigation

Workflow complete. -> Route based on verdict.
