/**
 * Deterministic trace/span ID derivation.
 *
 * The exporter is a *backfill* over existing EventStream JSONL, so we
 * want idempotent emission: re-running the exporter on the same run
 * produces identical IDs. OTel's default IdGenerator emits random IDs
 * at span-creation time — wrong shape for replay. We SHA-256 the
 * `run_id` for the trace id (16 bytes → 32 hex) and SHA-256
 * `run_id + ":" + seq` for each span id (8 bytes → 16 hex).
 *
 * OTel forbids the all-zero trace/span ID. The probability of SHA-256
 * truncating to zero is vanishing, but we still guard for it in case
 * someone feeds the derivation an empty-string run_id in testing.
 */

import { createHash } from "node:crypto";

const ZERO_TRACE = "00000000000000000000000000000000";
const ZERO_SPAN = "0000000000000000";

function sha256(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

export function deriveTraceId(runId: string): string {
  const hex = sha256(runId).slice(0, 32);
  if (hex === ZERO_TRACE) {
    throw new Error(
      `deriveTraceId produced the forbidden all-zero trace id for runId="${runId}"`,
    );
  }
  return hex;
}

export function deriveSpanId(runId: string, seq: number): string {
  if (!Number.isInteger(seq) || seq < 0) {
    throw new Error(`deriveSpanId requires non-negative integer seq, got ${seq}`);
  }
  const hex = sha256(`${runId}:${seq}`).slice(0, 16);
  if (hex === ZERO_SPAN) {
    throw new Error(
      `deriveSpanId produced the forbidden all-zero span id for runId="${runId}" seq=${seq}`,
    );
  }
  return hex;
}
