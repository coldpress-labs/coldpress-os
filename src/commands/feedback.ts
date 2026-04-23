import { spawn } from "node:child_process";
import { platform } from "node:process";
import pc from "picocolors";

const FEEDBACK_URL = "https://github.com/coldpress-labs/coldpress-os/issues/new/choose";

export function runFeedback(): void {
  console.log(`Opening ${pc.cyan(FEEDBACK_URL)} in your browser...`);

  const opener =
    platform === "darwin" ? "open" : platform === "win32" ? "start" : "xdg-open";

  const args = platform === "win32" ? ["", FEEDBACK_URL] : [FEEDBACK_URL];

  const proc = spawn(opener, args, {
    detached: true,
    stdio: "ignore",
    shell: platform === "win32",
  });
  proc.on("error", (err) => {
    console.error(pc.red(`Could not open browser: ${err.message}`));
    console.error(`Paste this into your browser: ${FEEDBACK_URL}`);
    process.exitCode = 1;
  });
  proc.unref();
}
