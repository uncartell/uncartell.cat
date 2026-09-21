#!/usr/bin/env python3
from pathlib import Path
import tempfile
import zipfile


ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / "pre-v1.2/cloudflare-dist-upload-20260915-logo-home-v21-flat.bin"


def decode_package(target: Path) -> None:
    archive = target / "build.zip"
    archive.write_bytes(bytes(byte ^ 0xA5 for byte in PACKAGE.read_bytes()))
    with zipfile.ZipFile(archive) as bundle:
        bundle.extractall(target / "dist")


with tempfile.TemporaryDirectory(prefix="poster-watermark-card-") as directory:
    target = Path(directory)
    decode_package(target)
    posters = (target / "dist/assets/posters.js").read_text()
    styles = (target / "dist/assets/poster-editor.css").read_text()

    assert "footerEditor.hidden=false" in posters
    assert "footerText.disabled=!footerUnlocked" in posters
    assert "footerClear.disabled=!footerUnlocked" in posters
    assert "poster-footer-style-card" in posters
    assert "Edita o elimina el text que apareix al peu." in posters
    assert ".poster-footer-style-card.is-locked .footer-style-editor{opacity:.42;pointer-events:none}" in styles
    assert ".poster-footer-style-card.is-locked::after{display:none!important;content:none!important}" in styles
    assert "backdrop-filter:none!important" in styles

print("Verified readable poster watermark card and preserved Ultra restriction")
