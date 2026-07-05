# Agent Schema — coldpress-os (Shape A)

> Defines the format for all subagent definitions. Subagents are real Claude Code
> agents with independent context windows, defined in `.claude/agents/`. The
> canonical roster ships in `template/.claude/agents/` and is derived to
> `data/agents/agent-roster.csv`.

---

## The 8 subagents

Butler (the main session) dispatches these; each is a real Claude Code subagent
with its own context, tools, and model. (The v0.4 roster surgery retired `@qa`,
`@scrum-master`, `@communicator`, and `@valet` — see the note below.)

| Slug | Model | Primary Phases | Role |
|------|-------|----------------|------|
| `analyst` | sonnet | 2 | Research, idea validation, product brief |
| `architect` | opus | 3, 6 | Stack + walking skeleton; architecture + ADRs |
| `pm` | sonnet | 4, 7 | Slice-able PRD → contract stories (breakdown via `coldpress waves`) |
| `ux-designer` | sonnet | 5 | tokens.json, styleguide, budgets, ux-spec |
| `developer` | sonnet | 8 | One story at a time, plan mode; does not self-verify |
| `verifier` | sonnet | 8 | Clean-room, read-only; **Butler-dispatched only** |
| `devops` | sonnet | 9, 10 | Readiness, staged deploys, ops digests |
| `reviewer` | opus | 11 | Read-only retrospective; every claim cites a run-log event |

> **v0.4 roster surgery (do not resurrect):** `@qa` → `@verifier`;
> `@scrum-master` → `@pm` + `coldpress waves`; `@communicator` → forkable
> creative skills (Butler-owned); `@valet` → the framework-internal loop
> (`valet-loop` skill). These four are retired — never re-add them to live
> routing. The historical 19-persona BMAD/CIS/WDS files live at project level in
> `legacy/agents-archive/` and do not ship in the framework.

---

## File location

Subagent definitions live in the **project template** and are copied into each
consuming project by `coldpress init`:

```
coldpress-os/template/.claude/agents/
├── analyst.md        # Phase 2 — research, idea validation, product brief
├── architect.md      # Phases 3 + 6 — tech-stack, walking skeleton, architecture, ADRs
├── pm.md             # Phases 4 + 7 — PRD, contract stories (→ coldpress waves)
├── ux-designer.md    # Phase 5 — design tokens, styleguide, budgets, ux-spec
├── developer.md      # Phase 8 — dev-story (plan mode); does not self-verify
├── verifier.md       # Phase 8 — clean-room verification (Butler-dispatched only)
├── devops.md         # Phases 9 + 10 — readiness, deploy, operate
└── reviewer.md       # Phase 11 — retrospective (read-only, evidence-cited)
```

**Filename:** `{slug}.md` (e.g., `analyst.md`, `ux-designer.md`).

---

## Required format (Claude Code subagent)

Each file uses YAML frontmatter + a markdown system prompt:

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

### Frontmatter fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Slug identifier, matches filename |
| `model` | string | Yes | `sonnet`, `opus`, or `haiku` |
| `tools` | string[] | Yes | Claude Code tools this agent can use |
| `color` | string | No | Terminal display color |
| `maxTurns` | int | No | Max autonomous turns (default varies by model) |
| `effort` | string | No | Reasoning effort: `low`, `medium`, `high` |

### Model selection guide

| Model | Use When | Example Agents |
|-------|----------|----------------|
| `opus` | Deep reasoning, complex analysis, architecture + evidence-linked review | architect, reviewer |
| `sonnet` | Balanced — most agents | analyst, pm, ux-designer, developer, verifier, devops |
| `haiku` | Organizational tasks, tracking, formatting | (none by default) |

### Tool selection guide

| Tool Set | Use When | Example Agents |
|----------|----------|----------------|
| Read-only (`Read, Grep, Glob`) | Retrospective analysis | reviewer |
| Read + Bash (`Read, Grep, Glob, Bash`) | Analysis / verification with system access | analyst, architect, verifier |
| Full write (`Read, Grep, Glob, Bash, Edit, Write`) | Implementation, document production | developer, pm, ux-designer, devops |

---

## Required system-prompt sections

The markdown body of each subagent file should include:

1. **Role Statement** — one-line identity: "You are the [Role] — the project's [domain] authority."
2. **Consolidated Expertise** — expertise areas the agent owns.
3. **Lifecycle Mapping** — table of phases, roles, and key skills.
4. **Context You Need** — files/artifacts to read first ("Always read" vs "Read when available").
5. **Artifacts You Produce** — table of outputs with file locations.
6. **Boundaries** — what this agent does NOT do and who to defer to.
7. **Mode Awareness (if applicable)** — multiple operating modes; Butler sets the mode via the task prompt.
8. **Handoff Protocol** — what to report on completion and what to recommend next.

---

## Anti-patterns

- **No duplicate definitions.** Each subagent exists in exactly one file.
- **No embedded skills.** Agents reference skills by path; they don't contain skill logic.
- **No cross-agent communication.** Agents return results to Butler, who orchestrates. Agents do not call other agents directly.
- **No runtime config in agent files.** Mode and configuration are passed by Butler in the task prompt. Project-level agent config lives in `coldpress.yaml`.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0 | 2026-07-05 | Butler (WS11 S3.5) | Rewritten to the v0.4 **8-subagent** roster (analyst, architect, pm, ux-designer, developer, verifier, devops, reviewer). Removed the pre-surgery 11-agent file tree, the "Nine Subagents" merges table, and the retired `@qa`/`@scrum-master`/`@communicator`/`@valet` from the model/tool guides. Added the roster-surgery note. Relocated from `agents/_schema.md` (which shipped a stale schema in npm) to `docs/agent-schema.md`; the now-empty `agents/` dir was dropped from `files:` + `frameworkDirs`. |
| 2.0 | 2026-04-13 | ColdPress Labs | v2 schema — Claude Code subagent format. 19 personas → 9 real subagents. Documented frontmatter, model/tool selection, system-prompt structure. |
| 1.0 | 2026-04-07 | ColdPress Labs | Initial agent schema — unified format from BMAD/MAO/CIS/WDS analysis. |
