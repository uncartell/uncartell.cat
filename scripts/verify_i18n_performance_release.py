#!/usr/bin/env python3
"""Verify the i18n runtime and per-market dictionary loading in the artifact."""

from __future__ import annotations

import io
import re
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ARTIFACT = ROOT / "pre-v1.2/cloudflare-dist-upload-20260915-logo-home-v21-flat.bin"
RUNTIME = ROOT / "pre-v1.2/preview-i18n-runtime.js"


raw = bytes(value ^ 0xA5 for value in ARTIFACT.read_bytes())
with zipfile.ZipFile(io.BytesIO(raw)) as bundle:
    assert bundle.read("assets/i18n/preview-runtime.js") == RUNTIME.read_bytes()
    runtime = RUNTIME.read_text()
    assert "textState = new WeakMap()" in runtime
    assert "current === previous.output" in runtime
    assert '[contenteditable="true"]' in runtime
    assert "setTimeout(run" not in runtime
    assert "requestAnimationFrame(run" not in runtime

    pages_checked = 0
    for name in bundle.namelist():
        locale = name.split("/", 1)[0]
        if locale not in {"ca", "es", "it"} or not name.endswith(".html"):
            continue
        html = bundle.read(name).decode("utf-8")
        preview_scripts = re.findall(r'/assets/i18n/preview-(es|it)\.js', html)
        expected_preview = [] if locale == "ca" else [locale]
        assert preview_scripts == expected_preview, (name, preview_scripts)
        assert "/assets/i18n/ca.js" in html
        for code in ("es", "it"):
            present = f"/assets/i18n/{code}.js" in html
            assert present is (code == locale), (name, code, present)
        assert html.count("/assets/i18n/preview-runtime.js") == 1
        pages_checked += 1

assert pages_checked >= 30, pages_checked
print(f"Verified optimized i18n runtime and dictionary loading on {pages_checked} pages")
