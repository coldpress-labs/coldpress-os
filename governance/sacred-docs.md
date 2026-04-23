# Sacred Documents — coldpress-os Governance

> Sacred documents are foundational project artifacts whose changes ripple across multiple downstream deliverables. They are protected by mandatory change workflows.

---

## 1. What Makes a Document Sacred?

A document is sacred when:
1. **Multiple downstream artifacts depend on it** — changing it triggers a cascade
2. **It represents a locked decision** — reversing it has significant cost
3. **It was produced through a structured process** — skipping that process to edit it undermines quality

---

## 2. The Five Sacred Documents

| # | Document | Produced In | Location | Depends On | Depended On By |
|---|----------|-------------|----------|------------|----------------|
| 1 | **context.md** | Phase 2 (Discovery) | `_context/sacred/context.md` | User input, research | PRD, architecture, UX, stories |
| 2 | **tech-stack.md** | Phase 3 (Tech Stack) | `_context/sacred/tech-stack.md` | context.md, evaluation | Architecture, implementation, deployment, CI/CD |
| 3 | **PRD** | Phase 4 (Planning) | `_context/sacred/prd.md` | context.md, product brief | Architecture, UX, epics, stories |
| 4 | **architecture.md** | Phase 4 (Planning) | `_context/sacred/architecture.md` | PRD, tech-stack.md | Epics, stories, implementation |
| 5 | **PERT chart** | Phase 5 (Breakdown) | `_context/sacred/pert-chart.md` | Epics, dependencies | Sprint planning, wave execution, timelines |

---

## 3. Protection Rules

### 3.1 No Direct Edits

Sacred documents MUST NOT be edited directly. All changes go through the corresponding change workflow in `governance/`.

### 3.2 Change Workflow Required

Each sacred document has a dedicated change workflow:

| Document | Change Workflow |
|----------|----------------|
| context.md | `governance/context-change/workflow.md` |
| tech-stack.md | `governance/tech-stack-change/workflow.md` |
| PRD | `governance/prd-change/workflow.md` |
| architecture.md | `governance/architecture-change/workflow.md` |
| PERT chart | `governance/pert-change/workflow.md` |

### 3.3 Mandatory Steps in Every Change Workflow

1. **Describe the change** — What specifically needs to change and why
2. **Impact analysis** — Which downstream documents are affected?
3. **Downstream artifact check** — Review each affected artifact for required updates
4. **Approval** — User explicitly approves the change and its downstream impacts
5. **Execute change** — Update the sacred document
6. **Cascade updates** — Update all affected downstream artifacts
7. **Log the change** — Record in the document's version control panel

### 3.4 Emergency Override

In rare cases, a sacred document may need immediate correction (factual error, typo, broken reference). The user may override the change workflow by explicitly stating: "Override sacred doc protection for [document]."

The override must still:
- Log the change in the version control panel
- Note that it was an emergency override
- Flag any downstream artifacts that may need review

---

## 4. Dependency Graph

```
context.md
├── PRD
│   ├── architecture.md
│   │   ├── epics
│   │   │   ├── stories
│   │   │   └── PERT chart
│   │   │       └── sprint planning
│   │   └── implementation patterns
│   ├── UX design spec
│   └── epics
├── architecture.md (also depends on tech-stack.md)
└── UX design spec

tech-stack.md
├── architecture.md
├── implementation patterns
├── CI/CD config
└── deployment config
```

A change to `context.md` can cascade through the entire tree. A change to `tech-stack.md` affects everything below architecture. This is why these documents are sacred.

---

## 5. When Documents Become Sacred

Documents become sacred at the moment they are **completed through their producing workflow** and **accepted by the user**. Before that, they are drafts and can be freely edited.

| Document | Becomes Sacred When |
|----------|-------------------|
| context.md | Phase 2 discovery workflow completes |
| tech-stack.md | Phase 3 stack-locking workflow completes |
| PRD | Phase 4 create-prd workflow completes and passes validation |
| architecture.md | Phase 4 create-architecture workflow completes |
| PERT chart | Phase 5 parallelization-strategy workflow completes |

---

## 6. Promotion Flow

For projects using the three-tier pattern (`sandbox/` → `live/`), sacred documents live under the project root (in `_context/sacred/`) and **never promote** into the `live/` tree. They are planning artifacts, not production code.

The promotion rules are documented in `governance/promotion-flow.md`.

---

## 7. Structural Migrations

A **structural migration** is a one-time change to *where* a sacred document lives on disk — its path, not its content. Section 3 ("Protection Rules") governs changes to content; this section governs changes to location.

Structural migrations are deliberately rare and deliberately governed, because every skill, template, and doc that references a sacred path has to move in the same wave or the project breaks for every consumer at once. This is not a workflow to reuse casually.

### 7.1 When §7 applies

§7 applies when *all five* sacred documents are being relocated as part of a coordinated framework refactor — for example, introducing a new canonical subfolder like `_context/sacred/`. It does not apply to content changes, addition of a sixth sacred document, or any ordinary day-to-day work. Those flow through §3.

### 7.2 The migration pattern

A §7 migration is executed as **one atomic wave** with the following shape:

1. **Single governance entry.** One entry in the estate-level `docs/docs/DECISIONS-LOG.md` covers the migration for all five documents. Enumerate every path consumer (skills, templates, `coldpress.yaml` keys, docs, governance workflows) in that entry — if a consumer is not listed, its references will drift.
2. **Atomic update.** All references to the old paths are replaced with the new paths in the same commit (or same PR). No grace period, no dual-support window; partial migrations are worse than no migration because they make "which path is canonical" ambiguous.
3. **Sacred status preserved.** The migration changes *where* the document lives, not whether it is sacred. Each document remains sacred; its producing workflow and change workflow are unaffected.
4. **Per-doc version-control line.** Each sacred document's own version control panel gains a "path changed, content unchanged" entry the next time it is edited in a consuming project. This is retroactive — §7 cannot force an update on documents sitting in already-deployed consumer projects.
5. **No Section 3.4 emergency override.** §7 is itself the carve-out; there is no faster path below §7.

### 7.3 What §7 does *not* do

- It does not permit content changes disguised as migrations. If the migration touches prose, that's a §3 change and follows §3's rules in addition to §7's.
- It does not permit adding or removing sacred documents. That is a framework-level architectural change requiring its own governance decision.
- It does not apply retroactively — past path changes before this section existed are grandfathered; future changes follow this protocol.

### 7.4 Applying §7 is itself a governance act

Using §7 requires a DECISIONS-LOG entry *before* the migration commits, not after. The log entry is the sign-off record — without it, the migration is not authorised.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-04-23 | Cadbury-hq | Sacred-doc paths relocated to `_context/sacred/*` via §7 structural migration (single atomic update, DECISIONS-LOG entry filed at estate level). §2 table, §3 workflow references, `coldpress.yaml` sacred_docs block, all skill/template/doc references swept in the same wave. §6 refreshed: devSandbox→app terminology replaced with sandbox→live to match the current three-tier pattern. New §7 Structural Migrations added as the one-time carve-out for path-only sacred-doc changes (no content touched). Paths before: `docs/context.md`, `docs/tech-stack.md`, `_context/planning/prd.md`, `_context/planning/architecture.md`, `_context/tracking/pert-chart.md`. Paths after: `_context/sacred/{context,tech-stack,prd,architecture,pert-chart}.md`. |
| 1.0 | 2026-04-07 | Alfred | Initial sacred documents governance — 5 sacred docs, change workflow structure, dependency graph |
