---
name: need-info-protocol
description: <NEED_INFO> — first-class orchestrator message type that replaces subagent hallucination with bounded dehallucination round-trips
version: "1.0"
---

# `<NEED_INFO>` Protocol (§5.4)

> Subagents hallucinate forward when a required input is missing or ambiguous — they guess, invent, or over-scope. ChatDev's *Communicative Dehallucination* pattern replaces the guess with a structured round-trip: emit a question, pause, wait for resolution. This doc specifies coldpress-os's port of that pattern as a first-class orchestrator message type across all eight subagents.

**Claim:** coldpress-os is the only BMAD-family framework with a named, protocol-level hallucination mitigation. Other frameworks rely on per-prompt discipline; we enforce it at the dispatch layer.

**Source decision:** bmad-family-positioning-brief-2026-04-23.md §"ChatDev's Communicative Dehallucination protocol" (Borrow Pattern #1). Scope per 2026-04-23 user directive: all 9 subagents.

---

## The four layers

| Layer | What | Where |
|-------|------|-------|
| **1. Schema** | Zod types for `NeedInfoMessage`, `NeedInfoResolution`, `NeedInfoBudget` | [`schemas/need-info.schema.ts`](../schemas/need-info.schema.ts) |
| **2. Parser** | Extract `<NEED_INFO>…</NEED_INFO>` tags from subagent text | [`src/need-info/parse.ts`](../src/need-info/parse.ts) |
| **3. Routing + budget** | Map uncertainty kind → upstream owner; track retry budget per topic | [`src/need-info/route.ts`](../src/need-info/route.ts) + [`src/need-info/budget.ts`](../src/need-info/budget.ts) |
| **4. Agent convention** | Every subagent's persona includes "When to emit `<NEED_INFO>`" | [`template/.claude/agents/*.md`](../template/.claude/agents/) × 8 |

---

## The message — two surface forms

### Rich form (preferred)

```
<NEED_INFO>
topic: auth-provider-choice
kind: tech-stack-unclear
context_refs:
  - _context/sacred/tech-stack.md
  - _context/sacred/prd.md
question: Which auth provider are we using — Clerk, Auth0, or custom? tech-stack.md is silent.
</NEED_INFO>
```

- **`topic`** — kebab-case slug. Drives retry-budget bookkeeping — reuse the same `topic` for repeat emissions on the same question so the budget counts correctly.
- **`kind`** — one of 10 canonical values (see routing table). Drives dispatch.
- **`context_refs[]`** — repo-relative paths. The orchestrator hands these to the upstream owner as anchors.
- **`question`** — single natural-language sentence. No multi-paragraph explanations; if you need those, they belong in a handoff artefact, not a NEED_INFO.

### Terse form

```
<NEED_INFO>What auth provider are we using?</NEED_INFO>
```

Accepted but routes to `kind: "other"` → **human gate**. Use the rich form unless you genuinely can't classify the uncertainty.

---

## The 10 uncertainty kinds

Full table in `NEED_INFO_ROUTES` ([`src/need-info/route.ts`](../src/need-info/route.ts)). In brief:

| `kind` | Canonical question shape | Routes to |
|--------|--------------------------|-----------|
| `prd-ambiguity` | "Is scope X included?" / "What does 'fast' mean in requirement Y?" | `@pm` |
| `architecture-unclear` | "Which service owns X?" / "Is async OK here?" | `@architect` |
| `tech-stack-unclear` | "Which library for X?" / "Node or Python?" | `@architect` |
| `scope-boundary-unclear` | "In this epic or a follow-up?" | `@pm` |
| `acceptance-criteria-unclear` | "What counts as 'done' for story Y?" | `@pm` |
| `design-intent-unclear` | "Modal or full-page?" / "Which interaction pattern?" | `@ux-designer` |
| `process-step-unclear` | "Which skill for this?" / "Step order?" | **human** |
| `credential-missing` | "What API key for X?" | **human** |
| `handoff-shape-unclear` | "What fields does the PRD→architecture sidecar require?" | **human** |
| `other` | Fallthrough. | **human** |

---

## The retry budget

**Default: 3 round-trips per `topic`.**

Why a budget: without one, two subagents can get stuck in a NEED_INFO ping-pong (A asks, B clarifies but re-asks something of A, A re-emits, …). Bounded budgets force escalation to human when the agents can't converge.

- Every emission on `topic` spends 1.
- Resolution (`resolution: "answered"`) resets the topic's budget to 0.
- Escalation (`resolution: "escalated-to-human"`) closes the topic — downstream work resumes with the human's answer.
- Abandonment (`resolution: "abandoned"`) closes the topic — downstream work pivots away from the questioned path.

Implementation: `NeedInfoBudgetTracker` in [`src/need-info/budget.ts`](../src/need-info/budget.ts). In-memory by default; persist as YAML at `.coldpress/need-info/budgets.yaml` if you want cross-session continuity (orchestrator wiring in Wave 6).

---

## Integration with existing protocols

### Phase-gate protocol (§5.0)

A `<NEED_INFO>` emission that escalates to human creates an implicit pending-human state. If a phase's `gate.json` has a `kind: "human"` acceptance check for the same concern, the NEED_INFO resolution record doubles as the sign-off. Wiring: when a resolution lands for a gate-relevant topic, write the sign-off YAML to `.coldpress/signoffs/<gate_id>/<check_id>.yaml` automatically. (Wave 6 orchestrator integration.)

### Handoff schemas (Wave 2 Block L)

A `handoff-shape-unclear` NEED_INFO with `context_refs` pointing at a specific schema file is the idiomatic way for a downstream subagent to ask "which fields are required?" when they hit a shape mismatch. Route is **human** because the handoff packet is framework-level (Butler's) and escalates.

### Sacred-doc governance (§5.2)

The Phase-6 exit gate rejects an architecture.md missing `approvers[]`. A subagent that would otherwise blunder past the missing field SHOULD emit `<NEED_INFO>` with `kind: architecture-unclear`.

---

## Runtime orchestration

The schema + parser + router + budget ship in this block. **Full orchestrator dispatch wiring** (catching emissions from live subagent outputs, dispatching the resolution back, suspending/resuming the emitter) is Wave 6 Advanced Orchestration territory — it requires the runtime orchestrator shell that Wave 6 delivers.

For now, the protocol is available to:

- **Orchestration-aware skills** that parse subagent output themselves (e.g., `evaluate-phase-gate` can surface emitted NEED_INFOs as pending-human checks).
- **Human consumers of `_context/audit/need-info-log.md`** — if agents log their emissions + resolutions, humans can read the log and resolve manually.
- **Future runtimes** — the schema + parser + router + budget are the stable substrate. Any future orchestrator implementation plugs in here.

---

## What's NOT in this protocol

- **Automatic resolution.** The orchestrator dispatches; it does not answer the question. Resolution is always agent (upstream owner) + human.
- **Nested NEED_INFOs.** A subagent asking a question can't emit a sub-NEED_INFO inside the same emission. Sub-questions are their own emissions on their own topics.
- **Cross-project NEED_INFOs.** Scoped to one project's orchestrator. "Does another project know the answer?" is a human-dispatched question, not a protocol-level one.

---

## Extending

### Adding a new `kind`

See the routing table's "Adding a new kind" recipe. In short: extend the Zod enum, add a routing-table row, update `NEED_INFO_ROUTES`, add an example emission to the relevant subagent's `.claude/agents/<slug>.md`.

### Changing default budget

Edit `DEFAULT_RETRY_BUDGET` in `schemas/need-info.schema.ts` OR construct `NeedInfoBudgetTracker` with `{ defaultLimit: N }` per-session. Changing the default is a framework-level decision — needs a DECISIONS-LOG entry.

### Disabling NEED_INFO for a specific subagent

Don't. The whole point is uniform coverage. If a subagent shouldn't emit NEED_INFO for a specific class of question (e.g., `@devops` doesn't emit `design-intent-unclear` because that's not its domain), scope discipline lives in that subagent's persona, not in the protocol.

---

## See also

- [`phase-gate-protocol.md`](phase-gate-protocol.md) — gate structure; NEED_INFO pending-human states integrate here.
- [`handoff-schema-spec.md`](handoff-schema-spec.md) — where `handoff-shape-unclear` NEED_INFOs land.
- [`subagent-phase-matrix.md`](subagent-phase-matrix.md) — the 8 subagents × their phase ownership; the routing table keys into this.

---

## Orchestration context

> **Hello Butler.** Butler is coldpress-os's main orchestrator agent — your default Claude Code session running with `CLAUDE.md` as its directive. Butler dispatches the 8 Shape A subagents (analyst · architect · pm · ux-designer · developer · verifier · devops · reviewer) and runs the phase gates. The protocol / spec / schema documented above is invoked by Butler (or by a Butler-dispatched subagent) at the relevant phase. See [`butler.md`](butler.md) for the orchestrator reference and the canonical `Hello Butler` entry point.

