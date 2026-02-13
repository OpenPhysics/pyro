# Solar System

A simplified 3-body solar system: the Sun at the center with Earth and Mars in circular orbits. Each planet leaves a trail showing its orbital path.

## What You'll See

- **Sun** — Yellow emissive sphere at the origin
- **Earth** — Blue sphere in a circular orbit (radius 3)
- **Mars** — Red sphere in a wider orbit (radius 4.5)
- Orbital trails that trace each planet's path over time

## Physics

- **Circular orbits**: Positions computed using \( x = r \cos(\omega t) \), \( z = r \sin(\omega t) \)
- **Angular velocities**: Earth orbits faster (ω = 1) than Mars (ω = 0.5)
- Simplified model: no gravitational dynamics, just prescribed circular motion

## Key Parameters

| Parameter | Earth | Mars |
|-----------|-------|------|
| Orbital radius | 3 | 4.5 |
| Angular speed (ω) | 1 | 0.5 |
| Relative period | 2π | 4π |

## Tips

- Drag to rotate and view the orbits from different angles
- The trails reveal the circular paths in 3D
- Try adjusting orbital radii or angular speeds to create different configurations
