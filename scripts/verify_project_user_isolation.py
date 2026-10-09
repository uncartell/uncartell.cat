#!/usr/bin/env python3
"""Verify that browser project caches cannot migrate across accounts."""

import io
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SOURCES = (
    ROOT / "assets/platform.js",
    ROOT / "pre-v1.2/current-source/assets/platform.js",
)

for source in SOURCES:
    text = source.read_text()
    start = text.index("async function syncProjectStore")
    end = text.index("window.addEventListener('uncartell:auth-change'", start)
    sync = text[start:end]

    assert "const cloud=await listUserProjects(toolType)" in sync, source
    assert "localStorage.setItem(storageKey,JSON.stringify(scoped))" in sync, source
    assert "saveUserProject(toolType,project)" not in sync, source
    assert "localOnly" not in sync, source
    assert "cloudIds" not in sync, source
    assert "projectStoreOwnerKey=storageKey=>`${storageKey}:owner`" in text, source
    assert "if(localStorage.getItem(ownerKey)!==storeOwner)localStorage.removeItem(storageKey)" in text, source
    assert "projectStores.forEach(clearProjectStore)" in text, source

print("Verified account-isolated project cache sync and logout cleanup")

artifact = ROOT / "pre-v1.2/cloudflare-dist-upload-20260915-logo-home-v21-flat.bin"
raw = bytes(value ^ 0xA5 for value in artifact.read_bytes())
with zipfile.ZipFile(io.BytesIO(raw)) as bundle:
    deployed = bundle.read("assets/platform.js").decode()
start = deployed.index("async function syncProjectStore")
end = deployed.index("window.addEventListener('uncartell:auth-change'", start)
sync = deployed[start:end]
assert "localStorage.setItem(storageKey,JSON.stringify(scoped))" in sync
assert "saveUserProject(toolType,project)" not in sync
assert "localOnly" not in sync
assert "cloudIds" not in sync
assert "projectStoreOwnerKey=storageKey=>`${storageKey}:owner`" in deployed
assert "if(localStorage.getItem(ownerKey)!==storeOwner)localStorage.removeItem(storageKey)" in deployed
assert "projectStores.forEach(clearProjectStore)" in deployed
print("Verified isolated project cache in the Pages artifact")

for source in (
    ROOT / "assets/qr-generator.js",
    ROOT / "pre-v1.2/current-source/assets/qr-generator.js",
):
    text = source.read_text()
    assert "history.replaceState(null,'',`${location.pathname}${location.hash}`)" in text, source

with zipfile.ZipFile(io.BytesIO(raw)) as bundle:
    qr = bundle.read("assets/qr-generator.js").decode()
assert "history.replaceState(null,'',`${location.pathname}${location.hash}`)" in qr
print("Verified one-shot QR publication hand-off in sources and Pages artifact")
