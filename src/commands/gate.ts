/**
 * `coldpress gate` — the phase-gate runner CLI (WS10-C1/C6).
 *
 *   coldpress gate check <phase>   evaluate lifecycle/<phase>/gate.json's checks
 *   coldpress gate enter <phase>   stamp phase_<n>_started_at (fresh-for-phase key)
 */

import { updateLocalConfig } from "../utils/local-config.js";
import { runGate } from "../gate/run.js";

export function runGateCheck(phase: number, opts: { projectDir?: string } = {}): number {
  const report = runGate(phase, { projectDir: opts.projectDir });
  const w = (s: string) => process.stdout.write(s);

  if (report.evaluated === 0 && report.pending === 0) {
    process.stderr.write(`gate check: no gate.json found for phase ${phase}.\n`);
    return 1;
  }

  w(`\ncoldpress gate check — ${report.gate_id} (phase ${phase})\n`);
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

export async function runGateEnter(phase: number, opts: { projectDir?: string } = {}): Promise<number> {
  const projectDir = opts.projectDir ?? process.cwd();
  const iso = new Date().toISOString();
  const key = `phase_${phase}_started_at` as const;
  await updateLocalConfig(projectDir, { [key]: iso });
  process.stdout.write(`gate enter: stamped ${key} = ${iso}\n`);
  return 0;
}
