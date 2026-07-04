---
name: method-catalog-meta
description: Meta-reference for the method catalogs shipped under data/methods/ — Tier-0 convergent universals and how the catalogs interact
phase_authored: 2
status: reference
version: "1.0"
---

# Method Catalog — Meta Reference

coldpress-os ships six method catalogs under [data/methods/](../data/methods/), each the backbone of a specific skill:

| Catalog | Count | Consumer skill | Primary lifecycle role |
|---|---|---|---|
| `elicitation-methods.csv` | 50 | `advanced-elicitation` | Push the LLM to reconsider a shallow / hedged answer |
| `brainstorming-techniques.csv` | 60 | `brainstorming` | Creative ideation, solution exploration |
| `design-thinking-methods.csv` | 31 | `design-thinking` | Human-centred design across 6 D-T phases |
| `innovation-frameworks.csv` | 30 | `innovation-strategy` | Disruption, business models, market analysis |
| `problem-solving-methods.csv` | 30 | `problem-solving` | Root cause, analysis, evaluation, synthesis |
| `story-types.csv` | — | `storytelling` | Narrative framing (Phase 4 + Phase 8 only; not Phase 2) |

Across these catalogs, seven methods appear in **2 or more CSVs**. These are *convergent universals*: multiple methodologies independently arrived at them. They're the framework's safe defaults — not tied to one discipline, applicable across phases.

## Tier-0 convergent universal methods

### 1. Five Whys (Root Cause)

*Iteratively ask "why" to drill from symptom to root cause. Stop when the root is structural / environmental / economic / cultural, not when patience runs out.*

- `elicitation-methods.csv` #40 — as an elicitation trigger when answers feel like symptoms
- `brainstorming-techniques.csv` — under "deep" creative category
- `problem-solving-methods.csv` — under "diagnosis"

**Phase 2 usage:** `validate-idea` Step 1 (problem validation) applies this as a Tier-1 core method. `pre-project-interview` Step 3 biases toward it for shallow constraint answers.

### 2. First Principles Thinking

*Strip assumptions; reason from irreducible primitives. Answers: "what must be true for any solution in this space?"*

- `elicitation-methods.csv` #39 — for deep-dive elicitation
- `brainstorming-techniques.csv` — under "creative"

**Phase 2 usage:** `constraint-research` Step 3 synthesis; `validate-idea` Step 1 problem-validation drill.

### 3. SCAMPER

*Apply seven lenses (Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Reverse) to existing solutions.*

- `elicitation-methods.csv` #25
- `design-thinking-methods.csv` — "SCAMPER Design" in ideate phase
- `problem-solving-methods.csv` — "SCAMPER for Problems" in creative category

**Phase 2 usage:** surfaces when `brainstorming` is invoked for ideation branches.

### 4. Jobs to be Done (JTBD)

*Uncover the functional, emotional, and social "job" users hire a solution to do. Canonical form: "When \[situation\], I want to \[motivation\], so I can \[expected outcome\]."*

- `design-thinking-methods.csv` — under "define" phase
- `innovation-frameworks.csv` — under "disruption"

**Phase 2 usage:** `personas` Step 1 Tier-1 core method (archetype extraction). `validate-idea` Step 4 Tier-1 core method (problem-solution fit).

### 5. Six Thinking Hats

*Parallel-process a decision through six distinct cognitive modes — facts, emotions, caution, optimism, creativity, process — to surface dimensions a single perspective misses.*

- `brainstorming-techniques.csv` — under "structured"
- `problem-solving-methods.csv` — under "creative"

**Phase 2 usage:** `synthesize-research` Step 4 critique — biases toward this when synthesis has surfaced tensions worth inspecting from multiple cognitive stances.

### 6. Failure Mode Analysis

*Systematic enumeration of ways the solution could fail. Produces a risk-ranked list suitable for Phase 5 experiment planning or Phase 6 testing prioritisation.*

- `elicitation-methods.csv` #35
- `problem-solving-methods.csv` — under "analysis"

**Phase 2 usage:** `constraint-research` Step 3 (surface implementation-blocking constraint classes); `validate-idea` Step 2 (riskiest-assumption tagging).

### 7. Assumption Testing / Busting

*Explicitly enumerate the assumptions underlying a claim; test each; surface which are load-bearing.*

- `design-thinking-methods.csv` — under "test" phase
- `problem-solving-methods.csv` — under "creative"
- `elicitation-methods.csv` — implicit across multiple critique methods

**Phase 2 usage:** `validate-idea` Steps 2 + 4 (hypothesis enumeration, problem-solution-fit verification).

---

## Tier structure summary

**Tier 0 — convergent universal** (this document). Appear in 2+ CSVs. Documented once here; referenced by phase-specific deep-dives. Safe defaults across phases.

**Tier 1 — core methods wired into skill workflows**. Mandatory sub-routines inside specific skill step files — e.g., `personas` Step 1 applies User Interviews + Empathy Mapping + JTBD as skill-internal logic, not as "optional" router invocations. Wiring lives inside the step-file instructions.

**Tier 2 — router-invocation bias**. Per-phase YAML maps (`data/methods/phase-N-method-defaults.yaml`) bias initial method selection when a creative router is invoked from a phase-specific sub-skill context. Runtime override still permitted; bias is a starting point, not a cage.

The Phase 2 instance of the Tier-2 playbook lives at [data/methods/method-defaults.yaml](../data/methods/method-defaults.yaml).

Parts 3-9 of the Phase II implementation plan will add `phase_3:`, `phase_4:`, ... sections to the same YAML (or per-phase YAMLs if the file grows unwieldy) as each phase deep-dive completes.

---


---

## Orchestration context

> **Hello Butler.** Butler is coldpress-os's main orchestrator agent — your default Claude Code session running with `CLAUDE.md` as its directive. Butler dispatches the 8 Shape A subagents (analyst · architect · pm · ux-designer · developer · verifier · devops · reviewer) and runs the phase gates. The protocol / spec / schema documented above is invoked by Butler (or by a Butler-dispatched subagent) at the relevant phase. See [`butler.md`](butler.md) for the orchestrator reference and the canonical `Hello Butler` entry point.
### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | ColdPress Labs | Initial meta-reference per Phase II Part 2 Wave 3.10 (FP22 final pass round 3). Documents the 7 Tier-0 convergent universal methods (Five Whys, First Principles, SCAMPER, JTBD, Six Thinking Hats, Failure Mode Analysis, Assumption Testing/Busting). Referenced by Phase 2 step files + the method-defaults.yaml playbook. Pattern extends to later phases as their deep-dives land. |
