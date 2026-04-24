/**
 * `coldpress dashboard` — start the localhost project dashboard (§6.10).
 *
 * Reads project state from cwd by default; `--port` / `--open` flags.
 * Logs the URL once the server is bound; runs until Ctrl-C.
 */

import { exec } from "node:child_process";
import { platform } from "node:os";
import { resolve } from "node:path";
import pc from "picocolors";
import {
  DEFAULT_DASHBOARD_HOST,
  DEFAULT_DASHBOARD_PORT,
  startDashboardServer,
} from "../dashboard/server.js";

export interface RunDashboardOptions {
  projectDir?: string;
  port?: number;
  open?: boolean;
  pollIntervalMs?: number;
}

export async function runDashboard(
  options: RunDashboardOptions = {},
): Promise<void> {
  const projectDir = resolve(options.projectDir ?? process.cwd());
  const running = await startDashboardServer({
    projectDir,
    port: options.port ?? DEFAULT_DASHBOARD_PORT,
    host: DEFAULT_DASHBOARD_HOST,
    pollIntervalMs: options.pollIntervalMs,
  });

  console.log(pc.bgCyan(pc.black(" coldpress dashboard ")), pc.dim(`project: ${projectDir}`));
  console.log();
  console.log(`  ${pc.cyan("►")} ${pc.bold(running.url)}`);
  console.log(pc.dim(`  bound to ${running.host}:${running.port} (loopback only)`));
  console.log();
  console.log(pc.dim("  Press Ctrl-C to stop."));

  if (options.open) {
    void openInBrowser(running.url);
  }

  // Block forever; the process model is foreground until SIGINT.
  await new Promise<void>(() => {});
}

function openInBrowser(url: string): void {
  const cmd =
    platform() === "darwin"
      ? `open ${JSON.stringify(url)}`
      : platform() === "win32"
        ? `start "" ${JSON.stringify(url)}`
        : `xdg-open ${JSON.stringify(url)}`;
  exec(cmd, () => {
    /* best-effort; surface nothing if the command isn't available */
  });
}
