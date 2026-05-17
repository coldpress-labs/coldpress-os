# Stack Pack Authoring Guide — coldpress-os

> How to create a pluggable technology-specific skill set for coldpress-os. Uses the Convex pack as a worked example.

---

## What Is a Stack Pack?

A stack pack is an **archetype-keyed** set of skills for a class of projects — not a technology-keyed bundle. Each pack targets a project shape (product type × domain complexity × functional profile) and pre-picks a coherent starting stack. Packs are starting points: every decision can be overridden, and the framework's universal skills cover whatever the pack does not.

When `stack_pack` is set in `coldpress.yaml`, Butler dispatches the pack's `quickstart` skill during env-provision (Phase 3 Step 6), and generates pack-specific skill wrappers in `.claude/skills/` via `coldpress update --post-phase-3`.

Stack packs are optional — a project without a pack takes the generic install path in env-provision. Packs add archetype-specific setup, sensible defaults, and out-of-box baseline coverage.

**v0.3 starter pack library:**

| Pack | Archetype fit | Key pre-picks | Baselines out-of-box |
|------|--------------|---------------|---------------------|
| `vibe-coder-fullstack` | Full-stack web app, saas, consumer product | Next.js + Convex + Clerk + Vercel + Tailwind | accessibility, security |
| `static-single-page` | Marketing landing, portfolio, single-page brochure | Astro + Cloudflare Pages + Tailwind | seo_aeo_llm, accessibility, security, future_proof |
| `static-multipage-blog` | Content site, blog, marketing with blog | Astro + Vercel + MDX + Tailwind | seo_aeo_llm, accessibility, future_proof |
| `cli-npm-publishable` | CLI tool, library, npm package | tsup + Vitest + GitHub Actions + changesets | security, future_proof |
| `browser-extension` | Chrome/Firefox extension | WXT + TypeScript + Tailwind + Vitest | security, future_proof |

Pack archetype matching runs in `stack-discovery-sync` Step 2b — scores each pack against Phase 2 evidence signals and proposes the best match. See `schemas/pack.schema.json` for the `pack.yaml` format spec.

---

## Anatomy of a Stack Pack

```
skills/stack-packs/{pack-name}/
├── quickstart/                    # Setup + scaffolding
│   ├── SKILL.md
│   ├── workflow.md
│   └── steps/
│       ├── step-01-*.md
│       └── step-02-*.md
├── {skill-2}/                     # Technology-specific skill
│   ├── SKILL.md
│   └── ...
├── {skill-3}/
│   └── ...
└── README.md                      # Pack overview (optional)
```

Each skill inside the pack follows the same schema as any coldpress-os skill (`skills/_schema.md`). There's nothing special about pack skills — they're just organized under `stack-packs/{pack-name}/`.

---

## Reference: The `vibe-coder-fullstack` Pack

The `vibe-coder-fullstack` pack (archetype: full-stack web app, vibe-coder building a product) is the reference implementation with 5 skills. Its backend pre-pick is Convex, encoded in `pack.yaml pre_picked.backend`.

```
skills/stack-packs/vibe-coder-fullstack/
├── pack.yaml              # Archetype fit + pre_picked + baselines_out_of_box
├── quickstart/            # Phase 3 — Scaffold a Next.js + Convex + Clerk project
├── setup-auth/            # Phase 6 — Configure Clerk + Convex Auth integration
├── create-component/      # Phase 6 — Build a Convex-powered feature
├── migration-helper/      # Phase 6 — Schema migrations and data transforms
└── performance-audit/     # Phase 8 — Audit Convex query performance
```

The quickstart skill runs during env-provision (Phase 3 Step 6) when `stack_pack: "vibe-coder-fullstack"` is set. It is dispatched by `env-provision` Step 0's pack branch, not Phase 1 Bootstrap.

### Why These 5?

| Skill | Rationale |
|-------|-----------|
| **quickstart** | Every project needs initial setup. Runs once in env-provision (Phase 3 Step 6). |
| **setup-auth** | Auth is always needed and stack-specific. Avoids generic advice. |
| **create-component** | The most common implementation task. Provides Convex-idiomatic patterns. |
| **migration-helper** | Schema changes are stack-specific and error-prone. Guided safety. |
| **performance-audit** | Stack-specific performance patterns that generic tools miss. |

