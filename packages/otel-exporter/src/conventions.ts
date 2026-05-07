/**
 * Attribute conventions — OpenLLMetry (Traceloop) for the LLM-workflow
 * shape + a `coldpress.*` namespace for fields that have no OpenLLMetry
 * equivalent (run_id, seq, phase, gate_id, wave_id, skill_id).
 *
 * OpenLLMetry's spec is open and ecosystem-adopted (Langfuse, Arize
 * Phoenix, Jaeger + ingest shims all recognise these keys). The
 * `traceloop.*` prefix is the canonical vendor-neutral name used across
 * those backends — *not* a Traceloop-product dep.
 *
 * Spec reference: https://github.com/traceloop/openllmetry-js
 * Extended attributes we add under `coldpress.*` stay out of the
 * OpenLLMetry namespace so we don't collide with future spec additions.
 */

/**
 * OpenLLMetry span-kind taxonomy. We map coldpress-os concepts as:
 *   - workflow → wave span (phase-scoped group)
 *   - task     → skill span + gate span (unit of work)
 *   - agent    → reserved for future subagent-level spans
 *   - tool     → reserved for future MCP/tool-call spans
 *
 * Only the two used today are emitted; the other two are documented
 * for orchestrator-integration follow-ups.
 */
export const OPENLLMETRY = {
  WORKFLOW_NAME: "traceloop.workflow.name",
  ENTITY_NAME: "traceloop.entity.name",
  ENTITY_INPUT: "traceloop.entity.input",
  ENTITY_OUTPUT: "traceloop.entity.output",
  SPAN_KIND: "traceloop.span.kind",
  ASSOCIATION_PROPERTIES_PREFIX: "traceloop.association.properties.",
} as const;

export const SPAN_KIND = {
  WORKFLOW: "workflow",
  TASK: "task",
  AGENT: "agent",
  TOOL: "tool",
} as const;

/**
 * coldpress-os's private namespace. Keep every custom attribute under
 * `coldpress.*` so OpenLLMetry's future spec additions can't collide.
 */
export const COLDPRESS = {
  RUN_ID: "coldpress.run_id",
  SEQ: "coldpress.seq",
  WAVE_ID: "coldpress.wave_id",
  PHASE: "coldpress.phase",
  SKILL_ID: "coldpress.skill_id",
  SKILL_CALLER: "coldpress.skill.caller",
  SKILL_EXIT_CODE: "coldpress.skill.exit_code",
  SKILL_ARTIFACT_PATH: "coldpress.skill.artifact_path",
  SKILL_ARGS_JSON: "coldpress.skill.args_json",
  GATE_ID: "coldpress.gate_id",
  GATE_BLOCKERS_JSON: "coldpress.gate.blockers_json",
  WAVE_STATUS: "coldpress.wave.status",
  WAVE_LABEL: "coldpress.wave.label",
  CONDENSATION_SUMMARY: "coldpress.condensation.summary",
  CONDENSATION_FROM_SEQ: "coldpress.condensation.from_seq",
  CONDENSATION_TO_SEQ: "coldpress.condensation.to_seq",
  CAUSE_SEQ: "coldpress.cause_seq",
} as const;

/**
 * Resource-level attribute names. Service name defaults to
 * `coldpress-os` but honours the OpenTelemetry standard
 * `OTEL_SERVICE_NAME` env var when the CLI/API doesn't override.
 */
export const RESOURCE = {
  SERVICE_NAME: "service.name",
  SERVICE_VERSION: "service.version",
  COLDPRESS_PROJECT_SLUG: "coldpress.project_slug",
} as const;

export const DEFAULT_SERVICE_NAME = "coldpress-os";

/** Instrumentation-scope identity stamped on every emitted span. */
export const INSTRUMENTATION_SCOPE = {
  name: "@coldpress/otel-exporter",
  version: "0.1.0-alpha",
} as const;
