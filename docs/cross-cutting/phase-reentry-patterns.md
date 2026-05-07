---
name: phase-reentry-patterns
description: Cross-cutting decision table and Butler prompt pattern for proactive Phase N re-entry suggestions during Phase 4 PRD authoring
version: "1.0"
---

# Phase-N Re-entry Patterns

> Cross-cutting reference for Butler's behaviour when a Phase 4 skill step discovers a gap in a prior-phase artefact. Defines the decision table (when to surface, which artefact, what action) and the canonical 3-option Butler prompt pattern.
>
> **Shape A note:** Architecture-triggered re-entry patterns (when `create-architecture` discovers Phase 2/3 gaps) are documented in the Phase 6 Architecture deep-dive. This file covers `create-prd`, `validate-prd`, and `planning-entry-sync` triggers only. Later Parts extend this file with Phase 5 and Phase 6 re-entry rows.

---

## What this covers

Every Phase 4 skill step that can discover a Phase 2 or Phase 3 gap must check against the decision table below and surface the finding to the user using the Butler prompt pattern. This is a **cross-cutting concern** — wired into specific step files, not into a single skill.

**Principles:**
- Never silently skip a gap in a prior artefact that will affect Phase 5/6/7 correctness.
- Never block Phase 4 progress without the user's explicit choice.
- Always offer the escape hatch: accept + log, rather than forcing Phase N re-entry.
- Log all surfaced gaps in the Phase 4 handoff log so downstream phases can account for them.

---

## Decision table — Phase 4 PRD skills

| Phase 4 skill | Step | Trigger condition | Target phase + artefact | Butler action |
|---|---|---|---|---|
| `create-prd` | Step 2 (vision/goals) | PRD goal contradicts `context.md` primary problem statement | Phase 2 `_context/sacred/context.md` | Fire supersede-check; present 3-option re-entry prompt (see below) |
| `create-prd` | Step 3 (requirements) | Requirement implies a stack decision not captured in `tech-stack.md` (new dependency, new service, new infrastructure tier) | Phase 3 `_context/sacred/tech-stack.md` | Flag as stack gap; offer change-workflow suggestion or "accept-with-caveats + log for Phase 6" |
| `create-prd` | Step 3 (requirements) | NFR exceeds a baseline opt-out rationale (e.g., PRD says "must meet WCAG 2.1 AA" but accessibility baseline was opted out in `coldpress.yaml baselines:`) | Phase 3 `coldpress.yaml baselines:` section | Flag contradiction; offer to re-enable baseline (routes to `stack-locking` Step 5a re-invocation) or accept as PRD-override-with-caveats |
| `create-prd` | Step 4 (features) | Feature depends on a `validate-idea` risky assumption not yet resolved | Phase 2 `_context/planning/idea-validation-v{N}.md` | Flag assumption; offer to add explicit risk note in PRD or route to Phase 2 additional validation |

> **Planned extensions:** Phase 5 (create-ux-design conflicts with PRD personas) and Phase 6 (create-architecture conflicts with PRD NFRs or tech-stack decisions) will add rows to this table in their respective Part deep-dives.

---

## Butler prompt pattern — proactive phase-N re-entry surface

When a trigger condition from the decision table fires, Butler presents this pattern to the user:

```
⚠ Planning gap detected. [Specific description of the conflict]

This [PRD requirement / PRD goal / PRD feature] [contradicts / exceeds / depends on something in]
the [artefact name] authored in Phase [N].

Options:
1. Accept + log — continue with current direction; record this as a supersession; the prior
   artefact stays unchanged but downstream phases know the override. Zero blocking friction.
2. Pause + amend — pause Phase 4 at this point; open the change-workflow for [artefact];
   amend; resume Phase 4 at this step. Keeps the sacred-doc history clean.
3. Flag for PRD/architecture risk section — continue now, add an explicit risk note in the
   current document; revisit before Phase 5 entry. Deferred resolution.

Note: if you accept + log or flag, the gap will appear in the Phase 4 handoff log so
Phase 5 create-epics can account for it.
```

**Fill-in guidance:**

| Placeholder | What to insert |
|---|---|
| `[Specific description of the conflict]` | One concise sentence: what the PRD says vs. what the prior artefact says |
| `[PRD requirement / PRD goal / PRD feature]` | Choose the most specific label |
| `[contradicts / exceeds / depends on something in]` | Choose the accurate relationship |
| `[artefact name]` | Full path, e.g. `_context/sacred/context.md` or `coldpress.yaml baselines:` |
| `Phase [N]` | The number of the phase where the target artefact was authored |
| `change-workflow for [artefact]` | Full path to the relevant governance change-workflow, e.g. `governance/change-workflows/context.md` |

