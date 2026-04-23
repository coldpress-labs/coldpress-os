/**
 * Retry-budget tracker for `<NEED_INFO>` round-trips (§5.4).
 *
 * Ports ChatDev's bounded dehallucination pattern: when a subagent keeps
 * emitting `<NEED_INFO>` on the same topic without resolution, the
 * orchestrator must escalate to the human instead of spinning. Default
 * limit is 3 round-trips per topic.
 *
 * Pure in-memory bookkeeping — caller persists (e.g., as YAML under
 * `.coldpress/need-info/budgets.yaml`) if they want cross-session
 * continuity.
 */

import {
  DEFAULT_RETRY_BUDGET,
  type NeedInfoBudget,
} from "../../schemas/need-info.schema.js";

export interface SpendResult {
  /** The updated budget record after spending. */
  budget: NeedInfoBudget;
  /**
   * True when this spend crossed the limit — orchestrator MUST escalate
   * to the human now rather than dispatching another round-trip.
   */
  exhausted: boolean;
}

export class NeedInfoBudgetTracker {
  private readonly budgets = new Map<string, NeedInfoBudget>();
  private readonly defaultLimit: number;

  constructor(opts: { defaultLimit?: number } = {}) {
    this.defaultLimit = opts.defaultLimit ?? DEFAULT_RETRY_BUDGET;
  }

  get(topic: string): NeedInfoBudget {
    const existing = this.budgets.get(topic);
    if (existing) return existing;
    const fresh: NeedInfoBudget = {
      schema_version: 1,
      topic,
      limit: this.defaultLimit,
      spent: 0,
    };
    this.budgets.set(topic, fresh);
    return fresh;
  }

  /**
   * Record one round-trip for `topic`. Returns the updated budget +
   * whether the budget is now exhausted (escalate signal).
   */
  spend(topic: string, lastMessageId?: string): SpendResult {
    const current = this.get(topic);
    const updated: NeedInfoBudget = {
      ...current,
      spent: current.spent + 1,
      last_message_id: lastMessageId ?? current.last_message_id,
    };
    this.budgets.set(topic, updated);
    return { budget: updated, exhausted: updated.spent >= updated.limit };
  }

  isExhausted(topic: string): boolean {
    const b = this.budgets.get(topic);
    if (!b) return false;
    return b.spent >= b.limit;
  }

  /**
   * Clear the budget for `topic` after a resolution lands. Next emission
   * on the same topic starts from zero.
   */
  reset(topic: string): void {
    this.budgets.delete(topic);
  }

  /** Serialisable snapshot for persistence or logging. */
  toArray(): NeedInfoBudget[] {
    return Array.from(this.budgets.values());
  }
}
