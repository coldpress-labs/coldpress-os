import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { stringify as stringifyYaml } from "yaml";
import { assertValidLocalConfig } from "./local-config-validator.js";

/** Runtime state that survives between Butler sessions. Lives at `.coldpress/local-config.yaml`. */
export interface LocalConfig {
  phase_1_completed?: boolean;
  phase_1_completed_at?: string;
  phase_3_completed?: boolean;
  phase_3_completed_at?: string;
  phase_3_started_at?: string;
  orient_skipped?: boolean;
  project_shape?: "greenfield" | "brownfield" | "ambiguous";
  product_type?: string;
  domain_complexity?: string;
  /** Set by a step before it starts; cleared on clean exit. Resume target on next boot. */
  partial_completion?: { step_id: string; at: string } | null;
  /** Granular interrupt/resume within a multi-step phase skill. At most one variant set at a time. */
  sub_state?: {
    decision_area?: string;
    category_index?: number;
    env_provision_category?: string;
    stack_lock_checkpoint?: "schema-valid" | "sacred-written" | "yaml-written";
  } | null;
  /** Graph-prime failed; prompt retry on next orient. */
  needs_graph_rebuild?: boolean;
  /** Recorded reason for the failure — surfaced in the orient retry prompt. */
  graph_rebuild_error?: string;
  /** Set to true by `coldpress update --post-phase-3` after stack-pack wrappers regenerated. */
  post_phase_3_update_ran?: boolean;
  post_phase_3_update_ran_at?: string;
  /** Set to true by `coldpress update --post-phase-4` after Phase 4 PRD artefacts re-primed the graph. */
  post_phase_4_update_ran?: boolean;
  post_phase_4_update_ran_at?: string;
}

const LOCAL_CONFIG_REL = join(".coldpress", "local-config.yaml");

function localConfigPath(projectRoot: string): string {
  return join(projectRoot, LOCAL_CONFIG_REL);
}

/** Read and validate the local config. Returns `{}` if the file doesn't exist yet. */
export async function readLocalConfig(projectRoot: string): Promise<LocalConfig> {
  const path = localConfigPath(projectRoot);
  try {
    await access(path);
  } catch {
    return {};
  }
  const source = await readFile(path, "utf8");
  const validated = assertValidLocalConfig(source) as LocalConfig;
  return validated ?? {};
}

/** Merge-write — preserves any fields the caller didn't touch. */
export async function updateLocalConfig(
  projectRoot: string,
  patch: Partial<LocalConfig>,
): Promise<LocalConfig> {
  const current = await readLocalConfig(projectRoot);
  const next: LocalConfig = { ...current, ...patch };
  await writeLocalConfig(projectRoot, next);
  return next;
}

/** Full-write — overwrites the file with the given value. */
export async function writeLocalConfig(
  projectRoot: string,
  config: LocalConfig,
): Promise<void> {
  const path = localConfigPath(projectRoot);
  await mkdir(dirname(path), { recursive: true });
  const yaml = stringifyYaml(config, { indent: 2, lineWidth: 0 });
  await writeFile(path, yaml, "utf8");
}

/**
 * Mark the start of an intake step. Writes `partial_completion` so orient
 * Step 0 can resume here on next boot if the step doesn't complete cleanly.
 */
export async function markStepStart(
  projectRoot: string,
  stepId: string,
): Promise<LocalConfig> {
  return updateLocalConfig(projectRoot, {
    partial_completion: { step_id: stepId, at: new Date().toISOString() },
  });
}

/** Clear the partial-completion marker on clean step exit. */
export async function clearStepMarker(projectRoot: string): Promise<LocalConfig> {
  return updateLocalConfig(projectRoot, { partial_completion: null });
}
