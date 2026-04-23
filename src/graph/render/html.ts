/**
 * Standalone interactive HTML renderer for §6.1 subgraphs.
 *
 * Emits a self-contained HTML file with inline JSON graph data + a CDN
 * `<script>` tag pulling Cytoscape.js at render-time. Users open the
 * file in a browser to explore the graph (pan, zoom, click-for-detail).
 *
 * Why CDN, not bundled: bundling Cytoscape (~400KB min) into every
 * rendered file doubles output size for no practical gain. Users with
 * offline needs can download Cytoscape once and swap the CDN URL for
 * a local path.
 *
 * The Project Dashboard (§6.10) uses a different path — serves
 * Cytoscape from the coldpress-os-owned vendor dir — so the dashboard
 * Graph tab works fully offline.
 */

import type { Edge, Node } from "../types.js";
import type { Subgraph } from "../subgraphs/index.js";

export interface RenderOptions {
  maxNodes?: number;
  /**
   * CDN or path from which the runtime Cytoscape.js script is loaded.
   * Defaults to unpkg's latest. Override to a local path for fully
   * offline rendering.
   */
  cytoscapeSrc?: string;
}

const DEFAULT_MAX_NODES = 1000;
const DEFAULT_CYTOSCAPE_SRC =
  "https://unpkg.com/cytoscape/dist/cytoscape.min.js";

export function renderHtml(
  subgraph: Subgraph,
  options: RenderOptions = {},
): string {
  const cap = options.maxNodes ?? DEFAULT_MAX_NODES;
  const limitedNodes =
    cap > 0 && subgraph.nodes.length > cap
      ? subgraph.nodes.slice(0, cap)
      : subgraph.nodes;
  const nodeIdSet = new Set(limitedNodes.map((n) => n.id));
  const limitedEdges = subgraph.edges.filter(
    (e) => nodeIdSet.has(e.source) && nodeIdSet.has(e.target),
  );

  const elements = [
    ...limitedNodes.map(toCyNode),
    ...limitedEdges.map(toCyEdge),
  ];

  const jsonData = JSON.stringify(elements, null, 2);
  const truncationNote =
    cap > 0 && subgraph.nodes.length > cap
      ? `<p class="note">⚠️ truncated: showing first ${cap} of ${subgraph.nodes.length} nodes.</p>`
      : "";

  const cytoSrc = options.cytoscapeSrc ?? DEFAULT_CYTOSCAPE_SRC;
  const layout = cytoscapeLayout(subgraph.layout);

  return PAGE_TEMPLATE.replaceAll("__TITLE__", escapeHtml(subgraph.title))
    .replaceAll("__DESCRIPTION__", escapeHtml(subgraph.description))
    .replaceAll("__TRUNCATION_NOTE__", truncationNote)
    .replaceAll("__ELEMENTS_JSON__", jsonData)
    .replaceAll("__LAYOUT__", layout)
    .replaceAll("__CYTOSCAPE_SRC__", cytoSrc);
}

interface CyNode {
  data: { id: string; label: string; nodeType?: string; envTag?: string };
  classes: string;
}

interface CyEdge {
  data: { id: string; source: string; target: string; relation?: string };
  classes: string;
}

function toCyNode(node: Node): CyNode {
  const envTag = node.coldpress?.env_tag;
  const nodeType = node.coldpress?.node_type;
  return {
    data: {
      id: node.id,
      label: node.label ?? node.id,
      nodeType,
      envTag,
    },
    classes: [nodeType ? `type-${nodeType}` : "", envTag ? `env-${envTag}` : ""]
      .filter(Boolean)
      .join(" "),
  };
}

function toCyEdge(edge: Edge): CyEdge {
  const relation = typeof edge.relation === "string" ? edge.relation : undefined;
  return {
    data: {
      id: `${edge.source}__${edge.target}__${relation ?? ""}`,
      source: edge.source,
      target: edge.target,
      relation,
    },
    classes: relation ? `rel-${String(relation).replace(/_/g, "-")}` : "",
  };
}

