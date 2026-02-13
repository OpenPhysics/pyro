# Pyro — Codebase Guide for LLM Agents

This document helps AI agents understand the Pyro codebase structure, architecture, and conventions.

## Project Overview

**Pyro** is a browser-based VPython editor. Users write Python code in the browser; it runs in a sandboxed iframe using GlowScript VPython 3.2 and renders 3D visualizations. No backend — static SPA suitable for GitHub Pages.

- **Tech stack**: TypeScript 5.9, Vite 7, CodeMirror 6, GlowScript VPython 3.2, KaTeX
- **Entry point**: `index.html` → `src/main.ts` → `src/init.ts`
- **Build**: `npm run dev` (port 8080), `npm run build` → `dist/`

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  index.html                                                      │
│  ├── #editor (CodeMirror container)                              │
│  ├── #output (iframe target for 3D viz)                          │
│  ├── #instructions-body (markdown instructions)                  │
│  └── Sidebar (dynamically created by sidebar.ts)                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  main.ts — Minimal bootstrap (imports CSS, calls init)           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  init.ts — Initialization sequence                               │
│  - Resolves DOM refs via dom.ts                                  │
│  - Mounts sidebar, initEditor, initResizable                     │
│  - Wires event handlers from handlers.ts                         │
│  - Applies URL query parameters                                  │
│  - Sets up global shortcuts via shortcuts.ts                     │
└─────────────────────────────────────────────────────────────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
   handlers.ts    editor.ts      executor.ts    sidebar.ts
   (run, stop,    completions.ts   types.ts    viewMode.ts
    download,       dom.ts        ui.ts       theme.ts
    reset, etc.)   config.ts    markdown.ts   icons.ts
                   events.ts    shortcuts.ts  snippets*.ts
                              services/storage.ts
                              utils/safeCall.ts
