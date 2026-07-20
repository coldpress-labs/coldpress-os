/**
 * `coldpress gate` — the phase-gate runner CLI (WS10-C1/C6).
 *
 *   coldpress gate check <phase>   evaluate lifecycle/<phase>/gate.json's checks
 *   coldpress gate enter <phase>   stamp phase_<n>_started_at (fresh-for-phase key)
 *
 * <phase> is lane-aware (WS11 S1.2): a full-lane number/name (`3`, `1-bootstrap`)
 * or a lite-lane id (`lite:spec`). Before WS11 the CLI did `Number(phase)`, so
 * every non-bare-integer form parsed to NaN and no gate was ever found.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { updateLocalConfig } from "../utils/local-config.js";
import { runGate, parsePhaseRef } from "../gate/run.js";
import { GateEvaluationSchema } from "../../schemas/phase-gate.schema.js";
import type { GateRunReport } from "../gate/run.js";

/**
 * Write the `GateEvaluation` audit artifact (VP2 O40).
 *
 * `evaluate-phase-gate/SKILL.md` §4 specifies this artifact, `GateEvaluationSchema`
 * types it, and the dashboard (`src/dashboard/tabs/status.ts`) globs
 * `gate-eval-phase-N-YYYY-MM-DD.json` to surface `last_gate_evaluation` — but nothing
 * PRODUCED it. It depended on an agent hand-authoring the JSON, so it silently
 * stopped being emitted and the dashboard froze on the last phase anyone remembered.
 * The runner already computes everything the schema needs; emit it mechanically.
 *
 * Returns the written path, or null when the phase isn't numeric (lite lane — the
 * schema requires an integer phase).
 */
export function emitGateEvaluation(
  report: GateRunReport,
  phaseNumber: number | undefined,
  projectDir: string,
): string | null {
  if (phaseNumber === undefined || !Number.isInteger(phaseNumber)) return null;

  const now = new Date();
  const evaluation = {
    gate_id: report.gate_id,
    phase: phaseNumber,
    evaluated_at: now.toISOString(),
    overall: report.blocked ? "fail" : report.pending > 0 ? "pending-human" : "pass",
    results: report.results.map((r) => ({
      id: r.id,
      status: r.status === "pending" ? "pending-human" : r.status,
      message: r.detail,
      ...(r.severity === "warn" && r.status === "fail" ? { requires_sign_off: true } : {}),
    })),
    blockers: report.results.filter((r) => r.severity === "block" && r.status === "fail").map((r) => r.id),
    warnings: report.results.filter((r) => r.severity === "warn" && r.status === "fail").map((r) => r.id),
  };

  // Fail loudly if we ever drift from the schema the dashboard reads.
  const parsed = GateEvaluationSchema.parse(evaluation);

  const dir = join(projectDir, "_context/audit");
  mkdirSync(dir, { recursive: true });
  const file = join(dir, `gate-eval-phase-${phaseNumber}-${now.toISOString().slice(0, 10)}.json`);
  writeFileSync(file, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
  return file;
}

export function runGateCheck(phase: string, opts: { projectDir?: string; emit?: boolean } = {}): number {
  const ref = parsePhaseRef(phase);
  if (!ref) {
    process.stderr.write(
      `gate check: unrecognized phase "${phase}". Use a full-lane phase (e.g. 3, 3-tech-stack, 1-bootstrap) or a lite-lane phase (e.g. lite:spec).\n`,
    );
    return 1;
  }

  const report = runGate(ref.label, { projectDir: opts.projectDir });
  const w = (s: string) => process.stdout.write(s);

  if (report.evaluated === 0 && report.pending === 0) {
    process.stderr.write(`gate check: no gate.json found for phase ${report.phase}.\n`);
    return 1;
  }

  w(`\ncoldpress gate check — ${report.gate_id} (phase ${report.phase})\n`);
  for (const r of report.results) {
    const mark = r.status === "pass" ? "✓" : r.status === "fail" ? "✗" : "•";
    w(`  ${mark} [${r.severity}] ${r.id} — ${r.detail}\n`);
  }
  const failed = report.results.filter((r) => r.status === "fail").length;
  w(
    `\n  ${report.evaluated} evaluated (${failed} failed), ${report.pending} pending (human/agent).` +
      `${report.blocked ? " GATE BLOCKED — a block-severity check failed." : report.pending > 0 ? " No block failures; pending checks still need a human/agent." : " All evaluated checks pass."}\n\n`,
  );

  if (opts.emit) {
    // Lite-lane phases have no integer number; GateEvaluationSchema requires one.
    const phaseNumber = ref.lane === "lite" ? undefined : ref.n;
    const written = emitGateEvaluation(report, phaseNumber, opts.projectDir ?? process.cwd());
    if (written) {
      w(`  ↳ gate evaluation written: ${written.replace(`${opts.projectDir ?? process.cwd()}/`, "")}\n\n`);
    } else {
      process.stderr.write(
        `  ⚠ --emit skipped: the GateEvaluation schema requires an integer phase (lite-lane phases have none).\n\n`,
      );
    }
  }

  // Exit 1 iff a block-severity check was evaluated and failed. Pending checks
  // do not fail the gate (they can't be auto-decided) but are surfaced loudly.
  return report.blocked ? 1 : 0;
}

export async function runGateEnter(phase: string, opts: { projectDir?: string } = {}): Promise<number> {
  const ref = parsePhaseRef(phase);
  if (!ref) {
    process.stderr.write(
      `gate enter: unrecognized phase "${phase}". Use a full-lane phase (e.g. 3, 1-bootstrap) or a lite-lane phase (e.g. lite:spec).\n`,
    );
    return 1;
  }
  // The lite lane drops phase sequencing (no fresh-for-phase gate keys), so there
  // is nothing to stamp.
  if (ref.lane === "lite") {
    process.stdout.write(`gate enter: lite lane has no phase-entry gates — nothing to stamp for "${ref.label}".\n`);
    return 0;
  }

  const projectDir = opts.projectDir ?? process.cwd();
  const iso = new Date().toISOString();
  const key = `phase_${ref.n}_started_at` as const;
  await updateLocalConfig(projectDir, { [key]: iso });
  process.stdout.write(`gate enter: stamped ${key} = ${iso}\n`);
  return 0;
}
