import qrcode
from qrcode.constants import ERROR_CORRECT_H
from PIL import Image, ImageDraw

""" Run with - python generate_qr.py """
""" if python is not found  """
""" pip install qrcode[pil] pillow  """

URL = "https://www.sanctumkiropraktik.se/p/q7kf9m2dxz"
PRIMARY = "#b8956a"
BACKGROUND = "#000000"
LOGO_PATH = "public/sanctum_logo.png"
OUTPUT_PATH = "public/sanctum_qr.png"

box_size = 20
border = 2

qr = qrcode.QRCode(
    version=None,
    error_correction=ERROR_CORRECT_H,
    box_size=box_size,
    border=border,
)
qr.add_data(URL)
qr.make(fit=True)

modules = qr.modules
n = len(modules)
img_size = (n + 2 * border) * box_size

img = Image.new("RGBA", (img_size, img_size), BACKGROUND)
draw = ImageDraw.Draw(img)

# (row, col, corners) — corners = (TL, TR, BR, BL); False = sharp corner toward center
finders = [
    (0, 0, (True, True, False, True)),          # top-left finder: sharp BR
    (0, n - 7, (True, True, True, False)),      # top-right finder: sharp BL
    (n - 7, 0, (True, False, True, True)),      # bottom-left finder: sharp TR
]


def in_finder(r, c):
    for fr, fc, _ in finders:
        if fr <= r < fr + 7 and fc <= c < fc + 7:
            return True
    return False


for r in range(n):
    for c in range(n):
        if modules[r][c] and not in_finder(r, c):
            x = (c + border) * box_size
            y = (r + border) * box_size
            half = box_size / 2
            cx = x + half
            cy = y + half
            # Smaller diamonds with whitespace between them for an airier look.
            d = half * 0.78
            draw.polygon(
                [(cx, cy - d), (cx + d, cy), (cx, cy + d), (cx - d, cy)],
                fill=PRIMARY,
            )

for fr, fc, corners in finders:
    x = (fc + border) * box_size
    y = (fr + border) * box_size
    outer_size = 7 * box_size
    mid_size = 5 * box_size
    inner_size = 3 * box_size

    # Mild rounding — still reads as a square, one corner stays sharp.
    outer_radius = int(1.4 * box_size)
    mid_radius = int(1.0 * box_size)
    inner_radius = int(0.6 * box_size)

    draw.rounded_rectangle(
        [x, y, x + outer_size - 1, y + outer_size - 1],
        radius=outer_radius,
        fill=PRIMARY,
        corners=corners,
    )
    mid_offset = (outer_size - mid_size) // 2
    draw.rounded_rectangle(
        [x + mid_offset, y + mid_offset, x + mid_offset + mid_size - 1, y + mid_offset + mid_size - 1],
        radius=mid_radius,
        fill=BACKGROUND,
        corners=corners,
    )
    inner_offset = (outer_size - inner_size) // 2
    draw.rounded_rectangle(
        [x + inner_offset, y + inner_offset, x + inner_offset + inner_size - 1, y + inner_offset + inner_size - 1],
        radius=inner_radius,
        fill=PRIMARY,
        corners=corners,
    )

logo = Image.open(LOGO_PATH).convert("RGBA")

qr_w, qr_h = img.size
logo_size = qr_w // 4
ratio = logo_size / max(logo.size)
new_size = (int(logo.width * ratio), int(logo.height * ratio))
logo = logo.resize(new_size, Image.LANCZOS)

pad = 28
diameter = int(max(logo.width, logo.height) * 1.25) + pad * 2
backplate = Image.new("RGBA", (diameter, diameter), (0, 0, 0, 0))
bp_draw = ImageDraw.Draw(backplate)
bp_draw.ellipse((0, 0, diameter - 1, diameter - 1), fill=BACKGROUND)

bp_pos = ((qr_w - diameter) // 2, (qr_h - diameter) // 2)
img.paste(backplate, bp_pos, backplate)

logo_pos = ((qr_w - logo.width) // 2, (qr_h - logo.height) // 2)
img.paste(logo, logo_pos, logo)

img.save(OUTPUT_PATH)
print(f"Saved {OUTPUT_PATH} ({qr_w}x{qr_h})")
