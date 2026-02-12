from vpython import *

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
