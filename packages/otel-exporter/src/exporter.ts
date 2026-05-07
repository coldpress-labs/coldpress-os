/**
 * OTLP transport wiring.
 *
 * Thin wrapper over `@opentelemetry/exporter-trace-otlp-http`. Honours the
 * standard OTel env vars so users point at Langfuse / Phoenix / Jaeger /
 * Tempo / Honeycomb without coldpress-os-specific config:
 *
 *   OTEL_EXPORTER_OTLP_ENDPOINT           (e.g. http://localhost:4318)
 *   OTEL_EXPORTER_OTLP_TRACES_ENDPOINT    (overrides ENDPOINT for traces)
 *   OTEL_EXPORTER_OTLP_HEADERS            (comma-separated key=value)
 *   OTEL_EXPORTER_OTLP_TRACES_HEADERS     (traces-only header override)
 *   OTEL_SERVICE_NAME                     (see conventions.ts)
 *
 * Keeping the wrapper thin means advanced users (mTLS, compression, etc.)
 * drop in the SDK's full option surface via the `exporterOptions` escape
 * hatch. Coldpress-os ships opinionated defaults; OTel ships power.
 */

import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import type { ReadableSpan, SpanExporter } from "@opentelemetry/sdk-trace-base";
import type { ExportResult } from "@opentelemetry/core";

/**
 * OTel's config shape is declared in `@opentelemetry/otlp-exporter-base`
 * but not re-exported from this package. Derive it from the constructor
 * signature so we stay decoupled from the upstream package layout.
 */
type OtlpTraceExporterConfig = NonNullable<
  ConstructorParameters<typeof OTLPTraceExporter>[0]
>;

export interface CreateOtlpExporterOptions {
  /** Full OTLP endpoint (including protocol + host + port + path). */
  endpoint?: string;
  /** OTLP request headers — merged over env-supplied ones. */
  headers?: Record<string, string>;
  /** Request timeout in ms. Falls back to SDK default (10000). */
  timeoutMillis?: number;
  /** Escape hatch: forward any OTLPTraceExporter option untouched. */
  exporterOptions?: OtlpTraceExporterConfig;
}

export function createOtlpExporter(
  options: CreateOtlpExporterOptions = {},
): SpanExporter {
  const config: OtlpTraceExporterConfig = { ...options.exporterOptions };
  if (options.endpoint !== undefined) config.url = options.endpoint;
  if (options.headers !== undefined) {
    config.headers = { ...config.headers, ...options.headers };
  }
  if (options.timeoutMillis !== undefined) {
    config.timeoutMillis = options.timeoutMillis;
  }
  return new OTLPTraceExporter(config);
}

/**
 * Promisified `exporter.export()`. Raises on FAILED so the CLI exits
 * non-zero instead of silently dropping spans.
 */
export async function exportSpans(
  exporter: SpanExporter,
  spans: ReadableSpan[],
): Promise<void> {
  if (spans.length === 0) return;
  const result = await new Promise<ExportResult>((resolve) => {
    exporter.export(spans, resolve);
  });
  if (result.code !== 0) {
    const err = result.error ?? new Error("OTLP exporter reported FAILED");
    throw err;
  }
}
