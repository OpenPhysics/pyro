# Bouncing Ball

A ball bounces off the floor and walls under gravity, with energy loss on each floor impact. The simulation runs indefinitely, demonstrating continuous physics and collision handling.

## What You'll See

- A red ball with a trail, dropped from above
- Gravity pulls the ball downward
- Elastic bounces off the floor (90% energy retained per bounce)
- Perfectly elastic bounces off the side walls
- The trail shows the ball's path over time

## Physics

- **Gravity**: Constant downward acceleration (9.8 m/s²)
- **Floor collision**: Velocity component reversed and scaled by 0.9 (coefficient of restitution)
- **Wall collision**: Velocity component reversed (no energy loss)

## Key Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| Initial velocity | (2, 0, 1) | Launch direction and speed |
| Gravity | -9.8 | Downward acceleration |
| Floor restitution | 0.9 | Energy retained per bounce |
| Wall bounds | ±4.5 | x and z boundaries |

## Tips

- Drag the view to watch the ball from different angles
- The trail helps visualize the 3D trajectory
- Try modifying the initial velocity or restitution to see different behaviors
