---
step_number: 1
step_name: "Init WXT Project"
step_goal: "Scaffold a WXT project and choose which entrypoints to include"
halts_for_input: true
next_step: "step-02-manifest-v3.md"
---

## Goal

Create a new WXT browser extension project and select which entrypoints (popup, content script, background worker) to scaffold.

## Instructions

1. Ask:

**Question:** Which entrypoints does your extension need?
- **(A)** Popup only — browser action / toolbar button with a UI
- **(B)** Popup + content script — popup plus a script injected into pages
- **(C)** Popup + content script + background worker — full extension with service worker
- **(D)** Content script only — no popup; runs silently on pages

[Wait for user input]

2. Scaffold with WXT:
   ```bash
   pnpm dlx wxt@latest init <project-name>
   ```
   When prompted, select **TypeScript** template.

3. Navigate into the project:
   ```bash
   cd <project-name>
   ```

4. Install dependencies:
   ```bash
   pnpm install
   ```

5. Based on the answer in step 1, verify or create the following entrypoints under `entrypoints/`:

   **Popup** (`entrypoints/popup/`):
   ```
   entrypoints/popup/index.html
   entrypoints/popup/main.ts
   ```

   **Content script** (`entrypoints/content.ts`):
   ```typescript
   export default defineContentScript({
     matches: ["<all_urls>"],
     main() {
       console.log("Content script loaded.");
     },
   });
   ```

   **Background worker** (`entrypoints/background.ts`):
   ```typescript
   export default defineBackground(() => {
     console.log("Background worker started.");
   });
   ```

   Remove any entrypoints not selected.

6. Confirm dev mode works:
   ```bash
   pnpm dev
   ```
   WXT should open a browser with the extension loaded.

## Output

- WXT project scaffolded with TypeScript
- Correct entrypoints present
- `pnpm dev` runs without error

## Navigation

→ Next: [step-02-manifest-v3.md](step-02-manifest-v3.md)
