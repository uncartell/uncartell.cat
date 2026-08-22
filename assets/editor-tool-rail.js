(() => {
  if (!document.querySelector('link[href*="editor-tool-rail.css"]')) {
    const styles = document.createElement('link');
    styles.rel = 'stylesheet';
    styles.href = '/assets/editor-tool-rail.css?v=5';
    document.head.append(styles);
  }

  const icons = {
    blocks: '<path d="M12 5v14M5 12h14"/>',
    edit: '<path d="m4 20 4.2-1 10.6-10.6a2.1 2.1 0 0 0-3-3L5.2 16 4 20Z"/><path d="m14.5 6.7 3 3"/>',
    typography: '<path d="M3.5 7V4.5h9V7M8 4.5V19M5.5 19h5"/><path d="M14 10.5h6.5M17.25 10.5V19M15.25 19h4"/>',
    layout: '<rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M12 4v16"/>',
    colors: '<path d="M12 3a9 9 0 1 0 0 18h1.4a1.8 1.8 0 0 0 0-3.6H12a1.8 1.8 0 0 1 0-3.6h3.2A5.8 5.8 0 0 0 21 8c0-2.8-4-5-9-5Z"/><circle cx="7.5" cy="9" r=".8"/><circle cx="10" cy="6.5" r=".8"/><circle cx="14" cy="6.5" r=".8"/>',
    logo: '<rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="m6.5 15 3.5-3.5 2.6 2.6 2.2-2.2 2.7 3.1"/><circle cx="16.5" cy="9" r="1.2"/>',
    watermark: '<rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M6.5 16.5h11"/><path d="M8 13.5h8"/>',
    brand: '<path d="M4 8h16v11H4z"/><path d="M9 8V5h6v3M8 12h8"/>'
  };

  const copy = {
    ca: {
      blocks: 'Afegir blocs', typography: 'Tipografia', layout: 'Layout', colors: 'Colors',
      logo: 'Logotip', watermark: 'Marca d’aigua al peu', brand: 'Kit de marca'
    },
    es: {
      blocks: 'Añadir bloques', typography: 'Tipografía', layout: 'Layout', colors: 'Colores',
      logo: 'Logotipo', watermark: 'Marca de agua al pie', brand: 'Kit de marca'
    }
  };

  const makeTitle = (label) => {
    const title = document.createElement('h3');
    title.className = 'editor-tool-panel-title';
    title.textContent = label;
    return title;
  };

  const installMobileSheet = (shell, panel, rail, views) => {
    if (panel.querySelector('.editor-mobile-sheet-bar')) return;
    const lang = document.documentElement.lang === 'es' ? 'es' : 'ca';
    const bar = document.createElement('div');
    bar.className = 'editor-mobile-sheet-bar';
    bar.innerHTML = `<span aria-hidden="true"></span><button type="button" aria-label="${lang === 'es' ? 'Cerrar herramientas' : 'Tanca les eines'}">×</button>`;
    panel.prepend(bar);

    const close = () => {
      shell.classList.remove('mobile-panel-open');
      rail.querySelectorAll('.editor-tool-rail-button').forEach((button) => button.setAttribute('aria-selected', 'false'));
    };
    bar.querySelector('button').addEventListener('click', close);
    shell.addEventListener('click', (event) => {
      if (!matchMedia('(max-width: 820px)').matches || !shell.classList.contains('mobile-panel-open')) return;
      if (event.target.closest('.editor-panel,.editor-tool-rail')) return;
      close();
    });
    views.addEventListener('touchmove', (event) => event.stopPropagation(), { passive: true });
  };

  const selectTool = (shell, rail, views, button, key) => {
    const wasSelected = button.getAttribute('aria-selected') === 'true';
    const mobile = matchMedia('(max-width: 820px)').matches;
    if (mobile && wasSelected && shell.classList.contains('mobile-panel-open')) {
      shell.classList.remove('mobile-panel-open');
      button.setAttribute('aria-selected', 'false');
      return;
    }
    rail.querySelectorAll('.editor-tool-rail-button').forEach((item) => item.setAttribute('aria-selected', String(item === button)));
    views.querySelectorAll('.editor-tool-view').forEach((view) => { view.hidden = view.dataset.toolView !== key; });
    if (mobile) shell.classList.add('mobile-panel-open');
  };

  const installContextualMobileEditing = (shell, rail, views, options = {}) => {
    const blocksButton = rail.querySelector('[data-tool-target="blocks"]');
    const blocksView = views.querySelector('[data-tool-view="blocks"]');
    const blockButtons = blocksView?.querySelector('#blockButtons');
    if (!blocksButton || !blocksView) return;

    const defaultLabel = blocksButton.getAttribute('aria-label') || 'Afegir blocs';
    const editLabel = document.documentElement.lang === 'es' ? 'Editar el bloque' : 'Edita el bloc';
    const title = blocksView.querySelector('.editor-tool-panel-title');
    const icon = blocksButton.querySelector('svg');
    const text = blocksButton.querySelector('span');
    let contextualEditing = false;

    const setEditing = (editing, open = false) => {
      if (!matchMedia('(max-width: 820px)').matches) return;
      const unchanged = contextualEditing === editing;
      contextualEditing = editing;
      shell.classList.toggle('mobile-context-editing', editing);
      blocksButton.classList.toggle('is-context-edit', editing);
      blocksButton.setAttribute('aria-label', editing ? editLabel : defaultLabel);
      blocksButton.setAttribute('title', editing ? editLabel : defaultLabel);
      if (icon) icon.innerHTML = editing ? icons.edit : icons.blocks;
      if (text) text.textContent = editing ? editLabel : defaultLabel;
      if (title) title.textContent = editing ? editLabel : defaultLabel;
      if (blockButtons) blockButtons.hidden = editing;
      if (open && (!unchanged || !shell.classList.contains('mobile-panel-open'))) {
        blocksButton.setAttribute('aria-selected', 'false');
        shell.classList.remove('mobile-panel-open');
        selectTool(shell, rail, views, blocksButton, 'blocks');
        requestAnimationFrame(() => {
          const inspector = blocksView.querySelector('#inspector') || blocksView.querySelector(options.inspectorSelector || 'input,textarea,[contenteditable="true"]')?.closest('section,div');
          inspector?.scrollIntoView({ block: 'start' });
        });
      }
    };

    // The editors dispatch this event from their real selection state. This is
    // deliberately the primary mobile path: their preview is re-rendered after
    // a tap, so relying only on click bubbling is inherently race-prone.
    document.addEventListener('uncartell:editor-selection', (event) => {
      const detail = event.detail || {};
      setEditing(Boolean(detail.selected), detail.open !== false);
    });

    shell.addEventListener('click', (event) => {
      if (!matchMedia('(max-width: 820px)').matches) return;
      const selectedContent = event.target.closest(options.selectionSelector || '[data-block]');
      if (selectedContent && shell.contains(selectedContent)) {
        requestAnimationFrame(() => setEditing(true, true));
        return;
      }
      if (event.target.closest('.page-tab,[data-mobile-page],.delete-button,[data-context-delete]')) {
        requestAnimationFrame(() => setEditing(false));
      }
    });

    blocksButton.addEventListener('click', () => {
      if (!shell.classList.contains('mobile-context-editing') && blockButtons) blockButtons.hidden = false;
    });
    matchMedia('(max-width: 820px)').addEventListener?.('change', event => {
      if (!event.matches) {
        shell.classList.remove('mobile-context-editing');
        if (blockButtons) blockButtons.hidden = false;
      }
    });
  };

  const initialiseDocumentEditor = () => {
    const shell = document.querySelector('.editor-shell');
    const panel = shell?.querySelector(':scope > .editor-panel');
    const blocksPanel = panel?.querySelector('#blocksPanel');
    const stylePanel = panel?.querySelector('#stylePanel');
    if (!shell || !panel || !blocksPanel || !stylePanel || shell.dataset.toolRailReady) return;

    const lang = document.documentElement.lang === 'es' ? 'es' : 'ca';
    const labels = copy[lang];
    const rail = document.createElement('nav');
    rail.className = 'editor-tool-rail';
    rail.setAttribute('aria-label', lang === 'es' ? 'Herramientas del editor' : 'Eines de l’editor');

    const views = document.createElement('div');
    views.className = 'editor-tool-views';

    const createView = (key, nodes) => {
      const view = document.createElement('section');
      view.className = 'editor-tool-view';
      view.dataset.toolView = key;
      view.hidden = key !== 'blocks';
      view.append(makeTitle(labels[key]));
      nodes.filter(Boolean).forEach((node) => view.append(node));
      views.append(view);
      return view;
    };

    const blockKicker = blocksPanel.querySelector('.panel-kicker');
    if (blockKicker) blockKicker.remove();
    createView('blocks', [blocksPanel.querySelector('#blockButtons'), blocksPanel.querySelector('#inspector')]);

    const styleKicker = stylePanel.querySelector('.panel-kicker');
    if (styleKicker) styleKicker.remove();
    createView('typography', [stylePanel.querySelector('#styleOptions')]);
    createView('layout', [stylePanel.querySelector('.column-settings'), stylePanel.querySelector('.price-header-controls')]);
    createView('colors', [stylePanel.querySelector('.premium-style')]);
    const logoHost = document.createElement('div');
    logoHost.className = 'editor-logo-tool-host';
    createView('logo', [logoHost]);
    createView('watermark', [stylePanel.querySelector('#footerStyleCard')]);
    const brandKit = stylePanel.querySelector('#brandKit');
    if (brandKit) brandKit.open = true;
    createView('brand', [brandKit]);

    ['blocks', 'typography', 'layout', 'colors', 'logo', 'watermark', 'brand'].forEach((key) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'editor-tool-rail-button';
      button.dataset.toolTarget = key;
      button.setAttribute('aria-label', labels[key]);
      button.setAttribute('title', labels[key]);
      button.setAttribute('aria-selected', key === 'blocks' ? 'true' : 'false');
      button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[key]}</svg><span>${labels[key]}</span>`;
      button.addEventListener('click', (event) => {
        selectTool(shell, rail, views, button, key);
      });
      rail.append(button);
    });

    panel.querySelector('.panel-tabs')?.remove();
    blocksPanel.remove();
    stylePanel.remove();
    panel.append(views);
    shell.prepend(rail);
    shell.classList.add('tool-rail-ready');
    shell.dataset.toolRailReady = 'true';
    installMobileSheet(shell, panel, rail, views);
    installContextualMobileEditing(shell, rail, views);
    if (matchMedia('(max-width: 820px)').matches) {
      shell.classList.remove('mobile-panel-open');
      rail.querySelectorAll('.editor-tool-rail-button').forEach((button) => button.setAttribute('aria-selected', 'false'));
    }

    const inspector = views.querySelector('#inspector');
    const moveLogoControl = (control) => { if (control) logoHost.replaceChildren(control); };
    moveLogoControl(inspector?.querySelector('.page-logo-setting,.locked-logo-control'));
    if (inspector) new MutationObserver((mutations) => {
      let addedControl = null;
      let hasAddedContent = false;
      mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;
        hasAddedContent = true;
        addedControl ||= node.matches?.('.page-logo-setting,.locked-logo-control') ? node : node.querySelector?.('.page-logo-setting,.locked-logo-control');
      }));
      if (addedControl) moveLogoControl(addedControl);
      else if (hasAddedContent) logoHost.replaceChildren();
    }).observe(inspector, { childList: true, subtree: true });
  };

  const initialisePosterEditor = () => {
    const shell = document.querySelector('.poster-editor-shell');
    const panel = shell?.querySelector(':scope > .editor-panel');
    const contentPanel = panel?.querySelector('[data-content-panel]');
    const stylePanel = panel?.querySelector('[data-style-panel]');
    const footerCard = panel?.querySelector('[data-footer-card]');
    const brandKit = panel?.querySelector('[data-ultra-controls]');
    if (!shell || !panel || !contentPanel || !stylePanel || !footerCard || !brandKit || shell.dataset.toolRailReady) return false;

    const lang = document.documentElement.lang === 'es' ? 'es' : 'ca';
    const labels = copy[lang];
    const rail = document.createElement('nav');
    rail.className = 'editor-tool-rail';
    rail.setAttribute('aria-label', lang === 'es' ? 'Herramientas del editor' : 'Eines de l’editor');
    const views = document.createElement('div');
    views.className = 'editor-tool-views';

    const createView = (key, nodes) => {
      const view = document.createElement('section');
      view.className = 'editor-tool-view';
      view.dataset.toolView = key;
      view.hidden = key !== 'blocks';
      view.append(makeTitle(labels[key]));
      nodes.filter(Boolean).forEach((node) => view.append(node));
      views.append(view);
    };

    contentPanel.querySelector('.panel-kicker')?.remove();
    stylePanel.querySelector('.panel-kicker')?.remove();
    createView('blocks', [contentPanel]);
    createView('typography', [stylePanel.querySelector('.poster-style-options')]);
    createView('colors', [stylePanel.querySelector('.poster-premium-style')]);
    createView('watermark', [footerCard]);
    brandKit.open = true;
    createView('brand', [brandKit]);

    ['blocks', 'typography', 'colors', 'watermark', 'brand'].forEach((key) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'editor-tool-rail-button';
      button.dataset.toolTarget = key;
      button.setAttribute('aria-label', labels[key]);
      button.setAttribute('title', labels[key]);
      button.setAttribute('aria-selected', key === 'blocks' ? 'true' : 'false');
      button.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${icons[key]}</svg><span>${labels[key]}</span>`;
      button.addEventListener('click', (event) => {
        selectTool(shell, rail, views, button, key);
      });
      rail.append(button);
    });

    panel.querySelector('.panel-tabs')?.remove();
    contentPanel.removeAttribute('hidden');
    stylePanel.removeAttribute('hidden');
    contentPanel.replaceWith(...contentPanel.childNodes);
    stylePanel.remove();
    panel.append(views);
    shell.prepend(rail);
    shell.classList.add('tool-rail-ready');
    shell.dataset.toolRailReady = 'true';
    installMobileSheet(shell, panel, rail, views);
    installContextualMobileEditing(shell, rail, views, {
      selectionSelector: '[data-live-title],[data-live-subtitle],[data-live-icon]',
      inspectorSelector: '[data-content-panel]'
    });
    if (matchMedia('(max-width: 820px)').matches) {
      shell.classList.remove('mobile-panel-open');
      rail.querySelectorAll('.editor-tool-rail-button').forEach((button) => button.setAttribute('aria-selected', 'false'));
    }
    return true;
  };

  const initialise = () => {
    initialiseDocumentEditor();
    if (document.querySelector('.poster-editor-shell') && !initialisePosterEditor()) {
      const observer = new MutationObserver(() => {
        if (initialisePosterEditor()) observer.disconnect();
      });
      observer.observe(document.querySelector('.poster-editor-shell'), { childList: true, subtree: true });
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialise);
  else initialise();
})();
