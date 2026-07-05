---
name: pattern-7-agent-personas
description: Cross-cutting spec for Pattern 7 — Agent Persona Transition. Defines the canonical transition shape, when to record, and how phase-transition emits transition records. Phase 5 first sustainably invokes this pattern (@pm → @ux-designer at entry, @ux-designer → @pm at reconciliation, @pm → @architect at Phase 6 entry).
version: "1.0"
---

# Pattern 7 — Agent Persona Transition

> Cross-cutting spec for typed agent transitions across phase boundaries. **Phase 5 is the first sustained invocation.** Every phase-boundary handoff from Phase 5 forward records a Pattern 7 transition.

---

## Why this pattern

Pre-Shape A, the framework had implicit agent transitions: a single phase might pull in multiple agents (e.g., Phase 4 Planning bundled @pm, @ux-designer, @architect). With Shape A's split into Phase 4 (PRD only, @pm) → Phase 5 (Design, @ux-designer) → Phase 6 (Architecture, @architect), each phase owns a primary agent and the transition between them becomes a first-class concern.

Pattern 7 makes these transitions:
- **Auditable** — every transition logged with rationale + warm-handoff reference
- **Typed** — schema'd transition record format
- **Recoverable** — the warm_handoff path lets the to-agent pick up context cold

---

## Canonical transition shape

```yaml
transition:
  trigger: enum
    # phase_entry         — agent takes over at phase start
    # phase_exit          — agent hands off at phase end (typically to phase-transition before to-agent picks up at next phase entry)
    # sub_phase_boundary  — internal to a phase; e.g., conditional dispatch (Phase 4 brownfield @architect, then back to @pm)
    # reconciliation_handoff — Phase 5 mechanism (@ux-designer → @pm for PRD amendment, then back)
  from_agent: <slug>           # e.g., 'pm', 'ux-designer', 'architect'
  to_agent: <slug>
  rationale: string            # 1 sentence — why this transition
  warm_handoff: string|null    # path to phase-N-to-(N+1)-{date}.md (null for sub_phase_boundary internal)
  deferred_inputs: list        # things from-agent flagged for to-agent's awareness
  resumes_to: <slug>|null      # for hand-back transitions; null otherwise
  recorded_at: ISO-8601
```

### Field semantics

- **trigger** — the event that caused this transition. `phase_entry` is one-shot (logged once at to-phase entry). `reconciliation_handoff` is paired (out + back).
- **from_agent / to_agent** — slug references to subagent definitions in `template/.claude/agents/`.
- **rationale** — why the transition is happening. Keep to one sentence; longer context goes in the warm_handoff.
- **warm_handoff** — path to the durable handoff log. For phase-boundary transitions this is the canonical `phase-{from}-to-{to}-{date}.md`. For internal transitions (sub_phase_boundary, reconciliation_handoff in-flight) this can be null — context is in-session.
- **deferred_inputs** — open questions, partial work, cross-cutting concerns the from-agent flagged for the to-agent's awareness.
- **resumes_to** — for hand-back transitions, names the agent the from-agent expects work back from.

---

## Where transitions are recorded

### Buffer file (collection during the phase)

Each phase's transitions accumulate in a session-local **buffer file**:

```
_context/handoffs/pattern-7-transitions-wip-{date}.yaml
```

The buffer is a flat YAML list. Each transition append is a single block. The file is created by the FIRST transition emitter at phase entry (typically `phase-transition/steps/step-03-handoff-log.md` for the entry transition, or the entry-sync skill's Step 0 if it dispatches first); subsequent emitters append.

**Buffer file shape:**

```yaml
# _context/handoffs/pattern-7-transitions-wip-{date}.yaml
phase: <integer>
created_at: <ISO-8601>
transitions:
  - trigger: phase_entry
    from_agent: phase-transition
    to_agent: ux-designer
    rationale: "Phase 5 Design is @ux-designer's domain..."
    warm_handoff: "_context/handoffs/phase-4-to-5-{date}.md"
    deferred_inputs: []
    resumes_to: null
    recorded_at: <ISO>
  - trigger: reconciliation_handoff
    from_agent: ux-designer
    to_agent: pm
    ...
```

### Emitter convention (skill responsibilities)

Any skill that performs an agent transition appends a transition record to the buffer immediately at the transition point. The convention:

1. Read the buffer (or initialise if missing).
2. Append the transition block with all required fields (`trigger`, `from_agent`, `to_agent`, `rationale`, `recorded_at`).
3. Write back atomically.

Skills that emit:
- **`phase-transition` step-03-handoff-log** — writes the `phase_entry` transition into the next phase's buffer (cross-buffer write — uses the to-phase's date stamp).
- **`phase-transition` step-02a-reconciliation** — writes the `reconciliation_handoff` pair (out + back) for Phase 5/7/8/10 reconciliation passes.
- **Sub-persona dispatchers** (e.g., Phase 8 code-review that hands @developer → @verifier → back) — write the `sub_phase_boundary` pair around the dispatch.
- **Recurring sub-flows** (Phase 8 code-review per story) — write the `sub_phase_boundary` pair per story; these accumulate as multiple `#11c/#11d` entries in the buffer.

