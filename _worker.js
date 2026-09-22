const HOST_LOCALE = {
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

function publicPathWithoutLocalePrefix(pathname, hostname) {
  if (isPagesPreview(hostname)) return null;
  const locale = HOST_LOCALE[hostname];
  if (!locale) return null;
  const match = pathname.match(/^\/(ca|es|it)(?=\/|$)(.*)$/);
  if (!match || match[1] !== locale) return null;
  return match[2] || "/";
}

function needsPublicTrailingSlash(pathname, hostname) {
  if (isPagesPreview(hostname) || pathname === "/" || pathname.endsWith("/")) return false;
  if (STATIC_PREFIXES.some(prefix => pathname.startsWith(prefix)) || STATIC_FILES.has(pathname)) return false;
  return !pathname.split("/").pop().includes(".");
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
    const hostname = url.hostname.toLowerCase();
    const cleanPublicPath = publicPathWithoutLocalePrefix(url.pathname, hostname);
    if (cleanPublicPath !== null) {
      url.pathname = cleanPublicPath;
      return Response.redirect(url.toString(), 308);
    }

    const route = localePath(url.pathname, hostname);
    if (route.blocked) return new Response("Not found", { status: 404 });

    if (needsPublicTrailingSlash(url.pathname, hostname)) {
      url.pathname = `${url.pathname}/`;
      return Response.redirect(url.toString(), 308);
    }

    if (url.pathname === "/robots.txt") {
      if (route.preview) {
        return new Response("User-agent: *\nDisallow: /\n", {
          headers: { "content-type": "text/plain; charset=utf-8", "x-robots-tag": "noindex, nofollow" }
        });
      }
      const publicHost = url.hostname.toLowerCase().replace(/^www\./, "");
      if (publicHost === "uncartell.cat" || publicHost === "uncartel.es" || publicHost === "uncartello.it") {
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
