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
  const languageA11y = {
    ca: { change: 'Canvia d’idioma', label: 'Idioma', menu: 'Idiomes' },
    es: { change: 'Cambiar idioma', label: 'Idioma', menu: 'Idiomas' },
    it: { change: 'Cambia lingua', label: 'Lingua', menu: 'Lingue' }
  }[locale];
  const closeLocaleMenu = (wrapper, restoreFocus = false) => {
    const trigger = wrapper?.querySelector('.u-preview-locale-trigger');
    const menu = wrapper?.querySelector('.u-preview-locale-menu');
    if (!trigger || !menu) return;
    wrapper.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
    if (restoreFocus) trigger.focus();
  };
  const openLocaleMenu = wrapper => {
    const trigger = wrapper.querySelector('.u-preview-locale-trigger');
    const menu = wrapper.querySelector('.u-preview-locale-menu');
    wrapper.classList.add('is-open');
    trigger.setAttribute('aria-expanded', 'true');
    menu.hidden = false;
    (menu.querySelector('[aria-current="true"]') || menu.querySelector('button'))?.focus();
  };
  const mountSelector = () => {
    const nav = document.querySelector('.u-nav');
    // platform.js owns the production language control. The preview runtime
    // only supplies a fallback on documents where that shared header is not
    // available; mounting both produced two globe controls on hostname builds.
    if (!nav || nav.querySelector('.u-language-control,[data-preview-locale-switcher]')) return;
    const wrapper = document.createElement('div');
    wrapper.className = 'u-preview-locale-switcher';
    wrapper.dataset.previewLocaleSwitcher = '';
    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'u-preview-locale-trigger';
    trigger.setAttribute('aria-label', languageA11y.change);
    trigger.setAttribute('aria-haspopup', 'menu');
    trigger.setAttribute('aria-expanded', 'false');
    trigger.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.75"/><path d="M3.25 12h17.5M12 3.25c2.35 2.4 3.55 5.32 3.55 8.75S14.35 18.35 12 20.75C9.65 18.35 8.45 15.43 8.45 12S9.65 5.65 12 3.25Z"/></svg><span class="u-preview-locale-label">${languageA11y.label}</span>`;
    const menu = document.createElement('div');
    menu.className = 'u-preview-locale-menu';
    menu.setAttribute('role', 'menu');
    menu.setAttribute('aria-label', languageA11y.menu);
    menu.hidden = true;
    Object.entries(localeLabels).forEach(([code, label]) => {
      const option = document.createElement('button');
      option.type = 'button';
      option.className = 'u-preview-locale-option';
      option.dataset.locale = code;
      option.setAttribute('role', 'menuitem');
      option.setAttribute('aria-current', String(code === locale));
      option.innerHTML = `<span>${label}</span>${code === locale ? '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="m4.5 10 3.25 3.25L15.5 5.5"/></svg>' : ''}`;
      option.addEventListener('click', () => {
        closeLocaleMenu(wrapper);
        location.assign(localizedUrl(code));
      });
      menu.append(option);
    });
    trigger.addEventListener('click', () => wrapper.classList.contains('is-open') ? closeLocaleMenu(wrapper) : openLocaleMenu(wrapper));
    wrapper.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeLocaleMenu(wrapper, true);
        return;
      }
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      if (!wrapper.classList.contains('is-open')) return openLocaleMenu(wrapper);
      const options = [...menu.querySelectorAll('.u-preview-locale-option')];
      const currentIndex = options.indexOf(document.activeElement);
      const nextIndex = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 :
        event.key === 'ArrowDown' ? (currentIndex + 1 + options.length) % options.length :
        (currentIndex - 1 + options.length) % options.length;
      options[nextIndex]?.focus();
    });
    wrapper.append(trigger, menu);
    nav.insertBefore(wrapper, nav.querySelector('[data-account]') || null);
  };
  const injectStyles = () => {
    if (document.querySelector('[data-preview-i18n-styles]')) return;
    const style = document.createElement('style');
    style.dataset.previewI18nStyles = '';
    style.textContent = `
      .u-preview-locale-switcher{position:relative;display:flex;align-items:center;color:#171614;font-size:14px;font-weight:650;line-height:1.2}
      .u-preview-locale-trigger{display:flex;align-items:center;justify-content:center;gap:0;width:42px;height:42px;min-width:42px;min-height:42px;padding:0!important;border:1px solid var(--line,#d9d6ce)!important;border-radius:11px!important;background:#fff;color:#171614;line-height:0;cursor:pointer;transition:background-color .16s ease,border-color .16s ease,transform .16s ease}
      .u-preview-locale-trigger svg{display:block;flex:0 0 19px;width:19px;height:19px;margin:0;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
      .u-preview-locale-label{display:none;line-height:1.2}
      .u-preview-locale-trigger:hover,.u-preview-locale-switcher.is-open .u-preview-locale-trigger{background:#f4f3ef;border-color:#b9b5ac}
      .u-preview-locale-trigger:active{transform:translateY(1px)}
      .u-preview-locale-trigger:focus-visible,.u-preview-locale-option:focus-visible{outline:2px solid #65ed6b;outline-offset:2px}
      .u-preview-locale-menu{position:absolute;z-index:10020;top:calc(100% + 8px);right:0;width:176px;padding:6px;border:1px solid #d9d6ce;border-radius:12px;background:#fff;box-shadow:0 12px 32px rgba(23,22,20,.12)}
      .u-preview-locale-menu[hidden]{display:none}
      .u-preview-locale-option{display:flex;align-items:center;justify-content:space-between;width:100%;min-height:42px;padding:0 11px;border:0;border-radius:8px;background:transparent;color:#171614;font:inherit;text-align:left;cursor:pointer}
      .u-preview-locale-option:hover,.u-preview-locale-option:focus-visible{background:#f4f3ef}
      .u-preview-locale-option[aria-current="true"]{font-weight:800;background:#effdef}
      .u-preview-locale-option svg{width:18px;height:18px;fill:none;stroke:#22c94b;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      @media(max-width:980px){
        .u-preview-locale-switcher{display:block;width:100%;padding:0;border:0}
        .u-preview-locale-trigger{justify-content:flex-start;width:100%;height:46px;min-height:46px;padding:11px 13px!important;gap:10px;line-height:1.2;text-align:left}
        .u-preview-locale-trigger svg{flex-basis:18px;width:18px;height:18px}
        .u-preview-locale-label{display:block}
        .u-preview-locale-menu{position:static;width:100%;margin:6px 0 2px;padding:4px;border-radius:11px;box-shadow:none}
        .u-preview-locale-option{min-height:48px;padding:0 12px;font-size:15px}
      }
    `;
    document.head.append(style);
  };
  const run = () => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.locale = locale;
    injectStyles();
    mountSelector();
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
    mountSelector();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();

  document.addEventListener('pointerdown', event => {
    const wrapper = document.querySelector('[data-preview-locale-switcher].is-open');
    if (wrapper && !wrapper.contains(event.target)) closeLocaleMenu(wrapper);
  });

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
    mountSelector();
    localizeLinks(document);
  }).observe(document.documentElement, { subtree: true, childList: true });
})(window);
