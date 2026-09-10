from pathlib import Path
import shutil
import subprocess
import re
from html import escape

ROOT = Path(__file__).resolve().parent
PREVIEW = ROOT / "localized-preview"
OUT = ROOT / "cloudflare-dist"

PUBLIC_ROOT_FILES = (
    "404.html", "apple-touch-icon.png", "favicon.ico", "favicon.svg",
    "favicon-96x96.png", "manifest-taller.jpg", "marti-ruiz.jpg",
    "og-uncartell-cat.jpg", "profile-ca.png", "profile-es.png",
    "site.webmanifest", "web-app-manifest-192x192.png",
    "web-app-manifest-512x512.png",
)

DOMAINS = {"ca": "uncartell.cat", "es": "uncartel.es", "it": "uncartello.it"}
OG_LOCALES = {"ca": "ca_ES", "es": "es_ES", "it": "it_IT"}
META_DESCRIPTIONS = {
    "es": "Crea, personaliza y descarga carteles, cartas, menús, tarifas y códigos QR con un diseño claro y profesional.",
    "it": "Crea, personalizza e scarica cartelli, menu, listini prezzi e codici QR con un design chiaro e professionale.",
}
ROUTES = {
    "ca": {"": "", "cartells": "cartells", "cartes-i-menus": "cartes-i-menus", "taules-de-preus": "taules-de-preus", "codis-qr": "codis-qr", "plans": "plans", "ultra": "ultra", "faqs": "faqs", "manifest": "manifest", "contacte": "contacte", "legal": "legal", "privacitat": "privacitat", "cookies": "cookies", "admin": "admin"},
    "es": {"": "", "cartells": "carteles", "cartes-i-menus": "cartas-y-menus", "taules-de-preus": "tablas-de-precios", "codis-qr": "codigos-qr", "plans": "planes", "ultra": "ultra", "faqs": "preguntas-frecuentes", "manifest": "manifiesto", "contacte": "contacto", "legal": "aviso-legal", "privacitat": "privacidad", "cookies": "cookies", "admin": "admin"},
    "it": {"": "", "cartells": "cartelli", "cartes-i-menus": "menu-e-carte", "taules-de-preus": "listini-prezzi", "codis-qr": "codici-qr", "plans": "piani", "ultra": "ultra", "faqs": "domande-frequenti", "manifest": "manifesto", "contacte": "contatti", "legal": "note-legali", "privacitat": "privacy", "cookies": "cookie", "admin": "admin"},
}

def public_url(locale, ca_slug):
    slug = ROUTES[locale][ca_slug]
    return f"https://{DOMAINS[locale]}/{slug + '/' if slug else ''}"

def replace_meta(content, attribute, key, value):
    pattern = rf'(<meta\s+{attribute}=["\']{re.escape(key)}["\']\s+content=["\'])(.*?)(["\'])'
    return re.sub(pattern, lambda match: match.group(1) + value + match.group(3), content, count=1, flags=re.I)

def prepare_metadata(content, locale, ca_slug):
    """Make the generated locale document self-consistent before first paint."""
    canonical = public_url(locale, ca_slug)
    title = re.search(r'<title>(.*?)</title>', content, re.I | re.S)
    description = re.search(r'<meta\s+name=["\']description["\']\s+content=["\'](.*?)["\']', content, re.I | re.S)
    localized_title = title.group(1).strip() if title else ""
    localized_description = META_DESCRIPTIONS.get(locale, description.group(1).strip() if description else "")
    content = replace_meta(content, "name", "description", localized_description)
    content = re.sub(r'<link\s+rel=["\']canonical["\'][^>]*>', f'<link rel="canonical" href="{canonical}">', content, count=1, flags=re.I)
    content = re.sub(r'<link\s+rel=["\']alternate["\'][^>]*>', '', content, flags=re.I)
    alternates = ''.join(
        f'<link rel="alternate" hreflang="{code}" href="{public_url(code, ca_slug)}">'
        for code in ("ca", "es", "it")
    ) + f'<link rel="alternate" hreflang="x-default" href="{public_url("ca", ca_slug)}">'
    content = content.replace(f'<link rel="canonical" href="{canonical}">', f'<link rel="canonical" href="{canonical}">{alternates}', 1)
    content = replace_meta(content, "property", "og:locale", OG_LOCALES[locale])
    content = replace_meta(content, "property", "og:title", localized_title)
    content = replace_meta(content, "property", "og:description", localized_description)
    content = replace_meta(content, "property", "og:url", canonical)
    content = replace_meta(content, "property", "og:image", f"https://{DOMAINS[locale]}/og-uncartell-cat.jpg")
    # CA and ES are active public market domains. IT remains private until its
    # explicit launch checkpoint; Pages preview hosts are also blocked below.
    robots = "index,follow,max-image-preview:large" if locale in {"ca", "es"} else "noindex,nofollow"
    content = re.sub(
        r'<meta\s+name=["\']robots["\']\s+content=["\'].*?["\']\s*/?>',
        f'<meta name="robots" content="{robots}">', content, count=1, flags=re.I,
    )
    return content

subprocess.run(["python3", str(ROOT / "build-localized-preview.py")], check=True)

if OUT.exists():
    shutil.rmtree(OUT)
OUT.mkdir()

