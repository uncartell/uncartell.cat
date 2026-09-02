(function (global) {
  'use strict';
  const config = global.UncartellLocaleConfig;
  if (!config) throw new Error('UncartellLocaleConfig must load before the i18n runtime.');
  const context = { hostname: location.hostname, documentLocale: document.documentElement.lang, pathname: location.pathname };
  const requestedLocale = config.requestedLocale(context);
  const locale = config.resolveLocale(context);
  const fallbackLocale = config.defaultLocale;
  const dictionaries = global.UncartellDictionaries || {};
  const read = (source, key) => String(key || '').split('.').reduce((value, part) => value && value[part], source);
  const interpolate = (value, params) => String(value).replace(/\{([^}]+)\}/g, (_, key) => params[key] == null ? `{${key}}` : String(params[key]));
  const t = (key, params = {}) => {
    const value = read(dictionaries[locale], key) ?? read(dictionaries[fallbackLocale], key);
    return typeof value === 'string' ? interpolate(value, params) : key;
  };
  const localizeSystemContent = (record, field, targetLocale = locale) => {
    if (!record || typeof record !== 'object') return '';
    // Localized system records may use `field_i18n` or `{field:{ca,...}}`.
    // Plain user-generated fields are returned verbatim and never translated.
    const localized = record[`${field}_i18n`] || (record[field] && typeof record[field] === 'object' ? record[field] : null);
    if (localized) return localized[targetLocale] ?? localized[fallbackLocale] ?? '';
    return record[field] ?? '';
  };
  const applyDocumentLocale = () => {
    document.documentElement.lang = config.market(locale).languageTag.split('-')[0];
    document.documentElement.dataset.locale = locale;
    document.documentElement.dataset.requestedLocale = requestedLocale;
    document.querySelectorAll('[data-i18n-key]').forEach(node => { node.textContent = t(node.dataset.i18nKey); });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(node => { node.placeholder = t(node.dataset.i18nPlaceholder); });
  };
  const urlFor = (routeKey, targetLocale = locale, options = {}) => config.routeUrl(routeKey, targetLocale, options);
  const localeSwitchUrl = targetLocale => {
    if (!config.isPublic(targetLocale)) return null;
    const routeKey = config.routeKeyFromPath(location.pathname) || 'home';
    return `${config.routeUrl(routeKey, targetLocale, { absolute: true })}${location.search}${location.hash}`;
  };
  const seo = Object.freeze({
    canonical(routeKey) { return config.routeUrl(routeKey, locale, { absolute: true }); },
    alternates(routeKey) {
      return Object.keys(config.locales).filter(code => config.isPublic(code)).map(code => ({ locale: code, href: config.routeUrl(routeKey, code, { absolute: true }) }));
    }
  });
  global.UncartellI18n = Object.freeze({ locale, requestedLocale, fallbackLocale, config, market: config.market(locale), t, urlFor, localeSwitchUrl, localizeSystemContent, seo, apply: applyDocumentLocale });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', applyDocumentLocale, { once: true });
  else applyDocumentLocale();
})(window);
