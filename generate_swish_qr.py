import json
import urllib.parse

import qrcode
from qrcode.constants import ERROR_CORRECT_Q
from PIL import Image, ImageDraw, ImageFont

""" Run with - python generate_swish_qr.py """
""" if python is not found  """
""" pip install qrcode[pil] pillow  """

# --- Swish payment ---------------------------------------------------------
# We encode the "swish://payment?data=..." deep link so that scanning with a
# phone's native camera opens the Swish app with the payment pre-filled.
# (The older "C<number>;<amount>;..." string only works inside Swish's own
#  scanner — a regular camera treats it as text and tries to web-search it.)
SWISH_NUMBER = "1236164784"          # 123 616 47 84  (merchant Swish number)
AMOUNT = 750
MESSAGE = "Idrottsmassage"
# Omitting "editable" locks each field. Add "editable": True to allow edits.
swish_payload = {
    "version": 1,
    "payee": {"value": SWISH_NUMBER},
    "amount": {"value": AMOUNT},
    "message": {"value": MESSAGE},
}
DATA = "swish://payment?data=" + urllib.parse.quote(
    json.dumps(swish_payload, separators=(",", ":")), safe=""
)

DISPLAY_NUMBER = "123 616 47 84"

# --- Sanctum palette -------------------------------------------------------
PRIMARY = "#27a18d"                  # #b8956a Sanctum gold
BACKGROUND = "#000000"               # QR tile background (same as original)
GRADIENT_LIGHT = (39, 161, 141)         # panel gradient top
GRADIENT_DARK = (5, 58, 49)           # panel gradient bottom
CARD = (10, 10, 10)                  # dark card behind the QR
TITLE = "#c7fff6"
MESSAGE_COLOR = "#001d18"              # #2c2014 MESSAGE_COLOR brown, for text on the panel

CENTER_LOGO_PATH = "public/swish_middle.png"      # swirl symbol inside the QR
LOGO_PATH = "public/swish_secondary_dark.png"     # full logo at the bottom
OUTPUT_PATH = "public/idrottsmassage.png"

# ---------------------------------------------------------------------------
# 1. Build the QR tile — identical style to generate_qr.py
# ---------------------------------------------------------------------------
box_size = 20
border = 2

qr = qrcode.QRCode(
    version=None,
    error_correction=ERROR_CORRECT_Q,
    box_size=box_size,
    border=border,
)
qr.add_data(DATA)
qr.make(fit=True)

modules = qr.modules
n = len(modules)
img_size = (n + 2 * border) * box_size

qr_img = Image.new("RGBA", (img_size, img_size), BACKGROUND)
draw = ImageDraw.Draw(qr_img)

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

# Center logo (swish_middle swirl) on a backplate that matches the tile background.
logo = Image.open(CENTER_LOGO_PATH).convert("RGBA")
qr_w, qr_h = qr_img.size
logo_size = qr_w // 4
ratio = logo_size / max(logo.size)
new_size = (int(logo.width * ratio), int(logo.height * ratio))
logo = logo.resize(new_size, Image.LANCZOS)

