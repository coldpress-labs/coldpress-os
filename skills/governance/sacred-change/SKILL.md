---
name: "sacred-change"
description: "The one change workflow for every sacred doc (context, tech-stack, prd, architecture). Runs impact analysis, gets human approval, and emits the approved change record the sacred-guard hook requires before the edit is allowed."
type: "simple"
category: "governance"
agent: "butler"
phases: [2, 3, 4, 6]
tools: ["Read", "Write", "Bash"]
disable-model-invocation: true
inputs:
  - "target sacred doc path (_context/sacred/*.md)"
  - "the requested change + rationale"
outputs:
  - artifact: "approved sacred-change record"
    location: "_context/audit/sacred-changes/CHG-{doc}-{seq}.yaml"
    format: "yaml"
    schema: "schemas/sacred-change.schema.ts"
version: "1.0"
---

## Purpose

Sacred documents (`_context/sacred/{context,tech-stack,prd,architecture}.md`) are
foundational — a change ripples across many downstream deliverables. This skill is
the **single** protected change process for all of them (it replaces the five
per-doc `governance/*-change/workflow.md` prose workflows, which shared one
skeleton).

It is **mechanically enforced**: the `sacred-guard` PreToolUse hook BLOCKS any
write under `_context/sacred/*` unless this skill has produced an **approved**
change record at `_context/audit/sacred-changes/`. Prose governance an agent could
skip is now a gate an agent cannot skip. (Run `coldpress hook sacred-guard
--explain` for the hook's contract.)

> PERT charts are **no longer sacred** (desanctified in v0.4 — the story-graph +
> derived waves replace them), so there is no PERT change workflow.

## When it runs

Triggered whenever a locked sacred doc must change after its phase lock
(context after P2, tech-stack after P3, prd after P4, architecture after P6).

## Severity (tech-stack; generalizes to the others)

| Level | Examples | Required process |
|-------|----------|-----------------|
| **Minor** | Version bump, config tweak, typo/wording | Steps 1, 4, 5, 7 |
| **Moderate** | Add a dependency, swap a utility, new requirement | Full workflow |
| **Major** | Change framework/DB/hosting; reframe the problem; restructure the system | Full workflow + downstream re-review (e.g. `@architect`) |

## Steps

### 1. Describe the change
What is changing, and why (performance, cost, compatibility, scope, feedback)?
Which sacred doc, and what severity?

### 2. Impact analysis (per target doc)

**context.md** — the root; changes ripple widest:

| Downstream | Check for |
|---|---|
| prd.md | Problem statement, audience, scope |
| architecture.md | Domain model, system boundaries |
| ux-design-spec | Personas, journey maps |
| epics & stories | Acceptance criteria, scope boundaries |

**tech-stack.md:**

| Downstream | Check for |
|---|---|
| architecture.md | System design, integration patterns, infrastructure |
| implementation code | Import paths, API usage, patterns |
| CI/CD + deploy config | Build/test runners, deploy targets, env vars, runtime |
| `coldpress.yaml` `stack_pack` | May need to swap the stack pack |

**prd.md:**

| Downstream | Check for |
|---|---|
| architecture.md | System design, component boundaries, data model |
| ux-design-spec | User flows, wireframes, interaction patterns |
| epics / stories | New/removed/rescoped epics + stories, acceptance criteria |

**architecture.md:**

| Downstream | Check for |
|---|---|
| epics / stories | Implementation approach, technical tasks, acceptance criteria |
| implementation code | Patterns, integrations, data model |
| ADRs | Whether a new/updated ADR is required |

> **Blast radius (WS2):** once `coldpress trace` lands, this step calls
> `trace impact <doc>` to compute the exact impacted stories and flip them to
> `re-verify` automatically, replacing the manual table walk.

### 3. Downstream review
For each affected artifact, name the specific impact. For **major** changes, flag
whether a downstream owner (`@architect`, `@pm`) must re-review before proceeding.

### 4. Approval (human gate)
Present the change, severity, and every downstream impact. The human explicitly
approves or rejects. **This is a human gate** — Butler does not self-approve a
sacred change.

### 5. Emit the approved change record ★ (this is what unblocks the edit)

Write `_context/audit/sacred-changes/CHG-{doc}-{seq}.yaml`, validating against
`schemas/sacred-change.schema.ts`:

```yaml
id: CHG-prd-1                          # CHG-<doc>-<seq>; matches the filename stem
target: _context/sacred/prd.md         # the doc being changed
status: approved                       # only 'approved' unblocks sacred-guard
reason: "Add DPDPA consent + erasure acceptance criteria (T1)"
approved_by: "<human approver>"        # required when status: approved
created: "<ISO timestamp>"
```

With this record present, the `sacred-guard` hook allows the write to
`target`. Without it (or while `status` is `proposed`), the write is blocked.

### 6. Execute + cascade (with blast radius)
Make the edit to the sacred doc (now permitted). Then compute the blast radius
and flip the impacted stories to **re-verify**:

```bash
coldpress trace impact _context/sacred/prd.md   # or the doc you changed
```

Every story it lists must have its acceptance re-run before it counts as done
again. Then cascade the downstream updates identified in Step 2 (architecture,
code patterns, CI/CD, `coldpress.yaml`, epics/stories) as separate, in-scope work.

> The full requirement→story blast radius activates once P4/P6 artifacts carry
> requirement IDs (WS4 keying) — the mechanism (`coldpress trace impact`) is wired now.

### 7. Log
Add a Version Control entry to the sacred doc. Set the change record's `status`
to `applied` once the edit + cascade are complete (audit trail).

## Notes

- One record authorizes one document's change. Editing two sacred docs needs two
  records.
- Escape hatch (logged): `COLDPRESS_OVERRIDE="sacred-guard:<reason>"` bypasses the
  hook once, loudly — for genuine emergencies, not routine edits.
- Semantic policy checks on the edited doc still run via `validate-sacred-doc`
  (Conftest/Rego); structural shape via `validate-schema`. This skill governs the
  *right to change*; those validate the *result*.
