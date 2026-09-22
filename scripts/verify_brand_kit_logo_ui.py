#!/usr/bin/env python3
"""Verify the poster brand-kit and document logo UI regression fixes."""

from io import BytesIO
from pathlib import Path
import zipfile


ROOT = Path(__file__).resolve().parents[1]
PACKAGE = ROOT / "pre-v1.2/cloudflare-dist-upload-20260915-logo-home-v21-flat.bin"
TOOL_VERSION = "/assets/editor-tool-rail.js?v=brand-kit-logo-ui-20260922-v1"
POSTER_VERSION = "/assets/poster-editor.css?v=brand-kit-logo-ui-20260922-v1"
MENU_VERSION = "/assets/menu-editor.js?v=brand-kit-logo-ui-20260922-v2"
PRICE_VERSION = "/assets/price-editor.js?v=brand-kit-logo-ui-20260922-v2"
EDITOR_PAGES = (
    "ca/cartells/index.html",
    "ca/cartes-i-menus/index.html",
    "ca/taules-de-preus/index.html",
    "es/carteles/index.html",
    "es/cartas-y-menus/index.html",
    "es/tablas-de-precios/index.html",
    "it/cartelli/index.html",
    "it/menu-e-carte/index.html",
    "it/listini-prezzi/index.html",
)
POSTER_PAGES = (
    "ca/cartells/index.html",
    "es/carteles/index.html",
    "it/cartelli/index.html",
)


with zipfile.ZipFile(BytesIO(bytes(byte ^ 0xA5 for byte in PACKAGE.read_bytes()))) as bundle:
    styles = bundle.read("assets/poster-editor.css").decode()
    tool_rail = bundle.read("assets/editor-tool-rail.js").decode()
    menu_editor = bundle.read("assets/menu-editor.js").decode()

    assert ".poster-kit-body input[type=file]{position:absolute" in styles
    assert ".poster-kit-body input{position:absolute" not in styles
    assert ".poster-logo-tool:not(.is-locked) .poster-logo-badge{display:none!important}" in styles
    assert "if (addedControl) moveLogoControl(addedControl);" in tool_rail
    assert "logoHost.replaceChildren();" not in tool_rail
    assert "function logoInspector(page)" in menu_editor
    assert 'box.innerHTML = `<p class="empty-inspector">${L.inspector.empty}</p>${logoInspector(page)}`' in menu_editor
    assert 'menu.innerHTML = `${brandLogoMarkup(page)}${blocksLayout(page)}' in menu_editor

    price_editor = bundle.read("assets/price-editor.js").decode()
    assert 'box.innerHTML = `<p class="empty-inspector">${L.inspector.empty}</p>${logoInspector(page)}`' in price_editor
    assert '${priceHeader}${brandLogoMarkup(page)}${blocksLayout(page)}' in price_editor

    for page in EDITOR_PAGES:
        assert TOOL_VERSION in bundle.read(page).decode(), page
    for page in POSTER_PAGES:
        assert POSTER_VERSION in bundle.read(page).decode(), page
    for page in EDITOR_PAGES:
        html = bundle.read(page).decode()
        if "cartes-i-menus" in page or "cartas-y-menus" in page or "menu-e-carte" in page:
            assert MENU_VERSION in html, page
        if "taules-de-preus" in page or "tablas-de-precios" in page or "listini-prezzi" in page:
            assert PRICE_VERSION in html, page

print("Verified brand-kit colors, persistent document logo controls and Ultra badge visibility")
