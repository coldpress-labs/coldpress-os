/**
 * WS10-A4/A5: verifier packet + verdict schemas, `coldpress verdict record`
 * (appends a `verdict` EventStream event), and evolve counting verdict tags.
 */

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { VerifierPacketSchema, VerifierVerdictSchema } from "../schemas/operations/verifier-verdict.schema";
import { recordVerdict } from "../src/commands/verdict";
import { listRuns, readRun } from "../src/event-stream/reader";
import { aggregateEvolve } from "../src/evolve/aggregate";
import type { Event } from "../schemas/event-stream.schema";

describe("VerifierPacketSchema — verifier-on-opus (A3/A4)", () => {
  const base = { schema_version: 1 as const, story_id: "ST-1", spec_ref: "s", acceptance_ref: "a", diff_ref: "d" };
  it("accepts a security packet on opus", () => {
    expect(VerifierPacketSchema.safeParse({ ...base, security: true, to: { agent: "verifier", model: "opus" } }).success).toBe(true);
  });
  it("REJECTS a security packet on a non-opus model", () => {
    expect(VerifierPacketSchema.safeParse({ ...base, security: true, to: { agent: "verifier", model: "sonnet" } }).success).toBe(false);
  });
  it("allows a non-security packet on sonnet", () => {
    expect(VerifierPacketSchema.safeParse({ ...base, to: { agent: "verifier", model: "sonnet" } }).success).toBe(true);
  });
});

describe("VerifierVerdictSchema", () => {
  it("a fail verdict must carry a finding", () => {
    expect(VerifierVerdictSchema.safeParse({ schema_version: 1, story_id: "ST-1", model: "opus", verdict: "fail", findings: [] }).success).toBe(false);
    expect(
      VerifierVerdictSchema.safeParse({ schema_version: 1, story_id: "ST-1", model: "opus", verdict: "fail", findings: [{ kind: "spec-mismatch", detail: "x" }] }).success,
    ).toBe(true);
  });
  it("a pass verdict needs no findings", () => {
    expect(VerifierVerdictSchema.safeParse({ schema_version: 1, story_id: "ST-1", model: "sonnet", verdict: "pass" }).success).toBe(true);
  });
});

describe("coldpress verdict record → EventStream → evolve leaderboard (A4)", () => {
  let dir: string;
  beforeEach(() => {
    dir = mkdtempSync(join(tmpdir(), "coldpress-verdict-"));
  });
  afterEach(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  it("records a verdict event whose tags evolve then counts", async () => {
    writeFileSync(
      join(dir, "v.yaml"),
      "schema_version: 1\nstory_id: ST-8\nmodel: opus\nverdict: fail\nfindings:\n  - { kind: gamed-assertion, detail: tautology, taxonomy_tag: gamed-test }\ntaxonomy_tags: [gamed-test, schema-violation]\n",
    );
    const code = await recordVerdict(join(dir, "v.yaml"), { projectDir: dir, runId: "run-test", stdout: () => {}, stderr: () => {} });
    expect(code).toBe(0);

    const runs = await listRuns({ projectDir: dir });
    expect(runs).toContain("run-test");
    const events = (await readRun("run-test", { projectDir: dir })) as Event[];
    const verdict = events.find((e) => e.kind === "verdict");
    expect(verdict).toMatchObject({ story_id: "ST-8", verdict: "fail", model: "opus" });

    // evolve counts the verdict's tags into the failure leaderboard (was always empty before).
    const report = aggregateEvolve({ events, projects: 1, runs: 1 });
    const tags = report.failure_leaderboard.map((f) => f.tag);
    expect(tags).toContain("gamed-test");
    expect(tags).toContain("schema-violation");
  });

  it("rejects an invalid verdict record (exit 1, no event)", async () => {
    writeFileSync(join(dir, "bad.yaml"), "schema_version: 1\nstory_id: ST-1\nmodel: opus\nverdict: fail\nfindings: []\n");
    const code = await recordVerdict(join(dir, "bad.yaml"), { projectDir: dir, runId: "run-x", stdout: () => {}, stderr: () => {} });
    expect(code).toBe(1);
    expect(await listRuns({ projectDir: dir })).not.toContain("run-x");
  });
});
