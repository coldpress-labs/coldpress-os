---
title: "Stack Pack — pack.yaml Format Spec"
version: "1.0"
date: "2026-04-24"
author: "Cadbury-hq"
---

# Stack Pack — `pack.yaml` Format Spec

Defines the `pack.yaml` frontmatter file that lives at the root of every stack pack directory. This file is the pack's identity card — used by `stack-discovery-sync` Step 2b for archetype matching, and by `stack-locking` Step 4 for yaml write-back.

For broader pack authoring guidance, see [stack-pack-guide.md](stack-pack-guide.md).
For the JSON schema that validates this format, see [schemas/pack.schema.json](../schemas/pack.schema.json) (Wave 4.11).

## File location

```
skills/stack-packs/{pack-name}/pack.yaml
```

`{pack-name}` must match the `name` field in the YAML (lowercase, hyphen-separated, no spaces).

## Full field reference

```yaml
# Required fields
name: string                       # Pack identifier. Pattern: ^[a-z0-9-]+$. Matches directory name.
archetype_fits:                    # Signals used by pack-match scoring (Step 2b)
  product_types: []                # Matching project types from data/classification/project-types.csv
  domain_complexity: []            # "low" | "medium" | "high" — from domain-complexity.csv
  functional_profile: []           # Functional keywords (free-form; matched by keyword overlap)
pre_picked:                        # Decision-area → chosen technology map
  {area}: string                   # Area names match data/stack-catalog/{area}.yaml
overrideable: true                 # v0.3 always true — any pre-picked choice can be swapped by user
baselines_out_of_box: []          # Baseline categories this pack provides without env-provision action
                                   # Values must be category keys from data/standards/baselines.yaml
quickstart_skill: string           # Path to the pack's quickstart skill (no trailing /)
                                   # Pattern: ^skills/stack-packs/.*/quickstart$
```

## Field details

### `name`

Lowercase, hyphen-separated identifier. Must match the parent directory name exactly and be unique across all packs.

```yaml
name: vibe-coder-fullstack   # ✓ matches skills/stack-packs/vibe-coder-fullstack/
name: Vibe Coder Fullstack   # ✗ spaces + uppercase — invalid
```

### `archetype_fits`

Three sub-fields used to score pack-match similarity in `stack-discovery-sync` Step 2b:

- **`product_types`** — strings from `data/classification/project-types.csv` `product_type` column. Use exact values from the CSV.
- **`domain_complexity`** — subset of `["low", "medium", "high"]`. A pack that fits `low + medium` will also be proposed for medium-complexity projects.
- **`functional_profile`** — free-form keywords describing the functional characteristics of projects this pack serves well. Examples: `"realtime"`, `"auth-heavy"`, `"database-backed"`, `"seo-first"`, `"mostly-static"`, `"publishable"`, `"manifest-v3"`. Butler matches these against project signals derived from product-brief + personas + constraint-research.

Match scoring threshold:
- **≥ 0.7 similarity** → strong match; proposed to user.
- **0.4–0.69** → partial match; proposed with explicit user confirmation required.
- **< 0.4** → no match; independent evaluation recommended.

### `pre_picked`

Map of decision-area → chosen technology string. Area keys should match `data/stack-catalog/{area}.yaml` filenames (without `.yaml`). Technology strings should match a `name` entry in the corresponding catalog file, but can also be free-form for areas not in the catalog.

```yaml
pre_picked:
  frontend: "Next.js"            # matches catalog entry
  backend: "Convex"              # backend not in v0.3 catalog — free-form OK
  auth: "Clerk"                  # matches catalog entry
  hosting: "Vercel"
  styling: "Tailwind"
  package_manager: "pnpm"
  source_control: "GitHub-private"
  testing: "Vitest + Playwright"
```

Not every decision-area needs to be covered. Areas omitted from `pre_picked` fall through to Tier-2 catalog evaluation.

### `overrideable`

Always `true` in v0.3. Every pre-picked choice can be overridden by the user during Phase 3. This field exists to make the policy explicit and allow future packs to declare non-overrideable choices (not supported in v0.3).

### `baselines_out_of_box`

List of baseline category keys (from `data/standards/baselines.yaml`) that this pack provides without any additional `env-provision` action. If a baseline is listed here, Butler notes it as "covered by pack" during Step 5a baselines confirmation.

Valid values (v0.3): `seo_aeo_llm` | `accessibility` | `security` | `future_proof`.

A baseline should be listed only if the pack's pre-picked stack genuinely provides meaningful coverage of that category without additional tooling. When in doubt, omit it — env-provision Step 3 will activate it normally.

```yaml
baselines_out_of_box:
  - accessibility   # ✓ pack uses Tailwind + Astro semantic HTML → real coverage
  - seo_aeo_llm     # ✓ pack uses Astro → static HTML + sitemap plugin ships in quickstart
```

### `quickstart_skill`

Path to the pack's quickstart skill directory, relative to the `coldpress-os/` root. No trailing slash.

```yaml
quickstart_skill: "skills/stack-packs/vibe-coder-fullstack/quickstart"
```

The quickstart skill at this path must have a `SKILL.md` that `env-provision` Step 0 can dispatch to.

## Minimal valid example

```yaml
name: static-single-page
archetype_fits:
  product_types: ["marketing-landing", "portfolio", "single-page-brochure"]
  domain_complexity: ["low"]
  functional_profile: ["mostly-static", "content-first", "no-backend"]
pre_picked:
  frontend: "Astro"
  hosting: "Cloudflare Pages"
  styling: "Tailwind"
  package_manager: "pnpm"
  source_control: "GitHub-private"
overrideable: true
baselines_out_of_box:
  - seo_aeo_llm
  - accessibility
  - security
  - future_proof
quickstart_skill: "skills/stack-packs/static-single-page/quickstart"
```

## Pack discovery

`stack-discovery-sync` discovers packs at runtime by globbing `skills/stack-packs/*/pack.yaml`. Any directory under `skills/stack-packs/` that contains a `pack.yaml` is automatically available for matching. No registry update required — drop a new directory with a valid `pack.yaml` to add a pack.

## Schema validation

`validate-schema` routes `skills/stack-packs/*/pack.yaml` → `schemas/pack.schema.json` (Wave 4.11). Run during `stack-locking` Step 4 when confirming a pack and during CI on any pack YAML change.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | ColdPress Labs | Initial spec. All fields documented. Match scoring thresholds. baselines_out_of_box guidance. Pack discovery note. Schema reference. |
