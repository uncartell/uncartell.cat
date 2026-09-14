(function (global) {
  'use strict';

  const locale = String(global.UNCARTELL_PREVIEW_LOCALE || 'ca').toLowerCase();
  const config = global.UncartellLocaleConfig;
  const dictionaries = global.UncartellPreviewTranslations || {};
  const dictionary = dictionaries[locale] || {};
  const market = config?.market?.(locale) || {
    ca: { brand: 'Uncartell', tld: 'cat', domain: 'uncartell.cat' },
    es: { brand: 'Uncartel', tld: 'es', domain: 'uncartel.es' },
    it: { brand: 'Uncartello', tld: 'it', domain: 'uncartello.it' }
  }[locale];

  const localeLabels = { ca: 'Català', es: 'Español', it: 'Italiano' };
  const previewRoutes = {
    home:{ca:'',es:'',it:''}, posters:{ca:'cartells',es:'carteles',it:'cartelli'},
    menus:{ca:'cartes-i-menus',es:'cartas-y-menus',it:'menu-e-carte'},
    prices:{ca:'taules-de-preus',es:'tablas-de-precios',it:'listini-prezzi'},
    qr:{ca:'codis-qr',es:'codigos-qr',it:'codici-qr'}, plans:{ca:'plans',es:'planes',it:'piani'},
    ultra:{ca:'ultra',es:'ultra',it:'ultra'}, faqs:{ca:'faqs',es:'preguntas-frecuentes',it:'domande-frequenti'},
    manifest:{ca:'manifest',es:'manifiesto',it:'manifesto'}, contact:{ca:'contacte',es:'contacto',it:'contatti'},
    legal:{ca:'legal',es:'aviso-legal',it:'note-legali'}, privacy:{ca:'privacitat',es:'privacidad',it:'privacy'},
    cookies:{ca:'cookies',es:'cookies',it:'cookie'}, admin:{ca:'admin',es:'admin',it:'admin'}
  };
  const protectedElement = node => node?.parentElement?.closest(
    'input,textarea,select,[data-user-content],[data-project-content],[data-no-preview-translate]'
  );
  const translate = value => {
    const raw = String(value || '');
    const trimmed = raw.trim();
    let output = trimmed && dictionary[trimmed] ? dictionary[trimmed] : trimmed;
    if (locale !== 'ca') {
      output = output
        .replace(/uncartell\.cat/gi, market.domain)
        .replace(/\bUncartell\b/g, market.brand);
    }
    return trimmed ? raw.replace(trimmed, output) : raw;
  };
  const translateTextNode = node => {
    if (node.nodeType !== Node.TEXT_NODE || protectedElement(node)) return;
    const localized = translate(node.nodeValue);
    if (localized !== node.nodeValue) node.nodeValue = localized;
  };
  const translateElement = element => {
    if (!(element instanceof Element) || element.closest('[data-user-content],[data-project-content]')) return;
    if (element.matches('input,textarea')) {
      ['aria-label', 'title', 'placeholder', 'alt'].forEach(attribute => {
        if (!element.hasAttribute(attribute)) return;
        const current = element.getAttribute(attribute);
        const localized = translate(current);
        if (localized !== current) element.setAttribute(attribute, localized);
      });
      return;
    }
    if (element.matches('[contenteditable="true"]')) {
      if (element.dataset.previewI18nInitialized) return;
      element.childNodes.forEach(translateTextNode);
      element.dataset.previewI18nInitialized = 'true';
      return;
    }
    if (element.closest('[contenteditable="true"]')) return;
    ['aria-label', 'title', 'placeholder', 'alt'].forEach(attribute => {
      if (!element.hasAttribute(attribute)) return;
      const current = element.getAttribute(attribute);
      const localized = translate(current);
      if (localized !== current) element.setAttribute(attribute, localized);
    });
    element.childNodes.forEach(translateTextNode);
  };
  const translateTree = root => {
    if (root.nodeType === Node.TEXT_NODE) return translateTextNode(root);
    if (root instanceof Element) translateElement(root);
    root.querySelectorAll?.('*').forEach(translateElement);
  };

  const localizedUrl = targetLocale => {
    const routeKey = routeKeyFor(location.pathname) || 'home';
    const slug = previewRoutes[routeKey]?.[targetLocale];
    const hostnameMode = global.UNCARTELL_HOSTNAME_ROUTING === true;
    const pathname = hostnameMode
      ? (slug === undefined ? '/' : `/${slug ? `${slug}/` : ''}`)
      : (slug === undefined ? `/${targetLocale}/` : `/${targetLocale}/${slug ? `${slug}/` : ''}`);
    const origin = hostnameMode
      ? `https://${config?.market?.(targetLocale)?.domain || ({ca:'uncartell.cat',es:'uncartel.es',it:'uncartello.it'}[targetLocale])}`
      : '';
    return `${origin}${pathname}${location.search}${location.hash}`;
  };
  const routeKeyFor = pathname => {
    const direct = config?.routeKeyFromPath?.(pathname);
    if (direct) return direct;
    const normalized = `/${String(pathname || '').replace(/^\/(?:ca|es|it)(?=\/|$)/i, '').replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/');
    return Object.entries(previewRoutes).find(([, variants]) =>
      Object.values(variants).some(value => {
        const candidate = `/${String(value).replace(/^\/(?:ca|es|it)(?=\/|$)/i, '').replace(/^\/+|\/+$/g, '')}/`.replace(/^\/\/$/, '/');
        return candidate === normalized;
      })
    )?.[0] || null;
  };
  const localizeLinks = root => {
    const hostnameMode = global.UNCARTELL_HOSTNAME_ROUTING === true;
    root.querySelectorAll?.('a[href^="/"]').forEach(link => {
      const url = new URL(link.getAttribute('href'), location.origin);
      const routeKey = routeKeyFor(url.pathname);
      if (!routeKey) return;
      const slug = previewRoutes[routeKey]?.[locale];
      const pathname = slug === undefined
        ? url.pathname
        : (hostnameMode ? `/${slug ? `${slug}/` : ''}` : `/${locale}/${slug ? `${slug}/` : ''}`);
      const localized = `${pathname}${url.search}${url.hash}`;
      if (link.getAttribute('href') !== localized) link.setAttribute('href', localized);
    });
  };
  const run = () => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.locale = locale;
    localizeLinks(document);
    // platform.js already resolves the complete localized brand synchronously.
    // Keep the translation overlay away from its split text nodes (stem, dot,
    // TLD), otherwise a later translation pass can expose a mixed brand/domain.
    document.querySelectorAll('.u-logo,.u-mobile-nav-brand').forEach(node => {
      node.dataset.noPreviewTranslate = '';
    });
    document.title = translate(document.title);
    try {
      translateTree(document);
    } catch (error) {
      console.error('[localized-preview] Translation overlay failed', error);
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();

  // La plataforma comparteix alguns components que s'hidraten després del DOMContentLoaded
  // (header, footer, comptador i modals). Fem passades curtes i acotades perquè el preview
  // local també localitzi aquests nodes sense observar canvis de text indefinidament.
  requestAnimationFrame(run);
  setTimeout(run, 120);
  setTimeout(run, 600);

  new MutationObserver(records => {
    records.forEach(record => {
      record.addedNodes.forEach(translateTree);
    });
    localizeLinks(document);
  }).observe(document.documentElement, { subtree: true, childList: true });
})(window);
