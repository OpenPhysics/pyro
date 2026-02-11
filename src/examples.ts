import type { ExamplesMap } from './types';

export const EXAMPLES: ExamplesMap = {
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
`,
};

export const DEFAULT_CODE: string = EXAMPLES.basic;
