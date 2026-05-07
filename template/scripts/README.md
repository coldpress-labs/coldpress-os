# `scripts/`

Small helper scripts shipped with the project scaffold. Everything here is bash; each script documents its own contract in its header comment.

## `check-secrets.sh`

Pre-commit guard against accidentally staging common secret patterns (AWS access keys, GitHub tokens, Stripe/OpenAI keys, private-key PEM blocks, quoted `api_key=…` / `password=…` lines).

**Installation:** `coldpress init` installs this as `.git/hooks/pre-commit` automatically after initialising the repo. The hook is active from the next commit onwards.

**To (re-)install manually** — e.g., after cloning an existing coldpress project:

```bash
cp scripts/check-secrets.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

**To bypass for a single commit** (use sparingly — prefer moving the value to `secure/.env*` instead):

```bash
SKIP_SECRET_SCAN=1 git commit ...
```

**To add patterns:** edit the `patterns=()` array in `check-secrets.sh`. False positives are cheaper than leaked keys, so err towards stricter patterns.

## Adding more scripts

Helper scripts that every scaffolded project needs belong here. One-off migration or tooling scripts belong in `_context/tracking/` or a task-specific folder.
