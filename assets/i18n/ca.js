(function (global) {
  'use strict';
  global.UncartellDictionaries = global.UncartellDictionaries || {};
  global.UncartellDictionaries.ca = Object.freeze({
    common: {
      navigation: { posters: 'Cartells', menus: 'Cartes i menús', prices: 'Taules de preus', qr: 'Codis QR', plans: 'Plans', account: 'Compte' },
      actions: { download: 'Descarrega', save: 'Desa', open: 'Obre', close: 'Tanca', back: 'Torna enrere', continue: 'Continua' },
      plans: { basic: 'Basic', premium: 'Premium', ultra: 'Ultra' },
      project: { name: 'Nom del projecte', lockedName: 'Premium · Desa i gestiona projectes' }
    },
    brand: { copyright: '© 2026', remainingDownloads: 'Descàrregues restants avui', unlimitedDownloads: 'Descàrregues il·limitades' },
    editors: {
      shared: { watermark: 'Marca d’aigua', logo: 'Logotip', brandKit: 'Kit de marca', colors: 'Colors', typography: 'Tipografia', columns: 'Columnes' },
      posters: { title: 'Crea el teu cartell' },
      menus: { title: 'Crea la teva carta o menú' },
      prices: { title: 'Crea la teva taula de preus' },
      qr: { title: 'Crea el teu codi QR', destination: 'Destinació del QR' }
    },
    system: {
      errors: { unavailableQr: 'Aquest QR ja no està disponible.' },
      loading: { openingLink: 'Obrint l’enllaç…' }
    }
  });
})(window);