### Flush at phase exit

At Phase N exit, `phase-transition/steps/step-03-handoff-log.md` reads the buffer file and copies all transition records into the handoff log markdown under the `## Agent transitions (Pattern 7)` section. The buffer is then archived alongside the handoff log (renamed `pattern-7-transitions-{date}-archived.yaml`) — not deleted, for audit-trail integrity.

If the buffer is missing or empty when phase-transition runs:
- For Phase 1-4 (pre-Pattern-7-sustained): empty buffer is OK; skip section.
- For Phase 5+: empty buffer is a warn — at minimum the phase_entry transition should have been recorded. Surface to user and proceed.

---

## Phase 5 transitions — first invocation

Phase 5 is the first phase to sustainably invoke Pattern 7. Four transitions per Phase 5 run:

### Transition #1 — Phase 4 → Phase 5 entry

```yaml
transition:
  trigger: phase_entry
  from_agent: pm
  to_agent: ux-designer
  rationale: "Phase 5 Design is @ux-designer's domain; @pm has locked PRD at Phase 4 exit."
  warm_handoff: "_context/handoffs/phase-4-to-5-{date}.md"
  deferred_inputs: []
  recorded_at: <ISO>
```

### Transition #2 — reconciliation handoff (out)

```yaml
transition:
  trigger: reconciliation_handoff
  from_agent: ux-designer
  to_agent: pm
  rationale: "PRD amendment is @pm's domain (PRD is Phase 4 sacred); design-deltas package handed back for reconciliation."
  warm_handoff: null
  resumes_to: phase-transition
  recorded_at: <ISO>
```

### Transition #3 — reconciliation handoff (back)

```yaml
transition:
  trigger: reconciliation_handoff
  from_agent: pm
  to_agent: phase-transition
  rationale: "Reconciliation complete; releasing control to phase-transition for handoff log emission."
  warm_handoff: null
  recorded_at: <ISO>
```

### Transition #4 — Phase 5 → Phase 6 entry

```yaml
transition:
  trigger: phase_entry
  from_agent: phase-transition
  to_agent: architect
  rationale: "Phase 6 Architecture is @architect's domain; reads PRD v{latest} + UX spec + brand-guidelines + tech-stack."
  warm_handoff: "_context/handoffs/phase-5-to-6-{date}.md"
  deferred_inputs: <list of architecture_adrs_required from handoff>
  recorded_at: <ISO>
```

