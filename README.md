# VPython Browser Editor

A minimal single-page web application for writing and running VPython code directly in the browser with 3D visualization.

## Features

- **CodeMirror 6 Editor** - Python syntax highlighting with the One Dark theme
- **GlowScript VPython** - Browser-based VPython implementation for 3D graphics
- **Live Execution** - Run your VPython code and see results immediately
- **Keyboard Shortcuts** - Press `Ctrl+Enter` (or `Cmd+Enter` on Mac) to run code
- **Responsive Layout** - Works on desktop and tablet devices

## Usage

1. Write VPython code in the editor panel on the left
2. Click the "Run" button (or press `Ctrl+Enter`) to execute
3. View the 3D visualization in the output panel on the right
4. Use "Clear" to reset the output

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

## Deployment

This is a static site suitable for GitHub Pages:

1. Push to a GitHub repository
2. Enable GitHub Pages in repository settings
3. Select the branch and root folder
4. Access via `https://username.github.io/repository-name/`

## Local Development

Simply open `index.html` in a modern web browser, or serve with a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx serve .
```

Then open `http://localhost:8000` in your browser.

## Technical Stack

- **Editor**: [CodeMirror 6](https://codemirror.net/) with Python language support
- **Runtime**: [GlowScript VPython](https://www.glowscript.org/)
- **Styling**: Custom CSS (no framework)

## File Structure

```
/
├── index.html      # Main HTML file
├── css/
│   └── style.css   # Application styles
├── js/
│   └── main.js     # CodeMirror and GlowScript integration
└── README.md       # This file
```

## Browser Support

Works in modern browsers with WebGL support:
- Chrome/Edge (recommended)
- Firefox
- Safari

## License

MIT License
