---
step_number: 5
step_name: "Verify"
step_goal: "Confirm dev, build, zip, and tests all pass"
halts_for_input: false
next_step: null
---

## Goal

Confirm the extension builds correctly for both Chrome and Firefox, tests pass, and the release artefacts are produced.

## Instructions

1. Run the tests:
   ```bash
   pnpm test
   ```
   Expected: Vitest runs and all tests pass. Exit code 0.

2. Run a development build:
   ```bash
   pnpm dev
   ```
   Expected: WXT opens a browser with the extension loaded. No console errors in the background worker or popup.

3. Build for both targets:
   ```bash
   pnpm build --browser chrome
   pnpm build --browser firefox
   ```
   Expected:
   - `.output/chrome-mv3/` is created
   - `.output/firefox-mv3/` is created
   - Both exit code 0

4. Produce zip artefacts:
   ```bash
   pnpm zip --browser chrome
   pnpm zip --browser firefox
   ```
   Expected:
   - `.output/<name>-<version>-chrome.zip` is created
   - `.output/<name>-<version>-firefox.xpi` is created

5. Inspect the Chrome manifest:
   ```bash
   cat .output/chrome-mv3/manifest.json
   ```
   Confirm:
   - `"manifest_version": 3`
   - `"permissions"` contains only the minimal set you configured
   - No `"background.scripts"` (MV3 uses `"background.service_worker"`)

6. Inspect the Firefox manifest:
   ```bash
   cat .output/firefox-mv3/manifest.json
   ```
   Confirm:
   - `"browser_specific_settings"` is present with your gecko ID
   - `"manifest_version": 3`

7. Test the extension manually in a browser:
   - Chrome: go to `chrome://extensions` → Enable Developer Mode → Load unpacked → select `.output/chrome-mv3/`
   - Firefox: go to `about:debugging` → This Firefox → Load Temporary Add-on → select any file in `.output/firefox-mv3/`

   Confirm the popup opens and entrypoints function as expected.

## Completion Criteria

- `pnpm test` exits 0 — Vitest passes
- `pnpm build --browser chrome` and `--browser firefox` both exit 0
- `pnpm zip` produces `.zip` and `.xpi` artefacts
- MV3 manifest confirmed for both targets
- Extension loads manually in Chrome or Firefox without errors
- `.github/workflows/release.yml` present (produces artefacts on version tag push)

## Navigation

Setup complete. Tag a release (`git tag v0.1.0 && git push --tags`) to trigger the GitHub Actions release workflow and publish artefacts.
