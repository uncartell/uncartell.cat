#!/usr/bin/env python3
from io import BytesIO
from pathlib import Path
import zipfile


ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / "pre-v1.2/cloudflare-dist-upload-20260915-logo-home-v21-flat.bin"


with zipfile.ZipFile(BytesIO(bytes(byte ^ 0xA5 for byte in PACKAGE.read_bytes()))) as bundle:
    posters = bundle.read("assets/posters.js").decode()
    styles = bundle.read("assets/poster-editor.css").decode()

assert 'class="poster-logo-head"' in posters
assert 'class="poster-logo-controls"' in posters
assert "q('[data-kit-logo]').disabled=!footerUnlocked" in posters
assert "q('[data-remove-kit-logo]').disabled=!footerUnlocked" in posters
assert "logoTool?.setAttribute('aria-disabled',footerUnlocked?'false':'true')" in posters
assert ".poster-logo-tool{position:relative;min-width:0;overflow:hidden;border:1px solid" in styles
assert ".poster-logo-badge{position:static;margin-left:auto}" in styles
assert ".poster-logo-tool.is-locked .poster-logo-controls{opacity:.42;pointer-events:none}" in styles
assert "grid-template-columns:repeat(3,minmax(0,1fr))" in styles

print("Verified boxed poster logo module with integrated Ultra badge")
