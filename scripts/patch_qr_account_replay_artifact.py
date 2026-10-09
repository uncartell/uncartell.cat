#!/usr/bin/env python3
"""Replace only the reviewed account-isolation assets in the Pages artifact."""

from __future__ import annotations

import hashlib
import io
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ARTIFACT = ROOT / "pre-v1.2/cloudflare-dist-upload-20260915-logo-home-v21-flat.bin"
SOURCE = ROOT / "pre-v1.2/current-source"
ENTRIES = ("assets/platform.js", "assets/qr-generator.js")
XOR_KEY = 0xA5


def xor(data: bytes) -> bytes:
    return bytes(value ^ XOR_KEY for value in data)


raw = xor(ARTIFACT.read_bytes())
with zipfile.ZipFile(io.BytesIO(raw), "r") as source_zip:
    infos = source_zip.infolist()
    comment = source_zip.comment
    files = {info.filename: source_zip.read(info.filename) for info in infos}

for entry in ENTRIES:
    before = files[entry]
    after = (SOURCE / entry).read_bytes()
    files[entry] = after
    print(f"{entry}: {hashlib.sha256(before).hexdigest()} -> {hashlib.sha256(after).hexdigest()}")

output = io.BytesIO()
with zipfile.ZipFile(output, "w") as target:
    target.comment = comment
    for info in infos:
        target.writestr(info, files[info.filename])

ARTIFACT.write_bytes(xor(output.getvalue()))
print("Patched only: " + ", ".join(ENTRIES))
