import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { scoreCheck } from "../src/evals/score";
import { discoverTasks, runEvals, scoreTask } from "../src/evals/run";
import type { EvalTask } from "../schemas/eval-task.schema";

let ws: string;
let evalsDir: string;

beforeEach(async () => {
  ws = await mkdtemp(join(tmpdir(), "coldpress-evals-ws-"));
  evalsDir = await mkdtemp(join(tmpdir(), "coldpress-evals-tasks-"));
  await mkdir(join(ws, ".coldpress"), { recursive: true });
  await writeFile(join(ws, "spec.md"), "# Spec\n\n<!-- token: --color-primary -->\n");
  await writeFile(
    join(ws, ".coldpress", "state.yaml"),
    "lane: lite\nphase: spec\nphase_status: complete\nsecurity_tier: T0\nenforcement: on\ngates:\n  spec:\n    done: true\n    exited: '2026-07-03T00:00:00Z'\n  build:\n    done: false\n",
  );
});

afterEach(async () => {
  await rm(ws, { recursive: true, force: true });
  await rm(evalsDir, { recursive: true, force: true });
});

describe("scoreCheck (WS7-B)", () => {
  it("file-exists / file-absent", () => {
    expect(scoreCheck({ kind: "file-exists", target: "spec.md" }, ws).passed).toBe(true);
    expect(scoreCheck({ kind: "file-exists", target: "nope.md" }, ws).passed).toBe(false);
    expect(scoreCheck({ kind: "file-absent", target: "nope.md" }, ws).passed).toBe(true);
    expect(scoreCheck({ kind: "file-absent", target: "spec.md" }, ws).passed).toBe(false);
  });

  it("gate-green reads state.yaml", () => {
    expect(scoreCheck({ kind: "gate-green", target: "spec" }, ws).passed).toBe(true);
    expect(scoreCheck({ kind: "gate-green", target: "build" }, ws).passed).toBe(false); // done:false
    expect(scoreCheck({ kind: "gate-green", target: "verify" }, ws).passed).toBe(false); // missing
  });

  it("grep / grep-absent", () => {
    expect(scoreCheck({ kind: "grep", target: "spec.md::--color-primary" }, ws).passed).toBe(true);
    expect(scoreCheck({ kind: "grep-absent", target: "spec.md::TODO" }, ws).passed).toBe(true);
    expect(scoreCheck({ kind: "grep", target: "spec.md::nonsense" }, ws).passed).toBe(false);
  });

  it("no-secret flags a committed key", async () => {
    expect(scoreCheck({ kind: "no-secret", target: "." }, ws).passed).toBe(true);
    await writeFile(join(ws, "leak.env"), "OPENAI_API_KEY=sk-abcdefghijklmnopqrstuvwxyz012345\n");
    expect(scoreCheck({ kind: "no-secret", target: "." }, ws).passed).toBe(false);
  });

  it("schema-valid = parses; rubric skipped (null)", async () => {
    expect(scoreCheck({ kind: "schema-valid", target: ".coldpress/state.yaml" }, ws).passed).toBe(true);
    expect(scoreCheck({ kind: "rubric", target: "is the copy clear?" }, ws).passed).toBeNull();
  });
});

const task: EvalTask = {
  schema_version: 1,
  id: "spec-produces-spec-md",
  description: "spec.md exists + spec gate green",
  lane: "lite",
  prompt: "run spec",
  checks: [
    { kind: "file-exists", target: "spec.md" },
    { kind: "gate-green", target: "spec" },
  ],
  guards_against: ["skipped-gate"],
  timeout_s: 600,
};

describe("scoreTask + runEvals (WS7-B)", () => {
  it("a task passes when all deterministic checks pass", () => {
    const r = scoreTask(task, ws);
    expect(r.passed).toBe(true);
    expect(r.taxonomy_tags).toEqual([]);
  });

  it("a failing task carries its guards_against as taxonomy tags", () => {
    const bad: EvalTask = { ...task, checks: [{ kind: "gate-green", target: "build" }] };
    const r = scoreTask(bad, ws);
    expect(r.passed).toBe(false);
    expect(r.taxonomy_tags).toEqual(["skipped-gate"]);
  });

  it("discovers + runs tasks from an evals dir → per-task pass/fail", async () => {
    await writeFile(join(evalsDir, "a.yaml"), JSON.stringify(task));
    await writeFile(join(evalsDir, "b.yaml"), JSON.stringify({ ...task, id: "will-fail", checks: [{ kind: "file-exists", target: "missing.md" }], guards_against: ["wrong-file-target"] }));
    expect(discoverTasks(evalsDir)).toHaveLength(2);
    const report = runEvals({ evalsDir, workspace: ws });
    expect(report.passed).toBe(1);
    expect(report.failed).toBe(1);
  });
});
