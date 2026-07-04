# Butler — the coldpress-os orchestrator

> **Hello Butler** is how you start every coldpress-os session.

---

## What Butler is

**Butler is the framework's main agent** — your default Claude Code session running with `CLAUDE.md` loaded as its directive. Butler is the orchestrator: it routes your intent to the right skill, dispatches subagents (`@analyst`, `@architect`, `@pm`, `@ux-designer`, `@developer`, `@verifier`, `@devops`, `@reviewer`) when their expertise is needed, enforces sacred-doc governance, runs phase exit gates, and emits handoff artefacts between phases.

Butler is not a subagent — Butler is the *main session*. The 8 subagents are dispatched *by* Butler when a phase calls for them.

```
You → Butler (main Claude Code session, CLAUDE.md as directive)
            ├─ @analyst        (Phase 2 — Discovery)
            ├─ @architect      (Phases 3 + 6 — Tech Stack, Architecture)
            ├─ @pm             (Phases 4 + 7 — Planning, Breakdown → coldpress waves)
            ├─ @ux-designer    (Phase 5 — Design)
            ├─ @developer      (Phase 8 — Implementation, plan mode)
            ├─ @verifier       (Phase 8 — clean-room verification; Butler-dispatched only)
            ├─ @devops         (Phases 9 + 10 — Deployment, Operate)
            └─ @reviewer       (Phase 11 — Evolve)
```

> v0.4 roster surgery: `@qa` → `@verifier`; `@scrum-master` (→ `@pm` + `coldpress waves`), `@communicator` (→ forkable creative skills), and `@valet` (→ the framework-internal loop) were removed.

You can rename Butler at Phase 1 intake (`butler.display_name` in `coldpress.yaml` — e.g. `"Jeeves"`, `"Alfred Jr."`). The framework-internal role is always "Butler"; the display name is your private branding.

---

## How you start a session

Open Claude Code in your project directory, then type:

```
Hello Butler
```

Butler responds with one of two patterns depending on the project state:

### First session — "let's begin"

```
You: Hello Butler

Butler: Hi! I'm Butler. I see this is a fresh project — no _context/sacred/ yet.
        Let me run `orient` to set up, then `intake` to capture the seed.

        Quick check before we start:
          - Project name / slug — I can read them from coldpress.yaml
          - Anything to drop in _input/? (existing brief, research notes,
            legacy code, brand references)
          - Cadence preference — silent, summary, or verbose?

        Ready?
```

### Returning session — "where are we"

```
You: Hello Butler

Butler: Welcome back. Reading state…

        Phase: 3 (Tech Stack) — in progress
        Last skill: stack-evaluation (decision 3 of 5: database)
        Partial completion: yes — resume at step-02-rubric, decision_area=database
        Sacred docs: context.md ✓, tech-stack.md (in progress)
        Open question: pack-match scored vibe-coder-fullstack at 0.91 —
          you accepted Next.js + Convex but paused on auth provider

        Want me to resume stack-evaluation where we left off, or pivot?
```

Butler always reads `coldpress.yaml`, `.coldpress/local-config.yaml`, the graph index, and the latest handoff artefact before answering. The "where are we" answer is grounded in actual project state, not inference.

---

## What Butler routes to

Butler's main job is **deciding which skill or subagent handles your request**. Decision trees in [`decision-trees.md`](decision-trees.md) document the routing rules. Most common patterns:

| You say | Butler does |
|---|---|
| `Hello Butler` (first time) | runs `orient` → `intake` |
| `Hello Butler` (returning) | reads state, reports phase + open items |
| `where are we` / `status` | runs `sprint-status` if past Phase 4, else summarises phase state |
| `let's start Phase N` / `move to Phase N` | runs `phase-transition` to evaluate current-phase exit gate, then enters Phase N entry-sync |
| `<phase name> task` (e.g. "create the PRD") | dispatches the owning subagent for that phase + skill |
| `the PRD is wrong, X should be Y` | invokes governance change-workflow (sacred docs require explicit approval) |
| `something broke in prod` | dispatches `@devops incident-response` (Phase 10) |
| `regenerate <interop output>` | runs `coldpress update` |

Butler will ask before dispatching when ambiguous, and will surface the routing decision in its reply ("dispatching @architect because this is a Phase 3 stack question…") in `verbose` cadence; in `summary` cadence it just runs.

---

## Cadence

Set at Phase 1 intake (`user.cadence` in `coldpress.yaml`):

- **`silent`** — Butler dispatches and reports only outputs. Fewest interruptions.
- **`summary`** *(default)* — Butler announces the dispatch + key decisions, omits step-by-step traces.
- **`verbose`** — Butler narrates routing decisions, gate checks, supersede-checks, graph-staleness probes.

Change cadence mid-project: `Butler, switch to verbose cadence`.

---

## When Butler asks `<NEED_INFO>`

If Butler (or any subagent) can't proceed without specific information, it emits a structured `<NEED_INFO>` block instead of guessing. See [`need-info-protocol.md`](need-info-protocol.md). The protocol caps round-trips at 3 per topic to prevent infinite Q&A.

---

## When Butler stops to gate

At every phase exit, Butler runs `phase-transition`:

1. Evaluates the phase's `gate.json` acceptance checks
2. Aggregates pass / fail / pending-human
3. Emits a `_context/handoffs/phase-N-to-phase-{N+1}-{date}.md` handoff artefact
4. Refreshes the knowledge graph
5. Dispatches the next phase's entry skill

You can always inspect the gate result before transitioning: `Butler, show me the Phase 3 gate`.

---

## Customising Butler

- **Display name** — `butler.display_name` in `coldpress.yaml` (Phase 1).
- **Routing overrides** — edit `template/.claude/SYSTEM.md` in your project to add or override routing rules. See [`subagent-customization.md`](subagent-customization.md).
- **Adding a custom subagent** — drop a `.md` file into `.claude/agents/`. Butler picks it up on next reload. Skill catalogue in `data/agents/skill-catalog.csv` documents the convention.

---

## See also

- [`quick-start.md`](quick-start.md) — first-10-minutes hands-on
- [`example-walkthrough.md`](example-walkthrough.md) — TaskPulse full lifecycle demo
- [`decision-trees.md`](decision-trees.md) — Butler's routing rules
- [`subagent-phase-matrix.md`](subagent-phase-matrix.md) — which subagent does what in which phase
- [`need-info-protocol.md`](need-info-protocol.md) — `<NEED_INFO>` protocol
- [`phase-gate-protocol.md`](phase-gate-protocol.md) — how gates work
- [`subagent-customization.md`](subagent-customization.md) — override Butler routing, add custom agents

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-07-04 | Butler (v0.4 post-audit F2) | Public-accuracy pass: the dispatch tree is now the **8** subagents (qa→verifier; scrum-master/communicator/valet removed) with a roster-surgery note; @pm breakdown routes through `coldpress waves`; @verifier documented as Butler-only clean-room dispatch. |
| 1.0 | 2026-05-17 | ColdPress Labs | Initial Butler reference. Codifies the "Hello Butler — let's begin / where are we" canonical entry point. Documents the 11-subagent dispatch tree (post-Shape A), cadence modes, routing patterns, gate behaviour, customisation hooks. Linked from README + every public-facing doc as the orchestrator reference. |
