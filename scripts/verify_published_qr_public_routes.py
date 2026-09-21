#!/usr/bin/env python3
from io import BytesIO
from pathlib import Path
import zipfile


ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / "pre-v1.2/cloudflare-dist-upload-20260915-logo-home-v21-flat.bin"
VERSION = "/assets/platform.js?v=published-qr-public-route-20260921-v1"
PAGES = (
    "ca/cartes-i-menus/index.html",
    "ca/taules-de-preus/index.html",
    "es/cartas-y-menus/index.html",
    "es/tablas-de-precios/index.html",
    "it/menu-e-carte/index.html",
    "it/listini-prezzi/index.html",
)
PUBLIC_ROUTES = {
    "ca": "/codis-qr/",
    "es": "/codigos-qr/",
    "it": "/codici-qr/",
}


with zipfile.ZipFile(BytesIO(bytes(byte ^ 0xA5 for byte in PACKAGE.read_bytes()))) as bundle:
    platform = bundle.read("assets/platform.js").decode()
    assert "function publishedQrPath()" in platform
    assert "localizedPath.replace(/^\\/(?:ca|es|it)(?=\\/|$)/,'')" in platform
    assert "new URL(publishedQrPath(),location.origin)" in platform
    for page in PAGES:
        assert VERSION in bundle.read(page).decode(), page

for locale, route in PUBLIC_ROUTES.items():
    assert not route.startswith(f"/{locale}/"), (locale, route)

print("Verified public QR routes and fresh platform.js on all six publishing pages")
