---
name: "codebase-onboarding"
description: "Walk a new contributor (or Claude session) through an existing codebase — directory map + key entry points + dependency layout + 5-minute orientation. Conditional in brownfield projects (`_input/legacy/code/` populated) and on `coldpress init` of an existing repo. Complements `legacy-assessment` (architecture-focused) by being code-tour-focused."
type: "workflow"
category: "lifecycle"
phase: 1
agent: "analyst"
license: "MIT"
version: "1.0"
updated: "2026-05-03"
inputs:
  graph_queries:
    - "CodeModule nodes (directory hierarchy)"
    - "package.json / pyproject.toml / Cargo.toml node (entry points)"
  cold_file_reads:
    - "package.json or equivalent manifest"
    - "README.md (existing)"
    - "_input/legacy/code/ (if brownfield)"
    - ".claude/settings.json (if exists)"
  existence_checks:
    - "At least one of: package.json | pyproject.toml | Cargo.toml | go.mod"
outputs:
  - artifact: "Onboarding tour"
    location: "_context/planning/codebase-onboarding-v{N}.md"
    format: "markdown"
    sacred: false
  - artifact: "Directory map"
    location: "_context/planning/codebase-map-v{N}.md"
    format: "markdown"
    sacred: false
  - artifact: "Entry-points index"
    location: "_context/planning/entry-points-v{N}.md"
    format: "markdown"
    sacred: false
---

## Purpose

Phase 1 conditional skill that gives a new contributor (or Claude session) a 5-minute orientation to an existing codebase. Three artefacts: a **directory map** (annotated tree), an **entry-points index** (where execution starts: bin/, main.ts, index.js, manage.py, etc.), and a **walkthrough** (read these 5 files in this order to understand the system).

Distinct from `legacy-assessment`: that skill is architecture-focused (what tech stack, what migration plan); this skill is code-tour-focused (how to navigate, where to start reading). Both fire in brownfield mode; together they give the architecture answer + the orientation answer.

## When to Use (Proactive Triggers)

1. `coldpress init` on a repo that already has source code (existing project, not greenfield)
2. `_input/legacy/code/` is populated at Phase 1 start
3. New contributor joins; user says "tour the codebase" / "where do I start" / "give me a walkthrough"
4. Claude session resumes after long break; needs re-orientation
5. Pre-Phase-4 if Phase 3 (Tech Stack) was inherited rather than authored fresh

## Output Artifacts

1. **Onboarding tour** at `_context/planning/codebase-onboarding-v{N}.md` — narrative walkthrough (5-10 files in dependency-flow order with one-line each)
2. **Directory map** at `_context/planning/codebase-map-v{N}.md` — annotated tree (auto-generated; humans add prose annotations); flags for `node_modules/` `.git/` etc. (skip)
3. **Entry-points index** at `_context/planning/entry-points-v{N}.md` — manifest-extracted entries (`package.json` `bin`, `main`, `scripts.start`; `pyproject.toml` console_scripts; `Cargo.toml` `[[bin]]`)
4. **Tech-stack hint** for Phase 3 — auto-detected stack (`react@18.2.0` from package.json) feeds Phase 3 stack-discovery-sync as known-prior-state

## Prerequisites

- Repo has at least one language manifest (`package.json` / `pyproject.toml` / `Cargo.toml` / `go.mod` / `pom.xml` / `Gemfile`)
- Phase 1 `intake` skill has run (so `coldpress.yaml` exists with `project.name` / `project.slug`)
- For brownfield: `_input/legacy/code/` symlinked or copied; otherwise scan `./` directly
- For Claude-session resume: existing `_context/planning/codebase-onboarding-v{N-1}.md` may be auto-summarised (skip re-walk if recent)

## Process

→ See [workflow.md](workflow.md) for full process.

1. **Step 1 — Detect language(s)** from manifest files; record primary + secondary
2. **Step 2 — Build annotated directory map**:
   - `tree` (or equivalent, depth 3) excluding `node_modules`, `.git`, `dist`, `build`, `target`, `__pycache__`
   - Annotate top-level dirs (src/lib/test/docs/scripts/...) by inferred role
   - Surface "unusual" dirs (anything not standard) for user explanation
3. **Step 3 — Extract entry points** from manifest:
   - npm: `bin`, `main`, `module`, `exports`, `scripts`
   - Python: `[project.scripts]`, `setup.py entry_points`, `__main__.py`
   - Rust: `[[bin]]`, `src/main.rs`
   - Go: `func main()` in `cmd/*` or root
4. **Step 4 — Identify reading order** (5-10 files) by:
   - Start at most-trafficked entry point
   - Follow imports for one hop; flag the most-imported modules
   - Annotate each: "what this file does in 1 sentence"
5. **Step 5 — Tech-stack hint** for Phase 3 — extract framework versions; surface in `_context/planning/tech-stack-hint-v{N}.md` for Phase 3 to consume
6. **Step 6 — Emit all three artefacts**; cross-link with `legacy-assessment` output if both ran

## Activation-Gate Checklist

- [ ] At least one manifest detected; primary language identified
- [ ] Directory map annotated (every top-level dir has at least a one-line role)
- [ ] Entry-points index lists ≥1 entry; manifest fields verified to resolve to real files
- [ ] Reading-order walkthrough has 5-10 files with one-line each
- [ ] Tech-stack hint emitted (or N/A logged) for Phase 3 consumption
- [ ] Cross-link added to legacy-assessment output if it exists

## Output

Three artefacts in `_context/planning/`. Phase 3 stack-discovery-sync reads tech-stack-hint as prior state. Phase 4 create-prd skill can reference codebase-onboarding for "what already exists" framing in PRD scope section.

## Integration with `intake`

| Skill | When | Scope |
|---|---|---|
| `intake` (all of Phase 1) | Once per project | Check-in + scaffold confirm + 11-phase journey intro + material + context.md authoring + `coldpress.yaml` fields |
| `codebase-onboarding` (this skill) | Conditional brownfield + on-demand re-orient | Code-tour walkthrough + directory map |
| `legacy-assessment` (Phase 4) | Conditional brownfield | Architecture-focused: stack inventory + migration plan |

## Source Attribution

Pattern adapted from `alirezarezvani/claude-skills` (MIT) `codebase-onboarding` + `monorepo-navigator` skills + `mhattingpete/claude-skills-marketplace` (Apache-2.0) `code-tour` + `codebase-documenter` skills. Implementation original to coldpress-os; integrates with Phase 1 + Phase 3 + Phase 4 brownfield path.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-03 | Andy-coldpress-os (Unit #28 / U10) | Initial codebase-onboarding skill. Authored to v0.3.0-alpha SKILL-AUTHORING-STANDARD. Pattern from alirezarezvani/claude-skills (MIT) + mhattingpete/claude-skills-marketplace (Apache-2.0). Phase 1 conditional brownfield + on-demand re-orient. |
