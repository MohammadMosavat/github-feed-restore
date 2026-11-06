from PIL import Image, ImageDraw
import math

S = 1024
img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
d = ImageDraw.Draw(img)

# background
d.rounded_rectangle((0, 0, S - 1, S - 1), radius=230, fill=(13, 17, 23, 255))

# circular "back" arrow (arc ~270deg, arrowhead at top-left)
cx, cy, r, w = S // 2, S // 2, 300, 90
green = (46, 160, 67, 255)
bbox = (cx - r, cy - r, cx + r, cy + r)
d.arc(bbox, start=-60, end=210, fill=green, width=w)

# arrowhead at arc start (-60deg), pointing counter-clockwise
a = math.radians(-60)
px, py = cx + r * math.cos(a), cy + r * math.sin(a)
tx, ty = -math.sin(a) * -1, math.cos(a) * -1  # tangent (ccw direction reversed)
# tangent pointing along decreasing angle
tx, ty = math.sin(a), -math.cos(a)
nx, ny = math.cos(a), math.sin(a)
tip = (px + tx * 150, py + ty * 150)
b1 = (px + nx * 150, py + ny * 150)
b2 = (px - nx * 150, py - ny * 150)
d.polygon([tip, b1, b2], fill=green)
# round the arc end cap
d.ellipse((px - w / 2, py - w / 2, px + w / 2, py + w / 2), fill=green)
e = math.radians(210)
ex, ey = cx + r * math.cos(e), cy + r * math.sin(e)
d.ellipse((ex - w / 2, ey - w / 2, ex + w / 2, ey + w / 2), fill=green)

# "more" dots in center
for dx in (-95, 0, 95):
    d.ellipse((cx + dx - 42, cy - 42, cx + dx + 42, cy + 42), fill=(230, 237, 243, 255))

img.save("icons/icon.png")
for s in (16, 32, 48, 128):
    img.resize((s, s), Image.LANCZOS).save(f"icons/icon{s}.png")
