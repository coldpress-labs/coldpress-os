#!/usr/bin/env node
// coldpress enforcement hook — thin wrapper (dep-free, Node core only).
//
// Forwards this Claude Code hook invocation to the coldpress CLI; the real
// logic lives in @coldpress/core (src/hooks/load-state.ts) so it stays
// unit-tested and DRY. `.claude/settings.json` wires the SessionStart event
// to this script. See the coldpress-os hook harness (action plan §4.4).
//
// `stdio: "inherit"` passes the hook payload (stdin) straight through and
// relays the CLI's decision (stdout) + exit code back to Claude Code.
// If the `coldpress` CLI is not on PATH, this no-ops (exit 0) rather than
// wedging the session — `coldpress doctor` reports hook health.
import { spawn } from "node:child_process";

const child = spawn("coldpress", ["hook", "load-state"], { stdio: "inherit" });
child.on("error", () => process.exit(0));
child.on("exit", (code) => process.exit(code ?? 0));
