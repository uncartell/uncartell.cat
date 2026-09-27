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
  const textState = new WeakMap();
  const attributeState = new WeakMap();
  const initializedEditable = new WeakSet();
  const debug = global.__UNCARTELL_I18N_PERF = {
    locale,
    initialPasses: 0,
    incrementalPasses: 0,
    nodesVisited: 0,
    writes: 0,
    observerCallbacks: 0,
    observerRecords: 0,
    observerAddedNodes: 0,
    totalMs: 0,
    longestMs: 0
  };
  const debugEnabled = new URLSearchParams(location.search).has('i18n-debug');
  const syncDebug = () => {
    if (debugEnabled) document.documentElement.dataset.i18nPerf = JSON.stringify(debug);
  };

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
    'input,textarea,select,[contenteditable="true"],[data-user-content],[data-project-content],[data-no-preview-translate]'
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
    debug.nodesVisited += 1;
    if (node.nodeType !== Node.TEXT_NODE || protectedElement(node)) return;
    const current = node.nodeValue;
    const previous = textState.get(node);
    // MutationObserver also reports our own characterData writes.  Treat the
    // last output as terminal instead of feeding it back into the dictionary;
    // catalogues can legitimately contain reverse mappings such as ca↔es.
    if (previous && current === previous.output) return;
    const localized = translate(current);
    textState.set(node, { source: current, output: localized });
    if (localized !== current) {
      debug.writes += 1;
      node.nodeValue = localized;
    }
  };
  const translateAttribute = (element, attribute) => {
    if (!element.hasAttribute(attribute)) return;
    const current = element.getAttribute(attribute);
    let elementState = attributeState.get(element);
    if (!elementState) {
      elementState = new Map();
      attributeState.set(element, elementState);
    }
    const previous = elementState.get(attribute);
    if (previous && current === previous.output) return;
    const localized = translate(current);
    elementState.set(attribute, { source: current, output: localized });
    if (localized !== current) {
      debug.writes += 1;
      element.setAttribute(attribute, localized);
    }
  };
  const translateElement = element => {
    debug.nodesVisited += 1;
    if (!(element instanceof Element) || element.closest('[data-user-content],[data-project-content]')) return;
    if (element.matches('input,textarea')) {
      ['aria-label', 'title', 'placeholder', 'alt'].forEach(attribute => translateAttribute(element, attribute));
      return;
    }
    if (element.matches('[contenteditable="true"]')) {
      if (initializedEditable.has(element)) return;
      // Editable text is document content. Defaults are already localized in
      // UNCARTELL_LOCALE; never run free-form user input through the catalogue.
      initializedEditable.add(element);
      return;
    }
    if (element.closest('[contenteditable="true"]')) return;
    ['aria-label', 'title', 'placeholder', 'alt'].forEach(attribute => translateAttribute(element, attribute));
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
  const localizeLink = link => {
    const hostnameMode = global.UNCARTELL_HOSTNAME_ROUTING === true;
    const url = new URL(link.getAttribute('href'), location.origin);
    const routeKey = routeKeyFor(url.pathname);
    if (!routeKey) return;
    const slug = previewRoutes[routeKey]?.[locale];
    const pathname = slug === undefined
      ? url.pathname
      : (hostnameMode ? `/${slug ? `${slug}/` : ''}` : `/${locale}/${slug ? `${slug}/` : ''}`);
    const localized = `${pathname}${url.search}${url.hash}`;
    if (link.getAttribute('href') !== localized) link.setAttribute('href', localized);
  };
  const localizeLinks = root => {
    if (root instanceof Element && root.matches('a[href^="/"]')) localizeLink(root);
    root.querySelectorAll?.('a[href^="/"]').forEach(localizeLink);
  };
  const measure = callback => {
    const started = performance.now();
    callback();
    const duration = performance.now() - started;
    debug.totalMs += duration;
    debug.longestMs = Math.max(debug.longestMs, duration);
  };
  const runInitial = () => measure(() => {
    debug.initialPasses += 1;
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
  });

  const initialize = () => { runInitial(); syncDebug(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize, { once: true });
  else initialize();

  new MutationObserver(records => {
    debug.observerCallbacks += 1;
    debug.observerRecords += records.length;
    measure(() => {
      const changedText = new Set();
      const added = new Set();
      records.forEach(record => {
        if (record.type === 'characterData') changedText.add(record.target);
        record.addedNodes.forEach(node => added.add(node));
      });
      debug.observerAddedNodes += added.size;
      changedText.forEach(translateTextNode);
      // If a complete subtree was inserted, descendant records do not need a
      // second traversal in the same observer delivery.
      const roots = [...added].filter(node =>
        ![...added].some(candidate => candidate !== node && candidate.nodeType === Node.ELEMENT_NODE && candidate.contains(node))
      );
      roots.forEach(root => {
        debug.incrementalPasses += 1;
        translateTree(root);
        localizeLinks(root);
      });
    });
    syncDebug();
  }).observe(document.documentElement, { subtree: true, childList: true, characterData: true });
})(window);
