---
name: secure-pattern
description: How coldpress-os separates declared credential shape from actual secret values
version: "1.0"
---

# The `secure/` Pattern

> Credentials in coldpress-os live under `secure/`. The shape of what you need is committed. The values never are.

---

## Why

Most secret leaks are one of three shapes:

1. Someone pasted a key into a source file for "just a minute" and forgot.
2. A `.env` got committed because `.gitignore` didn't cover it.
3. A new teammate couldn't tell what credentials the project needed, so they hard-coded one while debugging.

The `secure/` pattern aims directly at #3. Once the project declares — in-repo, reviewable — *which* credentials it needs, there is no excuse for inline secrets.

---

## The shape

```
secure/
├── manifest.yaml     ← tracked: names + notes for required keys
├── .env              ← ignored: real values, local-dev defaults
├── .env.live         ← ignored: production values (injected in CI, never on disk)
└── .env.sandbox      ← ignored: sandbox values (same)
```

`.gitignore` excludes `secure/.env*`. `secure/manifest.yaml` is not matched by any ignore rule and is therefore tracked.

---

## `manifest.yaml`

A simple declaration. Enough to tell a reviewer "here is every key this project can use" without handing them a single byte of secret material.

```yaml
version: 1

keys:
  - name: OPENAI_API_KEY
    service: openai
    required: true
    notes: "LLM calls; dev key locally, live key in CI"

  - name: DATABASE_URL
    service: postgres
    required: true
    notes: "Primary DB connection string"

  - name: SENTRY_DSN
    service: sentry
    required: false
    notes: "Error tracking; disabled if unset"
```

Loaders treat `required: true` as fatal-at-boot: missing keys abort startup with the `notes:` string as the error message. Optional keys disable their downstream feature.

---

## Loader pattern

Any loader is fine — the manifest has no opinion on language. Conceptually:

1. Read `secure/manifest.yaml`.
2. Read the relevant `secure/.env*` into an in-memory map.
3. For every `required: true` key in the manifest, assert presence; fail loudly with the notes string if missing.
4. Expose values via typed accessors — never by passing the raw map around.

A tiny Node example:

```js
import fs from "node:fs";
import yaml from "yaml";
import dotenv from "dotenv";

const manifest = yaml.parse(fs.readFileSync("secure/manifest.yaml", "utf8"));
const env = dotenv.parse(fs.readFileSync("secure/.env"));

for (const key of manifest.keys) {
  if (key.required && !env[key.name]) {
    throw new Error(`Missing required secret ${key.name}: ${key.notes}`);
  }
}

export const secrets = Object.freeze({
  openai: env.OPENAI_API_KEY,
  db: env.DATABASE_URL,
  sentry: env.SENTRY_DSN,
});
```

---

## Pre-commit guard

`template/scripts/check-secrets.sh` scans the staged diff for common secret shapes (AWS keys, GitHub tokens, Stripe keys, dotenv-style `api_key="…"` patterns, private-key blocks). Install it once per clone:

```bash
cp scripts/check-secrets.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

Escape hatch for a known false positive:

```bash
SKIP_SECRET_SCAN=1 git commit -m "…"
```

False positives are cheaper than leaks — err conservative, widen the pattern list when you hit a repeated false hit, not when you hit the first one.

---

## What this pattern is *not*

- Not a secrets manager. For live deployments, use your platform's managed secrets (Vercel env vars, Fly secrets, AWS Secrets Manager, 1Password Connect, etc.) — `secure/.env.live` is for local-to-live parity checks, not long-lived storage.
- Not encryption-at-rest. If you need that, add `sops` or `age` on top; the manifest describes shape, not protection.
- Not rotation. Rotation lives outside the repo.

The manifest is about **reviewability of the credential shape**. Rotation, encryption, and managed storage are separate layers that compose on top.

---

## Orchestration context

> **Hello Butler.** Butler is coldpress-os's main orchestrator agent — your default Claude Code session running with `CLAUDE.md` as its directive. Butler dispatches the 8 Shape A subagents (analyst · architect · pm · ux-designer · developer · verifier · devops · reviewer) and runs the phase gates. The protocol / spec / schema documented above is invoked by Butler (or by a Butler-dispatched subagent) at the relevant phase. See [`butler.md`](butler.md) for the orchestrator reference and the canonical `Hello Butler` entry point.

