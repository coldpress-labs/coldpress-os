---
name: anthropic-skill-wrapping-audit
description: Audit of where coldpress-os delegates to Anthropic's canonical Agent Skills, with license hygiene notes
version: "1.0"
---

# Anthropic Skill Wrapping Audit

> Where coldpress-os delegates to Anthropic's canonical skills — by domain, by subagent, and by licence. Wrap rather than reimplement.

Anthropic ships a growing catalogue of first-party Agent Skills at [anthropics/skills](https://github.com/anthropics/skills). Where those skills overlap with coldpress-os's lifecycle, we wrap them via the Claude Code plugin marketplace rather than building parallel implementations.

---

## Delegation table

| Anthropic skill | Delegating subagent | License | Install command | coldpress-os stance |
|---|---|---|---|---|
| `docx`, `pdf`, `pptx`, `xlsx` | `@communicator` | **Source-available (NOT OSS)** | `/plugin install document-skills@anthropic-agent-skills` | Wrap via marketplace install. **Never vendor source.** |
| `mcp-builder` | `@architect` | Apache-2.0 | `/plugin install example-skills@anthropic-agent-skills` | Invoke when a project needs a bespoke MCP server. |
| `webapp-testing` | `@qa` | Apache-2.0 | `/plugin install example-skills@anthropic-agent-skills` | Invoke for Playwright E2E flows before building ad-hoc test rigs. |
| `skill-creator` | `@valet` | Apache-2.0 | `/plugin install example-skills@anthropic-agent-skills` | Reference as canonical meta-skill pattern. See bundled-agent note below. |
| `claude-api` | `@developer` | Apache-2.0 | `/plugin install example-skills@anthropic-agent-skills` | Invoke when a project builds against the Claude API directly. |

Two marketplace plugins cover all five skills:

- **`document-skills`** — `docx`, `pdf`, `pptx`, `xlsx`. Source-available licence; install via marketplace only, do not vendor source.
- **`example-skills`** — `mcp-builder`, `webapp-testing`, `skill-creator`, `claude-api`. Apache-2.0; source available at [anthropics/skills](https://github.com/anthropics/skills) for reference.

`coldpress init` prints the two install commands in the post-scaffold message, so every new project is set up with the same Anthropic skill coverage.

---

## License hygiene

The four document skills (`docx`, `pdf`, `pptx`, `xlsx`) are **source-available, not Apache-2.0**. This is the single most important license distinction to hold in mind: we may invoke them at runtime via the marketplace plugin, but we may **not**:

- Vendor their source into `@coldpress/core`.
- Redistribute their code alongside a coldpress-os release.
- Modify and republish.

For the source-available skills, wrap-via-marketplace-install is the only legally clean integration path. This stance does not weaken over time; even as Anthropic expands the document-skills catalogue, every new entry inherits the same licence and the same posture from us.

Everything else in Anthropic's `example-skills` set is Apache-2.0 — the usual permissive redistribution terms apply, though we still prefer marketplace install for consistency and update hygiene.

---

## Bundled-agent pattern — coldpress-os stance

Anthropic's canonical `skill-creator` skill ships with its own `agents/` subdirectory (`analyzer.md`, `comparator.md`, `grader.md`) — one skill with a mini-crew of helpers inside. This is valid per the Agent Skills spec and expressive for self-contained workflows.

**Coldpress-os flattens**. Our architecture is top-level subagents invoking flat skills; introducing a second agent layer inside skills fragments the dispatch model and makes subagent boundaries harder to reason about. When `@valet` scaffolds a new coldpress-os skill from a template that includes bundled-agent content, the expectation is:

- Fold helper-agent prompts into the skill body or `references/`.
- Preserve the functional capability; lose the nested agent layer.
- Document any unavoidable divergence here.

This is a coldpress-os-specific stance. Projects using coldpress-os can install bundled-agent skills from Anthropic's marketplace and use them as-is — we just don't generate them in our own corpus.

---

## Remaining skill overlap — not yet audited

Coldpress-os ships ~75 skills after the router collapse. This audit covers the five Anthropic skills with clear 1:1 delegation. A full sweep of remaining coldpress-os skills against Anthropic's expanding catalogue is pending — additions land here as they're confirmed. Expected candidates:

- Possible overlap with Anthropic's future testing / QA skills → `@qa`.
- Possible overlap with Anthropic's future CI/CD skills → existing `skills/ops/ci-cd-setup/` could delegate.
- Possible overlap with Anthropic's future documentation skills beyond the four formats → `@communicator`.

Audits are additive — when a new Anthropic skill ships, this doc gets a row, the relevant subagent `.md` gains an "External Skills" reference, and (if needed) the coldpress-os equivalent is retired or reframed as wrapper.

---

## Updating this doc

When adding a new wrapped Anthropic skill:

1. Check the upstream licence. If source-available, add a license-hygiene note explicitly.
2. Add the row to the delegation table above.
3. Update the relevant subagent's `.md` — add an entry under "External Skills".
4. If the install flow changes (new marketplace plugin, new command), update `src/commands/init.ts` post-message and this doc's install-command column together.
5. Update CHANGELOG under the unreleased section.
