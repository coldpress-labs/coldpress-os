/**
 * Graph tab — metadata only. The actual rendering happens via an
 * `<iframe>` pointing at `/graph/<subgraph>.html` which the server
 * generates on demand using the Block CC visualizer.
 */

import { stat } from "node:fs/promises";
import { resolve } from "node:path";
import { listSubgraphNames } from "../../graph/subgraphs/index.js";
import type { GraphTabData } from "../types.js";

export async function assembleGraph(projectDir: string): Promise<GraphTabData> {
  const path = resolve(projectDir, ".coldpress/graph/graph.json");
  let nodeCount = 0;
  let edgeCount = 0;
  let hasGraph = false;
  try {
    const s = await stat(path);
    if (s.isFile() && s.size > 0) {
      hasGraph = true;
      const { readFile } = await import("node:fs/promises");
      const raw = await readFile(path, "utf8");
      const json = JSON.parse(raw) as {
        nodes?: unknown[];
        links?: unknown[];
      };
      nodeCount = Array.isArray(json.nodes) ? json.nodes.length : 0;
      edgeCount = Array.isArray(json.links) ? json.links.length : 0;
    }
  } catch {
    /* no graph */
  }
  return {
    has_graph: hasGraph,
    graph_path: path,
    node_count: nodeCount,
    edge_count: edgeCount,
    subgraphs: listSubgraphNames(),
  };
}
