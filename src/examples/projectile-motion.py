from vpython import *

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
