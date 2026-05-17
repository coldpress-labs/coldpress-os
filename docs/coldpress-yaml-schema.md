---
name: coldpress-yaml-schema
description: Full schema for coldpress.yaml, with per-field phase ownership and write-back contracts
version: "1.0"
---

# `coldpress.yaml` Schema

> `coldpress.yaml` is a runtime journal, not a forward-declaration. Only Phase-1 fields ship in the template. Every other field is written back by the phase that owns it.

---

## Why the template is minimal

Earlier versions of `coldpress.yaml` shipped Phase-3-and-later decisions as Phase-1 config fields — `stack_pack`, agent modes, `type`, `domain`, `pattern`, most `sacred_docs.*` paths. Even when blank, their structural position silently asked the user to decide now. Worse, commented `# convex:` / `# supabase:` override blocks at the file tail biased stack selection toward Convex-as-canonical-example.

The current design reverses that:

- **Phase-1 fields are the only fields that ship in the template.** They split into two subsets: fields filled by the `coldpress init` CLI at scaffold time (`project.*`, `user.{name, languages}`), and fields defaulted in the template but overwritten by Butler's Phase-1 `intake` skill (`butler.display_name`, and forthcoming `user.{preferred_ides, cadence, team_shape}` when `intake` ships).
- **Every other field is empty until its owning phase runs.** When a phase-owning skill completes, it writes its field back to `coldpress.yaml` with an ownership annotation.
- **Reading an unfilled field** throws a clear `pending: written in Phase N` error, never a null-reference.
- **Framework defaults** (sacred-doc paths, output directory conventions) live in the skills themselves; they are not duplicated in the yaml unless a consumer project explicitly overrides them.

The file is additive: it grows as the project moves through the lifecycle. It never has "decide now" fields staring at a user who can't yet.

---

## Phase-1 fields (template)

These are the only fields shipped in `template/coldpress.yaml`. They split into two subsets by *when* during Phase 1 they are filled.

### Filled by CLI (`coldpress init`)

Set at scaffold time, before Butler exists.

```yaml
project:
  name: ""                          # required — human-readable project name
  slug: ""                          # required — kebab-case identifier

user:
  name: ""                          # required — for personalisation in prose
  communication_language: "English" # default
  document_output_language: "English" # default
```

### Filled by Butler during Phase-1 `intake`

Defaulted in the template; overwritten by Butler if the user customises during the `intake` sub-skill.

```yaml
butler:
  display_name: "Butler"            # optional — user-facing label for the project's
                                    # orchestrator agent. Defaults to "Butler". The
                                    # framework-internal role is always "Butler"
                                    # regardless of display_name — see
                                    # docs/lifcyle-phases-deep-dives/phase-1-deep-dive-2026-04-23.md §Step 7a.
```

**Forthcoming Phase-1 intake fields** (added by `intake` skill when it ships — not yet in template; see [phase-1-deep-dive-2026-04-23.md](../docs/lifcyle-phases-deep-dives/phase-1-deep-dive-2026-04-23.md) §Step 7):

- `user.preferred_ides` — list, e.g., `["claude-code"]` or `["claude-code", "cursor"]`. Prunes interop file emission.
- `user.cadence` — one of `silent` / `summary` / `verbose`. Shapes Butler's turn-by-turn verbosity.
- `user.team_shape` — one of `solo` / `team` / `client-project`. Seeds later stakeholder reasoning without pre-empting Phase-2 stakeholder mapping.

---

## Fields written by later phases

Every field below is **empty at init** and written back by the owning phase. The annotation on the right is the literal comment each skill appends when it writes the field.

### Phase 2 — Discovery

Nothing. Phase 2 produces `_context/sacred/context.md` but does not touch `coldpress.yaml` yet. Discovery-driven stack-evaluation decisions land in Phase 3.

### Phase 3 — Tech Stack

