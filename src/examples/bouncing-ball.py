from vpython import *

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
