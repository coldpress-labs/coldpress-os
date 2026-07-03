/**
 * `check:drift` — the drift gate (action plan §9 WS1, principle 4:
 * "one source, generated views — every count, matrix, and registry is a build
 * output with a CI drift check").
 *
 * Regenerates every derived artifact from source and fails if the result
 * differs from what is committed. This is the single entry point the CI job
 * runs; new generators plug into GENERATORS as §8 item 11 lands (REGISTRY.md,
 * TEMPLATES-REGISTRY.md, agent-roster.csv, docs/generated/*).
 *
 * Usage: `npm run check:drift`. Exit 0 = in sync; exit 1 = drift (prints the
 * drifted paths). Run the generators locally and commit their output to fix.
 */

import { execSync } from "node:child_process";

interface Generator {
  /** Human-readable label. */
  name: string;
  /** Command that regenerates the artifact(s) from source. */
  cmd: string;
  /** Paths (git pathspecs) whose post-regeneration diff signals drift. */
  paths: string[];
}

const GENERATORS: Generator[] = [
  {
    name: "skills → plugin/",
    cmd: "npm run --silent build:skills",
    paths: ["plugin/"],
  },
  {
    name: "agent roster",
    cmd: "npm run --silent build:roster",
    paths: ["data/agents/agent-roster.csv"],
  },
  {
    name: "stack×deploy matrix",
    cmd: "npm run --silent build:deploy-matrix",
    paths: ["docs/generated/stack-deploy-matrix.md"],
  },
  {
    name: "client-touchpoints registry",
    cmd: "npm run --silent build:client-touchpoints",
    paths: ["docs/generated/client-touchpoints.md"],
  },
  // Future generators (§8 item 11 docs-regeneration) plug in here:
  //   { name: "registries", cmd: "npm run --silent build:registries",
  //     paths: ["REGISTRY.md", "TEMPLATES-REGISTRY.md", "data/agents/agent-roster.csv", "docs/generated/"] },
];

function main(): void {
  let drift = false;
  for (const g of GENERATORS) {
    process.stdout.write(`check:drift — regenerating ${g.name}...\n`);
    execSync(g.cmd, { stdio: "inherit" });
    const status = execSync(`git status --porcelain -- ${g.paths.join(" ")}`, {
      encoding: "utf8",
    }).trim();
    if (status) {
      drift = true;
      process.stderr.write(`\n✗ DRIFT in ${g.name} — regenerated output differs from committed:\n${status}\n`);
    }
  }

  if (drift) {
    process.stderr.write(
      "\ncheck:drift FAILED. A generated artifact is out of date. Run its generator " +
        "locally and commit the result (do not hand-edit generated files).\n",
    );
    process.exit(1);
  }
  process.stdout.write("check:drift OK — all generated artifacts are up to date.\n");
}

main();
