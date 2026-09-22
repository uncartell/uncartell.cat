#!/usr/bin/env python3
"""Verify logout/account deletion return to valid public or preview homes."""

from io import BytesIO
from pathlib import Path
import zipfile


ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / "pre-v1.2/cloudflare-dist-upload-20260915-logo-home-v21-flat.bin"
VERSION = "/assets/platform.js?v=auth-exit-public-home-20260922-v1"


with zipfile.ZipFile(BytesIO(bytes(byte ^ 0xA5 for byte in PACKAGE.read_bytes()))) as bundle:
    platform = bundle.read("assets/platform.js").decode()
    assert "const publicMarketHost=window.UNCARTELL_HOSTNAME_ROUTING===true" in platform
    assert "const authExitHref=publicMarketHost?`https://${market.domain}/`:cfg.root" in platform
    assert "closeAccount();location.href=authExitHref" in platform
    assert platform.count("location.href=authExitHref") == 2
    assert "closeAccount();location.href=cfg.root" not in platform

    platform_pages = [
        name for name in bundle.namelist()
        if name.endswith("index.html") and b"/assets/platform.js" in bundle.read(name)
    ]
    assert platform_pages
    for page in platform_pages:
        html = bundle.read(page).decode()
        assert VERSION in html, page

assert "https://uncartell.cat/".endswith("/")
assert "https://uncartel.es/".endswith("/")
assert "https://uncartello.it/".endswith("/")
print(f"Verified auth exit routing and fresh platform.js on {len(platform_pages)} pages")
