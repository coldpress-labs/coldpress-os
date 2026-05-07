/**
 * Gate check: file-exists-after
 *
 * Resolves a glob pattern; checks that at least one match has an mtime after
 * the timestamp stored at a local-config key (or after a direct ISO timestamp).
 *
 * Used for checks like "env-provision tracking doc written after phase started"
 * or "baselines-confirmations log written after phase started".
 */

import { stat } from "node:fs/promises";
import { glob } from "node:fs/promises";
import { resolve, join } from "node:path";
import { readLocalConfig } from "../../utils/local-config.js";

export interface FileExistsAfterResult {
  ok: boolean;
  message: string;
  matched_file?: string;
}

export async function fileExistsAfter(
  projectRoot: string,
  globPattern: string,
  opts: {
    afterKey?: string;
    afterTimestamp?: string;
  } = {},
): Promise<FileExistsAfterResult> {
  let afterTs: string | undefined = opts.afterTimestamp;

  if (!afterTs && opts.afterKey) {
    const config = await readLocalConfig(projectRoot);
    afterTs = config[opts.afterKey as keyof typeof config] as string | undefined;
  }

  const absPattern = resolve(projectRoot, globPattern);
  const matchedFiles: string[] = [];
  try {
    for await (const f of glob(absPattern)) matchedFiles.push(f);
  } catch {
    // pattern may resolve to a literal path — fall through to empty
  }

  if (matchedFiles.length === 0) {
    return {
      ok: false,
      message: `No files matched: ${globPattern}`,
    };
  }

  if (!afterTs) {
    // No timestamp constraint — any match is good
    return {
      ok: true,
      message: `File exists: ${matchedFiles[matchedFiles.length - 1]}`,
      matched_file: matchedFiles[matchedFiles.length - 1],
    };
  }

  const afterDate = new Date(afterTs);

  for (const f of matchedFiles) {
    const st = await stat(f);
    if (st.mtime >= afterDate) {
      return {
        ok: true,
        message: `File ${f} exists and was modified after ${afterTs}.`,
        matched_file: f,
      };
    }
  }

  return {
    ok: false,
    message: `File(s) found matching ${globPattern} but none modified after ${afterTs}.`,
  };
}
