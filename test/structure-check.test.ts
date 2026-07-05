/**
 * WS11 §S7.7 — the structure guard. Asserts the four structure invariants hold
 * over the live framework tree, converting the structure-hygiene audit into a
 * standing CI check (via `npm test`), the same way the wiring manifest guards
 * producer/consumer seams. A regression (a shipped dir removed from disk, an
 * orphaned data file, an unrouted skill, an internal-state leak) fails here.
 */

import { describe, expect, it } from "vitest";
import { checkStructure } from "../src/structure/check";

describe("checkStructure (§S7.7 guard)", () => {
  const results = checkStructure();

  it("produces the four structure checks", () => {
    const ids = results.map((r) => r.id).sort();
    expect(ids).toEqual([
      "structure:data-readers",
      "structure:files-exist",
      "structure:no-internal-leak",
      "structure:skill-routing",
    ]);
  });

  it("has no error-severity findings (shipped paths exist; no internal-state leak)", () => {
    const errors = results.filter((r) => r.severity === "error");
    expect(errors, JSON.stringify(errors, null, 2)).toEqual([]);
  });

  it("has no warning-severity findings (every data file read; every skill routed or on-demand)", () => {
    const warnings = results.filter((r) => r.severity === "warning");
    expect(warnings, JSON.stringify(warnings, null, 2)).toEqual([]);
  });
});
