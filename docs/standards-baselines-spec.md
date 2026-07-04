---
title: "Standards Baselines Spec"
version: "1.0"
date: "2026-04-24"
author: "Cadbury-hq"
---

# Standards Baselines Spec

Documents the shape and consumer contract of `data/standards/baselines.yaml` — the framework's default-on cross-cutting quality standards layer.

## File location

```
coldpress-os/data/standards/baselines.yaml
```

## Purpose

`baselines.yaml` defines four default-on quality categories that every coldpress-os project is expected to confirm during Phase 3 stack-locking. Each category carries:

- The default status (`on`)
- A set of automated **checks** (what is verified)
- A list of **env_provision_actions** (what `env-provision` Step 3 installs/configures when the category is confirmed)
- A **phase_9_deploy_gate** rule (block or warn at deploy time)

Categories are not prescriptive about *how* to pass the checks — they are prescriptive about *what* the checks are. The env_provision_actions are framework-appropriate suggestions, not requirements.

## Top-level shape

```yaml
version: "1.0"

categories:
  {category_key}:
    label: string          # Human-readable name
    default: "on"          # All v0.3 categories are default-on
    description: string    # Multi-line prose
    checks: []             # Automated check names (snake_case identifiers)
    env_provision_actions: # What env-provision Step 3 does when category is confirmed
      - install: string    # Package installs (framework-appropriate)
      - config: string     # Config file mutations
      - ci: string         # CI configuration additions
      - hook: string       # Pre-commit hook additions
      - template: string   # Template file generation
      - scaffold: string   # Scaffold file generation
    phase_9_deploy_gate: string  # "block-on-*" or "warn-on-*" identifier

user_overrides:
  allow_opt_out_per_category: bool
  require_confirmation_at_phase_3: bool
  log_location: string     # Path template for audit log
```

## v0.3 categories

| Key | Label | Phase 9 Gate |
|-----|-------|-------------|
| `seo_aeo_llm` | SEO + AEO + LLM compatibility | block on missing llms.txt / sitemap / robots |
| `accessibility` | Accessibility (WCAG 2.2 AA baseline) | warn on a11y regression |
| `security` | Security protocols | block on high-severity audit failures |
| `future_proof` | Future-proof tooling | warn on CWV regression |

All four are `default: "on"`. Users may opt out per-category with a rationale at Phase 3 stack-locking Step 5a.

## How phases consume baselines.yaml

| Phase | Step | What happens |
|-------|------|-------------|
| Phase 3 `stack-discovery-sync` Step 2b | Pack-match | Pack's `baselines_out_of_box` array is surfaced against these categories. |
| Phase 3 `stack-evaluation` Step 2 | Rubric | Catalog entries' `baselines_compat` field scored against category keys. |
| Phase 3 `stack-locking` Step 5a | Baselines confirmation | User confirms / opts-out per category; each decision logged append-only. |
| Phase 3 `stack-locking` Step 4 | Sacred lock | `coldpress.yaml baselines:` block written. |
| Phase 3 `env-provision` Step 3 | Baselines activation | For each confirmed category, `env_provision_actions` are applied. |
| Phase 9 deploy gate | Evaluation | `phase_9_deploy_gate` rule fires per confirmed category. |

## `coldpress.yaml baselines:` block

Written by `stack-locking` Step 4. Shape per category:

```yaml
baselines:
  seo_aeo_llm:
    status: "confirmed"          # confirmed | opted-out | confirmed-with-override
    covered_by_pack: true        # true | false | partial
    opted_out_at: null           # ISO timestamp or null
    rationale: null              # Required if opted-out; null otherwise
    overrides: {}                # Optional override map (e.g. { es_target: "ES2023" })
  accessibility:
    status: "confirmed"
    covered_by_pack: partial
    opted_out_at: null
    rationale: null
    overrides: {}
  security:
    status: "confirmed"
    covered_by_pack: false
    opted_out_at: null
    rationale: null
    overrides: {}
  future_proof:
    status: "confirmed-with-override"
    covered_by_pack: false
    opted_out_at: null
    rationale: null
    overrides:
      cwv_lcp_threshold: "2.0s"
```

## Schema

`schemas/baselines.schema.json` (Wave 4.11) validates both:
1. The `data/standards/baselines.yaml` source file (full validator).
2. The `coldpress.yaml baselines:` block shape (partial — subset validator).

## Extending baselines post-v0.3

Add a new category key at the top level of `categories:`. The contract:
- Provide `label`, `default`, `description`, `checks`, `env_provision_actions`, `phase_9_deploy_gate`.
- If the category is not `default: "on"`, it is opt-in and will not appear in the Phase 3 confirmation loop unless enabled.
- No Phase 3 code changes required — the confirmation loop reads categories dynamically from this file.

---


---

## Orchestration context

> **Hello Butler.** Butler is coldpress-os's main orchestrator agent — your default Claude Code session running with `CLAUDE.md` as its directive. Butler dispatches the 8 Shape A subagents (analyst · architect · pm · ux-designer · developer · verifier · devops · reviewer) and runs the phase gates. The protocol / spec / schema documented above is invoked by Butler (or by a Butler-dispatched subagent) at the relevant phase. See [`butler.md`](butler.md) for the orchestrator reference and the canonical `Hello Butler` entry point.
### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | ColdPress Labs | Initial spec. Four v0.3 categories documented. Phase consumption table. coldpress.yaml block example. Schema notes. |
