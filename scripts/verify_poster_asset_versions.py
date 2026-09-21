#!/usr/bin/env python3
from io import BytesIO
from pathlib import Path
import zipfile


ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / "pre-v1.2/cloudflare-dist-upload-20260915-logo-home-v21-flat.bin"
PAGES = ("ca/cartells/index.html", "es/carteles/index.html", "it/cartelli/index.html")
CSS_VERSION = "/assets/poster-editor.css?v=poster-logo-card-20260921-v2"
JS_VERSION = "/assets/posters.js?v=poster-logo-card-20260921-v2"


with zipfile.ZipFile(BytesIO(bytes(byte ^ 0xA5 for byte in PACKAGE.read_bytes()))) as bundle:
    for page in PAGES:
        html = bundle.read(page).decode()
        assert CSS_VERSION in html, page
        assert JS_VERSION in html, page
        assert "poster-hover-radius-20260902" not in html, page
        assert "/assets/posters.js?v=split-content-sources-v1-20260910&preview=logo-home-click-root-20260915-v20" not in html, page

print("Verified poster CSS/JS cache-busting URLs for CA, ES and IT")
