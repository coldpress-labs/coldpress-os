/**
 * Tests for .coldpress/local-config.yaml — validator + read/write helpers.
 * Wave 3.3 of Phase II Part 1.
 */

import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  LocalConfigValidationError,
  assertValidLocalConfig,
  validateLocalConfig,
} from "../src/utils/local-config-validator";
import {
  clearStepMarker,
  markStepStart,
  readLocalConfig,
  updateLocalConfig,
  writeLocalConfig,
} from "../src/utils/local-config";

describe("validateLocalConfig", () => {
  it("accepts an empty yaml file (fresh project)", () => {
    const r = validateLocalConfig("");
    expect(r.valid).toBe(true);
    expect(r.data).toEqual({});
  });

  it("accepts a fully-formed config", () => {
    const yaml = `
phase_1_completed: true
phase_1_completed_at: "2026-04-24T12:34:56Z"
orient_skipped: false
project_shape: greenfield
partial_completion: null
needs_graph_rebuild: false
`;
    expect(validateLocalConfig(yaml).valid).toBe(true);
  });

  it("rejects a non-mapping root", () => {
    const r = validateLocalConfig("- list");
    expect(r.valid).toBe(false);
    expect(r.errors[0]?.message).toMatch(/mapping/);
  });

  it("rejects non-boolean phase_1_completed", () => {
    const r = validateLocalConfig(`phase_1_completed: "yes"`);
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.path === "phase_1_completed")).toBe(true);
  });

  it("rejects project_shape not in the enum", () => {
    const r = validateLocalConfig(`project_shape: unknown`);
    expect(r.valid).toBe(false);
    expect(r.errors[0]?.message).toMatch(/greenfield\|brownfield\|ambiguous/);
  });

  it("rejects partial_completion missing step_id", () => {
    const r = validateLocalConfig(`partial_completion:\n  at: "2026-04-24T00:00:00Z"`);
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.path === "partial_completion.step_id")).toBe(true);
  });

  it("rejects partial_completion with unparseable timestamp", () => {
    const r = validateLocalConfig(
      `partial_completion:\n  step_id: "step-01"\n  at: "not-a-date"`,
    );
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.path === "partial_completion.at")).toBe(true);
  });

  it("accepts partial_completion: null", () => {
    expect(validateLocalConfig("partial_completion: null").valid).toBe(true);
  });

  it("warns when needs_graph_rebuild is true but graph_rebuild_error is empty", () => {
    const r = validateLocalConfig("needs_graph_rebuild: true");
    expect(r.valid).toBe(true);
    expect(r.warnings.some((w) => w.path === "graph_rebuild_error")).toBe(true);
  });

  it("rejects non-parseable phase_1_completed_at timestamp", () => {
    const r = validateLocalConfig(`phase_1_completed_at: "yesterday"`);
    expect(r.valid).toBe(false);
    expect(r.errors.some((e) => e.path === "phase_1_completed_at")).toBe(true);
  });

  it("assertValidLocalConfig throws on invalid input", () => {
    expect(() => assertValidLocalConfig("project_shape: oops")).toThrow(LocalConfigValidationError);
  });
});

describe("read/write helpers", () => {
  let tmp: string;

  beforeEach(async () => {
    tmp = await mkdtemp(join(tmpdir(), "coldpress-localcfg-"));
  });

  afterEach(async () => {
    await rm(tmp, { recursive: true, force: true });
  });

  it("readLocalConfig returns {} when the file doesn't exist", async () => {
    expect(await readLocalConfig(tmp)).toEqual({});
  });

  it("writeLocalConfig then readLocalConfig round-trips the data", async () => {
    await writeLocalConfig(tmp, { phase_1_completed: true, project_shape: "greenfield" });
    const out = await readLocalConfig(tmp);
    expect(out.phase_1_completed).toBe(true);
    expect(out.project_shape).toBe("greenfield");
  });

  it("updateLocalConfig merges, preserving untouched fields", async () => {
    await writeLocalConfig(tmp, { phase_1_completed: false, project_shape: "greenfield" });
    await updateLocalConfig(tmp, { phase_1_completed: true });
    const out = await readLocalConfig(tmp);
    expect(out.phase_1_completed).toBe(true);
    expect(out.project_shape).toBe("greenfield");
  });

  it("markStepStart writes partial_completion; clearStepMarker sets it to null", async () => {
    const after = await markStepStart(tmp, "step-04-working-mode");
    expect(after.partial_completion?.step_id).toBe("step-04-working-mode");
    expect(typeof after.partial_completion?.at).toBe("string");

    const cleared = await clearStepMarker(tmp);
    expect(cleared.partial_completion).toBeNull();

    // On-disk file reflects the null as yaml `null` or empty.
    const raw = await readFile(join(tmp, ".coldpress", "local-config.yaml"), "utf8");
    expect(raw).toMatch(/partial_completion:\s*(null|~|$)/m);
  });

  it("readLocalConfig throws on invalid existing file", async () => {
    await writeLocalConfig(tmp, {});
    // Clobber with invalid content.
    const { writeFile } = await import("node:fs/promises");
    await writeFile(join(tmp, ".coldpress", "local-config.yaml"), "project_shape: wrong\n");
    await expect(readLocalConfig(tmp)).rejects.toThrow(LocalConfigValidationError);
  });
});
