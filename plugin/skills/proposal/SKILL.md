---
name: proposal
description: "Pre-sales proposal mode (client work) — a timeboxed run of Phase 1–2 plus a stack shortlist, emitting a proposal pack: product brief + an indicative 85%-confidence timeline (G8-lite from a coarse story estimate) + a scope/price scaffold + an assumptions register. If won, every artifact carries into the real project unchanged; if lost, the run cost one session."
license: MIT
compatibility: Invoked by @analyst in Phase 2
allowed-tools: "Read Write WebSearch WebFetch"
---

## Purpose

Turn the framework's rigor into **win-rate**. For a solo services studio, the
highest-leverage client-facing feature: a fast, credible proposal that — crucially
— is **not throwaway**. This runs a timeboxed slice of the real lifecycle (P1–P2
+ a stack shortlist), so a won proposal's artifacts (context, brief, stack
direction) carry into the real project unchanged. A lost one cost a session, not
a week.

## When to Use

- Pre-sales, before an engagement is signed. One timeboxed session (not a full P1–P2).

## Process

1. **Timeboxed P1–P2** — run `intake` (lite) + `research`/`validate-idea` /
   `product-brief` at proposal depth: enough to understand the problem, audience,
   and kill-risks — not the full discovery.
   - **Adversarial Socratic pass (Forge)** — before writing anything client-facing,
     forge the engagement's load-bearing assumptions (`elicitation-methods.csv` #51,
     the same bmad forge-idea chain `validate-idea` Step 2 runs): *why do we believe
     the client's framing? what evidence would we already have? what would falsify
     it? who loses if we're wrong?* Every assumption that survives becomes an
     evidenced line in the brief; every one that doesn't becomes a **named entry in
     the assumptions register (§5)** — this is precisely what protects the quote.
2. **Stack shortlist** — a coarse `deploy-select`-informed stack direction (which
   profile/pack fits), not a locked stack.
3. **Indicative timeline (G8-lite)** — a coarse story estimate → an **85%-confidence
   commitment date** with a pre-ranked scope-cut list (the same critical-path math
   as `client-timeline`, run on a coarse breakdown). Under-promise honestly.
4. **Scope / price scaffold** — what's in, what's explicitly out, phased if useful.
5. **Assumptions register** — every assumption the estimate rests on (access,
   content, third-party accounts, decisions pending). This is what protects the
   quote when reality differs.
6. **Emit the proposal pack** → `_context/planning/proposal/`: brief, timeline,
   scope/price, assumptions. Client-readable.

## Output

A proposal pack. **Won → carry the artifacts into the real project** (the brief +
context are already real, versioned distillates); **lost → one session spent.**
Feeds the client-touchpoints registry (§7.17).

---

### Version Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1 | 2026-07-03 | Butler (v0.4 D10 adopt 1 — BMAD forge-idea) | Process Step 1 gains an **adversarial Socratic pass (Forge)** — the same `elicitation-methods.csv` #51 four-question chain `validate-idea` Step 2 runs — over the engagement's load-bearing assumptions before any client-facing text; survivors become evidenced brief lines, the rest become named entries in the assumptions register (§5). Closes D10 adopt (1) on the proposal side. |
| 1.0 | 2026-07-03 | Butler (v0.4 WS9) | NEW (§5 P2). Timeboxed pre-sales mode: P1–P2 (proposal depth) + stack shortlist → proposal pack (brief + 85%-confidence timeline G8-lite + scope/price scaffold + assumptions register). Won artifacts carry into the real project unchanged; converts framework rigor into win-rate. |
