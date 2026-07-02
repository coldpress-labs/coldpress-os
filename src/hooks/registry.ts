/**
 * Hook registry — maps `coldpress hook <name>` to its handler (§4.4, WS1).
 *
 * WS1 hooks land here one at a time as they are built. WS2+ hooks
 * (boundary-guard, deploy-gate, next-task) register here when their upstream
 * machinery (handoff packets, deploy packs) exists.
 */

import { loadStateHandler } from "./load-state.js";
import type { HookHandler } from "./types.js";

export const HOOK_HANDLERS: Record<string, HookHandler> = {
  [loadStateHandler.name]: loadStateHandler,
};

export function getHook(name: string): HookHandler | undefined {
  return HOOK_HANDLERS[name];
}

/** All registered hook names, for `coldpress hook --list` / doctor. */
export function hookNames(): string[] {
  return Object.keys(HOOK_HANDLERS).sort();
}
