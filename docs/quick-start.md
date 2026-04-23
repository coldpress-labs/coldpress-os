# Quick Start — Your First 10 Minutes with coldpress-os

> Zero to a running project in 10 minutes. This guide assumes you have Claude Code installed and a terminal open.

---

## Prerequisites

| Requirement | Check |
|-------------|-------|
| **Claude Code** | Installed and authenticated (`claude` works in terminal) |
| **Git** | Installed (`git --version` returns 2.x+) |
| **A project idea** | Even a vague one — the framework will help you refine it |

No paid services required. coldpress-os is a local framework — it runs entirely through Claude Code and git.

---

## Minute 0-2: Create Your Project Repo

```bash
# Create your devSandbox (the dev environment where all planning + code lives)
mkdir my-project-devSandbox
cd my-project-devSandbox
git init
```

**Why "devSandbox"?** coldpress-os uses a three-tier pattern: your local root (credentials, env files), the devSandbox (all development), and optionally an app repo (production code only). The devSandbox is where coldpress-os lives.

---

## Minute 2-3: Add coldpress-os

```bash
# Option A: Git submodule (recommended for real projects)
git submodule add https://github.com/coldpress-labs/coldpress-os.git coldpress-os

# Option B: Local copy (for testing or when the repo isn't published yet)
cp -r /path/to/coldpress-os ./coldpress-os
```

Verify it's there:

```bash
ls coldpress-os/
# You should see: agents/  data/  docs/  governance/  install/  lifecycle/
#                  orchestrator/  skills/  templates/  REGISTRY.md  README.md
```

---

## Minute 3-6: Run Project Init

Open Claude Code in your project directory:

```bash
claude
```

Then tell Claude:

```
Run coldpress-os project-init
```

The init workflow walks you through 4 steps:

| Step | What Happens | Your Input |
|------|-------------|------------|
| **1. Gather** | Collects project details | Name, slug, type, domain, stack pack |
| **2. Scaffold** | Creates directory structure | Confirm the structure looks right |
| **3. Submodule** | Configures coldpress-os path | Confirm submodule/copy location |
| **4. Config** | Generates `coldpress.yaml` | Review and approve the config |

When it's done, your project looks like this:

```
my-project-devSandbox/
├── coldpress-os/              # Framework (READ-ONLY)
├── .claude/
│   ├── SYSTEM.md              # Butler's directive
│   ├── agents/                # 9 subagent definitions
│   │   ├── analyst.md
│   │   ├── architect.md
│   │   ├── communicator.md
│   │   ├── developer.md
│   │   ├── pm.md
│   │   ├── qa.md
│   │   ├── scrum-master.md
│   │   ├── ux-designer.md
│   │   └── valet.md
│   └── skills/                # Thin wrappers (generated next)
├── docs/                      # Project-specific documents
├── _context/                   # Artifacts (planning, design, testing, etc.)
├── coldpress.yaml             # Your project config
└── CLAUDE.md                  # Framework routing for Claude
```

---

## Minute 6-7: Generate Skill Wrappers

Still in Claude Code:

```
Run agent-scaffold
```

This generates thin wrappers in `.claude/skills/` — one for each of the 65+ skills in coldpress-os. Each wrapper is 3 lines pointing to the canonical skill in the submodule.

Verify:

```bash
ls .claude/skills/
# You should see directories like: brainstorming/ code-review/ create-prd/
# dev-story/ pre-project-interview/ stack-evaluation/ ...
```

Each wrapper looks like:

```markdown
---
name: "brainstorming"
description: "Facilitate structured brainstorming sessions"
---
Read and follow coldpress-os/skills/creative/brainstorming/SKILL.md
```

---

## Minute 7-9: Run Your First Skill

The natural first skill is the **pre-project-interview** — it creates your `context.md`, the foundational document everything else builds on.

```
Run pre-project-interview
```

Butler dispatches the **@analyst** subagent, who will:

1. Ask you structured questions about your project (vision, users, constraints, domain)
2. Use elicitation techniques from `data/methods/elicitation-methods.csv`
3. Produce `docs/context.md` — your first sacred document

This takes 5-15 minutes depending on how detailed your answers are. Take your time — everything downstream depends on this.

---

## Minute 9-10: Verify Everything Works

Run a quick check:

```
What skills are available?
```

Butler should read `coldpress-os/REGISTRY.md` and list all available skills organized by lifecycle phase.

Try dispatching a subagent directly:

```
Ask @architect to review the project structure
```

If Butler dispatches the architect subagent and you see it running in a separate context window — you're fully operational.

---

## What's Next?

You've completed **Phase 1 (Bootstrap)**. The lifecycle continues:

| Next Phase | What to Do | Tell Claude |
|------------|-----------|-------------|
| **Phase 2: Discovery** | Deep research on your domain | "Run domain-research" or "Run market-research" |
| **Phase 3: Tech Stack** | Evaluate and lock your stack | "Run stack-evaluation" |
| **Phase 4: Planning** | Create PRD, architecture, UX spec | "Run create-prd" |
| **Phase 5: Breakdown** | Break into epics and stories | "Run create-epics" |
| **Phase 6: Implementation** | Build feature by feature | "Run dev-story" |

Each phase builds on the previous one's outputs. The decision trees in `coldpress-os/docs/decision-trees.md` help Butler route your intent to the right skill.

---

## Key Things to Know

1. **Butler is your main contact.** You talk to Butler (the main Claude session). Butler dispatches work to the 9 subagents as needed. You don't need to manage subagents directly.

2. **Sacred documents are protected.** Once `context.md`, `tech-stack.md`, PRD, architecture, or PERT chart are finalized, they're governed. Changes go through change workflows (`governance/`), not direct edits.

3. **coldpress-os is read-only.** Never edit files inside the `coldpress-os/` directory. Your customizations go in `.claude/`, `coldpress.yaml`, and your project's own directories.

4. **Skills are the atomic unit.** Everything you ask Claude to do maps to a skill. Skills are self-contained — each has its own instructions, steps, and references.

5. **Modes change behavior.** Your `coldpress.yaml` configures how subagents operate (e.g., developer: standard vs quick, qa: rapid vs strategic). Change modes there, not in agent definitions.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-13 | Alfred | Initial quick-start guide — 10-minute walkthrough from zero to running project |
