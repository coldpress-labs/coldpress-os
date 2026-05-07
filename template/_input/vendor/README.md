# `_input/vendor/`

**Purpose:** Third-party technical documentation required for integration.

Put things like:

- SDK documentation (e.g. Stripe, Twilio, Convex — downloaded copies for offline reference)
- API references (OpenAPI specs, Postman collections)
- Integration specs from partners
- Vendor architecture docs Butler needs to reason against

**Distinct from `reference/`:** `vendor/` is *required* reading — the project integrates with these systems. `reference/` is *optional* inspiration or background reading.

Butler ingests this during Phase 1 `intake` and surfaces the material again at Phase 3 (tech-stack decisions) and Phase 6 (implementation).