```

---

## Module Responsibilities

### Core Modules

| Module | Purpose |
|--------|---------|
| **main.ts** | Minimal bootstrap: imports CSS, calls `init()` |
| **init.ts** | Initialization: DOM setup, sidebar mount, editor init, event wiring, query params |
| **handlers.ts** | Event handlers: `handleRun`, `handleStop`, `handleDownload`, `handleReset`, `handleExample`, `handleToggleConsole`, `updateRunState`, `setOutputTab`, `updateInstructionsDisplay` |
| **config.ts** | Centralized constants: storage keys, font sizes, timeouts, UI values |
| **dom.ts** | Lazy DOM element references via getters, `getElement`/`getElementOrThrow` utilities |
| **events.ts** | Type-safe event bus for decoupled communication between modules |

### Feature Modules

| Module | Purpose |
|--------|---------|
| **editor.ts** | CodeMirror init, `getCode`/`setCode`, theme (dark/light), font size, Ctrl+Enter run keymap, VPython autocomplete |
| **executor.ts** | `runCode`, `stopExecution`, `executeInIframe` — builds srcdoc HTML, loads GlowScript from CDN, compiles VPython, runs in iframe, postMessage for errors and `print()` |
| **markdown.ts** | `renderMarkdownWithMath` — marked + KaTeX for instructions with LaTeX support |
| **shortcuts.ts** | Global keyboard shortcuts: `?` (help), `Ctrl+B` (sidebar), `Ctrl+S` (snippets), `Escape` (close dialogs) |
| **examples.ts** | Loads `src/examples/*.py` and `*.md` via Vite `import.meta.glob`, builds `EXAMPLES`, `EXAMPLE_KEYS`, `EXAMPLE_INSTRUCTIONS`, `DEFAULT_CODE` |
| **completions.ts** | VPython autocomplete: objects (sphere, box, …), functions (vector, rate, …), colors, scene props, Python keywords |

### UI Modules

| Module | Purpose |
|--------|---------|
| **sidebar.ts** | Creates collapsible sidebar with Run, Stop, Snippets, Console, Reset, Full Screen, Font +/- , Shortcuts, Theme (Dark/Projector) |
| **viewMode.ts** | Toggles `code` / `split` / `output` layout via CSS classes on `main` |
| **resizable.ts** | Drag gutter to resize editor/output panels |
| **ui.ts** | `announce`, `showError`, `hideError`, `addConsoleLog`, `clearConsole`, `toggleConsole`, `showNotification` |
| **snippets.ts** | Business logic for saved code snippets |
| **snippetsDialog.ts** | Save/Load snippets UI dialog |
| **shortcutsDialog.ts** | Keyboard shortcuts overlay (? key) |
| **theme.ts** | Dark vs Projector (light) mode, fullscreen toggle |
| **icons.ts** | SVG icon strings for sidebar |

### Services & Utilities

| Module | Purpose |
|--------|---------|
| **services/storage.ts** | Unified localStorage operations: `getEditorCode`, `setEditorCode`, `getSnippets`, `setSnippets` |
| **utils/safeCall.ts** | Error boundaries: `safeCall`, `safeCallAsync`, `safeFn` for wrapping functions |

### Types

| Module | Purpose |
|--------|---------|
| **types.ts** | `CompletionItem`, `ExamplesMap`, `IframeMessage`, `Snippet`, `SidebarCallbacks`, `ExecutionCallbacks`, `IframeCallbacks`, `SnippetsDialogCallbacks` |
| **queryParams.ts** | URL query parameter parsing & validation with typed `QueryParams` interface |
| **state.ts** | Centralized app state: `isRunning`, `currentFontSize`, `isFullScreen`, `isSidebarCollapsed` |

---

## Data Flow

### Run Code

1. User clicks Run or presses Ctrl+Enter.
2. `init.ts` wired `handleRun` from `handlers.ts` to sidebar and editor.
3. `handlers.ts` → `handleRun()` → `runCode(getCode, dom.output, callbacks)`.
4. `executor.ts`:
   - Stops any existing run, clears output, sets `#output` to "Initializing GlowScript...".
   - Builds iframe `srcdoc` with GlowScript CDN scripts and user code.
   - Prepends `GlowScript 3.2 VPython` header; strips existing GlowScript/Web VPython headers.
   - Injects `window.GS_print` that `postMessage`s to parent; replaces `print(` with `window.GS_print(` in compiled program.
   - Loads RScompiler, compiles with `glowscript_compile`, evals, runs `__main__()` if present.
5. `postMessage` handlers: `glowscript-error` → show error; `glowscript-ready` → done; `console-log` → append to console panel.

### Examples

- Examples live in `src/examples/` as pairs: `name.py` + `name.md`.
- `examples.ts` uses `import.meta.glob` to load them at build time.
- Display names: `basic-shapes` → "Basic Shapes".
- Selecting an example: `handlers.ts` → `handleExample(key)` → `setCode(EXAMPLES[key])`, updates `instructions-body` with markdown → HTML via `markdown.ts` (marked + KaTeX + DOMPurify).

### Code Persistence

- Editor content: `localStorage` via `services/storage.ts` → key from `config.ts`.
- Snippets: separate storage via `snippets.ts` using `services/storage.ts`.

---

## Key Implementation Details

### Executor iframe

- GlowScript scripts: `glow.3.2.min.js`, `RSrun.3.2.min.js`, `RScompiler.3.2.min.js` (loaded async).
- Version and timeouts configured in `config.ts` → `CONFIG.executor`.
- User code is compiled with `lang: 'vpython'`, `version: '3.2'`.
- `print()` is rewritten to `window.GS_print()` so output goes to parent console panel.
- Errors: `window.onerror` and try/catch both `postMessage` to parent.

### Editor

- CodeMirror: `basicSetup`, `python()`, `oneDark` (or empty for light), `history`, `autocompletion` with custom `vpythonCompletions`.
- `vpythonCompletions`: after `color.` → color options; after `scene.` → scene options; after other `.` → property completions; otherwise → `ALL_COMPLETIONS`.
- Font size limits from `config.ts` → `CONFIG.editor`.

### URL Parameters

Parsed in `queryParams.ts`, applied in `init.ts`:

| Parameter | Values | Default |
|-----------|--------|---------|
| `header` | `true`/`false` | `true` |
| `sidebar` | `true`/`false` | `true` |
| `example` | example key | none |
| `view` | `code`/`split`/`output` | `split` |
| `tab` | `output`/`instructions` | `instructions` |
| `console` | `true`/`false` | `false` |
| `theme` | `dark`/`light` | `dark` |
| `fontSize` | `10-28` | `14` |
| `run` | `true`/`false` | `false` |

---

## File Structure

```
/
├── index.html
├── package.json
├── biome.json
├── tsconfig.json
├── vite.config.ts
├── .gitattributes
├── public/
│   └── favicon.svg
├── docs/
│   └── embedding.md
├── src/
│   ├── main.ts             # Bootstrap (imports + init call)
│   ├── init.ts             # Initialization sequence
│   ├── handlers.ts         # Event handlers
│   ├── config.ts           # Centralized constants
│   ├── dom.ts              # Lazy DOM references
│   ├── events.ts           # Type-safe event bus
│   ├── editor.ts           # CodeMirror
│   ├── executor.ts         # Run in iframe
│   ├── markdown.ts         # Markdown + KaTeX rendering
│   ├── shortcuts.ts        # Global keyboard shortcuts
│   ├── examples.ts         # Load examples
│   ├── completions.ts      # VPython autocomplete
│   ├── sidebar.ts
│   ├── viewMode.ts
│   ├── resizable.ts
│   ├── ui.ts
│   ├── snippets.ts
│   ├── snippetsDialog.ts
│   ├── shortcutsDialog.ts
│   ├── theme.ts
│   ├── icons.ts
│   ├── types.ts
│   ├── queryParams.ts
│   ├── state.ts
│   ├── services/
│   │   └── storage.ts      # localStorage operations
│   ├── utils/
│   │   └── safeCall.ts     # Error boundaries
│   ├── examples/           # .py + .md pairs
│   └── styles/
│       └── main.css
└── .github/workflows/deploy.yml
```

---

## Conventions

- **Linting**: Biome (`npm run check`, `npm run lint:fix`).
- **Line endings**: LF enforced via `.gitattributes`.
- **Examples**: Add `name.py` and `name.md` in `src/examples/`; they are picked up automatically.
- **No React/Vue**: Vanilla TS + DOM; sidebar and dialogs are built imperatively.
- **Accessibility**: ARIA labels, skip link, live regions for announcements.
- **Configuration**: All magic numbers in `config.ts`.
- **DOM access**: Use `dom.ts` getters for lazy, type-safe element references.

---

## Common Tasks

| Task | Where to look |
|------|---------------|
| Add a new example | `src/examples/name.py` + `name.md` |
| Change VPython autocomplete | `src/completions.ts` |
| Change GlowScript version | `src/config.ts` → `CONFIG.executor.glowscriptVersion` |
| Add sidebar button | `src/sidebar.ts` → `createSidebar`, add `navButton` |
| Add keyboard shortcut | `src/shortcuts.ts` → `handleShortcutsKeydown` |
| Add event handler | `src/handlers.ts`, wire in `src/init.ts` |
| Modify run/stop behavior | `src/executor.ts` → `runCode`, `stopExecution` |
| Change default code | First example in `EXAMPLE_KEYS` (alphabetical) |
| Add configuration constant | `src/config.ts` → `CONFIG` object |
| Add localStorage operation | `src/services/storage.ts` |
| Add DOM element reference | `src/dom.ts` → `dom` object |
