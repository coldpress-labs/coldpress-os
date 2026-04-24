/**
 * Project Dashboard tests (§6.10).
 *
 * Covers:
 *   - Each tab assembler against a synthetic fixture project (unit).
 *   - HTTP server spawn → GET each endpoint → assert JSON shape +
 *     HTML render (integration).
 *   - Read-only enforcement (POST/PUT/DELETE → 405).
 *   - Path-traversal protection on /file/<path>.
 */

import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { startDashboardServer } from "../src/dashboard/server";
import { assembleGraph } from "../src/dashboard/tabs/graph";
import { assembleQuickLinks } from "../src/dashboard/tabs/quick-links";
import { assembleSanity } from "../src/dashboard/tabs/sanity";
import { assembleStats } from "../src/dashboard/tabs/stats";
import { assembleStatus } from "../src/dashboard/tabs/status";
import { assembleTechStack } from "../src/dashboard/tabs/tech-stack";
import { assembleTodos } from "../src/dashboard/tabs/todos";

let workDir: string;

beforeEach(async () => {
  workDir = await mkdtemp(join(tmpdir(), "coldpress-dashboard-"));
});

afterEach(async () => {
  await rm(workDir, { recursive: true, force: true });
});

async function seed(rel: string, content: string): Promise<void> {
  const path = join(workDir, rel);
  await mkdir(join(path, ".."), { recursive: true });
  await writeFile(path, content, "utf8");
}

describe("assembleStatus", () => {
  it("returns nulls when project is empty", async () => {
    const data = await assembleStatus(workDir);
    expect(data.project).toBeNull();
    expect(data.current_phase).toBeNull();
    expect(data.last_gate_evaluation).toBeNull();
    expect(data.sacred_doc_signoffs).toEqual([]);
  });

  it("reads project identity from coldpress.yaml", async () => {
    await seed(
      "coldpress.yaml",
      'project:\n  name: "Demo"\n  slug: "demo"\nuser:\n  name: "Aastha"\n',
    );
    const data = await assembleStatus(workDir);
    expect(data.project).toEqual({ name: "Demo", slug: "demo" });
  });

  it("surfaces the latest gate-eval JSON", async () => {
    await seed(
      "_context/audit/gate-eval-phase-4-2026-04-01.json",
      JSON.stringify({
        gate_id: "phase-4-exit",
        phase: 4,
        overall: "fail",
        evaluated_at: "2026-04-01T10:00:00Z",
      }),
    );
    await seed(
      "_context/audit/gate-eval-phase-4-2026-04-15.json",
      JSON.stringify({
        gate_id: "phase-4-exit",
        phase: 4,
        overall: "pass",
        evaluated_at: "2026-04-15T12:00:00Z",
      }),
    );
    const data = await assembleStatus(workDir);
    expect(data.last_gate_evaluation?.overall).toBe("pass");
    expect(data.current_phase).toBe(4);
    expect(data.current_phase_name).toBe("Planning");
  });

  it("collects signoffs from .coldpress/signoffs/<gate>/<check>.yaml", async () => {
    await seed(
      ".coldpress/signoffs/phase-4-exit/prd-signoff.yaml",
      'signed_by: "user"\nsigned_at: "2026-04-15T12:00:00Z"\n',
    );
    const data = await assembleStatus(workDir);
    expect(data.sacred_doc_signoffs).toHaveLength(1);
    expect(data.sacred_doc_signoffs[0]).toMatchObject({
      gate_id: "phase-4-exit",
      check_id: "prd-signoff",
      signed_by: "user",
    });
  });
});