From the gate.json perspective: Phase 5 entry is one logged transition (#1) and Phase 5 exit is one logged transition (#4). The reconciliation pair (#2 + #3) is internal hygiene — visible in the handoff log but not part of gate evaluation.

---

## No Phase-5-internal sub-personas at v0.3

Considered: @brand-specialist for brand-guidelines authorship; @prototype-engineer for prototype skeleton. **Decision (decisions log #15): NO at v0.3.** @ux-designer owns full Phase 5. Reasons:
- framework simplicity (fewer agents = simpler dispatch logic)
- coherence (brand voice should flow into UX flows naturally, not be a separate persona's output)
- deferred to v0.4+ if real-project feedback shows @ux-designer is overloaded

If/when sub-personas are added, they'd appear as `sub_phase_boundary` transitions inside Phase 5 (e.g., @ux-designer → @brand-specialist → back).

---

## Phase 6 transitions — second sustained invocation

Phase 6 has 3 Pattern 7 transitions per run (no internal reconciliation handoff at v0.3 since Phase 6 architecture-deltas-back-to-PRD is forward-carry):

### Transition #5 — Phase 5 → Phase 6 entry

```yaml
transition:
  trigger: phase_entry
  from_agent: phase-transition
  to_agent: architect
  rationale: "Phase 6 Architecture is @architect's domain; reads PRD v{latest} + UX spec + brand-guidelines + tech-stack."
  warm_handoff: "_context/handoffs/phase-5-to-6-{date}.md"
  deferred_inputs: <list of architecture_adrs_required from handoff — silent-divergence guard targets>
  recorded_at: <ISO>
```

### Transition #6 — Phase 6 exit (in-flight)

```yaml
transition:
  trigger: phase_exit
  from_agent: architect
  to_agent: phase-transition
  rationale: "Architecture authored, ADRs complete (incl. flagged-delta ADRs), handoff write triggered."
  warm_handoff: null
  recorded_at: <ISO>
```

### Transition #7 — Phase 6 → Phase 7 entry

```yaml
transition:
  trigger: phase_entry
  from_agent: phase-transition
  to_agent: pm
  rationale: "Phase 7 Breakdown is @pm's domain; reads architecture.md + PRD + UX-spec + ADRs."
  warm_handoff: "_context/handoffs/phase-6-to-7-{date}.md"
  recorded_at: <ISO>
```

### When architecture-deltas mechanism lands (forward-carry)

If Phase 6 architecture-deltas reconciliation pass is implemented (mirror of Phase 5's design-deltas), add internal `reconciliation_handoff` transitions @architect → @pm → phase-transition mirroring Phase 5's #2 + #3. Treat as forward-carry per decisions log #22.

---

## Phase 7 transitions — third sustained invocation

Phase 7 has 3 Pattern 7 transitions per run (all phase-boundary). Wave planning — formerly a @scrum-master sub-persona dispatch — is now @pm-native via `coldpress waves`, so there is no internal sub_phase_boundary pair.

### Transition #8 — Phase 6 → Phase 7 entry

```yaml
transition:
  trigger: phase_entry
  from_agent: phase-transition
  to_agent: pm
  rationale: "Phase 7 Breakdown is @pm's domain"
  warm_handoff: "_context/handoffs/phase-6-to-7-{date}.md"
  recorded_at: <ISO>
```

### Wave planning — no sub-persona dispatch

Breakdown wave planning is @pm-native, driven by `coldpress waves`; it no longer dispatches a separate coldpress waves persona. The former #8a/#8b `sub_phase_boundary` pair (@pm → @scrum-master → back) is retired — @pm owns the whole of Phase 7.

### Transition #9 — Phase 7 exit (in-flight)

```yaml
transition:
  trigger: phase_exit
  from_agent: pm
  to_agent: phase-transition
  rationale: "Breakdown complete; handoff write triggered"
  recorded_at: <ISO>
```

### Transition #10 — Phase 7 → Phase 8 entry

```yaml
transition:
  trigger: phase_entry
  from_agent: phase-transition
  to_agent: developer
  rationale: "Phase 8 Implementation is @developer's domain"
  warm_handoff: "_context/handoffs/phase-7-to-8-{date}.md"
  recorded_at: <ISO>
```

---

## Phase 8+ transitions (preview)

Phase 8 (Implementation) deep-dive will spec its own Pattern 7 transitions. Predicted shape:

- Phase 7 → Phase 8: `phase_entry` (already covered as Transition #10)
- Phase 8 → Phase 9 (Deployment): `phase_entry`, @developer → @devops
- Optional: Phase 8 internal sub-transitions (e.g., @developer dispatches @verifier for code-review sub-flow — would be `sub_phase_boundary`)

Each subsequent phase deep-dive references this doc and appends its own transitions section.

---

## Implementation notes

- **Skill files** that perform transitions write the YAML record to a session-local buffer.
- **`phase-transition` step-03-handoff-log.md** flushes the buffer to the handoff log under `## Agent transitions (Pattern 7)`.
- **No central orchestrator** — each phase + each skill knows its own transitions. The pattern is enforced by code-review + prompt-pattern documentation in `docs/prompt-patterns.md`.

---

## Authoring guide — adding emission to a skill

Use this checklist when retrofitting a skill or authoring a new sub-persona dispatch.

### Step 1: identify the transition class

| Skill kind | Transition trigger | Where to emit |
|---|---|---|
| Phase entry-sync skill (e.g., `breakdown-entry-sync`) | none — `phase_entry` is emitted by `phase-transition` step-03 in the prior phase | n/a |
| Sub-persona dispatch skill (e.g., `coldpress waves`, `code-review`, `test-framework`) | `sub_phase_boundary` (out + back) | first step (entry record) + last step (return record) |
| Reconciliation pass (`phase-transition/steps/step-02a-reconciliation.md`) | `reconciliation_handoff` (out + back) | already wired |
| Phase-final emit skill (e.g., `architecture-design` last step) | none — `phase_exit` is emitted by `phase-transition` step-03 | n/a |

### Step 2: the canonical emission block

Copy this block into the relevant step file, under a `## Pattern 7 transition (...)` section:

```markdown
## Pattern 7 transition ({trigger-class})

{One sentence describing the transition — who hands to whom, why.}

Append to `_context/handoffs/pattern-7-transitions-wip-{date}.yaml`:

\`\`\`yaml
- trigger: {phase_entry|phase_exit|sub_phase_boundary|reconciliation_handoff}
  from_agent: {slug}
  to_agent: {slug}
  rationale: "{one sentence}"
  warm_handoff: {path to handoff-log.md, or null for in-session}
  resumes_to: {slug or null}
  recorded_at: <ISO>
\`\`\`

If buffer file doesn't exist yet, create it with `phase: <N>` + `created_at: <ISO>` + empty `transitions: []` then append.
```

### Step 3: pair the emission

For `sub_phase_boundary` and `reconciliation_handoff`, ALWAYS pair the out-record with the back-record. If the back-record is omitted, downstream audit shows an unbalanced transition (warn-level).

### Step 4: don't double-emit

`phase_entry` and `phase_exit` transitions are written by `phase-transition` step-03, NOT by skill files. If a skill is also Phase N's first or last skill, do NOT add a phase_entry/phase_exit emission inside it — that would double-count.

### Sentinel reference

`skills/reviews/a11y-audit/` is the canonical reference for sub_phase_boundary emission:
- step-01 emits the out-record at entry
- the final step emits the back-record at successful completion

Other Phase 7-11 skills with sub-persona dispatch follow the same shape:
- `lifecycle/8-implementation/test-framework/` — pair `#11a + #11b` (one-time setup)
- `lifecycle/8-implementation/code-review/` — pair `#11c + #11d` (RECURRING per story; emit one pair per code-review run, not one pair total)

### Retrofit status (as of 2026-05-03)

Mechanism wired in audit-fix #22a. Per-skill emission retrofit is incremental — done when each skill is next touched. Audit-trail completeness will improve as retrofit lands.

| Skill | Transitions | Retrofitted |
|---|---|---|
| `phase-transition/steps/step-02a-reconciliation.md` | #2/#3, #6/#7, #9/#10, #12/#13, #15, #17 (multi-phase) | ✅ (audit-fix #22a) |
| `lifecycle/7-breakdown/coldpress waves/` | #8a/#8b | ✅ (sentinel — wake #36) |
| `skills/reviews/a11y-audit/` (Phase 5 invocation) | **#4.5a/#4.5b** — @ux-designer ↔ @verifier sub-persona dispatch (one pair per Phase 5 run; emitted by a11y-audit step-01 entry + step-N return) | ⏳ pending — convention documented; per-step emission deferred |
| `skills/reviews/a11y-audit/` (Phase 8 invocation) | rides existing #11c/#11d code-review pair (no new transitions) | ✅ (no new emission needed) |
| `lifecycle/8-implementation/test-framework/` | #11a/#11b | ⏳ pending |
| `lifecycle/8-implementation/code-review/` | #11c/#11d (recurring) | ⏳ pending |
| `lifecycle/9-deployment/readiness-check/` (entry + exit transitions to phase-transition) | #14, #15 | ⏳ pending — investigate whether phase-transition handles or whether skill emits |
| (others — phase_entry / phase_exit) | handled by `phase-transition` step-03 | ✅ (audit-fix #22a) |

**Note on a11y-audit Phase 5 transitions (#4.5a/#4.5b):** these are NEW sub-persona transitions introduced by Unit #28 / U07. The numbering convention `#4.5a/b` slots between the existing Phase 5 transitions (#1-4) and Phase 6 transitions (#5+). The pair fires when Phase 5 design-time a11y-audit dispatches: @ux-designer (running brand-guidelines / ux-design) → @verifier (a11y-audit execution) → @ux-designer (resume). Emit at a11y-audit step-01 (entry) + final step (return). Mirrors the @developer ↔ @verifier pattern at code-review (#11c/#11d) — same shape, different agents.

---

## See also

- [`skills/governance/phase-transition/steps/step-02a-reconciliation.md`](../../skills/governance/phase-transition/steps/step-02a-reconciliation.md) — Phase 5 reconciliation pass; logs transitions #2 + #3
- [`skills/governance/phase-transition/steps/step-03-handoff-log.md`](../../skills/governance/phase-transition/steps/step-03-handoff-log.md) — handoff log format includes `## Agent transitions (Pattern 7)` section
- [`docs/prompt-patterns.md`](../prompt-patterns.md) — Pattern 7 entry (skill-authoring convention companion)
- [`template/.claude/agents/`](../../template/.claude/agents/) — subagent definitions (slugs referenced by from_agent / to_agent)

---

## Phase 8 transitions — fourth sustained invocation

Phase 8 has 7 Pattern 7 transitions per run (most so far — recurring code-review sub-transitions per story; one #11c/#11d pair per story).

| # | Trigger | From | To | Notes |
|---|---------|------|-----|-------|
| 11 | phase_entry | phase-transition | @developer | warm_handoff: phase-7-to-8 |
| 11a | sub_phase_boundary | @developer | @verifier | one-time test-framework setup |
| 11b | sub_phase_boundary | @verifier | @developer | back to wave loop |
| 11c | sub_phase_boundary | @developer | @verifier | code-review (RECURRING per story) |
| 11d | sub_phase_boundary | @verifier | @developer | back after code-review pass |
| 12 | phase_exit | @developer | phase-transition | all waves complete |
| 13 | phase_entry (Phase 9) | phase-transition | @devops | warm_handoff: phase-8-to-9 |

---

## Phase 9 transitions — fifth sustained invocation

Phase 9 has 3 Pattern 7 transitions per run.

| # | Trigger | From | To | Notes |
|---|---------|------|-----|-------|
| 14 | phase_entry | phase-transition | @devops | warm_handoff: phase-8-to-9 |
| 15 | phase_exit | @devops | phase-transition | post-deploy gate passed |
| 16 | phase_entry (Phase 10) | phase-transition | @devops | continues — same agent across boundary |

---

## Phase 10 transitions — sixth sustained invocation

Phase 10 has 3 Pattern 7 transitions per run.

| # | Trigger | From | To | Notes |
|---|---------|------|-----|-------|
| 16 | phase_entry | phase-transition | @devops | continued from Phase 9 #16; same agent, no actual change |
| 17 | phase_exit | @devops | phase-transition | user-invoked at Phase 11 retrospective trigger |
| 18 | phase_entry (Phase 11) | phase-transition | @reviewer | warm_handoff: phase-10-to-11 (with ops_deltas[]) |

---

## Phase 11 transitions — seventh + FINAL sustained invocation

Phase 11 has 2 Pattern 7 transitions per run. **No #20 in current iteration** — Phase 11 is final.

| # | Trigger | From | To | Notes |
|---|---------|------|-----|-------|
| 18 | phase_entry | phase-transition | @reviewer | warm_handoff: phase-10-to-11 (with ops_deltas[]) |
| 19 | phase_exit (FINAL) | @reviewer | phase-transition | closure log emit; copies outputs to `_input/prior-iteration/` for NEXT iteration's Phase 1 entry |

### Inter-iteration cycle

Phase 11 closure mechanism is unique: outputs (retrospective + product-evolution-backlog + innovation-strategy) are copied to `_input/prior-iteration/` for NEXT iteration's Phase 1 entry. NOT a phase-handoff log — it's an inter-iteration input package. NEXT iteration's Phase 1 `intake` skill detects `_input/prior-iteration/` and reads it (brownfield-style branching). New iteration's Pattern 7 count starts fresh from #1.

---

### Pattern 7 — full lifecycle summary

7 sustained invocations across the canonical 11-phase lifecycle:

| Invocation | Phase | Owner | Transitions |
|---|---|---|---|
| 1st | Phase 5 Design | @ux-designer | #1 entry / #2-3 reconciliation handoff / #4 to architect |
| 2nd | Phase 6 Architecture | @architect | #5 entry / #6 exit / #7 to pm |
| 3rd | Phase 7 Breakdown | @pm | #8 entry / #9 exit / #10 to developer |
| 4th | Phase 8 Implementation | @developer + @verifier sub | #11 entry / #11a-d recurring sub-flows / #12 exit / #13 to devops |
| 5th | Phase 9 Deployment | @devops | #14 entry / #15 exit / #16 to devops (continues) |
| 6th | Phase 10 Operate | @devops (continued) | #16 / #17 exit / #18 to reviewer |
| 7th + FINAL | Phase 11 Evolve | @reviewer | #18 entry / #19 exit FINAL |

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-05-02 | Butler (autonomous queue unit #12 Wave 8.5) | Phase 8 transitions section added — 7 transitions per run; recurring #11c/#11d sub-transitions per story for code-review. Phase 9+ preview updated. |
| 1.0 | 2026-04-30 | Butler (autonomous queue unit #3 Wave 5.8c) | Initial Pattern 7 spec doc per Phase 5 deep-dive §10b. Canonical transition shape (8 fields). Phase 5 four-transition specification (entry / reconciliation pair / Phase 6 entry). v0.3 no-sub-personas decision documented. Phase 6+ preview. Implementation-notes section explains decentralised pattern (no central orchestrator). |
