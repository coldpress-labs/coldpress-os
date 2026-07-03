---
step_number: 6
step_name: "Shape determination"
step_goal: "Classify the project as greenfield, brownfield, or ambiguous"
halts_for_input: false
next_step: "step-06a-profile.md"
---

## Goal

Give every later phase a clear answer to *"is this a new build or a rewrite?"*. The classification routes Phase 4 decisions (brownfield architect reviews legacy code; greenfield writes fresh) and Phase 6 dev flows (retrofit existing vs. build new).

## Instructions

### 1. Mark partial completion

```ts
await markStepStart(projectRoot, "intake/step-06-shape-determination");
```

### 2. Inspect `_input/legacy/`

- **Empty** (nothing except `.intake-skip` or `.gitkeep`) → `project_shape: greenfield`. Tell the user: *"No legacy material — treating this as a greenfield build."*
- **Has code** (any `.ts`, `.js`, `.py`, `.go`, `.rb`, `.java`, `.cs`, `.rs`, `.swift`, `.kt`, `.php`, or a recognised framework folder) → run `repo-structure-audit` utility skill on `_input/legacy/`. Report language, framework, LOC order-of-magnitude. Set `project_shape: brownfield`. Flag for Phase 4 (Planning) that an architect review is needed.
- **Has non-code content only** (old PRDs, deprecated specs, screenshots) → `project_shape: brownfield`, but no audit needed.
- **Has a mix Butler can't cleanly classify** → `project_shape: ambiguous`, surface the contents to the user, ask them to pick.

### 3. Write the classification

```ts
await updateLocalConfig(projectRoot, {
  project_shape: "greenfield" | "brownfield" | "ambiguous",
});
```

### 4. Append to the intake report

```markdown
## Shape classification

- Project shape: **greenfield | brownfield | ambiguous**
- Legacy material present: yes | no
- Audit report (if run): <summary>
- Decision rationale: <short reason>
```

### 5. Clean exit

```ts
await clearStepMarker(projectRoot);
```

## Halts for Input

Only when the classification is `ambiguous` and Butler needs the user to pick.

## Navigation

→ `step-07-intent-seed.md`

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Original `intake` Step 2. |
| 2.0 | 2026-07-02 | Butler | Renumbered to Step 6 (WS5-B, §8 item 6 — `orient` absorbed as Steps 1-4). |
