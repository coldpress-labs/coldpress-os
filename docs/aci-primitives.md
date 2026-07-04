---
name: aci-primitives
description: SWE-agent ACI command grammar ported as 4 discipline-encoding edit primitives — bounded steps + verifier feedback between operations
version: "1.0"
---

# ACI Primitives (§6.6)

> SWE-agent's *Agent-Computer Interface* keeps multi-step edit work tractable: small bounded operations with immediate verification feedback between them. The discipline matters more than the mechanics. Coldpress-os ports the **interface** (the bounded-step pattern) — not SWE-agent's Docker-sandbox runtime. Claude Code's existing tools provide the runtime; these skills add the discipline.

**Source decision:** plan §6.6 (oss-integration-survey-2026-04-22.md §2.2 — SWE-agent ACI command grammar).

---

## The four primitives

| Skill | Underlying tool | Discipline added |
|-------|-----------------|------------------|
| [`aci-edit`](../skills/edit/aci-primitives/aci-edit/) | `Edit` + `Bash` | One bounded edit + immediate verifier feedback (typecheck/lint) before next step. Two-fail escalation budget. |
| [`aci-scroll`](../skills/edit/aci-primitives/aci-scroll/) | `Read` (with offset/limit) | Bounded window + explicit cursor trailer — multi-step file walks don't recompute position. |
| [`aci-search-dir`](../skills/edit/aci-primitives/aci-search-dir/) | `Grep` | Capped result count + structured `file:line:snippet` shape — agent's next-prompt budget stays bounded. |
| [`aci-find-file`](../skills/edit/aci-primitives/aci-find-file/) | `Glob` | Capped result count + one-path-per-line shape — discovery doesn't drown the next prompt. |

All four live under [`skills/edit/aci-primitives/`](../skills/edit/aci-primitives/) per Block R's canonical-subfolder mapping.

---

## Why interface, not the runtime

SWE-agent ships its grammar inside a Docker sandbox with cursor-state persistence between commands. The sandbox lift would more than double our install footprint, and Claude Code's existing tools (Edit, Read, Grep, Glob, Bash) already cover the underlying mechanics.

We port:
- ✅ The bounded-step discipline (one edit at a time, not five)
- ✅ The verifier-feedback loop (typecheck after each edit)
- ✅ The two-fail escalation budget (no third corrective attempt; escalate)
- ✅ The cursor-explicit convention (every scroll emits `→ cursor at line N`)
- ✅ The result-cap convention (search/find never return unbounded)

We don't port:
- ❌ The Docker sandbox
- ❌ Cross-step state persistence in a separate runtime
- ❌ SWE-agent's specific command grammar tokens

Result: same discipline, native Claude Code tools, no new runtime dependency.

---

## When the orchestrator should dispatch ACI vs. raw tools

`@developer` and `@reviewer` use these primitives when:

- The work spans multiple sequential file operations.
- The output of one operation should inform the next.
- Premature termination of the loop matters (verifier-fail → stop and decide; don't blindly continue).

They use raw `Edit`/`Read`/`Grep`/`Glob` when:

- The operation is single-shot (one read, one write, done).
- The work is bulk-shaped (read a whole config; write a whole new file).
- The verification cost dominates the work (a 5-line CSS edit doesn't deserve a `tsc --noEmit` run).

The skills' `When to Use` and `When NOT to Use` sections codify the boundary per primitive.

---

## The two-fail escalation budget

Every ACI loop has a hard ceiling of **2 corrective attempts** at any single step:
1. First attempt fails verification → one corrective edit allowed.
2. Second attempt fails → escalate. No third attempt.

Escalation paths:
- Emit `<NEED_INFO>` per Block AA — typically `architecture-unclear` or `acceptance-criteria-unclear`.
- Hand back to @pm via the standard handoff protocol.
- For @reviewer: produce the rubric row as `status: fail, severity: high` with the verifier output as `evidence` — DO NOT keep iterating.

Why a hard cap: agents asked to "keep trying" on a stubborn failure rarely converge. The compute spent on corrective attempts past 2 is better spent escalating to a higher-context decision.

---

## Phase placement

These primitives are tagged for **Phases 6 (Implementation)** and **9 (Evolve)** in their SKILL.md frontmatter.

- **Phase 6:** @developer iterating on stories.
- **Phase 9:** @reviewer (Block EE 10th subagent) proposing remediations during evolution. Note: per the post-Phase-8-split, the original plan's "Phase 8 Evolve" became Phase 9 Evolve; the SKILL.md frontmatter reflects this.

---

## Example multi-step loop

A typical bug-fix loop using all four primitives:

1. `aci-find-file pattern:"src/**/auth.ts"` → locates the file.
2. `aci-search-dir pattern:"verifyToken" path:src/` → finds call sites.
3. `aci-scroll path:src/auth.ts cursor:42 windowSize:60` → reads the function body.
4. `aci-edit path:src/auth.ts change:"add early-return for missing token"` → bounded edit.
   - Verifier (typecheck) clean → continue.
   - Verifier fails → one corrective edit, re-verify.
   - Still fails → escalate via `<NEED_INFO>` `kind: architecture-unclear`.
5. `aci-search-dir pattern:"verifyToken" path:test/` → finds tests.
6. `aci-edit path:test/auth.test.ts change:"add early-return test case"` → bounded edit.
7. Done — total of 6 bounded steps with verification between code-touching steps.

---

## What's NOT in v1

- **Worktree primitive.** Multi-file refactors that need a shared in-memory worktree state would benefit from one; deferred until demand surfaces.
- **Cross-language verifier registry.** The `aci-edit` skill's per-extension verifier table is hand-curated; a richer auto-detection (read package.json scripts, infer from file content) is out of scope. Projects extend by editing the SKILL.md.
- **Diff-aware preview.** SWE-agent shows a diff preview before applying — Claude Code's `Edit` tool already does this implicitly via the user-permission step. No additional preview layer.
- **Replay / record.** ACI loops aren't recorded as a distinct artefact. The EventStream (§6.4) covers replay at the skill-invocation level if/when the orchestrator emits per-step events.

---

## See also

- [`reviewer-subagent.md`](reviewer-subagent.md) — Block EE; @reviewer is one of two ACI consumers.
- [`event-stream.md`](event-stream.md) — Block DD; ACI loop steps will become `skill-invoke` / `skill-result` event pairs once orchestrator integration ships.
- [`need-info-protocol.md`](need-info-protocol.md) — Block AA; the canonical escalation channel when ACI hits its 2-fail budget.
- [`checkpointer.md`](checkpointer.md) — Block HH §6.5 sibling.

---

## Orchestration context

> **Hello Butler.** Butler is coldpress-os's main orchestrator agent — your default Claude Code session running with `CLAUDE.md` as its directive. Butler dispatches the 8 Shape A subagents (analyst · architect · pm · ux-designer · developer · verifier · devops · reviewer) and runs the phase gates. The protocol / spec / schema documented above is invoked by Butler (or by a Butler-dispatched subagent) at the relevant phase. See [`butler.md`](butler.md) for the orchestrator reference and the canonical `Hello Butler` entry point.

