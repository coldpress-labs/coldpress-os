#!/usr/bin/env node
// coldpress enforcement hook runner — thin, dep-free (Node core only).
//
// `.claude/settings.json` wires each Claude Code hook event to
//   node scripts/hooks/run.mjs <hook-name>
// This forwards the hook payload (stdin) to `coldpress hook <hook-name>` and
// relays its decision (stdout) + exit code back to Claude Code. The real logic
// lives in @coldpress/core (src/hooks/*), so it stays unit-tested and DRY.
// See the coldpress-os hook harness (action plan §4.4).
//
// If the `coldpress` CLI is not on PATH, this no-ops (exit 0) rather than
// wedging the session — `coldpress doctor` reports hook health.
import { spawn } from "node:child_process";

// Forward ALL args after the script (hook name + any flags like `--explain`)
// to `coldpress hook …`. Previously only argv[2] (the name) was passed, so
// `--explain` and other flags never reached the CLI (WS10-E1 fix).
const args = process.argv.slice(2);
if (args.length === 0) {
  process.stderr.write("coldpress hook runner: no hook name given\n");
  process.exit(0);
}

const child = spawn("coldpress", ["hook", ...args], { stdio: "inherit" });
child.on("error", () => process.exit(0));
child.on("exit", (code) => process.exit(code ?? 0));
