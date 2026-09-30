# Projectile Motion

Classic projectile motion with air resistance. A ball is launched at an angle and follows a trajectory — no longer a parabola, because of drag — until it hits the ground. The simulation prints the range when complete.

## What You'll See

- A red ball launched at 45° with initial speed 20 m/s
- A visible trail showing the trajectory
- Air resistance (drag) reducing range and making the descent steeper than the ascent, unlike the symmetric parabola in a vacuum
- The ball lands on a green ground plane
- Console output: initial conditions and final range

## Physics

- **Launch**: Initial velocity decomposed into horizontal and vertical components
- **Gravity**: Constant downward acceleration (9.8 m/s²)
- **Air resistance**: Drag force proportional to v², opposing velocity
  - \( F_{drag} = -k \cdot |v| \cdot \vec{v} \)

## Key Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| Initial speed (v₀) | 20 m/s | Launch magnitude |
| Launch angle | 45° | Angle above horizontal |
| Drag coefficient | 0.02 | Air resistance strength |
| Gravity | 9.8 m/s² | Downward acceleration |

## Tips

- Change `angle` or `v0` to explore different trajectories
- Increase `drag` to see stronger air resistance effects
- The simulation stops when the ball reaches the ground and prints the range
