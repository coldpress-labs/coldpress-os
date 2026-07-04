---
name: interop-generator
description: Generator that emits agent-format outputs for Cursor, Roo/Kilo, Cline, OpenHands, and AGENTS.md from a single coldpress-os source of truth
version: "1.0"
---

# Interop Generator

> Coldpress-os's canonical subagent definitions live in `.claude/agents/*.md`. The interop generator translates those into the five adjacent formats so the same project feels native in any `AGENTS.md`-aware agent, Cursor, Roo / Kilo, Cline, and OpenHands — without forking the source of truth across tools.

Source of truth: `.claude/agents/<slug>.md` (Claude Code subagent format).

Run the generator with:

```bash
coldpress update
```

`coldpress init` runs it automatically as its final step.

---

## Outputs

| Output | Path | Purpose |
|--------|------|---------|
| `AGENTS.md` | repo root | Vendor-neutral "what agents live here" — consumed by Aider, Sourcegraph Cody, any `AGENTS.md`-aware tool |
| `.cursor/rules/<slug>.mdc` | one per subagent | Cursor 2025 `.mdc` rule format |
| `.cursorrules` | repo root | Legacy Cursor fallback — 15-20 lines pointing at `CLAUDE.md` + sacred docs |
| `.roomodes` | repo root | Roo / Kilo `customModes[]` YAML |
| `.openhands/microagents/<slug>.md` | one per subagent | OpenHands repo-type microagents |
| `.clinerules/00-project-context.md` | | Cline project context (Roo / Kilo also read this) |
| `.clinerules/10-sacred-docs.md` | | Cline sacred-docs guardrail |

With 9 subagents in the template, a fresh `coldpress init` produces **23 interop files**.

---

## Managed-file marker

Every generated file begins with the marker `@coldpress-os:managed` (as a `# ` comment). This is the Projen-style convention: `coldpress update` checks for the marker before overwriting.

- File does not exist → generator writes (first-generation).
- File exists with the marker → generator overwrites (safe regeneration).
- File exists without the marker → generator skips and logs a warning. The user has taken ownership; the generator does not clobber it.

The marker check applies to single-file outputs (`AGENTS.md`, `.roomodes`, `.cursorrules`). Per-subagent directories (`.cursor/rules/`, `.openhands/microagents/`, `.clinerules/`) are overwritten wholesale — protecting one file in these dirs would break the guarantee that "all agents are consistent with the source of truth." If you need to diverge for a specific subagent, fork the source `.claude/agents/<slug>.md`; the generator will re-emit the divergence downstream.

---

## Tool translation table

Claude Code tool allowlists → Roo / Kilo `customModes[].groups`:

| Claude tool | Roo group |
|-------------|-----------|
| `Read`, `Grep`, `Glob`, `LS` | `read` |
| `Edit`, `Write`, `MultiEdit`, `NotebookEdit` | `edit` (with `fileRegex: ".*"` default) |
| `Bash` | `command` |
| `WebFetch`, `WebSearch` | `browser` |
| `Task`, `Agent` | `mcp` |

Unknown tools are silently dropped; the generator surfaces a warning listing the unmapped set so you know coverage gaps exist.

`.cursor/rules/*.mdc` uses the 2025 frontmatter schema:

```yaml
---
description: "When this rule activates"
alwaysApply: false
---
```

Cursor decides when to activate the rule from the description; coldpress-os does not set glob scope by default because the 9 subagents are semantic (research vs. implementation vs. review) rather than path-scoped. Users can tighten scope post-generation — but any edit invalidates the managed marker and disables regeneration for that file.

OpenHands microagent frontmatter is fixed:

```yaml
---
name: <slug>
type: repo
agent: CodeActAgent
---
```

---

## Extending the generator

New output format? Add a writer under `src/interop/<format>.ts` that exports a `write<Format>({ targetDir, agents })` function. Wire it into `runInterop` in `src/interop/index.ts` and add coverage to `test/interop.test.ts`.

New tool mapping? Extend `CLAUDE_TO_ROO` in `src/interop/tool-map.ts`. Add a test in `test/interop.test.ts` (see the existing `tool-map` suite).

---

## Orchestration context

> **Hello Butler.** Butler is coldpress-os's main orchestrator agent — your default Claude Code session running with `CLAUDE.md` as its directive. Butler dispatches the 8 Shape A subagents (analyst · architect · pm · ux-designer · developer · verifier · devops · reviewer) and runs the phase gates. The protocol / spec / schema documented above is invoked by Butler (or by a Butler-dispatched subagent) at the relevant phase. See [`butler.md`](butler.md) for the orchestrator reference and the canonical `Hello Butler` entry point.