---

## Step-by-Step: Creating a New Stack Pack

### Step 1: Plan Your Skills

Start with 3-5 skills that cover the critical stack-specific moments. A good minimal pack:

| Skill | Phase | Purpose |
|-------|-------|---------|
| **quickstart** | 1 (Bootstrap) | Initial setup, dependencies, configuration |
| **{core-operation}** | 6 (Implementation) | The most common dev task on this stack |
| **{audit}** | 8 (Evolve) | Performance or health check specific to this stack |

You can always add more later. Start small, ship, iterate.

### Step 2: Create the Directory

```bash
mkdir -p coldpress-os/skills/stack-packs/{your-pack}/quickstart/steps
```

### Step 3: Write SKILL.md for Each Skill

Follow the schema in `skills/_schema.md`. Example for a Supabase quickstart:

```yaml
---
name: "quickstart"
description: "Set up Supabase in a new coldpress-os project"
type: "workflow"
category: "stack-packs"
agent: "architect"
phases: [1]
inputs:
  - "coldpress.yaml"
  - "_context/sacred/tech-stack.md"
outputs:
  - artifact: "Supabase project configuration"
    location: "supabase/config.toml"
    format: "toml"
version: "1.0"
---

## Purpose

Initializes Supabase in the project: installs the CLI, creates the project, sets up local development, and configures environment variables.

## When to Use

- Starting a new project with `stack_pack: "supabase"` in coldpress.yaml
- Migrating an existing project to Supabase

## Prerequisites

- Phase 1 (Bootstrap) completed — project structure exists
- `coldpress.yaml` has `stack_pack: "supabase"`

## Process

This skill follows a multi-step guided workflow.

→ See [workflow.md](workflow.md) for the full process.

## Output

- `supabase/` directory with local config
- `.env.local` with Supabase connection strings
- Updated `_context/sacred/tech-stack.md` with Supabase details
```

### Step 4: Write workflow.md (for Workflow Skills)

```yaml
---
workflow_version: "1.0"
output_file: "supabase/config.toml"
total_steps: 3
resume_from: "frontmatter"
---

## Overview

Sets up Supabase for local development and production deployment.

## Step Index

| Step | File | Description |
|------|------|-------------|
| 1 | step-01-install.md | Install Supabase CLI and create project |
| 2 | step-02-schema.md | Initialize database schema and types |
| 3 | step-03-env.md | Configure environment variables |

## Execution Rules

1. **Load one step at a time.** Never read ahead.
2. **Complete each step fully** before proceeding.
3. **Halt at menus.** When a step presents options, wait for user input.
4. **No skipping.** Every step exists for a reason.
5. **State is tracked** in the output document's YAML frontmatter.
6. **Resumable.** On interruption, resume from the last completed step.
7. **User input required.** Never generate content without user confirmation or input.

## Completion Criteria

- Supabase CLI installed and project linked
- Initial schema created with types generated
- Environment variables configured for local and production
```

### Step 5: Write Step Files

Each step file follows `docs/step-file-spec.md`:

```yaml
---
step_number: 1
step_name: "Install and Create"
step_goal: "Install the Supabase CLI and create/link a Supabase project"
halts_for_input: true
next_step: "step-02-schema.md"
---

## Goal

Install the Supabase CLI and either create a new project or link an existing one.

## Instructions

1. Check if Supabase CLI is installed: `supabase --version`
2. If not installed, install it: `npm install -g supabase`
3. Ask the user: Create a new Supabase project or link an existing one?

## User Interaction

**Question:** Do you want to:
- **(A)** Create a new Supabase project
- **(B)** Link an existing Supabase project

[Wait for user input]

## Output

- Supabase CLI installed
- Project created/linked
- `supabase/` directory initialized

## Navigation

→ Next: [step-02-schema.md](step-02-schema.md)
```

### Step 6: Register in REGISTRY.md

Add your pack to the Skills by Category section in `coldpress-os/REGISTRY.md`:

```markdown
### Stack Packs — Supabase (3)
| Skill | Directory | Type | Phases |
|-------|-----------|------|--------|
| quickstart | `skills/stack-packs/supabase/quickstart/` | workflow | 1 |
| crud-generator | `skills/stack-packs/supabase/crud-generator/` | workflow | 6 |
| performance-audit | `skills/stack-packs/supabase/performance-audit/` | simple | 8 |
```

### Step 7: Author `pack.yaml`

Every pack must include a `pack.yaml` at the pack root, validated against `schemas/pack.schema.json`:

```yaml
name: your-pack-name            # kebab-case; must match directory name
archetype_fits:
  product_types: [...]           # product types this pack serves
  domain_complexity: [...]       # low | medium | high
  functional_profile: [...]      # descriptors that match the archetype
pre_picked:                      # technology decisions pre-made by this pack
  frontend: "..."
  backend: "..."
  # ... other areas
overrideable: true               # always true — packs are starting points
baselines_out_of_box:            # baselines addressed without extra env-provision work
  - seo_aeo_llm
  - accessibility
quickstart_skill: "skills/stack-packs/your-pack-name/quickstart"
```

### Step 8: Test It

1. Set `stack_pack: "your-pack"` in a test project's `coldpress.yaml`
2. Regenerate stack-pack wrappers: `coldpress update --post-phase-3` (or invoke `generateStackPackWrappers` programmatically)
3. Verify wrappers appear in `.claude/skills/`
4. Run each skill end-to-end
5. Verify outputs land in the right locations

---

## Configuration Integration

When a project sets `stack_pack`, three things happen:

1. **`coldpress update --post-phase-3`** regenerates skill wrappers including pack skills in `.claude/skills/`
2. **env-provision Step 0 branches** to the pack's `quickstart_skill` instead of the generic install path
3. **coldpress.yaml overrides** become available for pack-specific configuration:

```yaml
# coldpress.yaml
stack_pack: "vibe-coder-fullstack"

baselines:
  accessibility:
    status: "confirmed"
    covered_by_pack: true
  security:
    status: "confirmed"
    covered_by_pack: true
  seo_aeo_llm:
    status: "confirmed"
    covered_by_pack: false
  future_proof:
    status: "confirmed"
    covered_by_pack: false
```

Skills in your pack read `coldpress.yaml` for project-specific configuration — pack name, baselines block, and any pack-specific overrides defined in the pack's own namespace.

---

## Guidelines

1. **Follow the schema.** Every skill must conform to `skills/_schema.md`. No exceptions.
2. **Don't duplicate universal skills.** If a universal skill already covers the task (e.g., `code-review`), don't recreate it in your pack. Only add stack-specific skills.
3. **Reference data assets.** If your pack needs shared data (e.g., best practices, patterns), put it in `data/` and reference it — don't embed it in skill files.
4. **Start with 3 skills.** You can always grow. A quickstart, a core operation, and an audit cover the critical moments.
5. **Name consistently.** Use kebab-case. Match the naming patterns of existing packs.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.1 | 2026-04-24 | ColdPress Labs | Phase II Part 3 Wave 6. All 5 packs fully authored on disk: static-single-page, static-multipage-blog, cli-npm-publishable, and browser-extension quickstart step files completed; browser-extension pack (WXT + MV3 + Tailwind + Vitest + GitHub Actions .zip/.xpi release) added. Guide reflects complete v0.3 pack library. |
| 2.0 | 2026-04-24 | ColdPress Labs | Phase II Part 3 Wave 5.3. "What Is a Stack Pack" reframed as archetype-keyed library: v0.3 5-pack table added (vibe-coder-fullstack, static-single-page, static-multipage-blog, cli-npm-publishable, browser-extension); pack-match discovery note added. Reference section renamed from "Convex Pack" to "vibe-coder-fullstack Pack" with Phase 3 quickstart dispatch note. Step 7 (pack.yaml authoring) added before Step 8 (test). Configuration integration updated for three-action model (post-phase-3 CLI + env-provision branch + baselines block). |
| 1.0 | 2026-04-13 | ColdPress Labs | Initial stack pack guide — anatomy, Convex reference, step-by-step creation, Supabase example |
