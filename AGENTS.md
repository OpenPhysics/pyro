# Pyro — Codebase Guide for LLM Agents

This document helps AI agents understand the Pyro codebase structure, architecture, and conventions.

## Project Overview

**Pyro** is a browser-based VPython editor. Users write Python code in the browser; it runs in a sandboxed iframe using GlowScript VPython 3.2 and renders 3D visualizations. No backend — static SPA suitable for GitHub Pages.

- **Tech stack**: TypeScript 5.9, Vite 7, CodeMirror 6, GlowScript VPython 3.2
- **Entry point**: `index.html` → `src/main.ts`
- **Build**: `npm run dev` (port 8080), `npm run build` → `dist/`

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  index.html                                                      │
│  ├── #editor (CodeMirror container)                              │
│  ├── #output (iframe target for 3D viz)                          │
│  ├── #instructions-body (markdown instructions)                  │
│  └── Sidebar (dynamically created by sidebar.ts)                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  main.ts — Bootstrap & event wiring                              │
│  - Resolves DOM refs, mounts sidebar, initEditor, initResizable   │
│  - Wires Run/Stop/Reset, examples dropdown, tabs, view modes     │
│  - Global shortcuts: ? (help), Ctrl+B (sidebar), Ctrl+S (save)   │
└─────────────────────────────────────────────────────────────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
   editor.ts      executor.ts     examples.ts    sidebar.ts
   completions.ts   types.ts      resizable.ts   viewMode.ts
                    ui.ts        snippets*.ts   shortcutsDialog.ts
                                  theme.ts      icons.ts
```

---

## Module Responsibilities

| Module | Purpose |
|--------|---------|
| **main.ts** | App bootstrap, DOM refs, event handlers, Run/Stop/Reset, examples dropdown, Output/Instructions tabs, view mode buttons, global shortcuts |
| **editor.ts** | CodeMirror init, `getCode`/`setCode`, theme (dark/light), font size, Ctrl+Enter run keymap, VPython autocomplete |
| **executor.ts** | `runCode`, `stopExecution`, `executeInIframe` — builds srcdoc HTML, loads GlowScript from CDN, compiles VPython, runs in iframe, postMessage for errors and `print()` |
| **examples.ts** | Loads `src/examples/*.py` and `*.md` via Vite `import.meta.glob`, builds `EXAMPLES`, `EXAMPLE_KEYS`, `EXAMPLE_INSTRUCTIONS`, `DEFAULT_CODE` |
| **completions.ts** | VPython autocomplete: objects (sphere, box, …), functions (vector, rate, …), colors, scene props, Python keywords |
| **sidebar.ts** | Creates collapsible sidebar with Run, Stop, Snippets, Console, Reset, Full Screen, Font +/- , Shortcuts, Theme (Dark/Projector) |
| **viewMode.ts** | Toggles `code` / `split` / `output` layout via CSS classes on `main` |
| **resizable.ts** | Drag gutter to resize editor/output panels |
| **ui.ts** | `announce`, `showError`, `hideError`, `addConsoleLog`, `clearConsole`, `toggleConsole` |
| **snippets.ts** | Local storage for saved code snippets |
| **snippetsDialog.ts** | Save/Load snippets UI dialog |
| **shortcutsDialog.ts** | Keyboard shortcuts overlay (? key) |
| **theme.ts** | Dark vs Projector (light) mode, fullscreen |
| **types.ts** | `CompletionItem`, `ExamplesMap`, `IframeMessage`, `Snippet` |
| **icons.ts** | SVG icon strings for sidebar |

---

## Data Flow

### Run Code

1. User clicks Run or presses Ctrl+Enter.
2. `main.ts` → `handleRun()` → `runCode(getCode, outputDiv, callbacks)`.
3. `executor.ts`:
   - Stops any existing run, clears output, sets `#output` to "Initializing GlowScript...".
   - Builds iframe `srcdoc` with GlowScript CDN scripts and user code.
   - Prepends `GlowScript 3.2 VPython` header; strips existing GlowScript/Web VPython headers.
   - Injects `window.GS_print` that `postMessage`s to parent; replaces `print(` with `window.GS_print(` in compiled program.
   - Loads RScompiler, compiles with `glowscript_compile`, evals, runs `__main__()` if present.
4. `postMessage` handlers: `glowscript-error` → show error; `glowscript-ready` → done; `console-log` → append to console panel.

### Examples

- Examples live in `src/examples/` as pairs: `name.py` + `name.md`.
- `examples.ts` uses `import.meta.glob` to load them at build time.
- Display names: `basic-shapes` → "Basic Shapes".
- Selecting an example: `setCode(EXAMPLES[key])`, updates `instructions-body` with `EXAMPLE_INSTRUCTIONS[key]` (markdown → HTML via marked + DOMPurify).

### Code Persistence

- Editor content: `localStorage` key `vpython-editor-code` (read/write in `editor.ts`).
- Snippets: separate storage via `snippets.ts`; managed in `snippetsDialog.ts`.

---

## Key Implementation Details

### Executor iframe

- GlowScript scripts: `glow.3.2.min.js`, `RSrun.3.2.min.js`, `RScompiler.3.2.min.js` (loaded async).
- User code is compiled with `lang: 'vpython'`, `version: '3.2'`.
- `print()` is rewritten to `window.GS_print()` so output goes to parent console panel.
- Errors: `window.onerror` and try/catch both `postMessage` to parent.

### Editor

- CodeMirror: `basicSetup`, `python()`, `oneDark` (or empty for light), `history`, `autocompletion` with custom `vpythonCompletions`.
- `vpythonCompletions`: after `color.` → color options; after `scene.` → scene options; after other `.` → property completions; otherwise → `ALL_COMPLETIONS`.

### URL Parameters

- `?showInstructions=false` — Start with Output tab selected instead of Instructions.

---

## File Structure

```
/
├── index.html
├── package.json
├── biome.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.ts           # Bootstrap
│   ├── editor.ts         # CodeMirror
│   ├── executor.ts       # Run in iframe
│   ├── examples.ts       # Load examples
│   ├── completions.ts    # VPython autocomplete
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
│   ├── examples/         # .py + .md pairs
│   └── styles/
│       └── main.css
└── .github/workflows/deploy.yml
```

---

## Conventions

- **Linting**: Biome (`npm run check`, `npm run lint:fix`).
- **Examples**: Add `name.py` and `name.md` in `src/examples/`; they are picked up automatically.
- **No React/Vue**: Vanilla TS + DOM; sidebar and dialogs are built imperatively.
- **Accessibility**: ARIA labels, skip link, live regions for announcements.

---

## Common Tasks

| Task | Where to look |
|------|---------------|
| Add a new example | `src/examples/name.py` + `name.md` |
| Change VPython autocomplete | `src/completions.ts` |
| Change GlowScript version | `executor.ts` → `GS_VERSION` |
| Add sidebar button | `sidebar.ts` → `createSidebar`, add `navButton` |
| Add keyboard shortcut | `main.ts` → `handleShortcutsKeydown` |
| Modify run/stop behavior | `executor.ts` → `runCode`, `stopExecution` |
| Change default code | First example in `EXAMPLE_KEYS` (alphabetical) |
