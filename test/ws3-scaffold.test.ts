/**
 * WS3-A — lane defaulting + state.yaml scaffolding at init (§6).
 */

import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { copyTemplate } from "../src/utils/scaffold";
import { ColdpressYamlSchema } from "../schemas/coldpress-yaml.schema";
import { StateSchema } from "../schemas/state.schema";

let dir: string;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "coldpress-ws3-"));
});
afterEach(() => rmSync(dir, { recursive: true, force: true }));

async function scaffold(lane?: "lite" | "full"): Promise<{ cfg: unknown; state: unknown }> {
  await copyTemplate({ projectName: "Demo", slug: "demo", userName: "T", targetDir: dir, lane });
  return {
    cfg: parseYaml(readFileSync(join(dir, "coldpress.yaml"), "utf8")),
    state: parseYaml(readFileSync(join(dir, ".coldpress/state.yaml"), "utf8")),
  };
}

describe("init scaffolding — lane + state.yaml", () => {
  it("defaults to the lite lane and seeds a valid state.yaml at Spec", async () => {
    const { cfg, state } = await scaffold();
    const parsedCfg = ColdpressYamlSchema.parse(cfg);
    expect(parsedCfg.lane).toBe("lite");
    const parsedState = StateSchema.parse(state);
    expect(parsedState.lane).toBe("lite");
    expect(parsedState.phase).toBe("spec");
    expect(parsedState.phase_status).toBe("entering");
    expect(parsedState.enforcement).toBe("on");
  });

  it("honours --lane full (state starts at Phase 1)", async () => {
    const { cfg, state } = await scaffold("full");
    expect(ColdpressYamlSchema.parse(cfg).lane).toBe("full");
    expect(StateSchema.parse(state).phase).toBe(1);
  });
});
