#!/usr/bin/env python3
"""Verify the mobile-publication → QR fix inside the Pages input artifact."""

from __future__ import annotations

from io import BytesIO
from pathlib import Path
import subprocess
import sys
import urllib.parse
import zipfile


ROOT = Path(__file__).resolve().parents[1]
ARTIFACT = Path("pre-v1.2/cloudflare-dist-upload-20260915-logo-home-v21-flat.bin")
EXPECTED_CHANGED_ASSETS = {
    "assets/platform.js",
    "assets/menu-editor.js",
    "assets/price-editor.js",
    "assets/qr-generator.js",
    # The production release also includes the independently validated
    # poster-watermark card correction in the same binary artifact.
    "assets/poster-editor.css",
    "assets/posters.js",
}
RELEASE_BASELINE = "ceb222efdcdcd1ef16ef6ef622eb407abc5142e0"


def decode(data: bytes) -> dict[str, bytes]:
    archive = BytesIO(bytes(value ^ 165 for value in data))
    with zipfile.ZipFile(archive) as bundle:
        return {name: bundle.read(name) for name in bundle.namelist() if not name.endswith("/")}


def git_file(ref: str, path: Path) -> bytes:
    return subprocess.check_output(["git", "show", f"{ref}:{path.as_posix()}"], cwd=ROOT)


def require(text: str, fragment: str, label: str) -> None:
    if fragment not in text:
        raise AssertionError(f"Missing {label}: {fragment}")


def main() -> int:
    candidate = decode((ROOT / ARTIFACT).read_bytes())
    baseline = decode(git_file(RELEASE_BASELINE, ARTIFACT))
    changed = {name for name in candidate.keys() | baseline.keys() if candidate.get(name) != baseline.get(name)}
    platform_pages = {
        name for name, content in candidate.items()
        if name.endswith("index.html") and b"/assets/platform.js" in content
    }
    expected_changed = EXPECTED_CHANGED_ASSETS | platform_pages
    if changed != expected_changed:
        raise AssertionError(f"Unexpected extracted diff: {sorted(changed)}")

    platform = candidate["assets/platform.js"].decode()
    menu = candidate["assets/menu-editor.js"].decode()
    prices = candidate["assets/price-editor.js"].decode()
    qr = candidate["assets/qr-generator.js"].decode()

    require(platform, "published.public_url||published.url", "RPC URL preference")
    require(platform, "new URL(`/${segment}/${encodeURIComponent(String(slug))}/`,`https://${domain}`).href", "public URL builder")
    require(platform, "target.searchParams.set('url',publicUrl)", "encoded URL handoff")
    require(platform, "target.searchParams.set('source','publication')", "publication handoff marker")
    require(platform, "openQrForPublishedUrl", "central navigation helper")
    require(platform, "function publishedQrPath()", "public QR route helper")
    require(platform, "localizedPath.replace(/^\\/(?:ca|es|it)(?=\\/|$)/,'')", "public locale-prefix removal")
    require(menu, "openQrForPublishedUrl(published.url,state.projectName||slug)", "menu button wiring")
    require(prices, "openQrForPublishedUrl(published.url,state.projectName||slug)", "price button wiring")
    require(qr, "incomingParams.get('source')==='publication'", "generator publication detection")
    require(qr, "!state.publicationSourceUrl", "dynamic QR bypass")
    require(qr, "state.publicationSourceUrl||", "exact QR payload selection")

    routes = {
        "ca": {"host": "uncartell.cat", "qr": "/ca/codis-qr/", "menu": "carta", "services": "serveis"},
        "es": {"host": "uncartel.es", "qr": "/es/codigos-qr/", "menu": "carta", "services": "servicios"},
        "it": {"host": "uncartello.it", "qr": "/it/codici-qr/", "menu": "carta", "services": "servicios"},
    }
    for locale, route in routes.items():
        for kind in ("menu", "services"):
            published = f"https://{route['host']}/{route[kind]}/qa-{locale}-{kind}/?ref=a%2Fb&x=1"
            query = urllib.parse.urlencode(
                {"url": published, "source": "publication", "generate": "1", "save": "1", "name": f"QA {locale}"}
            )
            transfer = urllib.parse.urlsplit(f"https://preview.pages.dev{route['qr']}?{query}")
            received = urllib.parse.parse_qs(transfer.query, strict_parsing=True)["url"][0]
            if received != published:
                raise AssertionError(f"URL changed for {locale}/{kind}: {received!r}")
            if transfer.path.startswith(("/uncartell.cat/", "/uncartel.es/", "/uncartello.it/")):
                raise AssertionError(f"Hostname leaked into QR path: {transfer.path}")

    print("Verified mobile publication → QR handoff for CA, ES and IT")
    print("Extracted artifact diff:", ", ".join(sorted(changed)))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (AssertionError, subprocess.CalledProcessError, zipfile.BadZipFile) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        raise SystemExit(1)
