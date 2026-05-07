import { describe, expect, it } from "vitest";
import { createOtlpExporter, exportSpans } from "../src/exporter.js";
import type { ReadableSpan, SpanExporter } from "@opentelemetry/sdk-trace-base";
import type { ExportResult } from "@opentelemetry/core";

describe("createOtlpExporter", () => {
  it("returns an OTel SpanExporter (shape check)", () => {
    const exporter = createOtlpExporter({ endpoint: "http://localhost:4318" });
    expect(typeof exporter.export).toBe("function");
    expect(typeof exporter.shutdown).toBe("function");
  });
});

function fakeExporter(
  result: ExportResult,
): { exporter: SpanExporter; calls: { count: number; lastSpans: ReadableSpan[] | null } } {
  const calls = { count: 0, lastSpans: null as ReadableSpan[] | null };
  const exporter: SpanExporter = {
    export(spans, resultCallback) {
      calls.count += 1;
      calls.lastSpans = spans;
      resultCallback(result);
    },
    async shutdown() {
      /* no-op */
    },
  };
  return { exporter, calls };
}

describe("exportSpans", () => {
  it("forwards spans to the exporter on success", async () => {
    const { exporter, calls } = fakeExporter({ code: 0 });
    await exportSpans(exporter, [{} as ReadableSpan]);
    expect(calls.count).toBe(1);
    expect(calls.lastSpans).toHaveLength(1);
  });

  it("is a no-op for an empty span array", async () => {
    const { exporter, calls } = fakeExporter({ code: 0 });
    await exportSpans(exporter, []);
    expect(calls.count).toBe(0);
  });

  it("rethrows on FAILED exporter result", async () => {
    const err = new Error("boom");
    const { exporter } = fakeExporter({ code: 1, error: err });
    await expect(exportSpans(exporter, [{} as ReadableSpan])).rejects.toBe(err);
  });
});
