# Agent-team demo — Phase 8 wave in team mode

> A worked walkthrough of coldpress-os's Phase 8 **team mode**: Butler as lead
> delegating a wave of independent stories to teammates, with **plan-approval**
> and **TaskCompleted** gates, and the **verifier kept outside the team**.
> This is the §5 P8 / §9 WS5 demo. It shows the loop end-to-end on a small
> feature so the mechanics are legible; real waves are larger.

---

## When team mode is used (not always)

Team mode is **opt-in and cost-gated** — it is not the default. Butler runs a
wave in a team only when **`coldpress waves`** flags a wave with **≥3
independently-executable stories** whose ownership globs are disjoint. Teams
cost ~3–7× the tokens of sequential work (G10), so Butler prints a **projected
cost** at dispatch and a wave of 1–2 stories runs sequentially instead.

**Never in a team:** security-registry stories (solo dispatch, verifier on opus
with the OWASP checklist — G3). And the **verifier is always outside the team** —
verification must stay structurally independent of implementation.

---

## The example wave

PRD requirement **R-14 "user profile page"**, sliced at P7 into a wave of three
disjoint stories (from `story-graph.yaml`, wave computed by `coldpress waves`):

| Story | Owns (globs) | Risk | Acceptance stubs (red) |
|-------|--------------|------|------------------------|
| `ST-41` avatar upload | `src/features/avatar/**` | med | `avatar.spec.ts`, `avatar.test.ts` |
| `ST-42` profile form | `src/features/profile-form/**` | low | `profile-form.spec.ts` + computed-style assertions vs tokens.json |
| `ST-43` settings panel | `src/features/settings/**` | low | `settings.spec.ts` |

Ownership is disjoint (verified by `coldpress waves` — intra-wave `owns` globs
must not overlap), so the three can proceed in parallel without merge conflict.
The contract story for R-14's API surface (`ST-40`) already merged to main
before this wave (contract-first, G4).

---

## The loop, step by step

### 1. Butler computes the wave + prints projected cost

```
$ (Butler) coldpress waves
  Wave 3 ready: ST-41, ST-42, ST-43 (3 disjoint stories)
  → team mode eligible (≥3). Projected: ~5× sequential tokens (~140k). Proceed? [y/N]
```

Butler enters **delegate mode** as lead. It spawns one teammate per story, each in
its own **git worktree** (`story/ST-4x`), with the ownership boundary written into
the spawn prompt.

### 2. Per-teammate handoff packet (scoped, not the whole repo)

Each teammate receives an `HND-p7-developer-*` packet — scoped PRD section,
architecture §component, tokens.json + styleguide §components, the **red
acceptance stubs**, and the `owns` / forbidden globs. Teammates run `dev-story`.

### 3. Plan-approval gate (risk:high only)

`ST-41` is `risk: med`, `ST-42`/`ST-43` are `risk: low` — none are `risk: high`,
so they proceed in plan mode without blocking. **If** a story touched a
security-registry path (`risk: high`), it would be pulled **out of the team**,
dispatched solo, and require **Butler plan approval before any edit**:

```
(teammate ST-4x) entering plan mode…
  PLAN: add avatar upload endpoint + S3 signed-URL flow
  ⛔ risk:high (security-registry: src/features/avatar/upload) — awaiting Butler plan approval
(Butler) reviewed → approved. proceed.
```

### 4. Hooks enforce the boundary during implementation

While each teammate works, the live hooks are the real guardrails (not prose):

- **`boundary-guard`** blocks a write outside the teammate's `owns` globs. When
  `ST-42` needs a shared util it doesn't own, the edit is blocked → the teammate
  records a **DLT record** instead of a stray edit; Butler reconciles it.
- **`test-integrity`** blocks weakening/deleting an acceptance stub to force green.
- **`secret-scan`** / **`schema-validate`** run on every write.

### 5. TaskCompleted gate = quality-gate

A teammate can only report **TaskCompleted** when its story is genuinely done —
the **`quality-gate` (Stop hook) blocks completion while the suite is red**. For
`ST-42` (a UI story), completion also requires the **styleguide-conformance
self-check** (components match tokens.json + the `/styleguide` route).

```
(teammate ST-42) all stubs green; styleguide self-check ✓ → TaskCompleted
(teammate ST-43) all stubs green → TaskCompleted
(teammate ST-41) 1 stub red → quality-gate BLOCKS completion → keep working
```

**TeammateIdle → next ready story**: when a teammate finishes and the wave has
more ready work, Butler assigns the next story from the computed `coldpress
waves` schedule + `sprint-status.yaml`; otherwise the teammate winds down.
(There is no separate `next-task` hook — the schedule + sprint-status already
hold the ready-work order; WS10-C3.)

### 6. Clean-room verification — outside the team

When a story reports TaskCompleted, Butler issues a **fresh** packet to
`@verifier` — **spec + acceptance + diff only, never the developer's reasoning**.
The verifier is not a teammate; it runs clean-room:

```
(Butler → @verifier, fresh context) verify ST-42
  stub suite ✓ · visual-verify vs tokens.json ✓ · semantic pass ✓ ·
  scope pass (trace why on each changed file — all within owns) ✓
  → verdict: PASS
```

A **fail** returns findings-only to the teammate (verifier stays clean for round
2). **Two consecutive fails → escalate to human** with both summaries.

### 7. Sequential integration merge

Verified stories merge to main **sequentially** (critical-path first), running
L3/L4 between merges; a conflict beyond trivial is a **re-plan event**, not merge
heroics (G4). The wave closes when all three are `verifier: pass` and merged.

---

## What the demo proves

- Team mode triggers only on a **≥3-disjoint-story wave**, with a printed cost.
- **Ownership boundaries** are enforced live (boundary-guard), not trusted.
- **Plan-approval** gates risk:high work before edits.
- **TaskCompleted = quality-gate** — a teammate cannot report done while red.
- The **verifier is structurally outside the team** (clean-room, fresh packet).
- Integration is **contract-first + sequential**, with re-plan over conflict heroics.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-07-03 | Butler (v0.4 WS5-E) | Initial agent-team demo walkthrough (§9 WS5 acceptance — "team-mode demo documented"). Worked P8 wave (3 disjoint stories) showing delegate-mode lead, per-teammate scoped packets, plan-approval gate, boundary-guard/test-integrity/quality-gate enforcement, TaskCompleted=quality-gate, clean-room verifier outside the team, contract-first sequential merge. |
