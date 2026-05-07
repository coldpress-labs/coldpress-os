import { describe, expect, it } from "vitest";
import { deriveSpanId, deriveTraceId } from "../src/ids.js";

describe("deriveTraceId", () => {
  it("returns 32-char lowercase hex", () => {
    const id = deriveTraceId("run-20260424-120000-abcdef");
    expect(id).toMatch(/^[0-9a-f]{32}$/);
    expect(id).toHaveLength(32);
  });

  it("is deterministic for the same run id", () => {
    const a = deriveTraceId("run-20260424-120000-abcdef");
    const b = deriveTraceId("run-20260424-120000-abcdef");
    expect(a).toBe(b);
  });

  it("differs for different run ids", () => {
    const a = deriveTraceId("run-20260424-120000-aaaaaa");
    const b = deriveTraceId("run-20260424-120000-bbbbbb");
    expect(a).not.toBe(b);
  });
});

describe("deriveSpanId", () => {
  it("returns 16-char lowercase hex", () => {
    const id = deriveSpanId("run-20260424-120000-abcdef", 0);
    expect(id).toMatch(/^[0-9a-f]{16}$/);
    expect(id).toHaveLength(16);
  });

  it("is deterministic for the same (run_id, seq) pair", () => {
    const a = deriveSpanId("run-20260424-120000-abcdef", 3);
    const b = deriveSpanId("run-20260424-120000-abcdef", 3);
    expect(a).toBe(b);
  });

  it("differs per seq within the same run", () => {
    const a = deriveSpanId("run-20260424-120000-abcdef", 0);
    const b = deriveSpanId("run-20260424-120000-abcdef", 1);
    expect(a).not.toBe(b);
  });

  it("differs per run for the same seq", () => {
    const a = deriveSpanId("run-20260424-120000-aaaaaa", 0);
    const b = deriveSpanId("run-20260424-120000-bbbbbb", 0);
    expect(a).not.toBe(b);
  });

  it("rejects negative or non-integer seq", () => {
    expect(() => deriveSpanId("run-x", -1)).toThrow();
    expect(() => deriveSpanId("run-x", 1.5)).toThrow();
    expect(() => deriveSpanId("run-x", Number.NaN)).toThrow();
  });
});
