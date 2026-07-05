/**
 * WS11 (Conftest retire-and-fold) — the `frontmatter-min` gate check. Folds the
 * two retired Conftest/Rego policies (PRD→ADR, architecture→approvers) into the
 * P4/P6 exit gates.
 */

import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { frontmatterMin } from "../src/gate/checks/frontmatter-min";

let work: string;
beforeEach(() => {
  work = mkdtempSync(join(tmpdir(), "cp-fmmin-"));
  mkdirSync(join(work, "_context", "sacred"), { recursive: true });
});
afterEach(() => rmSync(work, { recursive: true, force: true }));

function writePrd(body: string): string {
  const p = "_context/sacred/prd.md";
  writeFileSync(join(work, p), `---\n${body}\n---\n# PRD\n`);
  return p;
}

describe("frontmatterMin", () => {
  it("passes when the array field has ≥ min items", async () => {
    const p = writePrd('workflowType: "prd"\nadr_references: ["ADR-0001", "ADR-0002"]');
    const r = await frontmatterMin(work, p, "adr_references", 1);
    expect(r.ok).toBe(true);
  });

  it("fails when the array field is empty", async () => {
    const p = writePrd('workflowType: "prd"\nadr_references: []');
    const r = await frontmatterMin(work, p, "adr_references", 1);
    expect(r.ok).toBe(false);
    expect(r.message).toContain("ADR");
  });

  it("fails when the field is absent entirely", async () => {
    const p = writePrd('workflowType: "prd"');
    const r = await frontmatterMin(work, p, "adr_references", 1);
    expect(r.ok).toBe(false);
  });

  it("fails cleanly on a missing file", async () => {
    const r = await frontmatterMin(work, "_context/sacred/nope.md", "approvers", 1);
    expect(r.ok).toBe(false);
    expect(r.message).toContain("not found");
  });

  it("honours a higher --min", async () => {
    const p = writePrd('workflowType: "prd"\nadr_references: ["ADR-0001"]');
    expect((await frontmatterMin(work, p, "adr_references", 2)).ok).toBe(false);
  });
});