---

## Severity heuristics — when to escalate vs. silently log

| Severity | Heuristic | Action |
|---|---|---|
| **Always surface** | Any claim that supersedes a **block**-severity gate condition from Phase 2/3 | Present all 3 options; do not proceed without user response |
| **Always surface** | Stack additions that require new paid services or infrastructure | Present all 3 options |
| **Surface if likely unintentional** | NFR or PRD goal conflicts with `context.md` | Present; if user dismisses, log + continue |
| **Log silently if minor** | Small implementation detail not foreseen in `tech-stack.md` (e.g., a specific npm library choice) | Add to supersessions log; mention at end of step with count |

---

## Decision table — Phase 5 Design skills

> **Boundary clarification:** PRD-targeted gaps from Phase 5 NEVER use re-entry. They route through the **PRD reconciliation pass** (Phase 5 deep-dive §7) — a separate, designed mechanism that converts design-deltas into PRD v(N+1) lightweight amendments. Re-entry is reserved for stale Phase 2 / Phase 3 artefacts.

| Phase 5 skill | Step | Trigger condition | Target phase + artefact | Action |
|---|---|---|---|---|
| `design-brief` | step-04-platform | Persona segment missing/imprecise (e.g., motor-impaired persona absent but design needs it) | Phase 2 `personas-v{N+1}` | re-entry (`re-entry` skill in Phase 2) |
| `design-brief` | step-02-content | Brand voice contradicts product-brief value prop | Phase 2 `product-brief-v{N+1}` | re-entry |
| `ux-design` | step-02-flows | Riskiest assumption (idea-validation) needs sharpening | Phase 2 `idea-validation-v{N+1}` | re-entry |
| `ux-design` | step-02-flows | Flow needs stack capability not in tech-stack (e.g., service worker, websockets) | Phase 3 `tech-stack-md` ADR amendment | re-entry + supersede-check |
| `ux-design` | step-04-spec | New baseline category needed (e.g., motion-reduce a11y axis discovered necessary) | Phase 3 `coldpress.yaml baselines` block | partial re-entry (stack-locking baselines block only) |
| `prototype` | step-04-validate | Prototype imports library not in tech-stack.dependencies | Phase 3 ADR amendment OR PRD reconciliation `flag_for_architecture_ADR` | re-entry + supersede-check OR reconciliation (user choice) |
| `brand-guidelines` | step-02-voice | Voice traits contradict persona accessibility/device targets | Phase 2 `personas-v{N+1}` | re-entry |
| `brand-guidelines` | step-03-tokens | Token contrast fails active a11y baseline | Phase 3 `coldpress.yaml baselines` (downgrade opt-in) OR adjust tokens | re-entry partial OR adjust-locally (no re-entry) |
| `legacy-ui-assessment` | step-02-compare | UI legacy decision conflicts with Phase 4 `legacy-migration-plan` architecture decision | PRD reconciliation `flag_for_architecture_ADR` | reconciliation (NOT re-entry; cross-phase alignment goes to Phase 6) |

**PRD-targeted gaps (always reconciliation, never re-entry):**

| Phase 5 skill | Step | Trigger | Mechanism |
|---|---|---|---|
| Any Phase 5 skill | Any step | New NFR discovered (e.g., motion-reduce, offline) not in PRD | PRD reconciliation pass — design-delta with `delta_type: additive` |
| Any Phase 5 skill | Any step | Feature scope delta (PRD missing a screen the design needs) | PRD reconciliation pass — `delta_type: additive` |
| `ux-design` | step-04-spec | Acceptance-criteria delta (UX exposes ambiguous AC) | PRD reconciliation pass — `delta_type: modifying` |

### Butler prompt pattern (Phase 5 — 4 options, adds reconciliation alternative)

When a Phase 5 skill detects a Phase 2/3 gap, surface to user:

```
[BUTLER — Phase 5 gap surfaced]

Phase 5 skill: {skill_name}
Gap: {short_description}
Target: {phase_2|phase_3} artefact: {artefact_name}

Recommended re-entry: {re_entry_skill} in {target_phase}

Options:
  1. Re-enter {target_phase} now (pause Phase 5; resume after re-entry exit clean)
  2. Defer to Phase 5 reconciliation pass (only for PRD-touching gaps; flagged for record)
  3. Park as design-delta with delta_type=cross_phase (not recommended — leaves stale upstream)
  4. Reject (Phase 5 absorbs gap unresolved; risk: downstream divergence)

Default: 1 (re-enter)
```

