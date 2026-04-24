/**
 * Status tab — current phase, last gate evaluation, sign-off state.
 */

import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import type { StatusData } from "../types.js";

const PHASE_NAMES: Record<number, string> = {
  1: "Bootstrap",
  2: "Discovery",
  3: "Tech Stack",
  4: "Planning",
  5: "Breakdown",
  6: "Implementation",
  7: "Deployment",
  8: "Operate",
  9: "Evolve",
};

interface RawGateEval {
  gate_id?: string;
  phase?: number;
  overall?: "pass" | "fail" | "pending-human";
  evaluated_at?: string;
}

export async function assembleStatus(projectDir: string): Promise<StatusData> {
  const project = await readProjectIdentity(projectDir);
  const lastEval = await readLatestGateEval(projectDir);
  const signoffs = await readSignoffs(projectDir);

  const currentPhase = lastEval?.phase ?? null;
  return {
    project,
    current_phase: currentPhase,
    current_phase_name: currentPhase != null ? (PHASE_NAMES[currentPhase] ?? null) : null,
    last_gate_evaluation: lastEval,
    sacred_doc_signoffs: signoffs,
  };
}

async function readProjectIdentity(
  projectDir: string,
): Promise<{ name: string; slug: string } | null> {
  try {
    const yaml = await readFile(join(projectDir, "coldpress.yaml"), "utf8");
    const parsed = parseYaml(yaml);
    if (
      parsed &&
      typeof parsed === "object" &&
      "project" in parsed &&
      typeof (parsed as { project?: unknown }).project === "object"
    ) {
      const p = (parsed as { project: { name?: string; slug?: string } }).project;
      if (typeof p.name === "string" && typeof p.slug === "string") {
        return { name: p.name, slug: p.slug };
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function readLatestGateEval(
  projectDir: string,
): Promise<StatusData["last_gate_evaluation"]> {
  const dir = join(projectDir, "_context/audit");
  try {
    const entries = await readdir(dir);
    const candidates = entries
      .filter((f) => /^gate-eval-phase-\d+-\d{4}-\d{2}-\d{2}\.json$/.test(f))
      .sort();
    if (candidates.length === 0) return null;
    const latest = candidates[candidates.length - 1]!;
    const raw = await readFile(join(dir, latest), "utf8");
    const parsed = JSON.parse(raw) as RawGateEval;
    if (
      typeof parsed.gate_id === "string" &&
      typeof parsed.phase === "number" &&
      typeof parsed.overall === "string" &&
      typeof parsed.evaluated_at === "string"
    ) {
      return {
        gate_id: parsed.gate_id,
        phase: parsed.phase,
        overall: parsed.overall,
        evaluated_at: parsed.evaluated_at,
      };
    }
    return null;
  } catch {
    return null;
  }
}

interface SignoffRecord {
  signed_by?: string;
  signed_at?: string;
}

async function readSignoffs(
  projectDir: string,
): Promise<StatusData["sacred_doc_signoffs"]> {
  const root = join(projectDir, ".coldpress/signoffs");
  const out: StatusData["sacred_doc_signoffs"] = [];
  try {
    const gates = await readdir(root);
    for (const gateId of gates) {
      const gateDir = join(root, gateId);
      const s = await stat(gateDir).catch(() => null);
      if (!s || !s.isDirectory()) continue;
      const checks = await readdir(gateDir);
      for (const file of checks) {
        if (!file.endsWith(".yaml") && !file.endsWith(".yml")) continue;
        const checkId = file.replace(/\.ya?ml$/, "");
        try {
          const raw = await readFile(join(gateDir, file), "utf8");
          const parsed = parseYaml(raw) as SignoffRecord | null;
          out.push({
            gate_id: gateId,
            check_id: checkId,
            signed_by: parsed?.signed_by ?? "(unknown)",
            signed_at: parsed?.signed_at ?? "(unknown)",
          });
        } catch {
          /* skip malformed signoff */
        }
      }
    }
  } catch {
    /* no signoffs dir */
  }
  return out;
}
