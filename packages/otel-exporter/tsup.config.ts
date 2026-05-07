import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: {
      index: "src/index.ts",
      conventions: "src/conventions.ts",
    },
    format: ["esm"],
    target: "node20",
    platform: "node",
    clean: true,
    dts: true,
    splitting: false,
    sourcemap: false,
    minify: false,
    external: [
      "@opentelemetry/api",
      "@opentelemetry/exporter-trace-otlp-http",
      "@opentelemetry/resources",
      "@opentelemetry/sdk-trace-base",
      "@opentelemetry/semantic-conventions",
      "commander",
      "zod",
    ],
  },
  {
    entry: {
      cli: "src/cli.ts",
    },
    format: ["esm"],
    target: "node20",
    platform: "node",
    clean: false,
    dts: false,
    splitting: false,
    sourcemap: false,
    minify: false,
    banner: {
      js: "#!/usr/bin/env node",
    },
    external: [
      "@opentelemetry/api",
      "@opentelemetry/exporter-trace-otlp-http",
      "@opentelemetry/resources",
      "@opentelemetry/sdk-trace-base",
      "@opentelemetry/semantic-conventions",
      "commander",
      "zod",
    ],
  },
]);
