---
name: agent-sdk-compatibility
description: How @coldpress/core stays compatible with the wider TS-agent ecosystem — Claude Agent SDK type-conformance and Vercel AI SDK tool-signature convention
version: "1.0"
---

# Agent SDK Compatibility

> Coldpress-os ships its own custom DAG orchestrator (rationalised in [oss-integration-survey-2026-04-22.md](../../../lab-hq-projects/hq-p001-coldpress-os/docs/oss-integration-survey-2026-04-22.md)). Surveyed TS agent frameworks (Mastra, AgentKit, LangGraph.js, VoltAgent, BeeAI, LlamaIndex.TS) all had blockers — incompatible licensing (Mastra ELv2), excessive dep surface (LangGraph.js → LangChain), or over-engineering for our session-scoped use. But the broader ecosystem has settled on conventions; this doc tracks where we adopt them.

---

## 1. Claude Agent SDK — type conformance (Wave 2 §2.13)

The 9-subagent template under `template/.claude/agents/*.md` conforms to `AgentDefinition` from `@anthropic-ai/claude-agent-sdk` at both compile-time and runtime.

- **Compile-time:** `toAgentDefinition()` mapper in `src/interop/agents.ts` accepts a parsed agent file and returns an `AgentDefinition`. Breaks loud on required-field regressions.
- **Runtime:** `test/agent-sdk-compat.test.ts` asserts every shipped agent has non-empty description, prompt, valid model alias, valid tool names. No live API calls — credential-free CI.

**Dev dep:** `@anthropic-ai/claude-agent-sdk@^0.2.118`. Production package does NOT depend on the SDK; the type conformance gives interop optionality without coupling.

**Block EE addition (10th subagent):** with `@reviewer` shipped, the SDK conformance test suite asserts 10 agents instead of 9. Dynamic agent-file discovery means no SDK-mapper code change.

---

## 2. Vercel AI SDK tool-signature convention (Wave 6 §6.9)

The TS-agent ecosystem has converged on this canonical tool shape:

```ts
import { tool } from "@coldpress/core";
import { z } from "zod";

const greet = tool({
  description: "Greet someone by name",
  parameters: z.object({ name: z.string() }),
  execute: async ({ name }) => `hi ${name}`,
});
```

Same shape across **Vercel AI SDK** (MIT, `vercel/ai`), **Mastra** (ELv2 — incompatible licensing for us to depend on, but the *shape* is portable), **AgentKit**, and several smaller SDKs.

Coldpress-os adopts the **shape**, not the **dependency**. `tool()` ships at `src/tool-signature/index.ts` as a thin identity wrapper. Two responsibilities:

1. Stamp a `@coldpress-os:tool-signature-v1` marker so reflective code can detect coldpress-built tools.
2. Validate `parameters` is a `z.object(...)` at the top level — fails loud on `z.string()`, primitives, arrays, or non-Zod inputs. Tool pickers expect a keyed argument map.

```ts
import { isTool, tool, TOOL_SIGNATURE_MARKER } from "@coldpress/core/tool-signature";
isTool(greet); // true
greet._marker;  // "@coldpress-os:tool-signature-v1"
```

### Why the shape, not the dep

- **Licensing:** Mastra is ELv2 (source-available, NOT OSI-approved); we never depend on it. Vercel AI SDK is MIT but pulls a heavy provider/runtime surface we don't need for a session-scoped DAG orchestrator.
- **Interop value:** consumers using duck-typing (the dominant pattern across these SDKs) see a compatible object. They invoke `parameters.safeParse(args)` then `execute(parsed)` — coldpress-built tools work out of the box.
- **Custom-DAG decision reaffirmed:** adopting a *convention* gives interop ROI without inheriting another framework's lifecycle. Plan §6.9 source decision.

### When to use `tool()`

Anywhere `@coldpress/core` exposes a tool-shaped primitive to third-party code. Today: nothing exposed publicly. Future surface candidates:
- A `@coldpress/sdk` package (post-v1.0) exposing skill metadata as Vercel-shaped tools so external agents can dispatch coldpress-os skills.
- Plugin-marketplace skill-tool wrappers.

For internal-only orchestration plumbing, plain TypeScript functions remain idiomatic — `tool()` is for the public boundary.

### Adoption checklist

When a new public tool-shaped primitive lands:
1. Author it via `tool({ parameters, execute, description? })`.
2. Export it from a stable entry-point (e.g., `@coldpress/core/sdk`).
3. Test the shape lands as expected (see `test/tool-signature.test.ts` for the contract).
4. Document the tool's contract in this doc's §3 (tool inventory; empty in v1).

### What's NOT in this convention

- **No tool execution runtime.** `tool()` defines the shape; execution is the caller's responsibility. Coldpress-os doesn't ship an executor for Vercel-shaped tools (Vercel AI SDK does that itself).
- **No streaming results.** `execute` returns `Promise<R>` (or `R`). Streaming is Vercel-specific (`generateObject` / `streamText` semantics) and out of scope.
- **No tool-discovery API.** Reflective discovery is consumer responsibility (use `isTool()` if you need to filter coldpress-built tools out of a mixed registry).

---

## 3. Tool inventory

_Empty for v1._ As public tool-shaped primitives land they'll be tabled here with their parameters / output / stability promise.

---

## See also

- [`reviewer-subagent.md`](reviewer-subagent.md) — sibling §6.2 deliverable in Block EE.
- [`agent-skills-compatibility.md`](agent-skills-compatibility.md) — Anthropic Agent Skills spec compatibility (separate from this doc — covers the SKILL.md emission shape).
- [`anthropic-skill-wrapping-audit.md`](anthropic-skill-wrapping-audit.md) — license-hygiene table for wrapping external skills.

---

## Orchestration context

> **Hello Butler.** Butler is coldpress-os's main orchestrator agent — your default Claude Code session running with `CLAUDE.md` as its directive. Butler dispatches the 8 Shape A subagents (analyst · architect · pm · ux-designer · developer · verifier · devops · reviewer) and runs the phase gates. The protocol / spec / schema documented above is invoked by Butler (or by a Butler-dispatched subagent) at the relevant phase. See [`butler.md`](butler.md) for the orchestrator reference and the canonical `Hello Butler` entry point.

