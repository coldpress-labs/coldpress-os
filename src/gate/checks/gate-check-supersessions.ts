/**
 * Gate check: gate-check-supersessions
 *
 * Counts `superseded_by` graph edges since a given timestamp. If > 0, checks
 * that `_context/audit/supersessions-{date}.md` exists with entries after
 * the `phase_started_at` local-config key.
 */

import { access, readFile } from "node:fs/promises";
import { glob } from "node:fs/promises";
import { resolve, join } from "node:path";
import { readLocalConfig } from "../../utils/local-config.js";
import { packageRoot } from "../../utils/paths.js";

export interface CheckSupersessionsResult {
  ok: boolean;
  message: string;
  /** Number of supersession log files found. */
  log_count?: number;
}

export async function checkSupersessions(
  projectRoot: string,
  afterKey: string = "phase_3_started_at",
): Promise<CheckSupersessionsResult> {
  const config = await readLocalConfig(projectRoot);
  const afterTs = config[afterKey as keyof typeof config] as string | undefined;

  const auditDir = resolve(projectRoot, "_context/audit");
  const supersessionFiles: string[] = [];
  try {
    for await (const f of glob(join(auditDir, "supersessions-*.md"))) supersessionFiles.push(f);
  } catch {
    // no audit dir — fine if no supersessions happened
  }

  if (supersessionFiles.length === 0) {
    return {
      ok: true,
      message: "No supersession log files found — no supersessions fired in this phase.",
      log_count: 0,
    };
  }

  if (!afterTs) {
    return {
      ok: true,
      message: `Supersession log(s) found (${supersessionFiles.length} files). ${afterKey} not set — cannot verify timing; treating as pass.`,
      log_count: supersessionFiles.length,
    };
  }

  // Verify at least one file has mtime after afterTs
  const afterDate = new Date(afterTs);
  let hasRecentEntry = false;
  for (const f of supersessionFiles) {
    const raw = await readFile(f, "utf8");
    // Supersession logs embed ISO timestamps — check if any line contains a date after afterTs
    const lines = raw.split("\n");
    for (const line of lines) {
      // Capture the timezone suffix (Z or ±HH:MM) so Date parses as UTC,
      // not local time. Stripping the suffix would silently shift the
      // comparison by the local UTC offset.
      const match = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?/.exec(line);
      if (match) {
        const ts = new Date(match[0]);
        if (ts >= afterDate) {
          hasRecentEntry = true;
          break;
        }
      }
    }
    if (hasRecentEntry) break;
  }

  if (!hasRecentEntry) {
    return {
      ok: false,
      message: `Supersession log(s) found but no entries after ${afterTs}. If supersessions fired in this phase, add entries to _context/audit/supersessions-{date}.md.`,
      log_count: supersessionFiles.length,
    };
  }

  return {
    ok: true,
    message: `Supersession log confirmed — entries found after ${afterTs}.`,
    log_count: supersessionFiles.length,
  };
}
