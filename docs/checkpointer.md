---
name: checkpointer
description: Resumable runs via .coldpress/runs/<id>/checkpoint.json (LangGraph BaseCheckpointSaver/interrupt port) + content-addressed skill cache (Prefect-style)
version: "1.0"
---

# Checkpointer + Skill Cache (§6.5)

> Long-running orchestrator runs need two things the EventStream alone doesn't give them: (1) a way to **pause and resume** at well-defined interruption points (phase boundaries, NEED_INFO emissions, human gates), and (2) a way to **skip re-runs** when a skill's inputs are unchanged. This block ships both as substrate; runtime wiring lands when the orchestrator shell does.

**Source decision:** plan §6.5 (oss-integration-survey-2026-04-22.md §2.1 — LangGraph checkpointer + interrupt + Prefect-style content-addressed task cache).

---

## Two distinct concepts

| | Checkpoint | Skill cache |
|---|---|---|
| **Purpose** | Pause + resume orchestrator state | Skip re-running idempotent skills |
| **Storage** | `.coldpress/runs/<run-id>/checkpoint.json` (one per run) | `.coldpress/cache/skill-results/<hash>.json` (one per content-addressed hash) |
| **Lifetime** | Until the run finishes (or is abandoned) | Indefinite; cache invalidation = bumping the skill's `version_marker` |
| **Trust** | Load-bearing for resumption — drift refused | Optimisation only — caller MUST be able to fall back to running the skill |

They share a schema file (`schemas/checkpoint.schema.ts`) and a directory hierarchy but are otherwise independent.

---

## Checkpoint shape

```ts
interface Checkpoint {
  schema_version: 1;
  run_id: string;                  // kebab-case; matches EventStream run
  created_at: string;              // ISO-8601
  last_event_seq: number;          // EventStream seq immediately before pause
  interrupt_kind:                  // why we stopped
    "phase-boundary" | "need-info" | "human-gate" | "manual" | "error";
  reason: string;                  // one-paragraph human description
  state: unknown;                  // opaque application state (JSON-serialisable)
}
```

`state` is intentionally untyped at the schema layer — orchestrator authors layer their own Zod schema on top. The checkpointer doesn't care what shape the runtime persists; it cares that the persistence is atomic and the drift-check is honest.

### Atomic writes

`saveCheckpoint()` writes to `<path>.tmp` first, then `rename()`. POSIX rename is atomic on a single filesystem; a crash mid-write leaves either the previous good checkpoint or the new good checkpoint, never a partial one.

### Drift check on resume

`readCheckpoint()` defaults to verifying the live EventStream is at-most `last_event_seq + 1` long. If the stream has moved beyond the snapshot point — meaning state has drifted without the checkpoint's knowledge — `readCheckpoint()` throws `CheckpointDriftError`.

To resume from a stale checkpoint:
1. Author a fresh checkpoint at the new tail (preferred), OR
2. Rewind the EventStream to the snapshot point (rare; usually a debugging-only operation).

