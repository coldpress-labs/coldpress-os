# Stack Pack Authoring Guide — coldpress-os

> How to create a pluggable technology-specific skill set for coldpress-os. Uses the Convex pack as a worked example.

---

## What Is a Stack Pack?

A stack pack is a set of skills tailored to a specific technology stack (Convex, Supabase, Firebase, etc.). When a project sets `stack_pack: "convex"` in `coldpress.yaml`, Butler gains access to Convex-specific skills alongside the framework's universal skills.

Stack packs are optional. A project can use coldpress-os without any stack pack — the universal skills cover the full lifecycle. Stack packs add technology-specific depth.

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

## Reference: The Convex Pack

The Convex pack is the reference implementation with 5 skills:

```
skills/stack-packs/convex/
├── quickstart/            # Phase 1 — Set up Convex in a new project
├── setup-auth/            # Phase 6 — Configure Convex Auth
├── create-component/      # Phase 6 — Build a Convex-powered feature
├── migration-helper/      # Phase 6 — Schema migrations and data transforms
└── performance-audit/     # Phase 8 — Audit Convex query performance
```

### Why These 5?

| Skill | Rationale |
|-------|-----------|
| **quickstart** | Every project needs initial setup. Runs once in Phase 1. |
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
  - "docs/tech-stack.md"
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
- Updated `docs/tech-stack.md` with Supabase details
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

### Step 7: Test It

1. Set `stack_pack: "your-pack"` in a test project's `coldpress.yaml`
2. Regenerate wrappers (`agent-scaffold`)
3. Verify wrappers appear in `.claude/skills/`
4. Run each skill end-to-end
5. Verify outputs land in the right locations

---

## Configuration Integration

When a project sets `stack_pack`, two things happen:

1. **Wrapper generation** includes the pack's skills alongside universal skills
2. **coldpress.yaml overrides** become available:

```yaml
# coldpress.yaml
stack_pack: "supabase"

supabase:
  project_ref: "abc123"
  db_url: "postgresql://..."
```

Skills in your pack read these values from `coldpress.yaml` for project-specific configuration.

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
| 1.0 | 2026-04-13 | Alfred | Initial stack pack guide — anatomy, Convex reference, step-by-step creation, Supabase example |
