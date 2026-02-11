// CodeMirror imports
import { EditorView, basicSetup } from 'https://esm.sh/codemirror@6.0.1';
import { python } from 'https://esm.sh/@codemirror/lang-python@6.1.3';
import { oneDark } from 'https://esm.sh/@codemirror/theme-one-dark@6.1.2';
import { keymap } from 'https://esm.sh/@codemirror/view@6.22.0';
import { autocompletion, completeFromList, CompletionContext } from 'https://esm.sh/@codemirror/autocomplete@6.11.1';

// VPython completions data
const VPYTHON_OBJECTS = [
    { label: 'sphere', type: 'function', info: 'Create a sphere', detail: '(pos, radius, color, ...)' },
    { label: 'box', type: 'function', info: 'Create a box', detail: '(pos, size, color, ...)' },
    { label: 'cylinder', type: 'function', info: 'Create a cylinder', detail: '(pos, axis, radius, color, ...)' },
    { label: 'cone', type: 'function', info: 'Create a cone', detail: '(pos, axis, radius, color, ...)' },
    { label: 'arrow', type: 'function', info: 'Create an arrow', detail: '(pos, axis, color, ...)' },
    { label: 'helix', type: 'function', info: 'Create a helix/spring', detail: '(pos, axis, radius, coils, ...)' },
    { label: 'ring', type: 'function', info: 'Create a ring', detail: '(pos, axis, radius, thickness, ...)' },
    { label: 'pyramid', type: 'function', info: 'Create a pyramid', detail: '(pos, size, color, ...)' },
    { label: 'ellipsoid', type: 'function', info: 'Create an ellipsoid', detail: '(pos, size, color, ...)' },
    { label: 'curve', type: 'function', info: 'Create a curve', detail: '(pos, color, ...)' },
    { label: 'points', type: 'function', info: 'Create points', detail: '(pos, color, ...)' },
    { label: 'label', type: 'function', info: 'Create a text label', detail: '(pos, text, ...)' },
    { label: 'text', type: 'function', info: 'Create 3D text', detail: '(text, pos, color, ...)' },
    { label: 'compound', type: 'function', info: 'Combine objects', detail: '(objects)' },
    { label: 'vertex', type: 'function', info: 'Create a vertex', detail: '(pos, normal, color, ...)' },
    { label: 'triangle', type: 'function', info: 'Create a triangle', detail: '(v0, v1, v2)' },
    { label: 'quad', type: 'function', info: 'Create a quad', detail: '(v0, v1, v2, v3)' },
    { label: 'extrusion', type: 'function', info: 'Create an extrusion', detail: '(path, shape, ...)' },
    { label: 'paths', type: 'class', info: 'Path utilities' },
    { label: 'shapes', type: 'class', info: 'Shape utilities' },
];

const VPYTHON_FUNCTIONS = [
    { label: 'vector', type: 'function', info: 'Create a 3D vector', detail: '(x, y, z)' },
    { label: 'vec', type: 'function', info: 'Create a 3D vector (alias)', detail: '(x, y, z)' },
    { label: 'rate', type: 'function', info: 'Control animation speed', detail: '(fps)' },
    { label: 'sleep', type: 'function', info: 'Pause execution', detail: '(seconds)' },
    { label: 'mag', type: 'function', info: 'Vector magnitude', detail: '(vector)' },
    { label: 'mag2', type: 'function', info: 'Vector magnitude squared', detail: '(vector)' },
    { label: 'norm', type: 'function', info: 'Normalized vector', detail: '(vector)' },
    { label: 'hat', type: 'function', info: 'Unit vector (alias)', detail: '(vector)' },
    { label: 'cross', type: 'function', info: 'Cross product', detail: '(v1, v2)' },
    { label: 'dot', type: 'function', info: 'Dot product', detail: '(v1, v2)' },
    { label: 'diff_angle', type: 'function', info: 'Angle between vectors', detail: '(v1, v2)' },
    { label: 'rotate', type: 'function', info: 'Rotate a vector', detail: '(vector, angle, axis)' },
    { label: 'adj_color', type: 'function', info: 'Adjust color brightness', detail: '(color, factor)' },
    { label: 'color_to_rgb', type: 'function', info: 'Convert color to RGB', detail: '(color)' },
    { label: 'rgb_to_color', type: 'function', info: 'Convert RGB to color', detail: '(r, g, b)' },
    { label: 'arange', type: 'function', info: 'Create range array', detail: '(start, stop, step)' },
    { label: 'linspace', type: 'function', info: 'Create linear space', detail: '(start, stop, num)' },
    { label: 'gcurve', type: 'function', info: 'Graph curve', detail: '(color, ...)' },
    { label: 'gdots', type: 'function', info: 'Graph dots', detail: '(color, ...)' },
    { label: 'gvbars', type: 'function', info: 'Graph vertical bars', detail: '(color, ...)' },
    { label: 'ghbars', type: 'function', info: 'Graph horizontal bars', detail: '(color, ...)' },
    { label: 'graph', type: 'function', info: 'Create a graph', detail: '(title, xtitle, ytitle, ...)' },
    { label: 'attach_trail', type: 'function', info: 'Attach trail to object', detail: '(obj, ...)' },
    { label: 'attach_arrow', type: 'function', info: 'Attach arrow to object', detail: '(obj, attr, ...)' },
    { label: 'attach_light', type: 'function', info: 'Attach light to object', detail: '(obj, ...)' },
];

