---
name: changelog-generator
description: Generate or update CHANGELOG.md from git history, conforming to Keep a Changelog format and SemVer. Distinguishes Added / Changed / Deprecated / Removed / Fixed / Security entries; auto-detects the last released version + bumps the next.
license: MIT
compatibility: Invoked by @devops in Phase 9
version: "1.0"
---

## Purpose

Maintains `CHANGELOG.md` to [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/) format, [SemVer](https://semver.org/spec/v2.0.0.html) versioning. Reads git log since last tagged release; classifies commits into the 6 standard categories; emits a release-notes section the user can edit before publishing.

## When to Use (Proactive Triggers)

1. User says "update changelog" / "generate release notes" / "draft v0.X.0 entry"
2. Pre-tag step in `release.yml` workflow
3. Post-merge of a feature/fix branch into main (optional Unreleased section update)
4. Quarterly housekeeping (consolidate Unreleased entries into a release section)

## Output Artifacts

1. **Updated `CHANGELOG.md`** — appended `## [X.Y.Z] — YYYY-MM-DD` section above the previous release; `[Unreleased]` reset to placeholder
2. **Release-notes draft** at `_context/audit/release-notes-vX.Y.Z-{date}.md` — same content + commit-hash references for review
3. **Categorisation report** at `_context/audit/changelog-categorisation-{date}.md` — which commits went where + any flagged "uncategorisable" (forces user review)
4. **VC bump recommendation** — patch / minor / major based on commit-message conventions (e.g., `feat:` → minor; `fix:` → patch; `BREAKING:` → major)

## Prerequisites

- Repo is a git repository
- At least one prior tagged release (otherwise emit `[0.1.0]` initial)
- `CHANGELOG.md` follows Keep a Changelog format (or doesn't exist — created from scratch)

## Process

1. **Detect last release version**: run `git describe --tags --abbrev=0` (or look for the most-recent `## [X.Y.Z]` header in CHANGELOG.md). Default `[0.0.0]` if neither found.
2. **Collect commits since last release**: `git log --pretty=format:"%h %s" <last-tag>..HEAD` (or full history if no prior tag).
3. **Classify each commit** by leading conventional-commit type or imperative verb:
   - `feat:` / "Add" / "Introduce" → **Added**
   - `change:` / "Update" / "Refactor" → **Changed**
   - `deprecate:` → **Deprecated**
   - `remove:` / "Delete" → **Removed**
   - `fix:` / "Fix" / "Repair" → **Fixed**
   - `security:` / "CVE" / "Patch security" → **Security**
   - Anything else → flag for user review (categorisation report).
4. **Compute VC bump target**:
   - Any `BREAKING:` or major-API removal → **major**
   - Any `feat:` or new public surface → **minor**
   - Otherwise → **patch**
5. **Render release section** in Keep-a-Changelog shape:
   ```markdown
   ## [<X.Y.Z>] — <YYYY-MM-DD>

   ### Added
   - {commit message} (<hash>)

   ### Fixed
   - {commit message} (<hash>)
   ...
   ```
6. **Insert above** the most-recent existing `## [X.Y.Z]` header. Leave `## [Unreleased]` as empty placeholder for next cycle.
7. **Emit drafts** to `_context/audit/` so user can review before tagging.
8. **Surface to user**: "Drafted v<X.Y.Z> changelog. <N> commits classified, <M> flagged for review at `<categorisation-report-path>`. Recommended bump: <patch|minor|major>. Proceed with tag, or revise the draft first?"

## Activation-Gate Checklist

- [ ] At least one commit classified into a Keep-a-Changelog category
- [ ] No `BREAKING:` commit miscategorised as patch
- [ ] All "uncategorisable" commits surfaced to user (categorisation report)
- [ ] CHANGELOG.md still parses as valid markdown
- [ ] Existing release sections preserved unchanged

## Output

Updated `CHANGELOG.md` with new release section + reset `[Unreleased]`. Release-notes draft + categorisation report at `_context/audit/`. User reviews + tags.

## Source Attribution

Pattern adapted from `alirezarezvani/claude-skills` (MIT) `changelog-generator` skill. Implementation original to coldpress-os.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-05-03 | Andy-coldpress-os (Unit #28 / U01) | Initial changelog-generator skill. Authored to v0.3.0-alpha SKILL-AUTHORING-STANDARD. Pattern from alirezarezvani/claude-skills (MIT). |
