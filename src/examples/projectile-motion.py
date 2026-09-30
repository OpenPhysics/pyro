from vpython import *

# Projectile motion with air resistance
scene.background = color.gray(0.2)

# Ground (top surface at y = 0)
ground = box(pos=vector(25, -0.5, 0), size=vector(60, 1, 10), color=color.green)

# Projectile, resting on the ground; ball.pos.y is the height of its centre
r = 0.5
ball = sphere(pos=vector(0, r, 0), radius=r, color=color.red, make_trail=True)

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

while ball.pos.y >= r:
    rate(100)
    prev_pos = vector(ball.pos)

    # Air resistance (proportional to v^2)
    v_mag = mag(ball.velocity)
    F_drag = -drag * v_mag * ball.velocity

    # Update velocity and position
    ball.velocity.y -= g * dt
    ball.velocity = ball.velocity + F_drag * dt
    ball.pos = ball.pos + ball.velocity * dt

# Interpolate back to the exact moment the ball touched the ground
frac = (prev_pos.y - r) / (prev_pos.y - ball.pos.y)
landing_x = prev_pos.x + frac * (ball.pos.x - prev_pos.x)
ball.pos = vector(landing_x, r, 0)

print("Range:", round(landing_x, 2), "meters")
print("Simulation complete!")