```yaml
project:
  type: ""                          # written by Phase 3 stack-evaluation
                                    # from data/classification/project-types.csv
  domain: ""                        # written by Phase 3 stack-evaluation
                                    # from data/classification/domain-complexity.csv
  pattern: ""                       # written by Phase 3 stack-evaluation
                                    # a (three-tier) | b (single-repo) | c (framework) | d (non-code)

stack_pack: ""                      # written by Phase 3 stack-locking
                                    # e.g., "vibe-coder-fullstack" — activates skills/stack-packs/{pack}/

baselines:                          # written by Phase 3 stack-locking (step-05b baselines confirmation)
                                    # all four categories present with status
  seo_aeo_llm:
    status: ""                      # confirmed | opted-out | confirmed-with-override
    covered_by_pack: ""             # true | false | partial
    rationale: ""                   # required if opted-out
    overrides: {}                   # optional map of parameter overrides
  accessibility:
    status: ""
    covered_by_pack: ""
    rationale: ""
    overrides: {}
  security:
    status: ""
    covered_by_pack: ""
    rationale: ""
    overrides: {}
  future_proof:
    status: ""
    covered_by_pack: ""
    rationale: ""
    overrides: {}
  # validated by schemas/baselines.schema.json

agents:
  analyst:
    mode: ""                        # written by Phase 3 stack-locking
                                    # full | brief | creative | strategic
  developer:
    mode: ""                        # written by Phase 3 stack-locking
                                    # standard | quick
  qa:
    depth: ""                       # written by Phase 3 stack-locking
                                    # rapid | strategic
  ux-designer:
    mode: ""                        # written by Phase 3 stack-locking
                                    # standard | full-spec
```

### Phase 4 — Planning

```yaml
sacred_docs:
  context: "_context/sacred/context.md"         # written by Phase 2 on first pass (locked path — override only if migrating)
  tech_stack: "_context/sacred/tech-stack.md"   # written by Phase 3 stack-locking
  prd: "_context/sacred/prd.md"                 # written by Phase 4 create-prd
  architecture: "_context/sacred/architecture.md" # written by Phase 4 create-architecture
  pert: "_context/sacred/pert-chart.md"         # written by Phase 5 parallelization-strategy
```

Framework defaults for all five paths live in `governance/sacred-docs.md` §2. Consumer projects only write these fields if they override the default location — which is rare and governed by §7 *Structural Migrations*.

### Phase 3+ (optional) — Stack-pack overrides

If `stack_pack` is set, stack-pack-specific config keys may be written under a block keyed by the pack name. No commented examples ship in the template (they biased selection); the authoritative reference lives in `docs/stack-pack-guide.md`. Example shape:

```yaml
convex:
  project_id: ""                    # written by Phase 3 stack-pack setup-auth
  deployment: ""                    # written by Phase 3 stack-pack setup-auth
```

### Outputs and paths

The `output:` block is not written back to `coldpress.yaml` by any phase. Framework defaults (the seven `_context/*` subfolders — `planning/`, `design/`, `implementation/`, `testing/`, `tracking/`, `handoffs/`, `audit/`) live in the skills. A consumer project that wants to override an output path adds the `output:` block manually.

---

## Write-back contract

Every phase-owning skill that writes to `coldpress.yaml` follows the same contract:

1. **Write only fields you own.** A skill may not set a field outside its owning phase. Validation rejects cross-phase writes.
2. **Append the ownership comment.** Every write produces a line like `stack_pack: "vibe-coder-fullstack"  # written by Phase 3 stack-locking`.
3. **Preserve existing fields.** Write-back is a merge, not a rewrite — never clobber fields owned by later phases if they're already filled.
4. **Fail loudly on schema drift.** If a consumer project yaml has Phase-3-owned fields filled before Phase-3 runs (migrated from a pre-v0.2 project), the skill logs a back-compat warning but does not rewrite — the field is grandfathered.

---

## Back-compat

Projects created before Phase I Wave 1 (pre-v0.2) will have yaml files populated with the full schema up-front, including Phase-3+ fields. The migration policy:

- **Do not rewrite existing yamls.** Only the *template* changes in Wave 1. Existing projects continue to work.
- **Phase skills detect pre-filled fields** and skip their write-back step, leaving legacy values intact.
- **The deprecation is soft**: no warning, no forced migration. The old shape continues to be valid; new projects just get the cleaner shape.

If a consumer project yaml references old paths (`_output/…` after Wave 1 renames), the framework surfaces a one-line migration hint at skill-run time: `"coldpress.yaml references _output/… — rename to _context/… (see phase-i-implementation-plan §1.1)"`. No automatic rewrite; the user owns the migration.

---

## Validation

