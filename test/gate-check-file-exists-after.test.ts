/**
 * Unit tests for src/gate/checks/file-exists-after.ts (§4.14).
 */

import { mkdtemp, mkdir, rm, writeFile, utimes } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { fileExistsAfter } from "../src/gate/checks/file-exists-after";

let workDir: string;

beforeEach(async () => {
  workDir = await mkdtemp(join(tmpdir(), "coldpress-file-exists-after-"));
  await mkdir(join(workDir, "_context", "audit"), { recursive: true });
  await mkdir(join(workDir, ".coldpress"), { recursive: true });
});

afterEach(async () => {
  await rm(workDir, { recursive: true, force: true });
});

describe("fileExistsAfter", () => {
  it("fails when no file matches glob", async () => {
    const result = await fileExistsAfter(workDir, "_context/audit/baselines-confirmations-*.md");
    expect(result.ok).toBe(false);
    expect(result.message).toContain("No files matched");
  });

  it("passes (no timestamp) when file exists and no afterTimestamp given", async () => {
    const filePath = join(workDir, "_context", "audit", "baselines-confirmations-2026-04-24.md");
    await writeFile(filePath, "# log\n", "utf8");
    const result = await fileExistsAfter(workDir, "_context/audit/baselines-confirmations-*.md");
    expect(result.ok).toBe(true);
  });

  it("passes when file mtime is after the given timestamp", async () => {
    const filePath = join(workDir, "_context", "audit", "baselines-confirmations-2026-04-24.md");
    await writeFile(filePath, "# log\n", "utf8");
    const oldTs = "2026-04-23T00:00:00Z";
    const result = await fileExistsAfter(workDir, "_context/audit/baselines-confirmations-*.md", {
      afterTimestamp: oldTs,
    });
    expect(result.ok).toBe(true);
  });

  it("fails when file mtime is before the given timestamp", async () => {
    const filePath = join(workDir, "_context", "audit", "baselines-confirmations-2026-04-24.md");
    await writeFile(filePath, "# log\n", "utf8");
    // Set mtime to 2020
    await utimes(filePath, new Date("2020-01-01"), new Date("2020-01-01"));
    const result = await fileExistsAfter(workDir, "_context/audit/baselines-confirmations-*.md", {
      afterTimestamp: "2026-04-24T00:00:00Z",
    });
    expect(result.ok).toBe(false);
  });
});
