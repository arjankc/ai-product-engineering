# Sample images (Session 12 Core)

Two non-confidential images for `scripts/extract-image.js` (Lab 12.1):

| File | What it is |
|---|---|
| `a.jpg` | Photo-style shot of the `NetGate Home X2` router's rear label (model, serial, MAC, SSID, IP, power, FCC ID) |
| `b.png` | Handwritten field note about a down office printer, with a small `WAN -> router -> printer/NAS` sketch |

Both are synthetic mock-ups of devices described in `sample-vault/` — no real device, person, or
customer data is depicted, so they are safe to commit. Their exact contents (and the extraction
audit against them) are recorded in `03-Project/Extraction-Notes.md`.

Regenerate them (requires Python with Pillow) if you want to tweak the wording or layout:

```bash
python scripts/make-sample-images.py
```

Run extraction:

```bash
node scripts/extract-image.js
# or
node scripts/extract-image.js ./sample-images/a.jpg
```

Do not commit personal documents. The zip students download may be empty except this README.
