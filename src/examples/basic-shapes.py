from vpython import *

# Create a simple scene with basic shapes
sphere(pos=vector(0, 0, 0), radius=1, color=color.red)
box(pos=vector(3, 0, 0), size=vector(1, 1, 1), color=color.blue)
cylinder(pos=vector(-3, 0, 0), axis=vector(0, 2, 0), radius=0.5, color=color.green)
cone(pos=vector(0, 3, 0), axis=vector(0, -1.5, 0), radius=0.7, color=color.yellow)
arrow(pos=vector(0, -2, 0), axis=vector(2, 0, 0), color=color.cyan)
