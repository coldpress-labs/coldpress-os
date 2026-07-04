---
name: handoff-schema-spec
description: Typed-payload handoff convention — produced_by field, .meta.json sidecars, Zod schemas, gate-failure semantics
version: "1.0"
---

# Handoff Schema Spec

> Every phase boundary in coldpress-os is a handoff. The two **high-stakes** handoffs (PRD → architecture, stories → implementation) carry a typed sidecar validated by a Zod schema; validation failure blocks the phase transition. This doc is the contract.

**Source decision:** [bmad-family-positioning-brief-2026-04-23.md](../../lab-hq-projects/hq-p001-coldpress-os/docs/bmad-family-positioning-brief-2026-04-23.md) — MetaGPT's `cause_by` + `instruct_content` patterns ported as **convention**, not code. No pub/sub runtime.

---

## The four layers

| Layer | What | Where |
|-------|------|-------|
| **1. Registry** | Canonical list of every handoff in the framework | [`docs/handoff-registry.md`](handoff-registry.md) |
| **2. Schemas** | Zod definitions for the 2 high-stakes handoffs | [`schemas/handoffs/*.schema.ts`](../schemas/handoffs/) |
| **3. `produced_by` field** | Frontmatter annotation on every handoff artefact | every producing skill emits it |
| **4. `.meta.json` sidecars** | Structured payload alongside the prose artefact | written by producer, validated by producer + consumer |

---

## Layer 1 — Registry

The registry is a single markdown table enumerating every handoff (inter-phase + high-stakes intra-phase) with stakes level and schema reference. Maintained canonically at [`docs/handoff-registry.md`](handoff-registry.md). When a new handoff surfaces, the registry is updated first; downstream work (schema, skill wiring) references the registry row.

---

## Layer 2 — Zod schemas

Every high-stakes handoff has a schema at `schemas/handoffs/<id>.schema.ts`. The barrel at `schemas/handoffs/index.ts` exports a `HANDOFF_SCHEMAS` registry keyed by handoff id — the `coldpress validate-handoff` command (future Wave 3 block) will look up schemas by id.

**v1 whitelist** (from plan §3.8, resolved in registry Open Question #4):

| Handoff id | File | Covers |
|------------|------|--------|
| `prd-to-architecture` | `prd-to-architecture.schema.ts` | Architectural drivers, NFRs, constraints, out-of-scope. |
| `stories-to-implementation` | `stories-to-implementation.schema.ts` | File scope, test coverage target. |

Every schema:

- Has a `schema_version: z.literal(1)` field — bumping to `literal(2)` is a breaking migration, handled explicitly.
- Has a `produced_by` field pinned to the producing skill's id (so a rogue skill can't emit the wrong shape under a stolen identity).
- Has a `produced_at` ISO-8601 timestamp for provenance.
- Has a `project_slug` field — sanity-checked against `coldpress.yaml` on read.

Extending to new high-stakes handoffs: add a row to the registry, add a schema file + barrel export, ship tests (one valid + one invalid fixture minimum).

---

## Layer 3 — The `produced_by` convention

Every artefact emitted by a subagent handoff carries `produced_by` in its frontmatter (for markdown) or metadata header (for structured formats):

```yaml
---
artefact: "Product Requirements Document"
produced_by: "create-prd"
produced_at: "2026-04-23T15:00:00Z"
---
```

This field:

