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
| 1 | **context.md** | Phase 2 (Discovery) | `docs/context.md` | User input, research | PRD, architecture, UX, stories |
| 2 | **tech-stack.md** | Phase 3 (Tech Stack) | `docs/tech-stack.md` | context.md, evaluation | Architecture, implementation, deployment, CI/CD |
| 3 | **PRD** | Phase 4 (Planning) | `_context/planning/prd.md` | context.md, product brief | Architecture, UX, epics, stories |
| 4 | **architecture.md** | Phase 4 (Planning) | `_context/planning/architecture.md` | PRD, tech-stack.md | Epics, stories, implementation |
| 5 | **PERT chart** | Phase 5 (Breakdown) | `_context/tracking/pert-chart.md` | Epics, dependencies | Sprint planning, wave execution, timelines |

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

For projects using the three-tier pattern (devSandbox → app), sacred documents live in the devSandbox and **never promote** to the app repo. They are planning artifacts, not production code.

The promotion rules are documented in `governance/promotion-flow.md`.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-07 | Alfred | Initial sacred documents governance — 5 sacred docs, change workflow structure, dependency graph |
