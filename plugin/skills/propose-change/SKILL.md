---
name: propose-change
description: Formalize feedback as GitHub Issues or PRs on the coldpress-os repository
license: MIT
compatibility: Invoked by @valet in Phase meta
version: "1.0"
---

## Purpose

Formalizes feedback, bug reports, or improvement suggestions as structured change proposals for the coldpress-os framework. Produces a document suitable for GitHub Issues or PRs, ensuring framework changes are tracked and reviewed.

## When to Use

- "propose a change to coldpress-os"
- "report a framework bug"
- "suggest an improvement"
- When a project-level Butler identifies something that should change in coldpress-os
- When usage reveals a gap, bug, or improvement opportunity in the framework

## Prerequisites

- Clear description of the change or issue
- Context on why the change is needed

## Process

1. **Classify the change:**
   - **Bug** — Something doesn't work as documented
   - **Enhancement** — Improvement to existing functionality
   - **New Feature** — New capability needed
   - **Documentation** — Docs are wrong or missing
   - **Breaking Change** — Would require project-level updates

2. **Gather details:**
   - What specifically needs to change?
   - Which files or areas are affected?
   - What's the rationale? (Why is this needed?)
   - What's the impact if not addressed?
   - Suggested implementation (if known)

3. **Identify affected scope:**
   - Which skills, agents, templates, or workflows are impacted?
   - Would this change require project-level wrapper updates?
   - Is this a schema change or content change?

4. **Draft proposal** with:
   - Title (concise, descriptive)
   - Type (bug/enhancement/feature/docs/breaking)
   - Affected areas (file paths or component names)
   - Description (what and why)
   - Suggested implementation
   - Impact assessment

5. **Write proposal** to `_context/meta/` and present to user.

6. **Offer to create GitHub Issue** if the user wants to formalize it immediately.

## Output

A structured change proposal document suitable for GitHub Issue creation.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 | Alfred | New meta skill for coldpress-os framework evolution |