describe("assembleStats", () => {
  it("reports zeros when no events / no graph / no sacred", async () => {
    const data = await assembleStats(workDir);
    expect(data.skill_invocations.total).toBe(0);
    expect(data.graph).toBeNull();
    expect(data.sacred_docs.present).toBe(0);
    expect(data.sacred_docs.missing.length).toBe(5);
    expect(data.runs.total).toBe(0);
  });

  it("aggregates skill events from .coldpress/runs/*/events.jsonl", async () => {
    const events = [
      {
        schema_version: 1,
        seq: 0,
        run_id: "run-1",
        timestamp: "2026-04-24T15:00:00Z",
        kind: "skill-invoke",
        skill_id: "create-prd",
      },
      {
        schema_version: 1,
        seq: 1,
        run_id: "run-1",
        timestamp: "2026-04-24T15:00:01Z",
        kind: "skill-result",
        skill_id: "create-prd",
        cause_seq: 0,
        exit_code: 0,
      },
      {
        schema_version: 1,
        seq: 2,
        run_id: "run-1",
        timestamp: "2026-04-24T15:00:02Z",
        kind: "skill-invoke",
        skill_id: "validate-schema",
      },
      {
        schema_version: 1,
        seq: 3,
        run_id: "run-1",
        timestamp: "2026-04-24T15:00:03Z",
        kind: "skill-result",
        skill_id: "validate-schema",
        cause_seq: 2,
        exit_code: 1,
      },
    ];
    await seed(
      ".coldpress/runs/run-1/events.jsonl",
      events.map((e) => JSON.stringify(e)).join("\n") + "\n",
    );
    const data = await assembleStats(workDir);
    expect(data.skill_invocations.total).toBe(2);
    expect(data.skill_invocations.success).toBe(1);
    expect(data.skill_invocations.fail).toBe(1);
    expect(data.skill_invocations.by_skill).toEqual({
      "create-prd": 1,
      "validate-schema": 1,
    });
    expect(data.runs.total).toBe(1);
    expect(data.runs.latest).toBe("run-1");
  });

  it("counts sacred docs that exist", async () => {
    await seed("_context/sacred/prd.md", "# PRD\n");
    await seed("_context/sacred/architecture.md", "# Arch\n");
    const data = await assembleStats(workDir);
    expect(data.sacred_docs.present).toBe(2);
    expect(data.sacred_docs.missing).toEqual([
      "context.md",
      "tech-stack.md",
      "pert-chart.md",
    ]);
  });

  it("reads graph node/edge counts when present", async () => {
    const graph = {
      directed: true,
      multigraph: false,
      graph: { schema_version: 1 },
      nodes: [
        { id: "a", label: "A" },
        { id: "b", label: "B" },
      ],
      links: [{ source: "a", target: "b" }],
    };
    await seed(".coldpress/graph/graph.json", JSON.stringify(graph));
    const data = await assembleStats(workDir);
    expect(data.graph).toEqual({ node_count: 2, edge_count: 1 });
  });
});

describe("assembleSanity", () => {
  it("emits all 5 panels for an empty project (mostly OK)", async () => {
    const data = await assembleSanity(workDir);
    expect(data.panels.length).toBe(5);
    // Pre-Phase-2 project: the only warn is missing secure manifest.
    const warns = data.panels.filter((p) => p.status === "warn");
    expect(warns.map((p) => p.id)).toEqual(["secure-manifest-present"]);
    expect(data.overall).toBe("warn");
  });

  it("flags missing-frontmatter sacred docs as fail", async () => {
    await seed("_context/sacred/prd.md", "# PRD without frontmatter\n");
    const data = await assembleSanity(workDir);
    const fm = data.panels.find((p) => p.id === "sacred-doc-frontmatter");
    expect(fm?.status).toBe("fail");
    expect(data.overall).toBe("fail");
  });

  it("flags failing security aggregate as fail", async () => {
    await seed(
      "_context/audit/security/aggregate-2026-04-24.json",
      JSON.stringify({ overall: "fail", blockers: ["a", "b"], totals: { high: 2 } }),
    );
    const data = await assembleSanity(workDir);
    const sec = data.panels.find((p) => p.id === "security-gate-aggregate");
    expect(sec?.status).toBe("fail");
  });

  it("flags failing review JSON as fail", async () => {
    await seed(
      "_context/audit/reviews/prd-review-2026-04-24.json",
      JSON.stringify({ overall: "fail" }),
    );
    const data = await assembleSanity(workDir);
    const rev = data.panels.find((p) => p.id === "reviewer-fails");
    expect(rev?.status).toBe("fail");
  });
});

