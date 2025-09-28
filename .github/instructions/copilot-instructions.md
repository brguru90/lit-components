# Lit Components – Copilot Instructions

## Architecture snapshot
- Root `package.json` describes the `vg` Lit component library. Development uses Vite + TypeScript (`vite.config.ts` for the playground, `vite-module.config.ts` for the distributable bundle).
- `src/index.ts` is the single public barrel—export each component here so it ships in `dist/index.{js,d.ts}` and downstream wrappers (`vg/react`, `vg/vue`).
- Components live under `src/components/<Name>/`. The repo ships a playground element in `src/my-element.ts` that mounts `<my-element>` for quick manual testing without touching the library entry points.

## Component authoring pattern
- Documentation and type definition are defined as per https://custom-elements-manifest.open-wc.org/analyzer/getting-started/
- Extend `LitElement`, decorate with `@customElement`, and append the matching `declare global` block (see `src/components/Button/index.ts`).
- SCSS sits beside the component (`style.scss`) and is imported with `?inline`, then applied via `unsafeCSS`. Keep selectors scoped to the host.
- Derive computed state inside `willUpdate` instead of `render` (e.g. `fontSize` recomputed from the `size` property). Use `@state` fields for internal state the template depends on.
- Always prefix events with `vg-`, Example: `vg-click` instead of `click` to avoid collisions with native DOM events and use dashed case to separate words.
- Fire bubbled `CustomEvent`s with clear payloads; `VgButton` emits `vg-click` carrying `{ originalEvent }`. React consumers receive this as `onVgClick`, Angular uses `(vg-click)` bindings, vanilla listens via `addEventListener('vg-click', …)`.
- Clean up side effects in `disconnectedCallback`; follow this pattern for timers or subscriptions.

## Styling & tokens
- Global design tokens belong in `src/components/ThemeProvider/theme.scss`. The provider currently wraps slotted content but still ships styles globally, so constrain selectors appropriately.
- Import shared assets via the `@/` alias (resolved to `src/` in both TS configs and Vite). Remember `tsconfig.json` enables `allowImportingTsExtensions`, so keep the `.ts` suffix when referencing TS sources.

## Builds & local workflows
- Install once with `npm install` at the repo root.
- `npm run dev` starts Vite on port 8080 serving `src/my-element.ts`. It auto-imports `src/index.ts`, so new components appear after updating the barrel.
- `npm run build` runs `tsc` (playground config) then `vite build`, outputting an ES module bundle into `build/` for smoke-testing the showcase element.
- `npm run build-module` runs `build-ts` (TypeScript declarations via `tsconfig-module.json`, emitted under `types/`) then `build-js` (library bundle via `vite-module.config.ts`, emitted into `dist/`).
- `npm run demo` starts all framework demo apps simultaneously for integration testing.

## Release artifacts & manifest pipeline
- `npm run release` = `build-module` → `lsp-support` (custom-elements manifest + wrappers) → `fix_stuff` → version bump → `pack` → `update-demos` + `install-demos`. Run this before publishing or refreshing demos.
- `custom-elements-manifest.config.mjs` wires plugins that generate:
  - React wrappers in `dist/react` (`import { VgButton } from "vg/react"`).
  - Vue wrappers + typings in `dist/vue` (`import "vg/vue"`).
  - VS Code HTML/CSS custom data inside `dist/` for editor IntelliSense.
  - A post-processing plugin copying `vg-package.json` / `vg-package-lock.json` into `dist/` so the package is self-contained and creates `dist/vue/index.js` that re-exports the base bundle.
- Keep the generated `dist/` and `vg-{version}.tgz` in sync; regenerate before consuming from demos or external projects.

## Framework demos & debugging aids
- Each demo app under `demo/*` depends on the tarball via `"vg": "file:../../vg-{version}.tgz"`. After `npm run release`, run their standard commands (`npm run start`, `react-scripts start`, `ng serve`, `npm run dev` for Vue) to verify integrations.
- `demo/package.json` orchestrates all framework demos—use `npm run demo` from root or `npm start --prefix demo` to run all simultaneously.
- `apt-viewer.html` loads `dist/custom-elements.json` with `<api-viewer>` for quick documentation previews; ensure the manifest is fresh before opening it.
- The React wrapper exposes properties as props and custom events as camel-cased handlers (`onVgClick`). Angular uses `CUSTOM_ELEMENTS_SCHEMA` and template bindings; Vue relies on the generated plugin to register elements globally.

## Conventions & guardrails
- Do not hand-edit `dist/`, `types/`, or `vg-{version}.tgz`; always rebuild through the scripts above so manifests, wrappers, and metadata stay aligned.
- Follow the folder-per-component pattern and keep filenames lowercase-kebab for custom element tags (`vg-button`, `vg-theme-provider`).
- Favor property-driven APIs (boolean, string, union types) exposed via decorators so the generated manifest stays accurate.
- Mkcert support in `vite.config.ts` is commented out to avoid sudo; leave it disabled unless HTTPS is explicitly required.
