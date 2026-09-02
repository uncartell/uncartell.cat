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
    home: Object.freeze({ ca: '/' }),
    posters: Object.freeze({ ca: '/cartells/' }),
    menus: Object.freeze({ ca: '/cartes-i-menus/' }),
    prices: Object.freeze({ ca: '/taules-de-preus/' }),
    qr: Object.freeze({ ca: '/codis-qr/' }),
    plans: Object.freeze({ ca: '/plans/' }),
    admin: Object.freeze({ ca: '/admin/' }),
    faqs: Object.freeze({ ca: '/faqs/' }),
    manifest: Object.freeze({ ca: '/manifest/' }),
    contact: Object.freeze({ ca: '/contacte/' }),
    legal: Object.freeze({ ca: '/legal/' }),
    privacy: Object.freeze({ ca: '/privacitat/' }),
    cookies: Object.freeze({ ca: '/cookies/' }),
    publicQr: Object.freeze({ ca: '/qr/' })
  });

  const HOST_LOCALES = Object.freeze({
    'uncartell.cat': 'ca',
    'uncartel.es': 'es',
    'uncartello.it': 'it'
  });

  const cleanHost = value => String(value || '').toLowerCase().replace(/^www\./, '').split(':')[0];
  const requestedLocale = ({ hostname, documentLocale, pathname } = {}) => {
    const hostLocale = HOST_LOCALES[cleanHost(hostname)];
    if (hostLocale) return hostLocale;
    const htmlLocale = String(documentLocale || '').toLowerCase().split('-')[0];
    if (LOCALES[htmlLocale]) return htmlLocale;
    const pathLocale = String(pathname || '').match(/^\/(ca|es|it)(?:\/|$)/i)?.[1]?.toLowerCase();
    return LOCALES[pathLocale] ? pathLocale : DEFAULT_LOCALE;
  };
  const resolveLocale = context => {
    const requested = requestedLocale(context);
    return LOCALES[requested]?.enabled ? requested : DEFAULT_LOCALE;
  };
  const routePath = (key, locale = DEFAULT_LOCALE) => ROUTES[key]?.[locale] || ROUTES[key]?.[DEFAULT_LOCALE] || '/';
  const routeUrl = (key, locale = DEFAULT_LOCALE, options = {}) => {
    const target = LOCALES[locale]?.public ? locale : DEFAULT_LOCALE;
    const path = routePath(key, target);
    if (options.absolute) return `https://${LOCALES[target].domain}${path}`;
    return path;
  };
  const routeKeyFromPath = pathname => {
    const normalized = `/${String(pathname || '').split('?')[0].split('#')[0].replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/');
    return Object.keys(ROUTES).find(key => Object.values(ROUTES[key]).includes(normalized)) || null;
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
    isPublic(locale) { return Boolean(LOCALES[locale]?.public); }
  });
})(window);
