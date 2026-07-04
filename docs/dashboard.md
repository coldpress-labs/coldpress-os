---
name: dashboard
description: Localhost-served single-page project-management dashboard reading status / stats / sanity / tech-stack / to-dos / graph / quick-links from existing artefacts; dependency-light, read-only, 127.0.0.1 only
version: "1.0"
---

# Project Dashboard (§6.10)

> The framework emits many structured artefacts (`coldpress.yaml`, sacred docs, `.coldpress/graph/graph.json`, EventStream JSONL, gate-eval JSON, sprint-status, NEED_INFO budgets) but no single-pane view aggregates them. This block adds one. **Reflective of the coldpress-os usage — NOT the product being built.** Builds and evolves as the project grows; no separate authoring step.

**Source decision:** user directive 2026-04-24 during Wave 6 kickoff.

---

## Quickstart

```bash
coldpress dashboard
# ► http://127.0.0.1:7777
```

Options:
- `--port <n>` — port to bind (default 7777). Loopback only by design.
- `--open` — launch the default browser at the dashboard URL.
- `--poll-ms <n>` — tab refresh interval (default 10000ms).

The server runs in the foreground. Ctrl-C to stop.

---

## Architecture

**Dependency-light.** Single-page HTML + vanilla JS — no React, no Next.js, no htmx (yet — could fold in if interactivity grows). Node's built-in `node:http` for the server. Preserves the "npm install and go" DX.

**Read-only.** Every method other than `GET`/`HEAD` returns `405 Method Not Allowed`. State-mutating actions stay in the `coldpress` CLI; the dashboard never writes to disk.

**Single-user.** Binds to `127.0.0.1` only — explicitly never `0.0.0.0`. No authentication layer. A user running this on a multi-user machine is out of scope; document the localhost constraint loudly.

**Polling, not websockets.** Each tab fetches its `/api/<tab>` endpoint independently every N seconds (default 10s). Slow tab doesn't block fast ones. Websockets / SSE deferred to v1.5 if polling UX proves noisy.

**Tabs are pure functions.** Each tab is `(projectDir) → JSON`. No daemon state. Adding a tab = drop a new pure-function assembler under `src/dashboard/tabs/<name>.ts` + register in `TAB_HANDLERS` + add a button + renderer in the SPA.

---

## The 7 v1 tabs

| Tab | Reads from | What it shows |
|-----|------------|---------------|
| **Status** | `coldpress.yaml`, latest `_context/audit/gate-eval-phase-N-*.json`, `.coldpress/signoffs/` | Project identity, current phase (inferred from latest gate-eval), last gate evaluation, every sacred-doc / phase-gate sign-off recorded. |
| **Stats** | EventStream `.coldpress/runs/*/events.jsonl`, `.coldpress/graph/graph.json`, `_context/sacred/` | Skill-invocation totals + pass/fail + per-skill counts; sacred-doc presence (5 expected); graph node/edge count; recorded run count + latest run id. |
| **Sanity** | `secure/manifest.yaml`, sacred-doc frontmatter, `_context/audit/security/aggregate-*.json`, `_context/tracking/sprint-status.yaml` mtime, `_context/audit/reviews/*.json` | 5 fail-loud panels: secure manifest presence, sacred-doc frontmatter integrity, security gate latest aggregate verdict, sprint-status freshness (warns if >14 days old), open `@reviewer` failures. Aggregates to overall ok/warn/fail. |
| **Tech Stack** | `_context/sacred/tech-stack.md` frontmatter | Frontmatter rendered as compact JSON view. Body intentionally NOT rendered — large markdown belongs in an editor. |
| **To-dos** | Latest gate-eval `blockers[]`, shipped `lifecycle/<N>/gate.json` `kind: human` checks vs. signoffs, `_context/planning/sprint-change-proposal-*.md` | Open gate blockers, pending `kind: human` sign-offs (cross-references shipped framework gates against signoffs on disk), open sprint-change-proposals. |
| **Graph** | `.coldpress/graph/graph.json` + Block CC visualizer | Embeds Block CC's `renderHtml()` output via `<iframe>` for each registered subgraph (`sacred-doc-lineage` / `prd-to-impl` / `promotion-status` / `deps`). Server generates the HTML on demand at `/graph/<slug>.html`. |
| **Quick Links** | `coldpress.yaml.deployment.{sandbox,live}` + `repo.url`, recent `_context/audit/*.json`, `CHANGELOG.md` | Sandbox / live URLs (declared in `coldpress.yaml`), repo URL, 8 most recent audit JSON files, CHANGELOG link. |

---

## Endpoint map

| Path | Method | Purpose |
|------|--------|---------|
| `GET /` | | Single-page HTML (the SPA) |
| `GET /api/<tab>` | | Tab JSON; 404 on unknown tab |
| `GET /graph/<subgraph>.html` | | Block CC visualizer output for a subgraph; 404 unknown, 503 no graph |
| `GET /file/<path>` | | Static file under projectDir (used by Quick Links + audit refs); path-traversal blocked |
| `GET /healthz` | | `{ok: true}` — for readiness probes |
| Other methods | | 405 Method Not Allowed |

