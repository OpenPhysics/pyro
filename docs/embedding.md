# Embedding Pyro in iframes

Pyro can be embedded in external websites using iframes with configurable UI through URL query parameters. This allows you to create customized VPython experiences for tutorials, courses, or interactive demonstrations.

## Basic Embedding

```html
<iframe
  src="https://your-domain.com/pyro/"
  width="100%"
  height="600"
  frameborder="0"
  allow="fullscreen">
</iframe>
```

## Query Parameters

All parameters are optional. When not specified, default values are used.

| Parameter | Values | Default | Description |
|-----------|--------|---------|-------------|
| `header` | `true` / `false` | `true` | Show or hide the top navigation bar |
| `sidebar` | `true` / `false` | `true` | Show or hide the sidebar completely |
| `example` | example key | none | Load a specific example (e.g., `bouncing-ball`) |
| `view` | `code` / `split` / `output` | `split` | Set the initial view mode |
| `tab` | `output` / `instructions` | `instructions` | Set the active tab in the output panel |
| `console` | `true` / `false` | `false` | Show the console panel by default |
| `theme` | `dark` / `light` | `dark` | Set the color theme (`projector` is an alias for `light`) |
| `fontSize` | `10` - `28` | `14` | Set the editor font size in pixels |
| `run` | `true` / `false` | `false` | Auto-run the code when the page loads |

### Backward Compatibility

- `showInstructions=false` is supported and maps to `tab=output`

## Example Configurations

### Minimal Embed (Output Only)

Show just the 3D output with no UI chrome - perfect for displaying a simulation result:

```html
<iframe
  src="?header=false&sidebar=false&view=output&example=bouncing-ball&run=true"
  width="100%"
  height="400">
</iframe>
```

### Teaching Mode

Light theme with larger font for classroom projection:

```html
<iframe
  src="?theme=light&fontSize=18&example=basic-shapes"
  width="100%"
  height="600">
</iframe>
```

### Interactive Demo

Full interface with console visible and auto-run:

```html
<iframe
  src="?run=true&tab=output&console=true&example=projectile-motion"
  width="100%"
  height="700">
</iframe>
```

### Code-Only View

Show just the editor for code review or documentation:

```html
<iframe
  src="?header=false&sidebar=false&view=code&example=binary-star"
  width="100%"
  height="500">
</iframe>
```

### Read-Only Output with Instructions Hidden

Perfect for embedding a running simulation in a blog post:

```html
<iframe
  src="?sidebar=false&view=output&tab=output&run=true&example=spring-mass"
  width="100%"
  height="450">
</iframe>
```

## Available Examples

Examples are loaded from the `src/examples/` directory. Each example has a key derived from its filename (without the `.py` extension). Common examples include:

- `basic-shapes` - Introduction to VPython objects
- `bouncing-ball` - Simple animation with collision
- `projectile-motion` - Physics simulation
- `spring-mass` - Harmonic oscillator
- `binary-star` - Gravitational orbit simulation

To see all available examples, check the examples dropdown in the editor or browse the `src/examples/` directory.

## Security

All query parameters are sanitized to prevent XSS attacks:

- **Example keys** are validated against a whitelist of known examples
- **Enum values** (view, tab, theme) are validated against allowed values
- **Boolean values** only accept `true` or `false`
- **Numeric values** are parsed and clamped to valid ranges
- **Prototype pollution** is prevented by blocking dangerous object keys

Invalid parameter values are silently ignored and defaults are used instead.

## Responsive Considerations

When embedding, consider:

1. **Minimum width**: The editor works best at 400px or wider
2. **Minimum height**: 300px minimum; 500-700px recommended for split view
3. **Mobile**: On narrow screens, consider using `view=output` or `view=code` instead of split

## iframe Attributes

Recommended iframe attributes for best experience:

```html
<iframe
  src="..."
  width="100%"
  height="600"
  frameborder="0"
  allow="fullscreen"
  loading="lazy"
  title="VPython Simulation">
</iframe>
```

- `allow="fullscreen"` - Enables the fullscreen button to work
- `loading="lazy"` - Defers loading until the iframe is near the viewport
- `title="..."` - Improves accessibility with a descriptive title
