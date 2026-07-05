---
name: skill-builder
description: Create and edit skill definitions for the coldpress-os framework. Enforces SKILL-AUTHORING-STANDARD v0.3.0-alpha (license-in-frontmatter, ≤10KB body, 8 required sections, license-checking, schema-driven outputs).
license: MIT
compatibility: Invoked by @butler in Phase meta
version: "1.1"
---

## Purpose

Creates or edits skill definitions following the **coldpress-os SKILL-AUTHORING-STANDARD v0.3.0-alpha** (`authoring/infrastructure/skill.md`). Generates SKILL.md, workflow.md, and step files as needed. Validates against the standard pre-emit. (Skills are auto-discovered by `build:skills` — no manual catalog to update.) Refuses to emit skills missing required frontmatter or exceeding the 10KB body cap.

## When to Use (Proactive Triggers)

1. "create a new skill" / "build a skill" / "scaffold skill X"
2. "edit skill definition" / "update skill X frontmatter"
3. When adding new capabilities to the framework (vendoring from external skill repos counts — license-check + adapt to standard)
4. When modifying existing skill behavior in a non-trivial way (bumps `version`, sets `updated`)
5. Audit-triggered: an existing skill flagged as non-compliant (missing license, body >10KB, missing required sections)

## Output Artifacts

1. **SKILL.md** at `../{category}/{skill-name}/SKILL.md` — conforming to authoring standard
2. **workflow.md + steps/** at same dir (if `type: workflow`) — multi-step orchestration
3. **Pre-emit validation report** at `_context/audit/skill-builder-validation-{date}.md` — checks the new/edited SKILL.md against the standard before commit

## Prerequisites

- Skill schema reference: `../_schema.md`
- **Authoring standard:** `../../authoring/infrastructure/skill.md` (canonical reference; load this first)

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

**Standard-enforcement checks** (executed in workflow Step N before emit):

- [ ] Frontmatter has all required fields: `name`, `description`, `type`, `category`, `agent`, `phase|phases`, `license`, `version`, `updated`, `inputs`, `outputs`
- [ ] `license` is permissive (MIT / Apache-2.0 / BSD / CC0); GPL/AGPL refused
- [ ] SKILL.md body ≤10KB (excluding frontmatter)
- [ ] All 8 required sections present: Purpose, When to Use (Proactive Triggers, 4-6), Output Artifacts (4-6), Prerequisites, Process, Activation-Gate Checklist, Output, VC panel
- [ ] Source attribution present if vendored from an external repo (memory `reference_doc_processor_licenses` enforcement)
- [ ] Skill name kebab-case + matches parent dir
- [ ] If `type: workflow`: `workflow.md` exists + `steps/` populated
- [ ] If `type: simple`: no separate workflow file (inline process only)

If any check fails: emit validation report + halt for user revision. Do NOT write the skill.

## Activation-Gate Checklist

- [ ] Authoring-standard reference loaded (`authoring/infrastructure/skill.md`)
- [ ] All standard-enforcement checks pass
- [ ] Skill catalog CSV row added/updated
- [ ] Skill registered in `REGISTRY.md` (relevant phase or category section)
- [ ] If vendored: source attribution + license-check documented in skill's "Source Attribution" section

## Output

Complete skill definition with SKILL.md (standard-compliant), optional workflow.md + step files, updated catalog row, REGISTRY entry, and pre-emit validation report.

## Source Attribution

Pattern enhancement adapted from `alirezarezvani/claude-skills` (MIT) `SKILL-AUTHORING-STANDARD.md`. Implementation original to coldpress-os.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1 | 2026-05-03 | Andy-coldpress-os (Unit #28 / U05) | Adopted SKILL-AUTHORING-STANDARD v0.3.0-alpha. Frontmatter expanded (license, updated, graph_queries / cold_file_reads / existence_checks blocks). Body sections updated to 8-section convention. Pre-emit standard-enforcement checklist added. Source attribution requirement codified. References `authoring/infrastructure/skill.md` as canonical authoring reference. Pattern from alirezarezvani/claude-skills (MIT). |
| 1.0 | 2026-04-08 | Alfred | New meta skill for coldpress-os framework evolution |
