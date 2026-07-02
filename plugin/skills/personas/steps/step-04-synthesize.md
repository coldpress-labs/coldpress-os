---
step_number: 4
step_name: "Synthesise"
step_goal: "Affinity-cluster findings, finalise primary archetype, write the output doc"
halts_for_input: true
next_step: "complete"
---

## Instructions

### 1. Apply Affinity Clustering — `data/methods/design-thinking-methods.csv` (define)

*Group related observations and insights to reveal patterns and opportunity themes.*

Facilitation prompts: *"What connects these?"* / *"What themes emerge?"* / *"Group similar items."* / *"Name each cluster."* / *"What story do they tell?"*

Cluster:
- Pain points across archetypes (which ones repeat?)
- Jobs-to-be-done across archetypes (shared vs distinct)
- Accessibility / device / locale signals (e.g., multiple archetypes pointing at mobile-first)

Clusters that span archetypes become design-anchor themes for Phase 4 UX. Surface the top 3.

### 2. Confirm the primary archetype flag

If the user hasn't yet confirmed which archetype is primary, surface explicitly:

> Before I write the final doc: which archetype is primary? (Phase 4 UX optimises for this one first.)

### 3. Write the output document

Target path: `_context/planning/research/personas-{date}.md`

Structure:

```markdown
---
name: personas
phase_authored: 2
status: final
primary_archetype: "<archetype-name>"
archetype_count: N
methods_applied: ["User Interviews", "Empathy Mapping", "Jobs to be Done", "Journey Mapping", "Diary Studies", "Affinity Clustering"]
method_source: proxy | direct-research | mixed
version: "1.0"
---

# Personas — <project name>

## Archetypes

### <Archetype 1 name> — [PRIMARY]
<demographics + context>

**Jobs to be Done:** When <situation>, I want to <motivation>, so I can <outcome>.

**Empathy map**
- Says: …
- Thinks: …
- Does: …
- Feels: …

**Representative quote:** "…"

### <Archetype 2 name>
…

## Primary archetype journey

<Journey table — stages × (action, touchpoints, thinking, emotion, pain points, opportunities)>

## Accessibility, device & locale targets

| Target | Value | Rationale |
|---|---|---|
| WCAG level | AA | default floor, sufficient for v1 |
| Device matrix | Desktop + mobile web | primary archetype reviews on laptop, responds on phone |
| Browser floor | Safari ≥15, Chrome ≥110 | derived from device analytics |
| Locales | en-US, es-MX | 30% of primary archetype's market |
| RTL | Not required in v1 | no primary RTL locale |
| Offline | Offline-tolerant | bad-connectivity pain point on journey |

## Cross-archetype themes (affinity clusters)

1. **Theme A** — <one-line> — present in archetypes 1, 2
2. **Theme B** — <one-line>
3. **Theme C** — <one-line>

## Downstream phase handoff

- **→ Phase 3 Tech Stack:** <specific stack implications — offline, a11y libs, locale, devices>
- **→ Phase 4 UX:** <specific design implications — primary archetype, journey pain points, a11y level>
- **→ Phase 4 PRD:** <functional requirements implied by personas>
```

### 4. Present + confirm

Halt for user signoff:

> Here's the personas + journey + targets doc. Anything to tune before I write?

Iterate until signoff. Then write the file.

### 5. Graph rebuild trigger (optional)

Note in `_context/tracking/phase-2-{date}.md` that a new research output landed at `_context/planning/research/personas-{date}.md`. The `phase-transition` skill will pick this up on Phase 2 → 3 transition and rebuild the graph.

## Output

Final personas document written. Workflow complete.

## Navigation

→ Workflow complete.
