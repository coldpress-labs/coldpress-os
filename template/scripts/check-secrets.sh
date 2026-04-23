#!/usr/bin/env bash
# ─── check-secrets.sh ─────────────────────────────────────────────
# Pre-commit guard against accidentally staging common secret
# patterns. Scans the git-staged diff only — not the whole tree.
#
# Install once per clone:
#   cp scripts/check-secrets.sh .git/hooks/pre-commit
#   chmod +x .git/hooks/pre-commit
#
# Override a single commit (use sparingly):
#   SKIP_SECRET_SCAN=1 git commit ...
#
# Patterns are intentionally conservative — false positives are
# cheaper than a leaked key. Extend the list below as needed.

set -euo pipefail

if [[ "${SKIP_SECRET_SCAN:-0}" == "1" ]]; then
  echo "check-secrets: skipped via SKIP_SECRET_SCAN=1" >&2
  exit 0
fi

# Collect the staged diff. -U0 = no context lines; faster + fewer hits.
diff=$(git diff --cached --no-color -U0)

if [[ -z "$diff" ]]; then
  exit 0
fi

# Only look at added lines.
added=$(printf '%s\n' "$diff" | grep -E '^\+[^+]' || true)

if [[ -z "$added" ]]; then
  exit 0
fi

# ─── Pattern catalogue ────────────────────────────────────────────
# Each pattern is a single extended-regex. If any matches, commit
# aborts with a helpful message.
declare -a patterns=(
  'AKIA[0-9A-Z]{16}'                                  # AWS access key ID
  'aws_secret_access_key[[:space:]]*=[[:space:]]*[A-Za-z0-9/+=]{40}'
  'AIza[0-9A-Za-z_-]{35}'                             # Google API key
  'ghp_[A-Za-z0-9]{36}'                               # GitHub personal access token
  'gho_[A-Za-z0-9]{36}'                               # GitHub OAuth token
  'github_pat_[A-Za-z0-9_]{82}'                       # GitHub fine-grained token
  'xox[baprs]-[A-Za-z0-9-]{10,}'                      # Slack bot / user token
  'sk-[A-Za-z0-9]{32,}'                               # Stripe / OpenAI secret key
  'sk_live_[A-Za-z0-9]{24,}'                          # Stripe live secret
  'rk_live_[A-Za-z0-9]{24,}'                          # Stripe live restricted
  '-----BEGIN ((RSA|EC|DSA|OPENSSH|PGP) )?PRIVATE KEY'
  '(api[_-]?key|auth[_-]?token|password|passwd|secret)[[:space:]]*[:=][[:space:]]*["'"'"'][^"'"'"' $]{12,}["'"'"']'
)

hit=0
for pattern in "${patterns[@]}"; do
  match=$(printf '%s\n' "$added" | grep -E -m 1 -- "$pattern" || true)
  if [[ -n "$match" ]]; then
    echo "check-secrets: possible secret matching /$pattern/:" >&2
    echo "    $match" >&2
    hit=1
  fi
done

if [[ "$hit" -eq 1 ]]; then
  echo "" >&2
  echo "Commit blocked. If this is a false positive, re-run with" >&2
  echo "  SKIP_SECRET_SCAN=1 git commit ..." >&2
  echo "If this is a real secret, remove it and move the value to secure/.env*." >&2
  exit 1
fi

exit 0
