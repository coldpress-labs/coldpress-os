---
name: "traceability"
description: "Generate traceability matrix linking requirements to tests and produce quality gate decision"
type: "simple"
category: "testing"
agent: "qa"
phases: [6]
inputs:
  - "_context/sacred/prd.md"
  - "test files"
  - "_context/planning/epics-and-stories.md"
outputs:
  - artifact: "Traceability Matrix"
    location: "_context/testing/traceability-matrix-{date}.md"
    format: "markdown"
version: "1.0"
---

## Purpose

Generates a requirements traceability matrix (RTM) that maps every functional requirement from the PRD to its implementation in epics/stories and its verification in tests. Produces a quality gate pass/fail decision based on coverage completeness.

## When to Use

- "generate traceability matrix"
- "check requirement coverage"
- "run traceability"
- Before release to verify all requirements are tested
- After completing an epic to check coverage
- When assessing overall project test completeness

## Prerequisites

- PRD with numbered functional requirements (FR1, FR2, etc.)
- Epics and stories document
- Test files in the codebase

## Process

1. **Extract requirements.** Parse the PRD for all functional requirements (FRs) and non-functional requirements (NFRs).

2. **Map requirements to stories.** For each requirement, identify which epic(s) and story(ies) implement it.

3. **Map stories to tests.** For each story, identify which test files and test cases verify it.

4. **Build traceability matrix:**

   | Req ID | Requirement | Epic | Story | Test File | Test Case | Status |
   |--------|-------------|------|-------|-----------|-----------|--------|
   | FR1 | ... | 1 | 1.1 | ... | ... | Covered |

5. **Identify gaps:**
   - Requirements with no implementing story
   - Stories with no tests
   - Requirements with implementation but no verification
   - NFRs without corresponding quality checks

6. **Quality gate decision:**
   - **PASS** — All FRs have implementation AND tests
   - **CONDITIONAL** — Some gaps exist but none are critical
   - **FAIL** — Critical requirements lack coverage

7. **Generate report** with matrix, gap analysis, and gate decision.

## Output

A traceability matrix document with requirement-to-test mapping, gap analysis, and quality gate pass/fail decision.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | New skill for coldpress-os, formalizing requirement traceability |
