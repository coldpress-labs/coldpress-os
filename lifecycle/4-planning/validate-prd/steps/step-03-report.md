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
   - Save to `_output/planning/prd-validation-{date}.md`

4. **Present to user:**
   - Show the verdict and summary table
   - Walk through Must Fix items
   - "Would you like to fix these now? I can route you to `create-prd` in edit mode."

5. **Suggest next steps based on verdict:**
   - **READY:** "PRD is solid. Recommend proceeding to `create-architecture` or `create-ux-design`."
   - **NEEDS REVISION:** "Run `create-prd` in edit (e) mode to address the Must Fix items, then re-validate."
   - **BLOCKED:** "Fundamental issues need resolution. Let's discuss the FAIL items before re-running create-prd."

## Output

Validation report written to `_output/planning/prd-validation-{date}.md`. `step_3_complete: true`

## Navigation

Workflow complete. -> Route based on verdict.
