#!/usr/bin/env python3
"""Apply the verified invisible SEO patch to the Pages input artifact.

Cloudflare's configured build decodes this XOR-obfuscated ZIP.  The historical
source rebuild is currently incomplete, so this script deliberately changes
only the six localized HTML entries and the Worker while preserving every
other archive entry byte-for-byte after extraction.
"""

from __future__ import annotations

import hashlib
import io
import re
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ARTIFACT = ROOT / "pre-v1.2/cloudflare-dist-upload-20260915-logo-home-v21-flat.bin"
XOR_KEY = 0xA5
EXPECTED_TITLES = {
    "ca/cartes-i-menus/index.html": "Creador de cartes i menús | uncartell.cat",
    "ca/taules-de-preus/index.html": "Creador de taules de preus | uncartell.cat",
    "es/cartas-y-menus/index.html": "Creador de cartas y menús | uncartel.es",
    "es/tablas-de-precios/index.html": "Creador de tablas de precios | uncartel.es",
    "it/menu-e-carte/index.html": "Creatore di menu e carte | uncartello.it",
    "it/listini-prezzi/index.html": "Creatore di listini prezzi | uncartello.it",
}
ALLOWED_CHANGES = set(EXPECTED_TITLES) | {"_worker.js"}


def decoded(data: bytes) -> bytes:
    return bytes(value ^ XOR_KEY for value in data)


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def replace_once(pattern: str, replacement: str, text: str, label: str) -> str:
    updated, count = re.subn(pattern, replacement, text, count=1, flags=re.I | re.S)
    if count != 1:
        raise SystemExit(f"Expected exactly one {label}; found {count}")
    return updated


archive_bytes = decoded(ARTIFACT.read_bytes())
with zipfile.ZipFile(io.BytesIO(archive_bytes), "r") as source:
    infos = source.infolist()
    comment = source.comment
    original = {info.filename: source.read(info.filename) for info in infos}

updated = dict(original)
for relative_path, expected_title in EXPECTED_TITLES.items():
    html = updated[relative_path].decode("utf-8")
    html = replace_once(r"<title>.*?</title>", f"<title>{expected_title}</title>", html, f"title in {relative_path}")
    html = replace_once(
        r'(<meta\s+property=["\']og:title["\']\s+content=["\'])[^"\']*(["\'])',
        rf"\g<1>{expected_title}\g<2>",
        html,
        f"og:title in {relative_path}",
    )
    html = replace_once(
        r'(window\.UNCARTELL_LOCALE\s*=\s*\{.*?"title":")[^"]*(")',
        rf"\g<1>{expected_title}\g<2>",
        html,
        f"runtime title in {relative_path}",
    )
    updated[relative_path] = html.encode("utf-8")

updated["_worker.js"] = (ROOT / "_worker.js").read_bytes()
changed = {name for name in original if digest(original[name]) != digest(updated[name])}
if changed != ALLOWED_CHANGES:
    raise SystemExit(f"Unexpected archive changes: {sorted(changed ^ ALLOWED_CHANGES)}")

output = io.BytesIO()
with zipfile.ZipFile(output, "w") as target:
    target.comment = comment
    for info in infos:
        target.writestr(info, updated[info.filename])

ARTIFACT.write_bytes(decoded(output.getvalue()))
print("Patched Pages artifact entries:")
for name in sorted(changed):
    print(f"  {name}")
