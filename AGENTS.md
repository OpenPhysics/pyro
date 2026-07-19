# CLAUDE.md — Pyro

Pyro-specific context for AI assistants. **Pyro is not a SceneryStack simulation** — it is a standalone Vite SPA with vanilla TypeScript and DOM APIs. Do not apply SceneryStack patterns (joist `Sim`/`Screen`, `Property`, model/view folders, fleet Vitest layout, `*Colors.ts` / `*Constants.ts` sim conventions, etc.) here unless explicitly porting code from a sim.

## Project

Browser-based VPython editor and runner. Users write Python in CodeMirror; code executes in a sandboxed iframe via GlowScript VPython 3.2 and renders interactive 3D graphics. Static site with no backend — suitable for GitHub Pages embedding.

| | |
|---|---|
| **Runtime** | GlowScript VPython 3.2 (CDN, iframe `srcdoc`) |
| **Editor** | CodeMirror 6 + custom VPython autocomplete, Ruff WASM lint gutter |
| **Build** | Vite 8, TypeScript 7 (strict), Biome 2 |
| **Storage** | `localStorage` for editor code and user snippets |
| **Entry** | `index.html` → `src/main.ts` → `src/init.ts` |
| **Deploy** | `dist/` via `.github/workflows/deploy.yml` |

Requires Node ≥ 22.12 and npm ≥ 10 (`package.json` `engines`).

## Key files

| File | Purpose |
|---|---|
| `index.html` | Shell markup; sidebar is injected at runtime |
| `src/main.ts` | Bootstrap: CSS imports, `init()` on DOM ready |
| `src/init.ts` | DOM wiring, sidebar, editor, resizers, query-param application |
| `src/handlers.ts` | Run/stop/download/reset/example/console/theme/font handlers |
| `src/config.ts` | Central constants (storage keys, font bounds, executor timeouts, GlowScript version) |
| `src/dom.ts` | Lazy DOM element getters |
| `src/state.ts` | Small mutable runtime flags (`isRunning`, font size, sidebar, fullscreen) |
| `src/events.ts` | Typed event bus for decoupled module communication |
| `src/editor.ts` | CodeMirror setup, theme/font compartments, Ctrl+Enter run, completions |
| `src/completions.ts` | VPython object/color/scene autocomplete definitions |
| `src/snippets-completions.ts` | Python keyword snippet expansions merged into autocomplete |
| `src/linter.ts` | Ruff WASM lint gutter; VPython-aware suppressions for star imports |
| `src/tooltips.ts` | Hover docs for VPython completion items |
| `src/executor.ts` | `runCode` / `stopExecution` — builds GlowScript iframe, `postMessage` bridge |
| `src/examples.ts` | Loads `src/examples/*.{py,md}` via `import.meta.glob` |
| `src/examples/` | Example `.py` + matching `.md` instruction pairs |
| `src/markdown.ts` | Instructions tab: marked + DOMPurify + KaTeX |
| `src/queryParams.ts` | URL query parsing/validation for embed mode |
| `src/viewMode.ts` | Code / split / output layout modes |
| `src/resizable.ts` | Draggable gutter between editor and output panels |
| `src/sidebar.ts` | Collapsible sidebar controls (created dynamically) |
| `src/ui.ts` | Notifications, console output, error display, screen-reader announcements |
| `src/theme.ts` | Dark vs projector (light) CSS theme switching |
| `src/shortcuts.ts` | Global keyboard shortcuts |
| `src/shortcutsDialog.ts` | `?` keyboard-help dialog content |
| `src/snippets.ts` | Snippet CRUD business logic |
| `src/snippetsDialog.ts` | Save/load snippets UI |
| `src/confirmDialog.ts` | Reusable confirmation modal |
| `src/icons.ts` | Inline SVG icon strings for sidebar/buttons |
| `src/types.ts` | Shared TypeScript types (execution callbacks, iframe messages) |
| `src/services/storage.ts` | `localStorage` read/write for editor code and snippets |
| `src/utils/safeCall.ts` | Error-boundary wrapper for handler calls |
| `src/styles/main.css` | Application stylesheet (no CSS framework) |
| `vite.config.ts` | Port 8080 dev server; excludes Ruff WASM from prebundle |
| `docs/embedding.md` | iframe embedding guide (user-facing) |

## Architecture

Vanilla TypeScript modules — no React/Vue. Handlers call services directly; cross-cutting UI updates also go through the typed `events` bus where modules must stay decoupled.

```
index.html
  └── main.ts
        └── init.ts
              ├── queryParams.ts  → apply embed/layout/theme defaults
              ├── sidebar.ts      → dynamic control rail
              ├── editor.ts       → CodeMirror + linter + completions
              ├── handlers.ts     → user actions
              ├── executor.ts     → GlowScript iframe lifecycle
              ├── viewMode.ts / resizable.ts / theme.ts / ui.ts
              └── services/storage.ts
```

**Run-code path**

