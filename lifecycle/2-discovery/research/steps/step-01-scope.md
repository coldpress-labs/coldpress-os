---
step_number: 1
step_name: "Scope Research"
step_goal: "Define research topic/scope for the selected focus; check _input/ first for pre-loaded material"
halts_for_input: true
next_step: "step-02-research.md"
---

## Goal

Understand what to research and why, for whichever `focus` was selected. **Pre-loaded material first, web second** — before planning fresh web search, check what the user pre-loaded in Phase 1 `intake` (`_input/reference/`, `_input/vendor/`, and — for `domain` focus on brownfield projects — `_input/legacy/`).

## Instructions

### 1. Confirm `focus` and `depth`

If not already specified: ask which research area (`domain` | `market` | `constraints`), and whether `depth: standard` (moderate thoroughness) or `depth: deep` (exhaust secondary sources, cross-check conflicting claims) fits. Default `depth` by `user.team_shape` (solo → standard, team/client-project → deep) if the user has no preference.

### 2. Ask scope — branches by focus

#### §Domain

*"What domain, industry, or sector do you want to research?"* Clarify: core domain, specific aspects of interest, research goals.

#### §Market

*"What market or problem space do you want to research?"* Focus areas: pricing, features, positioning, customer segments, market size? Also **capture known competitors** — ask the user for competitors they're already aware of (web search may miss niche/regional ones; named competitors anchor `validate-idea` Step 3's positioning map).

#### §Constraints

*"Which constraint area do you want to research? (compliance, protocols, performance envelopes, accessibility, regulatory, locale, device coverage)"* Classify applicable axes: compliance (GDPR/HIPAA/SOC2/ISO27001/…), protocols (REST/WS/gRPC/MQTT/…), algorithmic (throughput, latency), performance budgets, accessibility (WCAG level), device/browser matrix, locale/language support, regulatory (industry-specific).

### 3. Check `_input/` for pre-loaded material

Read `_input/reference/` (and `_input/vendor/` for constraints/domain) directly — Phase 1 `intake` already indexed what's there in `_context/tracking/intake-{date}.md`. Two outcomes:

**Relevant material exists** — synthesise from it first; web-search only for gaps. Confirm with the user:
> You've pre-loaded {N} sources on {topic}. I'll start there and supplement with web research only for gaps. Sound right?

**Nothing relevant** — proceed with a standard web-search flow. Note in the output that material is original (no pre-loaded references to reinforce findings).

### 4. §Domain only — brownfield legacy scan

Read `project_shape` from `.coldpress/local-config.yaml`. If `brownfield`:

> You have prior code in `_input/legacy/`. Let me check what domain knowledge is already embedded in the prior attempt — data models, terminology, user flows, deprecated assumptions — so the research builds on that rather than starting from zero.

Scan `_input/legacy/` for: **terminology** (domain vocabulary in types/variable/route names), **data models** (the prior schema reveals how the domain was carved up), **deprecated assumptions** (comments, dead code, reversed decisions — these reveal what *didn't* work). Log legacy-derived signals separately from web/pre-loaded findings (provenance matters).

### 5. Supersede-check for conflicting reference material

If pre-loaded material's framing **contradicts** the user's current research direction (e.g., the pre-loaded article frames the market as enterprise, but the user now targets SMBs), surface the conflict:

> *"The reference in `_input/{source-file}` frames {topic} as {old framing}. Your research direction is {new framing}. Want me to record that document as superseded so downstream synthesis doesn't pick it up as authoritative?"*

Butler calls `promptSupersede` with:
- `inputPath`: path to the conflicting `_input/` file
- `sacredDocPath`: `_context/sacred/context.md`
- `decisionContext`: `"research (focus: {focus}) Step 1 — reference material conflicts with current research scope"`

If the reference is still relevant but one section is outdated, note it under `conflicting_references:` in the output doc rather than invoking a full supersession.

### 6. Initialize output document

```yaml
---
name: research
focus: domain | market | constraints
depth: standard | deep
topic: "{topic}"
research_mode: pre-loaded-first | web-only | mixed
legacy_scanned: true | false        # domain focus only
known_competitors: [list]           # market focus only
axes: [list]                        # constraints focus only
phase_authored: 2
status: draft
---
```

## Output

Topic scoped with pre-loaded-material coverage + (if `domain` + brownfield) legacy-scan results acknowledged. `step_1_complete: true`

## Navigation

→ Proceed to [step-02-research.md](step-02-research.md)

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-08 to 2026-04-24 | Alfred, Cadbury-hq | Original per-skill Step 1s (`domain-research`, `market-research`, `constraint-research`). |
| 2.0 | 2026-07-02 | Butler | Merged into `research` Step 1 with `focus`/`depth` params (WS5-B, §8 item 6). Dropped the dead `coldpress graph query` invocation (WS0 §8 item 1 removed that CLI verb) — replaced with a direct `_input/` read, using the intake report as the index instead of a graph query. |
