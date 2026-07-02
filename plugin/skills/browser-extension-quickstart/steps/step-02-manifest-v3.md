---
step_number: 2
step_name: "Configure Manifest V3"
step_goal: "Set up wxt.config.ts with minimal Manifest V3 permissions"
halts_for_input: false
next_step: "step-03-tailwind.md"
---

## Goal

Configure `wxt.config.ts` with Manifest V3 settings, a minimal permissions set, and correct extension metadata.

## Instructions

1. Open (or create) `wxt.config.ts` in the project root:
   ```typescript
   import { defineConfig } from "wxt";

   export default defineConfig({
     extensionApi: "chrome",
     modules: ["@wxt-dev/module-react"],
     manifest: {
       name: "<your-extension-name>",
       description: "<short description>",
       version: "0.1.0",
       permissions: [],
       host_permissions: [],
     },
   });
   ```

2. Add only the permissions your extension requires. Common minimal sets:

   | Use case | Permissions |
   |----------|------------|
   | Read current tab URL | `"tabs"` |
   | Store user settings | `"storage"` |
   | Fetch external API | `host_permissions: ["https://api.example.com/*"]` |
   | Context menus | `"contextMenus"` |
   | Alarms / scheduled tasks | `"alarms"` |

   **Do not add `"<all_urls>"` host permissions unless required.** Chrome Web Store reviewers flag over-broad permissions.

3. For Firefox compatibility, add the `browser_specific_settings` field:
   ```typescript
   manifest: {
     // ...existing fields...
     browser_specific_settings: {
       gecko: {
         id: "<your-extension-id>@example.com",
         strict_min_version: "109.0",
       },
     },
   },
   ```
   Replace the `id` with a unique reverse-domain string.

4. Confirm the manifest is valid by running a build:
   ```bash
   pnpm build
   ```
   Check `.output/chrome-mv3/manifest.json` — confirm `"manifest_version": 3` is present.

## Output

- `wxt.config.ts` with MV3 + minimal permissions
- `pnpm build` exits 0
- `.output/chrome-mv3/manifest.json` shows `"manifest_version": 3`

## Navigation

→ Next: [step-03-tailwind.md](step-03-tailwind.md)
