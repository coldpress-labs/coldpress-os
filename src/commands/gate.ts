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

import { updateLocalConfig } from "../utils/local-config.js";
import { runGate, parsePhaseRef } from "../gate/run.js";

export function runGateCheck(phase: string, opts: { projectDir?: string } = {}): number {
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
