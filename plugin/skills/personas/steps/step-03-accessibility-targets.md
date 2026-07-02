---
step_number: 3
step_name: "Accessibility, Device & Locale Targets"
step_goal: "Capture WCAG level, device matrix, locale support, and offline requirements with rationale"
halts_for_input: true
next_step: "step-04-synthesize.md"
---

## Instructions

These targets directly drive Phase 3 stack selection (offline-first, PWA, server-rendered, locale libraries) and Phase 4 UX design (breakpoints, input modes, contrast). Without them, both phases pick for "nobody specific."

### 1. Accessibility target (WCAG level)

Ask the user, grounded in the archetypes:

> Based on your users, what accessibility level should v1 meet?
> - **WCAG 2.2 AA** — default for most products; legal floor in EU and many US sectors
> - **WCAG 2.2 AAA** — required for public-sector / education / healthcare / banking; significantly more effort
> - **WCAG 2.2 A** — absolute minimum; only suitable for short-lived prototypes
> - **Not applicable** — only for CLI tools / developer libraries / internal back-office

Capture the choice + a one-line rationale. Rationale matters because Phase 3 stack picks (testing tooling, component libraries) depend on it.

### 2. Device matrix

Ask:

> Which devices and screen sizes must v1 support?
> - Desktop only / desktop + mobile web / desktop + native mobile / mobile-first
> - Any specific browser floors (e.g., no IE11, Safari ≥15)?
> - Touch / keyboard / screen reader / voice input?

Cross-check against personas. If primary archetype is *"mid-career PM reviewing on Friday afternoons on their laptop,"* mobile-first is probably wrong. If primary is *"field technician in a warehouse with gloves on,"* desktop-only is wrong.

### 3. Locale and language

Ask:

> Which languages, and which locales?
> - Languages at launch (e.g., en-US only; en + es; 10 languages)
> - RTL support required? (Arabic, Hebrew)
> - Locale-specific formatting critical? (date, currency, number)
> - Any regulatory language requirements? (e.g., Quebec French, EU accessibility directives)

### 4. Offline / connectivity

Ask:

> What's the offline expectation?
> - **Online-only** — default for most SaaS
> - **Offline-tolerant** — degrades gracefully on bad connection
> - **Offline-first** — must work without a connection, syncs opportunistically

Offline-first specifically forces Phase 3 stack decisions (service workers, local DBs, CRDTs). Don't capture it lightly.

### 5. Cross-check against personas

Before moving on, re-read each archetype's journey and empathy map. Flag contradictions:

- If primary archetype is elderly-leaning but WCAG AA is the default, push to AAA for text-size and contrast specifically.
- If empathy map says *"frustrated by slow loading on mobile data,"* offline-tolerant is a floor, not a stretch.
- If archetype is non-English-speaking but locale picker says en-only, surface as blocking question.

## Output

Accessibility / device / locale / offline targets with rationale, cross-checked against personas. `step_3_complete: true`

## Navigation

→ Proceed to [step-04-synthesize.md](step-04-synthesize.md)
