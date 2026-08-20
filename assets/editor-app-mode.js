(() => {
  const isQr = Boolean(document.querySelector('.qr-editor'));
  const editor = document.querySelector('#editor, #posterEditor, .qr-editor');
  if (!editor) return;

  const lang = document.documentElement.lang === 'es' ? 'es' : 'ca';
  const projectBar = editor.querySelector('.project-save-bar, .qr-project-bar');
  const path = window.location.pathname;

  const editorContext = (() => {
    if (/cartells|carteles/.test(path)) {
      return { label: lang === 'es' ? 'Carteles' : 'Cartells', href: lang === 'es' ? '/es/carteles/' : '/ca/cartells/' };
    }
    if (/taules-de-preus|tablas-de-precios/.test(path)) {
      return { label: lang === 'es' ? 'Tablas de precios' : 'Taules de preus', href: lang === 'es' ? '/es/tablas-de-precios/' : '/ca/taules-de-preus/' };
    }
    if (/cartes-i-menus|cartas-y-menus/.test(path)) {
      return { label: lang === 'es' ? 'Cartas y menús' : 'Cartes i menús', href: lang === 'es' ? '/es/cartas-y-menus/' : '/ca/cartes-i-menus/' };
    }
    return { label: lang === 'es' ? 'Códigos QR' : 'Codis QR', href: lang === 'es' ? '/es/' : '/ca/' };
  })();

  const ensureContextNavigation = () => {
    if (!projectBar || projectBar.querySelector('.editor-app-context')) return;
    const contextButton = document.createElement('button');
    contextButton.type = 'button';
    contextButton.className = 'editor-app-context';
    const backLabel = `${lang === 'es' ? 'Volver a' : 'Torna a'} ${editorContext.label}`;
    contextButton.setAttribute('aria-label', backLabel);
    contextButton.setAttribute('title', lang === 'es' ? 'Volver' : 'Torna');
    contextButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 5H5v14h5"/><path d="M14 8l4 4-4 4"/><path d="M8 12h10"/></svg>';
    contextButton.addEventListener('click', () => {
      const existingBack = editor.querySelector('#changeFormat, [data-back-to-posters]');
      if (existingBack) existingBack.click();
      else window.location.assign(editorContext.href);
    });
    projectBar.prepend(contextButton);

    if (projectBar.classList.contains('qr-project-bar')) {
      const actions = projectBar.querySelector(':scope > div');
      if (actions) actions.classList.add('tool-header-actions');
    }
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

  const update = () => {
    const active = isQr || !editor.hidden;
    document.body.classList.toggle('uncartell-editor-active', active);
    if (active) {
      ensureContextNavigation();
      moveFinalAction();
      setCompactButtonCopy();
    }
  };

  new MutationObserver(update).observe(editor, { attributes: true, attributeFilter: ['hidden', 'class'] });
  document.addEventListener('click', () => requestAnimationFrame(update));
  update();
})();
