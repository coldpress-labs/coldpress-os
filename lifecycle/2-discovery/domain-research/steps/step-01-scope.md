---
step_number: 1
step_name: "Scope Research"
step_goal: "Define research topic; check graph first for pre-loaded material + brownfield legacy"
halts_for_input: true
next_step: "step-02-research.md"
---

## Goal

Understand what to research and why. **Graph-first, web-second** — before planning web search, check what the user pre-loaded in Phase 1 intake. If brownfield, also mine `_input/legacy/` for domain signal from prior attempts.

## Instructions

### 1. Ask scope

*"What domain, industry, or sector do you want to research?"*

Clarify: core domain, specific aspects of interest, research goals. Define depth (overview / moderate / exhaustive).

### 2. Graph-first query (Wave 3.4)

Before scoping the web-research plan, check `.coldpress/graph/graph.json` for material already indexed from Phase 1 intake:

```
coldpress graph query --dir-role _input/reference/ --topic "{research-topic}"
coldpress graph query --dir-role _input/vendor/ --topic "{research-topic}"
```

Two outcomes:

**Graph hits exist** — synthesise from graph content first. Confirm coverage with user:
> You've pre-loaded {N} sources on {topic}. I'll start there and supplement with web research only for gaps. Sound right?

**No graph hits** — proceed with standard web-search flow. Note in output that material is original (no user-loaded references to reinforce findings).

### 3. Brownfield — consult `_input/legacy/` (Wave 3.5)

Read `project_shape` from `.coldpress/local-config.yaml`. If `brownfield`:

> You have prior code in `_input/legacy/`. Let me check what domain knowledge is already embedded in the prior attempt — data models, terminology, user flows, deprecated assumptions — so the research builds on that rather than starting from zero.

Scan `_input/legacy/` for:
- **Terminology** — domain-specific vocabulary baked into types / variable names / route names
- **Data models** — the prior schema reveals how the domain was carved up
- **Deprecated assumptions** — comments, dead code, decisions explicitly reversed — these tell us what *didn't* work

Log legacy-derived domain signals separately from web / graph findings in the output doc (provenance matters).

### 4. Supersede-check for conflicting reference material (Wave 4.4)

After scoping, if the graph-first query returned `_input/reference/` hits whose domain framing **contradicts** the user's current research direction (e.g., the pre-loaded article frames the market as enterprise, but user now targets SMBs), surface the conflict:

> *"The reference in `_input/{source-file}` frames {domain} as {old framing}. Your research direction is {new framing}. Want me to record that document as superseded so downstream synthesis doesn't pick it up as authoritative?"*

Butler calls `promptSupersede` with:
- `inputPath`: path to the conflicting `_input/reference/` file
- `sacredDocPath`: `_context/sacred/context.md`
- `decisionContext`: `"domain-research Step 1 — reference material conflicts with current research scope"`

If the reference is still relevant but one section is outdated, note it in the output doc under `conflicting_references:` rather than invoking a full supersession.

### 5. Initialize output document

Include metadata:

```yaml
---
name: domain-research
topic: "{topic}"
research_mode: graph-first | web-only | mixed
graph_hits: [list of node IDs or 'none']
legacy_scanned: true | false
project_shape: greenfield | brownfield | ambiguous
phase_authored: 2
status: draft
---
```

## Output

Topic scoped with graph coverage + (if applicable) legacy-scan results acknowledged. `step_1_complete: true`

## Navigation

→ Proceed to [step-02-research.md](step-02-research.md)
