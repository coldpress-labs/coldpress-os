---
name: repo-structure-audit
description: Scan repository for file duplication, structural drift, and organizational issues
license: MIT
compatibility: Phase 6
version: "1.0"
---

## Purpose

Scans the project repository for file duplication, stale artifacts, documentation overlap, submodule integrity, dead files, and structural drift from the expected project layout.

## When to Use

- "audit repo structure"
- "check for overlaps"
- "scan for duplication"
- Periodically during development to catch structural drift
- After large refactors or reorganizations
- When the repo feels "messy" and needs inventory

## Prerequisites

- Must be run from a git repository root
- `coldpress.yaml` recommended for expected structure reference

## Process

1. **Structural drift check.** Compare actual directory structure against expected layout from `coldpress.yaml` or project conventions:
   - Missing expected directories
   - Unexpected directories that don't fit the pattern
   - Files in wrong locations

2. **Duplication scan.** Find files with:
   - Identical content (hash comparison)
   - Near-identical content (same purpose, different locations)
   - Overlapping documentation (same concept documented in multiple places)

3. **Dead file detection.** Identify:
   - Empty files (only `.gitkeep` content)
   - Files not imported or referenced anywhere
   - Stale output artifacts from old workflow runs
   - Orphaned config files for removed features

4. **Submodule integrity check** (if applicable):
   - Submodules are populated (not empty)
   - No uncommitted changes in submodules
   - Pinned to expected commits

5. **Stale artifact check.** Look for:
   - Old build artifacts not in `.gitignore`
   - Accumulated output files from previous skill runs
   - Temporary files that should have been cleaned up

6. **Generate report** with:
   - Summary of findings
   - Critical findings (duplication, drift)
   - Advisory findings (stale files, minor issues)
   - Clean areas (what's well-organized)
   - Recommended actions

## Output

A repo structure audit report with findings categorized as critical, advisory, or clean, with specific recommended actions.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | Migrated from repo-structure-audit, adapted to coldpress-os schema |
