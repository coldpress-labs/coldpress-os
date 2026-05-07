---
name: phase-subfolder-mapping
description: Canonical mapping from lifecycle phase outputs to `_context/*` subfolders, with nested-subfolder conventions for specialised artefacts
version: "1.0"
---

# Phase → Subfolder Mapping

> Every skill that writes an artefact lands it in one of the **8 canonical `_context/*` subfolders**. Specialised categories (ops reports, reviews, creative outputs) nest under the most semantically appropriate canonical dir — they do not get their own top-level `_context/<category>/` folder.

This mapping is enforced by the test suite: `test/skill-output-paths.test.ts` fails if any shipped `SKILL.md` declares a `location:` that doesn't root under the 8 canonical `_context/*` dirs (or `_input/` for ingest-shaped skills).

---

## The 8 canonical `_context/*` subfolders

| Subfolder | What lives here | Example artefacts |
|-----------|-----------------|-------------------|
| `_context/sacred/` | Sacred documents (governance-protected) | `context.md`, `tech-stack.md`, `prd.md`, `architecture.md`, `pert-chart.md` |
| `_context/planning/` | Forward-looking planning artefacts | epics, validation reports, design briefs, product briefs, research outputs, creative outputs (brainstorm / design-thinking / problem-solving / storytelling / innovation-strategy), distillates, ADRs |
| `_context/design/` | UX / design artefacts | UX design spec, design system docs |
| `_context/implementation/` | Code-side deliverables | story files, implementation notes, spec-wip |
| `_context/testing/` | Test plans + results | test design, traceability matrices, NFR assessments, test review |
| `_context/tracking/` | In-flight runtime state | sprint-status.yaml, wave-status, deploy-{date}, orient-{date}, intake-{date} |
| `_context/handoffs/` | Inter-phase handoff packages | handoff bundles between phases/teams |
| `_context/audit/` | Backward-looking artefacts + reviews | retrospectives, code reviews, audits, security scans, deployment-readiness reports, ops health checks, framework-change proposals, reverse-engineered project docs |

## Non-`_context/` destinations

| Path | When |
|------|------|
| `_input/.parsed/<path>/<name>.md` | Document-ingest skill `parse-document` outputs parsed markdown (PDF / Office / image / AI-conversation inputs) as inputs for Graphify |
| `secure/manifest.yaml` | Credential shape declaration (never auto-written — user-authored) |

---

## Phase → primary subfolder mapping

| Phase | Key outputs | Lands in |
|-------|-------------|----------|
| Bootstrap | `context.md` seed (from `intake` Step 3), `orient-{date}.md` + `intake-{date}.md` reports, Phase 1 → Phase 2 handoff artefact | `sacred/` (context), `tracking/` (reports), `handoffs/` (handoff) |
| Discovery | Pre-project interview output, domain/market/technical research, creative brainstorm | `sacred/` (context.md), `planning/` (research), `planning/creative/` (brainstorms) |
| Tech Stack | Stack evaluation (ADRs), locked tech-stack.md | `planning/` (ADRs), `sacred/` (tech-stack.md) |
| Planning (Phase 4) | PRD, validate-prd, legacy-assessment, design-brief (entry), product-brief reconciliation | `sacred/` (PRD), `planning/` (briefs, legacy-assessment) |
| Design (Phase 5) | _scaffolded — UX spec, design-system, brand-guidelines, prototype, storytelling. Final output shapes locked in Phase 5 deep dive Round 2._ | `design/` (UX, design-system), `planning/` (storytelling), `design/prototype/` |
| Architecture (Phase 6) | _scaffolded — architecture.md (sacred), updated ADRs. Output shapes locked in Phase 6 deep dive._ | `sacred/` (architecture.md), `planning/` (ADRs) |
| Breakdown (Phase 7) | PERT chart, epics, stories, sprint-status, readiness report | `sacred/` (PERT), `implementation/` (stories), `tracking/` (sprint-status), `planning/` (epics, readiness) |
| Implementation (Phase 8) | dev-story outputs, wave-status, review reports | `implementation/`, `tracking/`, `audit/` (reviews) |
| Deployment (Phase 9) | Deploy logs, readiness reports, security scans | `tracking/` (deploy), `audit/` (readiness + scans) |
| Operate (Phase 10) | Sprint status updates, course-correction, document-project | `tracking/`, `planning/` (course-correction), `audit/` (doc-project) |
| Evolve (Phase 11) | Retrospective, product-evolution, innovation-strategy | `audit/` (retros + product-evolution), `planning/creative/` (innovation) |

