---
name: agent-skills-compatibility
description: Coldpress-os's relationship to the Anthropic Agent Skills ecosystem — compatible, complementary, not competing
version: "1.0"
---

# Agent Skills Compatibility

> **Coldpress-os is Agent Skills–compatible.** The `SKILL.md` files we emit to `plugin/skills/` conform to the [agentskills.io](https://agentskills.io/specification) spec. The Claude Code plugin marketplace can install coldpress-os as a plugin (`/plugin marketplace add coldpress-labs/coldpress-os`). We wrap Anthropic's first-party skills where they overlap with our subagent responsibilities. And coldpress-os's `.claude/` tree loads unchanged under both the Claude Code CLI and the `@anthropic-ai/claude-agent-sdk` programmatic runtime.

This doc is the one-surface reference for how coldpress-os fits into the Anthropic Agent Skills ecosystem — what's compatible, what's complementary, and what's deliberately different.

**Source decisions:**
- [anthropic-skills-analysis-2026-04-23.md](../../../lab-hq-projects/hq-p001-coldpress-os/docs/anthropic-skills-analysis-2026-04-23.md) — format / distribution / vocabulary strategy.
- [fourth-pass-oss-survey-2026-04-23.md §2.13](../../../lab-hq-projects/hq-p001-coldpress-os/docs/fourth-pass-oss-survey-2026-04-23.md) — Agent SDK compatibility declaration.

---

## Positioning

> **coldpress-os is Agent Skills-compatible and extends the Anthropic Skills ecosystem with an opinionated 9-phase SDLC methodology, sacred-doc governance, and multi-agent orchestration.**

Complementary, not alternative. Anthropic Agent Skills provides the atomic unit of capability (a skill) and the distribution layer (the plugin marketplace). Coldpress-os provides the **methodology** that wires skills into a full software-development lifecycle — subagents, phases, typed handoffs, sacred-doc protection.

---

## Three compatibility surfaces

### 1. Format — `SKILL.md` conformance

Coldpress-os keeps its richer internal step-file format as the source of truth (nested step files, multi-line inputs/outputs, stack-pack overrides). At build time, the SKILL.md generator (Wave 2 §2.10) emits a **spec-compliant SKILL.md per skill** to `plugin/skills/<name>/SKILL.md`:

```yaml
---
name: code-review
description: Review code changes with parallel review layers and structured triage
license: MIT
compatibility: Invoked by @qa in Phase 6
version: "1.0"
---
```

Every emitted SKILL.md conforms to the [agentskills.io](https://agentskills.io/specification) spec:
- `name` matches the parent dir, lowercase + hyphens only, ≤64 chars.
- `description` ≤1024 chars.
- `license`, `compatibility`, `allowed-tools`, `version` fields per spec.
- Body ≤500 lines per spec's progressive-disclosure guideline.

See [`docs/skill-md-generator-spec.md`](skill-md-generator-spec.md) for the field-mapping + validation rules.

**Why a build-time generator instead of writing spec-compliant SKILL.md directly?**

Coldpress-os's internal format carries rich metadata (inputs, outputs, step-file refs, stack-pack overrides, phase + agent attribution) that the Agent Skills spec intentionally excludes. Lowering source fidelity just to fit the spec would lose framework-level capabilities; build-artefact emission preserves both.

### 2. Distribution — plugin marketplace

```
/plugin marketplace add coldpress-labs/coldpress-os
/plugin install @coldpress/core
```

Installs the full coldpress-os skill library (~75 skills) as a Claude Code plugin. The marketplace reads `plugin/plugin.json` + the emitted `plugin/skills/` tree — both committed to the repo and kept in sync with source via the CI drift check (`git diff --exit-code plugin/`).

`plugin/plugin.json` carries metadata (name, version, description, homepage, repository, keywords) + auto-refreshed `skills_count`. See [`plugin/plugin.json`](../plugin/plugin.json).

### 3. Runtime — Claude Code CLI **and** Agent SDK

The `.claude/` tree coldpress-os scaffolds — 9 subagent definitions in `.claude/agents/*.md` + ~66 skill wrappers in `.claude/skills/*/SKILL.md` — loads unchanged under two runtimes:

- **Claude Code CLI** (`claude` in the terminal) — interactive dev-time.
- **`@anthropic-ai/claude-agent-sdk`** — programmatic, used for CI pipelines and automated workflows.

Regression coverage: `test/agent-sdk-compat.test.ts` asserts a compile-time mapping from coldpress-os's `Agent` shape onto the SDK's `AgentDefinition` type, plus runtime field-shape invariants (non-empty prompt, valid tool names, valid model aliases). Breaking SDK changes get caught at `npm run typecheck`.

---

## Wrap-don't-reimplement — the overlap policy

Anthropic ships first-party skills that overlap with specific coldpress-os subagent responsibilities. Coldpress-os wraps rather than reimplements. The delegation table (full version in [`docs/anthropic-skill-wrapping-audit.md`](anthropic-skill-wrapping-audit.md)):

| Anthropic skill | Delegating subagent | Licence | Action |
|----|----|----|----|
| `docx`, `pdf`, `pptx`, `xlsx` | `@communicator` | Source-available (not OSS) | Install via `document-skills@anthropic-agent-skills` plugin; never vendor source |
| `mcp-builder` | `@architect` | Apache-2.0 | Install via `example-skills@anthropic-agent-skills`; invoke when a project needs a bespoke MCP server |
| `webapp-testing` | `@qa` | Apache-2.0 | Install via `example-skills`; use for Playwright E2E flows |
| `skill-creator` | `@valet` | Apache-2.0 | Reference as canonical meta-skill pattern (bundled-agent pattern: flatten — see audit doc) |
| `claude-api` | `@developer` | Apache-2.0 | Install via `example-skills`; invoke when building against Claude API directly |

`coldpress init` prints the two `/plugin install` commands in the post-scaffold message — every new coldpress-os project starts with the full Anthropic companion skill set.

---

## Vocabulary — what coldpress-os adds on top of Agent Skills

| Concept | Agent Skills | Coldpress-os addition |
|---------|--------------|----------------------|
| **Skill** | Atomic capability unit. Anthropic spec. | Same. Coldpress-os skills ARE Agent Skills at the emission layer. |
| **Subagent** | Not in the spec. Runtime concept — Claude Code supports subagents via `.claude/agents/*.md`. | Coldpress-os ships **9 canonical subagents** with specific phase ownership + tool allowlists. |
| **Phase** | Not in the spec. | Coldpress-os ships a **9-phase SDLC** (Bootstrap → Discovery → Tech Stack → Planning → Breakdown → Implementation → Deployment → Operate → Evolve). Each phase has an entry gate + exit conditions. |
| **Sacred document** | Not in the spec. | Five governance-protected artefacts (`context.md`, `tech-stack.md`, `prd.md`, `architecture.md`, `pert-chart.md`) with formal change workflows. |
| **Typed handoff** | Not in the spec. | Four high-stakes inter-phase handoffs validated by Zod schemas on both write and read. |
| **Stack pack** | Not in the spec. | Pluggable skill set for a specific technology stack (Convex today). |

**Read:** coldpress-os's spine (subagents, phases, sacred docs, handoffs, stack packs) is **complementary** to Agent Skills — it builds on top of the atomic skill + distribution layer that Anthropic provides. A user can consume coldpress-os skills standalone via the plugin marketplace and ignore everything else; or they can opt into the full 9-phase lifecycle and get the governance layer on top.

---

## When to use coldpress-os vs raw Agent Skills

- **Just need a skill for a specific task?** Install the relevant Anthropic plugin (`docx`, `webapp-testing`, etc.) or browse the Anthropic skill catalogue. You don't need coldpress-os.
- **Need a full SDLC methodology with multi-agent dispatch + sacred-doc governance + typed handoffs?** Use coldpress-os — the 9-phase spine wraps the skills into a lifecycle.
- **Want both?** That's the design. Coldpress-os is Agent Skills–compatible: its skills are spec-compliant, available via the marketplace, and composable with any other Agent Skills–compatible tool.

---

## Coldpress-os in the `AGENTS.md` ecosystem

Beyond Anthropic's specific Agent Skills spec, coldpress-os is native in the broader `AGENTS.md` convention (the vendor-neutral agent-manifest file that Aider, Sourcegraph Cody, and others read). Every `coldpress init` emits an `AGENTS.md` at the project root alongside format-specific outputs for Cursor, Roo/Kilo, Cline, and OpenHands. See [`docs/interop-generator.md`](interop-generator.md) for the full matrix.

---

## See also

- [`docs/skill-md-generator-spec.md`](skill-md-generator-spec.md) — internal step-file → spec SKILL.md transform.
- [`docs/anthropic-skill-wrapping-audit.md`](anthropic-skill-wrapping-audit.md) — full delegation table + licence hygiene.
- [`docs/spec-plan-implement-review-mapping.md`](spec-plan-implement-review-mapping.md) — companion external-positioning doc vs Copilot Workspace.
- [`docs/interop-generator.md`](interop-generator.md) — AGENTS.md + Cursor + Roo + Cline + OpenHands emission.
- [`test/agent-sdk-compat.test.ts`](../test/agent-sdk-compat.test.ts) — runtime compatibility smoke test.
- [agentskills.io/specification](https://agentskills.io/specification) — authoritative Agent Skills spec.
