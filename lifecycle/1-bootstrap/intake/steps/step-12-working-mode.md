---
step_number: 12
step_name: "Working mode"
step_goal: "Four quick questions on how the user wants to work; write back to coldpress.yaml"
halts_for_input: true
next_step: "step-13-gate-and-route.md"
---

## Goal

Dial in Butler's defaults to match how the user actually works. Four questions, each answerable in under ten seconds, each tied to a concrete downstream behaviour.

## Instructions

### 1. Mark partial completion

```ts
await markStepStart(projectRoot, "intake/step-12-working-mode");
```

### 2. Ask the four questions

#### Q1 — Preferred IDEs

> Which IDEs do you use? (interop files will be generated for these)
> [c] Claude Code only   [u] + Cursor   [r] + Roo   [o] + OpenHands   [l] + Cline   [a] All
> Default: whatever `--interop` flag was passed to `coldpress init` (stored already).

Confirm the existing `user.preferred_ides` value; allow the user to edit.

#### Q2 — Cadence

> How chatty should I be?
> [1] silent — just results
> [2] summary — one-line what-I-did-and-why (default)
> [3] verbose — show reasoning, trade-offs, open questions

Writes `user.cadence: silent | summary | verbose`.

#### Q3 — Team shape

> Who's building this with you?
> [1] solo — just me
> [2] team — I'm part of a dev team
> [3] client-project — I'm building this for a client

Writes `user.team_shape: solo | team | client-project`. Phase 2 Discovery uses this to shape the stakeholder mapping prompts.

#### Q4 — Butler's name

> What should I go by? (default: `{butler.display_name}`, usually "Butler")

If the user answers with a non-empty string different from the current value, update `butler.display_name` in `coldpress.yaml`. The framework-internal role is always "Butler" — this is only the user-facing label. Next session, CLAUDE.md prose picks up the new name.

### 3. Write back to `coldpress.yaml`

Merge — preserve all other fields. Use yaml write-back semantics documented in `docs/coldpress-yaml-schema.md §Write-back contract`.

### 4. Append to the intake report

```markdown
## Working mode

- preferred_ides: [...]
- cadence: summary
- team_shape: solo
- butler.display_name: Butler  (renamed? yes|no)
```

### 5. Clean exit

```ts
await clearStepMarker(projectRoot);
```

## Halts for Input

Yes — four prompts. The user can accept defaults by pressing Enter on each.

## Navigation

→ `step-13-gate-and-route.md`

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Original `intake` Step 4. |
| 2.0 | 2026-07-02 | Butler | Renumbered to Step 12 (WS5-B, §8 item 6 — now runs after context.md authoring rather than before it). |
