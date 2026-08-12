(() => {
  const L = window.UNCARTELL_LOCALE;
  const projectStorageKey = `uncartell-menu-projects-preview-user-${L.lang}`;
  const brandKitStorageKey = "uncartell-brand-kit-preview-user";
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const requestedPlan = new URLSearchParams(location.search).get("plan") || ({basic:"free",premium:"premium",ultra:"ultra"}[localStorage.getItem("uncartell-plan-v12") || "basic"]);
  const previewPlan = ["premium", "ultra"].includes(requestedPlan) ? requestedPlan : "free";
  const FEATURES = Object.freeze({ ultraMenuImages: ["localhost", "127.0.0.1"].includes(location.hostname) && window.UNCARTELL_ENABLE_ULTRA_MENU_IMAGES !== false });
  const entitlements = Object.freeze({
    canCreateMobileMenu: plan => plan === "premium" || plan === "ultra",
    canPublishMobileMenu: plan => plan === "premium" || plan === "ultra",
    canUploadMenuImages: plan => plan === "ultra" && FEATURES.ultraMenuImages
  });
  const defaultBrandKit = () => ({ version: 2, businessName: "", logo: null, primary: "#e5372a", secondary: "#181614", font: "modern", footerText: L.lang === "ca" ? "uncartell.cat" : "uncartel.es", footerTextSet: false });
  const readBrandKit = () => {
    try { const raw = JSON.parse(localStorage.getItem(brandKitStorageKey) || "null") || {}; const kit = { ...defaultBrandKit(), ...raw, version: 2, primary: raw.primary || raw.colorPrimary || raw.primaryColor || "#e5372a", secondary: raw.secondary || raw.colorSecondary || raw.secondaryColor || "#181614", logo: raw.logo || raw.logoData || null, font: raw.font || raw.style || "modern" }; if (!kit.footerTextSet) kit.footerText = L.lang === "ca" ? "uncartell.cat" : "uncartel.es"; return kit; } catch (_) { return defaultBrandKit(); }
  };

  const makeBlock = (type, overrides = {}) => {
    const base = { id: uid(), type };
    if (type === "spacer-large") return { ...base, ...overrides };
    if (type === "section") return { ...base, text: L.defaults.section, ...overrides };
    if (type === "dish" || type === "dish-image") return { ...base, name: L.defaults.dish, description: L.defaults.description, price: L.defaults.price, allergens: [], image: null, imagePosition: "above", ...overrides };
    if (type === "separator") return { ...base, ...overrides };
    if (type === "note") return { ...base, text: L.defaults.note, ...overrides };
    return { ...base, text: L.defaults.note, ...overrides };
  };

  const starterBlocks = (variant = 0) => variant === 0
    ? [makeBlock("section", { text: L.lang === "ca" ? "Per començar" : "Para empezar" }), makeBlock("dish", { name: L.lang === "ca" ? "Croquetes de rostit" : "Croquetas de asado", description: L.lang === "ca" ? "Cremoses i cruixents" : "Cremosas y crujientes", price: "9,50 €", allergens: ["gluten", "milk"] }), makeBlock("dish", { name: L.lang === "ca" ? "Bunyols de bacallà" : "Buñuelos de bacalao", description: L.lang === "ca" ? "Amb allioli suau" : "Con alioli suave", price: "10,00 €", allergens: ["gluten", "fish"] }), makeBlock("dish", { name: L.lang === "ca" ? "Braves de la casa" : "Bravas de la casa", description: L.lang === "ca" ? "Salsa picant i allioli" : "Salsa picante y alioli", price: "7,50 €" })]
    : [makeBlock("section", { text: L.lang === "ca" ? "Plats principals" : "Platos principales" }), makeBlock("dish", { name: L.lang === "ca" ? "Arròs de temporada" : "Arroz de temporada", description: L.lang === "ca" ? "Verdures, bolets i herbes fresques" : "Verduras, setas y hierbas frescas", price: "18,50 €" }), makeBlock("dish", { name: L.lang === "ca" ? "Peix del dia" : "Pescado del día", description: L.lang === "ca" ? "Amb guarnició de mercat" : "Con guarnición de mercado", price: "22,00 €", allergens: ["fish"] }), makeBlock("dish", { name: L.lang === "ca" ? "Pollastre de corral" : "Pollo de corral", description: L.lang === "ca" ? "Patata rostida i salsa del rostit" : "Patata asada y salsa del asado", price: "19,00 €" })];

  const verticalBlocks = (variant = 0) => variant === 0 ? [
    makeBlock("section", { text: L.lang === "ca" ? "Vins negres" : "Vinos tintos" }),
    makeBlock("dish", { name: "Flor d’Empordà · Oliver Conti", description: L.lang === "ca" ? "Carinyena, garnatxa i syrah · Empordà" : "Cariñena, garnacha y syrah · Empordà", price: "43 €", allergens: ["sulphites"] }),
    makeBlock("dish", { name: "Encanteri · Massís de l’Albera", description: L.lang === "ca" ? "Carinyena, garnatxa i syrah · Empordà" : "Cariñena, garnacha y syrah · Empordà", price: "21 €", allergens: ["sulphites"] }),
    makeBlock("dish", { name: "Cartoixa · Scala Dei", description: L.lang === "ca" ? "Cabernet, carinyena, garnatxa i syrah · Priorat" : "Cabernet, cariñena, garnacha y syrah · Priorat", price: "38 €", allergens: ["sulphites"] }),
    makeBlock("dish", { name: "Sierra Cantabria Cuvée Especial", description: "Tempranillo · Rioja", price: "25,50 €", allergens: ["sulphites"] })
  ] : [
    makeBlock("section", { text: L.lang === "ca" ? "Selecció especial" : "Selección especial" }),
    makeBlock("dish", { name: "Viña Zaco Viñedo Singular", description: "Tempranillo · Rioja", price: "48 €", allergens: ["sulphites"] }),
    makeBlock("dish", { name: "La Creu Alta · Mas Alta", description: L.lang === "ca" ? "Garnatxa i carinyena · Priorat" : "Garnacha y cariñena · Priorat", price: "90 €", allergens: ["sulphites"] }),
    makeBlock("dish", { name: "La Font Voltada · Abadia de Poblet", description: "Trepat · Conca de Barberà", price: "44 €", allergens: ["sulphites"] }),
    makeBlock("section", { text: L.lang === "ca" ? "Vi rosat" : "Vino rosado" }),
    makeBlock("dish", { name: "Pla dels Àngels · Scala Dei", description: L.lang === "ca" ? "Garnatxa · Priorat" : "Garnacha · Priorat", price: "30 €", allergens: ["sulphites"] })
  ];

  const dailyMenuBlocks = () => [
    makeBlock("section", { text: L.lang === "ca" ? "Primers" : "Primeros" }),
    makeBlock("dish", { name: L.lang === "ca" ? "Amanida de tomàquet i formatge fresc" : "Ensalada de tomate y queso fresco", description: L.lang === "ca" ? "Vinagreta d’herbes" : "Vinagreta de hierbas", price: "", allergens: ["milk"] }),
    makeBlock("dish", { name: L.lang === "ca" ? "Crema de carbassa rostida" : "Crema de calabaza asada", description: L.lang === "ca" ? "Llavors torrades" : "Semillas tostadas", price: "" }),
    makeBlock("section", { text: L.lang === "ca" ? "Segons" : "Segundos" }),
    makeBlock("dish", { name: L.lang === "ca" ? "Arròs melós de bolets" : "Arroz meloso de setas", description: L.lang === "ca" ? "Amb parmesà" : "Con parmesano", price: "", allergens: ["milk"] }),
    makeBlock("dish", { name: L.lang === "ca" ? "Pollastre rostit amb patates" : "Pollo asado con patatas", description: L.lang === "ca" ? "Salsa del rostit" : "Salsa del asado", price: "" }),
    makeBlock("section", { text: L.lang === "ca" ? "Postres" : "Postres" }),
    makeBlock("dish", { name: L.lang === "ca" ? "Crema catalana o fruita del dia" : "Crema catalana o fruta del día", description: "", price: "", allergens: ["egg", "milk"] }),
    makeBlock("note", { text: L.lang === "ca" ? "Menú complet · 19,50 € · Pa i aigua inclosos" : "Menú completo · 19,50 € · Pan y agua incluidos" })
  ];

  const foldedPages = () => [
    { role: "cover", restaurant: L.defaults.restaurant, title: L.defaults.coverTitle, subtitle: L.defaults.coverSubtitle, blocks: [] },
    { role: "inside", blocks: starterBlocks(0) },
    { role: "inside", blocks: starterBlocks(1) },
    { role: "back", title: L.defaults.backTitle, body: L.defaults.backBody, blocks: [] }
  ];

  const doubleSidedPages = () => [
    { role: "inside", side: "front", blocks: starterBlocks(0) },
    { role: "inside", side: "back", showAllergenLegend: true, blocks: starterBlocks(1) }
  ];

  const brandBackPages = () => [
    { role: "inside", side: "front", blocks: starterBlocks(0) },
    { role: "cover", side: "back", restaurant: L.defaults.restaurant, title: L.defaults.coverTitle, subtitle: L.defaults.coverSubtitle, blocks: [] }
  ];

  const singleSheetPages = () => [
    { role: "inside", side: "front", showAllergenLegend: true, blocks: dailyMenuBlocks() },
    { role: "cover", side: "back", restaurant: L.defaults.restaurant, title: L.lang === "ca" ? "Menú del dia" : "Menú del día", subtitle: L.lang === "ca" ? "Cuina de mercat" : "Cocina de mercado", blocks: [] }
  ];

  const mobileSection = (key, title, dishes) => ({
    role: "mobile-section",
    key,
    title,
    blocks: [makeBlock("section", { text: title }), ...dishes.map(dish => makeBlock("dish", dish))]
  });

  const mobilePages = () => {
    const ca = L.lang === "ca";
    return [
      { role: "mobile-home", title: L.defaults.coverTitle, subtitle: L.defaults.coverSubtitle, restaurant: L.defaults.restaurant, blocks: [] },
      mobileSection("starters", ca ? "Entrants" : "Entrantes", [
        { name: ca ? "Croquetes de rostit" : "Croquetas de asado", description: ca ? "Cremoses i cruixents" : "Cremosas y crujientes", price: "9,50 €", allergens: ["gluten", "milk"] },
        { name: ca ? "Bunyols de bacallà" : "Buñuelos de bacalao", description: ca ? "Amb allioli suau" : "Con alioli suave", price: "10,00 €", allergens: ["gluten", "fish"] }
      ]),
      mobileSection("mains", ca ? "Principals" : "Principales", [
        { name: ca ? "Arròs de temporada" : "Arroz de temporada", description: ca ? "Verdures, bolets i herbes fresques" : "Verduras, setas y hierbas frescas", price: "18,50 €", allergens: [] },
        { name: ca ? "Peix del dia" : "Pescado del día", description: ca ? "Amb guarnició de mercat" : "Con guarnición de mercado", price: "s/m", allergens: ["fish"] }
      ]),
      mobileSection("daily", ca ? "Menú del dia" : "Menú del día", [
        { name: ca ? "Primer + segon + postres" : "Primero + segundo + postre", description: ca ? "De dimarts a divendres al migdia" : "De martes a viernes al mediodía", price: "19,50 €", allergens: [] }
      ]),
      mobileSection("desserts", ca ? "Postres" : "Postres", [
        { name: ca ? "Crema catalana" : "Crema catalana", description: ca ? "Cremada al moment" : "Quemada al momento", price: "6,50 €", allergens: ["egg", "milk"] },
        { name: ca ? "Pastís de llimona" : "Tarta de limón", description: ca ? "Amb merenga lleugera" : "Con merengue ligero", price: "7,00 €", allergens: ["gluten", "egg", "milk"] }
      ]),
      mobileSection("wines", ca ? "Vins" : "Vinos", [
        { name: "Xarel·lo del Penedès", description: ca ? "Blanc sec i fresc" : "Blanco seco y fresco", price: "24,00 €", allergens: ["sulphites"] },
        { name: "Garnatxa de Montsant", description: ca ? "Negre afruitat" : "Tinto afrutado", price: "27,00 €", allergens: ["sulphites"] },
        { name: "Trepat de la Conca de Barberà", description: ca ? "Negre lleuger" : "Tinto ligero", price: "29,00 €", allergens: ["sulphites"] }
      ]),
      mobileSection("drinks", ca ? "Begudes" : "Bebidas", [
        { name: ca ? "Aigua mineral" : "Agua mineral", description: "50 cl", price: "2,50 €", allergens: [] },
        { name: ca ? "Refresc artesà" : "Refresco artesano", description: ca ? "Llimona o taronja" : "Limón o naranja", price: "3,50 €", allergens: [] }
      ]),
      { role: "mobile-allergens", key: "allergens", title: ca ? "Al·lèrgens" : "Alérgenos", blocks: [] }
    ];
  };

  const pagesForFormat = format => {
    if (format === "mobile-interactive") return mobilePages();
    const pages = format.startsWith("a4-single-") ? singleSheetPages() : format === "a4-double" ? doubleSidedPages() : format === "a4-brand-back" ? brandBackPages() : foldedPages();
    if (format === "a4-portrait") pages.filter(page => page.role === "inside").forEach((page, index) => { page.blocks = verticalBlocks(index); });
    return pages;
  };

  const initialState = () => {
    const brandKit = readBrandKit();
    const useBrandKit = previewPlan === "ultra";
    return ({
    projectId: uid(),
    projectName: L.defaultProject,
    format: null,
    plan: previewPlan,
    style: useBrandKit ? brandKit.font : "modern",
    accent: useBrandKit ? brandKit.primary : "#e5372a",
    textColor: useBrandKit ? brandKit.secondary : "#181614",
    contentColumns: 2,
    activePage: 0,
    selectedBlock: null,
    isDirty: false,
    changeCount: 0,
    freePromptShown: false,
    lastAutoSavedAt: null,
    basicDraftExpiresAt: null,
    extraPagesDirty: false,
    mobilePublication: { slug: "", status: "draft", publishedAt: null },
    brandKit,
    pages: foldedPages()
  });};

  let state = initialState();
  window.addEventListener("uncartell:plan", event => {
    const globalPlan = event.detail?.plan;
    const nextPlan = globalPlan === "basic" ? "free" : globalPlan;
    if (!["free", "premium", "ultra"].includes(nextPlan) || state.plan === nextPlan) return;
    state.plan = nextPlan;
    if (nextPlan === "ultra") state.brandKit = readBrandKit();
    renderAll();
  });
  let autoSaveTimer = null;
  let editorZoom = 1;
  let history = [];
  let historyIndex = -1;
  const historySnapshot = () => JSON.stringify({ ...state, lastAutoSavedAt: state.lastAutoSavedAt ? new Date(state.lastAutoSavedAt).toISOString() : null });
  function resetHistory() { history = [historySnapshot()]; historyIndex = 0; renderHistoryControls(); }
  function recordHistory() {
    const snapshot = historySnapshot();
    if (history[historyIndex] === snapshot) return;
    history = history.slice(0, historyIndex + 1);
    history.push(snapshot);
    if (history.length > 80) history.shift(); else historyIndex += 1;
    renderHistoryControls();
  }
  function restoreHistory(index) {
    if (index < 0 || index >= history.length) return;
    historyIndex = index;
    state = JSON.parse(history[index]);
    if (state.lastAutoSavedAt) state.lastAutoSavedAt = new Date(state.lastAutoSavedAt);
    renderAll();
  }
  function renderHistoryControls() {
    if (!$("#undoButton")) return;
    $("#undoButton").title = L.undo;
    $("#undoButton").setAttribute("aria-label", L.undo);
    $("#redoButton").title = L.redo;
    $("#redoButton").setAttribute("aria-label", L.redo);
    const zoomOutLabel = L.lang === "ca" ? "Redueix el zoom" : "Reducir el zoom";
    const zoomInLabel = L.lang === "ca" ? "Augmenta el zoom" : "Aumentar el zoom";
    $("#zoomOutButton").title = zoomOutLabel;
    $("#zoomOutButton").setAttribute("aria-label", zoomOutLabel);
    $("#zoomInButton").title = zoomInLabel;
    $("#zoomInButton").setAttribute("aria-label", zoomInLabel);
    $("#undoButton").disabled = historyIndex <= 0;
    $("#redoButton").disabled = historyIndex >= history.length - 1;
  }

  const autoSavedLabel = date => `${L.lang === "ca" ? "Desat" : "Guardado"} · ${date.toLocaleDateString(L.lang === "ca" ? "ca-ES" : "es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })}, ${date.toLocaleTimeString(L.lang === "ca" ? "ca-ES" : "es-ES", { hour: "2-digit", minute: "2-digit" })}`;
  function scheduleAutoSave() {
    clearTimeout(autoSaveTimer);
    if (["premium", "ultra"].includes(state.plan) && state.projectName.trim()) autoSaveTimer = setTimeout(() => saveProject(true), 120000);
  }

  const save = () => {
    state.isDirty = true;
    state.changeCount += 1;
    if (state.plan === "free") {
      state.basicDraftExpiresAt = Date.now() + 7 * 60 * 60 * 1000;
      $("#saveStatus").textContent = L.basicDraftStatus;
    } else {
      $("#saveStatus").textContent = L.unsaved;
      scheduleAutoSave();
    }
    if (state.plan === "free" && state.changeCount >= 9 && !state.freePromptShown) {
      state.freePromptShown = true;
      setTimeout(() => { $("#freeChangesModal").hidden = false; $("#continueFree").focus(); }, 0);
    }
    if (state.pages[state.activePage]?.isExtra) state.extraPagesDirty = true;
    recordHistory();
  };
  const saveProject = (silent = false) => {
    if (state.plan !== "premium" && state.plan !== "ultra") {
      toast(L.messages.premiumRequired);
      return false;
    }
    const name = state.projectName.trim();
    if (!name) {
      toast(L.messages.projectNameRequired);
      $("#projectName").focus();
      return false;
    }
    state.projectName = name;
    const persistentPages = JSON.parse(JSON.stringify(state.pages, (_key, value) => typeof value === "string" && value.startsWith("blob:") ? null : value));
    const payload = {
      id: state.projectId,
      owner_id: "preview-user",
      name,
      updated_at: new Date().toISOString(),
      document: {
        version: 1,
        product_type: "menu",
        format: state.format,
        style: state.style,
        accent: state.accent,
        text_color: state.textColor,
        content_columns: state.contentColumns,
        brand_kit: { ...state.brandKit, logo: null, uses_saved_logo: !!state.brandKit.logo },
        pages: persistentPages,
        mobile_publication: state.mobilePublication
      }
    };
    let projects = [];
    try { projects = JSON.parse(localStorage.getItem(projectStorageKey) || "[]"); } catch (_) {}
    projects = projects.filter(project => project.id !== payload.id);
    projects.unshift(payload);
    localStorage.setItem(projectStorageKey, JSON.stringify(projects.slice(0, 20)));
    state.isDirty = false;
    state.lastAutoSavedAt = new Date();
    $("#saveStatus").textContent = autoSavedLabel(state.lastAutoSavedAt);
    if (!silent) toast(L.previewSavedProject);
    renderProjects();
    return true;
  };
  const toast = (message, action = null) => {
    const node = $("#toast");
    node.innerHTML = `<span>${escapeHtml(message)}</span>${action ? `<button type="button">${escapeHtml(action.label)}</button>` : ""}`;
    if (action) $("button", node).addEventListener("click", () => { action.callback(); node.classList.remove("show"); });
    node.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => node.classList.remove("show"), action?.duration || 2400);
  };
  function openPlanGate(required = "Premium") {
    if (window.UncartellPlatform?.openUpgradeModal) return window.UncartellPlatform.openUpgradeModal();
    $("#planGateTitle").textContent = L.lockedFeatureTitle;
    $("#planGateCopy").textContent = L.lockedFeatureCopy.replace("{plan}", required);
    $("#continueEditing").textContent = L.stayEditing;
    $("#viewPlans").textContent = L.viewPlans;
    $("#planGateModal").hidden = false;
    $("#viewPlans").focus();
  }
  const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[char]));

  function renderFormats() {
    $("#formatGrid").innerHTML = L.formats.map(format => {
      const mobileLocked = format.id === "mobile-interactive" && !entitlements.canCreateMobileMenu(state.plan);
      return `
      <article class="format-card${format.id === "mobile-interactive" ? " format-featured" : ""}${mobileLocked ? " is-premium-locked" : ""}" data-format="${format.id}">
        <span class="format-tag">${escapeHtml(format.tag)}</span>
        ${mobileLocked ? '<span class="format-plan-badge">Premium</span>' : ""}
        <span class="format-paper-wrap"><span class="format-paper ${format.id}"><span class="format-columns cols-${format.columns}">${Array.from({length:format.columns}, () => '<i class="format-column"></i>').join("")}</span></span></span>
        <span class="format-copy"><h2>${escapeHtml(format.name)}</h2><p>${escapeHtml(format.detail)}</p><p>${escapeHtml(format.fold)}</p></span>
        <span class="format-actions"><button type="button" data-format-action="demo"><svg viewBox="0 0 24 24"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/></svg>${escapeHtml(L.demo)}</button><button type="button" data-format-action="personalize"><svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 1 0 0 18h1.2a1.8 1.8 0 0 0 0-3.6H12a1.5 1.5 0 0 1 0-3h2.5A6.5 6.5 0 0 0 21 8c0-2.8-4-5-9-5Z"/><circle cx="7.5" cy="10" r=".7"/><circle cx="10" cy="7" r=".7"/><circle cx="14" cy="7" r=".7"/></svg>${escapeHtml(L.personalizeFormat)}</button></span>
      </article>`;
    }).join("");
    $$("[data-format-action]").forEach(button => button.addEventListener("click", () => {
      const format = button.closest("[data-format]").dataset.format;
      if (button.dataset.formatAction === "demo") openDemo(format);
      else if (format === "mobile-interactive" && !entitlements.canCreateMobileMenu(state.plan)) openPlanGate("Premium");
      else openEditor(format);
    }));
  }

  function openDemo(format) {
    const definition = L.formats.find(item => item.id === format);
    const dishes = format === "a4-portrait"
      ? [[L.lang === "ca" ? "Vins negres" : "Vinos tintos", "Flor d’Empordà", "Cartoixa · Scala Dei"], [L.lang === "ca" ? "Selecció especial" : "Selección especial", "Viña Zaco", "Pla dels Àngels"]]
      : format.startsWith("a4-single-")
        ? [[L.lang === "ca" ? "Primers" : "Primeros", L.lang === "ca" ? "Amanida de tomàquet" : "Ensalada de tomate", L.lang === "ca" ? "Crema de carbassa" : "Crema de calabaza"], [L.lang === "ca" ? "Segons" : "Segundos", L.lang === "ca" ? "Arròs melós de bolets" : "Arroz meloso de setas", L.lang === "ca" ? "Pollastre rostit" : "Pollo asado"]]
        : [[L.lang === "ca" ? "Per començar" : "Para empezar", L.lang === "ca" ? "Croquetes de rostit" : "Croquetas de asado", L.lang === "ca" ? "Bunyols de bacallà" : "Buñuelos de bacalao"], [L.lang === "ca" ? "Plats principals" : "Platos principales", L.lang === "ca" ? "Arròs de temporada" : "Arroz de temporada", L.lang === "ca" ? "Peix del dia" : "Pescado del día"]];
    $("#demoEyebrow").textContent = L.demo;
    $("#demoModalTitle").textContent = definition.name;
    $("#demoModalCopy").textContent = `${definition.detail}. ${definition.fold}.`;
    $("#demoPreview").innerHTML = format === "mobile-interactive"
      ? `<div class="demo-phone"><span>${escapeHtml(L.defaults.restaurant)}</span><strong>${escapeHtml(L.defaults.coverTitle)}</strong><div>${mobilePages().slice(1).map(page => `<b>${escapeHtml(page.title)}</b>`).join("")}</div><small>${escapeHtml(L.mobileExplore)}</small></div>`
      : `<div class="demo-paper demo-${format}"><span class="demo-restaurant">RESTAURANT L’OLIVERA</span><strong>${escapeHtml(format.startsWith("a4-single-") ? (L.lang === "ca" ? "Menú del dia" : "Menú del día") : format === "a4-portrait" ? (L.lang === "ca" ? "Carta de vins" : "Carta de vinos") : (L.lang === "ca" ? "La nostra carta" : "Nuestra carta"))}</strong><div class="demo-columns">${dishes.map(group => `<div><b>${escapeHtml(group[0])}</b>${group.slice(1).map((dish, i) => `<span>${escapeHtml(dish)} <em>${i ? "18,50 €" : "9,50 €"}</em></span>`).join("")}</div>`).join("")}</div><small>${L.lang === "ca" ? "CREAT AMB UNCARTELL.CAT" : "CREADO CON UNCARTEL.ES"}</small></div>`;
    $("#demoModal").hidden = false;
    $(".demo-modal .modal-close").focus();
  }

  function openEditor(format) {
    if (format === "mobile-interactive" && !entitlements.canCreateMobileMenu(state.plan)) return openPlanGate("Premium");
    if (state.format !== format) {
      state.pages = pagesForFormat(format);
      state.contentColumns = format === "a3-landscape" ? 2 : 1;
    }
    state.format = format;
    state.activePage = 0;
    state.selectedBlock = null;
    $("#formats").hidden = true;
    $("#editor").hidden = false;
    resetHistory();
    renderAll();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderAll() {
    renderPageTabs();
    renderBlockButtons();
    renderStyles();
    renderInspector();
    renderPage();
    renderPlans();
    renderProjects();
    renderHistoryControls();
  }

  function renderPageTabs() {
    const labels = state.format === "mobile-interactive"
      ? state.pages.map(page => page.role === "mobile-home" ? L.mobileHome : page.title)
      : state.format.startsWith("a4-single-") || state.format === "a4-double" || state.format === "a4-brand-back"
      ? L.doubleSidedPages
      : state.pages.map((page, index) => index === 0 ? L.pages[0] : index === state.pages.length - 1 && page.role === "back" ? L.pages[3] : `${L.lang === "ca" ? "Pàgina" : "Página"} ${index}`);
    const tabs = labels.map((page, index) => `<button class="page-tab ${index === state.activePage ? "active" : ""}" type="button" data-page="${index}">${index + 1}. ${escapeHtml(page)}</button>`).join("");
    const ultraControl = state.format === "a3-landscape" && state.pages.length === 4
      ? `<button class="ultra-pages-button ${state.plan === "ultra" ? "" : "locked"}" id="addUltraPages" type="button">${state.plan === "ultra" ? "＋" : '<span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 8 4 4 4-7 4 7 4-4-2 11H6L4 8Z"/><path d="M6 19h12"/></svg>Ultra</span>'} ${escapeHtml(L.addUltraPages)}</button>`
      : state.format === "a3-landscape" && state.pages.length > 4 ? `<button class="ultra-pages-button remove-pages-button" id="removeUltraPages" type="button">− ${escapeHtml(L.removeUltraPages)}</button>` : "";
    $("#pageTabs").innerHTML = tabs + ultraControl;
    $$(".page-tab").forEach(button => button.addEventListener("click", () => {
      state.activePage = Number(button.dataset.page);
      state.selectedBlock = null;
      renderAll();
    }));
    const addUltraPages = $("#addUltraPages");
    if (addUltraPages) addUltraPages.addEventListener("click", () => {
      if (state.plan !== "ultra") {
        openPlanGate("Ultra");
        return;
      }
      const backCover = state.pages.pop();
      state.pages.push(
        { role: "inside", isExtra: true, blocks: starterBlocks(0) },
        { role: "inside", isExtra: true, blocks: starterBlocks(1) },
        { role: "inside", isExtra: true, blocks: starterBlocks(0) },
        { role: "inside", isExtra: true, blocks: starterBlocks(1) },
        backCover
      );
      state.activePage = 3;
      state.extraPagesDirty = false;
      save();
      state.extraPagesDirty = false;
      renderAll();
      toast(L.ultraPagesAdded);
    });
    $("#removeUltraPages")?.addEventListener("click", () => {
      if (state.extraPagesDirty) {
        $("#removePagesTitle").textContent = L.removePagesTitle;
        $("#removePagesCopy").textContent = L.removePagesCopy;
        $("#cancelRemovePages").textContent = L.cancel;
        $("#confirmRemovePages").textContent = L.confirmRemovePages;
        $("#removePagesModal").hidden = false;
      } else removeUltraPages();
    });
  }

  function removeUltraPages() {
    state.pages = state.pages.filter(page => !page.isExtra);
    state.activePage = Math.min(state.activePage, state.pages.length - 1);
    state.selectedBlock = null;
    state.extraPagesDirty = false;
    save(); renderAll(); toast(L.ultraPagesRemoved);
  }

  function renderBlockButtons() {
    const disabled = ["cover", "back", "mobile-home", "mobile-allergens"].includes(state.pages[state.activePage].role);
    $("#blockButtons").innerHTML = L.blockTypes.map(block => {
      const ultraLocked = block.id === "dish-image" && !entitlements.canUploadMenuImages(state.plan);
      const crown = '<span class="block-plan-chip"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 8 4 4 4-7 4 7 4-4-2 11H6L4 8Z"/><path d="M6 19h12"/></svg>Ultra</span>';
      const symbol = block.id === "dish-image" ? '<svg class="block-photo-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="9" r="1.7"/><path d="m5 18 5-5 3 3 2-2 4 4"/></svg>' : escapeHtml(block.symbol);
      return `<button class="block-add${block.id === "dish-image" ? " dish-image-add" : ""}${ultraLocked ? " ultra-locked" : ""}" type="button" data-add="${block.id}" ${disabled ? "disabled" : ""}><span class="block-symbol">${symbol}</span>${escapeHtml(block.label)}${ultraLocked ? crown : ""}</button>`;
    }).join("");
    $$(".block-add").forEach(button => button.addEventListener("click", () => {
      if (button.dataset.add === "dish-image" && !entitlements.canUploadMenuImages(state.plan)) return openPlanGate("Ultra");
      const block = makeBlock(button.dataset.add);
      const blocks = state.pages[state.activePage].blocks;
      const selectedIndex = blocks.findIndex(item => item.id === state.selectedBlock);
      block.column = selectedIndex >= 0 ? (blocks[selectedIndex].column || 1) : 1;
      tryInsertBlock(state.pages[state.activePage], block, selectedIndex >= 0 ? selectedIndex + 1 : blocks.length);
    }));
  }

  function renderStyles() {
    const singleColumnOnly = state.format === "mobile-interactive" || state.format === "a4-portrait";
    $(".column-settings").hidden = singleColumnOnly;
    if (singleColumnOnly) state.contentColumns = 1;
    $("#styleOptions").innerHTML = L.styles.map(item => `<button class="style-option ${state.style === item.id ? "active" : ""}" type="button" data-style="${item.id}"><strong>${escapeHtml(item.label)}</strong><small>${escapeHtml(item.font)}</small></button>`).join("");
    $$(".style-option").forEach(button => button.addEventListener("click", () => {
      state.style = button.dataset.style;
      save();
      renderStyles();
      renderPage();
    }));
    $$("#columnChoice [data-columns]").forEach(button => {
      button.classList.toggle("active", Number(button.dataset.columns) === state.contentColumns);
      button.addEventListener("click", () => {
        state.contentColumns = Number(button.dataset.columns);
        save();
        renderStyles();
        renderPage();
      });
    });
    const canUsePremium = state.plan === "premium" || state.plan === "ultra";
    $(".premium-style").classList.toggle("is-locked", !canUsePremium);
    $("#accentColor").disabled = !canUsePremium;
    $("#textColor").disabled = !canUsePremium;
    $("#accentColor").value = state.accent;
    $("#textColor").value = state.textColor;
    const footerCard = $("#footerStyleCard");
    const footerIsUltra = state.plan === "ultra";
    footerCard.className = `footer-style-card plan-${state.plan}${footerIsUltra ? "" : " is-locked"}`;
    $("#footerStyleTitle").textContent = L.watermarkFooterTitle;
    $("#footerStyleCopy").textContent = footerIsUltra ? L.watermarkFooterUltraCopy : state.plan === "premium" ? L.watermarkFooterPremiumCopy : L.watermarkFooterBasicCopy;
    const footerBadgeIcon = footerIsUltra ? "" : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 8 4 4 4-7 4 7 4-4-2 11H6L4 8Z"/><path d="M6 19h12"/></svg>';
    $("#footerStyleBadge").innerHTML = `${footerBadgeIcon}Ultra`;
    $("#footerStyleBadge").hidden = footerIsUltra;
    $("#footerStyleEditor").hidden = !footerIsUltra;
    $("#styleFooterText").value = state.brandKit.footerText || "";
    $("#styleFooterText").placeholder = L.footerTextPlaceholder;
    $("#styleFooterClear").setAttribute("aria-label", L.removeFooterText);
    const kitLocked = state.plan !== "ultra";
    $("#brandKit").classList.toggle("is-locked", kitLocked);
    if (kitLocked) $("#brandKit").open = false;
    $("#kitBusinessName").value = state.brandKit.businessName || "";
    $("#kitPrimary").value = state.brandKit.primary || "#e5372a";
    $("#kitSecondary").value = state.brandKit.secondary || "#181614";
    $("#kitFont").value = state.brandKit.font || "modern";
    $("#kitLogoPreview").classList.toggle("show", !!state.brandKit.logo);
    $("#kitLogoPreview").innerHTML = state.brandKit.logo ? `<img src="${state.brandKit.logo}" alt="">` : "";
  }

  function field(label, key, value, multiline = false) {
    const control = multiline
      ? `<textarea data-field="${key}">${escapeHtml(value)}</textarea>`
      : `<input type="text" data-field="${key}" value="${escapeHtml(value)}">`;
    return `<label class="field"><span>${escapeHtml(label)}</span>${control}</label>`;
  }

  async function optimizeDishImage(file) {
    if (!entitlements.canUploadMenuImages(state.plan)) throw new Error("not-entitled");
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error("invalid-format");
    const bitmap = await createImageBitmap(file);
    const ratio = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * ratio));
    canvas.height = Math.max(1, Math.round(bitmap.height * ratio));
    canvas.getContext("2d", { alpha: false }).drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return await new Promise((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("compression-failed")), "image/jpeg", .78));
  }

  function wireMobileSections(box) {
    let draggedSection = null;
    let pointerSection = null;
    const moveSection = (from, to) => {
      if (from === to || from < 1 || to < 1 || from >= state.pages.length || to >= state.pages.length) return;
      const [section] = state.pages.splice(from, 1);
      state.pages.splice(to, 0, section);
      save(); renderAll();
    };
    $$(".mobile-section-row", box).forEach(row => {
      const index = Number(row.dataset.sectionIndex);
      $("input", row).addEventListener("input", event => {
        const section = state.pages[index];
        section.title = event.target.value;
        const heading = section.blocks?.find(block => block.type === "section");
        if (heading) heading.text = section.title;
        save(); renderPageTabs(); renderPage();
      });
      const handle = $("[data-section-drag]", row);
      handle.draggable = true;
      handle.addEventListener("dragstart", event => { draggedSection = index; row.classList.add("dragging"); event.dataTransfer.effectAllowed = "move"; event.dataTransfer.setData("text/plain", String(index)); });
      handle.addEventListener("dragend", () => { draggedSection = null; $$(".mobile-section-row", box).forEach(item => item.classList.remove("dragging", "drag-target")); });
      row.addEventListener("dragover", event => { event.preventDefault(); $$(".mobile-section-row", box).forEach(item => item.classList.remove("drag-target")); row.classList.add("drag-target"); });
      row.addEventListener("drop", event => { event.preventDefault(); moveSection(draggedSection || Number(event.dataTransfer.getData("text/plain")), index); });
      handle.addEventListener("pointerdown", event => { event.preventDefault(); draggedSection = index; pointerSection = index; handle.setPointerCapture(event.pointerId); row.classList.add("dragging"); });
      handle.addEventListener("pointermove", event => { if (!draggedSection) return; const target = document.elementFromPoint(event.clientX, event.clientY)?.closest(".mobile-section-row"); if (target) { pointerSection = Number(target.dataset.sectionIndex); $$(".mobile-section-row", box).forEach(item => item.classList.toggle("drag-target", item === target)); } });
      handle.addEventListener("pointerup", () => { const from = draggedSection; const to = pointerSection; draggedSection = null; pointerSection = null; $$(".mobile-section-row", box).forEach(item => item.classList.remove("dragging", "drag-target")); moveSection(from, to); });
      $("[data-section-delete]", row).addEventListener("click", () => {
        state.pages.splice(index, 1); save(); renderAll();
      });
    });
    $(".add-mobile-section", box)?.addEventListener("click", () => {
      if (state.pages.length - 1 >= 7) return;
      const number = state.pages.length;
      state.pages.push(mobileSection(`custom-${uid()}`, `${L.mobileNewSection} ${number}`, []));
      save(); renderAll();
    });
  }

  const normalizeSlug = value => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48);
  function wireMobilePublication(box) {
    state.mobilePublication ||= { slug: "", status: "draft", publishedAt: null };
    $("#mobilePublicationLocked", box)?.addEventListener("click", () => openPlanGate("Ultra"));
    const input = $("#mobileSlug", box);
    if (!input) return;
    const status = $("#mobileSlugStatus", box);
    const refresh = () => {
      const slug = normalizeSlug(input.value);
      input.value = slug;
      $("#mobileSlugPreview", box).textContent = slug || "escriu-el-nom";
      const collision = getProjects().some(project => project.id !== state.projectId && project.document?.mobile_publication?.slug === slug);
      status.textContent = !slug ? L.slugRequired : collision ? L.slugUnavailable : L.slugAvailable;
      status.className = slug && !collision ? "is-available" : "is-unavailable";
      $("#publishMobileMenu", box).disabled = !slug || collision;
      return { slug, collision };
    };
    input.addEventListener("input", refresh);
    input.addEventListener("blur", () => { state.mobilePublication.slug = normalizeSlug(input.value); save(); });
    $("#publishMobileMenu", box).addEventListener("click", async event => {
      const { slug, collision } = refresh();
      if (!slug || collision || !entitlements.canPublishMobileMenu(state.plan)) return;
      const button=event.currentTarget,original=button.textContent;button.disabled=true;button.textContent=lang==='es'?'Publicando…':'Publicant…';
      try{
        const persistent=JSON.parse(JSON.stringify({name:state.projectName,format:state.format,style:state.style,accent:state.accent,textColor:state.textColor,pages:state.pages},(_key,value)=>typeof value==='string'&&value.startsWith('blob:')?null:value));
        const published=await window.UncartellPlatform.publishDocument({kind:'menu',slug,payload:persistent});
        state.mobilePublication = { slug, status: "published", publishedAt: new Date().toISOString(), url:published.url };
        save(); saveProject(true); renderPlans();
        box.innerHTML=`<button class="modal-close" type="button" data-close-mobile-publish>×</button><div class="mobile-publish-success"><span>✓</span><h2>${lang==='es'?'¡Publicado!':'Publicat!'}</h2><p>${lang==='es'?'Tu carta ya está disponible.':'La teva carta ja està disponible.'}</p><a href="${published.url}" target="_blank" rel="noopener">${published.url}</a><button type="button" data-generate-published-qr>${lang==='es'?'Generar QR':'Genera un QR'}</button></div>`;
        $('[data-close-mobile-publish]',box).addEventListener('click',()=>{$('#mobilePublishModal').hidden=true});
        $('[data-generate-published-qr]',box).addEventListener('click',()=>{location.href=`${window.UncartellPlatform.cfg.qrPath}?url=${encodeURIComponent(published.url)}&generate=1`});
      }catch(error){status.textContent=error?.message||L.slugUnavailable;status.className='is-unavailable';button.disabled=false;button.textContent=original}
    });
    refresh();
  }

  function openMobilePublishModal() {
    if (!entitlements.canPublishMobileMenu(state.plan)) return openPlanGate("Ultra");
    state.mobilePublication ||= { slug: "", status: "draft", publishedAt: null };
    const published = state.mobilePublication.status === "published" && state.mobilePublication.slug;
    const box = $("#mobilePublishModalCard");
    box.innerHTML = `<button class="modal-close" type="button" data-close-mobile-publish aria-label="${escapeHtml(L.close || "Tanca")}">×</button><span class="eyebrow">${escapeHtml(L.mobilePublicationTitle)}</span><h2 id="mobilePublishModalTitle">${escapeHtml(published ? L.republishMobileMenu : L.publishMobileMenu)}</h2><p>${escapeHtml(L.mobilePublicationHelp)}</p><div class="mobile-publication-card"><label><span>${escapeHtml(L.businessSlug)}</span><input id="mobileSlug" type="text" maxlength="48" value="${escapeHtml(state.mobilePublication.slug || "")}" placeholder="restaurant-olivera"></label><code>uncartell.cat/carta/<b id="mobileSlugPreview">${escapeHtml(state.mobilePublication.slug || "escriu-el-nom")}</b></code><span id="mobileSlugStatus"></span><button id="publishMobileMenu" type="button">${escapeHtml(published ? L.republishMobileMenu : L.publishMobileMenu)}</button></div>`;
    $("#mobilePublishModal").hidden = false;
    $$('[data-close-mobile-publish]', $("#mobilePublishModal")).forEach(button => button.addEventListener("click", () => { $("#mobilePublishModal").hidden = true; }));
    wireMobilePublication(box);
    $("#mobileSlug", box)?.focus();
  }

  function renderInspector() {
    const page = state.pages[state.activePage];
    const box = $("#inspector");
    if (page.role === "mobile-home") {
      box.innerHTML = `<div class="inspector-head"><strong>${L.inspector.selected}</strong><span class="inspector-type">${escapeHtml(L.mobileHome)}</span></div>${field(L.inspector.restaurant, "restaurant", page.restaurant)}${field(L.inspector.title, "title", page.title)}${field(L.inspector.subtitle, "subtitle", page.subtitle, true)}${logoInspector(page)}<div class="mobile-section-manager"><strong>${escapeHtml(L.mobileSections)}</strong><small>${escapeHtml(L.mobileSectionsHelp)}</small>${state.pages.slice(1).map((item, index) => `<div class="mobile-section-row" data-section-index="${index + 1}"><span class="mobile-section-drag" data-section-drag aria-label="${escapeHtml(L.inspector.drag)}" title="${escapeHtml(L.inspector.drag)}">⠿</span><input type="text" value="${escapeHtml(item.title)}" maxlength="45" aria-label="${escapeHtml(L.mobileSectionName)}"><button type="button" data-section-delete aria-label="${escapeHtml(L.deleteSection)}">×</button></div>`).join("")}<button class="add-mobile-section" type="button" ${state.pages.length - 1 >= 7 ? "disabled" : ""}>＋ ${escapeHtml(L.addMobileSection)}</button><span>${escapeHtml(L.mobileSectionLimit)}</span></div>`;
      wireFields(page); wirePageLogo(page, box); wireMobileSections(box); return;
    }
    if (page.role === "mobile-allergens") {
      box.innerHTML = `<div class="inspector-head"><strong>${escapeHtml(page.title)}</strong></div><p class="empty-inspector">${escapeHtml(L.interiorPages)}</p>${footerTextInspector()}`;
      wireFooterText(box); return;
    }
    if (page.role === "cover") {
      if (page.side === "back" && state.format.startsWith("a4-single-") && state.plan === "free") {
        box.innerHTML = `<p class="empty-inspector">${escapeHtml(L.messages.premiumRequired)}</p>`;
        return;
      }
      box.innerHTML = `<div class="inspector-head"><strong>${L.inspector.selected}</strong><span class="inspector-type">${L.pages[0]}</span></div>
        <p class="empty-inspector">${L.inspector.coverHelp}</p><br>
        ${field(L.inspector.restaurant, "restaurant", page.restaurant)}
        ${field(L.inspector.title, "title", page.title)}
        ${field(L.inspector.subtitle, "subtitle", page.subtitle, true)}
        ${logoInspector(page)}`;
      wireFields(page);
      wirePageLogo(page, box);
      return;
    }
    if (page.role === "back") {
      box.innerHTML = `<div class="inspector-head"><strong>${L.inspector.selected}</strong><span class="inspector-type">${L.pages[3]}</span></div>
        <p class="empty-inspector">${L.inspector.backHelp}</p><br>
        ${field(L.inspector.title, "title", page.title)}
        ${field(L.inspector.text, "body", page.body, true)}${logoInspector(page)}`;
      wireFields(page);
      wirePageLogo(page, box);
      return;
    }
    const block = page.blocks.find(item => item.id === state.selectedBlock);
    if (!block) {
      box.innerHTML = `<p class="empty-inspector">${L.inspector.empty}</p>${footerTextInspector()}`;
      wireFooterText(box);
      return;
    }
    const typeLabel = L.blockTypes.find(item => item.id === block.type)?.label ?? block.type;
    let controls = "";
    if (block.type === "dish" || block.type === "dish-image") {
      controls = field(L.inspector.name, "name", block.name) + field(L.inspector.description, "description", block.description, true) + field(L.inspector.price, "price", block.price);
      if (block.type === "dish-image") controls += `<div class="field dish-image-field"><span>${escapeHtml(L.imageDish)}</span><p>${escapeHtml(L.imageDishHelp)}</p>${block.image ? `<img src="${block.image}" alt=""><button id="removeDishImage" type="button">${escapeHtml(L.removeDishImage)}</button>` : `<label for="dishImageInput">${escapeHtml(L.chooseDishImage)}</label>`}<input id="dishImageInput" type="file" accept="image/png,image/jpeg,image/webp"><button class="dish-order-toggle" id="swapDishImage" type="button" aria-label="${escapeHtml(L.swapDishImage)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h11l-3-3m3 3-3 3M17 17H6l3 3m-3-3 3-3"/></svg>${escapeHtml(block.imagePosition === "below" ? L.textFirst : L.photoFirst)}</button></div>`;
      controls += `<div class="field"><span>${L.inspector.allergens}</span><div class="allergen-grid">${Object.entries(L.allergens).map(([key, label]) => `<label class="allergen-check"><input type="checkbox" data-allergen="${key}" ${block.allergens.includes(key) ? "checked" : ""}>${allergenIcon(key)}${escapeHtml(label)}</label>`).join("")}</div></div>`;
    } else if (!["separator", "spacer-large"].includes(block.type)) {
      controls = field(L.inspector.text, "text", block.text, block.type !== "section");
    }
    box.innerHTML = `<div class="inspector-head"><strong>${L.inspector.selected}</strong><span class="inspector-type">${escapeHtml(typeLabel)}</span></div>${controls}<div class="block-item-actions"><button class="duplicate-block-button" type="button">${escapeHtml(L.duplicateBlock)}</button><button class="delete-button" type="button">${L.inspector.delete}</button></div>${footerTextInspector()}`;
    wireFields(block);
    wireFooterText(box);
    $$("[data-allergen]", box).forEach(input => input.addEventListener("change", () => {
      block.allergens = $$("[data-allergen]:checked", box).map(item => item.dataset.allergen);
      save(); renderPage();
    }));
    const dishImageInput = $("#dishImageInput", box);
    dishImageInput?.addEventListener("change", async event => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (file.size > 4 * 1024 * 1024) return toast(L.dishImageTooLarge);
      try {
        const optimized = await optimizeDishImage(file);
        if (block.image?.startsWith("blob:")) URL.revokeObjectURL(block.image);
        block.image = URL.createObjectURL(optimized);
        block.imageMeta = { name: file.name, type: optimized.type, size: optimized.size, widthLimit: 1600, storage: "preview-only" };
        save(); renderInspector(); renderPage();
      } catch (_) { toast(L.dishImageTooLarge); }
    });
    $("#swapDishImage", box)?.addEventListener("click", () => { block.imagePosition = block.imagePosition === "below" ? "above" : "below"; save(); renderInspector(); renderPage(); });
    $("#removeDishImage", box)?.addEventListener("click", () => { block.image = null; save(); renderInspector(); renderPage(); });
    $(".duplicate-block-button", box).addEventListener("click", () => {
      const index = page.blocks.findIndex(item => item.id === block.id);
      const copy = JSON.parse(JSON.stringify(block));
      copy.id = uid();
      tryInsertBlock(page, copy, index + 1);
    });
    $(".delete-button", box).addEventListener("click", () => removeBlockWithUndo(page, block));
  }

  function footerTextInspector() {
    if (state.plan !== "ultra") return `<button class="locked-footer-control" type="button" data-locked-footer><span class="footer-control-icon">＋</span><span><strong>${escapeHtml(L.addFooterText)}</strong><small>${escapeHtml(L.interiorPages)}</small></span><em><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 8 4 4 4-7 4 7 4-4-2 11H6L4 8Z"/><path d="M6 19h12"/></svg>Ultra</em></button>`;
    return `<section class="page-footer-editor"><div class="page-footer-editor-head"><span class="footer-control-icon">＋</span><span><strong>${escapeHtml(L.addFooterText)}</strong><small>${escapeHtml(L.interiorPages)}</small></span></div><div class="page-footer-input"><input id="pageFooterText" type="text" maxlength="70" value="${escapeHtml(state.brandKit.footerText || "")}" placeholder="${escapeHtml(L.footerTextPlaceholder)}"><button id="clearFooterText" type="button" aria-label="${escapeHtml(L.removeFooterText)}">×</button></div></section>`;
  }

  function wireFooterText(box) {
    $("[data-locked-footer]", box)?.addEventListener("click", () => openPlanGate("Ultra"));
    $("#pageFooterText", box)?.addEventListener("input", event => { state.brandKit.footerText = event.target.value; state.brandKit.footerTextSet = true; save(); renderPage(); });
    $("#clearFooterText", box)?.addEventListener("click", () => { state.brandKit.footerText = ""; state.brandKit.footerTextSet = true; save(); renderInspector(); renderPage(); });
  }

  function logoInspector(page) {
    if (state.plan !== "ultra") return `<button class="locked-logo-control" type="button" data-locked-logo><span>${escapeHtml(L.brandLogo)}</span><small><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 8 4 4 4-7 4 7 4-4-2 11H6L4 8Z"/><path d="M6 19h12"/></svg>Ultra</small></button>`;
    const enabled = page.showLogo !== false;
    return `<div class="field page-logo-setting"><span>${escapeHtml(L.brandLogo)}</span><label class="logo-toggle"><input id="pageLogoToggle" type="checkbox" ${enabled ? "checked" : ""}><span>${escapeHtml(enabled ? L.withLogo : L.withoutLogo)}</span></label>${enabled ? `<div class="kit-logo-row"><label class="kit-logo-button" for="reverseLogo">${escapeHtml(L.chooseLogo)}</label>${page.logo ? `<button id="reverseLogoRemove" type="button">${escapeHtml(L.removeLogo)}</button>` : ""}</div><input id="reverseLogo" class="reverse-logo-input" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml">` : ""}</div>`;
  }

  function wirePageLogo(page, box) {
    $("[data-locked-logo]", box)?.addEventListener("click", () => openPlanGate("Ultra"));
    $("#pageLogoToggle", box)?.addEventListener("change", event => { page.showLogo = event.target.checked; save(); renderInspector(); renderPage(); });
    const input = $("#reverseLogo", box);
    input?.addEventListener("change", event => {
      const file = event.target.files?.[0];
      if (!file) return;
      if (file.size > 500 * 1024) return toast(L.logoTooLarge);
      if (page.logo?.startsWith("blob:")) URL.revokeObjectURL(page.logo);
      page.logo = URL.createObjectURL(file);
      page.logoMeta = { name: file.name, type: file.type, size: file.size, storage: "preview-only" };
      save(); renderInspector(); renderPage();
    });
    $("#reverseLogoRemove", box)?.addEventListener("click", () => { page.logo = null; save(); renderInspector(); renderPage(); });
  }

  function wireFields(target) {
    $$("[data-field]", $("#inspector")).forEach(input => input.addEventListener("input", () => {
      target[input.dataset.field] = input.value;
      save();
      renderPage();
    }));
  }

  const allergenPaths = {
    gluten:'<path d="m2 22 10-10"/><path d="m16 8-1.17 1.17"/><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="m8 8-.53.53a3.5 3.5 0 0 0 0 4.94L9 15l1.53-1.53c.55-.55.88-1.25.98-1.97"/><path d="M10.91 5.26c.15-.26.34-.51.56-.73L13 3l1.53 1.53a3.5 3.5 0 0 1 .28 4.62"/><path d="M20 2h2v2a4 4 0 0 1-4 4h-2V6a4 4 0 0 1 4-4Z"/><path d="M11.47 17.47 13 19l-1.53 1.53a3.5 3.5 0 0 1-4.94 0L5 19l1.53-1.53a3.5 3.5 0 0 1 4.94 0Z"/><path d="m16 16-.53.53a3.5 3.5 0 0 1-4.94 0L9 15l1.53-1.53a3.49 3.49 0 0 1 1.97-.98"/><path d="M18.74 13.09c.26-.15.51-.34.73-.56L21 11l-1.53-1.53a3.5 3.5 0 0 0-4.62-.28"/><line x1="2" x2="22" y1="2" y2="22"/>',
    crustaceans:'<path d="M8 13c0-4 2-7 4-7s4 3 4 7-2 6-4 6-4-2-4-6ZM8 11 4 8M16 11l4-3M9 16l-4 2M15 16l4 2M10 7 8 3M14 7l2-4"/>',
    egg:'<path d="M12 3c-3 0-6 7-6 11a6 6 0 0 0 12 0c0-4-3-11-6-11Z"/>',
    fish:'<path d="M4 12c3-5 8-6 13-2l3-3v10l-3-3c-5 4-10 3-13-2Zm4 0h.01"/>',
    peanuts:'<path d="M9 4c3 0 3 3 5 4s5 1 5 4-3 3-4 5-1 4-4 4-3-3-4-4-4-4 0-4 3-4 3-1 2-3 3-2 3 0Zm-3 9 9-5M8 17l8-5"/>',
    soy:'<path d="M4 16C7 8 13 5 20 5c-1 8-6 13-14 14M8 15c1-2 2-3 4-4m1 3c1-2 2-3 4-4"/>',
    milk:'<path d="M8 3h7l2 4v14H7V7l1-4Zm-1 4h10M9 3v4m6-4v4"/>',
    nuts:'<path d="M12 5c4 0 7 4 6 8-1 5-4 8-6 8s-5-3-6-8c-1-4 2-8 6-8Zm0 0V2m-4 2c2-2 6-2 8 0"/>',
    celery:'<path d="M8 21V9m4 12V5m4 16V9M8 11 5 8m7-1-3-3m7 7 3-3M6 21h12"/>',
    mustard:'<path d="M12 4v16M12 8 8 6m4 6 5-3m-5 7-5-3M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm13 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM9 13a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/>',
    sesame:'<path d="M8 5c3 2 3 5 0 7-3-2-3-5 0-7Zm8 1c3 2 3 5 0 7-3-2-3-5 0-7Zm-4 7c3 2 3 5 0 7-3-2-3-5 0-7Z"/>',
    sulphites:'<path d="M9 3h6M10 3v6l-5 9c-.7 1.3.2 3 1.7 3h10.6c1.5 0 2.4-1.7 1.7-3l-5-9V3M8 16h8"/>',
    lupin:'<path d="M12 21v-9m0 3c-4 0-6-2-6-5 4 0 6 2 6 5Zm0-3c0-4 2-6 5-6 0 4-2 6-5 6Zm0-4c-2-1-3-3-2-5 3 1 4 3 2 5Z"/>',
    molluscs:'<path d="M4 18c0-7 3-12 8-12s8 5 8 12H4Zm8 0V7m-4 11 2-11m6 11-2-11M6 14h12"/>'
  };
  const allergenIcon = key => `<i class="allergen-icon allergen-${key}" title="${escapeHtml(L.allergens[key])}" aria-label="${escapeHtml(L.allergens[key])}"><svg viewBox="0 0 24 24" aria-hidden="true">${allergenPaths[key] || '<circle cx="12" cy="12" r="7"/>'}</svg></i>`;
  const dragHandle = block => `<span class="drag-handle" data-drag="${block.id}" title="${escapeHtml(L.inspector.drag)}" aria-label="${escapeHtml(L.inspector.drag)}">⠿</span>`;
  const textLengthClass = value => String(value || "").length > 150 ? " text-very-long" : String(value || "").length > 75 ? " text-long" : "";
  const editable = (field, value, className = "", multiline = false) => `<span class="${className} inline-editable${textLengthClass(value)}" data-inline-field="${field}" data-multiline="${multiline ? "true" : "false"}" contenteditable="true" spellcheck="true">${escapeHtml(value)}</span>`;
  const floatingBlockSymbol = item => item.id === "dish-image" ? '<svg class="block-photo-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="9" r="1.7"/><path d="m5 18 5-5 3 3 2-2 4 4"/></svg>' : escapeHtml(item.symbol);
  const contextualBlockControls = block => `<span class="block-context-actions" aria-hidden="false"><button class="block-context-delete" type="button" data-context-delete="${block.id}" aria-label="${escapeHtml(L.inspector.delete)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button><button class="block-context-duplicate" type="button" data-context-duplicate="${block.id}" aria-label="${escapeHtml(L.duplicateBlock)}"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/></svg></button></span><button class="block-context-add" type="button" data-context-add="${block.id}" aria-label="${escapeHtml(L.addBlockAfter || L.messages.added)}"><span>+</span></button><div class="block-insert-menu" data-insert-menu="${block.id}" hidden><button class="block-insert-close" type="button" data-context-close aria-label="${escapeHtml(L.closeBlockMenu)}">×</button>${L.blockTypes.map(item => `<button class="${item.id === "dish-image" ? "context-dish-image" : ""}" type="button" data-context-type="${item.id}"><span class="context-block-symbol">${floatingBlockSymbol(item)}</span><b>${escapeHtml(item.label)}</b>${item.id === "dish-image" ? `<em class="context-ultra-badge"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 8 4 4 4-7 4 7 4-4-2 11H6L4 8Z"/><path d="M6 19h12"/></svg>Ultra</em>` : ""}</button>`).join("")}</div>`;
  function blockHtml(block) {
    const selected = block.id === state.selectedBlock ? " selected" : "";
    const controls = contextualBlockControls(block);
    if (block.type === "section") return `<div class="menu-block section-block${selected}" data-block="${block.id}">${dragHandle(block)}${editable("text", block.text, "section-text")}${controls}</div>`;
    if (block.type === "dish" || block.type === "dish-image") return `<div class="menu-block dish-block${block.type === "dish-image" ? ` dish-with-image${block.imagePosition === "below" ? " image-below" : ""}` : ""}${selected}" data-block="${block.id}">${dragHandle(block)}${block.type === "dish-image" ? (block.image ? `<img class="dish-photo" src="${block.image}" alt="">` : `<button class="dish-photo-placeholder" type="button" data-choose-dish-image="${block.id}">${escapeHtml(L.chooseDishImage)}</button>`) : ""}${editable("name", block.name, "dish-name")}${editable("price", block.price, "dish-price")}${editable("description", block.description, "dish-description", true)}${block.allergens.length ? `<span class="allergen-icons">${block.allergens.map(allergenIcon).join("")}</span>` : ""}${controls}</div>`;
    if (block.type === "separator") return `<div class="menu-block separator-block${selected}" data-block="${block.id}">${dragHandle(block)}${controls}</div>`;
    if (block.type === "spacer-large") return `<div class="menu-block spacer-block spacer-large${selected}" data-block="${block.id}">${dragHandle(block)}<span></span>${controls}</div>`;
    if (block.type === "note") return `<div class="menu-block note-block${selected}" data-block="${block.id}">${dragHandle(block)}${editable("text", block.text, "note-text", true)}${controls}</div>`;
    return `<div class="menu-block text-block${selected}" data-block="${block.id}">${dragHandle(block)}${editable("text", block.text, "body-text", true)}${controls}</div>`;
  }

  function pageContentFits() {
    if (state.format === "mobile-interactive") return true;
    const menu = $("#menuPage");
    const content = $(".blocks-content", menu);
    if (!content) return true;
    const menuRect = menu.getBoundingClientRect();
    const menuStyle = getComputedStyle(menu);
    const visualScale = Number.parseFloat(menuStyle.zoom) || 1;
    const paddingBottom = (Number.parseFloat(menuStyle.paddingBottom) || 0) * visualScale;
    const footer = $(".watermark,.brand-page-footer,.allergen-legend", menu);
    const footerTop = footer ? footer.getBoundingClientRect().top : menuRect.bottom - paddingBottom;
    const usableBottom = Math.min(menuRect.bottom - paddingBottom, footerTop - 5);
    const blocks = $$(".menu-block", content);
    const lastBlockBottom = blocks.length ? Math.max(...blocks.map(node => node.getBoundingClientRect().bottom)) : content.getBoundingClientRect().bottom;
    return lastBlockBottom <= usableBottom + 1;
  }

  function tryInsertBlock(page, block, index) {
    if (!page?.blocks) return false;
    const previousSelection = state.selectedBlock;
    page.blocks.splice(index, 0, block);
    state.selectedBlock = block.id;
    renderPage();
    if (!pageContentFits()) {
      page.blocks.splice(page.blocks.findIndex(item => item.id === block.id), 1);
      state.selectedBlock = previousSelection;
      renderAll();
      toast(L.pageFull);
      return false;
    }
    save(); renderAll(); toast(L.messages.added);
    return true;
  }

  function removeBlockWithUndo(page, block) {
    const index = page.blocks.findIndex(item => item.id === block.id);
    if (index < 0) return;
    const removed = JSON.parse(JSON.stringify(block));
    page.blocks.splice(index, 1);
    state.selectedBlock = null;
    save(); renderAll();
    toast(L.messages.deleted, { label: L.undo, duration: 5000, callback: () => { page.blocks.splice(index, 0, removed); state.selectedBlock = removed.id; save(); renderAll(); } });
  }

  function wireContextualBlockControls(page, menu) {
    $$('[data-choose-dish-image]', menu).forEach(button => button.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      state.selectedBlock = button.dataset.chooseDishImage;
      renderInspector();
      $("#dishImageInput")?.click();
    }));
    $$('[data-context-delete]', menu).forEach(button => button.addEventListener("click", event => {
      event.stopPropagation();
      const block = page.blocks.find(item => item.id === button.dataset.contextDelete);
      if (block) removeBlockWithUndo(page, block);
    }));
    $$('[data-context-duplicate]', menu).forEach(button => button.addEventListener("click", event => {
      event.stopPropagation();
      const block = page.blocks.find(item => item.id === button.dataset.contextDuplicate);
      if (!block) return;
      const copy = JSON.parse(JSON.stringify(block)); copy.id = uid();
      tryInsertBlock(page, copy, page.blocks.findIndex(item => item.id === block.id) + 1);
    }));
    $$('[data-context-add]', menu).forEach(button => button.addEventListener("click", event => {
      event.stopPropagation();
      const target = button.dataset.contextAdd;
      const targetPanel = $(`[data-insert-menu="${target}"]`, menu);
      const willOpen = targetPanel?.hidden;
      $$('[data-insert-menu]', menu).forEach(panel => { panel.hidden = true; panel.classList.remove("is-centered"); });
      menu.classList.remove("insert-menu-open");
      if (willOpen && targetPanel) {
        menu.append(targetPanel);
        const menuRect = menu.getBoundingClientRect();
        const stageRect = menu.closest(".canvas-stage")?.getBoundingClientRect() || menuRect;
        const visibleTop = Math.max(menuRect.top, stageRect.top);
        const visibleBottom = Math.min(menuRect.bottom, stageRect.bottom);
        targetPanel.style.setProperty("--insert-top", `${menu.scrollTop + Math.max(130, (visibleTop + visibleBottom) / 2 - menuRect.top)}px`);
        targetPanel.hidden = false;
        targetPanel.classList.add("is-centered");
        menu.classList.add("insert-menu-open");
      }
    }));
    $$('[data-context-close]', menu).forEach(button => button.addEventListener("click", event => {
      event.stopPropagation();
      button.closest('[data-insert-menu]').hidden = true;
      menu.classList.remove("insert-menu-open");
    }));
    $$('[data-context-type]', menu).forEach(button => button.addEventListener("click", event => {
      event.stopPropagation();
      if (button.dataset.contextType === "dish-image" && !entitlements.canUploadMenuImages(state.plan)) return openPlanGate("Ultra");
      const panel = button.closest('[data-insert-menu]');
      const after = page.blocks.findIndex(item => item.id === panel.dataset.insertMenu);
      const source = page.blocks[after];
      const block = makeBlock(button.dataset.contextType);
      block.column = source?.column || 1;
      tryInsertBlock(page, block, after + 1);
    }));
  }

  function blocksLayout(page, renderer = blockHtml) {
    const blocks = page.blocks || [];
    if (state.contentColumns !== 2) return `<div class="blocks-content columns-1">${blocks.map(renderer).join("")}</div>`;
    const split = Math.ceil(blocks.length / 2);
    blocks.forEach((block, index) => { if (!block.column) block.column = index < split ? 1 : 2; });
    return `<div class="blocks-content columns-2 manual-columns"><div class="manual-column" data-manual-column="1">${blocks.filter(block => block.column === 1).map(renderer).join("")}</div><div class="manual-column" data-manual-column="2">${blocks.filter(block => block.column === 2).map(renderer).join("")}</div></div>`;
  }

  function usedAllergens() {
    return [...new Set(state.pages.flatMap(page => page.blocks || []).filter(block => block.type === "dish" || block.type === "dish-image").flatMap(block => block.allergens || []))];
  }

  function allergenLegend() {
    const used = usedAllergens();
    if (!used.length) return "";
    return `<div class="allergen-legend">${used.map(key => `<span class="legend-item">${allergenIcon(key)}${escapeHtml(L.allergens[key])}</span>`).join("")}</div>`;
  }

  const brandLogoMarkup = (page, placement = "cover", forPrint = false) => {
    if (state.plan === "ultra" && page?.showLogo === false) return "";
    const source = state.plan === "ultra" ? (page?.logo || state.brandKit.logo) : null;
    if (source) return `<img class="brand-logo" src="${source}" alt="${escapeHtml(state.brandKit.businessName || L.brandKit)}">`;
    return state.plan === "ultra" && !forPrint ? `<button class="logo-placeholder" type="button" data-logo-placeholder>${escapeHtml(L.addLogoHere)}</button>` : "";
  };
  const brandedFooter = () => state.plan === "ultra" && state.brandKit.footerText ? `<div class="brand-page-footer"><span>${escapeHtml(state.brandKit.footerText)}</span></div>` : "";

  function moveBlock(page, draggedId, targetId, targetColumn = null, placement = "before") {
    if (!draggedId || draggedId === targetId) return;
    const from = page.blocks.findIndex(item => item.id === draggedId);
    if (from < 0) return;
    const [moved] = page.blocks.splice(from, 1);
    if (targetColumn) moved.column = Number(targetColumn);
    const targetIndex = targetId ? page.blocks.findIndex(item => item.id === targetId) : page.blocks.length;
    if (targetIndex < 0) { page.blocks.splice(from, 0, moved); return; }
    page.blocks.splice(targetId && placement === "after" ? targetIndex + 1 : targetIndex, 0, moved);
    state.selectedBlock = moved.id;
    save();
  }

  function wireDrag(page, menu) {
    let draggedId = null;
    let pointerTargetId = null;
    let pointerPlacement = "before";
    const setDropPosition = (node, clientY) => {
      const rect = node.getBoundingClientRect();
      const placement = clientY > rect.top + rect.height / 2 ? "after" : "before";
      node.dataset.dropPlacement = placement;
      node.classList.toggle("drag-target-before", placement === "before");
      node.classList.toggle("drag-target-after", placement === "after");
      return placement;
    };
    const clearTargets = () => $$(".menu-block", menu).forEach(node => { node.classList.remove("dragging", "drag-target", "drag-target-before", "drag-target-after"); delete node.dataset.dropPlacement; });
    $$("[data-block]", menu).forEach(node => {
      node.draggable = true;
      node.addEventListener("dragstart", event => {
        draggedId = node.dataset.block;
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", draggedId);
        node.classList.add("dragging");
      });
      node.addEventListener("dragover", event => {
        event.preventDefault();
        clearTargets();
        node.classList.add("drag-target");
        setDropPosition(node, event.clientY);
      });
      node.addEventListener("drop", event => {
        event.preventDefault();
        moveBlock(page, draggedId || event.dataTransfer.getData("text/plain"), node.dataset.block, node.closest("[data-manual-column]")?.dataset.manualColumn, node.dataset.dropPlacement || "before");
        renderAll();
      });
      node.addEventListener("dragend", clearTargets);
    });
    $$("[data-manual-column]", menu).forEach(column => {
      column.addEventListener("dragover", event => event.preventDefault());
      column.addEventListener("drop", event => {
        if (event.target.closest("[data-block]")) return;
        event.preventDefault();
        moveBlock(page, draggedId || event.dataTransfer.getData("text/plain"), null, column.dataset.manualColumn);
        renderAll();
      });
    });
    $$("[data-drag]", menu).forEach(handle => {
      handle.addEventListener("pointerdown", event => {
        event.preventDefault();
        draggedId = handle.dataset.drag;
        pointerTargetId = draggedId;
        handle.setPointerCapture(event.pointerId);
        handle.closest("[data-block]").classList.add("dragging");
      });
      handle.addEventListener("pointermove", event => {
        if (!draggedId) return;
        const target = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-block]");
        if (target && target.dataset.block !== draggedId) {
          clearTargets();
          handle.closest("[data-block]").classList.add("dragging");
          target.classList.add("drag-target");
          pointerTargetId = target.dataset.block;
          pointerPlacement = setDropPosition(target, event.clientY);
        }
      });
      handle.addEventListener("pointerup", event => {
        if (!draggedId) return;
        const targetNode = pointerTargetId ? menu.querySelector(`[data-block="${pointerTargetId}"]`) : null;
        moveBlock(page, draggedId, pointerTargetId, targetNode?.closest("[data-manual-column]")?.dataset.manualColumn, pointerPlacement);
        draggedId = null;
        pointerTargetId = null;
        pointerPlacement = "before";
        renderAll();
      });
    });
  }

  function wireInlineEditing(page, menu) {
    $$("[data-inline-field]", menu).forEach(element => {
      const selectInlineBlock = () => {
        const blockNode = element.closest("[data-block]");
        if (blockNode && state.selectedBlock !== blockNode.dataset.block) {
          state.selectedBlock = blockNode.dataset.block;
          renderInspector();
          $$(".menu-block", menu).forEach(node => node.classList.toggle("selected", node.dataset.block === state.selectedBlock));
        }
      };
      element.addEventListener("focus", selectInlineBlock);
      element.addEventListener("click", event => {
        event.stopPropagation();
        selectInlineBlock();
      });
      element.addEventListener("keydown", event => {
        if (event.key === "Enter" && element.dataset.multiline !== "true") {
          event.preventDefault();
          element.blur();
        }
      });
      element.addEventListener("input", () => {
        const field = element.dataset.inlineField;
        const blockNode = element.closest("[data-block]");
        const target = blockNode ? page.blocks.find(block => block.id === blockNode.dataset.block) : page;
        if (!target) return;
        target[field] = element.dataset.multiline === "true" ? element.innerText : element.textContent;
        const inspectorField = $(`[data-field="${field}"]`, $("#inspector"));
        if (inspectorField) inspectorField.value = target[field];
        save();
      });
      element.addEventListener("blur", () => {
        renderInspector();
        renderPage();
      });
    });
  }

  function wireMobileFloatingActions(menu) {
    const blocks = $$('[data-block]', menu);
    const positionActions = block => {
      const actions = $('.block-context-actions', block);
      if (!actions) return;
      const rect = block.getBoundingClientRect();
      actions.style.left = `${rect.right + 10}px`;
      actions.style.top = `${rect.top + rect.height / 2}px`;
    };
    const positionAll = () => blocks.forEach(positionActions);
    blocks.forEach(block => {
      block.addEventListener('pointerenter', () => positionActions(block));
      block.addEventListener('focusin', () => positionActions(block));
    });
    $('.mobile-scroll-viewport', menu)?.addEventListener('scroll', positionAll, { passive: true });
    positionAll();
  }

  function renderPage() {
    const page = state.pages[state.activePage];
    const menu = $("#menuPage");
    const paidPlan = state.plan === "premium" || state.plan === "ultra";
    menu.className = `menu-page style-${state.style} format-${state.format || "a3-landscape"} role-${page.role} ${state.plan === "ultra" ? "no-watermark" : ""}`;
    menu.style.setProperty("--accent", paidPlan ? state.accent : "#e5372a");
    menu.style.setProperty("--text", paidPlan ? state.textColor : "#181614");
    const fitZoom = state.format === "a4-landscape" ? .92 : .72;
    const mobileFitZoom = state.format === "a4-portrait" ? .72 : state.format === "a4-landscape" ? .78 : .58;
    menu.style.setProperty("--mobile-editor-zoom", String(mobileFitZoom * editorZoom));
    menu.style.zoom = state.format === "mobile-interactive" ? "1" : window.innerWidth <= 820 ? String(mobileFitZoom * editorZoom) : String(fitZoom * editorZoom);
    $(".zoom-controls").hidden = state.format === "mobile-interactive";
    const mobileNav = () => state.format === "mobile-interactive" && state.activePage > 0 ? `<nav class="mobile-page-nav" aria-label="${escapeHtml(L.mobileNavigation || L.mobileHome)}">${state.activePage > 1 ? `<button class="mobile-nav-previous" type="button" data-mobile-page="${state.activePage - 1}" aria-label="${escapeHtml(L.previousPage || "Anterior")}"><svg viewBox="0 0 24 24"><path d="m5 15 7-7 7 7"/></svg></button>` : ""}${state.activePage < state.pages.length - 1 ? `<button class="mobile-nav-next" type="button" data-mobile-page="${state.activePage + 1}" aria-label="${escapeHtml(L.nextPage || "Següent")}"><svg viewBox="0 0 24 24"><path d="m5 9 7 7 7-7"/></svg></button>` : ""}</nav>` : "";
    const mobileHomeButton = `<button class="mobile-home-button" type="button" data-mobile-page="0" aria-label="${escapeHtml(L.backToMenu || L.mobileHome)}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg></button>`;
    if (page.role === "mobile-home") {
      menu.innerHTML = `<div class="mobile-scroll-viewport"><div class="mobile-menu-home">${editable("restaurant", page.restaurant, "mobile-restaurant")}${brandLogoMarkup(page, "cover")}${editable("title", page.title, "mobile-title")}${editable("subtitle", page.subtitle, "mobile-subtitle", true)}<nav class="mobile-section-links">${state.pages.slice(1).map((item, index) => `<button type="button" data-mobile-page="${index + 1}"><span>${String(index + 1).padStart(2, "0")}</span>${escapeHtml(item.title)}</button>`).join("")}</nav></div></div>${watermark()}`;
    } else if (page.role === "mobile-allergens") {
      menu.innerHTML = `<div class="mobile-scroll-viewport"><div class="mobile-section-head">${mobileHomeButton}<span>${escapeHtml(page.title)}</span></div><div class="mobile-allergen-list">${Object.keys(L.allergens).map(key => `<span>${allergenIcon(key)}${escapeHtml(L.allergens[key])}</span>`).join("")}</div></div>${mobileNav()}${brandedFooter(page)}${watermark()}`;
    } else if (page.role === "mobile-section") {
      menu.innerHTML = `<div class="mobile-scroll-viewport"><div class="mobile-section-head">${mobileHomeButton}<span>${escapeHtml(page.title)}</span></div>${blocksLayout(page)}</div>${mobileNav()}${brandedFooter(page)}${watermark()}`;
      $$('[data-block]', menu).forEach(node => node.addEventListener("click", () => { state.selectedBlock = node.dataset.block; renderInspector(); renderPage(); }));
      wireDrag(page, menu);
      wireContextualBlockControls(page, menu);
    } else if (page.role === "cover") {
      const lockedReverse = page.side === "back" && state.format.startsWith("a4-single-") && state.plan === "free";
      menu.innerHTML = lockedReverse
        ? `<div class="cover-content"><span class="cover-kicker">UNCARTELL.CAT</span><span class="cover-title">${escapeHtml(page.title)}</span><span class="cover-subtitle">${escapeHtml(page.subtitle)}</span><span class="cover-rule"></span></div>${watermark()}`
        : `<div class="cover-content">${editable("restaurant", state.plan === "ultra" && state.brandKit.businessName ? state.brandKit.businessName : page.restaurant, "cover-kicker")}${editable("title", page.title, "cover-title")} ${editable("subtitle", page.subtitle, "cover-subtitle", true)}<span class="cover-rule"></span>${brandLogoMarkup(page, page.side === "back" ? "back" : "cover")}</div>${brandedFooter(page)}${watermark()}`;
    } else if (page.role === "back") {
      menu.innerHTML = `<div class="back-content">${brandLogoMarkup(page, "back")}${editable("title", page.title, "back-title")}${editable("body", page.body, "back-body", true)}</div>${allergenLegend()}${brandedFooter(page)}${watermark()}`;
    } else {
      menu.innerHTML = `${blocksLayout(page)}${page.showAllergenLegend ? allergenLegend() : ""}${brandedFooter(page)}${watermark()}`;
      $$("[data-block]", menu).forEach(node => node.addEventListener("click", () => {
        state.selectedBlock = node.dataset.block;
        renderInspector(); renderPage();
      }));
      wireDrag(page, menu);
      wireContextualBlockControls(page, menu);
    }
    $$('[data-mobile-page]', menu).forEach(button => button.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); const destination = Number(button.dataset.mobilePage); state.activePage = Number.isInteger(destination) && destination >= 0 && destination < state.pages.length ? destination : 0; state.selectedBlock = null; renderAll(); }));
    if (state.format === "mobile-interactive") wireMobileFloatingActions(menu);
    wireInlineEditing(page, menu);
    $("[data-logo-placeholder]", menu)?.addEventListener("click", event => {
      event.stopPropagation();
      renderInspector();
      $("#reverseLogo")?.click();
    });
  }

  const watermark = () => `<div class="watermark">${L.lang === "ca" ? "CREAT AMB UNCARTELL.CAT" : "CREADO CON UNCartel.ES"}</div>`;
  function renderPlans() {
    const canSave = state.plan === "premium" || state.plan === "ultra";
    $(".premium-style").classList.toggle("is-locked", !canSave);
    $("#projectSaveBar").hidden = false;
    $("#projectSaveBar").classList.toggle("is-locked", !canSave);
    $("#projectName").disabled = !canSave;
    $("#saveProjectButton").disabled = !canSave;
    $("#openProjectsButton").classList.toggle("is-plan-locked", !canSave);
    $("#editorOpenProjects").classList.toggle("is-plan-locked", !canSave);
    $("#projectLock").hidden = canSave;
    $("#projectName").value = state.projectName;
    $("#saveStatus").textContent = state.lastAutoSavedAt ? autoSavedLabel(state.lastAutoSavedAt) : canSave ? (state.isDirty ? L.unsaved : L.saved) : (state.isDirty ? L.basicDraftStatus : L.sessionOnly);
    $$('[data-preview-plan]').forEach(button => button.classList.toggle("active", button.dataset.previewPlan === state.plan));
    $("#exportButton").textContent = state.format === "mobile-interactive" ? (state.mobilePublication?.status === "published" ? L.republishMobileMenu : L.publishMobileMenu) : L.export;
  }

  function applyBrandKit() {
    if (state.plan !== "ultra") return toast(L.messages.ultraRequired);
    state.brandKit.businessName = $("#kitBusinessName").value.trim();
    state.brandKit.primary = $("#kitPrimary").value;
    state.brandKit.secondary = $("#kitSecondary").value;
    state.brandKit.font = $("#kitFont").value;
    state.accent = state.brandKit.primary;
    state.textColor = state.brandKit.secondary;
    state.style = state.brandKit.font;
    save();
    renderAll();
  }

  function saveBrandKit() {
    applyBrandKit();
    if (state.plan !== "ultra") return;
    try {
      localStorage.setItem(brandKitStorageKey, JSON.stringify(state.brandKit));
      $("#kitStatus").textContent = L.brandKitSaved;
      toast(L.brandKitSaved);
    } catch (_) {
      $("#kitStatus").textContent = L.logoTooLarge;
    }
  }

  function storedProjects() {
    try { return JSON.parse(localStorage.getItem(projectStorageKey) || "[]"); } catch (_) { return []; }
  }

  let pendingLeaveAction = null;
  let projectsModalTrigger = null;
  let pendingDeleteProjectId = null;
  const closeLeaveModal = () => {
    $("#leaveModal").hidden = true;
    pendingLeaveAction = null;
  };
  function requestLeave(action) {
    if (!state.isDirty) return action();
    pendingLeaveAction = action;
    const paid = state.plan === "premium" || state.plan === "ultra";
    $("#leaveModalCopy").textContent = paid ? L.leavePaidCopy : L.leaveFreeCopy;
    $("#leavePrimary").textContent = paid ? L.saveAndLeave : L.upgradePlan;
    $("#leavePrimary").dataset.leaveAction = paid ? "save" : "upgrade";
    $("#leaveModal").hidden = false;
    $("#leavePrimary").focus();
  }
  function openProjectsModal(trigger) {
    if (state.plan !== "premium" && state.plan !== "ultra") return openPlanGate("Premium");
    projectsModalTrigger = trigger;
    $("#projectsGalleryView").hidden = false;
    $("#projectDeleteView").hidden = true;
    pendingDeleteProjectId = null;
    renderProjects();
    $("#projectsModal").hidden = false;
    $(".projects-modal-close").focus();
  }

  function renderProjects() {
    const projects = storedProjects();
    const markup = projects.length
      ? projects.map(project => `<article class="project-card"><div class="project-card-copy"><strong>${escapeHtml(project.name)}</strong><small>${escapeHtml(L.formats.find(item => item.id === project.document.format)?.name || project.document.format)}</small></div><div class="project-card-actions"><button class="project-open" type="button" data-open-project="${escapeHtml(project.id)}">${escapeHtml(L.openProject)}</button><button class="project-duplicate" type="button" data-duplicate-project="${escapeHtml(project.id)}">${escapeHtml(L.duplicateProject)}</button><button class="project-delete" type="button" data-delete-project="${escapeHtml(project.id)}">${escapeHtml(L.deleteProject)}</button></div></article>`).join("")
      : `<p class="projects-empty">${escapeHtml(L.noProjects)}</p>`;
    $("#projectsModalList").innerHTML = markup;
    $$('[data-open-project]').forEach(button => button.addEventListener("click", () => {
      const project = storedProjects().find(item => item.id === button.dataset.openProject);
      if (!project) return;
      const savedKit = readBrandKit();
      const projectKit = project.document.brand_kit ? { ...savedKit, ...project.document.brand_kit, logo: project.document.brand_kit.uses_saved_logo ? savedKit.logo : null } : state.brandKit;
      state = { ...state, projectId: project.id, projectName: project.name, format: project.document.format, style: project.document.style, accent: project.document.accent, textColor: project.document.text_color, contentColumns: project.document.content_columns || 1, brandKit: projectKit, pages: project.document.pages, mobilePublication: project.document.mobile_publication || { slug: "", status: "draft", publishedAt: null }, activePage: 0, selectedBlock: null, isDirty: false };
      if (state.plan === "ultra") {
        state.brandKit = savedKit;
        state.accent = savedKit.primary;
        state.textColor = savedKit.secondary;
        state.style = savedKit.font;
      }
      $("#formats").hidden = true;
      $("#editor").hidden = false;
      $("#projectsModal").hidden = true;
      resetHistory();
      renderAll();
    }));
    $$('[data-duplicate-project]').forEach(button => button.addEventListener("click", () => {
      const projects = storedProjects();
      const original = projects.find(item => item.id === button.dataset.duplicateProject);
      if (!original) return;
      const copy = JSON.parse(JSON.stringify(original));
      copy.id = uid();
      copy.name = `${original.name} · ${L.copySuffix}`;
      copy.updated_at = new Date().toISOString();
      copy.document.mobile_publication = { slug: "", status: "draft", publishedAt: null };
      (copy.document.pages || []).forEach(page => (page.blocks || []).forEach(block => { block.id = uid(); }));
      projects.unshift(copy);
      localStorage.setItem(projectStorageKey, JSON.stringify(projects.slice(0, 20)));
      renderProjects();
      toast(L.projectDuplicated);
    }));
    $$('[data-delete-project]').forEach(button => button.addEventListener("click", () => {
      const project = storedProjects().find(item => item.id === button.dataset.deleteProject);
      if (!project) return;
      pendingDeleteProjectId = project.id;
      $("#deleteProjectTitle").textContent = L.deleteProjectTitle;
      $("#deleteProjectCopy").textContent = L.deleteProjectCopy;
      $("#deleteProjectName").textContent = project.name;
      $("#cancelDeleteProject").textContent = L.cancel;
      $("#confirmDeleteProject").textContent = L.confirmDeleteProject;
      $("#projectsGalleryView").hidden = true;
      $("#projectDeleteView").hidden = false;
      $("#cancelDeleteProject").focus();
    }));
  }

  const staticBlockHtml = block => {
    if (block.type === "section") return `<div class="menu-block section-block"><span class="section-text">${escapeHtml(block.text)}</span></div>`;
    if (block.type === "dish" || block.type === "dish-image") return `<div class="menu-block dish-block${block.type === "dish-image" ? ` dish-with-image${block.imagePosition === "below" ? " image-below" : ""}` : ""}">${block.type === "dish-image" && block.image ? `<img class="dish-photo" src="${block.image}" alt="">` : ""}<span class="dish-name${textLengthClass(block.name)}">${escapeHtml(block.name)}</span><span class="dish-price">${escapeHtml(block.price)}</span><span class="dish-description${textLengthClass(block.description)}">${escapeHtml(block.description)}</span>${block.allergens?.length ? `<span class="allergen-icons">${block.allergens.map(allergenIcon).join("")}</span>` : ""}</div>`;
    if (block.type === "separator") return `<div class="menu-block separator-block"></div>`;
    if (block.type === "spacer-large") return `<div class="menu-block spacer-block spacer-large"></div>`;
    return `<div class="menu-block ${block.type === "note" ? "note-block" : "text-block"}${textLengthClass(block.text)}">${escapeHtml(block.text || "")}</div>`;
  };

  function staticPageHtml(page) {
    if (!page) return `<div class="print-panel blank-panel"></div>`;
    const paid = state.plan !== "free";
    let content = "";
    if (page.role === "mobile-home") content = `<div class="mobile-menu-home" id="mobile-home"><span class="mobile-restaurant">${escapeHtml(page.restaurant)}</span>${brandLogoMarkup(page, "cover", true)}<span class="mobile-title">${escapeHtml(page.title)}</span><span class="mobile-subtitle">${escapeHtml(page.subtitle)}</span><nav class="mobile-section-links">${state.pages.slice(1).map((item, index) => `<a href="#mobile-${escapeHtml(item.key)}"><span>${String(index + 1).padStart(2, "0")}</span>${escapeHtml(item.title)}</a>`).join("")}</nav></div>`;
    else if (page.role === "mobile-allergens") content = `<div class="mobile-section-head" id="mobile-${escapeHtml(page.key)}"><a class="mobile-home-button" href="#mobile-home" aria-label="${escapeHtml(L.mobileHome)}"><svg viewBox="0 0 24 24"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg></a><span>${escapeHtml(page.title)}</span></div><div class="mobile-allergen-list">${Object.keys(L.allergens).map(key => `<span>${allergenIcon(key)}${escapeHtml(L.allergens[key])}</span>`).join("")}</div>`;
    else if (page.role === "mobile-section") content = `<div class="mobile-section-head" id="mobile-${escapeHtml(page.key)}"><a class="mobile-home-button" href="#mobile-home" aria-label="${escapeHtml(L.mobileHome)}"><svg viewBox="0 0 24 24"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg></a><span>${escapeHtml(page.title)}</span></div>${blocksLayout(page, staticBlockHtml)}`;
    else if (page.role === "cover") content = `<div class="cover-content"><div class="cover-kicker">${escapeHtml(state.plan === "ultra" && state.brandKit.businessName ? state.brandKit.businessName : page.restaurant)}</div><div class="cover-title${textLengthClass(page.title)}">${escapeHtml(page.title)}</div><div class="cover-subtitle${textLengthClass(page.subtitle)}">${escapeHtml(page.subtitle)}</div><span class="cover-rule"></span>${brandLogoMarkup(page, page.side === "back" ? "back" : "cover", true)}</div>`;
    else if (page.role === "back") content = `<div class="back-content">${brandLogoMarkup(page, "back", true)}<div class="back-title${textLengthClass(page.title)}">${escapeHtml(page.title)}</div><div class="back-body${textLengthClass(page.body)}">${escapeHtml(page.body)}</div></div>${allergenLegend()}`;
    else content = `${blocksLayout(page, staticBlockHtml)}${page.showAllergenLegend ? allergenLegend() : ""}`;
    content += brandedFooter(page);
    const pageIndex = state.pages.indexOf(page);
    const pageNumber = state.format === "a3-landscape" && page?.role === "inside" ? pageIndex : null;
    return `<div class="print-panel menu-page style-${state.style} format-${state.format} role-${page.role} ${state.plan === "ultra" ? "no-watermark" : ""}" style="--accent:${paid ? state.accent : "#e5372a"};--text:${paid ? state.textColor : "#181614"}">${content}${pageNumber ? `<span class="print-page-number">${pageNumber}</span>` : ""}${state.plan === "ultra" ? "" : watermark()}</div>`;
  }

  function buildPrintDocument() {
    const root = $("#printDocument");
    let pageSize = $("#dynamicPrintPageSize");
    if (!pageSize) {
      pageSize = document.createElement("style");
      pageSize.id = "dynamicPrintPageSize";
      document.head.append(pageSize);
    }
    if (state.format === "a3-landscape") {
      pageSize.textContent = "@page{size:A3 landscape;margin:0}";
      const pages = [...state.pages];
      while (pages.length % 4) pages.push(null);
      const sheets = [];
      for (let left = 0, right = pages.length - 1; left < right; left += 2, right -= 2) {
        sheets.push([pages[right], pages[left]], [pages[left + 1], pages[right - 1]]);
      }
      root.className = "print-document print-a3-booklet";
      root.innerHTML = sheets.map(pair => `<section class="print-sheet"><div class="fold-guide"></div>${staticPageHtml(pair[0])}${staticPageHtml(pair[1])}</section>`).join("");
    } else if (state.format === "a4-portrait" || state.format === "a4-landscape") {
      const postal = state.format === "a4-landscape";
      pageSize.textContent = `@page{size:A4 ${postal ? "landscape" : "portrait"};margin:0}`;
      const imposedSheets = [[state.pages[3], state.pages[0]], [state.pages[1], state.pages[2]]];
      root.className = `print-document print-folded-imposition ${postal ? "print-postal-imposition" : "print-vertical-imposition"}`;
      root.innerHTML = imposedSheets.map(pair => `<section class="print-sheet"><div class="fold-guide"></div>${staticPageHtml(pair[0])}${staticPageHtml(pair[1])}</section>`).join("");
    } else if (state.format === "mobile-interactive") {
      pageSize.textContent = "@page{size:A4 portrait;margin:0}";
      root.className = "print-document print-a4-pages print-mobile-menu";
      root.innerHTML = state.pages.map(page => `<section class="print-sheet">${staticPageHtml(page)}</section>`).join("");
    } else {
      const landscape = state.format === "a4-landscape";
      pageSize.textContent = `@page{size:A4 ${landscape ? "landscape" : "portrait"};margin:0}`;
      root.className = `print-document print-a4-pages ${landscape ? "print-a4-landscape" : ""}`;
      root.innerHTML = state.pages.map(page => `<section class="print-sheet">${staticPageHtml(page)}</section>`).join("");
    }
  }

  $$(".panel-tabs button").forEach(button => button.addEventListener("click", () => {
    $$(".panel-tabs button").forEach(item => item.classList.toggle("active", item === button));
    $("#blocksPanel").hidden = button.dataset.panel !== "blocks";
    $("#stylePanel").hidden = button.dataset.panel !== "style";
  }));
  ["accentColor", "textColor"].forEach(id => $(`#${id}`).addEventListener("input", event => {
    state[id === "accentColor" ? "accent" : "textColor"] = event.target.value;
    save(); renderPage();
  }));
  $("#projectName").addEventListener("input", event => {
    state.projectName = event.target.value;
    save();
  });
  $("#saveProjectButton").addEventListener("click", () => saveProject(false));
  $("#continueFree").addEventListener("click", () => { $("#freeChangesModal").hidden = true; });
  const focusPlanPreview = () => {
    $("#freeChangesModal").hidden = true;
    $("#planPreview").classList.add("attention");
    $("[data-preview-plan=\"premium\"]").focus();
    setTimeout(() => $("#planPreview").classList.remove("attention"), 1800);
  };
  $("#freeChangePlan").addEventListener("click", focusPlanPreview);
  $("#brandKit").addEventListener("click", event => {
    if (state.plan !== "ultra") {
      event.preventDefault();
      openPlanGate("Ultra");
    }
  });
  $("#applyBrandKit").addEventListener("click", applyBrandKit);
  $("#saveBrandKit").addEventListener("click", saveBrandKit);
  $("#kitLogo").addEventListener("change", event => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      event.target.value = "";
      toast(L.logoTooLarge);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      state.brandKit.logo = reader.result;
      state.brandKit.logoMeta = { name: file.name, type: file.type, size: file.size, storage: "shared-local-kit" };
      save(); renderStyles(); renderPage();
    };
    reader.readAsDataURL(file);
  });
  $("#kitLogoRemove").addEventListener("click", () => {
    state.brandKit.logo = null;
    save();
    $("#kitLogo").value = "";
    renderStyles();
    renderPage();
  });
  $("#openProjectsButton").addEventListener("click", event => openProjectsModal(event.currentTarget));
  $("#editorOpenProjects").addEventListener("click", event => {
    const trigger = event.currentTarget;
    requestLeave(() => openProjectsModal(trigger));
  });
  $$('[data-close-projects]').forEach(button => button.addEventListener("click", () => {
    $("#projectsModal").hidden = true;
    projectsModalTrigger?.focus();
  }));
  $$('[data-cancel-delete-project]').forEach(button => button.addEventListener("click", () => {
    $("#projectDeleteView").hidden = true;
    $("#projectsGalleryView").hidden = false;
    pendingDeleteProjectId = null;
    $("[data-delete-project]")?.focus();
  }));
  $("#confirmDeleteProject").addEventListener("click", () => {
    if (!pendingDeleteProjectId) return;
    const projects = storedProjects().filter(project => project.id !== pendingDeleteProjectId);
    localStorage.setItem(projectStorageKey, JSON.stringify(projects));
    if (state.projectId === pendingDeleteProjectId) {
      state.projectId = uid();
      state.isDirty = true;
    }
    pendingDeleteProjectId = null;
    $("#projectDeleteView").hidden = true;
    $("#projectsGalleryView").hidden = false;
    renderProjects();
    toast(L.projectDeleted);
  });
  document.addEventListener("keydown", event => {
    if (event.key === "Escape" && !$("#removePagesModal").hidden) {
      $("#removePagesModal").hidden = true;
      return;
    }
    if (event.key === "Escape" && !$("#projectDeleteView").hidden) {
      $("#projectDeleteView").hidden = true;
      $("#projectsGalleryView").hidden = false;
      pendingDeleteProjectId = null;
      return;
    }
    if (event.key === "Escape" && !$("#demoModal").hidden) {
      $("#demoModal").hidden = true;
      return;
    }
    if (event.key === "Escape" && !$("#planGateModal").hidden) {
      $("#planGateModal").hidden = true;
      return;
    }
    if (event.key === "Escape" && !$("#leaveModal").hidden) {
      closeLeaveModal();
      return;
    }
    if (event.key === "Escape" && !$("#projectsModal").hidden) {
      $("#projectsModal").hidden = true;
      projectsModalTrigger?.focus();
    }
  });
  $$('[data-leave-action]').forEach(button => button.addEventListener("click", () => {
    const action = button.dataset.leaveAction;
    if (action === "stay") return closeLeaveModal();
    if (action === "upgrade") {
      state.plan = "premium";
      closeLeaveModal();
      renderAll();
      return;
    }
    const next = pendingLeaveAction;
    if (action === "save" && !saveProject()) return;
    state.isDirty = false;
    closeLeaveModal();
    next?.();
  }));
  $$('[data-preview-plan]').forEach(button => button.addEventListener("click", () => {
    state.plan = button.dataset.previewPlan;
    if (state.plan === "ultra") {
      state.brandKit = readBrandKit();
      state.accent = state.brandKit.primary;
      state.textColor = state.brandKit.secondary;
      state.style = state.brandKit.font;
    }
    renderAll();
    toast(`${L.plan}: ${button.textContent}`);
  }));
  $("#projectSaveBar").addEventListener("click", event => {
    if (state.plan === "free" && !event.target.closest("#editorOpenProjects")) {
      event.preventDefault();
      openPlanGate("Premium");
    }
  });
  $(".premium-style").addEventListener("click", event => {
    if (state.plan === "free") {
      event.preventDefault();
      openPlanGate("Premium");
    }
  });
  $("#footerStyleCard").addEventListener("click", event => {
    if (state.plan !== "ultra") {
      event.preventDefault();
      openPlanGate("Ultra");
    }
  });
  $("#styleFooterText").addEventListener("input", event => {
    if (state.plan !== "ultra") return;
    state.brandKit.footerText = event.target.value;
    state.brandKit.footerTextSet = true;
    save(); renderPage();
  });
  $("#styleFooterClear").addEventListener("click", () => {
    if (state.plan !== "ultra") return;
    state.brandKit.footerText = "";
    state.brandKit.footerTextSet = true;
    save(); renderStyles(); renderPage();
  });
  $("#changeFormat").addEventListener("click", () => requestLeave(() => {
      $("#editor").hidden = true;
      $("#formats").hidden = false;
      window.scrollTo({ top: 0, behavior: "smooth" });
    }));
  $("#exportButton").addEventListener("click", () => {
    if (state.format === "mobile-interactive") {
      openMobilePublishModal(); return;
    }
    buildPrintDocument();
    toast(L.messages.pdf);
    setTimeout(() => window.print(), 600);
  });
  $("#undoButton").addEventListener("click", () => restoreHistory(historyIndex - 1));
  $("#redoButton").addEventListener("click", () => restoreHistory(historyIndex + 1));
  const updateEditorZoom = delta => {
    editorZoom = Math.max(.75, Math.min(1.75, editorZoom + delta));
    $("#zoomValue").textContent = `${Math.round(editorZoom * 100)}%`;
    $("#zoomOutButton").disabled = editorZoom <= .75;
    $("#zoomInButton").disabled = editorZoom >= 1.75;
    renderPage();
  };
  $("#zoomOutButton").addEventListener("click", () => updateEditorZoom(-.25));
  $("#zoomInButton").addEventListener("click", () => updateEditorZoom(.25));

  const mainNav = $("#mainNav");
  const mobileBackdrop = $("#mobileNavBackdrop");
  const setMobileMenu = open => {
    mainNav.classList.toggle("mobile-open", open);
    mobileBackdrop.classList.toggle("show", open);
    $("#mobileMenuToggle").setAttribute("aria-expanded", open ? "true" : "false");
  };
  $("#mobileMenuToggle").addEventListener("click", () => setMobileMenu(true));
  $("#mobileMenuClose").addEventListener("click", () => setMobileMenu(false));
  mobileBackdrop.addEventListener("click", () => setMobileMenu(false));
  $("#languageToggle").addEventListener("click", () => {
    const menu = $("#languageMenu");
    const open = !menu.classList.contains("show");
    menu.classList.toggle("show", open);
    $("#languageToggle").setAttribute("aria-expanded", open ? "true" : "false");
  });

  $$('[data-close-demo]').forEach(button => button.addEventListener("click", () => { $("#demoModal").hidden = true; }));
  $$('[data-close-plan-gate]').forEach(button => button.addEventListener("click", () => { $("#planGateModal").hidden = true; }));
  $$('[data-cancel-remove-pages]').forEach(button => button.addEventListener("click", () => { $("#removePagesModal").hidden = true; }));
  $("#confirmRemovePages").addEventListener("click", () => { $("#removePagesModal").hidden = true; removeUltraPages(); });
  $("#viewPlans").addEventListener("click", () => {
    $("#planGateModal").hidden = true;
    focusPlanPreview();
  });
  window.addEventListener("beforeunload", event => {
    if (state.plan === "free" && state.isDirty) {
      event.preventDefault();
      event.returnValue = "";
    }
  });

  $("#siteFooter").innerHTML = `<div class="foot-row"><span>${escapeHtml(L.footerClaim)}</span><nav class="foot-links"><a href="/${L.lang}/${L.contactRoute}/">${escapeHtml(L.contact)}</a><a href="/${L.lang}/faqs/">FAQs</a><a href="/${L.lang}/${L.legalRoute}/">${escapeHtml(L.legal)}</a><a href="/${L.lang}/${L.privacyRoute}/">${escapeHtml(L.privacy)}</a><a href="/${L.lang}/cookies/">Cookies</a><button type="button">${escapeHtml(L.cookieSettings)}</button></nav><a class="footer-admin-link" href="/${L.lang}/admin/" aria-label="Admin">© 2026</a></div>`;

  $("#customMenuBrief").innerHTML = `<div class="custom-menu-brief-copy"><span class="eyebrow">uncartell studio</span><h2>${escapeHtml(L.customMenuTitle)}</h2><p>${escapeHtml(L.customMenuCopy)}</p></div><form id="customMenuBriefForm"><div class="brief-grid"><label><span>${escapeHtml(L.briefName)}</span><input name="name" type="text" required></label><label><span>${escapeHtml(L.briefBusiness)}</span><input name="business" type="text" required></label><label><span>${escapeHtml(L.briefEmail)}</span><input name="email" type="email" required></label><label><span>${escapeHtml(L.briefFormat)}</span><input name="format" type="text"></label></div><label><span>${escapeHtml(L.briefDetails)}</span><textarea name="details" rows="5" required></textarea></label><button type="submit">${escapeHtml(L.briefSend)}</button></form>`;
  $("#customMenuBriefForm").addEventListener("submit", event => { event.preventDefault(); toast(L.briefSent); });

  renderFormats();
})();
