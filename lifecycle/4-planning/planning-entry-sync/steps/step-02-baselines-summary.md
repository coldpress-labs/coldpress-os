---
step_number: 2
step_name: "Baselines Summary"
step_goal: "Load active baselines from coldpress.yaml and flag non-negotiable architectural constraints"
halts_for_input: false
next_step: "step-03-evidence-gaps.md"
partial_completion_id: "planning_entry_sync_step_02"
---

## Goal

Read the confirmed baselines from `coldpress.yaml` (written during Phase 3 stack-locking Step 5a) and translate each active baseline into a concrete architectural constraint. These constraints flow into the planning-scope memo and must be respected by `create-prd` NFRs and Phase 6 architecture.

## Instructions

### Load Baselines

1. From the `coldpress.yaml` cold read (loaded in Step 0), read the `baselines:` block:
   ```yaml
   baselines:
     seo_aeo_llm:
       status: "confirmed" | "opted-out"
       covered_by_pack: true | false
     accessibility:
       status: "confirmed" | "opted-out"
     security:
       status: "confirmed" | "opted-out"
     future_proof:
       status: "confirmed" | "opted-out"
   ```

2. Also query graph for baseline confirmation nodes (may include richer context than coldpress.yaml alone).

### Map Baselines to Constraints

3. For each confirmed baseline, derive the architectural constraint:

   | Baseline | Status | Architectural Constraint |
   |---------|--------|--------------------------|
   | `seo_aeo_llm` | confirmed | Semantic HTML mandatory; `public/llms.txt` required; sitemap plugin required; OG metadata on all pages; structured data where applicable |
   | `accessibility` | confirmed | WCAG 2.1 AA target; axe-core in CI; semantic HTML + ARIA; keyboard nav; colour contrast compliance; eslint-plugin-jsx-a11y |
   | `security` | confirmed | dependabot.yml required; no secrets in client-side code; CSP headers; auth handled by stack-pack pre-pick or dedicated service |
   | `future_proof` | confirmed | TypeScript strict mode required; no deprecated APIs; ESM-first modules; pin major deps, auto-update minors via dependabot |

4. For any opted-out baseline: record opt-out + rationale (from Phase 3 log). Flag if a PRD requirement later contradicts an opt-out — that triggers a re-entry prompt (covered in `create-prd` step-03).

### Partial Completion Write

5. Write `partial_completion: { step_id: "planning_entry_sync_step_02", at: "baselines_loaded" }` to `coldpress.yaml`.

## Output

- Active baselines enumerated: confirmed / opted-out per category
- Constraint list for each active baseline
- Opt-out rationale recorded for any opted-out category

## Navigation

→ Next: [step-03-evidence-gaps.md](step-03-evidence-gaps.md)
