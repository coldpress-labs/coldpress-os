# Troubleshooting & FAQ — coldpress-os

> Common issues and their solutions. Check here before debugging from scratch.

---

## Installation & Setup

### "Claude doesn't see my skills"

**Symptoms:** You ask Claude to run a skill and it doesn't know what you're talking about.

**Causes & Fixes:**

1. **Wrappers not generated.** Run `coldpress update` from the project root to regenerate `.claude/skills/` wrappers.
2. **Wrong directory structure.** Wrappers must live at `.claude/skills/{skill-name}/SKILL.md` — check that the directory exists and contains a `SKILL.md` file.
3. **Framework files missing.** If `coldpress-os/` is absent from the project root, the scaffold was never completed. Re-run `coldpress init --retrofit` in the project directory to layer the framework in without clobbering existing files.
4. **CLAUDE.md missing or incomplete.** Butler reads `CLAUDE.md` on session start to learn about the framework. If it's missing or doesn't reference coldpress-os, Butler won't know skills exist. Re-run `coldpress init` (new project) or `coldpress init --retrofit` (existing project) from the target directory.

---

### "Framework out of date"

**Symptoms:** Skills reference files that don't exist, or new skills aren't available.

**Fix:**
```bash
npm update -g @coldpress/core   # pull the latest framework release
coldpress update                 # regen interop outputs in this project
```

`coldpress update` regenerates `AGENTS.md`, `.cursor/rules/`, `.roomodes`, `.openhands/microagents/`, and `.clinerules/` from the current `.claude/agents/`. Skill wrappers are refreshed on `coldpress init`; for a wrapper-only refresh in-place, re-run `coldpress init --retrofit` in the project directory (non-destructive).

---

### "coldpress.yaml not found"

**Symptoms:** Skills fail because they can't read project configuration.

**Causes & Fixes:**

1. **File doesn't exist.** `coldpress init` creates `coldpress.yaml` automatically. If you ended up with a project tree without it, either re-run `coldpress init --retrofit` in the directory (layers on top of existing files) or copy the template manually:
   ```bash
   cp coldpress-os/template/coldpress.yaml ./coldpress.yaml
   ```
   Then fill in your project details.

2. **File in wrong location.** `coldpress.yaml` must be at the project root (same level as `coldpress-os/` and `.claude/`). Not inside `docs/`, not inside `coldpress-os/`.

3. **Incomplete fields.** Some skills read specific fields (e.g., `stack_pack`, `agents.developer.mode`). If the skill errors on a missing field, open `coldpress.yaml` and fill in the relevant section.

---

## Subagents & Dispatch

### "Subagent dispatch fails"

**Symptoms:** Butler tries to dispatch to `@analyst` or another subagent and gets an error.

**Causes & Fixes:**

1. **Agent definition missing.** Check `.claude/agents/` has the agent file (e.g., `analyst.md`). If empty, re-run `coldpress init --retrofit` (non-destructive layering) to repopulate the template tree.
2. **Wrong agent slug.** Agent filenames must match their `name` field exactly. The 8 valid slugs are: `analyst`, `architect`, `pm`, `ux-designer`, `developer`, `verifier`, `devops`, `reviewer`.
3. **Model not available.** If the agent requires `opus` (like `architect`) and your Claude plan doesn't include it, change the model to `sonnet` in the agent file's frontmatter.

---

### "Subagent returns incomplete results"

**Symptoms:** A subagent runs but produces partial or shallow output.

**Causes & Fixes:**

1. **Context not provided.** Butler should pass relevant file paths in the task prompt. If the subagent doesn't know about `context.md` or the PRD, it can't produce good results. Check that Butler's dispatch includes the right files.
2. **maxTurns too low.** The agent may hit its turn limit before finishing. Increase `maxTurns` in the agent's frontmatter (default varies by model).
3. **Wrong mode.** If the analyst is in `brief` mode but you need a full interview, update `coldpress.yaml`:
   ```yaml
   agents:
     analyst:
       mode: "full"
   ```

---

## Sacred Documents & Governance

### "Governance blocks my edit"

**Symptoms:** You try to edit `context.md`, `tech-stack.md`, PRD, or `architecture.md` and Butler refuses or redirects.

**This is by design.** Sacred documents are protected because changes cascade through downstream artifacts. The fix is to use the change workflow:

| Document | Tell Claude |
|----------|-------------|
| context.md | "Run context change workflow" |
| tech-stack.md | "Run tech-stack change workflow" |
| PRD | "Run PRD change workflow" |
| architecture.md | "Run architecture change workflow" |

Each workflow guides you through: describe the change → impact analysis → downstream check → approval → execute → cascade → log.

**Emergency override:** For typos or factual corrections, tell Butler:
```
Override sacred doc protection for context.md
```
The change still gets logged in the document's version control panel.

---

### "When does a document become sacred?"

Documents are freely editable while being created. They become sacred the moment their producing workflow completes **and** you accept the result:

| Document | Becomes Sacred After |
|----------|---------------------|
| context.md | Phase 2 discovery workflow completes |
| tech-stack.md | Phase 3 stack-locking workflow completes |
| PRD | Phase 4 create-prd passes validation |
| architecture.md | Phase 4 create-architecture completes |

Before that, edit freely.

---

## Skills & Workflows

### "Which skill do I use?"

