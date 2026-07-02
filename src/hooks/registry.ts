/**
 * Hook registry — maps `coldpress hook <name>` to its handler (§4.4, WS1).
 *
 * WS1 hooks land here one at a time as they are built. WS2+ hooks
 * (boundary-guard, deploy-gate, next-task) register here when their upstream
 * machinery (handoff packets, deploy packs) exists.
 */

import { boundaryGuardHandler } from "./boundary-guard.js";
import { gitGuardHandler } from "./git-guard.js";
import { loadStateHandler } from "./load-state.js";
import { phaseGateHandler } from "./phase-gate.js";
import { qualityGateHandler } from "./quality-gate.js";
import { runLogHandler } from "./run-log.js";
import { sacredGuardHandler } from "./sacred-guard.js";
import { schemaValidateHandler } from "./schema-validate.js";
import { secretScanHandler } from "./secret-scan.js";
import { testIntegrityHandler } from "./test-integrity.js";
import type { HookHandler } from "./types.js";

export const HOOK_HANDLERS: Record<string, HookHandler> = {
  [boundaryGuardHandler.name]: boundaryGuardHandler,
  [gitGuardHandler.name]: gitGuardHandler,
  [loadStateHandler.name]: loadStateHandler,
  [phaseGateHandler.name]: phaseGateHandler,
  [qualityGateHandler.name]: qualityGateHandler,
  [runLogHandler.name]: runLogHandler,
  [sacredGuardHandler.name]: sacredGuardHandler,
  [schemaValidateHandler.name]: schemaValidateHandler,
  [secretScanHandler.name]: secretScanHandler,
  [testIntegrityHandler.name]: testIntegrityHandler,
};

export function getHook(name: string): HookHandler | undefined {
  return HOOK_HANDLERS[name];
}

/** All registered hook names, for `coldpress hook --list` / doctor. */
export function hookNames(): string[] {
  return Object.keys(HOOK_HANDLERS).sort();
}
