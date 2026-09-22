#!/usr/bin/env python3
"""Verify metadata and public routing in the Pages input artifact."""

from __future__ import annotations

import io
import re
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ARTIFACT = ROOT / "pre-v1.2/cloudflare-dist-upload-20260915-logo-home-v21-flat.bin"
EXPECTED = {
    "ca/cartes-i-menus/index.html": "Creador de cartes i menús | uncartell.cat",
    "ca/taules-de-preus/index.html": "Creador de taules de preus | uncartell.cat",
    "es/cartas-y-menus/index.html": "Creador de cartas y menús | uncartel.es",
    "es/tablas-de-precios/index.html": "Creador de tablas de precios | uncartel.es",
    "it/menu-e-carte/index.html": "Creatore di menu e carte | uncartello.it",
    "it/listini-prezzi/index.html": "Creatore di listini prezzi | uncartello.it",
}


def extract(pattern: str, text: str, label: str) -> str:
    match = re.search(pattern, text, re.S)
    assert match, f"Missing {label}"
    return match.group(1)


raw = bytes(value ^ 0xA5 for value in ARTIFACT.read_bytes())
with zipfile.ZipFile(io.BytesIO(raw)) as bundle:
    for relative_path, expected_title in EXPECTED.items():
        html = bundle.read(relative_path).decode("utf-8")
        assert extract(r"<title>([^<]+)</title>", html, "title") == expected_title
        assert extract(r'<meta property="og:title" content="([^"]+)">', html, "og:title") == expected_title
        assert extract(r'window\.UNCARTELL_LOCALE\s*=.*?"title":"([^"]+)"', html, "runtime title") == expected_title

    worker = bundle.read("_worker.js").decode("utf-8")
    for marker in (
        "function publicPathWithoutLocalePrefix(pathname, hostname)",
        "function needsPublicTrailingSlash(pathname, hostname)",
        "return Response.redirect(url.toString(), 308);",
    ):
        assert marker in worker, marker

print(f"Verified {len(EXPECTED)} metadata pages and the Pages Worker")