const VPYTHON_MATH = [
    { label: 'sin', type: 'function', info: 'Sine', detail: '(x)' },
    { label: 'cos', type: 'function', info: 'Cosine', detail: '(x)' },
    { label: 'tan', type: 'function', info: 'Tangent', detail: '(x)' },
    { label: 'asin', type: 'function', info: 'Arc sine', detail: '(x)' },
    { label: 'acos', type: 'function', info: 'Arc cosine', detail: '(x)' },
    { label: 'atan', type: 'function', info: 'Arc tangent', detail: '(x)' },
    { label: 'atan2', type: 'function', info: 'Arc tangent of y/x', detail: '(y, x)' },
    { label: 'sqrt', type: 'function', info: 'Square root', detail: '(x)' },
    { label: 'exp', type: 'function', info: 'Exponential', detail: '(x)' },
    { label: 'log', type: 'function', info: 'Natural logarithm', detail: '(x)' },
    { label: 'log10', type: 'function', info: 'Base-10 logarithm', detail: '(x)' },
    { label: 'pow', type: 'function', info: 'Power', detail: '(x, y)' },
    { label: 'abs', type: 'function', info: 'Absolute value', detail: '(x)' },
    { label: 'ceil', type: 'function', info: 'Ceiling', detail: '(x)' },
    { label: 'floor', type: 'function', info: 'Floor', detail: '(x)' },
    { label: 'round', type: 'function', info: 'Round', detail: '(x, digits)' },
    { label: 'max', type: 'function', info: 'Maximum', detail: '(...)' },
    { label: 'min', type: 'function', info: 'Minimum', detail: '(...)' },
    { label: 'radians', type: 'function', info: 'Degrees to radians', detail: '(deg)' },
    { label: 'degrees', type: 'function', info: 'Radians to degrees', detail: '(rad)' },
    { label: 'pi', type: 'constant', info: 'Pi (3.14159...)' },
    { label: 'random', type: 'function', info: 'Random number 0-1', detail: '()' },
];

const VPYTHON_COLORS = [
    { label: 'color.red', type: 'constant', info: 'Red color' },
    { label: 'color.green', type: 'constant', info: 'Green color' },
    { label: 'color.blue', type: 'constant', info: 'Blue color' },
    { label: 'color.yellow', type: 'constant', info: 'Yellow color' },
    { label: 'color.orange', type: 'constant', info: 'Orange color' },
    { label: 'color.cyan', type: 'constant', info: 'Cyan color' },
    { label: 'color.magenta', type: 'constant', info: 'Magenta color' },
    { label: 'color.purple', type: 'constant', info: 'Purple color' },
    { label: 'color.white', type: 'constant', info: 'White color' },
    { label: 'color.black', type: 'constant', info: 'Black color' },
    { label: 'color.gray', type: 'function', info: 'Gray color', detail: '(brightness)' },
    { label: 'color.hsv_to_rgb', type: 'function', info: 'HSV to RGB', detail: '(hsv)' },
    { label: 'color.rgb_to_hsv', type: 'function', info: 'RGB to HSV', detail: '(rgb)' },
];

