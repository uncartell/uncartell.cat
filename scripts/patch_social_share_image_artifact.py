#!/usr/bin/env python3
"""Add the approved social preview image and metadata to the Pages artifact."""

from __future__ import annotations

import io
import re
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ARTIFACT = ROOT / "pre-v1.2/cloudflare-dist-upload-20260915-logo-home-v21-flat.bin"
IMAGE = ROOT / "pre-v1.2/current-source/og-uncartell-collage-20260927.jpg"
IMAGE_NAME = "og-uncartell-collage-20260927.jpg"
XOR_KEY = 0xA5
DOMAINS = {"ca": "uncartell.cat", "es": "uncartel.es", "it": "uncartello.it"}
ALT = {
    "ca": "Cartells personalitzables impresos sobre una taula de fusta",
    "es": "Carteles personalizables impresos sobre una mesa de madera",
    "it": "Cartelli personalizzabili stampati su un tavolo di legno",
}


def decoded(data: bytes) -> bytes:
    return bytes(value ^ XOR_KEY for value in data)


def upsert_meta(html: str, attribute: str, key: str, value: str, anchor: str) -> str:
    pattern = rf'<meta\s+{attribute}=["\']{re.escape(key)}["\']\s+content=["\'].*?["\']\s*/?>'
    tag = f'<meta {attribute}="{key}" content="{value}">'
    if re.search(pattern, html, re.I):
        return re.sub(pattern, tag, html, count=1, flags=re.I)
    return html.replace(anchor, anchor + tag, 1)


raw = decoded(ARTIFACT.read_bytes())
with zipfile.ZipFile(io.BytesIO(raw), "r") as source:
    infos = source.infolist()
    comment = source.comment
    files = {info.filename: source.read(info.filename) for info in infos}

files[IMAGE_NAME] = IMAGE.read_bytes()
pages = 0
for name, data in list(files.items()):
    locale = name.split("/", 1)[0]
    if locale not in DOMAINS or not name.endswith(".html"):
        continue
    html = data.decode("utf-8")
    image_url = f"https://{DOMAINS[locale]}/{IMAGE_NAME}"
    old_pattern = r'<meta\s+property=["\']og:image["\']\s+content=["\'].*?["\']\s*/?>'
    image_tag = f'<meta property="og:image" content="{image_url}">'
    html, count = re.subn(old_pattern, image_tag, html, count=1, flags=re.I)
    if count != 1:
        raise SystemExit(f"Expected one og:image in {name}; found {count}")
    for key, value in (
        ("og:image:type", "image/jpeg"),
        ("og:image:width", "1448"),
        ("og:image:height", "1086"),
        ("og:image:alt", ALT[locale]),
    ):
        html = upsert_meta(html, "property", key, value, image_tag)
    html = upsert_meta(html, "name", "twitter:image", image_url, image_tag)
    html = upsert_meta(html, "name", "twitter:image:alt", ALT[locale], image_tag)
    files[name] = html.encode("utf-8")
    pages += 1

output = io.BytesIO()
with zipfile.ZipFile(output, "w") as target:
    target.comment = comment
    for info in infos:
        target.writestr(info, files[info.filename])
    target.writestr(IMAGE_NAME, files[IMAGE_NAME])

ARTIFACT.write_bytes(decoded(output.getvalue()))
print(f"Added {IMAGE_NAME} and updated {pages} localized HTML pages")