**Short answer:** Just describe what you want to do. Butler reads `coldpress-os/docs/decision-trees.md` and routes your intent to the right skill.

**Long answer:** The decision tree maps common intents:

| You say | Butler routes to |
|---------|-----------------|
| "I want to start a new project" | `coldpress init` (CLI) → Butler's `orient` → `intake` (Phase 1 in-session) |
| "Let's research the domain" | `domain-research` (Phase 2) |
| "Brainstorm ideas for..." | `brainstorming` (Phase 2) |
| "Pick a tech stack" | `stack-evaluation` → `stack-locking` (Phase 3) |
| "Create the PRD" | `create-prd` (Phase 4) |
| "Design the architecture" | `create-architecture` (Phase 4) |
| "Break this into stories" | `create-epics` → `create-stories` (Phase 5) |
| "Build this feature" | `dev-story` or `quick-dev` (Phase 6) |
| "Review this code" | `code-review` (Phase 8) |
| "Are we ready to deploy?" | `readiness-check` (Phase 9) |
| "How did the sprint go?" | `retrospective` (Phase 11) |

The full list is in `coldpress-os/REGISTRY.md` (~85 atomic skills + 67 lifecycle skills across 11 Shape A phases — built into ~128 spec-compliant `plugin/skills/` wrappers).

---

### "A workflow step seems stuck"

**Symptoms:** A multi-step workflow halts and doesn't present the next step.

**Causes & Fixes:**

1. **Waiting for your input.** Workflows halt at menus (A/P/C options). Check if it's waiting for you to choose.
2. **Step file not found.** The workflow's step index may reference a file that doesn't exist. Check the `steps/` directory inside the skill.
3. **Resume after interruption.** If the session was interrupted mid-workflow, tell Claude:
   ```
   Resume the {skill-name} workflow
   ```
   The workflow tracks state in the output document's YAML frontmatter and can resume from the last completed step.

---

### "Context window too large / slow responses"

**Symptoms:** Claude takes a long time to respond or complains about context length.

**Causes & Fixes:**

1. **Too many files loaded.** coldpress-os uses progressive disclosure — skills load one step-file at a time to keep context lean. If Butler loaded the entire skill directory, that's a bug in routing.
2. **Large output documents.** If `_context/` artifacts are very long, Butler may be reading them all into context. Ask Butler to read only the section it needs.
3. **Subagent accumulation.** Each subagent dispatch adds to the main session's context when it returns. For very long sessions, start a fresh Claude session and resume.

---

## Customization

### "I want to customize a skill"

Don't edit files inside `coldpress-os/` — it's read-only. Instead, replace the thin wrapper with a full skill definition:

1. Open `.claude/skills/{skill-name}/SKILL.md`
2. Replace the 3-line wrapper with a complete SKILL.md (use `coldpress-os/skills/_schema.md` for the format)
3. Your custom version takes precedence over the framework's

This way, when coldpress-os updates, your customization is preserved.

---

### "How do I add a new stack pack?"

See the [Stack Pack Authoring Guide](stack-pack-guide.md) for the full walkthrough. The short version:

1. Create `skills/stack-packs/{your-pack}/` with at least one skill
2. Each skill follows `skills/_schema.md`
3. Set `stack_pack: "your-pack"` in `coldpress.yaml`
4. Regenerate wrappers

The Convex pack (`skills/stack-packs/vibe-coder-fullstack/`) is the reference implementation with 5 skills.

---

### "How do I add a custom subagent?"

See the [Subagent Customization Guide](subagent-customization.md). The short version:

1. Create `.claude/agents/{slug}.md` following `agents/_schema.md`
2. Add the agent to Butler's routing table in `.claude/SYSTEM.md`
3. Reference it in relevant skills

---

## General

### "What's the difference between Butler and Alfred?"

| Agent | Level | Scope |
|-------|-------|-------|
| **Alfred** | Estate (labs-coldpress) | Sees all Labs and Projects. Routes cross-Lab work. |
| **Butler** | Project (your devSandbox) | Manages one project's lifecycle. Dispatches 8 subagents (Shape A). See [`butler.md`](butler.md) for the orchestrator reference. |

If you're working inside a project, you're talking to Butler. If you're working in the labs-coldpress repo itself, you're talking to Alfred.

---

### "Can I use coldpress-os without the three-tier pattern?"

Yes. The three-tier pattern (local root → devSandbox → app) is recommended but not required. Set `project.pattern: "b"` in `coldpress.yaml` for a single-repo setup. The framework works the same — it just means planning artifacts and production code live in the same repo.

---

### "How do I update coldpress-os without breaking things?"

```bash
# 1. Update the submodule
git submodule update --remote coldpress-os

# 2. Check what changed
cd coldpress-os && git log --oneline -10 && cd ..

# 3. Regenerate wrappers (picks up new/renamed skills)
# Tell Claude: "Regenerate skill wrappers"

# 4. Commit both
git add coldpress-os .claude/
git commit -m "update coldpress-os to latest"
```

Your customizations (full skill overrides, custom agents, coldpress.yaml) are never touched by updates — they live outside the submodule.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-04-14 | ColdPress Labs | Renamed mao-scaffold → agent-scaffold throughout. |
| 1.0 | 2026-04-13 | ColdPress Labs | Initial troubleshooting guide — 15 entries covering install, subagents, governance, skills, customization |
