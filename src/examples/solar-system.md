# Solar System

A simplified solar system: the Sun at the center with Earth and Mars moving on prescribed circular orbits (no gravitational interaction is computed). Each planet leaves a trail showing its orbital path.

## What You'll See

- **Sun** — Yellow emissive sphere at the origin
- **Earth** — Blue sphere in a circular orbit (radius 3)
- **Mars** — Red sphere in a wider orbit (radius 4.5)
- Orbital trails that trace each planet's path over time

## Physics

- **Circular orbits**: Positions computed using \( x = r \cos(\omega t) \), \( z = r \sin(\omega t) \)
- **Angular velocities**: set by Kepler's third law, ω ∝ r^(−3/2), so Earth (ω = 1) orbits faster than Mars (ω = (4.5/3)^(−3/2) ≈ 0.544)
- Simplified model: no gravitational dynamics, just prescribed circular motion

## Key Parameters

| Parameter | Earth | Mars |
|-----------|-------|------|
| Orbital radius | 3 | 4.5 |
| Angular speed (ω) | 1 | ≈ 0.544 |
| Relative period | 2π | ≈ 11.5 (1.84 × Earth's) |

## Tips

- Drag to rotate and view the orbits from different angles
- The trails reveal the circular paths in 3D
- Try adjusting orbital radii (and recompute ω with Kepler's law), or break the law on purpose and compare
