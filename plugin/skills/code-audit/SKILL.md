---
name: code-audit
description: Audit code for a completed story or scope and generate a comprehensive report
license: MIT
compatibility: Invoked by @verifier in Phase 6
version: "1.0"
---

## Purpose

Performs a comprehensive code audit on a completed story or defined scope. Runs automated checks, categorizes findings by severity, and produces an actionable audit report. Supports both story-level and epic-level roll-up audits.

## When to Use

- "audit this code"
- "run code audit for story 1.3"
- "audit the codebase"
- After completing a story or epic, before marking as done
- When investigating code quality across a scope

## Prerequisites

- Scope must be identifiable: story number (e.g., "1.3"), file list, or directory
- Project must have a buildable codebase (TypeScript/JavaScript preferred)
- `_context/sacred/architecture.md` recommended for context

## Process

1. **Identify scope.** Determine audit boundaries:
   - **Story-level:** Identify files changed/created for the story
   - **File list:** Use provided paths directly
   - **Epic-level:** Aggregate all stories in the epic, audit each, then roll up

   **Trace-based scope derivation (preferred).** For story-level audits, find the code modules implementing the story via its blast radius. The trace graph is derived in-memory on each call, so there is no index to prime first:

   ```bash
   # Code modules implementing the story (blast radius of the story node).
   coldpress trace impact <story-id>
   ```

   The reported code modules are the audit scope. If `coldpress trace impact` surfaces nothing (or errors), fall back to git-diff / ls-based derivation.

   For epic-level audits, run `coldpress trace impact <epic-id>` and union the implementing code modules across the epic's stories.

2. **Run automated checks** across all in-scope files:
   - TypeScript compilation errors (`tsc --noEmit`)
   - Code quality: unused variables, unreachable code, implicit `any`
   - TODO/FIXME inventory with context
   - Unguarded `console.log` and `debugger` statements
   - Missing or inadequate error handling
   - Memory leak patterns (uncleared intervals, listeners, subscriptions)
   - Security: hardcoded secrets, SQL injection, XSS vectors
   - Accessibility: missing ARIA labels, alt text (for UI code)

3. **Categorize findings** by severity:
   - **Critical** — Security vulnerabilities, data loss risks, crashes
   - **High** — Logic errors, missing error handling, memory leaks
   - **Medium** — Code quality issues, missing types, poor patterns
   - **Low** — Style issues, TODOs, minor improvements

4. **Generate audit report** with:
   - Executive summary (scope, pass/fail, finding counts)
   - Findings by severity with file locations and code snippets
   - Recommended actions prioritized by impact
   - Checklist for the developer to work through

5. **Present to user** with options:
   - Apply critical/high fixes automatically
   - Leave as action items for manual resolution
   - Walk through findings one by one

6. **For epic-level audits:** Roll up individual story audits into a summary report with cross-cutting patterns and systemic issues.

## Output

A markdown audit report with executive summary, categorized findings, and prioritized recommendations. For epic-level: a roll-up summary across all constituent stories.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Migrated from code-audit, adapted to coldpress-os schema |