describe("assembleTechStack", () => {
  it("returns present:false when missing", async () => {
    const data = await assembleTechStack(workDir);
    expect(data.present).toBe(false);
    expect(data.frontmatter).toBeNull();
  });

  it("extracts frontmatter when present", async () => {
    await seed(
      "_context/sacred/tech-stack.md",
      '---\nstack_pack: vibe-coder\nworkflowType: tech-stack\n---\n# body\n',
    );
    const data = await assembleTechStack(workDir);
    expect(data.present).toBe(true);
    expect(data.frontmatter).toMatchObject({
      stack_pack: "vibe-coder",
      workflowType: "tech-stack",
    });
  });
});

describe("assembleTodos", () => {
  it("returns empty list for empty project", async () => {
    const data = await assembleTodos(workDir);
    expect(data.items).toEqual([]);
  });

  it("surfaces blockers from latest gate-eval", async () => {
    await seed(
      "_context/audit/gate-eval-phase-7-2026-04-24.json",
      JSON.stringify({
        gate_id: "phase-7-exit",
        phase: 7,
        blockers: ["security-scan-classical", "deploy-succeeded"],
      }),
    );
    const data = await assembleTodos(workDir);
    expect(data.items.filter((i) => i.source === "gate-blocker")).toHaveLength(2);
  });

  it("surfaces sprint-change-proposals", async () => {
    await seed(
      "_context/planning/sprint-change-proposal-001.md",
      "# proposal\n",
    );
    const data = await assembleTodos(workDir);
    expect(
      data.items.some((i) => i.source === "sprint-change-proposal"),
    ).toBe(true);
  });
});

describe("assembleGraph", () => {
  it("returns has_graph:false when missing", async () => {
    const data = await assembleGraph(workDir);
    expect(data.has_graph).toBe(false);
    expect(data.subgraphs).toContain("sacred-doc-lineage");
  });

  it("returns counts when present", async () => {
    await seed(
      ".coldpress/graph/graph.json",
      JSON.stringify({
        directed: true,
        multigraph: false,
        graph: { schema_version: 1 },
        nodes: [{ id: "a", label: "A" }],
        links: [],
      }),
    );
    const data = await assembleGraph(workDir);
    expect(data.has_graph).toBe(true);
    expect(data.node_count).toBe(1);
    expect(data.edge_count).toBe(0);
  });
});

describe("assembleQuickLinks", () => {
  it("emits the CHANGELOG link by default + nothing else when no yaml", async () => {
    const data = await assembleQuickLinks(workDir);
    expect(data.links.some((l) => l.label === "CHANGELOG")).toBe(true);
  });

  it("surfaces sandbox/live/repo from coldpress.yaml deployment block", async () => {
    await seed(
      "coldpress.yaml",
      "deployment:\n  sandbox: \"https://sandbox.example.com\"\n  live: \"https://example.com\"\nrepo:\n  url: \"https://github.com/x/y\"\n",
    );
    const data = await assembleQuickLinks(workDir);
    const labels = data.links.map((l) => l.label);
    expect(labels).toContain("Sandbox");
    expect(labels).toContain("Live");
    expect(labels).toContain("Repo");
  });

  it("lists recent audit JSON files (capped at 8)", async () => {
    for (let i = 0; i < 10; i++) {
      await seed(
        `_context/audit/file-${i.toString().padStart(2, "0")}.json`,
        "{}",
      );
    }
    const data = await assembleQuickLinks(workDir);
    const auditLinks = data.links.filter((l) => l.category === "audit");
    expect(auditLinks.length).toBe(8);
  });
});

