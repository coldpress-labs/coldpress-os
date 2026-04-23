# Agent Schema — coldpress-os v2

> Defines the format for all subagent definitions. Subagents are real Claude Code agents with independent context windows, defined in `.claude/agents/`.

---

## Architecture Change (v2)

**Before (v1):** 19 prompt-persona `.md` files in `coldpress-os/agents/`. These were costume changes — same Claude session with different system prompt snippets. No real multi-agent orchestration.

**After (v2):** 9 consolidated subagent definitions in `coldpress-os/template/.claude/agents/`. These are real Claude Code subagents — each runs with its own context window, tools, and model. Butler (the main session) dispatches work to them via `@mention` or the Agent tool.

**Legacy personas:** The 19 deprecated BMAD/CIS/WDS persona files were moved out of the framework entirely in the v0.1 cleanup (Decision #20 in the estate DECISIONS-LOG). They now live at project level in `hq-p001-coldpress-os/legacy/agents-archive/` with per-file `origin:` frontmatter preserved for future subagent-evolution work. They do not ship in the public framework.

---

## File Location

Subagent definitions live in the **project template** and are copied into each consuming project during `project-init`:

```
coldpress-os/template/.claude/agents/
├── analyst.md
├── pm.md
├── ux-designer.md
├── architect.md
├── developer.md
├── qa.md
├── scrum-master.md
├── communicator.md
└── valet.md
```

**Filename:** `{slug}.md` (e.g., `analyst.md`, `ux-designer.md`)

---

## Required Format (Claude Code Subagent)

Each file uses YAML frontmatter + markdown system prompt:

```yaml
---
name: analyst
model: sonnet          # sonnet | opus | haiku
tools:
  - Read
  - Grep
  - Glob
  - Bash
color: blue            # Terminal display color
maxTurns: 20           # Max autonomous turns before returning
effort: high           # Optional: reasoning effort level
---

# Agent Title

System prompt content in markdown. This IS the agent's instructions.
```

### Frontmatter Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Slug identifier, matches filename |
| `model` | string | Yes | `sonnet`, `opus`, or `haiku` |
| `tools` | string[] | Yes | Claude Code tools this agent can use |
| `color` | string | No | Terminal display color |
| `maxTurns` | int | No | Max autonomous turns (default varies by model) |
| `effort` | string | No | Reasoning effort: `low`, `medium`, `high` |

### Model Selection Guide

| Model | Use When | Example Agents |
|-------|----------|----------------|
| `opus` | Deep reasoning, complex analysis, architecture decisions | architect |
| `sonnet` | Balanced — most agents | analyst, pm, developer, qa, communicator, valet |
| `haiku` | Organizational tasks, tracking, formatting | scrum-master |

### Tool Selection Guide

| Tool Set | Use When | Example Agents |
|----------|----------|----------------|
| Read-only (`Read, Grep, Glob`) | Research, analysis, review | scrum-master |
| Read + Bash (`Read, Grep, Glob, Bash`) | Analysis with system access | analyst, architect |
| Full write (`Read, Grep, Glob, Bash, Edit, Write`) | Implementation, document production | developer, pm, qa |

---

## Required System Prompt Sections

The markdown body of each subagent file should include:

### 1. Role Statement
One-line identity: "You are the [Role] — the project's [domain] authority."

### 2. Consolidated Expertise
If the agent merges former personas, list the expertise areas with attribution. Otherwise, list expertise directly.

### 3. Lifecycle Mapping
Table of phases, roles, and key skills.

### 4. Context You Need
What files/artifacts to read before beginning work. Split into "Always read" and "Read when available."

### 5. Artifacts You Produce
Table of outputs with file locations.

### 6. Boundaries
Explicit constraints — what this agent does NOT do and who to defer to.

### 7. Mode Awareness (if applicable)
If the agent has multiple operating modes (e.g., developer: standard/quick), document them and specify that Butler sets the mode via the task prompt.

### 8. Handoff Protocol
What to report when work is complete and what to recommend next.

---

## The Nine Subagents

| Slug | Merges | Model | Primary Phases |
|------|--------|-------|----------------|
| `analyst` | vera, moxie, nova, leni, iggy, crux | sonnet | 2, 4 |
| `pm` | rex | sonnet | 4, 5 |
| `ux-designer` | iris, lyla | sonnet | 4 |
| `architect` | arch, crux (tech) | opus | 3, 4 |
| `developer` | cody, blitz | sonnet | 6 |
| `qa` | abby, zane | sonnet | 6, 7 |
| `scrum-master` | atlas | haiku | 5, 8 |
| `communicator` | granger, quill, kai | sonnet | 4, 8 |
| `valet` | valet | sonnet | meta |

---

## Anti-Patterns

- **No duplicate definitions.** Each subagent exists in exactly one file.
- **No embedded skills.** Agents reference skills by path, they don't contain skill logic.
- **No cross-agent communication.** Agents return results to Butler, who orchestrates. Agents do not call other agents directly.
- **No runtime config in agent files.** Mode and configuration are passed by Butler in the task prompt. Project-level agent config lives in `coldpress.yaml`.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-04-13 | Alfred | v2 schema — Claude Code subagent format. 19 personas → 9 real subagents. Documented frontmatter, model/tool selection, system prompt structure. |
| 1.0 | 2026-04-07 | Alfred | Initial agent schema — unified format from BMAD/MAO/CIS/WDS analysis |
