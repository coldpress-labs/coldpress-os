/**
 * Project Dashboard HTTP server (§6.10).
 *
 * Pure node:http — no Express/Fastify. Binds to 127.0.0.1 ONLY by
 * design (single-user dev-time tool; no auth layer). Routes:
 *
 *   GET /                        → single-page HTML (renderDashboardPage)
 *   GET /api/<tab>               → JSON for a tab (status/stats/sanity/…)
 *   GET /graph/<subgraph>.html   → standalone interactive HTML for a
 *                                  subgraph (Block CC visualizer output)
 *   GET /file/<path>             → static read-only file under projectDir
 *                                  (used by quick-links + audit refs)
 *
 * READ-ONLY: every method other than GET / HEAD returns 405. No write
 * endpoints — use the `coldpress` CLI for state-mutating actions.
 */

import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { type IncomingMessage, type Server, type ServerResponse, createServer } from "node:http";
import { extname, join, normalize, relative, resolve, sep } from "node:path";
import { Graph, loadGraph } from "../graph/index.js";
import { renderHtml } from "../graph/render/html.js";
import {
  getSubgraphBuilder,
  listSubgraphNames,
} from "../graph/subgraphs/index.js";
import { renderDashboardPage } from "./render/page.js";
import { assembleGraph } from "./tabs/graph.js";
import { assembleQuickLinks } from "./tabs/quick-links.js";
import { assembleSanity } from "./tabs/sanity.js";
import { assembleStats } from "./tabs/stats.js";
import { assembleStatus } from "./tabs/status.js";
import { assembleTechStack } from "./tabs/tech-stack.js";
import { assembleTodos } from "./tabs/todos.js";

export interface DashboardServerOptions {
  projectDir: string;
  port?: number;
  /** Defaults to 127.0.0.1; setting anything else is explicitly out of scope. */
  host?: string;
  pollIntervalMs?: number;
}

export const DEFAULT_DASHBOARD_PORT = 7777;
export const DEFAULT_DASHBOARD_HOST = "127.0.0.1";

const TAB_HANDLERS: Record<string, (projectDir: string) => Promise<unknown>> = {
  status: assembleStatus,
  stats: assembleStats,
  sanity: assembleSanity,
  "tech-stack": assembleTechStack,
  todos: assembleTodos,
  graph: assembleGraph,
  "quick-links": assembleQuickLinks,
};

const STATIC_MIME: Record<string, string> = {
  ".md": "text/markdown; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".yaml": "text/yaml; charset=utf-8",
  ".yml": "text/yaml; charset=utf-8",
  ".html": "text/html; charset=utf-8",
};

export interface RunningServer {
  server: Server;
  port: number;
  host: string;
  url: string;
  close: () => Promise<void>;
}

export async function startDashboardServer(
  options: DashboardServerOptions,
): Promise<RunningServer> {
  const projectDir = resolve(options.projectDir);
  const port = options.port ?? DEFAULT_DASHBOARD_PORT;
  const host = options.host ?? DEFAULT_DASHBOARD_HOST;
  const pollIntervalMs = options.pollIntervalMs;

  const server = createServer(async (req, res) => {
    try {
      await dispatch(req, res, projectDir, pollIntervalMs);
    } catch (err) {
      sendJson(res, 500, {
        error: err instanceof Error ? err.message : String(err),
      });
    }
  });

  await new Promise<void>((accept, reject) => {
    server.once("error", reject);
    server.listen(port, host, () => {
      server.removeListener("error", reject);
      accept();
    });
  });

  const address = server.address();
  const actualPort =
    typeof address === "object" && address !== null ? address.port : port;
  const url = `http://${host}:${actualPort}`;

  return {
    server,
    host,
    port: actualPort,
    url,
    close: () =>
      new Promise<void>((accept, reject) =>
        server.close((err) => (err ? reject(err) : accept())),
      ),
  };
}

async function dispatch(
  req: IncomingMessage,
  res: ServerResponse,
  projectDir: string,
  pollIntervalMs: number | undefined,
): Promise<void> {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.statusCode = 405;
    res.setHeader("Allow", "GET, HEAD");
    res.setHeader("Cache-Control", "no-store");
    res.end("Method Not Allowed — dashboard is read-only.");
    return;
  }
  const url = new URL(req.url ?? "/", "http://placeholder");
  const path = url.pathname;

  if (path === "/" || path === "/index.html") {
    const html = renderDashboardPage({ pollIntervalMs });
    sendHtml(res, 200, html);
    return;
  }

  if (path === "/healthz") {
    sendJson(res, 200, { ok: true });
    return;
  }

  // /api/<tab>
  if (path.startsWith("/api/")) {
    const tab = path.slice("/api/".length);
    const handler = TAB_HANDLERS[tab];
    if (!handler) {
      sendJson(res, 404, { error: `unknown tab: ${tab}` });
      return;
    }
    const data = await handler(projectDir);
    sendJson(res, 200, data);
    return;
  }

  // /graph/<subgraph>.html
  if (path.startsWith("/graph/") && path.endsWith(".html")) {
    const slug = path.slice("/graph/".length, -".html".length);
    const builder = getSubgraphBuilder(slug);
    if (!builder) {
      sendHtml(
        res,
        404,
        `<!doctype html><body><p>Unknown subgraph: ${escapeHtml(slug)}.</p>` +
          `<p>Available: ${listSubgraphNames().map(escapeHtml).join(", ")}</p></body>`,
      );
      return;
    }
    let graph: Graph;
    try {
      graph = await loadGraph({ projectDir });
    } catch (err) {
      sendHtml(
        res,
        503,
        `<!doctype html><body><p>No graph available: ${escapeHtml(
          err instanceof Error ? err.message : String(err),
        )}</p></body>`,
      );
      return;
    }
    const subgraph = builder(graph);
    const html = renderHtml(subgraph);
    sendHtml(res, 200, html);
    return;
  }

  // /file/<path-under-projectDir>
  if (path.startsWith("/file/")) {
    const requested = decodeURIComponent(path.slice("/file/".length));
    const safe = safeJoin(projectDir, requested);
    if (!safe) {
      res.statusCode = 403;
      res.setHeader("Cache-Control", "no-store");
      res.end("Forbidden");
      return;
    }
    try {
      const s = await stat(safe);
      if (!s.isFile()) {
        res.statusCode = 404;
        res.end("Not a file");
        return;
      }
      res.statusCode = 200;
      res.setHeader(
        "Content-Type",
        STATIC_MIME[extname(safe).toLowerCase()] ?? "application/octet-stream",
      );
      res.setHeader("Cache-Control", "no-store");
      createReadStream(safe).pipe(res);
      return;
    } catch {
      res.statusCode = 404;
      res.end("Not found");
      return;
    }
  }

  res.statusCode = 404;
  res.setHeader("Cache-Control", "no-store");
  res.end("Not found");
}

/**
 * Safe path-join that refuses to escape `root` via `..` traversal or
 * absolute paths. Returns the resolved path on success; null on
 * traversal attempt.
 */
function safeJoin(root: string, requested: string): string | null {
  const normalised = normalize(requested);
  if (normalised.startsWith("..") || normalised.includes(`..${sep}..`)) {
    return null;
  }
  const joined = join(root, normalised);
  const rel = relative(root, joined);
  if (rel.startsWith("..") || rel.startsWith(sep) || rel.startsWith("/")) {
    return null;
  }
  return joined;
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function sendHtml(res: ServerResponse, status: number, body: string): void {
  res.statusCode = status;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(body);
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
