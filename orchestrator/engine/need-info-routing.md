---
name: need-info-routing
description: Routing table mapping <NEED_INFO> uncertainty kinds to their upstream owners
version: "1.0"
---

# `<NEED_INFO>` Routing Table

> When any of the 9 subagents emits `<NEED_INFO>{question}</NEED_INFO>`, the orchestrator consults this table to find the likely upstream owner (the subagent holding the sacred doc / decision record that would resolve the question). If no sensible upstream owner exists, the question escalates to the human gate.

**Source decision:** [framework-audit-2026-04-23.md §5.4](../../../../lab-hq-projects/hq-p001-coldpress-os/docs/framework-audit-2026-04-23.md) + [bmad-family-positioning-brief-2026-04-23.md §"ChatDev's Communicative Dehallucination protocol"](../../../../lab-hq-projects/hq-p001-coldpress-os/docs/bmad-family-positioning-brief-2026-04-23.md).

**Kept in lockstep with:** [`src/need-info/route.ts`](../../src/need-info/route.ts) `NEED_INFO_ROUTES`. When you change one, change the other — a test (`test/need-info.test.ts`) enforces coverage.

---

## The 10 routes

| `kind` | Route to | Why |
|--------|----------|-----|
| `prd-ambiguity` | `@pm` | The PM owns the PRD (`_context/sacred/prd.md`). Ambiguity about scope, requirements, or user value lands here first. |
| `architecture-unclear` | `@architect` | The architect owns `_context/sacred/architecture.md`. Component boundaries, non-functional requirements, integration patterns. |
| `tech-stack-unclear` | `@architect` | Same custodian as architecture; `_context/sacred/tech-stack.md` is the decision record. |
| `scope-boundary-unclear` | `@pm` | "Is X in scope?" / "Does this belong in Phase 5 or a follow-up?" routes to the PM who sets scope. |
| `acceptance-criteria-unclear` | `@scrum-master` | Acceptance criteria are in stories (`_context/planning/epics-stories/…`); the scrum master authors and owns them. |
| `design-intent-unclear` | `@ux-designer` | UX spec owner (`_context/design/…`). Visual intent, interaction patterns, flow decisions. |
| `process-step-unclear` | `@valet` | Meta question: "what's the right skill / step to use here?" Valet owns framework self-explanation + skill discovery. |
| `credential-missing` | `human` | Credentials never live in the framework; only the human can provide. Routes straight to human gate, no intermediate agent. |
| `handoff-shape-unclear` | `@valet` | Typed-handoff schemas are framework-level (`schemas/handoffs/`); valet owns framework artefacts. |
| `other` | `human` | The fall-through. Routing ambiguity itself is escalated — the orchestrator doesn't guess. |

---

## The retry budget

Default: **3 round-trips per `topic`**. Exhaustion ALWAYS escalates to human, regardless of `kind`.

- `topic` is a stable kebab-case slug (derived from the question or set explicitly via the rich-form `topic:` field).
- The `NeedInfoBudgetTracker` class (`src/need-info/budget.ts`) tracks spend per topic.
- Reset on resolution: when the upstream owner answers, the topic's budget clears. A subsequent emission on the same topic starts fresh.

---

## How subagents invoke this

Each of the 9 subagent definitions (`template/.claude/agents/<slug>.md`) carries a section: "When to emit `<NEED_INFO>`". The template prescribes:

1. **Detect the ambiguity** — a required input is missing, ambiguous, or conflicts with a prior artefact.
2. **Pause your work.** Do not continue with a guess.
3. **Emit the tag.** Prefer the rich form:

   ```
   <NEED_INFO>
   topic: <kebab-case-slug>
   kind: <one-of-the-10-enum-values>
   context_refs:
     - <repo-relative-path-to-the-artefact>
   question: <one-sentence-natural-language-question>
   </NEED_INFO>
   ```

   Terse form (just the question) is accepted but routes to `"other"` → human.
4. **Wait for resolution.** A `NeedInfoResolution` will land with `resolved = "answered" | "escalated-to-human" | "abandoned"`.

---

## Changing routes

Changing a route means updating BOTH:
1. The row in this table.
2. The corresponding entry in `src/need-info/route.ts` `NEED_INFO_ROUTES`.

Update both in a single commit; the test suite's routing coverage check will fail otherwise.

Adding a new `kind`:
1. Extend `NeedInfoKindEnum` in `schemas/need-info.schema.ts`.
2. Add a row to this table.
3. Add a row to `NEED_INFO_ROUTES`.
4. Add an example emission to the relevant subagent's `.claude/agents/<slug>.md` "When to emit" section.

---

## See also

- [`docs/need-info-protocol.md`](../../docs/need-info-protocol.md) — full protocol write-up (rationale, surface, extension).
- [`schemas/need-info.schema.ts`](../../schemas/need-info.schema.ts) — Zod message types.
- [`src/need-info/`](../../src/need-info/) — parser + budget + routing runtime.
- [`gate-protocol.md`](./gate-protocol.md) — sibling protocol (phase transitions), historical spec retained for reference; `docs/phase-gate-protocol.md` is the v1+ authoritative replacement.