const VPYTHON_PROPERTIES = [
    { label: 'pos', type: 'property', info: 'Position vector' },
    { label: 'axis', type: 'property', info: 'Axis vector' },
    { label: 'up', type: 'property', info: 'Up vector' },
    { label: 'size', type: 'property', info: 'Size vector' },
    { label: 'color', type: 'property', info: 'Color' },
    { label: 'radius', type: 'property', info: 'Radius' },
    { label: 'length', type: 'property', info: 'Length' },
    { label: 'height', type: 'property', info: 'Height' },
    { label: 'width', type: 'property', info: 'Width' },
    { label: 'thickness', type: 'property', info: 'Thickness' },
    { label: 'opacity', type: 'property', info: 'Opacity (0-1)' },
    { label: 'shininess', type: 'property', info: 'Shininess' },
    { label: 'emissive', type: 'property', info: 'Emissive (glowing)' },
    { label: 'texture', type: 'property', info: 'Texture' },
    { label: 'visible', type: 'property', info: 'Visibility' },
    { label: 'make_trail', type: 'property', info: 'Enable trail' },
    { label: 'trail_type', type: 'property', info: 'Trail type' },
    { label: 'trail_color', type: 'property', info: 'Trail color' },
    { label: 'trail_radius', type: 'property', info: 'Trail radius' },
    { label: 'retain', type: 'property', info: 'Trail points to retain' },
    { label: 'interval', type: 'property', info: 'Trail interval' },
    { label: 'velocity', type: 'property', info: 'Velocity (custom attr)' },
    { label: 'momentum', type: 'property', info: 'Momentum (custom attr)' },
    { label: 'mass', type: 'property', info: 'Mass (custom attr)' },
];

const VPYTHON_SCENE = [
    { label: 'scene', type: 'variable', info: 'The default scene/canvas' },
    { label: 'scene.background', type: 'property', info: 'Background color' },
    { label: 'scene.center', type: 'property', info: 'Camera center' },
    { label: 'scene.forward', type: 'property', info: 'Camera forward direction' },
    { label: 'scene.up', type: 'property', info: 'Camera up direction' },
    { label: 'scene.range', type: 'property', info: 'Camera distance' },
    { label: 'scene.fov', type: 'property', info: 'Field of view' },
    { label: 'scene.lights', type: 'property', info: 'Scene lights' },
    { label: 'scene.ambient', type: 'property', info: 'Ambient light color' },
    { label: 'scene.width', type: 'property', info: 'Canvas width' },
    { label: 'scene.height', type: 'property', info: 'Canvas height' },
    { label: 'scene.title', type: 'property', info: 'Scene title' },
    { label: 'scene.caption', type: 'property', info: 'Scene caption' },
    { label: 'scene.autoscale', type: 'property', info: 'Auto-scale camera' },
    { label: 'scene.userzoom', type: 'property', info: 'Allow user zoom' },
    { label: 'scene.userspin', type: 'property', info: 'Allow user spin' },
    { label: 'scene.userpan', type: 'property', info: 'Allow user pan' },
    { label: 'scene.bind', type: 'function', info: 'Bind event handler', detail: '(event, function)' },
    { label: 'scene.unbind', type: 'function', info: 'Unbind event handler', detail: '(event, function)' },
    { label: 'scene.waitfor', type: 'function', info: 'Wait for event', detail: '(event)' },
    { label: 'scene.pause', type: 'function', info: 'Pause for click', detail: '(prompt)' },
    { label: 'scene.capture', type: 'function', info: 'Capture screenshot', detail: '(filename)' },
];

const VPYTHON_VECTORS = [
    { label: 'x', type: 'property', info: 'X component' },
    { label: 'y', type: 'property', info: 'Y component' },
    { label: 'z', type: 'property', info: 'Z component' },
    { label: 'mag', type: 'property', info: 'Magnitude' },
    { label: 'mag2', type: 'property', info: 'Magnitude squared' },
    { label: 'hat', type: 'property', info: 'Unit vector' },
    { label: 'norm', type: 'function', info: 'Normalize', detail: '()' },
    { label: 'dot', type: 'function', info: 'Dot product', detail: '(other)' },
    { label: 'cross', type: 'function', info: 'Cross product', detail: '(other)' },
    { label: 'proj', type: 'function', info: 'Projection', detail: '(other)' },
    { label: 'comp', type: 'function', info: 'Component', detail: '(other)' },
    { label: 'diff_angle', type: 'function', info: 'Angle to other', detail: '(other)' },
    { label: 'rotate', type: 'function', info: 'Rotate vector', detail: '(angle, axis)' },
];

