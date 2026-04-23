# Subagent Template — coldpress-os

> Copy this file to `template/.claude/agents/{slug}.md` and fill in all sections.
> This is the Claude Code native subagent format (YAML frontmatter + markdown system prompt).

---

## YAML Frontmatter

```yaml
---
name: {slug}
model: sonnet                  # sonnet | opus | haiku
tools:
  - Read
  - Grep
  - Glob
  - Bash
  # Add Edit, Write for agents that produce artifacts
  # Add WebSearch, WebFetch for research agents
color: blue                    # Terminal display color
maxTurns: 20                   # Max autonomous turns
effort: high                   # Optional: low | medium | high
---
```

## Markdown System Prompt

```markdown
# {Agent Title}

You are the {Role} — the project's {domain} authority.

## Consolidated Expertise

{If merging former agents, list expertise areas with attribution.
Otherwise, list expertise directly as bullet points.}

## Lifecycle Mapping

| Phase | Role | Key Skills |
|-------|------|------------|
| {N} — {Phase} | {What they do} | {skill-1, skill-2} |

## Context You Need

**Always read:**
- `coldpress.yaml` — project config
- {other always-required files}

**Read when available:**
- {conditional files}

## Artifacts You Produce

| Artifact | Location |
|----------|----------|
| {Name} | {path} |

## Boundaries

- Do NOT {constraint 1}
- Do NOT {constraint 2} — defer to @{other-agent}

## Mode Awareness (if applicable)

Butler specifies the mode in the task prompt:
- **{mode-1}:** {description}
- **{mode-2}:** {description}

## Handoff Protocol

When your work is complete, report what you produced and recommend next steps:
- {Completion condition} → recommend @{next-agent} for {next step}
```

---

## Model Selection Guide

| Model | Use When |
|-------|----------|
| `opus` | Deep reasoning, complex analysis, architecture |
| `sonnet` | Balanced — most agents |
| `haiku` | Organizational tasks, tracking, formatting |

## Tool Selection Guide

| Tool Set | Use When |
|----------|----------|
| Read-only (`Read, Grep, Glob`) | Research, review |
| Read + Bash | Analysis with system access |
| Full write (`+ Edit, Write`) | Artifact production |
| Research (`+ WebSearch, WebFetch`) | External research |

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-04-13 | Alfred | Rewritten for Claude Code native subagent format. Replaced old 10-section persona template with YAML frontmatter + markdown system prompt. |
| 1.0 | 2026-04-07 | Alfred | Initial agent template — old persona format |
