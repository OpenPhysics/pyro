# Pyro - VPython Browser Editor

A modern single-page web application for writing and running VPython code directly in the browser with 3D visualization.

## Features

- **CodeMirror 6 Editor** - Python syntax highlighting, autocomplete for VPython objects/functions, One Dark theme
- **GlowScript VPython 3.2** - Browser-based VPython implementation for 3D graphics
- **Live Execution** - Run your VPython code and see results immediately in a sandboxed iframe
- **Output & Instructions Tabs** - Switch between simulation output and markdown instructions for each example
- **Dynamic Examples** - Examples loaded from `src/examples/`; each has a `.py` file and matching `.md` instructions
- **Collapsible Sidebar** - Run, stop, save, load, reset, console, fullscreen, font size, and theme controls
- **View Modes** - Switch between code-only, split (half/half), and output-only views via the top bar
- **Font Size Controls** - Increase or decrease editor font size from the sidebar
- **Dark / Projector Themes** - Dark mode (default) and a light projector mode for presentations (WCAG-compliant)
- **Console Panel** - Toggleable console output for `print()` statements
- **Keyboard Shortcuts** - `Ctrl+Enter` / `Cmd+Enter` to run, `Ctrl+S` / `Cmd+S` to save, `?` for shortcuts
- **Local Storage** - Code is saved to and loaded from the browser's local storage
- **Resizable Panels** - Drag the gutter between editor and output to resize
- **Responsive Layout** - Works on desktop and tablet devices

## Usage

1. Write VPython code in the editor panel (or load an example from the dropdown)
2. Click **Run** in the sidebar (or press `Ctrl+Enter`) to execute
3. View the 3D visualization in the **Output** tab, or read **Instructions** for the current example
4. Use the **view mode buttons** in the top bar to toggle between code-only, split, and output-only views
5. Adjust editor font size with the **A+** / **A-** buttons in the sidebar
6. Toggle the **Console** to see `print()` output
7. Switch between **Dark Mode** and **Projector Mode** for different environments

### URL Parameters

- `?showInstructions=false` - Start with the Output tab selected instead of Instructions

## Example Code

```python
from vpython import *

# Create a simple scene
sphere(pos=vector(0, 0, 0), radius=1, color=color.red)
box(pos=vector(3, 0, 0), size=vector(1, 1, 1), color=color.blue)

# Animation example
ball = sphere(pos=vector(-5, 0, 0), radius=0.5, color=color.green, make_trail=True)
ball.velocity = vector(1, 0, 0)

while True:
    rate(60)
    ball.pos = ball.pos + ball.velocity * 0.05
    if abs(ball.pos.x) > 5:
        ball.velocity.x = -ball.velocity.x
```

## Adding Examples

Examples live in `src/examples/`. Each example needs:

- `example-name.py` - The VPython source code
- `example-name.md` - Markdown instructions (shown in the Instructions tab)

Add a new pair of files to include it in the examples dropdown automatically.

## Local Development

```bash
npm install
npm run dev
```

Then open `http://localhost:8080` in your browser.

To build for production:

```bash
npm run build
```

Output will be in the `dist/` directory.

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Lint and format check (Biome)
- `npm run lint:fix` - Auto-fix lint and format issues

## Deployment

This is a static site suitable for GitHub Pages. The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) for automatic deployment:

1. Fork and push to the main branch
2. GitHub Actions builds and deploys to GitHub Pages
3. Access via `https://<username>.github.io/pyro/`

## Technical Stack

- **Language**: TypeScript 5.9
- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **Editor**: [CodeMirror 6](https://codemirror.net/) with Python language support and custom VPython autocomplete
- **Runtime**: [GlowScript VPython 3.2](https://www.glowscript.org/)
- **Linting & Formatting**: [Biome](https://biomejs.dev/)
- **Markdown**: [marked](https://marked.js.org/) for rendering instructions
- **Styling**: Custom CSS (no framework)

## File Structure

```
/
├── index.html              # Main HTML file
├── package.json            # Dependencies & scripts
├── biome.json              # Biome lint/format configuration
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
├── src/
│   ├── main.ts             # App bootstrap & event handling
│   ├── editor.ts           # CodeMirror initialization & font size control
│   ├── sidebar.ts          # Sidebar UI component (buttons, icons, theme toggle)
│   ├── ui.ts               # UI utilities (notifications, console, errors)
│   ├── executor.ts         # Code execution in sandboxed iframe
│   ├── resizable.ts        # Panel resize handling
│   ├── completions.ts      # VPython autocomplete definitions
│   ├── examples.ts         # Loads examples from src/examples/
│   ├── examples/           # Example .py and .md files (one pair per example)
│   ├── snippets.ts         # Local storage snippets logic
│   ├── snippetsDialog.ts   # Save/load snippets UI
│   ├── types.ts            # TypeScript type definitions
│   └── styles/
│       └── main.css        # Application stylesheet
└── .github/
    └── workflows/
        └── deploy.yml      # GitHub Pages deployment
```

## Browser Support

Works in modern browsers with WebGL support:

- Chrome / Edge (recommended)
- Firefox
- Safari

## License

MIT License
