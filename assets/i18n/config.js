(function (global) {
  'use strict';

  const DEFAULT_LOCALE = 'ca';
  const LOCALES = Object.freeze({
    ca: Object.freeze({ locale: 'ca', languageTag: 'ca-ES', brand: 'Uncartell', brandStem: 'uncartell', tld: 'cat', domain: 'uncartell.cat', email: 'hola@uncartell.cat', enabled: true, public: true, indexable: true }),
    es: Object.freeze({ locale: 'es', languageTag: 'es-ES', brand: 'Uncartel', brandStem: 'uncartel', tld: 'es', domain: 'uncartel.es', email: 'hola@uncartel.es', enabled: false, public: false, indexable: false }),
    it: Object.freeze({ locale: 'it', languageTag: 'it-IT', brand: 'Uncartello', brandStem: 'uncartello', tld: 'it', domain: 'uncartello.it', email: 'hola@uncartello.it', enabled: false, public: false, indexable: false })
  });

  // Route keys are stable product identifiers. Slugs are intentionally only
  // published in Catalan during the architecture phase.
  const ROUTES = Object.freeze({
    home: Object.freeze({ ca: '/', es: '/es/', it: '/it/' }),
    posters: Object.freeze({ ca: '/cartells/', es: '/es/carteles/', it: '/it/cartelli/' }),
    menus: Object.freeze({ ca: '/cartes-i-menus/', es: '/es/cartas-y-menus/', it: '/it/menu-e-carte/' }),
    prices: Object.freeze({ ca: '/taules-de-preus/', es: '/es/tablas-de-precios/', it: '/it/listini-prezzi/' }),
    qr: Object.freeze({ ca: '/codis-qr/', es: '/es/codigos-qr/', it: '/it/codici-qr/' }),
    plans: Object.freeze({ ca: '/plans/', es: '/es/planes/', it: '/it/piani/' }),
    admin: Object.freeze({ ca: '/admin/', es: '/es/admin/', it: '/it/admin/' }),
    faqs: Object.freeze({ ca: '/faqs/', es: '/es/preguntas-frecuentes/', it: '/it/domande-frequenti/' }),
    manifest: Object.freeze({ ca: '/manifest/', es: '/es/manifiesto/', it: '/it/manifesto/' }),
    contact: Object.freeze({ ca: '/contacte/', es: '/es/contacto/', it: '/it/contatti/' }),
    legal: Object.freeze({ ca: '/legal/', es: '/es/aviso-legal/', it: '/it/note-legali/' }),
    privacy: Object.freeze({ ca: '/privacitat/', es: '/es/privacidad/', it: '/it/privacy/' }),
    cookies: Object.freeze({ ca: '/cookies/', es: '/es/cookies/', it: '/it/cookie/' }),
    publicQr: Object.freeze({ ca: '/qr/', es: '/es/qr/', it: '/it/qr/' })
  });

  const HOST_LOCALES = Object.freeze({
    'uncartell.cat': 'ca',
    'uncartel.es': 'es',
    'uncartello.it': 'it'
  });

  const cleanHost = value => String(value || '').toLowerCase().replace(/^www\./, '').split(':')[0];
  const requestedLocale = ({ hostname, documentLocale, pathname } = {}) => {
    const previewLocale = String(global.UNCARTELL_PREVIEW_LOCALE || '').toLowerCase();
    if (LOCALES[previewLocale]) return previewLocale;
    const hostLocale = HOST_LOCALES[cleanHost(hostname)];
    if (hostLocale) return hostLocale;
    const htmlLocale = String(documentLocale || '').toLowerCase().split('-')[0];
    if (LOCALES[htmlLocale]) return htmlLocale;
    const pathLocale = String(pathname || '').match(/^\/(ca|es|it)(?:\/|$)/i)?.[1]?.toLowerCase();
    return LOCALES[pathLocale] ? pathLocale : DEFAULT_LOCALE;
  };
  const resolveLocale = context => {
    const requested = requestedLocale(context);
    if (global.UNCARTELL_PREVIEW_LOCALE && LOCALES[requested]) return requested;
    return LOCALES[requested]?.enabled ? requested : DEFAULT_LOCALE;
  };
  const routePath = (key, locale = DEFAULT_LOCALE) => ROUTES[key]?.[locale] || ROUTES[key]?.[DEFAULT_LOCALE] || '/';
  const routeUrl = (key, locale = DEFAULT_LOCALE, options = {}) => {
    const isPreview = Boolean(global.UNCARTELL_PREVIEW_LOCALE);
    const target = isPreview && LOCALES[locale] ? locale : (LOCALES[locale]?.public ? locale : DEFAULT_LOCALE);
    const path = routePath(key, target);
    if (isPreview) return target === 'ca' ? `/ca${path}`.replace(/\/\/$/, '/') : path;
    if (options.absolute) return `https://${LOCALES[target].domain}${path}`;
    return path;
  };
  const routeKeyFromPath = pathname => {
    const normalize = value => `/${String(value || '').split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/');
    const normalized = normalize(pathname);
    const direct = Object.keys(ROUTES).find(key => Object.values(ROUTES[key]).includes(normalized));
    if (direct) return direct;
    if (!global.UNCARTELL_PREVIEW_LOCALE) return null;
    const stripped = normalize(String(pathname || '').replace(/^\/(?:ca|es|it)(?=\/|$)/i, '') || '/');
    return Object.keys(ROUTES).find(key => ROUTES[key].ca === stripped) || null;
  };

  global.UncartellLocaleConfig = Object.freeze({
    defaultLocale: DEFAULT_LOCALE,
    locales: LOCALES,
    routes: ROUTES,
    hostLocales: HOST_LOCALES,
    requestedLocale,
    resolveLocale,
    routePath,
    routeUrl,
    routeKeyFromPath,
    market(locale = DEFAULT_LOCALE) { return LOCALES[locale] || LOCALES[DEFAULT_LOCALE]; },
    isPublic(locale) { return Boolean(global.UNCARTELL_PREVIEW_LOCALE ? LOCALES[locale] : LOCALES[locale]?.public); }
  });
})(window);
// Deployment trigger: GitHub Pages production rebuild 2026-09-07.