- `project.name` and `project.slug` are required at every phase boundary; missing values abort with a clear error.
- `user.name` is required at any prose-producing phase (create-prd, create-architecture, etc.) — missing values abort that phase only.
- Phase-3+ fields are validated *at the boundary where they are needed* — not at init. A Phase-4 create-prd run with unset `stack_pack` still works; a Phase-6 dev-story run without `stack_pack` aborts with `pending: stack_pack written in Phase 3 stack-locking`.

The actual schema validator ships in Wave 2 (npm package). Until then, skills perform ad-hoc validation at their entry points.

---

## Sibling schema — `.coldpress/local-config.yaml`

Runtime state that survives between Butler sessions but must NOT ship with the project (it's machine-local). Written by Phase-1 `orient` / `intake` skills; read on every boot to decide resume behaviour.

Location: `.coldpress/local-config.yaml` (under the .coldpress runtime dir — `.gitignore`'d).

```yaml
# All fields optional; an empty file is valid (fresh project).
phase_1_completed: false
phase_1_completed_at: null           # ISO-8601 when Phase 1 completes
phase_3_completed: false
phase_3_completed_at: null           # ISO-8601 when Phase 3 completes
phase_3_started_at: null             # ISO-8601 when Phase 3 begins (set by stack-discovery-sync)
orient_skipped: false                # user said "I know how this works"
project_shape: null                  # greenfield | brownfield | ambiguous
product_type: null                   # written by stack-discovery-sync Step 2 (from classification CSV)
domain_complexity: null              # written by stack-discovery-sync Step 2 (low | medium | high)

# Set by a step BEFORE starting its work; cleared on clean exit.
# On next Butler boot, orient Step 0 reads this and resumes at step_id.
partial_completion: null             # null | { step_id: string, at: ISO-8601 }

# Granular interrupt/resume within Phase 3 multi-step skills. At most one variant set.
sub_state: null                      # null | { decision_area: string }
                                     #        { category_index: int }
                                     #        { env_provision_category: string }
                                     #        { stack_lock_checkpoint: schema-valid | sacred-written | yaml-written }

# Set by intake Step 5 if graph prime fails (Python missing, Graphify error, disk issue).
# orient Step 0 surfaces this and offers a retry on next boot.
needs_graph_rebuild: false
graph_rebuild_error: null            # human-readable reason populated when above is true

# Set by `coldpress update --post-phase-3` after stack-pack wrappers regenerated.
post_phase_3_update_ran: false
post_phase_3_update_ran_at: null     # ISO-8601
```

Validated by `src/utils/local-config-validator.ts`. Read/write helpers in `src/utils/local-config.ts` (`readLocalConfig`, `updateLocalConfig`, `markStepStart`, `clearStepMarker`).

### Partial-completion mechanic

Every intake step writes `partial_completion` before starting its work; on clean exit, it calls `clearStepMarker()`. If a step crashes mid-way, the marker persists, and on next Butler boot `orient` Step 0 reads it and resumes at `step_id`. Safe by construction because each step's first action re-checks its preconditions.

### Graph-prime failure recovery

`intake` Step 5 (`graph-prime`) is *warn-not-block*: if `coldpress graph rebuild` fails, Step 5 writes `needs_graph_rebuild: true` + `graph_rebuild_error: "<reason>"` and continues. On next session, `orient` Step 0 sees the flag, surfaces the error, and prompts retry — on success it clears both fields.

---

## See also

- `governance/sacred-docs.md` §2 — the canonical five sacred documents and their paths.
- `docs/stack-pack-guide.md` — authoring stack packs and their override shape.
- `docs/phase-i-implementation-plan.md` §1.9 — the rationale for the config-vs-output redesign.
- `schemas/baselines.schema.json` — JSON schema for the `baselines:` block.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-04-24 | ColdPress Labs | Phase II Part 3 Wave 4.11. Phase 3 section: added `baselines:` top-level block (4 categories, written by stack-locking step-05b; validated by `schemas/baselines.schema.json`). Local-config section: added `phase_3_completed`, `phase_3_completed_at`, `phase_3_started_at`, `product_type`, `domain_complexity`, `sub_state` (4 variants), `post_phase_3_update_ran`, `post_phase_3_update_ran_at`. |
| 1.0 | 2026-04-24 | ColdPress Labs | Initial schema doc — Phase I Wave 1. Phase-1 template fields; write-back contract; back-compat note; local-config schema. |