PRD-targeted gaps NEVER offer re-entry to Phase 4. Always offer reconciliation as the primary path.

---

## Decision table — Phase 11 Evolve skills (FINAL PHASE)

> Phase 11 reflective re-entry triggers route to NEXT iteration's Phase N. Outputs feed `_input/prior-iteration/` for next iteration's Phase 1 entry.

| Phase 11 trigger | Routes to | Mechanism |
|------------------|-----------|-----------|
| Retro identifies architectural debt | Phase 6 architecture re-entry (next iteration) | inter-iteration re-entry |
| Retro identifies UX friction not fixable in current product | Phase 5 ux-design re-entry (next iteration) | inter-iteration re-entry |
| Retro identifies PRD assumptions wrong | Phase 4 PRD re-entry (next iteration) | inter-iteration re-entry |
| Product-evolution backlog → next iteration scope | Phase 1 NEW iteration entry | inter-iteration cycle |
| Innovation-strategy → research project | Phase 2 research re-entry | re-entry |

---

## Decision table — Phase 10 Operate skills

> Phase 10 surfaces gaps via **ops-deltas** (fourth forward-carry instance to Phase 11 Evolve). Reconciliation at Phase 10 EXIT in phase-transition step-02a-reconciliation (extended for from_phase==10 — forwards ops_deltas[] to Phase 11 handoff; does NOT amend PRD).

| Phase 10 trigger | Routes to | Mechanism |
|------------------|-----------|-----------|
| Course-correction reveals architectural issue | Phase 6 architecture re-entry | re-entry |
| Bug triage reveals story-implementation gap | Phase 8 dev-story re-entry | re-entry |
| Telemetry reveals UX friction | ops-delta to Phase 11 | forward-carry |
| Security incident | Phase 9 security-scan re-run + Phase 8 patch | re-entry |
| Documentation gap | document-project iteration | in-phase |
| Live-product PRD ambiguity | ops-delta forward-carry to Phase 11 | forward-carry |

---

## Decision table — Phase 9 Deployment skills

> Phase 9 is verification + execution + recording. NO forward-carry mechanism (per Q3). Divergence routes back via re-entry OR forward to Phase 10 Operate as ops-issue.

| Phase 9 trigger | Routes to | Mechanism |
|-----------------|-----------|-----------|
| Pre-deploy gate fails | Phase 8 re-entry (fix code) OR Phase 7 re-entry (re-plan) | re-entry |
| Security scan blocks (block-severity finding) | Phase 8 re-entry to fix code OR raise architecture-delta to Phase 6 | re-entry OR forward-carry |
| Env-check fails (infra issue) | Phase 3 ADR amendment (env-config) | re-entry |
| Dep-health critical advisory | Phase 3 ADR amendment (replace dependency) | re-entry |
| DB migration fails | Phase 4 legacy-assessment re-entry (revise migration plan) | re-entry |
| Post-deploy smoke fails | Rollback + Phase 8 re-entry | rollback procedure |
| Observability baseline not met | Phase 3 baseline re-entry (revise observability axis) | re-entry |

---

## Decision table — Phase 8 Implementation skills

> Phase 8 surfaces gaps via **implementation-deltas** (third forward-carry instance, mirror of Phase 5 design-deltas at Phase 5 EXIT). Reconciliation at Phase 8 EXIT in phase-transition step-02a (extended for from_phase==8).

| Phase 8 trigger | Routes to | Mechanism |
|-----------------|-----------|-----------|
| Code can't fulfill story AC because PRD ambiguous | implementation-deltas reconciliation at Phase 8 EXIT | reconciliation |
| Code reveals architecture component missing | Phase 6 architecture re-entry OR architecture-delta forward-carry | re-entry OR reconciliation |
| Story scope exceeds reasonable wave time | Phase 7 sprint-planning re-entry | re-entry (split story OR re-balance waves) |
| ADR contradicts implementation choice | supersede-check raise; new ADR | supersede-check |
| Tech-stack library missing for story | Phase 3 ADR amendment | re-entry |
| Test-coverage target unrealistic | Phase 7 story re-author | re-entry |
| flag_for_architecture_ADR raised at Phase 8 | Phase 6 re-entry — RARE; should have been caught at Phase 6 (silent-divergence guard breach signal) | re-entry |

---

## Decision table — Phase 7 Breakdown skills

> **Phase 7 boundary clarification:** Phase 7 ENTRY (in `breakdown-entry-sync` Step 1) is where Phase 6 architecture-deltas reconcile (forward-carry mechanism — mirror of Phase 5 design-deltas). Phase 7 may surface its own gaps during epic/story decomposition; PRD-targeted gaps route to architecture-deltas-style reconciliation; UX/architecture gaps re-enter their respective phases.

