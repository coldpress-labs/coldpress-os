---
step: 2
name: "Module Assessment"
skill: legacy-assessment
agent: architect
---

# Step 2 — Module Assessment

## Purpose

For each confirmed legacy module: identify technology, language, framework, and key dependencies. Compare against `tech-stack.md` locked decisions to produce a compatibility verdict.

---

## Inputs

- `_input/legacy/{module}/` — files to assess (read-only; NEVER modified)
- `_context/sacred/tech-stack.md` — locked stack decisions
- Graph: prior legacy module nodes (if any prior assessment run)

---

## Actions

### 2.1 Per-module technology scan

For each module in the confirmed list from Step 1:

1. **Identify technology stack:**
   - Languages (from file extensions + package.json / requirements.txt / Cargo.toml / etc.)
   - Framework (from package.json `dependencies`, `import` patterns, config files)
   - Key dependencies (top 5–10 from dependency manifest)
   - Runtime requirements (Node version, Python version, etc.)

2. **Query graph** for any prior context on this module (if prior assessment run). Use prior context to augment — don't repeat analysis already logged.

3. **Compare against `tech-stack.md` locked decisions:**

For each dependency or technology found, check:
- Is this in the locked tech stack? → `compatible`
- Is this absent from the locked tech stack? → evaluate if conflicting or neutral
- Does this require a runtime, database, or infrastructure tier not in the locked stack? → `conflicting`
- Cannot determine from file scan alone → `unknown`

### 2.2 Produce per-module verdict

| Module | Technology | Key dependencies | Verdict | Notes |
|--------|------------|-----------------|---------|-------|
| `auth-module` | TypeScript / Node 18 | `passport`, `bcrypt`, `express-session` | conflicting | Tech-stack locks edge-only runtime; server sessions incompatible |
| `legacy-db-schema.sql` | PostgreSQL 14 | — | conflicting | Tech-stack locks Convex document model |
| `components/` | JavaScript / React 16 | `react@16`, `redux@4`, `styled-components` | conflicting | Tech-stack locks React 18 + Zustand + Tailwind |

Verdict values: `compatible` / `conflicting` / `unknown`.

### 2.3 Collect conflicts list

Produce a list of all `conflicting` or `unknown` modules for Step 3. `compatible` modules can proceed directly to Step 4 (no conflict resolution needed).

---

## Output

- Per-module assessment table (presented to user, recorded in `legacy-manifest.md` under `status: assessed`)
- Conflicts list forwarded to Step 3
- `compatible` modules forwarded directly to Step 4

---

## Mark partial-completion

Write `partial_completion: { skill: "legacy-assessment", step_id: "step-02" }` at start. Clear on clean exit.
