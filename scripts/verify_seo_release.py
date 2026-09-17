#!/usr/bin/env python3
"""Verify the SEO metadata and routing patch inside the Pages input artifact."""

from __future__ import annotations

import re
import tempfile
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
    match = re.search(pattern, text)
    assert match, f"Missing {label}"
    return match.group(1)


with tempfile.TemporaryDirectory(prefix="uncartell-seo-release-") as temp_dir:
    temp = Path(temp_dir)
    archive = temp / "artifact.zip"
    archive.write_bytes(bytes(byte ^ 165 for byte in ARTIFACT.read_bytes()))
    with zipfile.ZipFile(archive) as package:
        package.extractall(temp / "dist")

    dist = temp / "dist"
    for relative_path, expected_title in EXPECTED.items():
        html = (dist / relative_path).read_text(encoding="utf-8")
        title = extract(r"<title>([^<]+)</title>", html, f"title in {relative_path}")
        og_title = extract(
            r'<meta property="og:title" content="([^"]+)">',
            html,
            f"og:title in {relative_path}",
        )
        runtime_title = extract(
            r'window\.UNCARTELL_LOCALE\s*=.*?"title":"([^"]+)"',
            html,
            f"runtime title in {relative_path}",
        )
        assert title == expected_title, (relative_path, "title", title)
        assert og_title == expected_title, (relative_path, "og:title", og_title)
        assert runtime_title == expected_title, (relative_path, "runtime title", runtime_title)

    worker = (dist / "_worker.js").read_text(encoding="utf-8")
    assert "function needsPublicTrailingSlash(pathname, hostname)" in worker
    assert "url.pathname = `${url.pathname}/`;" in worker
    assert "return Response.redirect(url.toString(), 308);" in worker

print(f"Verified {len(EXPECTED)} metadata pages and the Pages Worker in {ARTIFACT.name}")
