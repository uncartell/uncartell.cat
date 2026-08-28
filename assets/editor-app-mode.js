(() => {
  const isQr = Boolean(document.querySelector('.qr-editor'));
  const editor = document.querySelector('#editor, #posterEditor, .qr-editor');
  if (!editor) return;

  const lang = document.documentElement.lang === 'es' ? 'es' : 'ca';
  const projectBar = editor.querySelector('.project-save-bar, .qr-project-bar');
  const path = window.location.pathname;
  const isProductionHost = /^(www\.)?uncartell\.cat$|^(www\.)?uncartel\.es$/.test(window.location.hostname);
  const localeBase = isProductionHost ? '' : (lang === 'es' ? '/es' : '/ca');
  const localizedRoute = slug => `${localeBase}/${slug}`.replace(/\/+/g, '/').replace(/([^/])$/, '$1/');
  const homeHref = localizedRoute('');

  const editorContext = (() => {
    if (/cartells|carteles/.test(path)) {
      return { buttonLabel: lang === 'es' ? 'Plantillas' : 'Plantilles', href: localizedRoute(lang === 'es' ? 'carteles' : 'cartells') };
    }
    if (/taules-de-preus|tablas-de-precios/.test(path)) {
      return { buttonLabel: lang === 'es' ? 'Plantillas' : 'Plantilles', href: localizedRoute(lang === 'es' ? 'tablas-de-precios' : 'taules-de-preus') };
    }
    if (/cartes-i-menus|cartas-y-menus/.test(path)) {
      return { buttonLabel: lang === 'es' ? 'Plantillas' : 'Plantilles', href: localizedRoute(lang === 'es' ? 'cartas-y-menus' : 'cartes-i-menus') };
    }
    return { buttonLabel: lang === 'es' ? 'Inicio' : 'Inici', href: homeHref };
  })();

  const hasUnsavedChanges = () => Boolean(window.UncartellEditorHasUnsavedChanges?.());
  const leaveCopy = lang === 'es'
    ? { title: 'Tienes cambios sin guardar', body: 'Si sales ahora, perderás los cambios que no hayas guardado.', stay: 'Seguir editando', leave: 'Salir sin guardar' }
    : { title: 'Tens canvis sense desar', body: 'Si surts ara, perdràs els canvis que no hagis desat.', stay: 'Continua editant', leave: 'Surt sense desar' };

  const confirmLeave = action => {
    if (!hasUnsavedChanges()) { action(); return; }
    let modal = document.querySelector('[data-editor-leave-modal]');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'editor-leave-modal';
      modal.dataset.editorLeaveModal = '';
      modal.hidden = true;
      modal.innerHTML = `<button class="editor-leave-shade" type="button" data-editor-leave-stay aria-label="${leaveCopy.stay}"></button><section class="editor-leave-card" role="dialog" aria-modal="true" aria-labelledby="editorLeaveTitle"><h2 id="editorLeaveTitle">${leaveCopy.title}</h2><p>${leaveCopy.body}</p><div><button type="button" data-editor-leave-stay>${leaveCopy.stay}</button><button type="button" data-editor-leave-confirm>${leaveCopy.leave}</button></div></section>`;
      document.body.append(modal);
    }
    const close = () => { modal.hidden = true; document.body.classList.remove('editor-leave-open'); };
    modal.querySelectorAll('[data-editor-leave-stay]').forEach(button => { button.onclick = close; });
    modal.querySelector('[data-editor-leave-confirm]').onclick = () => { close(); action(); };
    modal.hidden = false;
    document.body.classList.add('editor-leave-open');
    modal.querySelector('[data-editor-leave-confirm]').focus();
  };

  const ensureContextNavigation = () => {
    if (!projectBar) return;
    const existingContext = projectBar.querySelector('.editor-app-context');
    if (existingContext) {
      existingContext.setAttribute('href', editorContext.href);
      existingContext.setAttribute('aria-label', editorContext.buttonLabel);
      existingContext.setAttribute('title', editorContext.buttonLabel);
      if (!existingContext.dataset.editorContextReady) {
        existingContext.dataset.editorContextReady = 'true';
        existingContext.addEventListener('click', event => {
          event.preventDefault();
          confirmLeave(() => window.location.assign(editorContext.href));
        });
      }
      if (projectBar.classList.contains('qr-project-bar')) {
        projectBar.querySelector(':scope > div')?.classList.add('tool-header-actions');
      }
      return;
    }
    const contextButton = document.createElement('button');
    contextButton.type = 'button';
    contextButton.className = 'editor-app-context';
    contextButton.setAttribute('aria-label', editorContext.buttonLabel);
    contextButton.setAttribute('title', editorContext.buttonLabel);
    contextButton.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5"/><path d="m11 6-6 6 6 6"/></svg><strong>${editorContext.buttonLabel}</strong>`;
    contextButton.addEventListener('click', () => {
      const existingBack = editor.querySelector('#changeFormat, [data-back-to-posters]');
      if (existingBack?.id === 'changeFormat') { existingBack.click(); return; }
      confirmLeave(() => existingBack ? existingBack.click() : window.location.assign(editorContext.href));
    });
    projectBar.prepend(contextButton);

    if (projectBar.classList.contains('qr-project-bar')) {
      const actions = projectBar.querySelector(':scope > div');
      if (actions) actions.classList.add('tool-header-actions');
    }
  };

  const protectLogoNavigation = () => {
    const logo = document.querySelector('.u-logo');
    if (!logo || logo.dataset.editorNavigationReady) return;
    logo.dataset.editorNavigationReady = 'true';
    logo.href = homeHref;
    logo.addEventListener('click', event => {
      if (!document.body.classList.contains('uncartell-editor-active')) return;
      event.preventDefault();
      confirmLeave(() => window.location.assign(homeHref));
    });
  };

  const moveFinalAction = () => {
    if (isQr || !projectBar) return;
    const actions = projectBar.querySelector('.tool-header-actions');
    const finalButton = editor.querySelector('.workspace-actions .primary-button');
    if (!actions || !finalButton || finalButton.classList.contains('editor-app-final-action')) return;
    finalButton.classList.add('editor-app-final-action');
    if (!finalButton.querySelector('svg')) {
      finalButton.insertAdjacentHTML('afterbegin', '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m0 0 5-5m-5 5-5-5M5 21h14"/></svg>');
    }
    actions.append(finalButton);
  };

  const setCompactButtonCopy = () => {
    if (!projectBar) return;
    const actions = projectBar.querySelector('.tool-header-actions');
    if (!actions) return;
    actions.querySelectorAll('button').forEach((button) => {
      if (button.classList.contains('editor-app-final-action')) return;
      const current = button.textContent.trim().toLowerCase();
      let label = '';
      if (/^(desa|guardar|guarda)/.test(current) || button.matches('[data-save-poster], #saveProjectButton, #qrSaveProject')) {
        label = lang === 'es' ? 'Guardar' : 'Desa';
      } else if (/^(obre|abrir|abre)/.test(current) || button.matches('[data-open-poster-projects], #editorOpenProjects, #qrOpenProjects')) {
        label = lang === 'es' ? 'Abrir' : 'Obre';
      }
      if (!label) return;
      [...button.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE).forEach((node) => node.remove());
      button.append(document.createTextNode(label));
      button.setAttribute('aria-label', label);
      button.title = label;
    });
  };

  const projectOpenSelector = [
    '.format-open-project',
    '.open-projects-cta',
    '[data-open-poster-projects]',
    '[data-open-projects]',
    '#editorOpenProjects'
  ].join(',');

  const syncProjectOpenBadges = () => {
    const currentPlan = String(window.UncartellPlatform?.getPlan?.() || document.documentElement.dataset.plan || 'basic').toLowerCase();
    const hasProjectAccess = currentPlan === 'premium' || currentPlan === 'ultra';
    document.querySelectorAll(projectOpenSelector).forEach((button) => {
      // Entitlements are authoritative here. Some catalog/editor components are
      // rendered before the async profile arrives and used to retain their
      // initial Basic class after a Premium/Ultra session had been restored.
      button.classList.toggle('is-plan-locked', !hasProjectAccess);
      const locked = !hasProjectAccess;
      button.classList.toggle('project-open-control', true);
      let badge = button.querySelector(':scope > .project-open-plan-badge');
      // The project-name field already explains the Premium restriction in
      // editor subheaders. A second badge inside Obre would duplicate it.
      const isCatalogueHeadingAction = button.matches('.format-open-project, .catalog-open-project') || button.closest('.format-catalog-heading, .poster-catalog-heading');
      const showsOwnBadge = !isCatalogueHeadingAction && (button.matches('.open-projects-cta') || !button.closest('.project-save-bar,.qr-project-bar'));
      if (locked && showsOwnBadge && !badge) {
        badge = document.createElement('span');
        badge.className = 'project-open-plan-badge';
        badge.textContent = 'Premium';
        badge.setAttribute('aria-hidden', 'true');
        button.append(badge);
      }
      if (badge) badge.hidden = !locked || !showsOwnBadge;
      button.setAttribute('aria-disabled', locked ? 'true' : 'false');
    });
  };

  const update = () => {
    const active = isQr || !editor.hidden;
    document.body.classList.toggle('uncartell-editor-active', active);
    if (active) {
      ensureContextNavigation();
      protectLogoNavigation();
      moveFinalAction();
      setCompactButtonCopy();
    }
    syncProjectOpenBadges();
  };

  new MutationObserver(update).observe(editor, { attributes: true, attributeFilter: ['hidden', 'class'] });
  new MutationObserver(syncProjectOpenBadges).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['class'] });
  document.addEventListener('click', () => requestAnimationFrame(update));
  window.addEventListener('uncartell:plan', () => requestAnimationFrame(syncProjectOpenBadges));
  window.addEventListener('uncartell:auth-ready', () => requestAnimationFrame(syncProjectOpenBadges));
  window.addEventListener('uncartell:auth-change', () => requestAnimationFrame(syncProjectOpenBadges));
  window.UncartellPlatform?.whenReady?.().then(syncProjectOpenBadges);
  window.addEventListener('beforeunload', event => {
    if (!document.body.classList.contains('uncartell-editor-active') || !hasUnsavedChanges()) return;
    event.preventDefault();
    event.returnValue = '';
  });
  update();
})();
