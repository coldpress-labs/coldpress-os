#!/usr/bin/env bash
# ─── pack → clean-install → init smoke (audit F3) ──────────────────────────
# Restores the pre-overhaul packaging smoke: `npm pack` the real tarball,
# install it PRODUCTION-ONLY into a throwaway project, and scaffold with
# `coldpress init`. This is the exact check that caught both v0.3.x
# production-only packaging bugs — a runtime import of a devDependency, or a
# file missing from package.json `files[]`, fails here rather than in a user's
# `npm i -g`. Especially load-bearing now that distribution is the plugin.
#
# Asserts the plugin actually bootstraps in the scaffold (settings.json
# marketplace wiring + the copied plugin tree + ≥1 bundled SKILL.md).
#
# Usage: scripts/ci/pack-smoke.sh   (run from the repo root; used by CI + local)
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$REPO_ROOT"

echo "→ Building CLI…"
npm run --silent build

echo "→ Packing the tarball…"
TARBALL="$(npm pack --silent | tail -1)"
TARBALL_ABS="$REPO_ROOT/$TARBALL"
echo "  packed: $TARBALL"

WORK="$(mktemp -d)"
cleanup() { rm -rf "$WORK"; rm -f "$TARBALL_ABS"; }
trap cleanup EXIT

echo "→ Installing the tarball production-only into a clean project…"
cd "$WORK"
npm init -y >/dev/null 2>&1
# --omit=dev: a runtime import of a devDependency would now fail — the packaging
# bug class this smoke exists to catch.
npm install --omit=dev --no-audit --no-fund "$TARBALL_ABS" >/dev/null 2>&1

CLI="$WORK/node_modules/.bin/coldpress"
echo "→ coldpress --version: $("$CLI" --version)"

echo "→ Scaffolding a project non-interactively…"
"$CLI" init --yes --name "Smoke Test" --slug smoke-test --user "CI" --no-git-init --skip-doctor

# init creates the project directory from the slug.
PROJ="$WORK/smoke-test"
fail() { echo "::error::pack-smoke: $1"; exit 1; }

echo "→ Asserting the scaffold + plugin bootstrap…"
[ -f "$PROJ/CLAUDE.md" ]        || fail "CLAUDE.md missing from scaffold"
[ -f "$PROJ/coldpress.yaml" ]   || fail "coldpress.yaml missing from scaffold"
[ -f "$PROJ/.claude/settings.json" ] || fail ".claude/settings.json missing from scaffold"

# The plugin must be wired in settings.json (marketplace + enabled) …
grep -q "extraKnownMarketplaces" "$PROJ/.claude/settings.json" || fail "settings.json does not register the plugin marketplace"
grep -q "coldpress-os@coldpress"  "$PROJ/.claude/settings.json" || fail "settings.json does not enable the coldpress-os plugin"

# … and the plugin tree must actually be present in the copied framework.
[ -f "$PROJ/coldpress-os/plugin/.claude-plugin/marketplace.json" ] || fail "plugin marketplace.json not bundled into the scaffold"
[ -f "$PROJ/coldpress-os/plugin/.claude-plugin/plugin.json" ]      || fail "plugin.json not bundled into the scaffold"
SKILL_COUNT="$(find "$PROJ/coldpress-os/plugin/skills" -name SKILL.md 2>/dev/null | wc -l | tr -d ' ')"
[ "$SKILL_COUNT" -ge 1 ] || fail "no bundled SKILL.md files in the plugin (found $SKILL_COUNT)"

# No per-skill wrappers should be scaffolded (the plugin replaced them).
[ ! -d "$PROJ/.claude/skills" ] || fail ".claude/skills wrappers should not be scaffolded (plugin distribution)"

echo "✓ pack-smoke passed — tarball installs production-only, init scaffolds, plugin bootstraps ($SKILL_COUNT bundled skills)."