const PYTHON_KEYWORDS = [
    { label: 'True', type: 'keyword' },
    { label: 'False', type: 'keyword' },
    { label: 'None', type: 'keyword' },
    { label: 'and', type: 'keyword' },
    { label: 'or', type: 'keyword' },
    { label: 'not', type: 'keyword' },
    { label: 'if', type: 'keyword' },
    { label: 'elif', type: 'keyword' },
    { label: 'else', type: 'keyword' },
    { label: 'for', type: 'keyword' },
    { label: 'while', type: 'keyword' },
    { label: 'break', type: 'keyword' },
    { label: 'continue', type: 'keyword' },
    { label: 'pass', type: 'keyword' },
    { label: 'return', type: 'keyword' },
    { label: 'def', type: 'keyword' },
    { label: 'class', type: 'keyword' },
    { label: 'import', type: 'keyword' },
    { label: 'from', type: 'keyword' },
    { label: 'as', type: 'keyword' },
    { label: 'try', type: 'keyword' },
    { label: 'except', type: 'keyword' },
    { label: 'finally', type: 'keyword' },
    { label: 'raise', type: 'keyword' },
    { label: 'with', type: 'keyword' },
    { label: 'lambda', type: 'keyword' },
    { label: 'yield', type: 'keyword' },
    { label: 'global', type: 'keyword' },
    { label: 'nonlocal', type: 'keyword' },
    { label: 'assert', type: 'keyword' },
    { label: 'del', type: 'keyword' },
    { label: 'in', type: 'keyword' },
    { label: 'is', type: 'keyword' },
    { label: 'print', type: 'function', info: 'Print to console', detail: '(...)' },
    { label: 'len', type: 'function', info: 'Length', detail: '(obj)' },
    { label: 'range', type: 'function', info: 'Range iterator', detail: '(start, stop, step)' },
    { label: 'list', type: 'function', info: 'Create list', detail: '(iterable)' },
    { label: 'dict', type: 'function', info: 'Create dictionary', detail: '(...)' },
    { label: 'tuple', type: 'function', info: 'Create tuple', detail: '(iterable)' },
    { label: 'set', type: 'function', info: 'Create set', detail: '(iterable)' },
    { label: 'str', type: 'function', info: 'Convert to string', detail: '(obj)' },
    { label: 'int', type: 'function', info: 'Convert to integer', detail: '(obj)' },
    { label: 'float', type: 'function', info: 'Convert to float', detail: '(obj)' },
    { label: 'bool', type: 'function', info: 'Convert to boolean', detail: '(obj)' },
    { label: 'type', type: 'function', info: 'Get type', detail: '(obj)' },
    { label: 'isinstance', type: 'function', info: 'Check instance', detail: '(obj, class)' },
    { label: 'enumerate', type: 'function', info: 'Enumerate iterator', detail: '(iterable)' },
    { label: 'zip', type: 'function', info: 'Zip iterables', detail: '(...)' },
    { label: 'map', type: 'function', info: 'Map function', detail: '(func, iterable)' },
    { label: 'filter', type: 'function', info: 'Filter iterable', detail: '(func, iterable)' },
    { label: 'sorted', type: 'function', info: 'Sort iterable', detail: '(iterable)' },
    { label: 'reversed', type: 'function', info: 'Reverse iterable', detail: '(iterable)' },
    { label: 'sum', type: 'function', info: 'Sum of iterable', detail: '(iterable)' },
    { label: 'any', type: 'function', info: 'Any true', detail: '(iterable)' },
    { label: 'all', type: 'function', info: 'All true', detail: '(iterable)' },
];

// Combine all completions
const ALL_COMPLETIONS = [
    ...VPYTHON_OBJECTS,
    ...VPYTHON_FUNCTIONS,
    ...VPYTHON_MATH,
    ...VPYTHON_COLORS,
    ...VPYTHON_SCENE,
    ...PYTHON_KEYWORDS,
];

// Property completions (after a dot)
const PROPERTY_COMPLETIONS = [
    ...VPYTHON_PROPERTIES,
    ...VPYTHON_VECTORS,
];

// Custom completion source for VPython
function vpythonCompletions(context) {
    // Check if we're completing after a dot
    const beforeCursor = context.matchBefore(/[\w.]+/);
    if (!beforeCursor) return null;

    const text = beforeCursor.text;
    const dotIndex = text.lastIndexOf('.');

    if (dotIndex >= 0) {
        // We're after a dot - suggest properties/methods
        const prefix = text.slice(dotIndex + 1);
        const objectPart = text.slice(0, dotIndex);

        // Check for color. completions
        if (objectPart === 'color' || objectPart.endsWith('.color')) {
            const colorOptions = VPYTHON_COLORS.filter(c => c.label.startsWith('color.'))
                .map(c => ({ ...c, label: c.label.replace('color.', '') }));
            return {
                from: beforeCursor.from + dotIndex + 1,
                options: colorOptions,
                validFor: /^[\w]*$/
            };
        }

        // Check for scene. completions
        if (objectPart === 'scene') {
            const sceneOptions = VPYTHON_SCENE.filter(s => s.label.startsWith('scene.'))
                .map(s => ({ ...s, label: s.label.replace('scene.', '') }));
            return {
                from: beforeCursor.from + dotIndex + 1,
                options: sceneOptions,
                validFor: /^[\w]*$/
            };
        }

        // General property completions
        return {
            from: beforeCursor.from + dotIndex + 1,
            options: PROPERTY_COMPLETIONS,
            validFor: /^[\w]*$/
        };
    }

    // Not after a dot - suggest all completions
    return {
        from: beforeCursor.from,
        options: ALL_COMPLETIONS,
        validFor: /^[\w]*$/
    };
}

