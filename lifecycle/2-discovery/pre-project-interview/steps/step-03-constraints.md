---
step_number: 3
step_name: "Constraints & Rules"
step_goal: "Capture technical + non-technical constraints; brownfield path asks about legacy carry-over"
halts_for_input: true
next_step: "step-04-synthesize.md"
---

## Goal

Extract the rules and constraints that downstream phases must honour. Two layers: **technical** (what the code must do) and **non-technical** (budget, time, team, compliance, organisation). Brownfield projects have a third layer: legacy carry-over.

## Instructions

### 0. Read project_shape (same as Step 2)

If `project_shape == brownfield`, the §Legacy carry-over block fires alongside the Technical + Non-technical blocks.

### Technical constraints

1. Required technologies or platforms?
2. Banned technologies or approaches?
3. Performance requirements (speed, scale, latency floors)?
4. Accessibility requirements (WCAG level)?
5. Data handling rules (privacy, retention, residency)?

### Non-technical constraints (5-question checklist — FP12)

The deep-dive enriched Step 3 with a systematic non-technical checklist. Don't skim these — all five questions fire:

1. **Budget range** — *"What's the budget ceiling for v1? (rough bracket — $5k / $50k / $500k / not capped?)"*
2. **Time horizon** — *"When does v1 need to ship? (by month; if no hard deadline, what's the decision cost of slipping 3 months?)"*
3. **Team size + skills** — *"How many builders, what skills? Solo / team of 3 / team of 15? Front-end heavy / back-end heavy / full-stack / cross-functional?"*
4. **Compliance obligations** — *"Any regulatory or industry-specific compliance requirements? (HIPAA / GDPR / SOC2 / PCI-DSS / FedRAMP / industry-specific?)"*
5. **Organisational constraints** — *"Any organisational rules that shape build choices? (approved vendor list / security review gates / existing platform commitments / procurement cycles?)"*

### Brownfield path — Legacy carry-over (fires when `project_shape == brownfield`)

When `_input/legacy/` contains prior code:

1. *"Looking at the legacy code: what are the hard carry-over constraints — data migrations, API contracts, deprecated dependencies?"*
2. *"What's the hotfix escape-hatch policy for the legacy system? (keep live until v2 ships, deprecate at v2 launch, sunset on a schedule?)"*
3. *"Is there anything in the legacy we're explicitly NOT bringing forward? (design debt, failed experiments, deprecated features)"*

The `repo-structure-audit` skill ([ops/repo-structure-audit](../../../skills/ops/repo-structure-audit/)) wires in here for deeper legacy scan (Wave 3.7 — may not be wired yet; invoke manually if `_input/legacy/` contains code).

### Supersede-check for `_input/` constraint conflicts (Wave 4.4)

After gathering constraints, check the graph for pre-loaded `_input/reference/` or `_input/raw/` docs that state constraints. If any user-stated constraint (budget, timeline, team, compliance) **contradicts** a constraint expressed in a pre-loaded document:

Present:
> *"Your brief in `_input/{source-file}` stated {old constraint}. You've described {new constraint} here. Want me to mark that document's constraint section as superseded by what we've captured now?"*

Butler calls `promptSupersede` with:
- `inputPath`: path to the conflicting `_input/` file
- `sacredDocPath`: `_context/sacred/context.md`
- `decisionContext`: `"pre-project-interview Step 3 — constraint conflict: {summary of conflict}"`

Only fire this when there is a genuine conflict (old doc says X, user says not-X). Additions (constraint not previously mentioned) are not conflicts.

### Business rules + implementation patterns

1. Critical business logic that must be correct?
2. Preferred coding patterns / conventions?
3. Existing design system or component library?
4. Testing expectations (unit / integration / E2E / property-based)?

### Non-obvious rules

The most important block — push for specifics:

- *"What's something an AI agent might get wrong about this project?"*
- *"What's the most important thing to NOT mess up?"*
- *"Any past mistakes or gotchas to avoid?"*

Non-obvious rules prevent downstream implementation mistakes. If the user says *"nothing obvious"*, probe with concrete examples: *"Does the business distinguish between 'customer' and 'user' in a non-obvious way?"* / *"Any data that looks PII but isn't, or vice versa?"*

## User Interaction

Push for specifics. If the user hand-waves a constraint (e.g., *"it should be fast"*), ask for numbers (*"under 300ms for the common path? under 2s? under 10s?"*). Numbers are load-bearing for Phase 3 stack decisions.

**Advanced-elicitation bias (per method-defaults.yaml):** if constraints come back thin / generic, Butler may invoke advanced-elicitation biased toward **#39 First Principles** and **#35 Failure Mode Analysis** (strip assumptions; surface hidden constraint classes).

## Output

Constraints section populated across technical + non-technical + (if brownfield) legacy carry-over. `step_3_complete: true`

## Navigation

→ Proceed to [step-04-synthesize.md](step-04-synthesize.md)