`skipDriftCheck: true` exists for **inspect-only** callers (the Project Dashboard's Status tab, e.g.). Real resumption MUST verify.

### Time-travel

To resume from a prior wave:
1. Read the EventStream up to the desired `seq`.
2. Author a checkpoint with `last_event_seq = <that seq>`, `interrupt_kind: "manual"`, `reason: "time-travel to wave X"`.
3. Truncate the EventStream past that seq (manual edit; document the rewind in the next emitted event's `Condensation` summary).
4. Resume.

The schema doesn't enforce the rewind; the discipline does. If you skip the rewind, your next read will hit `CheckpointDriftError` immediately.

---

## Skill cache shape

```ts
interface SkillCacheEntry {
  schema_version: 1;
  hash: string;                  // SHA-256 of (skill_id + version_marker + canonical-JSON args)
  skill_id: string;
  version_marker: string;        // bump to invalidate prior entries for this skill
  cached_at: string;             // ISO-8601
  result: {
    exit_code: number;
    artifact_path?: string;
    message?: string;
  };
  inputs: unknown;               // audit trail of what was hashed
}
```

### `hashInputs()` contract

```ts
hashInputs({ skillId, versionMarker, args }) → 64-char hex string
```

- **Canonical JSON.** Object keys sorted at every level; `{a:1,b:2}` hashes the same as `{b:2,a:1}`.
- **No non-finite numbers.** `NaN`/`Infinity` in `args` throw at hash time — they don't round-trip JSON cleanly anyway.
- **No symbols / functions / undefined.** JSON-serialisable values only.

### `version_marker` — manual invalidation

Equivalent to Prefect's `cache_key_fn`. A skill bumps its marker when its behaviour changes meaningfully (new prompt, new metric, new external tool version). Every prior cache entry under the old marker becomes unreachable; the cache rebuilds organically.

Suggested convention: `<skill-id>@<semver>` — e.g., `validate-schema@1.2.0`. Match the convention to your skill's release cadence.

### `SkillResultCache` API

```ts
const cache = new SkillResultCache(projectDir);

const hash = hashInputs({ skillId, versionMarker, args });
const cached = await cache.get(hash);
if (cached) {
  // reuse cached.result
} else {
  const result = await runSkill(args);
  await cache.put({ hash, skillId, versionMarker, inputs: args, result });
}
```

### Trust posture

The cache is **never load-bearing**. Orchestrators MUST be able to fall back to running the skill if:
- The cache miss path returns `null`.
- The on-disk JSON fails schema validation (treat as miss; never throw on hot path).
- The cache directory is absent.

Treat as an optimisation; design as if it might disappear at any moment.

### What to redact BEFORE caching

The cache trusts the caller to redact. Sensitive values must not enter `inputs`. Examples that should be elided / hashed-substituted before passing to `hashInputs`:
- API keys / tokens
- Personally-identifiable user data
- Anything that fails the `secure/manifest.yaml` test

---

## Runtime wiring — DEFERRED

Block HH ships the substrate. The orchestrator that calls `saveCheckpoint()` and `cache.get()/put()` doesn't exist yet — it lands in the Wave 6 orchestrator follow-up that closes out §6.5's "resumable runs" + the `EventStreamWriter` integration spec'd in `docs/event-stream.md`.

In the meantime, the substrate is sufficient for any future orchestrator to plug in. The Project Dashboard (§6.10) Status tab can already display checkpoint metadata via `readCheckpoint({ skipDriftCheck: true })` once the assembler is wired (follow-up tab work; substrate is enough for v1 dashboard).

---

## What's NOT in this protocol

- **Multi-checkpoint history.** One checkpoint per run; saves overwrite. To preserve history, snapshot manually before saving (out of scope for v1).
- **Distributed / multi-writer support.** Single-writer assumption matches the EventStream's single-writer-per-run model. Multi-writer needs leader election, log shipping — none of which we need yet.
- **Encryption at rest.** Checkpoints + cache entries are plaintext JSON. Sensitive state belongs in `secure/.env*` (git-ignored), not the checkpoint.
- **TTL / GC.** Cache entries accumulate. A future housekeeping skill might prune entries older than N days; not in Block HH.
- **Cross-run cache sharing.** Each project has its own `.coldpress/cache/`; no shared remote cache. Out of scope.
- **Streaming checkpoint updates.** Whole-checkpoint rewrites only; no incremental patch. Acceptable for current state sizes.

---

## See also

- [`event-stream.md`](event-stream.md) — Block DD; checkpoints anchor to EventStream `seq` for drift detection.
- [`phase-gate-protocol.md`](phase-gate-protocol.md) — §5.0; `phase-boundary` is the canonical interruption kind for gate transitions.
- [`need-info-protocol.md`](need-info-protocol.md) — §5.4; `need-info` interruptions pair with NEED_INFO emissions.
- [`dashboard.md`](dashboard.md) — Block GG; future checkpoint-aware Status tab will use `skipDriftCheck: true`.
- [`aci-primitives.md`](aci-primitives.md) — Block HH §6.6 sibling.

---

## Orchestration context

> **Hello Butler.** Butler is coldpress-os's main orchestrator agent — your default Claude Code session running with `CLAUDE.md` as its directive. Butler dispatches the 8 Shape A subagents (analyst · architect · pm · ux-designer · developer · verifier · devops · reviewer) and runs the phase gates. The protocol / spec / schema documented above is invoked by Butler (or by a Butler-dispatched subagent) at the relevant phase. See [`butler.md`](butler.md) for the orchestrator reference and the canonical `Hello Butler` entry point.

