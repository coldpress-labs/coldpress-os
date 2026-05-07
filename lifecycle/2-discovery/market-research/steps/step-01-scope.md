---
step_number: 1
step_name: "Scope Research"
step_goal: "Define market focus + known competitors; check graph first for pre-loaded material"
halts_for_input: true
next_step: "step-02-research.md"
---

## Goal

Understand what market aspects to research. **Graph-first, web-second** — check what the user pre-loaded in Phase 1 intake before planning fresh web research.

## Instructions

### 1. Ask scope

*"What market or problem space do you want to research?"*

Focus areas: pricing, features, positioning, customer segments, market size?

### 2. Capture known competitors

Ask the user for competitors they're already aware of. Two reasons:
- Web search may miss niche / regional competitors the user knows from experience
- Named competitors anchor the positioning map in `validate-idea` Step 3

### 3. Graph-first query (Wave 3.4)

Before scoping the web-research plan, check `.coldpress/graph/graph.json`:

```
coldpress graph query --dir-role _input/reference/ --topic "{market-topic}"
```

Reference material often contains market analyst reports, competitor websites the user already saved, pricing-page screenshots, etc. — all fair game for synthesis before web search.

**Graph hits exist** — synthesise from graph first; web-search only for gaps.
> You've pre-loaded {N} market-relevant sources. I'll start there, then do fresh web research for competitors / segments we don't yet cover.

**No graph hits** — proceed with web-search-only flow. Note in output.

### 4. Initialize output document

Metadata:

```yaml
---
name: market-research
topic: "{topic}"
research_mode: graph-first | web-only | mixed
graph_hits: [list of node IDs or 'none']
known_competitors: [list]
phase_authored: 2
status: draft
---
```

## Output

Research scoped with graph coverage + known-competitor list acknowledged. `step_1_complete: true`

## Navigation

→ Proceed to [step-02-research.md](step-02-research.md)
