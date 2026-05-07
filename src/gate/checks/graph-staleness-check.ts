/**
 * Gate check: graph-staleness-check
 *
 * Delegates to `src/graph/staleness.ts` to check whether the project graph
 * is fresh relative to `_input/` + `_context/` content.
 *
 * Returns pass if the graph is fresh, or if `needs_graph_rebuild: false`
 * is explicitly set in local-config (user override).
 */

import { readLocalConfig } from "../../utils/local-config.js";
import { checkGraphStaleness } from "../../graph/staleness.js";

export interface GraphStalenessResult {
  ok: boolean;
  message: string;
  stale_files?: string[];
}

export async function graphStalenessCheck(
  projectRoot: string,
  _paths: string[] = [],
): Promise<GraphStalenessResult> {
  const config = await readLocalConfig(projectRoot);

  if (config.needs_graph_rebuild === false) {
    return {
      ok: true,
      message: "Graph freshness override: needs_graph_rebuild = false in local-config.",
    };
  }

  try {
    const result = await checkGraphStaleness({ projectRoot });

    if (result.stale) {
      return {
        ok: false,
        message: `Graph is stale: ${result.newerInputFiles.length} input file(s) newer than graph build. Run "coldpress graph rebuild".`,
        stale_files: result.newerInputFiles,
      };
    }

    if (result.reason === "no-graph") {
      return {
        ok: false,
        message: `Graph file missing. Run "coldpress graph rebuild" before Phase 3 exit.`,
      };
    }

    return {
      ok: true,
      message: `Graph is fresh (reason: ${result.reason}).`,
    };
  } catch (e) {
    return {
      ok: false,
      message: `Graph staleness check failed: ${String(e)}`,
    };
  }
}