pad = 28
diameter = int(max(logo.width, logo.height) * 1.25) + pad * 2
backplate = Image.new("RGBA", (diameter, diameter), (0, 0, 0, 0))
bp_draw = ImageDraw.Draw(backplate)
bp_draw.ellipse((0, 0, diameter - 1, diameter - 1), fill=BACKGROUND)
qr_img.paste(backplate, ((qr_w - diameter) // 2, (qr_h - diameter) // 2), backplate)
qr_img.paste(logo, ((qr_w - logo.width) // 2, (qr_h - logo.height) // 2), logo)

# ---------------------------------------------------------------------------
# 2. Compose the Sanctum-flavoured poster
# ---------------------------------------------------------------------------
W, H = 2480, 3508
poster = Image.new("RGBA", (W, H), BACKGROUND)
pdraw = ImageDraw.Draw(poster)


def load_font(names, size):
    for name in names:
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


BOLD = ["segoeuib.ttf", "arialbd.ttf"]
SEMI = ["seguisb.ttf", "segoeuib.ttf", "arialbd.ttf"]
REG = ["segoeui.ttf", "arial.ttf"]

font_title = load_font(BOLD, 180)
font_number = load_font(BOLD, 128)
font_msg = load_font(SEMI, 104)
font_label = load_font(SEMI, 104)


def center_text(cy, text, font, fill):
    """Draw text horizontally centered, vertically centered on cy. Returns bottom y."""
    bbox = pdraw.textbbox((0, 0), text, font=font)
    w = bbox[2] - bbox[0]
    h = bbox[3] - bbox[1]
    pdraw.text(((W - w) / 2 - bbox[0], cy - h / 2 - bbox[1]), text, font=font, fill=fill)
    return cy + h / 2


# Gold gradient panel with softly rounded corners.
margin = 110
panel_top, panel_bottom = 120, 2780
pw, ph = W - 2 * margin, panel_bottom - panel_top

gradient = Image.new("RGBA", (pw, ph))
gdraw = ImageDraw.Draw(gradient)
for gy in range(ph):
    t = gy / max(ph - 1, 1)
    r = int(GRADIENT_LIGHT[0] + (GRADIENT_DARK[0] - GRADIENT_LIGHT[0]) * t)
    g = int(GRADIENT_LIGHT[1] + (GRADIENT_DARK[1] - GRADIENT_LIGHT[1]) * t)
    b = int(GRADIENT_LIGHT[2] + (GRADIENT_DARK[2] - GRADIENT_LIGHT[2]) * t)
    gdraw.line([(0, gy), (pw, gy)], fill=(r, g, b, 255))

panel_mask = Image.new("L", (pw, ph), 0)
ImageDraw.Draw(panel_mask).rounded_rectangle([0, 0, pw - 1, ph - 1], radius=180, fill=255)
poster.paste(gradient, (margin, panel_top), panel_mask)

# Title
center_text(360, "Betala med Swish", font_title, TITLE)

# Dark card holding the QR + number
target_qr = 1080
qr_scaled = qr_img.resize((target_qr, target_qr), Image.LANCZOS)

card_w = 1500
card_pad_top = 120
number_gap = 70
num_h = font_number.size
card_h = card_pad_top + target_qr + number_gap + num_h + 130
card_x = (W - card_w) // 2
card_y = 600

# subtle gold frame + dark card
pdraw.rounded_rectangle(
    [card_x - 12, card_y - 12, card_x + card_w + 12, card_y + card_h + 12],
    radius=112, fill=PRIMARY,
)
pdraw.rounded_rectangle(
    [card_x, card_y, card_x + card_w, card_y + card_h],
    radius=100, fill=CARD,
)

qr_x = (W - target_qr) // 2
qr_y = card_y + card_pad_top
poster.paste(qr_scaled, (qr_x, qr_y), qr_scaled)

num_cy = qr_y + target_qr + number_gap + num_h / 2
center_text(num_cy, DISPLAY_NUMBER, font_number, PRIMARY)

# Message + recipient, on the panel below the card
below = card_y + card_h
center_text(below + 260, MESSAGE, font_msg, MESSAGE_COLOR)
center_text(below + 440, "Sanctum", font_label, TITLE)

# Swish branding at the bottom (on the black background, below the panel)
brand = Image.open(LOGO_PATH).convert("RGBA")
brand_w = 1080
br_ratio = brand_w / brand.width
brand = brand.resize((brand_w, int(brand.height * br_ratio)), Image.LANCZOS)
brand_y = panel_bottom + (H - panel_bottom - brand.height) // 2
poster.paste(brand, ((W - brand.width) // 2, brand_y), brand)

poster.convert("RGB").save(OUTPUT_PATH, quality=95)
print(f"Saved {OUTPUT_PATH} ({W}x{H})")
print(f"Encoded: {DATA}")
