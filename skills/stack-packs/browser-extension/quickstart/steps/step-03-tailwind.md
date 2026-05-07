---
step_number: 3
step_name: "Add Tailwind CSS"
step_goal: "Install and configure Tailwind for use in popup and content-script UI"
halts_for_input: false
next_step: "step-04-vitest-actions.md"
---

## Goal

Add Tailwind CSS so that popup HTML and any injected UI can use utility classes.

## Instructions

1. Install Tailwind and the WXT Tailwind module:
   ```bash
   pnpm add -D tailwindcss @wxt-dev/module-tailwindcss
   ```

2. Add the module to `wxt.config.ts`:
   ```typescript
   import { defineConfig } from "wxt";

   export default defineConfig({
     extensionApi: "chrome",
     modules: ["@wxt-dev/module-react", "@wxt-dev/module-tailwindcss"],
     // ...
   });
   ```

3. Create `tailwind.config.ts`:
   ```typescript
   import type { Config } from "tailwindcss";

   export default {
     content: ["entrypoints/**/*.{html,ts,tsx}", "components/**/*.{ts,tsx}"],
     theme: {
       extend: {},
     },
     plugins: [],
   } satisfies Config;
   ```

4. Create `assets/tailwind.css` (global stylesheet):
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

5. Import the stylesheet in your popup entry (`entrypoints/popup/main.ts` or equivalent):
   ```typescript
   import "~/assets/tailwind.css";
   ```

6. Confirm Tailwind classes render correctly:
   ```bash
   pnpm dev
   ```
   Add a test class (`class="bg-blue-500 text-white p-4"`) to your popup HTML and confirm it renders with styling.

## Output

- Tailwind installed + configured via WXT module
- `tailwind.config.ts` set to scan entrypoints
- Popup renders Tailwind utility classes in dev mode

## Navigation

→ Next: [step-04-vitest-actions.md](step-04-vitest-actions.md)
