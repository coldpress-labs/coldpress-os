#!/usr/bin/env node
// coldpress statusLine — thin, dep-free wrapper. `.claude/settings.json` wires
// Claude Code's statusLine to this; it forwards to `coldpress statusline`, which
// reads .coldpress/state.yaml and prints lane · phase · tier · enforcement · gates.
// No-ops (prints nothing) if the coldpress CLI is unavailable.
import { spawn } from "node:child_process";

const child = spawn("coldpress", ["statusline"], { stdio: "inherit" });
child.on("error", () => process.exit(0));
child.on("exit", (code) => process.exit(code ?? 0));
