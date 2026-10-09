#!/usr/bin/env python3
"""Replace only platform.js in the encoded Pages artifact.

The historical source tree cannot currently produce a clean full rebuild.  The
Cloudflare input is an XOR-obfuscated ZIP, so keep every archive entry intact
and replace the one reviewed runtime asset from current-source.
"""

from __future__ import annotations

import hashlib
import io
import re
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ARTIFACT = ROOT / "pre-v1.2/cloudflare-dist-upload-20260915-logo-home-v21-flat.bin"
ENTRY = "assets/platform.js"
XOR_KEY = 0xA5


def decoded(data: bytes) -> bytes:
    return bytes(value ^ XOR_KEY for value in data)


raw = decoded(ARTIFACT.read_bytes())
with zipfile.ZipFile(io.BytesIO(raw), "r") as source_zip:
    infos = source_zip.infolist()
    comment = source_zip.comment
    files = {info.filename: source_zip.read(info.filename) for info in infos}

before = files[ENTRY]
text = before.decode("utf-8")
text, logout_count = re.subn(
    r"if\(event==='SIGNED_OUT'\)\{currentUser=",
    "if(event==='SIGNED_OUT'){projectStores.forEach(storageKey=>localStorage.removeItem(storageKey));currentUser=",
    text,
    count=1,
)
if logout_count != 1:
    raise SystemExit(f"Expected one logout cache hook; found {logout_count}")

sync_pattern = re.compile(
    r"    const cloud=await listUserProjects\(toolType\);.*?"
    r"  window\.addEventListener\('uncartell:auth-change',event=>\{if\(event\.detail\?\.user\)"
    r"projectStores\.forEach\(\(key,type\)=>syncProjectStore\(type,key\)\.catch\(console\.error\)\)\}\);",
    re.S,
)
sync_replacement = """    const cloud=await listUserProjects(toolType);
    // This historical key is shared by every account using the browser. It is
    // only a disposable rendering cache: never merge or upload its contents
    // when another account signs in. Supabase/RLS is the source of truth.
    const scoped=[...cloud].sort((a,b)=>new Date(b.updated_at||b.savedAt||0)-new Date(a.updated_at||a.savedAt||0));
    localStorage.setItem(storageKey,JSON.stringify(scoped));
    window.dispatchEvent(new CustomEvent('uncartell:projects-synced',{detail:{toolType,projects:scoped}}));return scoped;
  }
  window.addEventListener('uncartell:auth-change',event=>{if(event.detail?.user)projectStores.forEach((key,type)=>syncProjectStore(type,key).catch(console.error));else projectStores.forEach(key=>localStorage.removeItem(key))});"""
text, sync_count = sync_pattern.subn(sync_replacement, text, count=1)
if sync_count != 1:
    raise SystemExit(f"Expected one unsafe sync block; found {sync_count}")
after = text.encode("utf-8")

required = (
    "const cloud=await listUserProjects(toolType)",
    "localStorage.setItem(storageKey,JSON.stringify(scoped))",
    "projectStores.forEach(storageKey=>localStorage.removeItem(storageKey))",
)
for marker in required:
    if marker.encode() not in after:
        raise SystemExit(f"Missing isolation marker: {marker}")
sync = after[after.index(b"async function syncProjectStore"):after.index(b"window.addEventListener('uncartell:auth-change'", after.index(b"async function syncProjectStore"))]
for forbidden in (b"const localOnly=", b"saveUserProject(toolType,project)"):
    if forbidden in sync:
        raise SystemExit(f"Unsafe cross-account migration remains: {forbidden.decode()}")

files[ENTRY] = after
output = io.BytesIO()
with zipfile.ZipFile(output, "w") as target:
    target.comment = comment
    for info in infos:
        target.writestr(info, files[info.filename])

ARTIFACT.write_bytes(decoded(output.getvalue()))
print(f"Patched only {ENTRY}")
print(f"before sha256: {hashlib.sha256(before).hexdigest()}")
print(f"after  sha256: {hashlib.sha256(after).hexdigest()}")
