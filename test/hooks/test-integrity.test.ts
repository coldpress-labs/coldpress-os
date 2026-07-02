/**
 * Tests for the `test-integrity` PostToolUse(Edit) hook (§4.4).
 */

import { describe, expect, it } from "vitest";
import { assessEdit, isTestFile, testIntegrityHandler } from "../../src/hooks/test-integrity";

describe("isTestFile", () => {
  it("recognizes test/spec files and __tests__ dirs", () => {
    expect(isTestFile("src/foo.test.ts")).toBe(true);
    expect(isTestFile("a/b/foo.spec.tsx")).toBe(true);
    expect(isTestFile("pkg/__tests__/foo.ts")).toBe(true);
    expect(isTestFile("src/foo.ts")).toBe(false);
  });
});

describe("assessEdit", () => {
  it("flags dropped assertions", () => {
    const f = assessEdit("expect(a).toBe(1);\nexpect(b).toBe(2);", "expect(a).toBe(1);");
    expect(f.weakened).toBe(true);
    expect(f.reasons[0]).toContain("assertions dropped 2→1");
  });
  it("flags dropped test cases", () => {
    const f = assessEdit("it('a', () => {});\nit('b', () => {});", "it('a', () => {});");
    expect(f.weakened).toBe(true);
    expect(f.reasons.join()).toContain("test cases dropped 2→1");
  });
  it("flags newly added skip/only markers", () => {
    const f = assessEdit("it('a', () => { expect(x).toBe(1) })", "it.skip('a', () => { expect(x).toBe(1) })");
    expect(f.weakened).toBe(true);
    expect(f.reasons.join()).toContain("skip/only markers added");
  });
  it("does not flag a strengthening edit (more assertions)", () => {
    expect(assessEdit("expect(a).toBe(1)", "expect(a).toBe(1)\nexpect(b).toBe(2)").weakened).toBe(false);
  });
});

describe("testIntegrityHandler.run", () => {
  it("passes through non-test files", () => {
    expect(
      testIntegrityHandler.run({ tool_input: { file_path: "src/x.ts", old_string: "expect(a).toBe(1)\nexpect(b).toBe(2)", new_string: "expect(a).toBe(1)" } }),
    ).toEqual({ kind: "none" });
  });
  it("DENIES (feedback) a weakening edit to a test file", async () => {
    const d = await testIntegrityHandler.run({
      tool_input: { file_path: "src/x.test.ts", old_string: "expect(a).toBe(1)\nexpect(b).toBe(2)", new_string: "expect(a).toBe(1)" },
    });
    expect(d.kind).toBe("deny");
    if (d.kind === "deny") expect(d.reason).toContain("weaken coverage");
  });
  it("is a PostToolUse hook, overridable, with --explain", () => {
    expect(testIntegrityHandler.event).toBe("PostToolUse");
    expect(testIntegrityHandler.overrideGate).toBe("test-integrity");
    expect(testIntegrityHandler.explain.length).toBeGreaterThan(20);
  });
});