function cytoscapeLayout(layout: Subgraph["layout"]): string {
  if (layout === "tree") return "breadthfirst";
  if (layout === "dag") return "dagre";
  if (layout === "cluster") return "cose";
  return "cose";
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const PAGE_TEMPLATE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>__TITLE__ — coldpress-os graph</title>
<meta name="generator" content="@coldpress-os:graph-view">
<style>
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #1a1a1a; }
  header { padding: 16px 20px; border-bottom: 1px solid #e5e5e5; background: #fafafa; }
  h1 { margin: 0 0 4px 0; font-size: 18px; }
  p  { margin: 0; color: #555; font-size: 13px; }
  .note { color: #b8860b; margin-top: 4px; }
  #cy { width: 100vw; height: calc(100vh - 72px); background: #fff; }
  .legend { position: fixed; bottom: 12px; right: 12px; background: rgba(255,255,255,0.95); border: 1px solid #ccc; padding: 8px 12px; font-size: 12px; border-radius: 4px; }
  .legend .item { display: inline-block; margin-right: 10px; }
  .swatch { display: inline-block; width: 10px; height: 10px; border-radius: 2px; margin-right: 4px; vertical-align: middle; }
</style>
</head>
<body>
  <header>
    <h1>__TITLE__</h1>
    <p>__DESCRIPTION__</p>
    __TRUNCATION_NOTE__
  </header>
  <div id="cy"></div>
  <div class="legend">
    <span class="item"><span class="swatch" style="background:#ffe4b5"></span>SacredDoc</span>
    <span class="item"><span class="swatch" style="background:#e0f0ff"></span>sandbox</span>
    <span class="item"><span class="swatch" style="background:#d4edda"></span>live</span>
    <span class="item"><span class="swatch" style="background:#f3e8ff"></span>promoted</span>
    <span class="item"><span class="swatch" style="background:#ffd6d6"></span>credential</span>
  </div>
  <script src="__CYTOSCAPE_SRC__"></script>
  <script>
    const elements = __ELEMENTS_JSON__;
    const cy = cytoscape({
      container: document.getElementById("cy"),
      elements,
      layout: { name: "__LAYOUT__", fit: true, padding: 40 },
      style: [
        { selector: "node", style: { "label": "data(label)", "font-size": 10, "text-wrap": "wrap", "text-max-width": 120, "background-color": "#ffffff", "border-width": 1, "border-color": "#666" } },
        { selector: "node.type-SacredDoc", style: { "background-color": "#ffe4b5", "border-color": "#b8860b", "shape": "round-rectangle" } },
        { selector: "node.type-CodeModule", style: { "background-color": "#ffffff", "border-color": "#555", "shape": "ellipse" } },
        { selector: "node.type-CredentialName", style: { "background-color": "#ffd6d6", "border-color": "#c0392b", "shape": "hexagon" } },
        { selector: "node.type-Input", style: { "background-color": "#eee", "border-color": "#555", "shape": "parallelogram" } },
        { selector: "node.env-sandbox", style: { "background-color": "#e0f0ff", "border-color": "#4a90e2" } },
        { selector: "node.env-live", style: { "background-color": "#d4edda", "border-color": "#28a745" } },
        { selector: "node.env-both", style: { "background-color": "#f3e8ff", "border-color": "#8a2be2" } },
        { selector: "edge", style: { "curve-style": "bezier", "target-arrow-shape": "triangle", "target-arrow-color": "#888", "line-color": "#aaa", "width": 1.2, "label": "data(relation)", "font-size": 8, "color": "#666", "text-background-color": "#fff", "text-background-opacity": 0.8, "text-background-padding": "2px" } },
        { selector: "edge.rel-promoted-from-sandbox", style: { "line-color": "#8a2be2", "target-arrow-color": "#8a2be2", "width": 2 } },
        { selector: "edge.rel-superseded-by", style: { "line-style": "dashed" } }
      ]
    });
    cy.on("tap", "node", (e) => { const d = e.target.data(); console.log("node", d); });
  </script>
</body>
</html>
`;
