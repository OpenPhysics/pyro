from vpython import *

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