// GlowScript version
const GS_VERSION = '3.2';
const STORAGE_KEY = 'vpython-editor-code';

// Example code snippets
const EXAMPLES = {
    basic: `from vpython import *

# Create a simple scene with basic shapes
sphere(pos=vector(0, 0, 0), radius=1, color=color.red)
box(pos=vector(3, 0, 0), size=vector(1, 1, 1), color=color.blue)
cylinder(pos=vector(-3, 0, 0), axis=vector(0, 2, 0), radius=0.5, color=color.green)
cone(pos=vector(0, 3, 0), axis=vector(0, -1.5, 0), radius=0.7, color=color.yellow)
arrow(pos=vector(0, -2, 0), axis=vector(2, 0, 0), color=color.cyan)
`,

    animation: `from vpython import *

# Bouncing ball animation
scene.background = color.gray(0.2)

floor = box(pos=vector(0, -1, 0), size=vector(10, 0.2, 10), color=color.green)
ball = sphere(pos=vector(0, 5, 0), radius=0.5, color=color.red, make_trail=True)

ball.velocity = vector(2, 0, 1)
gravity = vector(0, -9.8, 0)
dt = 0.01

while True:
    rate(100)
    ball.velocity = ball.velocity + gravity * dt
    ball.pos = ball.pos + ball.velocity * dt

    # Bounce off floor
    if ball.pos.y < -0.5:
        ball.velocity.y = -ball.velocity.y * 0.9
        ball.pos.y = -0.5

    # Bounce off walls
    if abs(ball.pos.x) > 4.5:
        ball.velocity.x = -ball.velocity.x
    if abs(ball.pos.z) > 4.5:
        ball.velocity.z = -ball.velocity.z
`,

    solar: `from vpython import *

# Simple solar system simulation
scene.background = color.black

# Sun
sun = sphere(pos=vector(0, 0, 0), radius=0.5, color=color.yellow, emissive=True)

# Planets
earth = sphere(pos=vector(3, 0, 0), radius=0.15, color=color.blue, make_trail=True)
earth.trail_color = color.blue
mars = sphere(pos=vector(4.5, 0, 0), radius=0.1, color=color.red, make_trail=True)
mars.trail_color = color.red

# Orbital speeds (simplified)
earth_omega = 1
mars_omega = 0.5

t = 0
dt = 0.02

while True:
    rate(50)
    t += dt

    # Update positions (circular orbits)
    earth.pos = vector(3 * cos(earth_omega * t), 0, 3 * sin(earth_omega * t))
    mars.pos = vector(4.5 * cos(mars_omega * t), 0, 4.5 * sin(mars_omega * t))
`,

    spring: `from vpython import *

# Spring oscillation simulation
scene.background = color.gray(0.2)

# Fixed support
ceiling = box(pos=vector(0, 5, 0), size=vector(2, 0.1, 2), color=color.gray(0.5))

# Mass on spring
mass = sphere(pos=vector(0, 2, 0), radius=0.3, color=color.red)
mass.velocity = vector(0, 0, 0)

# Spring parameters
k = 10  # spring constant
m = 1   # mass
L0 = 3  # natural length
damping = 0.1

# Create spring visual
spring = helix(pos=vector(0, 5, 0), axis=mass.pos - vector(0, 5, 0), radius=0.2, coils=10, color=color.white)

dt = 0.01

print("Watch the spring oscillate!")
print("Drag the view to rotate the scene.")

while True:
    rate(100)

    # Calculate spring force
    stretch = 5 - mass.pos.y - L0
    F_spring = k * stretch
    F_damping = -damping * mass.velocity.y
    F_total = F_spring + F_damping - m * 9.8

    # Update motion
    mass.velocity.y += (F_total / m) * dt
    mass.pos.y += mass.velocity.y * dt

    # Update spring visual
    spring.axis = mass.pos - vector(0, 5, 0)
`,

    projectile: `from vpython import *

# Projectile motion with air resistance
scene.background = color.gray(0.2)

# Ground
ground = box(pos=vector(25, -0.5, 0), size=vector(60, 1, 10), color=color.green)

# Projectile
ball = sphere(pos=vector(0, 0, 0), radius=0.5, color=color.red, make_trail=True)

# Initial conditions
v0 = 20  # initial speed
angle = 45  # launch angle in degrees
angle_rad = angle * pi / 180

ball.velocity = vector(v0 * cos(angle_rad), v0 * sin(angle_rad), 0)

# Physics parameters
g = 9.8
drag = 0.02  # air resistance coefficient
dt = 0.01

print("Projectile launched at", angle, "degrees")
print("Initial velocity:", v0, "m/s")

while ball.pos.y >= 0:
    rate(100)

    # Air resistance (proportional to v^2)
    v_mag = mag(ball.velocity)
    F_drag = -drag * v_mag * ball.velocity

    # Update velocity and position
    ball.velocity.y -= g * dt
    ball.velocity = ball.velocity + F_drag * dt
    ball.pos = ball.pos + ball.velocity * dt

print("Range:", round(ball.pos.x, 2), "meters")
print("Simulation complete!")
`
};

