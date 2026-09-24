#!/usr/bin/env python
"""
Dev utility: regenerate the two non-confidential sample images used by
scripts/extract-image.js (Session 12 / Lab 12.1).

Both images are synthetic mock-ups of equipment found in the Track 3 vault
(NetGate Home X2 router, LaserPro 2400 printer) - no real device, person, or
account data is depicted.

    python scripts/make-sample-images.py

Outputs:
    sample-images/a.jpg  photo of a router model/serial label
    sample-images/b.png  handwritten field note with a small network sketch
"""

import os
import random

from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
OUT_DIR = os.path.join(HERE, "..", "sample-images")

FONT_DIR = r"C:\Windows\Fonts"
MONO = os.path.join(FONT_DIR, "consola.ttf")
MONO_B = os.path.join(FONT_DIR, "consolab.ttf")
HAND = os.path.join(FONT_DIR, "segoepr.ttf")

random.seed(12)


def font(path, size):
    return ImageFont.truetype(path, size)


def add_grain(img, sigma):
    noise = Image.effect_noise(img.size, sigma).convert("L")
    return Image.blend(img.convert("RGB"), Image.merge("RGB", (noise, noise, noise)), 0.06)


def build_label_photo():
    """Router rear label: a photo-ish shot of the sticker on the casing."""
    w, h = 900, 1200
    body = Image.new("RGB", (w, h), (43, 47, 51))
    draw = ImageDraw.Draw(body)
    # subtle plastic shading on the casing
    for y in range(h):
        shade = int(10 * (y / h))
        draw.line([(0, y), (w, y)], fill=(43 + shade, 47 + shade, 51 + shade))

    # --- sticker ---
    sw, sh = 660, 500
    sticker = Image.new("RGB", (sw, sh), (247, 246, 241))
    sd = ImageDraw.Draw(sticker)
    sd.rounded_rectangle([2, 2, sw - 3, sh - 3], radius=10, outline=(205, 204, 198), width=2)

    y = 30
    sd.text((34, y), "NETGATE", font=font(MONO_B, 36), fill=(24, 26, 28))
    sd.text((36, y + 46), "Home X2 Wireless Router", font=font(MONO, 20), fill=(60, 62, 66))
    y += 92
    sd.line([(34, y), (sw - 34, y)], fill=(190, 190, 185), width=2)
    y += 22

    rows = [
        ("MODEL", "Home X2"),
        ("S/N", "NGX2-4471-A9"),
        ("MAC", "8C:1F:64:2A:0B:D3"),
        ("SSID", "NetGate-4471"),
        ("WEBUI", "http://192.168.1.1"),
        ("INPUT", "12V DC 1.5A"),
        ("FCC ID", "2AX9F-HX2"),
        ("MADE IN", "VIETNAM"),
    ]
    for k, v in rows:
        sd.text((36, y), k, font=font(MONO_B, 21), fill=(40, 42, 46))
        sd.text((170, y), v, font=font(MONO, 21), fill=(24, 26, 30))
        y += 34

    # barcode block
    bx = 36
    while bx < sw - 40:
        bw = random.choice([2, 2, 3, 5])
        if random.random() > 0.45:
            sd.rectangle([bx, y + 14, bx + bw, y + 62], fill=(30, 30, 32))
        bx += bw + random.choice([2, 3, 4])

    # rotate the sticker like a hand-held photo
    shadow = Image.new("L", (sw + 60, sh + 60), 0)
    shadow.paste(Image.new("L", (sw, sh), 190), (30, 30))
    shadow = shadow.rotate(-1.6, resample=Image.BICUBIC, expand=True).filter(
        ImageFilter.GaussianBlur(14)
    )
    body.paste((12, 12, 14), (120, 330), shadow)

    rot = sticker.rotate(-1.6, resample=Image.BICUBIC, expand=True, fillcolor=(247, 246, 241))
    body.paste(rot, (128, 338))

    out = add_grain(body, 26).filter(ImageFilter.GaussianBlur(0.5))
    out.save(os.path.join(OUT_DIR, "a.jpg"), quality=88)
    print("wrote sample-images/a.jpg")


def build_handwritten_note():
    """Field note: lined paper, handwriting, plus a small topology sketch."""
    w, h = 1240, 1320
    paper = (252, 250, 242)
    img = Image.new("RGB", (w, h), paper)
    d = ImageDraw.Draw(img)

    for y in range(120, h - 40, 46):
        d.line([(60, y), (w - 40, y)], fill=(206, 216, 224), width=1)
    d.line([(90, 60), (90, h - 40)], fill=(226, 170, 170), width=2)

    ink = (28, 34, 120)

    lines = [
        ("Printer down - check!", 32),
        ("", 0),
        ("Office printer (LaserPro 2400) not printing since 08:40.", 0),
        ("Router LED = blinking amber about 10 min. Was solid blue.", 0),
        ("Tried: power cycle printer, swapped the patch cable. No change.", 0),
        ("Ping 192.168.1.50 = no reply. Ping 192.168.1.1 = OK.", 0),
        ("WAN cable at router looks loose - reseat it first.", 0),
        ("DO NOT factory reset the router. Config backup not confirmed!", 0),
        ("If still down by 5pm, escalate to the on-call technician.", 0),
    ]
    y = 96
    for text, size in lines:
        if not text:
            y += 46
            continue
        f = font(HAND, size or 28)
        d.text((112 + random.randint(-3, 3), y + random.randint(-3, 3)), text, font=f, fill=ink)
        if size:
            tw = d.textlength(text, font=f)
            d.line([(110, y + 40), (110 + tw, y + 36)], fill=ink, width=2)
        y += 46

    # --- sketch (kept clear of the note text above it) ---
    sy = y + 140
    d.ellipse([130, sy, 300, sy + 60], outline=ink, width=2)
    d.text((176, sy + 16), "WAN", font=font(HAND, 24), fill=ink)

    d.line([(300, sy + 30), (360, sy + 30)], fill=ink, width=2)
    d.rectangle([360, sy - 6, 540, sy + 66], outline=ink, width=2)
    d.text((392, sy + 4), "router", font=font(HAND, 22), fill=ink)
    d.text((378, sy + 34), "192.168.1.1", font=font(HAND, 20), fill=ink)

    d.line([(540, sy - 6), (640, sy - 60)], fill=ink, width=2)
    d.rectangle([640, sy - 100, 900, sy - 24], outline=ink, width=2)
    d.text((660, sy - 92), "printer", font=font(HAND, 22), fill=ink)
    d.text((660, sy - 62), "192.168.1.50", font=font(HAND, 20), fill=ink)

    d.line([(540, sy + 66), (640, sy + 120)], fill=ink, width=2)
    d.rectangle([640, sy + 84, 900, sy + 160], outline=ink, width=2)
    d.text((660, sy + 92), "NAS", font=font(HAND, 22), fill=ink)
    d.text((660, sy + 122), "192.168.1.60", font=font(HAND, 20), fill=ink)

    out = add_grain(img, 18)
    out.save(os.path.join(OUT_DIR, "b.png"))
    print("wrote sample-images/b.png")


if __name__ == "__main__":
    os.makedirs(OUT_DIR, exist_ok=True)
    build_label_photo()
    build_handwritten_note()