---

## Nesting conventions inside canonical subfolders

Canonical dirs are the **top-level contract**. Inside each, specialised subfolders are encouraged when a skill produces a whole family of artefacts:

```
_context/
├── sacred/          # 5 files, flat — no nesting
├── planning/
│   ├── research/       # domain / market / technical (constraint) research outputs
│   ├── creative/       # brainstorm, design-thinking, problem-solving, storytelling, innovation-strategy, presentation
│   ├── distillates/    # distillator outputs
│   ├── adr-*.md        # architecture decision records (flat in planning)
│   ├── epics.md
│   ├── design-brief-*.md
│   ├── product-brief-*.md
│   ├── prd-validation-*.md
│   └── readiness-report-*.md
├── design/          # ux-design-spec.md, design system docs
├── implementation/     # story files, spec-wip.md
├── testing/            # test plans, results, NFR assessment, traceability
├── tracking/           # sprint-status.yaml, wave-status.md, deploy-*.md, orient-*.md, intake-*.md
├── handoffs/           # inter-phase handoff packages
└── audit/
    ├── ops/            # health checks (env, dep, db-migration, security, ci-cd, repo-structure)
    ├── reviews/        # adversarial, code-audit, edge-case-hunter, editorial-prose, editorial-structure
    ├── meta/           # framework-change proposals
    ├── docs/           # reverse-engineered project docs (document-project output)
    ├── retro-*.md      # retrospectives (flat)
    ├── code-review-*.md
    ├── security-scan-*.md
    └── deployment-readiness-*.md
```

**Rule of thumb:** if a skill produces N artefacts of the same kind (e.g., health checks, code reviews), nest them in a category subfolder under the canonical dir. If a skill produces 1 artefact per project (e.g., `prd.md`), keep it flat.

---

## Migration from pre-v0.3 paths

Coldpress-os v0.1 and v0.2-dev had several non-canonical top-level subfolders (`_context/ops/`, `_context/reviews/`, `_context/creative/`, `_context/meta/`, `_context/discussions/`, `_context/extractions/`, `_context/distillates/`, `_context/docs/`). These were all renormalized in Wave 4 Block R:

| Pre-v0.3 path | v0.3 path |
|---------------|-----------|
| `_context/ops/` | `_context/audit/ops/` |
| `_context/reviews/` | `_context/audit/reviews/` |
| `_context/creative/` | `_context/planning/creative/` |
| `_context/meta/` | `_context/audit/meta/` |
| `_context/discussions/` | `_context/planning/` |
| `_context/extractions/` | `_input/.parsed/` |
| `_context/distillates/` | `_context/planning/distillates/` |
| `_context/docs/` | `_context/audit/docs/` |

Existing consumer projects with pre-v0.3 paths are NOT auto-migrated — the framework surfaces a warning at skill-run time pointing at this doc. Migration is manual (`mv _context/ops _context/audit/ops` etc.); skills write to the new paths regardless.

---

## Extending

To add a new canonical top-level subfolder (rare):

1. The addition is a semver-major-significant framework change; requires estate Decision-Log entry.
2. Update this doc's §"The 8 canonical" table (and the title / count).
3. Update `test/skill-output-paths.test.ts` canonical set.
4. Update `template/_context/` + `template/coldpress.yaml` + `coldpress-os/coldpress.yaml` output-block registration.

To add a nested subfolder under an existing canonical dir: no doc change needed — skills just write there. The test only validates the top-level root.