// Default starter code
const defaultCode = EXAMPLES.basic;

// DOM Elements
let editorContainer;
let outputDiv;
let errorDisplay;
let consoleOutput;
let consolePanel;
let runBtn;
let stopBtn;
let clearBtn;
let saveBtn;
let loadBtn;
let examplesSelect;
let toggleConsoleBtn;
let clearConsoleBtn;
let gutter;
let editorPanel;
let outputPanel;

// Global state
let editor;
let currentIframe = null;
let isRunning = false;

// Initialize CodeMirror editor
function initEditor() {
    const runKeymap = keymap.of([{
        key: 'Ctrl-Enter',
        run: () => {
            runCode();
            return true;
        }
    }, {
        key: 'Cmd-Enter',
        run: () => {
            runCode();
            return true;
        }
    }, {
        key: 'Ctrl-s',
        run: () => {
            saveCode();
            return true;
        }
    }, {
        key: 'Cmd-s',
        run: () => {
            saveCode();
            return true;
        }
    }]);

    // Try to load saved code
    const savedCode = localStorage.getItem(STORAGE_KEY);
    const initialCode = savedCode || defaultCode;

    editor = new EditorView({
        doc: initialCode,
        extensions: [
            basicSetup,
            python(),
            oneDark,
            runKeymap,
            EditorView.lineWrapping,
            autocompletion({
                override: [vpythonCompletions],
                activateOnTyping: true,
                maxRenderedOptions: 50,
            }),
        ],
        parent: editorContainer
    });
}

// Get editor content
function getCode() {
    return editor.state.doc.toString();
}

// Set editor content
function setCode(code) {
    editor.dispatch({
        changes: {
            from: 0,
            to: editor.state.doc.length,
            insert: code
        }
    });
}

// Show error message
function showError(message) {
    errorDisplay.innerHTML = `<pre>${escapeHtml(message)}</pre>`;
    errorDisplay.classList.add('visible');
}

// Hide error message
function hideError() {
    errorDisplay.classList.remove('visible');
    errorDisplay.innerHTML = '';
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Add to console output
function addConsoleLog(message) {
    const line = document.createElement('div');
    line.className = 'log-line';
    line.textContent = message;
    consoleOutput.appendChild(line);
    consoleOutput.scrollTop = consoleOutput.scrollHeight;

    // Auto-show console when there's output
    if (!consolePanel.classList.contains('visible')) {
        toggleConsole();
    }
}

// Clear console
function clearConsole() {
    consoleOutput.innerHTML = '';
}

// Toggle console panel
function toggleConsole() {
    consolePanel.classList.toggle('visible');
    toggleConsoleBtn.classList.toggle('active');
    toggleConsoleBtn.textContent = consolePanel.classList.contains('visible')
        ? 'Console ▲'
        : 'Console ▼';
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'save-notification';
    notification.textContent = message;
    if (type === 'error') {
        notification.style.backgroundColor = '#f44336';
    } else if (type === 'info') {
        notification.style.backgroundColor = '#2196f3';
    }
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 2000);
}

// Save code to localStorage
function saveCode() {
    const code = getCode();
    localStorage.setItem(STORAGE_KEY, code);
    showNotification('Code saved to browser!');
}

// Load code from localStorage
function loadCode() {
    const savedCode = localStorage.getItem(STORAGE_KEY);
    if (savedCode) {
        setCode(savedCode);
        showNotification('Code loaded!', 'info');
    } else {
        showNotification('No saved code found', 'error');
    }
}