describe("DashboardServer — integration", () => {
  it("serves the SPA at /", async () => {
    const server = await startDashboardServer({ projectDir: workDir, port: 0 });
    try {
      const res = await fetch(`${server.url}/`);
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toMatch(/text\/html/);
      const body = await res.text();
      expect(body).toContain("<!doctype html>");
      expect(body).toContain('data-tab="status"');
      expect(body).toContain('data-tab="graph"');
    } finally {
      await server.close();
    }
  });

  it("serves /api/<tab> as JSON", async () => {
    const server = await startDashboardServer({ projectDir: workDir, port: 0 });
    try {
      for (const tab of [
        "status",
        "stats",
        "sanity",
        "tech-stack",
        "todos",
        "graph",
        "quick-links",
      ]) {
        const res = await fetch(`${server.url}/api/${tab}`);
        expect(res.status, `tab ${tab}`).toBe(200);
        expect(res.headers.get("content-type"), `tab ${tab}`).toMatch(
          /application\/json/,
        );
        const body = await res.json();
        expect(typeof body, `tab ${tab}`).toBe("object");
      }
    } finally {
      await server.close();
    }
  });

  it("returns 404 for unknown /api/<tab>", async () => {
    const server = await startDashboardServer({ projectDir: workDir, port: 0 });
    try {
      const res = await fetch(`${server.url}/api/nope`);
      expect(res.status).toBe(404);
    } finally {
      await server.close();
    }
  });

  it("returns 503 for /graph/*.html when no graph is present", async () => {
    const server = await startDashboardServer({ projectDir: workDir, port: 0 });
    try {
      const res = await fetch(`${server.url}/graph/sacred-doc-lineage.html`);
      expect(res.status).toBe(503);
      const body = await res.text();
      expect(body).toContain("No graph available");
    } finally {
      await server.close();
    }
  });

  it("returns 404 for /graph/<unknown>.html", async () => {
    const server = await startDashboardServer({ projectDir: workDir, port: 0 });
    try {
      const res = await fetch(`${server.url}/graph/nope.html`);
      expect(res.status).toBe(404);
    } finally {
      await server.close();
    }
  });

  it("rejects non-GET methods with 405", async () => {
    const server = await startDashboardServer({ projectDir: workDir, port: 0 });
    try {
      const res = await fetch(`${server.url}/api/status`, { method: "POST" });
      expect(res.status).toBe(405);
      expect(res.headers.get("allow")).toBe("GET, HEAD");
    } finally {
      await server.close();
    }
  });

  it("/file/<path> serves a project file", async () => {
    await seed("CHANGELOG.md", "# changes\n");
    const server = await startDashboardServer({ projectDir: workDir, port: 0 });
    try {
      const res = await fetch(`${server.url}/file/CHANGELOG.md`);
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toMatch(/text\/markdown/);
      expect(await res.text()).toContain("# changes");
    } finally {
      await server.close();
    }
  });

  it("/file/<traversal> is rejected (403 explicitly, or 404 after URL-normalisation)", async () => {
    const server = await startDashboardServer({ projectDir: workDir, port: 0 });
    try {
      // URL-encoded traversal survives fetch's URL normalisation, so it
      // arrives at the server intact. Server's safeJoin() refuses → 403.
      const encoded = await fetch(`${server.url}/file/%2E%2E%2F%2E%2E%2Fetc%2Fpasswd`);
      expect(encoded.status).toBe(403);

      // Plain `..` gets normalised by the URL parser before the fetch
      // even leaves the client — it never reaches our handler. Status
      // ends up 404 (or 403 on some platforms). Either is acceptable;
      // the canonical traversal-block contract is the encoded case.
      const plain = await fetch(`${server.url}/file/../../etc/passwd`);
      expect([403, 404]).toContain(plain.status);
    } finally {
      await server.close();
    }
  });

  it("binds to 127.0.0.1 by default", async () => {
    const server = await startDashboardServer({ projectDir: workDir, port: 0 });
    try {
      expect(server.host).toBe("127.0.0.1");
      expect(server.url.startsWith("http://127.0.0.1:")).toBe(true);
    } finally {
      await server.close();
    }
  });

  it("/healthz returns ok", async () => {
    const server = await startDashboardServer({ projectDir: workDir, port: 0 });
    try {
      const res = await fetch(`${server.url}/healthz`);
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toEqual({ ok: true });
    } finally {
      await server.close();
    }
  });
});
