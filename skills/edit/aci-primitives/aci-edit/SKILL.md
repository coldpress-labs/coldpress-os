---
name: "aci-edit"
description: "Bounded edit primitive — single-purpose edit + post-edit verification feedback (typecheck/lint) before the next step"
type: "simple"
category: "edit"
agent: "developer"
phases: [6, 9]
tools: ["Read", "Edit", "Bash"]
inputs:
  - "target file path"
  - "single, bounded change description (one symbol / one block)"
outputs:
  - artifact: "Edited file + post-edit verification report"
    location: "(in-place edit)"
    format: "text"
version: "1.0"
---

## Purpose

Port SWE-agent's *Agent-Computer Interface* edit primitive (interface, not Docker-sandbox runtime). Each edit is **bounded** — one symbol, one block, one canonical change — followed by **immediate verification feedback** (typecheck / lint / test-run for the touched file) BEFORE the next step. The feedback feeds the agent's next prompt; bad edits get one shot at correction; persistent failure escalates.

The discipline matters more than the mechanics. Agents that batch many edits before checking degrade silently when one breaks; ACI inverts that — small steps, fast feedback, fail-loud.

**Source decision:** plan §6.6 (oss-integration-survey-2026-04-22.md §2.2 — SWE-agent ACI command grammar).

## When to Use

- @developer during Phase 6 Implementation when editing existing code (NOT for new-file authoring; that's `@developer` direct).
- @reviewer during Phase 9 Evolve when proposing a small remediation in response to a rubric fail.
- Any time the next-step decision depends on whether the previous edit broke something.

## When NOT to Use

- Multi-file refactors that span >3 files in one logical change. Use `@developer` direct with a planned change set; ACI's per-step verification cost compounds.
- Pure additions (new file, new function with no callers yet). Run typecheck once at the end; the per-edit feedback loop is overhead.
- Anything that would benefit from holding multiple files open in a worktree (pair with §6.6 follow-up worktree primitive when it lands).

## Process

1. **Stage exactly one edit.** Bound it to: one symbol, one block, or one canonical change. If the change requires touching N >1 sites that don't share a common search-and-replace pattern, decompose into N invocations of this skill.
2. **Apply the edit** via the standard `Edit` tool with the smallest plausible context window.
3. **Run verification** appropriate to the file kind:
   - `.ts` / `.tsx` → `npm run typecheck`
   - `.py` → `python -m mypy <file>` (if mypy configured)
   - `.go` → `go vet ./...`
   - `.rs` → `cargo check`
   - Other → linter declared in coldpress.yaml `quality:` block; skip with a note if none configured.
4. **Capture the feedback verbatim.** Don't paraphrase. Don't truncate. The next step's prompt sees the raw stderr.
5. **Decide:**
   - Verification clean → continue to the next ACI invocation.
   - Verification fails AND the failure is plausibly fixable from the edit's local context → ONE corrective edit, then re-verify.
   - Verification fails twice → escalate. Emit `<NEED_INFO>` (`kind: architecture-unclear`) or hand back to @pm via the standard handoff protocol.

## Output

In-place file edit + a post-edit verification report (success / fail + raw verifier output). The verification report is the input to the next step's prompt — intentionally short-lived; not persisted to `_context/audit/` unless the run logs into the EventStream.

## Critical rules

- **One edit per invocation.** This is the load-bearing constraint. Multi-edit batches degrade the feedback loop's signal.
- **Raw verifier output, never paraphrased.** The literal compiler error is what decides the next step.
- **Two-fail escalation.** No third corrective attempt; escalate to a higher-context decision (`<NEED_INFO>` or human).
- **No `--no-verify` / verifier bypass.** If the verifier is wrong about something, fix the verifier or the upstream config — don't paper over.

## Failure modes

- **No verifier configured.** Skill emits a single-line warning + continues; the agent proceeds with no feedback signal. Document the gap so the project's `quality:` config gets updated.
- **Verifier hangs.** Skip after a configurable timeout (default 60s); treat as fail.
- **Edit collides with a concurrent change.** The Edit tool fails loud on its own; this skill surfaces the message verbatim.

## Why interface, not the runtime

SWE-agent ships its grammar inside a Docker sandbox with cursor-state persistence between commands. Coldpress-os uses Claude Code's tools directly — the `Edit` / `Read` / `Bash` tools provide the same effect without the sandbox lift. We port the **discipline** (bounded edit + immediate verification + escalation budget); we don't port the runtime.

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-04-24 | Cadbury-hq | Initial ACI edit primitive — Wave 6 Block HH §6.6. Discipline-encoding skill; runtime is the existing Edit tool. |