// Load example code
function loadExample(exampleName) {
    if (exampleName && EXAMPLES[exampleName]) {
        setCode(EXAMPLES[exampleName]);
        examplesSelect.value = '';
    }
}

// Clear the output
function clearOutput() {
    stopExecution();
    outputDiv.innerHTML = '<div class="loading">Click "Run" to execute your VPython code</div>';
    hideError();
}

// Stop execution
function stopExecution() {
    if (currentIframe) {
        currentIframe.remove();
        currentIframe = null;
    }
    isRunning = false;
    runBtn.disabled = false;
    runBtn.textContent = '▶ Run';
    stopBtn.disabled = true;
}

// Run the VPython code
async function runCode() {
    if (isRunning) return;

    const code = getCode();

    hideError();
    clearConsole();
    stopExecution();

    outputDiv.innerHTML = '<div class="loading">Initializing GlowScript...</div>';

    isRunning = true;
    runBtn.disabled = true;
    runBtn.textContent = '⏳ Running...';
    stopBtn.disabled = false;

    try {
        await executeInIframe(code);
    } catch (error) {
        showError(`Error: ${error.message || error}`);
        console.error('Execution error:', error);
    }
}

// Execute code in an iframe using proper GlowScript libraries
async function executeInIframe(code) {
    outputDiv.innerHTML = '';

    const iframe = document.createElement('iframe');
    iframe.style.cssText = 'width:100%;height:100%;border:none;background:#1a1a1a;';
    currentIframe = iframe;
    outputDiv.appendChild(iframe);

    // Prepare code - ensure proper header
    let glowCode = code.trim();
    glowCode = glowCode.replace(/^(GlowScript|Web VPython).*\n?/i, '');
    glowCode = `GlowScript ${GS_VERSION} VPython\n` + glowCode;

    // Build iframe content with proper GlowScript libraries
    const iframeContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!-- jQuery UI CSS for resizable -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.2/themes/base/jquery-ui.min.css">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        html, body {
            width: 100%;
            height: 100%;
            background: #1a1a1a;
            overflow: hidden;
        }
        #glowscript {
            width: 100%;
            height: 100%;
        }
        canvas {
            display: block !important;
        }
        .error-output {
            position: fixed;
            bottom: 0; left: 0; right: 0;
            background: rgba(40, 0, 0, 0.95);
            color: #ff6b6b;
            font-family: 'Consolas', monospace;
            font-size: 13px;
            padding: 12px;
            border-top: 2px solid #ff6b6b;
            max-height: 40%;
            overflow: auto;
            z-index: 1000;
        }
    </style>

    <!-- jQuery and jQuery UI required by GlowScript -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.13.2/jquery-ui.min.js"></script>

    <!-- GlowScript runtime libraries (from glowscript.org/package/) -->
    <script src="https://glowscript.org/package/glow.${GS_VERSION}.min.js"></script>
    <script src="https://glowscript.org/package/RSrun.${GS_VERSION}.min.js"></script>
</head>
<body>
    <div id="glowscript"></div>

    <script type="text/javascript">
        // Error handling
        window.onerror = function(msg, url, line) {
            showError(msg + (line ? ' at line ' + line : ''));
            parent.postMessage({ type: 'glowscript-error', message: msg }, '*');
            return true;
        };

        function showError(msg) {
            var existing = document.querySelector('.error-output');
            if (existing) existing.remove();
            var errorDiv = document.createElement('div');
            errorDiv.className = 'error-output';
            errorDiv.textContent = 'Error: ' + msg;
            document.body.appendChild(errorDiv);
        }

        // Capture print output and send to parent
        (function() {
            var origLog = console.log;
            console.log = function() {
                origLog.apply(console, arguments);
                var message = Array.prototype.slice.call(arguments).map(function(a) {
                    return typeof a === 'object' ? JSON.stringify(a) : String(a);
                }).join(' ');
                parent.postMessage({ type: 'console-log', message: message }, '*');
            };
        })();

        // Load compiler and run
        async function loadAndRun() {
            try {
                console.log('Loading GlowScript compiler...');

                // Load the compiler dynamically
                await new Promise(function(resolve, reject) {
                    var script = document.createElement('script');
                    script.src = 'https://glowscript.org/package/RScompiler.${GS_VERSION}.min.js';
                    script.onload = function() {
                        console.log('Compiler loaded');
                        resolve();
                    };
                    script.onerror = function() {
                        reject(new Error('Failed to load compiler'));
                    };
                    document.head.appendChild(script);
                });

                // Wait for compiler to be available
                var maxWait = 50;
                while (typeof window.glowscript_compile !== 'function' && maxWait-- > 0) {
                    await new Promise(function(r) { setTimeout(r, 100); });
                }

                if (typeof window.glowscript_compile !== 'function') {
                    throw new Error('GlowScript compiler not available');
                }

                var code = ${JSON.stringify(glowCode)};
                var container = document.getElementById('glowscript');

                // Compile the code
                var program = window.glowscript_compile(code, {
                    lang: 'vpython',
                    version: '${GS_VERSION}'
                });

                console.log('Executing program...');

                // Set up execution context
                window.__context = {
                    glowscript_container: $(container).removeAttr('id')
                };

                // Execute the compiled program
                eval(program);

                // Run the main function if it exists
                if (typeof __main__ === 'function') {
                    await __main__();
                }

                parent.postMessage({ type: 'glowscript-ready' }, '*');

            } catch (e) {
                showError(e.message || String(e));
                parent.postMessage({ type: 'glowscript-error', message: e.message || String(e) }, '*');
            }
        }

        // Start execution
        $(document).ready(loadAndRun);
    </script>
