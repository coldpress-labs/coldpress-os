import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { runCli } from "../src/cli.js";

let workDir: string;
// `process.stdout.write` has an overloaded signature that vi.spyOn's
// generic can't narrow cleanly. Cast the spy to `any` at the binding
// site only — keeps the rest of the suite typed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let stdoutSpy: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let stderrSpy: any;
let stdoutBuf: string;
let stderrBuf: string;

beforeEach(async () => {
  workDir = await mkdtemp(join(tmpdir(), "otel-exporter-cli-"));
  stdoutBuf = "";
  stderrBuf = "";
  stdoutSpy = vi
    .spyOn(process.stdout, "write")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .mockImplementation(((chunk: unknown) => {
      stdoutBuf += String(chunk);
      return true;
    }) as any);
  stderrSpy = vi
    .spyOn(process.stderr, "write")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .mockImplementation(((chunk: unknown) => {
      stderrBuf += String(chunk);
      return true;
    }) as any);
});

afterEach(async () => {
  stdoutSpy.mockRestore();
  stderrSpy.mockRestore();
  await rm(workDir, { recursive: true, force: true });
});

async function seedRun(runId: string): Promise<void> {
  const dir = join(workDir, ".coldpress/runs", runId);
  await mkdir(dir, { recursive: true });
  const lines = [
    {
      schema_version: 1,
      seq: 0,
      run_id: runId,
      timestamp: "2026-04-24T12:00:00.000Z",
      kind: "wave-start",
      wave_id: "w",
      phase: 4,
    },
    {
      schema_version: 1,
      seq: 1,
      run_id: runId,
      timestamp: "2026-04-24T12:00:01.000Z",
      kind: "wave-end",
      wave_id: "w",
      phase: 4,
      status: "success",
    },
  ];
  await writeFile(
    join(dir, "events.jsonl"),
    lines.map((l) => JSON.stringify(l)).join("\n") + "\n",
    "utf8",
  );
}

describe("CLI dispatch", () => {
  it("returns 2 when neither --run nor --latest nor --all is given", async () => {
    const code = await runCli([`--project-dir`, workDir]);
    expect(code).toBe(2);
    expect(stderrBuf).toMatch(/Specify --run/);
  });

  it("lists runs with --list and exits 0 without emitting", async () => {
    await seedRun("run-20260424-120000-aaaaaa");
    await seedRun("run-20260424-120001-bbbbbb");
    const code = await runCli([`--project-dir`, workDir, "--list"]);
    expect(code).toBe(0);
    expect(stdoutBuf).toContain("run-20260424-120000-aaaaaa");
    expect(stdoutBuf).toContain("run-20260424-120001-bbbbbb");
  });

  it("--list reports 'No runs found.' to stderr on an empty project", async () => {
    const code = await runCli([`--project-dir`, workDir, "--list"]);
    expect(code).toBe(0);
    expect(stderrBuf).toMatch(/No runs found/);
  });

  it("--dry-run maps spans and skips OTLP emission", async () => {
    const runId = "run-20260424-120000-aaaaaa";
    await seedRun(runId);
    const code = await runCli([
      `--project-dir`,
      workDir,
      "--run",
      runId,
      "--dry-run",
    ]);
    expect(code).toBe(0);
    expect(stderrBuf).toMatch(/would export \d+ spans \(--dry-run\)/);
  });

  it("--latest + --dry-run exports the most recent run", async () => {
    await seedRun("run-20260424-120000-aaaaaa");
    await seedRun("run-20260424-120005-zzzzzz");
    const code = await runCli([
      `--project-dir`,
      workDir,
      "--latest",
      "--dry-run",
    ]);
    expect(code).toBe(0);
    expect(stderrBuf).toContain("run-20260424-120005-zzzzzz");
    expect(stderrBuf).not.toContain("run-20260424-120000-aaaaaa");
  });

  it("--all + --dry-run walks every run", async () => {
    await seedRun("run-20260424-120000-aaaaaa");
    await seedRun("run-20260424-120005-zzzzzz");
    const code = await runCli([
      `--project-dir`,
      workDir,
      "--all",
      "--dry-run",
    ]);
    expect(code).toBe(0);
    expect(stderrBuf).toContain("run-20260424-120000-aaaaaa");
    expect(stderrBuf).toContain("run-20260424-120005-zzzzzz");
  });

  it("returns 2 when --run points at a non-existent run", async () => {
    const code = await runCli([
      `--project-dir`,
      workDir,
      "--run",
      "run-missing",
      "--dry-run",
    ]);
    expect(code).toBe(2);
    expect(stderrBuf).toMatch(/not found/);
  });

  it("returns 0 and reports 'No runs found.' when --all has zero runs", async () => {
    const code = await runCli([
      `--project-dir`,
      workDir,
      "--all",
      "--dry-run",
    ]);
    expect(code).toBe(0);
    expect(stderrBuf).toMatch(/No runs found/);
  });

  it("--quiet suppresses progress output", async () => {
    const runId = "run-20260424-120000-aaaaaa";
    await seedRun(runId);
    const code = await runCli([
      `--project-dir`,
      workDir,
      "--run",
      runId,
      "--dry-run",
      "--quiet",
    ]);
    expect(code).toBe(0);
    expect(stderrBuf).toBe("");
  });
});
