/**
 * Single-page dashboard HTML.
 *
 * Hand-rolled HTML + vanilla JS — no React/Next.js, no htmx for v1.
 * One template file; tab switching + polling done in inline JS. ~10 KB
 * sent on page-load; subsequent updates are JSON-only.
 *
 * Polling cadence: 10s default. Each tab fetches its own
 * `/api/<tab>` endpoint independently so a slow tab doesn't block
 * faster ones.
 */

export interface PageOptions {
  pollIntervalMs?: number;
  projectName?: string;
}

const DEFAULT_POLL_MS = 10_000;

export function renderDashboardPage(options: PageOptions = {}): string {
  const pollMs = options.pollIntervalMs ?? DEFAULT_POLL_MS;
  const title = options.projectName
    ? `${escapeHtml(options.projectName)} — coldpress dashboard`
    : "coldpress dashboard";
  return PAGE.replaceAll("__TITLE__", title).replaceAll(
    "__POLL_MS__",
    String(pollMs),
  );
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

const PAGE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>__TITLE__</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="generator" content="@coldpress-os:dashboard-v1">
<style>
  :root {
    --fg: #1a1a1a; --bg: #fafafa; --card: #fff;
    --muted: #6b7280; --border: #e5e7eb;
    --ok: #16a34a; --warn: #d97706; --fail: #dc2626;
    --accent: #4f46e5;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", sans-serif;
    color: var(--fg); background: var(--bg);
    font-size: 14px; line-height: 1.5;
  }
  header {
    background: var(--card); border-bottom: 1px solid var(--border);
    padding: 12px 24px;
    display: flex; align-items: center; justify-content: space-between;
  }
  header h1 { margin: 0; font-size: 16px; font-weight: 600; }
  header .meta { color: var(--muted); font-size: 12px; }
  nav {
    background: var(--card); border-bottom: 1px solid var(--border);
    padding: 0 24px; display: flex; gap: 4px; overflow-x: auto;
  }
  nav button {
    background: transparent; border: 0; cursor: pointer;
    padding: 12px 16px; font-size: 13px; color: var(--muted);
    border-bottom: 2px solid transparent;
    font-family: inherit;
  }
  nav button:hover { color: var(--fg); }
  nav button.active {
    color: var(--accent); border-bottom-color: var(--accent); font-weight: 600;
  }
  main { padding: 24px; }
  .panel {
    background: var(--card); border: 1px solid var(--border); border-radius: 6px;
    padding: 16px; margin-bottom: 12px;
  }
  .panel h2 {
    margin: 0 0 10px 0; font-size: 14px; font-weight: 600;
    display: flex; align-items: center; gap: 8px;
  }
  .panel.status-ok h2::before    { content: "✓"; color: var(--ok); }
  .panel.status-warn h2::before  { content: "!"; color: var(--warn); }
  .panel.status-fail h2::before  { content: "✗"; color: var(--fail); }
  .panel p { margin: 0; color: var(--muted); }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
  .stat {
    background: var(--card); border: 1px solid var(--border); border-radius: 6px;
    padding: 14px;
  }
  .stat .label { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: .04em; }
  .stat .value { font-size: 22px; font-weight: 600; margin-top: 4px; }
  .stat .sub   { font-size: 12px; color: var(--muted); margin-top: 2px; }
  .kv { display: grid; grid-template-columns: max-content 1fr; gap: 4px 12px; font-size: 13px; }
  .kv dt { color: var(--muted); }
  .kv dd { margin: 0; }
  .todo {
    background: var(--card); border: 1px solid var(--border); border-radius: 6px;
    padding: 12px 16px; margin-bottom: 8px; display: flex; gap: 12px; align-items: start;
  }
  .todo .src { font-size: 11px; color: var(--muted); text-transform: uppercase; min-width: 130px; }
  .todo .body { flex: 1; }
  .todo .body strong { display: block; font-size: 13px; }
  .todo .body span { color: var(--muted); font-size: 12px; }
  .links { display: flex; flex-wrap: wrap; gap: 8px; }
  .links a {
    display: inline-block; padding: 6px 12px; background: var(--card);
    border: 1px solid var(--border); border-radius: 999px;
    text-decoration: none; color: var(--accent); font-size: 12px;
  }
  .links a:hover { background: #f3f4f6; }
  iframe.graph {
    width: 100%; height: calc(100vh - 200px); border: 1px solid var(--border); border-radius: 6px;
    background: var(--card);
  }
  .empty { color: var(--muted); font-style: italic; padding: 12px 0; }
  .err { color: var(--fail); padding: 12px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; }
  pre { background: #f3f4f6; padding: 10px 12px; border-radius: 4px; overflow-x: auto; font-size: 12px; }
  select { padding: 4px 8px; font-size: 13px; }
  .last-update { color: var(--muted); font-size: 11px; }
</style>
</head>
<body>
  <header>
    <h1>__TITLE__</h1>
    <span class="meta"><span class="last-update" id="last-update">—</span></span>
  </header>
  <nav id="tabs">
    <button data-tab="status" class="active">Status</button>
    <button data-tab="stats">Stats</button>
    <button data-tab="sanity">Sanity</button>
    <button data-tab="tech-stack">Tech&nbsp;Stack</button>
    <button data-tab="todos">To-dos</button>
    <button data-tab="graph">Graph</button>
    <button data-tab="quick-links">Quick&nbsp;Links</button>
  </nav>
  <main id="content">
    <div class="empty">Loading…</div>
  </main>
<script>
const POLL_MS = __POLL_MS__;
const tabs = ["status","stats","sanity","tech-stack","todos","graph","quick-links"];
const cache = {};
let active = "status";
let pollTimer = null;

function el(tag, props, ...children) {
  const node = document.createElement(tag);
  if (props) {
    for (const [k,v] of Object.entries(props)) {
      if (k === "class") node.className = v;
      else if (k === "html") node.innerHTML = v;
      else if (k.startsWith("on")) node.addEventListener(k.slice(2).toLowerCase(), v);
      else node.setAttribute(k, v);
    }
  }
  for (const c of children.flat()) {
    if (c == null) continue;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return node;
}

async function fetchTab(name) {
  try {
    const r = await fetch("/api/" + name, { cache: "no-store" });
    if (!r.ok) throw new Error("HTTP " + r.status);
    cache[name] = await r.json();
    return cache[name];
  } catch (err) {
    cache[name] = { __error: String(err.message || err) };
    return cache[name];
  }
}

function renderError(data) {
  return el("div", { class: "err" }, "Failed to load: " + data.__error);
}

function renderStatus(d) {
  if (d.__error) return renderError(d);
  const phase = d.current_phase != null ? "Phase " + d.current_phase + (d.current_phase_name ? " — " + d.current_phase_name : "") : "—";
  const last = d.last_gate_evaluation;
  const lastBadge = last ? "[" + last.overall + "] " + last.gate_id + " @ " + last.evaluated_at : "(no gate evaluations recorded)";
  const signoffs = d.sacred_doc_signoffs.length === 0
    ? el("p", { class: "empty" }, "No signoffs recorded yet.")
    : el("ul", null,
        ...d.sacred_doc_signoffs.map(s =>
          el("li", null, s.gate_id + " / " + s.check_id + " — " + s.signed_by + " @ " + s.signed_at)));
  return el("div", null,
    el("div", { class: "panel" },
      el("h2", null, "Project"),
      el("dl", { class: "kv" },
        el("dt", null, "name"), el("dd", null, d.project ? d.project.name : "—"),
        el("dt", null, "slug"), el("dt", null, "slug"), el("dd", null, d.project ? d.project.slug : "—"))),
    el("div", { class: "panel" },
      el("h2", null, "Current phase"),
      el("p", null, phase)),
    el("div", { class: "panel" },
      el("h2", null, "Last gate evaluation"),
      el("pre", null, lastBadge)),
    el("div", { class: "panel" },
      el("h2", null, "Sacred-doc sign-offs"), signoffs));
}

function renderStats(d) {
  if (d.__error) return renderError(d);
  const skill = d.skill_invocations;
  const sacred = d.sacred_docs;
  return el("div", null,
    el("div", { class: "grid" },
      stat("Total skill invocations", skill.total, ""),
      stat("Skill pass / fail", skill.success + " / " + skill.fail, "from skill-result events"),
      stat("Sacred docs present", sacred.present + " / " + sacred.expected,
            sacred.missing.length ? "missing: " + sacred.missing.join(", ") : "all present"),
      stat("Graph", d.graph ? d.graph.node_count + " nodes / " + d.graph.edge_count + " edges" : "—",
            d.graph ? "from .coldpress/graph/graph.json" : "no graph indexed yet"),
      stat("Recorded runs", d.runs.total,
            d.runs.latest ? "latest: " + d.runs.latest : "no runs yet")),
    el("div", { class: "panel" },
      el("h2", null, "Skills by invocation count"),
      Object.keys(skill.by_skill).length === 0
        ? el("p", { class: "empty" }, "No skill invocations recorded.")
        : el("dl", { class: "kv" },
            ...Object.entries(skill.by_skill)
              .sort((a,b) => b[1]-a[1])
              .flatMap(([k,v]) => [el("dt", null, k), el("dd", null, String(v))]))));
}

function stat(label, value, sub) {
  return el("div", { class: "stat" },
    el("div", { class: "label" }, label),
    el("div", { class: "value" }, String(value)),
    el("div", { class: "sub" }, sub || ""));
}

function renderSanity(d) {
  if (d.__error) return renderError(d);
  return el("div", null,
    ...d.panels.map(p =>
      el("div", { class: "panel status-" + p.status },
        el("h2", null, p.title),
        el("p", null, p.detail))));
}

function renderTechStack(d) {
  if (d.__error) return renderError(d);
  if (!d.present) {
    return el("div", { class: "panel" },
      el("p", { class: "empty" }, "No tech-stack.md authored yet."));
  }
  if (!d.frontmatter) {
    return el("div", { class: "panel" },
      el("p", { class: "empty" }, "tech-stack.md exists but has no frontmatter to render."));
  }
  return el("div", { class: "panel" },
    el("h2", null, "Tech-stack frontmatter"),
    el("pre", null, JSON.stringify(d.frontmatter, null, 2)));
}

function renderTodos(d) {
  if (d.__error) return renderError(d);
  if (d.items.length === 0) {
    return el("div", { class: "panel" },
      el("p", { class: "empty" }, "Nothing pending — all known gates passed, no open NEED_INFOs, no sprint-change-proposals."));
  }
  return el("div", null,
    ...d.items.map(it =>
      el("div", { class: "todo" },
        el("div", { class: "src" }, it.source),
        el("div", { class: "body" },
          el("strong", null, it.title),
          el("span", null, it.detail)))));
}

function renderGraph(d) {
  if (d.__error) return renderError(d);
  if (!d.has_graph) {
    return el("div", { class: "panel" },
      el("p", { class: "empty" },
        "No graph at .coldpress/graph/graph.json. Run \`coldpress graph rebuild\` first."));
  }
  const select = el("select", { id: "graph-pick", onchange: () => {
    const iframe = document.getElementById("graph-iframe");
    iframe.src = "/graph/" + select.value + ".html";
  }}, ...d.subgraphs.map(s => {
    const opt = el("option", { value: s }, s);
    return opt;
  }));
  const iframe = el("iframe", { class: "graph", id: "graph-iframe", src: "/graph/" + d.subgraphs[0] + ".html" });
  return el("div", null,
    el("div", { class: "panel" },
      el("h2", null, "Graph (" + d.node_count + " nodes / " + d.edge_count + " edges)"),
      el("p", null, "View: ", select)),
    iframe);
}

function renderQuickLinks(d) {
  if (d.__error) return renderError(d);
  if (d.links.length === 0) {
    return el("div", { class: "panel" }, el("p", { class: "empty" }, "No links yet."));
  }
  const groups = ["deploy","repo","audit","doc"];
  return el("div", null,
    ...groups.map(g => {
      const subset = d.links.filter(l => l.category === g);
      if (subset.length === 0) return null;
      return el("div", { class: "panel" },
        el("h2", null, g),
        el("div", { class: "links" },
          ...subset.map(l => el("a", { href: l.href, target: "_blank", rel: "noopener" }, l.label))));
    }).filter(Boolean));
}

const renderers = {
  "status": renderStatus,
  "stats": renderStats,
  "sanity": renderSanity,
  "tech-stack": renderTechStack,
  "todos": renderTodos,
  "graph": renderGraph,
  "quick-links": renderQuickLinks,
};

async function refresh() {
  const data = await fetchTab(active);
  const main = document.getElementById("content");
  main.innerHTML = "";
  main.appendChild(renderers[active](data));
  document.getElementById("last-update").textContent = "updated " + new Date().toLocaleTimeString();
}

function selectTab(name) {
  active = name;
  for (const btn of document.querySelectorAll("#tabs button")) {
    btn.classList.toggle("active", btn.dataset.tab === name);
  }
  refresh();
}

document.querySelectorAll("#tabs button").forEach(btn => {
  btn.addEventListener("click", () => selectTab(btn.dataset.tab));
});

refresh();
pollTimer = setInterval(refresh, POLL_MS);
</script>
</body>
</html>
`;
