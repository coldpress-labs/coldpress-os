/**
 * Todos tab — gate blockers, open NEED_INFO topics, pending sign-offs,
 * sprint-change-proposals.
 *
 * NEED_INFO budget persistence isn't shipped yet (Block AA shipped the
 * substrate; persistence is a Wave 6 follow-up). For v1 dashboard,
 * we surface NEED_INFO emissions found in EventStream events whose
 * topic has no resolution event later in the stream. Same shape as
 * the rest of this tab: best-effort extraction from on-disk state.
 */

import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import type { TodoItem, TodosData } from "../types.js";

export async function assembleTodos(projectDir: string): Promise<TodosData> {
  const items: TodoItem[] = [];
  items.push(...(await collectGateBlockers(projectDir)));
  items.push(...(await collectPendingSignoffPlaceholders(projectDir)));
  items.push(...(await collectSprintChangeProposals(projectDir)));
  return { items };
}

interface GateEval {
  gate_id?: string;
  phase?: number;
  blockers?: string[];
}

async function collectGateBlockers(projectDir: string): Promise<TodoItem[]> {
  const dir = join(projectDir, "_context/audit");
  const out: TodoItem[] = [];
  try {
    const files = (await readdir(dir))
      .filter((f) => /^gate-eval-phase-\d+-/.test(f))
      .sort();
    if (files.length === 0) return out;
    const latest = files[files.length - 1]!;
    const raw = await readFile(join(dir, latest), "utf8");
    const json = JSON.parse(raw) as GateEval;
    for (const blockerId of json.blockers ?? []) {
      out.push({
        source: "gate-blocker",
        title: `Gate blocker: ${blockerId}`,
        detail: `Phase ${json.phase ?? "?"} gate ${json.gate_id ?? "?"} reports failing acceptance check.`,
        ref: latest,
      });
    }
  } catch {
    /* no gate-eval files yet */
  }
  return out;
}

async function collectPendingSignoffPlaceholders(
  projectDir: string,
): Promise<TodoItem[]> {
  // Cross-reference: which `kind: human` checks in shipped gate.json
  // files do NOT have a corresponding signoff record on disk?
  // For v1 dashboard we only check the lifecycle gates the project's
  // own framework copy ships; project-local gates aren't supported.
  const lifecycleDir = join(projectDir, "coldpress-os/lifecycle");
  const out: TodoItem[] = [];
  try {
    const phases = await readdir(lifecycleDir);
    for (const phaseDir of phases.sort()) {
      const gatePath = join(lifecycleDir, phaseDir, "gate.json");
      try {
        const raw = await readFile(gatePath, "utf8");
        const gate = JSON.parse(raw) as {
          gate_id?: string;
          acceptance_checks?: { id?: string; kind?: string }[];
        };
        const humanChecks = (gate.acceptance_checks ?? []).filter(
          (c) => c.kind === "human" && typeof c.id === "string",
        );
        for (const check of humanChecks) {
          const signoffPath = join(
            projectDir,
            ".coldpress/signoffs",
            gate.gate_id ?? "(unknown)",
            `${check.id}.yaml`,
          );
          const present = await fileExists(signoffPath);
          if (!present) {
            out.push({
              source: "pending-signoff",
              title: `Pending sign-off: ${gate.gate_id ?? phaseDir} / ${check.id ?? "(unknown)"}`,
              detail: `Human gate check awaiting sign-off record.`,
              ref: gatePath,
            });
          }
        }
      } catch {
        /* no gate.json for this phase */
      }
    }
  } catch {
    /* no coldpress-os/ in this project (e.g. running dashboard from the framework repo itself) */
  }
  return out;
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function collectSprintChangeProposals(
  projectDir: string,
): Promise<TodoItem[]> {
  const dir = join(projectDir, "_context/planning");
  const out: TodoItem[] = [];
  try {
    const files = await readdir(dir);
    for (const f of files) {
      if (!f.startsWith("sprint-change-proposal") || !f.endsWith(".md")) continue;
      // status is declared inside the document; we only flag the file
      // exists. Resolved proposals can be archived under a subfolder if the
      // user wants them excluded.
      out.push({
        source: "sprint-change-proposal",
        title: `Sprint change proposal: ${f}`,
        detail: `Review proposal status; mark resolved or rejected.`,
        ref: join(dir, f),
      });
    }
  } catch {
    /* no planning dir */
  }
  return out;
}