- **Routes downstream consumers.** A subagent receives multiple possible inputs in its context; filtering by `produced_by` lets it pick the right one deterministically. (Port of MetaGPT's `cause_by` routing.)
- **Disambiguates duplicates.** If a PRD and a draft-PRD both exist, the consumer knows which to trust.
- **Enables audit trails.** The registry + `produced_by` = complete provenance chain for every artefact.

**Scope for Block L:** the convention is documented. Per-skill emission is wired in Wave 4 Lifecycle Alignment — every producing-skill step-file gains an emission step; every consuming-skill step-file gains a `produced_by` filter check.

---

## Layer 4 — `.meta.json` sidecars

High-stakes producers emit two files in lockstep: the prose artefact (markdown) and the typed sidecar (JSON).

```
_context/sacred/prd.md           # human-readable, emitted by create-prd
_context/sacred/prd.meta.json    # machine-readable sidecar — typed, schema: prd-to-architecture
```

**The sidecar is not optional for high-stakes handoffs.** If the sidecar is missing or malformed, the phase transition to the consumer fails at the gate.

Sidecar content = Zod-validated payload matching the schema. Example for PRD:

```json
{
  "schema_version": 1,
  "produced_by": "create-prd",
  "produced_at": "2026-04-23T15:00:00Z",
  "project_slug": "my-project",
  "product_summary": "…",
  "architectural_drivers": [
    {
      "id": "AD-01",
      "statement": "Must support 10k concurrent users",
      "rationale": "Launch projections from PRD §4.",
      "priority": "critical"
    }
  ],
  "nfrs": [ … ],
  "constraints": [ … ],
  "out_of_scope": [ … ]
}
```

---

## Validation gate semantics

Validation failure is a **gate failure, not a warning**. This is the central strictness choice — without it, sidecars degrade into best-effort metadata that everyone stops trusting within a quarter.

**On write (producer):**

1. Skill produces the prose artefact.
2. Skill constructs the sidecar payload from its own work.
3. Skill runs `validateHandoff(id, payload)` (src/handoffs/validate.ts).
4. If validation fails, skill aborts before marking the phase step complete. User sees each issue with its path.
5. If validation passes, skill writes both files atomically.

**On read (consumer):**

1. Skill locates the expected sidecar alongside the prose artefact.
2. Skill runs `validateHandoff(id, sidecar)` again — paranoid revalidation protects against hand-edits to the sidecar.
3. If missing or invalid, skill aborts the phase transition. User is prompted to re-run the producer.
4. If valid, skill consumes the typed payload + the prose artefact.

**What's NOT in scope:**

- **No pub/sub.** Coldpress-os's DAG orchestrator already subsumes MetaGPT's broadcast-plus-local-filter model and is more auditable.
- **No auto-repair.** If the sidecar is malformed, the producer must fix it. The consumer does not guess.
- **No schema migration at the sidecar layer.** When a schema version bumps, existing sidecars carrying the old version fail validation — fix them by re-running the producer, not by in-place migration.

---

## Using `validateHandoff` programmatically

From a Node context (skill implementations, the future `coldpress validate-handoff` CLI command):

```ts
import { validateHandoff } from "@coldpress/core/handoffs";

const raw = JSON.parse(await fs.readFile("_context/sacred/prd.meta.json", "utf8"));
const result = validateHandoff("prd-to-architecture", raw);

if (!result.ok) {
  // Print issues at the gate, block the phase transition.
  for (const issue of result.issues) {
    console.error(`  [${issue.path}] ${issue.message}`);
  }
  process.exit(1);
}

// result.data is typed — TypeScript knows this is a PrdToArchitecture payload.
useArchitecturalDrivers(result.data.architectural_drivers);
```

The function never throws on validation failure; the caller decides how to surface errors.

---

## Extending — adding a new high-stakes handoff

1. Add a row to [`docs/handoff-registry.md`](handoff-registry.md). Fill all 8 columns. Set stakes = `high`, schema = `<new-id>.schema.ts`.
2. Create `schemas/handoffs/<new-id>.schema.ts`. Include `schema_version: z.literal(1)`, `produced_by: z.literal("<skill-id>")`, `produced_at: z.string().datetime()`, `project_slug`, plus the payload-specific fields.
3. Export from `schemas/handoffs/index.ts` barrel.
4. Add to `HANDOFF_SCHEMAS` registry object.
5. Ship tests in `test/handoffs/<new-id>.test.ts` — at least one valid fixture + one invalid fixture per required field.
6. Update the producing + consuming skills' step-files to emit + consume the sidecar (Wave 4 work if the skills already exist; this-wave work for new skills).
7. Version-bump `docs/handoff-registry.md` and this spec doc.

---

## See also

- [`docs/handoff-registry.md`](handoff-registry.md) — canonical handoff enumeration.
- [`schemas/handoffs/`](../schemas/handoffs/) — Zod schema source.
- [`src/handoffs/validate.ts`](../src/handoffs/validate.ts) — validation API.
- [`governance/sacred-docs.md`](../governance/sacred-docs.md) — complementary governance for *content* changes (handoff schemas protect *shape*).

---

## Orchestration context

> **Hello Butler.** Butler is coldpress-os's main orchestrator agent — your default Claude Code session running with `CLAUDE.md` as its directive. Butler dispatches the 8 Shape A subagents (analyst · architect · pm · ux-designer · developer · verifier · devops · reviewer) and runs the phase gates. The protocol / spec / schema documented above is invoked by Butler (or by a Butler-dispatched subagent) at the relevant phase. See [`butler.md`](butler.md) for the orchestrator reference and the canonical `Hello Butler` entry point.