The `/file/` route is path-safe: `safeJoin()` refuses `..` traversal (URL-encoded or otherwise) and absolute paths. It serves text MIME types (`md`, `txt`, `json`, `yaml`, `html`); other extensions go out as `application/octet-stream`. Caches are disabled (`Cache-Control: no-store`) on every response — the dashboard is meant to surface latest-on-disk state.

---

## Polling cadence + bandwidth

Each tab independently fetches its endpoint every `pollIntervalMs` (default 10s). For a typical project:
- Tab JSON: ~1-5 KB
- Graph endpoint: ~50-500 KB depending on subgraph size (Cytoscape elements inlined as JSON)
- SPA bundle: served once; ~10 KB gzipped HTML + inline CSS + inline JS

If polling burns excessive battery on dev laptops, raise `--poll-ms 30000` or higher. Hard polling stops when the tab is hidden (browser pauses inactive `setInterval` callbacks).

---

## Security posture

- **Loopback only.** `host` is hardcoded to `127.0.0.1`. No flag exposes anything else; if a user wants to expose the dashboard to a LAN they're explicitly out of scope and need to set up their own reverse proxy.
- **No authentication.** Single-user dev tool. Anyone with shell access to the machine can already read the project files; the dashboard adds no privilege.
- **Read-only HTTP.** No write endpoints. State mutations go through `coldpress` CLI which respects the existing sacred-doc / governance protocols.
- **Path-traversal hardened.** `/file/` serves project files only; `safeJoin()` blocks URL-encoded traversal and absolute paths.
- **No telemetry.** The server doesn't phone home. All data assembly + serving happens locally.

---

## Cytoscape sourcing — CDN today, vendored in v1.5

The Graph tab uses Block CC's `renderHtml()`, which references Cytoscape.js via CDN (`unpkg.com`). Works for typical dev machines with internet; offline use is degraded.

**v1.5 follow-up:** vendor Cytoscape into the npm package + serve from `/vendor/cytoscape.min.js` so the Graph tab works fully offline. Block GG ships with the CDN default to avoid bundling ~400 KB of JS into every npm tarball; vendoring is a separate scope decision.

---

## What's NOT in v1

- **File-watch / SSE.** Naïve polling. Block GG plan §"v1.5" calls out `node:fs/promises.watch` with `Last-Modified` header push as a follow-up if polling jitter proves annoying.
- **Authoring UI.** No editor surface. Sacred-doc edits stay in your editor + `coldpress` CLI.
- **Multi-project view.** One server, one project. Dashboarding multiple projects = run multiple `coldpress dashboard` instances on different ports.
- **Mobile layout.** Desktop-first; no responsive breakpoints below ~700px.
- **Persistence across sessions.** Server is stateless; every request reads fresh from disk.
- **Auth, RBAC, sharing.** Single-user dev-time tool.

---

## Extending — add an 8th tab

1. Author a pure-function assembler at `src/dashboard/tabs/<name>.ts`:
   ```ts
   export async function assembleMyTab(projectDir: string): Promise<MyTabData> {
     // read from disk, return typed JSON
   }
   ```
2. Add the data shape to `src/dashboard/types.ts`.
3. Register the assembler in `TAB_HANDLERS` (`src/dashboard/server.ts`).
4. Add the tab button + renderer function in `src/dashboard/render/page.ts`'s inline JS.
5. Test: assembler unit test (synthetic fixture under `tmpdir()`) + integration test asserting `/api/<name>` returns shape.

No framework-level glue. The dashboard is intentionally cheap to extend.

---

## See also

- [`graph-visualizer.md`](graph-visualizer.md) — Block CC; Graph tab embeds via `/graph/<subgraph>.html`.
- [`event-stream.md`](event-stream.md) — Block DD; Stats tab reads skill counts from EventStream.
- [`phase-gate-protocol.md`](phase-gate-protocol.md) — §5.0; Status + To-dos tabs surface gate evaluations + blockers.
- [`reviewer-subagent.md`](reviewer-subagent.md) — Block EE; Sanity tab surfaces failing reviews.
- [`coldpress-yaml-schema.md`](coldpress-yaml-schema.md) — `deployment:` + `repo:` blocks are the source for Quick Links.

---

## Orchestration context

> **Hello Butler.** Butler is coldpress-os's main orchestrator agent — your default Claude Code session running with `CLAUDE.md` as its directive. Butler dispatches the 8 Shape A subagents (analyst · architect · pm · ux-designer · developer · verifier · devops · reviewer) and runs the phase gates. The protocol / spec / schema documented above is invoked by Butler (or by a Butler-dispatched subagent) at the relevant phase. See [`butler.md`](butler.md) for the orchestrator reference and the canonical `Hello Butler` entry point.