for name in ("assets", "ca", "es", "it", "qr"):
    shutil.copytree(PREVIEW / name, OUT / name)

for name in PUBLIC_ROOT_FILES:
    source = PREVIEW / name
    if source.exists():
        shutil.copy2(source, OUT / name)

# Hostname mode is opt-in so localhost continues to switch with /ca, /es and /it.
for locale in ("ca", "es", "it"):
    inverse_routes = {localized: source for source, localized in ROUTES[locale].items()}
    for html in (OUT / locale).rglob("*.html"):
        content = html.read_text(errors="ignore")
        relative_parent = html.parent.relative_to(OUT / locale).as_posix()
        localized_slug = "" if relative_parent == "." else relative_parent
        content = prepare_metadata(content, locale, inverse_routes[localized_slug])
        marker = '<script>window.UNCARTELL_HOSTNAME_ROUTING=true;</script>'
        content = content.replace("</head>", marker + "</head>", 1)
        html.write_text(content)

# Generate clean sitemaps for the active market domains and exclude
# admin/account surfaces.
sitemap_excluded = {"admin", "ultra"}
for locale in ("ca", "es"):
    sitemap_urls = [
        public_url(locale, ca_slug)
        for ca_slug in ROUTES[locale]
        if ca_slug not in sitemap_excluded
    ]
    sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n'
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    sitemap += ''.join(f'  <url><loc>{escape(url)}</loc></url>\n' for url in sitemap_urls)
    sitemap += '</urlset>\n'
    (OUT / locale / "sitemap.xml").write_text(sitemap)

(OUT / "robots.txt").write_text("User-agent: *\nDisallow: /\n")
(OUT / "_headers").write_text(
    "/*\n"
    "  X-Content-Type-Options: nosniff\n"
    "  Referrer-Policy: strict-origin-when-cross-origin\n"
)

worker = r'''const HOST_LOCALE = {
  "uncartell.cat": "ca",
  "www.uncartell.cat": "ca",
  "uncartel.es": "es",
  "www.uncartel.es": "es",
  "uncartello.it": "it",
  "www.uncartello.it": "it"
};

const STATIC_PREFIXES = ["/assets/", "/qr/"];
const STATIC_FILES = new Set([
  "/favicon.ico", "/favicon.svg", "/favicon-96x96.png",
  "/apple-touch-icon.png", "/site.webmanifest",
  "/web-app-manifest-192x192.png", "/web-app-manifest-512x512.png",
  "/manifest-taller.jpg", "/marti-ruiz.jpg", "/og-uncartell-cat.jpg",
  "/profile-ca.png", "/profile-es.png"
]);

function isPagesPreview(hostname) {
  return hostname === "uncartell-cat.pages.dev" || hostname.endsWith(".uncartell-cat.pages.dev");
}

function localePath(pathname, hostname) {
  const preview = isPagesPreview(hostname);
  if (STATIC_PREFIXES.some(prefix => pathname.startsWith(prefix)) || STATIC_FILES.has(pathname)) {
    return { pathname, preview };
  }
  if (pathname === "/robots.txt") return { pathname, preview };

  let locale = HOST_LOCALE[hostname];
  let clean = pathname;
  if (preview) {
    const match = pathname.match(/^\/(ca|es|it)(?=\/|$)(.*)$/);
    locale = match ? match[1] : "ca";
    clean = match ? (match[2] || "/") : pathname;
  } else if (!locale) {
    locale = "ca";
  }

  if (!preview && /^\/(ca|es|it)(?=\/|$)/.test(pathname)) return { blocked: true, preview };
  if (!clean.startsWith("/")) clean = `/${clean}`;
  return { pathname: `/${locale}${clean}`, preview };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const route = localePath(url.pathname, url.hostname.toLowerCase());
    if (route.blocked) return new Response("Not found", { status: 404 });

    if (url.pathname === "/robots.txt") {
      if (route.preview) {
        return new Response("User-agent: *\nDisallow: /\n", {
          headers: { "content-type": "text/plain; charset=utf-8", "x-robots-tag": "noindex, nofollow" }
        });
      }
      const publicHost = url.hostname.toLowerCase().replace(/^www\./, "");
      if (publicHost === "uncartell.cat" || publicHost === "uncartel.es") {
        return new Response(`User-agent: *\nAllow: /\nSitemap: https://${publicHost}/sitemap.xml\n`, {
          headers: { "content-type": "text/plain; charset=utf-8" }
        });
      }
      return new Response("User-agent: *\nDisallow: /\n", {
        headers: { "content-type": "text/plain; charset=utf-8", "x-robots-tag": "noindex, nofollow" }
      });
    }

    url.pathname = route.pathname;
    const response = await env.ASSETS.fetch(new Request(url, request));
    const headers = new Headers(response.headers);
    // Keep every hostname non-indexable until the explicit DNS/launch checkpoint.
    // This flag is switched only during the later public activation phase.
    // Keep only the temporary Pages hostname out of search engines. The
    // definitive custom domains must remain indexable once they are attached.
    if (route.preview) headers.set("X-Robots-Tag", "noindex, nofollow");
    return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
  }
};
'''
(OUT / "_worker.js").write_text(worker)

print(f"Cloudflare production candidate built: {OUT}")
