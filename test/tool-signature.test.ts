/**
 * Vercel AI SDK tool-signature convention tests (§6.9).
 *
 * The `tool()` helper is a thin identity wrapper that (a) stamps a
 * marker and (b) validates `parameters` is a Zod object. These tests
 * exercise both the type-level shape and the runtime guardrails.
 */

import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  TOOL_SIGNATURE_MARKER,
  isTool,
  tool,
} from "../src/tool-signature/index";

describe("tool()", () => {
  it("wraps a well-formed tool definition with a marker", () => {
    const t = tool({
      description: "hello",
      parameters: z.object({ name: z.string() }),
      execute: async (args) => `hi ${args.name}`,
    });
    expect(t._marker).toBe(TOOL_SIGNATURE_MARKER);
    expect(t.description).toBe("hello");
  });

  it("runs the execute fn with parsed args", async () => {
    const t = tool({
      parameters: z.object({ n: z.number() }),
      execute: async (args) => args.n * 2,
    });
    expect(await t.execute({ n: 21 })).toBe(42);
  });

  it("supports a sync execute fn", async () => {
    const t = tool({
      parameters: z.object({ n: z.number() }),
      execute: (args) => args.n + 1,
    });
    expect(await t.execute({ n: 1 })).toBe(2);
  });

  it("rejects non-Zod parameters", () => {
    expect(() =>
      tool({
        // @ts-expect-error intentional
        parameters: { name: "string" },
        execute: async () => null,
      }),
    ).toThrow(/must be a Zod schema/);
  });

  it("rejects non-ZodObject top-level schemas", () => {
    expect(() =>
      tool({
        // z.string() is a Zod schema but not a ZodObject — rejected
        // at runtime by the helper; TS allows it because the generic
        // bounds z.ZodType, not z.ZodObject specifically.
        parameters: z.string(),
        execute: async () => null,
      }),
    ).toThrow(/z\.object\(\.\.\.\) at the top level/);
  });

  it("rejects null parameters", () => {
    expect(() =>
      tool({
        // @ts-expect-error deliberate bad shape
        parameters: null,
        execute: async () => null,
      }),
    ).toThrow(/must be a Zod schema/);
  });
});

describe("isTool()", () => {
  it("returns true for tools built via tool()", () => {
    const t = tool({
      parameters: z.object({}),
      execute: async () => null,
    });
    expect(isTool(t)).toBe(true);
  });

  it("returns false for Vercel-shaped objects missing the marker", () => {
    const lookalike = {
      parameters: z.object({}),
      execute: async () => null,
    };
    expect(isTool(lookalike)).toBe(false);
  });

  it("returns false for primitives + null + undefined", () => {
    expect(isTool(null)).toBe(false);
    expect(isTool(undefined)).toBe(false);
    expect(isTool(42)).toBe(false);
    expect(isTool("tool")).toBe(false);
    expect(isTool({})).toBe(false);
  });
});
