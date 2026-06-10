# CLAUDE.md — Pyro

AI assistant guide for the Pyro codebase. Not a SceneryStack sim — see project-specific architecture below.

## Project overview

**Pyro** is a browser-based VPython editor. Users write Python in the browser; it runs in a sandboxed iframe using GlowScript VPython 3.2 and renders 3D visualizations. No backend — static SPA suitable for GitHub Pages.

- **Tech stack**: TypeScript 6.0, Vite 8, CodeMirror 6, GlowScript VPython 3.2, KaTeX
- **Entry point**: `index.html` → `src/main.ts` → `src/init.ts`
- **Build**: `npm run dev` (port 8080), `npm run build` → `dist/`

## Architecture

```
index.html → main.ts → init.ts
              ├── handlers.ts (run, stop, download, reset, examples)
              ├── editor.ts + completions.ts (CodeMirror + VPython autocomplete)
              ├── executor.ts (GlowScript iframe execution)
              ├── sidebar.ts, viewMode.ts, resizable.ts, ui.ts
              └── services/storage.ts, utils/safeCall.ts
```

## Module responsibilities

| Module | Purpose |
|---|---|
| `main.ts` | Bootstrap: imports CSS, calls `init()` |
| `init.ts` | DOM setup, sidebar, editor, event wiring, query params |
| `handlers.ts` | Run/stop/download/reset/example/console handlers |
| `config.ts` | Centralized constants (storage keys, fonts, timeouts) |
| `dom.ts` | Lazy DOM element references |
| `events.ts` | Type-safe event bus |
| `editor.ts` | CodeMirror, theme, font size, Ctrl+Enter run, autocomplete |
| `executor.ts` | `runCode` / `stopExecution` — GlowScript iframe, postMessage errors |
| `markdown.ts` | Instructions: marked + KaTeX |
| `shortcuts.ts` | Global shortcuts (`?`, Ctrl+B, Ctrl+S, Escape) |
| `examples.ts` | Loads `src/examples/*.py` + `*.md` via `import.meta.glob` |
| `completions.ts` | VPython autocomplete (objects, colors, scene props) |
| `sidebar.ts` | Collapsible sidebar controls |
| `services/storage.ts` | localStorage for editor code and snippets |

## Data flow (run code)

1. Run or Ctrl+Enter → `handlers.handleRun` → `executor.runCode`
2. Executor builds iframe `srcdoc` with GlowScript CDN, compiles VPython 3.2, runs `__main__`
3. `print()` rewritten to `window.GS_print` → parent console via `postMessage`
4. Errors postMessage as `glowscript-error`

## URL query parameters

Parsed in `queryParams.ts`, applied in `init.ts`: `header`, `sidebar`, `example`, `view` (code/split/output), `tab`, `console`, `theme`, `fontSize`, `run`.

## Conventions

- **Linting**: Biome (`npm run check`, `npm run lint:fix`)
- **Line endings**: LF via `.gitattributes`
- **Examples**: Add `name.py` + `name.md` in `src/examples/` — picked up automatically
- **No React/Vue**: Vanilla TS + DOM
- **Configuration**: Magic numbers in `config.ts`; DOM access via `dom.ts` getters

## Common tasks

| Task | Where |
|---|---|
| Add example | `src/examples/name.py` + `name.md` |
| VPython autocomplete | `src/completions.ts` |
| GlowScript version | `src/config.ts` → `CONFIG.executor.glowscriptVersion` |
| Sidebar button | `src/sidebar.ts` |
| Keyboard shortcut | `src/shortcuts.ts` |
| Run/stop behavior | `src/executor.ts` |
| localStorage | `src/services/storage.ts` |

## Commands

```bash
npm run dev       # dev server (port 8080)
npm run build     # production build
npm run check     # biome check
npm run lint:fix  # biome check --write
```

See `README.md` and `docs/embedding.md` for user-facing documentation.
