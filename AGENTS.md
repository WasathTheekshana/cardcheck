# Notes for coding agents

Humans are welcome to read this too.

- **Yarn only.** Use `yarn`, never `npm` or `pnpm`. The repo pins Yarn through `packageManager` and
  `.yarn/releases`, and `preinstall` rejects other package managers.
- **Check before you finish:** `yarn lint && yarn typecheck && yarn test && yarn build`.
- **Next.js 16.** Read the docs in `node_modules/next/dist/docs/` before using an API you are unsure about. Some
  conventions differ from older versions.
- **`src/lib/card` stays framework-free.** No React, no DOM, no Node-only APIs. Every behaviour change there needs a
  test next to it.
- **Never write real card numbers** into code, tests or docs. Use `KNOWN_TEST_NUMBERS` or `generateTestNumber`.
- **Network logos** live in `public/logos` and are served from this site only. Keep the site non-commercial and educational. No analytics, no network calls from the browser.
- **Card textures read two CSS variables by name**, `--font-ui` and `--font-num`, set in `src/app/layout.tsx`. Rename
  them in both places or the 3D card falls back to system fonts.
- **Writing style:** plain and specific, the way a person would explain it. No em dashes.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
