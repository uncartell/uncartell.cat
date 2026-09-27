#!/usr/bin/env python3
"""Patch the Pages input artifact with the scoped i18n performance fix."""

from __future__ import annotations

import hashlib
import io
import re
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ARTIFACT = ROOT / "pre-v1.2/cloudflare-dist-upload-20260915-logo-home-v21-flat.bin"
RUNTIME = ROOT / "pre-v1.2/preview-i18n-runtime.js"
XOR_KEY = 0xA5
RUNTIME_VERSION = "i18n-perf-20260927-v3"


def decoded(data: bytes) -> bytes:
    return bytes(value ^ XOR_KEY for value in data)


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def script_pattern(filename: str) -> str:
    return rf'<script\s+src=["\']/assets/i18n/{re.escape(filename)}(?:\?[^"\']*)?["\']\s*></script>'


archive_bytes = decoded(ARTIFACT.read_bytes())
with zipfile.ZipFile(io.BytesIO(archive_bytes), "r") as source:
    infos = source.infolist()
    comment = source.comment
    original = {info.filename: source.read(info.filename) for info in infos}

updated = dict(original)
updated["assets/i18n/preview-runtime.js"] = RUNTIME.read_bytes()

localized_html = {
    name for name in original
    if name.endswith(".html") and name.split("/", 1)[0] in {"ca", "es", "it"}
}
for name in localized_html:
    locale = name.split("/", 1)[0]
    html = updated[name].decode("utf-8")

    # The shared runtime needs the Catalan fallback plus, where applicable,
    # only the active base dictionary.
    for code in ("es", "it"):
        if code != locale:
            html = re.sub(script_pattern(f"{code}.js"), "", html, flags=re.I)

    # Preview catalogues are large generated overlays. Never load an inactive
    # market catalogue on an editor page.
    html = re.sub(script_pattern("preview-es.js"), "", html, flags=re.I)
    html = re.sub(script_pattern("preview-it.js"), "", html, flags=re.I)
    active = "" if locale == "ca" else f'<script src="/assets/i18n/preview-{locale}.js?v={RUNTIME_VERSION}"></script>'
    runtime_pattern = script_pattern("preview-runtime.js")
    html, count = re.subn(
        runtime_pattern,
        active + f'<script src="/assets/i18n/preview-runtime.js?v={RUNTIME_VERSION}"></script>',
        html,
        count=1,
        flags=re.I,
    )
    if count != 1:
        raise SystemExit(f"Expected one preview runtime in {name}; found {count}")
    updated[name] = html.encode("utf-8")

changed = {name for name in original if digest(original[name]) != digest(updated[name])}
allowed = localized_html | {"assets/i18n/preview-runtime.js"}
unexpected = changed - allowed
if unexpected:
    raise SystemExit(f"Unexpected archive changes: {sorted(unexpected)}")

output = io.BytesIO()
with zipfile.ZipFile(output, "w") as target:
    target.comment = comment
    for info in infos:
        target.writestr(info, updated[info.filename])

ARTIFACT.write_bytes(decoded(output.getvalue()))
print(f"Patched runtime and {len(changed) - 1} localized HTML files")