| Phase 7 trigger | Routes to | Mechanism |
|-----------------|-----------|-----------|
| Architecture-delta unresolved at Phase 7 entry | Already handled at Phase 7 entry-sync Step 1 | n/a — caught at entry |
| Story exposes PRD ambiguity (e.g., AC unclear) | architecture-deltas-style reconciliation OR Phase 4 PRD re-entry | reconciliation OR re-entry |
| Story exposes UX-spec gap | Phase 5 ux-design re-entry | re-entry |
| Story exposes architecture component missing | Phase 6 architecture-design re-entry | re-entry + supersede-check on architecture sacred-doc |
| ADR contradiction surfaced | supersede-check raise; ADR superseded; new ADR documents | supersede-check |
| Story implementation needs library not in tech-stack.dependencies | Phase 3 ADR amendment | re-entry |

---

## Decision table — Phase 6 Architecture skills

> **Phase 6 boundary clarification:** PRD-targeted gaps go to **architecture-deltas reconciliation pass** at Phase 6 EXIT (forward-carry mechanism — mirror of Phase 5 design-deltas). Tech-stack-targeted gaps trigger Phase 3 ADR amendment via re-entry. UX-targeted gaps trigger Phase 5 re-entry.

| Phase 6 trigger | Routes to | Mechanism |
|-----------------|-----------|-----------|
| Architecture exposes PRD ambiguity (e.g., NFR underspec'd; missing user-story coverage) | Phase 4 PRD via reconciliation pass at Phase 6 EXIT | architecture-deltas reconciliation (forward-carry; mirror of Phase 5 design-deltas) |
| Architecture exposes UX spec gap (e.g., screen needs interaction not in spec) | Phase 5 `ux-design` re-entry | re-entry skill |
| Architecture needs tech-stack capability not locked (e.g., needs websockets but stack has no websocket lib) | Phase 3 `tech-stack` ADR amendment | re-entry + supersede-check |
| Architecture needs new baseline category (e.g., observability axis needed) | Phase 3 `coldpress.yaml baselines` (partial re-entry, baselines block only) | partial re-entry (stack-locking baselines block only) |
| Architecture decision contradicts prior Phase 3 ADR | Phase 3 ADR supersession via supersede-check | supersede-check; old ADR superseded; new Phase 6 ADR documents the supersession |

### Butler prompt pattern (Phase 6 — same 4-option pattern as Phase 5)

```
[BUTLER — Phase 6 gap surfaced]

Phase 6 skill: architecture-design
Step: {step}
Gap: {short_description}
Target: {phase_3|phase_4|phase_5} artefact: {artefact_name}

Recommended action: {re_entry_skill | architecture_deltas_reconciliation}

Options:
  1. Re-enter {target_phase} now (pause Phase 6; resume after re-entry exit clean) — for tech-stack / UX / baseline gaps
  2. Defer to Phase 6 architecture-deltas reconciliation pass (PRD-targeted gaps; flagged for record) — forward-carry mechanism
  3. Park as architecture-delta with delta_type=cross_phase (not recommended)
  4. Reject (Phase 6 absorbs gap unresolved; risk: downstream divergence)

Default: 1 (re-enter) for non-PRD gaps; 2 (reconciliation) for PRD-targeted gaps
```

---

## Where this is wired in Phase 4

The decision table is enforced at the step-file level, not by a central orchestrator. Each step that can trigger a re-entry surface carries a `## Phase-N Re-entry Check` subsection referencing this document:

| Step file | Trigger row |
|---|---|
| `lifecycle/4-planning/create-prd/steps/step-02-vision.md` | Row 1 (PRD goal vs. context.md) |
| `lifecycle/4-planning/create-prd/steps/step-03-requirements.md` | Rows 2+3 (stack gap + baseline contradiction) |
| `lifecycle/4-planning/create-prd/steps/step-04-features.md` | Row 4 (risky assumption dependency) |

**Supersessions log:** Accepted supersessions (Option 1) are appended to `_context/audit/supersessions-{date}.md` following the format spec at [`docs/supersessions-log-spec.md`](../supersessions-log-spec.md).

**Handoff log:** All surfaced gaps (Options 1, 2, 3) are recorded in the Phase 4 handoff log written by `phase-transition`. Phase 5 `create-epics` reads this log to surface unresolved gaps before epic authoring begins.

---

## Decision table — Unit #28 new-skill re-entry triggers (added 2026-05-03)

The 4 new triggers introduced by Unit #28 skills. Severity column uses the same heuristic as the per-phase tables above (block / warn / log).

| Trigger source | Detection | Re-entry target | Severity | Reason |
|---|---|---|---|---|
| `a11y-audit` (Phase 5 or 9) finds Critical contrast failure | `_context/audit/a11y-audit-v{N}.md` violations[*].impact == Critical AND wcag_criterion in [1.4.3, 1.4.6] | **Phase 5 → `brand-guidelines`** for token re-tokenisation (or design-led/WDS archetype escalation) | block (design-led/WDS archetype) / warn (standard) / skip (vibe-coder-lean) | Brand-token contrast failures forward-carry as design-deltas to Phase 5 → 6 reconciliation; design-led/WDS gate.json blocks deploy until resolved. |
| `dependency-auditor` (Phase 9) finds GPL/AGPL transitive | `_context/audit/dep-audit-v{N}.md` license findings include GPL/AGPL | **Phase 3 → `stack-locking`** for replacement OR remove dep | block | License incompatibility with coldpress-os MIT enforcement. The dep stays out until replaced; Phase 3 ADR amendment authorises the replacement. |
| `incident-response` (Phase 10) finds architectural root-cause | postmortem `root_cause` references `_context/sacred/architecture.md` component or NFR | **Phase 6 → `architecture-design`** ADR amendment via sacred-doc change-workflow | warn (incident already mitigated) / block (if architecture is silently divergent from runtime reality) | Sacred-doc amendment governance applies; ADR captures the post-incident architectural learning. ops-delta forward-carries to Phase 11 retrospective if pattern emerges. |
| `secrets-vault-manager` (Phase 9) finds committed secret in git history | `_context/audit/secrets-audit-v{N}.md` includes CRITICAL findings | **Phase 1 (manifest cleanup) + Phase 8 (code remediation)** dual-target | block | Committed secrets compromise security posture; both axes need remediation: manifest update (Phase 1) + code/history rewrite (Phase 8). Phase 9 deploy gate stays blocked until resolved. |

### Butler prompt pattern (Unit #28 triggers — same 4-option shape)

When any of the 4 triggers above fire, Butler prompts the user with the same canonical 4-option surface used at Phase 5 (PRD reconciliation) and Phase 6 (architecture amendment):

> **Re-entry trigger detected:** {trigger description}
>
> Source: {audit report path}
> Severity: {block/warn/log}
>
> Options:
> 1. **Accept + log** — proceed; record in `_context/audit/supersessions-{date}.md`; will be visible at Phase 11 retrospective.
> 2. **Pause + re-enter {target phase}** — invoke {re-entry-target-skill}; resolve before proceeding.
> 3. **Park for Phase 11** — defer to retrospective; surface as `accept_into_phase_11_retrospective` ops-delta.
> 4. **Cancel** — abort current operation; user thinks more about the right path.

For block-severity triggers, Option 1 is disabled (user MUST re-enter or cancel).

---

## Relationship to the supersede-check helper

The supersede-check (`src/governance/supersede.ts`) is the low-level helper that records a supersession to the audit log and marks the target artefact's `supersedes:` frontmatter. The re-entry prompt pattern in this file is the user-facing decision surface. They work together:

- Butler detects a conflict → presents re-entry prompt
- User selects Option 1 (Accept + log) → Butler calls `supersede.ts` with source + target paths
- `supersede.ts` appends to audit log + updates `supersedes:` frontmatter on the old artefact

Option 2 (Pause + amend) bypasses `supersede.ts` — the artefact is amended via its governance change-workflow, no supersession record is needed.

---

## See also

- [`docs/prompt-patterns.md`](../prompt-patterns.md) — Pattern 6 (phase-N re-entry surface) is the companion skill-authoring convention
- [`docs/supersessions-log-spec.md`](../supersessions-log-spec.md) — format spec for `_context/audit/supersessions-{date}.md`
- [`lifecycle/4-planning/create-prd/steps/step-03-requirements.md`](../../lifecycle/4-planning/create-prd/steps/step-03-requirements.md) — wires rows 2+3
- [`lifecycle/4-planning/create-prd/steps/step-04-features.md`](../../lifecycle/4-planning/create-prd/steps/step-04-features.md) — wires row 4
- [`governance/change-workflows/`](../../governance/) — Phase N amendment workflows

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-25 | Cadbury-hq | Phase II Part 4 Wave 6 (task 6.1). Initial document. Phase 4 PRD re-entry decision table (4 rows), Butler 3-option prompt pattern, severity heuristics, wiring table, supersede-check relationship. Phase 5+6 extension rows deferred to their respective Parts. |
