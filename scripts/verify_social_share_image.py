#!/usr/bin/env python3
"""Verify social image bytes and metadata in the publishable artifact."""

from __future__ import annotations

import io
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ARTIFACT = ROOT / "pre-v1.2/cloudflare-dist-upload-20260915-logo-home-v21-flat.bin"
IMAGE = ROOT / "pre-v1.2/current-source/og-uncartell-collage-20260927.jpg"
IMAGE_NAME = "og-uncartell-collage-20260927.jpg"
DOMAINS = {"ca": "uncartell.cat", "es": "uncartel.es", "it": "uncartello.it"}


raw = bytes(value ^ 0xA5 for value in ARTIFACT.read_bytes())
with zipfile.ZipFile(io.BytesIO(raw)) as bundle:
    assert bundle.read(IMAGE_NAME) == IMAGE.read_bytes()
    checked = 0
    for name in bundle.namelist():
        locale = name.split("/", 1)[0]
        if locale not in DOMAINS or not name.endswith(".html"):
            continue
        html = bundle.read(name).decode("utf-8")
        image_url = f"https://{DOMAINS[locale]}/{IMAGE_NAME}"
        assert f'<meta property="og:image" content="{image_url}">' in html
        assert '<meta property="og:image:type" content="image/jpeg">' in html
        assert '<meta property="og:image:width" content="1448">' in html
        assert '<meta property="og:image:height" content="1086">' in html
        assert f'<meta name="twitter:image" content="{image_url}">' in html
        checked += 1

assert checked >= 30, checked
print(f"Verified social preview image metadata on {checked} localized HTML pages")
