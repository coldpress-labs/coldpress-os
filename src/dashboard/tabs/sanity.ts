/**
 * Sanity tab — fail-loud panels for things that should be reviewed
 * before continuing.
 */

import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import type {
  SanityData,
  SanityPanel,
  SanityPanelStatus,
} from "../types.js";

const STALE_SPRINT_AGE_DAYS = 14;

export async function assembleSanity(projectDir: string): Promise<SanityData> {
  const panels: SanityPanel[] = [];
  panels.push(await checkSecureManifest(projectDir));
  panels.push(await checkSacredDocFrontmatter(projectDir));
  panels.push(await checkSecurityGateAggregate(projectDir));
  panels.push(await checkSprintStatusFreshness(projectDir));
  panels.push(await checkUnreviewedReviews(projectDir));

  const overall = pickOverall(panels);
  return { overall, panels };
}

function pickOverall(panels: SanityPanel[]): SanityPanelStatus {
  if (panels.some((p) => p.status === "fail")) return "fail";
  if (panels.some((p) => p.status === "warn")) return "warn";
  return "ok";
}

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function checkSecureManifest(projectDir: string): Promise<SanityPanel> {
  const path = join(projectDir, "secure/manifest.yaml");
  if (await exists(path)) {
    return {
      id: "secure-manifest-present",
      title: "Secure manifest",
      status: "ok",
      detail: "secure/manifest.yaml is present.",
    };
  }
  return {
    id: "secure-manifest-present",
    title: "Secure manifest",
    status: "warn",
    detail:
      "No secure/manifest.yaml. Declare expected credentials by name when the project starts using any.",
  };
}

async function checkSacredDocFrontmatter(
  projectDir: string,
): Promise<SanityPanel> {
  const root = join(projectDir, "_context/sacred");
  const docs = ["context.md", "tech-stack.md", "prd.md", "architecture.md"];
  const noFrontmatter: string[] = [];
  let presentCount = 0;
  for (const doc of docs) {
    const p = join(root, doc);
    try {
      const raw = await readFile(p, "utf8");
      presentCount++;
      if (!raw.startsWith("---") || raw.indexOf("\n---", 3) === -1) {
        noFrontmatter.push(doc);
      }
    } catch {
      /* doc not present yet — fine, no frontmatter to check */
    }
  }
  if (presentCount === 0) {
    return {
      id: "sacred-doc-frontmatter",
      title: "Sacred-doc frontmatter",
      status: "ok",
      detail: "No sacred docs authored yet (project pre-Phase-2).",
    };
  }
  if (noFrontmatter.length > 0) {
    return {
      id: "sacred-doc-frontmatter",
      title: "Sacred-doc frontmatter",
      status: "fail",
      detail: `${noFrontmatter.length} sacred doc(s) missing frontmatter: ${noFrontmatter.join(", ")}`,
    };
  }
  return {
    id: "sacred-doc-frontmatter",
    title: "Sacred-doc frontmatter",
    status: "ok",
    detail: `${presentCount}/5 sacred docs present, all with frontmatter.`,
  };
}

interface AggregateResult {
  overall?: "pass" | "fail";
  blockers?: string[];
  totals?: { high?: number; critical?: number };
}

async function checkSecurityGateAggregate(
  projectDir: string,
): Promise<SanityPanel> {
  const dir = join(projectDir, "_context/audit/security");
  try {
    const files = (await readdir(dir))
      .filter((f) => /^aggregate-\d{4}-\d{2}-\d{2}\.json$/.test(f))
      .sort();
    if (files.length === 0) {
      return {
        id: "security-gate-aggregate",
        title: "Security gate (latest aggregate)",
        status: "ok",
        detail: "No security aggregate yet — run `coldpress security aggregate` once scanners populate audit/security/.",
      };
    }
    const latest = files[files.length - 1]!;
    const raw = await readFile(join(dir, latest), "utf8");
    const json = JSON.parse(raw) as AggregateResult;
    const blockers = json.blockers?.length ?? 0;
    if (json.overall === "fail" || blockers > 0) {
      return {
        id: "security-gate-aggregate",
        title: "Security gate (latest aggregate)",
        status: "fail",
        detail: `Latest aggregate (${latest}) has ${blockers} unwaived blocker(s) at-or-above policy threshold.`,
      };
    }
    return {
      id: "security-gate-aggregate",
      title: "Security gate (latest aggregate)",
      status: "ok",
      detail: `Latest aggregate (${latest}) reports pass; no unwaived blockers.`,
    };
  } catch {
    return {
      id: "security-gate-aggregate",
      title: "Security gate (latest aggregate)",
      status: "ok",
      detail: "No audit/security/ directory yet.",
    };
  }
}

async function checkSprintStatusFreshness(
  projectDir: string,
): Promise<SanityPanel> {
  const path = join(projectDir, "_context/tracking/sprint-status.yaml");
  try {
    const s = await stat(path);
    const ageDays = (Date.now() - s.mtimeMs) / (1000 * 60 * 60 * 24);
    if (ageDays > STALE_SPRINT_AGE_DAYS) {
      return {
        id: "sprint-status-fresh",
        title: "Sprint status freshness",
        status: "warn",
        detail: `sprint-status.yaml is ${Math.floor(ageDays)} days old. Consider refreshing.`,
      };
    }
    return {
      id: "sprint-status-fresh",
      title: "Sprint status freshness",
      status: "ok",
      detail: `Updated ${Math.floor(ageDays)} day(s) ago.`,
    };
  } catch {
    return {
      id: "sprint-status-fresh",
      title: "Sprint status freshness",
      status: "ok",
      detail: "No sprint-status.yaml yet (project pre-Phase-5).",
    };
  }
}

async function checkUnreviewedReviews(projectDir: string): Promise<SanityPanel> {
  const dir = join(projectDir, "_context/audit/reviews");
  try {
    const files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
    const fails: string[] = [];
    for (const f of files) {
      try {
        const raw = await readFile(join(dir, f), "utf8");
        const json = JSON.parse(raw) as { overall?: string };
        if (json.overall === "fail") fails.push(f);
      } catch {
        /* skip */
      }
    }
    if (fails.length > 0) {
      return {
        id: "reviewer-fails",
        title: "Open reviewer failures",
        status: "fail",
        detail: `${fails.length} review(s) flagged fail: ${fails.slice(0, 3).join(", ")}${fails.length > 3 ? "…" : ""}`,
      };
    }
    return {
      id: "reviewer-fails",
      title: "Open reviewer failures",
      status: "ok",
      detail: `${files.length} review(s) on disk, none failing.`,
    };
  } catch {
    return {
      id: "reviewer-fails",
      title: "Open reviewer failures",
      status: "ok",
      detail: "No reviews authored yet.",
    };
  }
}
