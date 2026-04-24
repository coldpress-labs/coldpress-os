/**
 * Vercel AI SDK tool-signature convention (§6.9).
 *
 * A convention, NOT a dependency. The TS agent ecosystem has converged
 * on the shape `tool({ parameters: z.object({...}), execute: async (args) => ... })`
 * across Vercel AI SDK, Mastra, AgentKit, etc. `@coldpress/core` adopts
 * the shape for interop without pulling `vercel/ai` (ELv2 / MIT mix /
 * heavy-dep concerns per oss-integration-survey-2026-04-22).
 *
 * Call `tool({ description?, parameters, execute })` and a consumer
 * that expects Vercel/Mastra-shape tools sees a compatible object.
 *
 * Runtime is a thin identity wrapper that (a) captures the shape in a
 * `@coldpress-os:tool-signature-v1` marker and (b) sanity-checks that
 * `parameters` is a Zod object. No deps beyond `zod`.
 */

import { z } from "zod";

/**
 * Marker used by consumers who want to reflectively detect that an
 * object was created via `tool()` without importing this module.
 */
export const TOOL_SIGNATURE_MARKER = "@coldpress-os:tool-signature-v1" as const;

export interface ToolInput<
  Params extends z.ZodType,
  R = unknown,
> {
  /** Optional short human description — shown in tool-picker UIs. */
  description?: string;
  /** Zod schema for the tool's input. MUST be a ZodObject at the top level. */
  parameters: Params;
  /** The tool's implementation. Receives parsed + validated args. */
  execute: (args: z.infer<Params>) => Promise<R> | R;
}

export interface Tool<
  Params extends z.ZodType,
  R = unknown,
> extends ToolInput<Params, R> {
  readonly _marker: typeof TOOL_SIGNATURE_MARKER;
}

/**
 * Build a Vercel-compatible tool definition.
 *
 * Validates the `parameters` shape is a Zod object (top-level records /
 * arrays / primitives are tool-picker-hostile — reject to fail loud).
 */
export function tool<Params extends z.ZodType, R = unknown>(
  input: ToolInput<Params, R>,
): Tool<Params, R> {
  assertZodObject(input.parameters);
  return {
    ...input,
    _marker: TOOL_SIGNATURE_MARKER,
  };
}

/**
 * Reflectively detect a `Tool` produced by this module's `tool()` helper.
 * Consumers using duck-typing (Vercel AI SDK, Mastra) don't need this —
 * they inspect `parameters.safeParse`. This is for internal tooling.
 */
export function isTool(value: unknown): value is Tool<z.ZodType, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as { _marker?: unknown })._marker === TOOL_SIGNATURE_MARKER
  );
}

function assertZodObject(schema: unknown): void {
  if (!isZodSchema(schema)) {
    throw new Error(
      "tool(): `parameters` must be a Zod schema (got " +
        describe(schema) +
        "). Wrap your fields in `z.object({ ... })`.",
    );
  }
  // Reject top-level non-object Zod schemas — tool pickers typically
  // expect a keyed argument map, not a bare string or array. Zod 3.25+
  // exposes the discriminator at `_def.type`; older versions used
  // `_def.typeName` ("ZodObject"). Accept either.
  const def = (schema as { _def?: { type?: string; typeName?: string } })._def;
  const isObject =
    def?.type === "object" || def?.typeName === "ZodObject";
  if (!isObject) {
    const got = def?.type ?? def?.typeName ?? "unknown";
    throw new Error(
      `tool(): \`parameters\` must be z.object(...) at the top level, got ${got}.`,
    );
  }
}

function isZodSchema(value: unknown): value is z.ZodType {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as { safeParse?: unknown }).safeParse === "function"
  );
}

function describe(value: unknown): string {
  if (value === null) return "null";
  if (Array.isArray(value)) return "array";
  return typeof value;
}
