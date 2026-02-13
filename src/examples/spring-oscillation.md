# Spring Oscillation

A mass suspended from a spring oscillates vertically with damping. The spring force (Hooke's law) and damping are computed from physics, producing realistic oscillatory motion.

## What You'll See

- A fixed gray ceiling with a helical spring attached
- A red mass at the bottom of the spring
- The mass oscillates up and down, gradually losing amplitude due to damping
- The spring stretches and compresses in sync with the motion

## Physics

- **Spring force** (Hooke's law): \( F_{spring} = k \cdot (stretch) \)
  - Stretch = current length − natural length (L₀ = 3)
- **Damping**: \( F_{damping} = -c \cdot v_y \) — opposes velocity
- **Gravity**: Constant downward force
- **Net force**: \( F_{total} = F_{spring} + F_{damping} - mg \)

## Key Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| Spring constant (k) | 10 | Stiffness |
| Mass (m) | 1 | Oscillating mass |
| Natural length (L₀) | 3 | Unstretched spring length |
| Damping (c) | 0.1 | Energy loss per unit velocity |

## Tips

- Drag the view to rotate and see the oscillation from different angles
- Watch how damping causes the amplitude to decrease over time
- Try increasing `damping` for faster decay, or `k` for faster oscillation
