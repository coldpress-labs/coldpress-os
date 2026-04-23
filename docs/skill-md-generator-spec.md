---
name: skill-md-generator-spec
description: Build-time generator that emits Agent Skills spec-compliant SKILL.md files from coldpress-os's internal rich-frontmatter format
version: "1.0"
---

# SKILL.md Generator Spec

> Coldpress-os keeps its internal step-file format (rich frontmatter, verbose inputs/outputs declarations, phase/agent metadata) as the source of truth. The generator transforms this into spec-compliant SKILL.md files at `plugin/skills/<name>/SKILL.md` for Agent Skills marketplace distribution — same pattern as the interop generator in `docs/interop-generator.md`.

Source: [`src/generators/skill-md-generator.ts`](../src/generators/skill-md-generator.ts)
Run: `npm run build:skills`
Output: `<repo>/plugin/skills/<name>/SKILL.md` + `<repo>/plugin/plugin.json` (skill count + timestamp refreshed).

---

## Input

- `<repo>/skills/**/SKILL.md` — atomic skills (categorised).
- `<repo>/lifecycle/*/*/SKILL.md` — phase-attached skills.

Source frontmatter is coldpress-os's internal rich shape:

```yaml
---
name: "code-review"
description: "Review code changes with parallel review layers and structured triage"
type: "workflow"
category: "reviews"
phases: [6]
inputs:
  - "code diff (staged, uncommitted, branch, or commit range)"
outputs:
  - artifact: "Code Review Report"
    location: "_context/audit/code-review-{date}.md"
version: "1.0"
---
```

---

## Output

Spec-compliant per [agentskills.io/specification](https://agentskills.io/specification):

```yaml
---
name: code-review
description: Review code changes with parallel review layers and structured triage
license: MIT
compatibility: Phase 6
version: "1.0"
---
```

### Field mapping

| Source (rich) | Emitted (spec) | Transform |
|---------------|----------------|-----------|
| `name` | `name` | Passthrough. Validated against `/^[a-z][a-z0-9-]*$/`, ≤64 chars, must match parent-dir name. |
| `description` | `description` | Passthrough. Validated against ≤1024 chars. |
| *(always)* | `license: MIT` | Constant — coldpress-os is MIT. |
| `agent` + `phase` / `phases[0]` | `compatibility` | Built as "Invoked by @{agent} in Phase {N}" / "Phase {N}" / "Invoked by @{agent}" / "Reusable across phases". |
| `tools[]` | `allowed-tools` | Space-separated. Experimental per spec status — flagged in output. |
| `version` | `version` | Passthrough. |
| `type`, `category`, `inputs`, `outputs`, `phases` | *(dropped)* | Internal-only; not carried into spec frontmatter. |

### Body preservation

The markdown body after the frontmatter block is passed through unchanged (trimmed of leading/trailing whitespace). A warning is emitted if body length exceeds 500 lines — the spec's progressive-disclosure guideline.

---

## Validation

Errors (block emission for that skill):

- `name-empty` — no name field.
- `name-too-long` — name exceeds 64 chars.
- `name-format` — name contains non-lowercase / non-hyphen / non-digit characters.
- `description-empty` — no description field.
- `description-too-long` — description exceeds 1024 chars.

Warnings (emission proceeds):

- `name-parent-mismatch` — skill name doesn't match parent directory.
- `body-too-long` — body exceeds 500 lines. Move detail to `references/` (not yet wired).

---

## Skipping

- **Routers.** Skills with `type: "router"` delegate to a canonical atomic skill via `routes_to`. The generator skips them — the emitted `plugin/skills/` tree contains only the canonical atomic entries.
- **Duplicates.** If two source SKILL.md files declare the same `name`, first-wins (iteration order: `skills/` before `lifecycle/`). The later copy logs as skipped.
- **Validation errors.** Skills with fatal validation issues log as skipped; the run still completes and emits the rest.

---

## `plugin.json`

Lives at `<repo>/plugin/plugin.json` and is refreshed by the generator with two dynamic fields:

- `skills_count` — number of spec-compliant SKILL.md files emitted.
- `generated_at` — ISO-8601 UTC timestamp of the last generation.

The generator preserves every other field in the manifest verbatim, so hand-authored fields (name, version, description, homepage, repository, keywords) survive regeneration. If `plugin.json` doesn't exist, the generator creates a minimal one — populate the full set before committing.

---

## CI integration

Planned for Block K:

1. CI step: `npm run build:skills` on every PR.
2. CI assertion: `git diff --exit-code plugin/` — fails if committed `plugin/` drifts from source.
3. CI validation: `skills-ref validate` against every emitted SKILL.md (external Anthropic tool) — blocks merge on validation failure.

Until the CI wiring lands in Block K, contributors run `npm run build:skills` locally before committing and visually inspect the diff.

---

## Extending

- **New field mapping**: edit `toSpecFrontmatter` in [`src/generators/skill-spec.ts`](../src/generators/skill-spec.ts). Add a unit test in `test/skill-md-generator.test.ts`.
- **New validator**: add to `skill-spec.ts` (`validateXxx` helpers return `ValidationIssue[]`), then wire into `generatePluginSkills` in the generator.
- **Alternate output location**: pass a different `outputDir` to `generatePluginSkills({ outputDir })`. The build-skills entry point is a thin wrapper.
