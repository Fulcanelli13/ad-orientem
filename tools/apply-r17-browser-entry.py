#!/usr/bin/env python3
from pathlib import Path
import sys

path = Path(sys.argv[1] if len(sys.argv) > 1 else "index.html")
text = path.read_text(encoding="utf-8")

required = ["AO_CELEBRATION_API", "AO_SEQUENCE_BRIDGE_V23", "data-ao-start-live"]
missing = [marker for marker in required if marker not in text]
if missing:
    raise SystemExit(
        "R17 browser-entry host contract missing from index.html: " + ", ".join(missing)
    )

tag = '<script type="module" src="./src/mass/browser-entry.js" data-ao-r17-browser-entry></script>'
if tag in text:
    print("R17 browser entry already present; no change")
    raise SystemExit(0)

if "</body>" not in text:
    raise SystemExit("index.html has no </body> marker")

text = text.replace("</body>", tag + "\n</body>", 1)
path.write_text(text, encoding="utf-8")
print("Injected R17 browser entry into index.html")