1. Run button or Ctrl/Cmd+Enter → `handlers.handleRun` → `executor.runCode`.
2. Executor removes any prior iframe, builds `srcdoc` HTML loading GlowScript from CDN, compiles VPython 3.2, runs `__main__`.
3. `print()` is rewritten to `window.GS_print`; parent receives console lines via `postMessage`.
4. Runtime errors arrive as `glowscript-error` messages and surface in the UI console/error panel.
5. Stop removes the iframe and clears `appState.isRunning`.

**Examples**

- Drop `name.py` and `name.md` into `src/examples/` — Vite glob picks them up for the dropdown and Instructions tab.
- Example keys are basename paths (supports subfolders); `queryParams` whitelists against loaded keys.

**Embed URL parameters** (parsed in `queryParams.ts`, applied in `init.ts`)

| Param | Values | Default |
|---|---|---|
| `header` | `true` / `false` | `true` |
| `sidebar` | `true` / `false` | `true` |
| `example` | example key | none |
| `view` | `code` / `split` / `output` | `split` |
| `tab` | `output` / `instructions` | `instructions` |
| `console` | `true` / `false` | `false` |
| `theme` | `dark` / `light` (`projector` → `light`) | `dark` |
| `fontSize` | 10–28 | 14 |
| `run` | `true` / `false` | `false` |

## Testing

There is **no** `tests/` directory, Vitest config, or Playwright fuzz suite in this repo.

| Check | Command | What it covers |
|---|---|---|
| Lint + format | `npm run check` | Biome across the repo |
| Typecheck + build | `npm run build` | `tsc --noEmit`, then Vite production bundle |
| Preview prod build | `npm run preview` | Serve `dist/` locally |

CI (`.github/workflows/ci.yml`) delegates to the OpenPhysics Baton fleet workflow — effectively the same lint/typecheck/build gates, not a unit-test matrix.

**Manual verification** (required for behavior changes): run `npm run dev`, exercise run/stop, examples, snippets, console, view modes, themes, resize gutter, and embed query params. GlowScript runs only in a real browser with WebGL.

When adding automated tests in the future, keep them under a root `tests/` folder (Pyro convention if/when added) — do not assume SceneryStack's `tests/setup.ts` + joist `init()` harness applies here.

## Commands

```bash
npm install          # install dependencies (runs husky prepare)
npm run dev          # Vite dev server at http://localhost:8080
npm run build        # tsc --noEmit && vite build → dist/
npm run preview      # preview production build
npm run check        # biome check .
npm run format       # biome format --write .
npm run lint         # biome check . (alias)
npm run lint:fix     # biome check --write .
```

User-facing docs: `README.md`, `docs/embedding.md`.

## Development notes / gotchas

**Conventions**

- Put magic numbers and storage keys in `config.ts`; query DOM through `dom.ts` getters, not scattered `getElementById`.
- Line endings are LF (`.gitattributes`). Pre-commit runs Biome via lint-staged.
- Strict TypeScript (`tsconfig.json`): unused locals/params, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, etc. — run `npm run build` to catch type errors Biome does not see.

**VPython / GlowScript**

- GlowScript version lives at `CONFIG.executor.glowscriptVersion` in `config.ts`; iframe HTML is assembled in `executor.ts`.
- Autocomplete and linting know about VPython globals from star imports (`from vpython import *`). Ruff ignores F403/F405 globally; F821 is selectively suppressed for known VPython names in `linter.ts`.
- Execution timeout and iframe polling limits are in `CONFIG.executor` — long-running loops need `rate()` or they block until timeout.

**Editor**

- VPython completions: `completions.ts`. Python keyword tab-stop snippets: `snippets-completions.ts`.
- Ruff WASM loads lazily on first lint; Vite excludes `@astral-sh/ruff-wasm-web` from `optimizeDeps` — if lint fails to init, check network and browser WASM support.
- `rainbowbrackets` has a local `rainbowbrackets.d.ts` shim (no upstream types).

**UI / a11y**

- Sidebar nodes are created in JS (`sidebar.ts`), not declared in `index.html`.
- Screen-reader announcements go through `ui.announce` → `#sr-announcements` live region.
- Projector mode is the light theme (`theme=light`); dark mode uses One Dark for the editor compartment.

**Common tasks**

| Task | Where |
|---|---|
| Add example | `src/examples/name.py` + `name.md` |
| Change autocomplete | `src/completions.ts`, `src/tooltips.ts` |
| Python lint rules | `src/linter.ts` (`LINT_RULES`, `IGNORED_RULES`) |
| Sidebar control | `src/sidebar.ts` + handler in `handlers.ts` |
| Keyboard shortcut | `src/shortcuts.ts` / `shortcutsDialog.ts` |
| Persisted data | `src/services/storage.ts` |
| Embed behavior | `src/queryParams.ts`, `docs/embedding.md` |

**Not applicable here**

- SceneryStack screen/model/view split, `TModel`, `Property`, joist preferences, PhET-iO, sim rename scripts, or fleet memory-leak fuzz tests.
- Server-side Python — all execution is client-side inside the GlowScript iframe sandbox.