</body>
</html>`;

    iframe.srcdoc = iframeContent;

    // Listen for messages from iframe
    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            resolve();
        }, 20000);

        const messageHandler = (event) => {
            if (!currentIframe || event.source !== currentIframe.contentWindow) return;

            if (event.data) {
                if (event.data.type === 'glowscript-error') {
                    showError(event.data.message);
                    isRunning = false;
                    runBtn.disabled = false;
                    runBtn.textContent = '▶ Run';
                } else if (event.data.type === 'glowscript-ready') {
                    clearTimeout(timeout);
                    runBtn.disabled = false;
                    runBtn.textContent = '▶ Run';
                    resolve();
                } else if (event.data.type === 'console-log') {
                    addConsoleLog(event.data.message);
                }
            }
        };

        window.addEventListener('message', messageHandler);
    });
}

// Initialize resizable panels
function initResizable() {
    let isDragging = false;
    let startX;
    let startEditorWidth;
    let startOutputWidth;

    gutter.addEventListener('mousedown', (e) => {
        isDragging = true;
        gutter.classList.add('dragging');
        startX = e.clientX;
        startEditorWidth = editorPanel.offsetWidth;
        startOutputWidth = outputPanel.offsetWidth;
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const dx = e.clientX - startX;
        const totalWidth = startEditorWidth + startOutputWidth;
        const newEditorWidth = Math.max(200, Math.min(startEditorWidth + dx, totalWidth - 200));
        const newOutputWidth = totalWidth - newEditorWidth;

        editorPanel.style.flex = 'none';
        editorPanel.style.width = newEditorWidth + 'px';
        outputPanel.style.flex = 'none';
        outputPanel.style.width = newOutputWidth + 'px';
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            gutter.classList.remove('dragging');
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        }
    });
}

// Initialize the application
function init() {
    // Get DOM elements
    editorContainer = document.getElementById('editor');
    outputDiv = document.getElementById('output');
    errorDisplay = document.getElementById('error-display');
    consoleOutput = document.getElementById('console-output');
    consolePanel = document.getElementById('console-panel');
    runBtn = document.getElementById('run-btn');
    stopBtn = document.getElementById('stop-btn');
    clearBtn = document.getElementById('clear-btn');
    saveBtn = document.getElementById('save-btn');
    loadBtn = document.getElementById('load-btn');
    examplesSelect = document.getElementById('examples-select');
    toggleConsoleBtn = document.getElementById('toggle-console');
    clearConsoleBtn = document.getElementById('clear-console');
    gutter = document.getElementById('gutter');
    editorPanel = document.querySelector('.editor-panel');
    outputPanel = document.querySelector('.output-panel');

    // Initialize CodeMirror
    initEditor();

    // Initialize resizable panels
    initResizable();

    // Set up event listeners
    runBtn.addEventListener('click', runCode);
    stopBtn.addEventListener('click', stopExecution);
    clearBtn.addEventListener('click', clearOutput);
    saveBtn.addEventListener('click', saveCode);
    loadBtn.addEventListener('click', loadCode);
    examplesSelect.addEventListener('change', (e) => loadExample(e.target.value));
    toggleConsoleBtn.addEventListener('click', toggleConsole);
    clearConsoleBtn.addEventListener('click', clearConsole);

    // Show initial message in output
    outputDiv.innerHTML = '<div class="loading">Click "Run" to execute your VPython code</div>';

    console.log('VPython Editor initialized');
}

// Start the application when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
