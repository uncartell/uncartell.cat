(()=>{
  if(!document.querySelector('link[data-ui-shape-system]')){
    const shapeStyles=document.createElement('link');
    shapeStyles.rel='stylesheet';
    shapeStyles.href='/assets/ui-shape-system.css?v=20260820-5';
    shapeStyles.dataset.uiShapeSystem='true';
    document.head.append(shapeStyles);
  }
  // GitHub Pages can briefly return a stale/missing asset while a deployment is
  // propagating. Retry failed stylesheets once instead of leaving a naked page.
  document.querySelectorAll('link[rel="stylesheet"]').forEach(link=>{
    const retry=()=>{if(link.dataset.retry)return;link.dataset.retry='1';const url=new URL(link.href,location.href);url.searchParams.set('retry',Date.now());link.href=url.href};
    link.addEventListener('error',retry,{once:true});
    if(!link.sheet&&document.readyState!=='loading')retry();
  });
  const lang=document.documentElement.lang==='es'?'es':'ca';
  const localeRegistry=Object.freeze({ca:{enabled:true,fallback:'ca'},es:{enabled:true,fallback:'ca'},fr:{enabled:false,fallback:'ca'},it:{enabled:false,fallback:'ca'},de:{enabled:false,fallback:'ca'}});
  window.UncartellI18n={locale:lang,locales:localeRegistry,fallback:'ca'};
  document.documentElement.classList.add(`u-lang-${lang}`);
  const host=location.hostname.replace(/^www\./,'');
  const canonicalHost=(()=>{try{return new URL(document.querySelector('link[rel="canonical"]')?.href||location.href).hostname.replace(/^www\./,'')}catch(_){return host}})();
  const prod=['uncartell.cat','uncartel.es'].includes(host)||['uncartell.cat','uncartel.es'].includes(canonicalHost);
  const base=prod?'':`/${lang}`;
  const route=slug=>`${base}/${slug}`.replace(/\/+/g,'/').replace(/([^/])$/,'$1/');
  const cfg=lang==='ca'?{
    root:route(''),brand:'uncartell',tld:'cat',posters:'Cartells',postersPath:route('cartells'),menus:'Cartes i menús',menusPath:route('cartes-i-menus'),prices:'Taules de preus',pricesPath:route('taules-de-preus'),qr:'Codis QR',qrPath:route('codis-qr'),plans:'Plans',plansPath:route('plans'),account:'Compte',tools:'Eines',about:'Sobre nosaltres',legal:'Legal',posterCreator:'Creador de cartells',menuCreator:'Creador de cartes i menús',priceCreator:'Creador de taules de preus',qrCreator:'Creador de codis QR',faqs:'FAQs',manifest:'Manifest',contact:'Contacte',notice:'Avís legal',privacy:'Privacitat',cookies:'Cookies',settings:'Configura les cookies',downloads:'Descàrregues restants avui',unlimited:'Descàrregues il·limitades',alt:prod?'https://uncartel.es/':'/es/'
  }:{
    root:route(''),brand:'uncartel',tld:'es',posters:'Carteles',postersPath:route('carteles'),menus:'Cartas y menús',menusPath:route('cartas-y-menus'),prices:'Tablas de precios',pricesPath:route('tablas-de-precios'),qr:'Códigos QR',qrPath:route('codigos-qr'),plans:'Planes',plansPath:route('planes'),account:'Cuenta',tools:'Herramientas',about:'Sobre nosotros',legal:'Legal',posterCreator:'Creador de carteles',menuCreator:'Creador de cartas y menús',priceCreator:'Creador de tablas de precios',qrCreator:'Creador de códigos QR',faqs:'Preguntas frecuentes',manifest:'Manifiesto',contact:'Contacto',notice:'Aviso legal',privacy:'Privacidad',cookies:'Cookies',settings:'Configura las cookies',downloads:'Descargas restantes hoy',unlimited:'Descargas ilimitadas',alt:prod?'https://uncartell.cat/':'/ca/'
  };
  const words=lang==='ca'?{
    language:'Idioma',languageTitle:'Tria l’idioma',loginTitle:'Inicia sessió o registra’t',loginCopy:'Accedeix al teu compte per desar projectes i gestionar el pla.',google:'Continua amb Google',apple:'Continua amb Apple',email:'Continua amb correu',name:'El teu nom',emailField:'El teu correu',password:'Contrasenya',continue:'Inicia sessió',createAccount:'Crea el compte',newHere:'Encara no tens compte? Registra’t',alreadyAccount:'Ja tens compte? Inicia sessió',forgotPassword:'Has oblidat la contrasenya?',resetSent:'T’hem enviat un enllaç segur per restablir-la.',resetTitle:'Crea una contrasenya nova',newPassword:'Nova contrasenya',savePassword:'Desa la contrasenya',passwordUpdated:'Contrasenya actualitzada.',marketing:'Vull rebre novetats i avisos de noves eines.',back:'Torna enrere',profile:'El meu compte',hello:'Hola',plan:'Pla',manage:'Canvia de pla',logout:'Tanca la sessió',editName:'Edita el nom',saveName:'Desa el nom',invoices:'Factures',noInvoices:'Encara no hi ha factures.',backProfile:'Torna al perfil',delete:'Elimina el compte',deleteTitle:'Vols eliminar el compte?',deleteCopy:'Eliminarem el compte i totes les dades associades. Aquesta acció no es pot desfer.',cancel:'Cancel·la',confirmDelete:'Sí, elimina el compte',loading:'Connectant…',confirmMail:'Revisa el correu i confirma el compte per continuar.',authError:'No s’ha pogut iniciar la sessió.',invalidLogin:'El correu o la contrasenya no són correctes.',profileSaved:'Nom actualitzat.',formSending:'Enviant…',formError:'No s’ha pogut enviar. Torna-ho a provar.',cookieTitle:'Tu decideixes les cookies',cookieCopy:'Utilitzem elements necessaris perquè el web funcioni. Les cookies analítiques són opcionals i ara mateix no n’activem cap.',reject:'Rebutja opcionals',accept:'Accepta opcionals',configure:'Configura',necessary:'Necessàries',analytics:'Analítiques',save:'Desa la selecció',necessaryCopy:'Sessió, seguretat, preferències i descàrregues.',analyticsCopy:'Mesura agregada de l’ús. Actualment sense proveïdor actiu.'
  }:{
    language:'Idioma',languageTitle:'Elige el idioma',loginTitle:'Inicia sesión o regístrate',loginCopy:'Accede a tu cuenta para guardar proyectos y gestionar el plan.',google:'Continúa con Google',apple:'Continúa con Apple',email:'Continúa con correo',name:'Tu nombre',emailField:'Tu correo',password:'Contraseña',continue:'Inicia sesión',createAccount:'Crea la cuenta',newHere:'¿Aún no tienes cuenta? Regístrate',alreadyAccount:'¿Ya tienes cuenta? Inicia sesión',forgotPassword:'¿Has olvidado la contraseña?',resetSent:'Te hemos enviado un enlace seguro para restablecerla.',resetTitle:'Crea una contraseña nueva',newPassword:'Nueva contraseña',savePassword:'Guardar contraseña',passwordUpdated:'Contraseña actualizada.',marketing:'Quiero recibir novedades y avisos de nuevas herramientas.',back:'Volver',profile:'Mi cuenta',hello:'Hola',plan:'Plan',manage:'Cambiar de plan',logout:'Cerrar sesión',editName:'Editar el nombre',saveName:'Guardar el nombre',invoices:'Facturas',noInvoices:'Todavía no hay facturas.',backProfile:'Volver al perfil',delete:'Eliminar la cuenta',deleteTitle:'¿Quieres eliminar la cuenta?',deleteCopy:'Eliminaremos la cuenta y todos los datos asociados. Esta acción no se puede deshacer.',cancel:'Cancelar',confirmDelete:'Sí, elimina la cuenta',loading:'Conectando…',confirmMail:'Revisa el correo y confirma la cuenta para continuar.',authError:'No se ha podido iniciar la sesión.',invalidLogin:'El correo o la contraseña no son correctos.',profileSaved:'Nombre actualizado.',formSending:'Enviando…',formError:'No se ha podido enviar. Inténtalo de nuevo.',cookieTitle:'Tú decides las cookies',cookieCopy:'Utilizamos elementos necesarios para que la web funcione. Las cookies analíticas son opcionales y ahora mismo no activamos ninguna.',reject:'Rechazar opcionales',accept:'Aceptar opcionales',configure:'Configurar',necessary:'Necesarias',analytics:'Analíticas',save:'Guardar la selección',necessaryCopy:'Sesión, seguridad, preferencias y descargas.',analyticsCopy:'Medición agregada del uso. Actualmente sin proveedor activo.'
  };
  const icon=name=>({globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.4 2.5 3.6 5.5 3.6 9S14.4 18.5 12 21c-2.4-2.5-3.6-5.5-3.6-9S9.6 5.5 12 3Z"/>',user:'<circle cx="12" cy="8" r="3.5"/><path d="M5.5 20c.6-4 2.8-6 6.5-6s5.9 2 6.5 6"/>',crown:'<path d="m3 7 4.5 4L12 4l4.5 7L21 7l-2 11H5Z"/><path d="M5 18h14"/>',close:'<path d="m6 6 12 12M18 6 6 18"/>',layers:'<path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/>',logout:'<path d="M10 17l5-5-5-5M15 12H3"/><path d="M14 3h7v18h-7"/>',settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21h-4v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3.1 14H3v-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.5V3h4v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1v4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>'}[name]||'');
  const current=location.pathname.endsWith('/')?location.pathname:`${location.pathname}/`;
  if(current===cfg.root){document.body.classList.add('u-home');const toolsSection=document.querySelector('.u-section');if(toolsSection)toolsSection.id='tools';const explore=document.querySelector('.u-hero .u-button.primary');if(explore)explore.href='#tools';document.querySelectorAll('.u-tool-link').forEach(link=>{link.innerHTML=link.textContent.replace(/\s*→\s*$/,'')+'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>'})}
  const header=document.querySelector('[data-platform-header]');
  if(header)header.innerHTML=`<header class="u-header"><div class="u-shell u-header-inner"><a class="u-logo" href="${cfg.root}">${cfg.brand}<i>.</i>${cfg.tld}</a><button class="u-mobile-toggle" aria-label="Menú" aria-controls="uNav" aria-expanded="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg></button><nav class="u-nav" id="uNav" aria-label="Menú principal"><button class="u-mobile-close" type="button" aria-label="Tanca el menú"><svg viewBox="0 0 24 24" aria-hidden="true">${icon('close')}</svg></button><span class="u-mobile-nav-heading">Menú</span><a class="${current===cfg.postersPath?'active':''}" href="${cfg.postersPath}">${cfg.posters}</a><a class="${current===cfg.menusPath?'active':''}" href="${cfg.menusPath}">${cfg.menus}</a><a class="${current===cfg.pricesPath?'active':''}" href="${cfg.pricesPath}">${cfg.prices}</a><a class="${current===cfg.qrPath?'active':''}" href="${cfg.qrPath}">${cfg.qr}</a><a class="u-plans-link ${current===cfg.plansPath?'active':''}" href="${cfg.plansPath}"><svg viewBox="0 0 24 24" aria-hidden="true">${icon('crown')}</svg><span>${cfg.plans}</span></a><div class="u-mobile-nav-divider"></div><button class="u-icon-action u-desktop-language" data-language aria-label="${words.language}" aria-expanded="false"><svg viewBox="0 0 24 24">${icon('globe')}</svg><span class="u-mobile-label">${words.language}</span></button><button class="u-icon-action" data-account aria-label="${cfg.account}"><svg viewBox="0 0 24 24">${icon('user')}</svg><span class="u-mobile-label">${cfg.account}</span></button><div class="u-mobile-nav-brand">${cfg.brand}<i>.</i>${cfg.tld}</div></nav></div></header><button class="u-mobile-backdrop" type="button" aria-label="Tanca el menú" hidden></button><div class="u-language-strip" data-language-strip hidden><div class="u-shell"><strong>${words.languageTitle}</strong><div><a class="${lang==='ca'?'active':''}" href="${lang==='ca'?'#':cfg.alt}">CA</a><a class="${lang==='es'?'active':''}" href="${lang==='es'?'#':cfg.alt}">ES</a></div></div></div>`;
  document.querySelector('[data-language]')?.insertAdjacentHTML('afterend',`<div class="u-mobile-language-options" data-mobile-language-options hidden><a class="${lang==='ca'?'active':''}" href="${lang==='ca'?'#':cfg.alt}"><span>CA</span><small>Català</small></a><a class="${lang==='es'?'active':''}" href="${lang==='es'?'#':cfg.alt}"><span>ES</span><small>Castellano</small></a></div>`);
  const footer=document.querySelector('[data-platform-footer]');
  if(footer)footer.innerHTML=`<footer class="u-footer"><div class="u-shell"><div class="u-footer-grid"><div class="u-footer-brand"><a class="u-logo" href="${cfg.root}">${cfg.brand}<i>.</i>${cfg.tld}</a><p>© 2026</p></div><div><h3>${cfg.tools}</h3><a href="${cfg.postersPath}">${cfg.posterCreator}</a><a href="${cfg.menusPath}">${cfg.menuCreator}</a><a href="${cfg.pricesPath}">${cfg.priceCreator}</a><a href="${cfg.qrPath}">${cfg.qrCreator}</a></div><div><h3>${cfg.about}</h3><a href="${cfg.plansPath}">${cfg.plans}</a><a href="${route(lang==='ca'?'faqs':'preguntas-frecuentes')}">${cfg.faqs}</a><a href="${route(lang==='ca'?'manifest':'manifiesto')}">${cfg.manifest}</a><a href="${route(lang==='ca'?'contacte':'contacto')}">${cfg.contact}</a></div><div><h3>${cfg.legal}</h3><a href="${route(lang==='ca'?'legal':'aviso-legal')}">${cfg.notice}</a><a href="${route(lang==='ca'?'privacitat':'privacidad')}">${cfg.privacy}</a><a href="${route('cookies')}">${cfg.cookies}</a><button data-cookie-settings>${cfg.settings}</button></div></div></div></footer>`;
  const mobileNav=document.querySelector('#uNav'),mobileToggle=document.querySelector('.u-mobile-toggle'),mobileBackdrop=document.querySelector('.u-mobile-backdrop');
  const setMobileMenu=open=>{mobileNav?.classList.toggle('open',open);mobileToggle?.setAttribute('aria-expanded',String(open));if(mobileBackdrop)mobileBackdrop.hidden=!open;document.body.classList.toggle('u-mobile-menu-open',open)};
  mobileToggle?.addEventListener('click',()=>setMobileMenu(!mobileNav?.classList.contains('open')));
  document.querySelector('.u-mobile-close')?.addEventListener('click',()=>setMobileMenu(false));
  mobileBackdrop?.addEventListener('click',()=>setMobileMenu(false));
  mobileNav?.addEventListener('click',event=>{
    if(event.target.closest('a,[data-account]'))setMobileMenu(false);
  });
  const toggleLanguage=()=>{const button=document.querySelector('[data-language]');if(matchMedia('(max-width:980px)').matches){const options=document.querySelector('[data-mobile-language-options]');const open=options.hidden;options.hidden=!open;button?.setAttribute('aria-expanded',String(open));return}const strip=document.querySelector('[data-language-strip]');const open=strip.hidden;strip.hidden=!open;document.body.classList.toggle('u-language-open',open);button?.setAttribute('aria-expanded',String(open));setMobileMenu(false)};
  document.querySelector('[data-language]')?.addEventListener('click',toggleLanguage);
  document.addEventListener('keydown',event=>{if(event.key==='Escape')setMobileMenu(false)});

  const initToolOnboarding=()=>{
    const tool=current.includes('/cartell')?'posters':current.includes('cartes-i-menus')||current.includes('cartas-y-menus')?'menus':current.includes('taules-de-preus')||current.includes('tablas-de-precios')?'services':current.includes('codis-qr')||current.includes('codigos-qr')?'qr':'';
    const editor=document.querySelector('#editor,#posterEditor,.qr-editor,.editor-shell,[data-editor-shell]');
    if(!tool||!editor||document.querySelector('.u-tool-onboarding'))return;
    if(editor.hidden||editor.closest('[hidden]')||editor.getClientRects().length===0){
      const observer=new MutationObserver(()=>{if(!editor.hidden&&!editor.closest('[hidden]')&&editor.getClientRects().length){observer.disconnect();initToolOnboarding()}});
      observer.observe(document.body,{attributes:true,subtree:true,attributeFilter:['hidden','class','style']});
      setTimeout(()=>observer.disconnect(),120000);return;
    }
    const copy=lang==='ca'?['Edita el contingut des del panell o directament sobre la previsualització.','Desa el projecte per recuperar-lo en qualsevol dispositiu.','Previsualitza el resultat abans de descarregar o publicar.']:['Edita el contenido desde el panel o directamente sobre la vista previa.','Guarda el proyecto para recuperarlo en cualquier dispositivo.','Previsualiza el resultado antes de descargar o publicar.'];
    const titles=lang==='ca'?['Edita al teu ritme','Desa el projecte','Revisa el resultat']:['Edita a tu ritmo','Guarda el proyecto','Revisa el resultado'];
    const images={posters:'/assets/home/cartells.png',menus:'/assets/home/cartes-i-menus.png',services:'/assets/home/taules-de-preus.png',qr:'/assets/home/codis-qr.png'};
    const doneKey=`uncartell-onboarding-${tool}-v2`;
    let step=0;
    const backdrop=document.createElement('div');backdrop.className='u-onboarding-backdrop';backdrop.hidden=true;
    const box=document.createElement('aside');box.className='u-tool-onboarding';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-label',lang==='ca'?'Tutorial de l’eina':'Tutorial de la herramienta');box.hidden=true;
    const render=()=>{const last=step===copy.length-1;box.innerHTML=`<div class="u-onboarding-media"><img src="${images[tool]}" alt=""><span>${step+1} / ${copy.length}</span></div><button class="u-onboarding-close" type="button" aria-label="${lang==='ca'?'Tanca':'Cerrar'}">×</button><div class="u-onboarding-copy"><strong>${titles[step]}</strong><p>${copy[step]}</p><div class="u-onboarding-dots" aria-hidden="true">${copy.map((_,index)=>`<i${index===step?' class="is-active"':''}></i>`).join('')}</div><div class="u-onboarding-actions"><button class="u-onboarding-skip" type="button">${lang==='ca'?'Omet':'Omitir'}</button><button class="u-onboarding-next" type="button">${last?(lang==='ca'?'Comença':'Empezar'):(lang==='ca'?'Següent':'Siguiente')}</button></div></div>`;
      box.querySelector('.u-onboarding-close').addEventListener('click',complete);
      box.querySelector('.u-onboarding-skip').addEventListener('click',complete);
      box.querySelector('.u-onboarding-next').addEventListener('click',()=>{if(last){complete();return}step+=1;render()});
    };
    function open(){step=0;render();backdrop.hidden=false;box.hidden=false;document.body.classList.add('u-onboarding-open');box.querySelector('.u-onboarding-close')?.focus()}
    function close(){box.hidden=true;backdrop.hidden=true;document.body.classList.remove('u-onboarding-open')}
    function complete(){localStorage.setItem(doneKey,'done');close()}
    document.body.append(backdrop,box);
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!box.hidden)complete()});
    if(localStorage.getItem(doneKey)!=='done')open();
  };
  addEventListener('DOMContentLoaded',()=>setTimeout(initToolOnboarding,0),{once:true});

  const quotaKey='uncartell-global-download-quota-v12',today=new Date().toISOString().slice(0,10);
  let quota={date:today,count:0};try{quota={...quota,...JSON.parse(localStorage.getItem(quotaKey)||'{}')}}catch(_){ }
  if(quota.date!==today)quota={date:today,count:0};
  const max=10,quotaEl=document.querySelector('[data-global-quota]'),quotaRoutes=[cfg.root,cfg.postersPath,cfg.menusPath,cfg.qrPath,cfg.pricesPath];
  const remainingDownloads=()=>Math.max(0,max-quota.count);
  const renderQuota=()=>{if(!quotaEl||!quotaRoutes.includes(current)){quotaEl?.remove();return}const plan=getPlan(),paid=plan!=='basic',remaining=remainingDownloads(),value=paid?'∞':`${remaining}/${max}`,state=paid?' is-unlimited':remaining===0?' is-empty':remaining<=5?' is-low':'';quotaEl.innerHTML=`<div class="u-quota${state}"><span class="u-quota-dot"></span><strong>${value}</strong><small>${paid?cfg.unlimited:cfg.downloads}</small></div>`;requestAnimationFrame(syncQuotaDock)};
  let quotaDockFrame=0;
  function syncQuotaDock(){
    cancelAnimationFrame(quotaDockFrame);
    quotaDockFrame=requestAnimationFrame(()=>{
      const pill=quotaEl?.querySelector('.u-quota'),pageFooter=document.querySelector('.u-footer');
      if(!pill||!pageFooter)return;
      const gap=matchMedia('(max-width:620px)').matches?12:20;
      const footerTop=pageFooter.getBoundingClientRect().top;
      const baseBottom=document.querySelector('.plan-preview')?74:gap;
      const footerBottom=footerTop<=innerHeight-gap?innerHeight-footerTop+gap:baseBottom;
      pill.style.bottom=`${Math.max(baseBottom,footerBottom)}px`;
    });
  }
  addEventListener('scroll',syncQuotaDock,{passive:true});
  addEventListener('resize',syncQuotaDock);
  const planKey='uncartell-plan-v12';
  function getPlan(){return localStorage.getItem(planKey)||'basic'}
  function setPlan(plan){localStorage.setItem(planKey,plan);document.documentElement.dataset.plan=plan;renderQuota();window.dispatchEvent(new CustomEvent('uncartell:plan',{detail:{plan}}))}

  document.body.insertAdjacentHTML('beforeend',`<div class="u-account-modal" data-account-modal hidden><button class="u-modal-shade" data-account-close aria-label="${words.back}"></button><section class="u-account-card" role="dialog" aria-modal="true"><button class="u-account-close" data-account-close aria-label="Tanca"><svg viewBox="0 0 24 24">${icon('close')}</svg></button><div data-account-view="login"><h2>${words.loginTitle}</h2><p>${words.loginCopy}</p><div class="u-account-methods"><button data-auth-google><b>G</b>${words.google}</button><button disabled class="disabled"><b>●</b>${words.apple}<small>${lang==='ca'?'Properament':'Próximamente'}</small></button><button data-auth-email><b>✉</b>${words.email}</button></div><form class="u-account-email" data-auth-form hidden data-auth-mode="login"><input name="name" autocomplete="name" placeholder="${words.name}" hidden><input name="email" type="email" autocomplete="email" required placeholder="${words.emailField}"><input name="password" type="password" autocomplete="current-password" minlength="6" required placeholder="${words.password}"><label class="u-marketing-consent" data-auth-marketing hidden><input name="marketing_consent" type="checkbox"><span>${words.marketing}</span></label><button class="u-button primary" type="submit" data-auth-submit>${words.continue}</button><button class="u-text-button" type="button" data-auth-toggle>${words.newHere}</button><button class="u-text-button" type="button" data-auth-back>${words.back}</button></form><p class="u-account-feedback" data-auth-feedback></p></div><div data-account-view="profile" hidden><img class="u-account-avatar" src="/${lang==='ca'?'profile-ca.png':'profile-es.png'}" alt=""><div class="u-profile-name-row"><h2 data-profile-greeting>${words.hello}</h2><button type="button" data-profile-edit aria-label="${words.editName}">✎</button></div><form class="u-profile-name-form" data-profile-name-form hidden><input name="display_name" maxlength="80" required><button class="u-button primary" type="submit">${words.saveName}</button></form><p data-profile-email></p><span class="u-plan-badge" data-profile-plan>Basic</span><button class="u-account-action u-invoices-action" type="button" data-profile-invoices>${words.invoices}</button><div class="u-account-actions"><a class="u-account-action" href="${cfg.plansPath}"><svg viewBox="0 0 24 24">${icon('layers')}</svg>${words.manage}</a><button class="u-account-action" data-auth-logout><svg viewBox="0 0 24 24">${icon('logout')}</svg>${words.logout}</button></div><button class="u-delete-account" data-auth-delete>${words.delete}</button><p class="u-account-feedback" data-profile-feedback></p></div><div data-account-view="invoices" hidden><h2>${words.invoices}</h2><div class="u-invoices-empty">${words.noInvoices}</div><button class="u-text-button" type="button" data-invoices-back>${words.backProfile}</button></div><div data-account-view="delete" hidden><div class="u-sad-face">☹</div><h2>${words.deleteTitle}</h2><p>${words.deleteCopy}</p><div class="u-confirm-actions"><button class="u-button" data-delete-back>${words.cancel}</button><button class="u-button danger" data-delete-confirm>${words.confirmDelete}</button></div><p class="u-account-feedback" data-delete-feedback></p></div></section></div>`);

  const upgradeWords=lang==='ca'?{
    title:'Fes upgrade',copy:'Canvia a Premium o Ultra per desbloquejar noves funcions.',view:'Veure plans',choose:'Tria el pla que encaixa amb tu',chooseCopy:'Comença amb Basic o desbloqueja més eines quan les necessitis.',current:'Pla actual',recommended:'Recomanat',soon:'Properament',basicCopy:'Crea i descarrega sense registrar-te.',premiumCopy:'Desa projectes i personalitza colors i tipografies.',ultraCopy:'Kit de marca, logotip i control total de la marca d’aigua.',basicFeatures:['Crea cartells i cartes','Edita tots els textos','10 descàrregues diàries','PDF preparats per imprimir'],premiumFeatures:['Tot el que inclou Basic','Colors i tipografies personalitzades','Descàrregues il·limitades','Desa i recupera projectes'],ultraFeatures:['Tot el que inclou Premium','Afegeix imatges','Retira la marca d’aigua','Kit de marca i logotip'],premiumCta:'Activa Premium gratis',ultraCta:'Avisa’m',ultraEmail:'El teu correu',ultraSent:'T’avisarem ✓',close:'Tanca',back:'Torna enrere'
  }:{
    title:'Haz upgrade',copy:'Cambia a Premium o Ultra para desbloquear nuevas funciones.',view:'Ver planes',choose:'Elige el plan que encaja contigo',chooseCopy:'Empieza con Basic o desbloquea más herramientas cuando las necesites.',current:'Plan actual',recommended:'Recomendado',soon:'Próximamente',basicCopy:'Crea y descarga sin registrarte.',premiumCopy:'Guarda proyectos y personaliza colores y tipografías.',ultraCopy:'Kit de marca, logotipo y control total de la marca de agua.',basicFeatures:['Crea carteles y cartas','Edita todos los textos','10 descargas diarias','PDF listos para imprimir'],premiumFeatures:['Todo lo que incluye Basic','Colores y tipografías personalizadas','Descargas ilimitadas','Guarda y recupera proyectos'],ultraFeatures:['Todo lo que incluye Premium','Añade imágenes','Retira la marca de agua','Kit de marca y logotipo'],premiumCta:'Activa Premium gratis',ultraCta:'Avísame',ultraEmail:'Tu correo',ultraSent:'Te avisaremos ✓',close:'Cerrar',back:'Volver'
  };
  const upgradeFeatures=items=>`<ul class="u-upgrade-features">${items.map(item=>`<li>${item}</li>`).join('')}</ul>`;
  document.body.insertAdjacentHTML('beforeend',`<div class="u-upgrade-modal" data-upgrade-modal hidden><button class="u-modal-shade" type="button" data-upgrade-close aria-label="${upgradeWords.close}"></button><section class="u-upgrade-card" role="dialog" aria-modal="true" aria-labelledby="uUpgradeTitle"><button class="u-account-close" type="button" data-upgrade-close aria-label="${upgradeWords.close}"><svg viewBox="0 0 24 24">${icon('close')}</svg></button><div data-upgrade-step="intro"><h2 id="uUpgradeTitle">${upgradeWords.title}</h2><p>${upgradeWords.copy}</p><button class="u-button primary u-upgrade-view" type="button" data-upgrade-view>${upgradeWords.view}</button></div><div data-upgrade-step="plans" hidden><h2>${upgradeWords.choose}</h2><p>${upgradeWords.chooseCopy}</p><div class="u-upgrade-plans"><article data-upgrade-plan="basic"><header data-upgrade-label>${upgradeWords.current}</header><div class="u-upgrade-plan-body"><h3>Basic</h3><p>${upgradeWords.basicCopy}</p>${upgradeFeatures(upgradeWords.basicFeatures)}<strong>0 €</strong><button type="button" data-upgrade-basic>${upgradeWords.current}</button></div></article><article class="featured" data-upgrade-plan="premium"><header data-upgrade-label>${upgradeWords.recommended}</header><div class="u-upgrade-plan-body"><h3>Premium</h3><p>${upgradeWords.premiumCopy}</p>${upgradeFeatures(upgradeWords.premiumFeatures)}<strong>0 € <del>29,99 €</del></strong><button type="button" data-upgrade-premium>${upgradeWords.premiumCta}</button></div></article><article class="ultra" data-upgrade-plan="ultra"><header data-upgrade-label>${upgradeWords.soon}</header><div class="u-upgrade-plan-body"><h3>Ultra</h3><p>${upgradeWords.ultraCopy}</p>${upgradeFeatures(upgradeWords.ultraFeatures)}<strong>59,99 €</strong><button type="button" data-upgrade-ultra-notify>${upgradeWords.ultraCta}</button><div class="u-upgrade-ultra-email" data-upgrade-ultra-email hidden><input type="email" inputmode="email" autocomplete="email" placeholder="${upgradeWords.ultraEmail}" aria-label="${upgradeWords.ultraEmail}"><button type="button" aria-label="Envia">→</button></div><small class="u-upgrade-ultra-feedback" data-upgrade-ultra-feedback></small></div></article></div></div></section></div>`);

  const modal=document.querySelector('[data-account-modal]'),view=name=>document.querySelector(`[data-account-view="${name}"]`),feedback=document.querySelector('[data-auth-feedback]');
  const authToggle=document.querySelector('[data-auth-toggle]');
  const forgotPasswordButton=document.createElement('button');
  forgotPasswordButton.type='button';forgotPasswordButton.className='u-text-button';forgotPasswordButton.dataset.authForgot='';forgotPasswordButton.textContent=words.forgotPassword;authToggle?.after(forgotPasswordButton);
  const resetView=document.createElement('div');
  resetView.dataset.accountView='reset';resetView.hidden=true;resetView.innerHTML=`<h2>${words.resetTitle}</h2><form class="u-account-email" data-auth-reset><input name="password" type="password" autocomplete="new-password" minlength="8" required placeholder="${words.newPassword}"><button class="u-button primary" type="submit">${words.savePassword}</button></form><p class="u-account-feedback" data-reset-feedback></p>`;
  view('login')?.after(resetView);
  const accountPlansBack=document.createElement('button');
  accountPlansBack.type='button';accountPlansBack.className='u-text-button u-account-plans-back';accountPlansBack.textContent=lang==='ca'?'Torna als plans':'Volver a los planes';accountPlansBack.hidden=true;
  document.querySelector('.u-account-methods')?.after(accountPlansBack);
  const googleButton=document.querySelector('[data-auth-google]'),emailButton=document.querySelector('[data-auth-email]');
  googleButton.classList.add('u-auth-google');
  googleButton.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.3c1.9-1.8 2.9-4.4 2.9-7.4Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.5c-.9.6-2 1-3.4 1a5.9 5.9 0 0 1-5.5-4.1H3.1v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.5 14a6 6 0 0 1 0-3.9V7.4H3.1a10 10 0 0 0 0 9.2L6.5 14Z"/><path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.9 1.5l2.9-2.8A9.7 9.7 0 0 0 3.1 7.4l3.4 2.7A5.9 5.9 0 0 1 12 5.9Z"/></svg><span>${words.google}</span>`;
  emailButton.classList.add('u-auth-email');
  emailButton.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6.5h18v11H3zM3.5 7l8.5 6 8.5-6"/></svg><span>${lang==='ca'?'Registra’t amb correu':'Regístrate con correo'}</span>`;
  const appleButton=document.querySelector('.u-account-methods .disabled');
  appleButton?.classList.add('u-auth-apple');
  if(appleButton)appleButton.innerHTML=`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M16.7 12.8c0-2.4 2-3.6 2.1-3.7a4.5 4.5 0 0 0-3.5-1.9c-1.5-.2-2.9.9-3.6.9-.7 0-1.8-.9-3-.9a4.7 4.7 0 0 0-4 2.4c-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3.1 2.4 1.2 0 1.7-.8 3.3-.8 1.5 0 2 .8 3.3.8 1.4 0 2.3-1.2 3.1-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-3.3-1.3-3.3-3.8ZM14.3 5.6c.7-.9 1.2-2.2 1.1-3.4-1.1 0-2.4.7-3.2 1.6-.7.8-1.3 2.1-1.1 3.3 1.2.1 2.4-.6 3.2-1.5Z"/></svg><span>${words.apple}</span><small>${lang==='ca'?'Properament':'Próximamente'}</small>`;
  const upgradeModal=document.querySelector('[data-upgrade-modal]');
  const upgradePlansStep=upgradeModal?.querySelector('[data-upgrade-step="plans"]');
  if(upgradePlansStep){const login=document.createElement('button');login.type='button';login.className='u-text-button u-upgrade-login';login.dataset.upgradeLogin='';login.textContent=words.alreadyAccount;upgradePlansStep.append(login)}
  const showUpgradeStep=name=>upgradeModal?.querySelectorAll('[data-upgrade-step]').forEach(step=>step.hidden=step.dataset.upgradeStep!==name);
  const closeUpgrade=()=>{if(!upgradeModal)return;upgradeModal.hidden=true;document.body.classList.remove('u-modal-open')};
  const syncUpgradePlans=()=>{
    if(!upgradeModal)return;
    const plan=getPlan();
    upgradeModal.querySelectorAll('[data-upgrade-plan]').forEach(card=>{
      const cardPlan=card.dataset.upgradePlan,isCurrent=cardPlan===plan;
      card.classList.toggle('is-current',isCurrent);
      const label=card.querySelector('[data-upgrade-label]');
      if(label)label.textContent=isCurrent?upgradeWords.current:cardPlan==='premium'?upgradeWords.recommended:cardPlan==='ultra'?upgradeWords.soon:'Basic';
    });
    const premiumButton=upgradeModal.querySelector('[data-upgrade-premium]');
    if(premiumButton){premiumButton.disabled=plan==='premium'||plan==='ultra';premiumButton.textContent=plan==='premium'?upgradeWords.current:plan==='ultra'?(lang==='ca'?'Inclòs amb Ultra':'Incluido en Ultra'):upgradeWords.premiumCta}
    const basicButton=upgradeModal.querySelector('[data-upgrade-basic]');
    if(basicButton){basicButton.disabled=plan==='basic';basicButton.textContent=plan==='basic'?upgradeWords.current:(lang==='ca'?'Canvia a Basic':'Cambia a Basic')}
  };
  const openUpgradeModal=()=>{if(!upgradeModal)return;syncUpgradePlans();showUpgradeStep('plans');upgradeModal.hidden=false;document.body.classList.add('u-modal-open')};
  // The Premium badge inside every locked project-save field is itself a CTA.
  // Keep this delegated so it also covers editors rendered after platform init.
  const projectPremiumSelector='.project-save-bar.is-locked .project-lock, .qr-project-bar.is-locked [data-project-plan], [data-premium-controls].is-locked, [data-colors-card].is-locked';
  const openProjectPremiumGate=event=>{
    const badge=event.target.closest(projectPremiumSelector);
    if(!badge)return;
    event.preventDefault();event.stopPropagation();openUpgradeModal();
  };
  document.addEventListener('click',openProjectPremiumGate);
  document.addEventListener('keydown',event=>{
    if(event.key!=='Enter'&&event.key!==' ')return;
    const badge=event.target.closest(projectPremiumSelector);
    if(!badge)return;
    event.preventDefault();openUpgradeModal();
  });
  const prepareProjectPremiumBadges=()=>document.querySelectorAll('.project-lock,[data-project-plan],[data-premium-controls],[data-colors-card]').forEach(badge=>{badge.setAttribute('role','button');badge.setAttribute('tabindex','0')});
  prepareProjectPremiumBadges();
  addEventListener('uncartell:plan',syncUpgradePlans);
  let supabaseClient=null,currentUser=null,currentProfile=null,supportContext=null,pendingPremium=localStorage.getItem('uncartell-pending-premium')==='1';
  const supportSessionKey='uncartell_support_session';
  const readSupportSession=()=>{try{return JSON.parse(sessionStorage.getItem(supportSessionKey)||'null')}catch(_){return null}};
  const callAdmin=async(action,payload={})=>{const {data,error}=await supabaseClient.functions.invoke('admin-dashboard',{body:{action,...payload}});if(error)throw error;if(data?.error)throw new Error(data.error);return data};
  const endSupportSession=async()=>{const session=readSupportSession();try{if(session?.token&&supabaseClient)await callAdmin('stop_impersonation',{token:session.token})}catch(error){console.error(error)}sessionStorage.removeItem(supportSessionKey);location.href=`${base}/admin/`.replace(/\/+/g,'/')};
  const renderSupportBanner=()=>{document.querySelector('[data-support-banner]')?.remove();if(!supportContext)return;const banner=document.createElement('aside');banner.className='u-support-banner';banner.dataset.supportBanner='';banner.innerHTML=`<strong>${lang==='ca'?'Estàs navegant com':'Estás navegando como'} ${supportContext.email||supportContext.user_id}</strong><button type="button">${lang==='ca'?'Tornar a Admin':'Volver a Admin'}</button>`;banner.querySelector('button').addEventListener('click',endSupportSession);document.body.prepend(banner)};
  const loadSupportContext=async()=>{const session=readSupportSession();if(!session?.token)return;try{supportContext=await callAdmin('support_context',{token:session.token});renderSupportBanner()}catch(error){console.error('Support session',error);sessionStorage.removeItem(supportSessionKey);supportContext=null}};
  let resolveAuthReady;
  const authReady=new Promise(resolve=>{resolveAuthReady=resolve});
  const showView=name=>{['login','reset','profile','invoices','delete'].forEach(v=>{const node=view(v);if(node)node.hidden=v!==name})};
  const openAccount=(source='account')=>{if(supportContext)return;modal.hidden=false;document.body.classList.add('u-modal-open');showView(currentUser?'profile':'login');accountPlansBack.hidden=Boolean(currentUser)||source!=='plans'};
  const closeAccount=()=>{modal.hidden=true;document.body.classList.remove('u-modal-open')};
  document.querySelectorAll('[data-upgrade-close]').forEach(button=>button.addEventListener('click',closeUpgrade));
  document.querySelector('[data-upgrade-login]')?.addEventListener('click',()=>{closeUpgrade();openAccount('plans')});
  document.querySelector('[data-upgrade-view]')?.addEventListener('click',()=>showUpgradeStep('plans'));
  document.querySelector('[data-upgrade-premium]')?.addEventListener('click',async event=>{
    const button=event.currentTarget,original=button.textContent;button.disabled=true;
    try{const activated=await activatePremium();if(activated)location.reload();else closeUpgrade()}
    catch(error){console.error(error);button.textContent=lang==='ca'?'Torna-ho a provar':'Inténtalo de nuevo'}
    finally{button.disabled=false;if(button.textContent!==original)setTimeout(()=>button.textContent=original,1800)}
  });
  const requestBasicDowngrade=()=>new Promise(resolve=>{
    const wrap=document.createElement('div');wrap.className='u-confirm-modal';wrap.innerHTML=`<button class="u-modal-shade" type="button" data-no></button><section role="dialog" aria-modal="true"><button class="u-account-close" type="button" data-no aria-label="${words.cancel}"><svg viewBox="0 0 24 24">${icon('close')}</svg></button><h2>${lang==='ca'?'Canviar a Basic?':'¿Cambiar a Basic?'}</h2><p>${lang==='ca'?'Perdràs l’accés als projectes desats, als documents mòbils publicats i a les funcions Premium.':'Perderás el acceso a los proyectos guardados, a los documentos móviles publicados y a las funciones Premium.'}</p><div><button type="button" data-no>${words.cancel}</button><button type="button" class="danger" data-yes>${lang==='ca'?'Sí, canvia a Basic':'Sí, cambia a Basic'}</button></div></section>`;
    const finish=value=>{wrap.remove();document.body.classList.remove('u-modal-open');resolve(value)};wrap.querySelectorAll('[data-no]').forEach(node=>node.addEventListener('click',()=>finish(false)));wrap.querySelector('[data-yes]').addEventListener('click',()=>finish(true));document.body.append(wrap);document.body.classList.add('u-modal-open');
  });
  document.querySelector('[data-upgrade-basic]')?.addEventListener('click',async event=>{if(getPlan()==='basic'||!await requestBasicDowngrade())return;const button=event.currentTarget;button.disabled=true;try{await window.UncartellPlatform.switchToBasic();syncUpgradePlans()}catch(error){console.error(error)}finally{button.disabled=false}});
  const upgradeUltraButton=document.querySelector('[data-upgrade-ultra-notify]');
  const upgradeUltraEmail=document.querySelector('[data-upgrade-ultra-email]');
  const upgradeUltraInput=upgradeUltraEmail?.querySelector('input');
  const upgradeUltraSubmit=upgradeUltraEmail?.querySelector('button');
  const upgradeUltraFeedback=document.querySelector('[data-upgrade-ultra-feedback]');
  const saveUpgradeUltraInterest=async()=>{
    await authReady;
    const value=(currentUser?.email||upgradeUltraInput?.value||'').trim().toLowerCase();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)){if(upgradeUltraFeedback)upgradeUltraFeedback.textContent=lang==='ca'?'Escriu un correu vàlid.':'Escribe un correo válido.';upgradeUltraInput?.focus();return}
    upgradeUltraSubmit&&(upgradeUltraSubmit.disabled=true);
    try{
      await submitMailboxForm({type:'ultra',fields:{email:value,message:lang==='ca'?`${value} s’ha interessat pel pla Ultra.`:`${value} se ha interesado por el plan Ultra.`}});
      if(upgradeUltraEmail)upgradeUltraEmail.hidden=true;
      if(upgradeUltraButton){upgradeUltraButton.hidden=false;upgradeUltraButton.disabled=true;upgradeUltraButton.textContent=upgradeWords.ultraSent}
      if(upgradeUltraFeedback)upgradeUltraFeedback.textContent='';
    }catch(_){if(upgradeUltraFeedback)upgradeUltraFeedback.textContent=lang==='ca'?'No s’ha pogut enviar. Torna-ho a provar.':'No se ha podido enviar. Inténtalo de nuevo.';upgradeUltraSubmit&&(upgradeUltraSubmit.disabled=false)}
  };
  upgradeUltraButton?.addEventListener('click',async()=>{await authReady;if(currentUser?.email){saveUpgradeUltraInterest();return}upgradeUltraButton.hidden=true;upgradeUltraEmail.hidden=false;upgradeUltraInput?.focus()});
  upgradeUltraSubmit?.addEventListener('click',saveUpgradeUltraInterest);
  upgradeUltraInput?.addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();saveUpgradeUltraInterest()}});
  document.querySelector('[data-account]')?.addEventListener('click',()=>{setMobileMenu(false);openAccount()});
  accountPlansBack.addEventListener('click',()=>{pendingPremium=false;localStorage.removeItem('uncartell-pending-premium');closeAccount();openUpgradeModal()});
  document.querySelectorAll('[data-account-close]').forEach(button=>button.addEventListener('click',closeAccount));
  document.addEventListener('keydown',event=>{if(event.key!=='Escape')return;if(!upgradeModal?.hidden)closeUpgrade();else if(!modal.hidden)closeAccount()});
  document.querySelector('[data-auth-email]').addEventListener('click',()=>{const form=document.querySelector('[data-auth-form]');document.querySelector('.u-account-methods').hidden=true;form.hidden=false;form.dataset.authMode='register';form.querySelector('[name="name"]').hidden=false;form.querySelector('[data-auth-marketing]').hidden=false;form.querySelector('[name="password"]').autocomplete='new-password';form.querySelector('[data-auth-submit]').textContent=words.createAccount;form.querySelector('[data-auth-toggle]').textContent=words.alreadyAccount;forgotPasswordButton.hidden=true;form.querySelector('input[name="name"]').focus()});
  document.querySelector('[data-auth-back]').addEventListener('click',()=>{document.querySelector('.u-account-methods').hidden=false;document.querySelector('[data-auth-form]').hidden=true;forgotPasswordButton.hidden=true;feedback.textContent=''});
  document.querySelector('[data-auth-toggle]').addEventListener('click',()=>{const form=document.querySelector('[data-auth-form]'),register=form.dataset.authMode!=='register';form.dataset.authMode=register?'register':'login';form.querySelector('[name="name"]').hidden=!register;form.querySelector('[data-auth-marketing]').hidden=!register;form.querySelector('[name="password"]').autocomplete=register?'new-password':'current-password';form.querySelector('[data-auth-submit]').textContent=register?words.createAccount:words.continue;form.querySelector('[data-auth-toggle]').textContent=register?words.alreadyAccount:words.newHere;forgotPasswordButton.hidden=register;feedback.textContent=''});
  forgotPasswordButton.addEventListener('click',async()=>{
    if(!supabaseClient)return;
    const email=String(document.querySelector('[data-auth-form] [name="email"]')?.value||'').trim();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){feedback.textContent=lang==='ca'?'Escriu primer un correu vàlid.':'Escribe primero un correo válido.';return}
    forgotPasswordButton.disabled=true;feedback.textContent=words.loading;
    const {error}=await supabaseClient.auth.resetPasswordForEmail(email,{redirectTo:`${location.origin}${location.pathname}?reset=1`});
    forgotPasswordButton.disabled=false;feedback.textContent=error?words.authError:words.resetSent;
  });
  document.querySelector('[data-auth-reset]')?.addEventListener('submit',async event=>{
    event.preventDefault();if(!supabaseClient)return;
    const out=document.querySelector('[data-reset-feedback]'),password=String(new FormData(event.currentTarget).get('password')||'');out.textContent=words.loading;
    const {error}=await supabaseClient.auth.updateUser({password});
    if(error){out.textContent=words.authError;return}
    out.textContent=words.passwordUpdated;history.replaceState({},'',location.pathname);setTimeout(()=>{showView('profile');loadProfile(currentUser)},700);
  });
  async function loadProfile(user){
    currentUser=user;
    const result=await supabaseClient.from('profiles').select('display_name,plan,premium_until,ultra_until,marketing_consent,role').eq('id',user.id).maybeSingle();
    currentProfile=result.data||{};
    let premiumValid=currentProfile.plan==='premium'&&currentProfile.premium_until&&new Date(currentProfile.premium_until)>new Date();
    let ultraValid=currentProfile.plan==='ultra'&&currentProfile.ultra_until&&new Date(currentProfile.ultra_until)>new Date();
    // During the beta every authenticated account is Premium automatically.
    // This also repairs older accounts that were left as Basic after login.
    if(!ultraValid&&!premiumValid){
      const activation=await supabaseClient.rpc('activate_launch_premium');
      if(!activation.error){
        const refreshed=await supabaseClient.from('profiles').select('display_name,plan,premium_until,ultra_until,marketing_consent,role').eq('id',user.id).maybeSingle();
        currentProfile=refreshed.data||{...(currentProfile||{}),plan:'premium'};
        premiumValid=currentProfile.plan==='premium'&&currentProfile.premium_until&&new Date(currentProfile.premium_until)>new Date();
        ultraValid=currentProfile.plan==='ultra'&&currentProfile.ultra_until&&new Date(currentProfile.ultra_until)>new Date();
      }
    }
    localStorage.removeItem('uncartell-pending-premium');pendingPremium=false;closeUpgrade();
    setPlan(supportContext?.plan||(ultraValid?'ultra':premiumValid?'premium':'basic'));
    const name=currentProfile.display_name||user.user_metadata?.full_name||user.email?.split('@')[0]||'';
    document.querySelector('[data-profile-greeting]').textContent=`${words.hello}, ${name}`;
    document.querySelector('[data-profile-email]').textContent=user.email||'';
    document.querySelector('[data-profile-plan]').textContent=ultraValid?'Ultra':premiumValid?'Premium':'Basic';
    const actions=document.querySelector('.u-account-actions');
    let adminLink=document.querySelector('[data-profile-admin]');
    if(currentProfile.role==='admin'&&!adminLink&&actions){adminLink=document.createElement('a');adminLink.className='u-account-action';adminLink.dataset.profileAdmin='';adminLink.href=`${base}/admin/`.replace(/\/+/g,'/');adminLink.innerHTML=`<svg viewBox="0 0 24 24">${icon('settings')}</svg>${lang==='ca'?'Administració':'Administración'}`;actions.prepend(adminLink)}
    if(adminLink)adminLink.hidden=currentProfile.role!=='admin';
    showView('profile');
  }
  function injectSupabase(){return new Promise((resolve,reject)=>{if(window.supabase)return resolve();const existing=document.querySelector('script[data-supabase-client]');if(existing){existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',reject,{once:true});return}const script=document.createElement('script');script.dataset.supabaseClient='';script.src='/assets/vendor-supabase.js?v=1';script.onload=resolve;script.onerror=reject;document.head.appendChild(script)})}
  async function initAuth(){
    try{await injectSupabase();supabaseClient=window.supabase.createClient('https://glaqcsvbnuowabsovvto.supabase.co','sb_publishable_eUW2gqRN00HJRFyhJugmeQ_ahplHxkr');const {data}=await supabaseClient.auth.getSession();if(data.session?.user){await loadSupportContext();await loadProfile(data.session.user)}window.dispatchEvent(new CustomEvent('uncartell:auth-ready',{detail:{user:currentUser,support:supportContext}}));if(data.session?.user&&new URLSearchParams(location.search).get('reset')==='1'){modal.hidden=false;document.body.classList.add('u-modal-open');showView('reset')}else if(data.session?.user&&sessionStorage.getItem('uncartell-refresh-after-auth')==='1'){sessionStorage.removeItem('uncartell-refresh-after-auth');location.reload();return}supabaseClient.auth.onAuthStateChange((event,session)=>{if(event==='PASSWORD_RECOVERY'&&session?.user)setTimeout(()=>{currentUser=session.user;modal.hidden=false;document.body.classList.add('u-modal-open');showView('reset')},0);if(event==='SIGNED_IN'&&session?.user)setTimeout(async()=>{await loadSupportContext();await loadProfile(session.user);window.dispatchEvent(new CustomEvent('uncartell:auth-change',{detail:{event,user:session.user,support:supportContext}}))},0);if(event==='SIGNED_OUT'){currentUser=null;currentProfile=null;supportContext=null;sessionStorage.removeItem(supportSessionKey);setPlan('basic');showView('login');window.dispatchEvent(new CustomEvent('uncartell:auth-change',{detail:{event,user:null}}))}})}catch(error){console.error('Auth init',error);window.dispatchEvent(new CustomEvent('uncartell:auth-ready',{detail:{user:null,error:true}}))}finally{resolveAuthReady?.()}
  }
  document.querySelector('[data-auth-google]').addEventListener('click',async()=>{if(!supabaseClient)return;sessionStorage.setItem('uncartell-refresh-after-auth','1');feedback.textContent=words.loading;const {error}=await supabaseClient.auth.signInWithOAuth({provider:'google',options:{redirectTo:`${location.origin}${location.pathname}${location.search}${location.hash}`}});if(error){sessionStorage.removeItem('uncartell-refresh-after-auth');feedback.textContent=error.message||words.authError}});
  document.querySelector('[data-auth-form]').addEventListener('submit',async event=>{event.preventDefault();if(!supabaseClient)return;feedback.textContent=words.loading;const node=event.currentTarget,form=new FormData(node),email=String(form.get('email')||'').trim(),password=String(form.get('password')||''),name=String(form.get('name')||'').trim(),marketingConsent=form.get('marketing_consent')==='on',register=node.dataset.authMode==='register';const result=register?await supabaseClient.auth.signUp({email,password,options:{data:{full_name:name,marketing_consent:marketingConsent},emailRedirectTo:`${location.origin}${location.pathname}`}}):await supabaseClient.auth.signInWithPassword({email,password});if(result.error){feedback.textContent=register?(result.error.message||words.authError):words.invalidLogin;return}if(result.data.session){await loadProfile(result.data.user);location.reload()}else feedback.textContent=words.confirmMail});
  document.querySelector('[data-auth-logout]').addEventListener('click',async()=>{if(supabaseClient)await supabaseClient.auth.signOut();closeAccount();location.href=cfg.root});
  document.querySelector('[data-auth-delete]').addEventListener('click',()=>showView('delete'));
  document.querySelector('[data-profile-invoices]').addEventListener('click',()=>showView('invoices'));
  document.querySelector('[data-invoices-back]').addEventListener('click',()=>showView('profile'));
  document.querySelector('[data-profile-edit]').addEventListener('click',()=>{const form=document.querySelector('[data-profile-name-form]');form.hidden=!form.hidden;if(!form.hidden){form.elements.display_name.value=currentProfile?.display_name||'';form.elements.display_name.focus()}});
  document.querySelector('[data-profile-name-form]').addEventListener('submit',async event=>{event.preventDefault();if(!supabaseClient||!currentUser)return;const out=document.querySelector('[data-profile-feedback]'),displayName=event.currentTarget.elements.display_name.value.trim();out.textContent=words.loading;const {error}=await supabaseClient.from('profiles').update({display_name:displayName}).eq('id',currentUser.id);if(error){out.textContent=error.message;return}currentProfile={...currentProfile,display_name:displayName};document.querySelector('[data-profile-greeting]').textContent=`${words.hello}, ${displayName}`;event.currentTarget.hidden=true;out.textContent=words.profileSaved});
  document.querySelector('[data-delete-back]').addEventListener('click',()=>showView('profile'));
  document.querySelector('[data-delete-confirm]').addEventListener('click',async()=>{const out=document.querySelector('[data-delete-feedback]');if(!supabaseClient)return;out.textContent=words.loading;const {error}=await supabaseClient.rpc('delete_own_account');if(error){out.textContent=error.message;return}await supabaseClient.auth.signOut({scope:'local'});setPlan('basic');closeAccount();location.href=cfg.root});

  const consentKey='uncartell-cookie-consent';
  document.body.insertAdjacentHTML('beforeend',`<aside class="u-cookie-banner" data-cookie-banner hidden><h2>${words.cookieTitle}</h2><p>${words.cookieCopy}</p><div data-cookie-summary><div class="u-cookie-actions"><button data-cookie-reject>${words.reject}</button><button data-cookie-configure>${words.configure}</button><button class="primary" data-cookie-accept>${words.accept}</button></div></div><div data-cookie-panel hidden><label><span><strong>${words.necessary}</strong><small>${words.necessaryCopy}</small></span><input type="checkbox" checked disabled></label><label><span><strong>${words.analytics}</strong><small>${words.analyticsCopy}</small></span><input type="checkbox" data-analytics-consent></label><button class="u-button primary" data-cookie-save>${words.save}</button></div></aside>`);
  const cookie=document.querySelector('[data-cookie-banner]');
  const saveConsent=analytics=>{localStorage.setItem(consentKey,JSON.stringify({necessary:true,analytics,date:new Date().toISOString()}));cookie.hidden=true};
  if(!localStorage.getItem(consentKey))cookie.hidden=false;
  document.querySelector('[data-cookie-reject]').addEventListener('click',()=>saveConsent(false));document.querySelector('[data-cookie-accept]').addEventListener('click',()=>saveConsent(true));document.querySelector('[data-cookie-configure]').addEventListener('click',()=>{document.querySelector('[data-cookie-summary]').hidden=true;document.querySelector('[data-cookie-panel]').hidden=false});document.querySelector('[data-cookie-save]').addEventListener('click',()=>saveConsent(document.querySelector('[data-analytics-consent]').checked));document.querySelector('[data-cookie-settings]')?.addEventListener('click',()=>{cookie.hidden=false;document.querySelector('[data-cookie-summary]').hidden=false;document.querySelector('[data-cookie-panel]').hidden=true});

  async function submitMailboxForm({type='contact',fields={},form}={}){
    const mailbox=lang==='es'?'hola@uncartel.es':'hola@uncartell.cat',data=form?new FormData(form):new FormData();
    Object.entries(fields).forEach(([key,value])=>data.set(key,String(value??'')));
    data.set('language',lang);data.set('source_domain',location.hostname);data.set('source_url',location.href);
    data.set('_subject',type==='studio'?(lang==='es'?'Nueva solicitud · uncartell studio':'Nova petició · uncartell studio'):type==='ultra'?(lang==='es'?'Interés en el plan Ultra':'Interès pel pla Ultra'):(lang==='es'?'Nuevo mensaje desde uncartel.es':'Nou missatge des d’uncartell.cat'));
    data.set('_template','table');data.set('_captcha','false');data.set('_honey','');
    const response=await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(mailbox)}`,{method:'POST',headers:{Accept:'application/json'},body:data});
    if(!response.ok)throw new Error(words.formError);
    return response.json().catch(()=>({success:true}));
  }
  async function activatePremium(){await authReady;if(!supabaseClient)throw new Error(words.authError);if(!currentUser){pendingPremium=true;localStorage.setItem('uncartell-pending-premium','1');closeUpgrade();openAccount('plans');return false}const {error}=await supabaseClient.rpc('activate_launch_premium');if(error)throw error;localStorage.removeItem('uncartell-pending-premium');pendingPremium=false;await loadProfile(currentUser);return true}
  const blobToDataUrl=async url=>{
    const response=await fetch(url);
    if(!response.ok)throw new Error(words.publishUploadError||'No s’ha pogut desar una de les imatges.');
    const blob=await response.blob();
    return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(reader.error||new Error(words.publishUploadError));reader.readAsDataURL(blob)});
  };
  async function persistUploadedData(value){
    if(typeof value==='string'&&value.startsWith('blob:'))return blobToDataUrl(value);
    if(Array.isArray(value))return Promise.all(value.map(persistUploadedData));
    if(value&&typeof value==='object')return Object.fromEntries(await Promise.all(Object.entries(value).map(async([key,item])=>[key,await persistUploadedData(item)])));
    return value;
  }
  async function publishDocument({kind,slug,payload}){
    await authReady;
    if(!supabaseClient||!currentUser)throw new Error(words.authError);
    if(supportContext)throw new Error(lang==='ca'?'La publicació està bloquejada en mode suport.':'La publicación está bloqueada en modo soporte.');
    const plan=getPlan();
    if(!['premium','ultra'].includes(plan))throw new Error(upgradeWords.copy);
    const persistedPayload=await persistUploadedData(payload);
    const {data,error}=await supabaseClient.rpc('publish_public_document',{p_locale:lang,p_kind:kind,p_slug:slug,p_payload:persistedPayload});
    if(error)throw error;
    const published=Array.isArray(data)?data[0]:data;
    if(!published?.slug)throw new Error(words.publishError||'La publicació no s’ha confirmat.');
    const {data:verified,error:verifyError}=await supabaseClient.rpc('get_public_document',{p_locale:lang,p_kind:kind,p_slug:slug});
    if(verifyError)throw verifyError;
    if(!(Array.isArray(verified)?verified.length:verified))throw new Error(words.publishError||'La publicació no s’ha confirmat.');
    return {...published,url:`${location.origin}/${kind==='menu'?'carta':(lang==='ca'?'serveis':'servicios')}/${slug}/`};
  }
  async function checkDocumentSlug(kind,slug){
    await authReady;
    if(!supabaseClient||!currentUser)return false;
    if(supportContext)return false;
    const {data,error}=await supabaseClient.rpc('public_document_slug_available',{p_locale:lang,p_kind:kind,p_slug:slug});
    if(error)throw error;
    return data===true;
  }
  async function deletePublishedDocument(kind,slug){
    await authReady;
    if(!supabaseClient||!currentUser)throw new Error(words.authError);
    if(supportContext)throw new Error(lang==='ca'?'L’eliminació està bloquejada en mode suport.':'La eliminación está bloqueada en modo soporte.');
    if(!slug)return false;
    const {data,error}=await supabaseClient.rpc('delete_own_public_document',{p_locale:lang,p_kind:kind,p_slug:String(slug).trim().toLowerCase()});
    if(error)throw error;
    return data===true;
  }
  async function listUserProjects(toolType){
    await authReady;if(!supabaseClient||!currentUser)return [];
    if(supportContext){const result=await callAdmin('support_list_projects',{token:readSupportSession()?.token,tool_type:toolType});return result.rows||[]}
    const {data,error}=await supabaseClient.from('user_projects').select('id,name,payload,created_at,updated_at').eq('user_id',currentUser.id).eq('tool_type',toolType).order('updated_at',{ascending:false});
    if(error)throw error;return (data||[]).map(row=>({...row.payload,id:row.id,name:row.name,updated_at:row.updated_at}));
  }
  async function saveUserProject(toolType,project){
    await authReady;if(!supabaseClient||!currentUser)throw new Error(words.authError);
    const payload=await persistUploadedData(project);const now=new Date().toISOString();
    const projectId=String(project.id||project.projectId||`${toolType}-${Date.now()}`);
    if(supportContext){await callAdmin('support_save_project',{token:readSupportSession()?.token,tool_type:toolType,project:{...payload,id:projectId,name:String(project.name||'Projecte')}});return {...project,id:projectId,updated_at:now}}
    const {error}=await supabaseClient.from('user_projects').upsert({id:projectId,user_id:currentUser.id,tool_type:toolType,locale:lang,name:String(project.name||'Projecte'),payload:{...payload,id:projectId},updated_at:now},{onConflict:'user_id,tool_type,id'});
    if(error)throw error;return {...project,updated_at:now};
  }
  async function deleteUserProject(toolType,id){
    await authReady;if(!supabaseClient||!currentUser)throw new Error(words.authError);
    if(supportContext)throw new Error(lang==='ca'?'L’eliminació està bloquejada en mode suport.':'La eliminación está bloqueada en modo soporte.');
    const {error}=await supabaseClient.from('user_projects').delete().eq('user_id',currentUser.id).eq('tool_type',toolType).eq('id',String(id));if(error)throw error;
  }
  const projectStores=new Map();
  async function syncProjectStore(toolType,storageKey){
    projectStores.set(toolType,storageKey);await authReady;
    // Editors may register their store before platform.js has finished auth init.
    // Wait for that initialisation too, then read the authenticated cloud account.
    if(!supabaseClient)await new Promise(resolve=>window.addEventListener('uncartell:auth-ready',resolve,{once:true}));
    if(!currentUser)return [];
    let local=[];try{local=JSON.parse(localStorage.getItem(storageKey)||'[]')}catch(_){local=[]}
    const cloud=await listUserProjects(toolType),cloudIds=new Set(cloud.map(project=>String(project.id||project.projectId)));
    // Preserve projects created before cloud sync existed and migrate them to the
    // authenticated account. Cloud rows win when both sides contain the same id.
    const localOnly=local.filter(project=>!cloudIds.has(String(project.id||project.projectId)));
    if(localOnly.length)await Promise.all(localOnly.map(project=>saveUserProject(toolType,project)));
    const refreshed=localOnly.length?await listUserProjects(toolType):cloud;
    const merged=[...refreshed].sort((a,b)=>new Date(b.updated_at||b.savedAt||0)-new Date(a.updated_at||a.savedAt||0));
    localStorage.setItem(storageKey,JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('uncartell:projects-synced',{detail:{toolType,projects:merged}}));return merged;
  }
  window.addEventListener('uncartell:auth-change',event=>{if(event.detail?.user)projectStores.forEach((key,type)=>syncProjectStore(type,key).catch(console.error))});
  // Every plan-gated control opens the same upgrade journey, including
  // controls that editors render after platform initialisation.
  document.addEventListener('click',event=>{
    const locked=event.target.closest('.is-locked,.ultra-locked,.locked-logo-control,.locked-footer-control,.ultra-pages-button.locked,[data-plan-locked]');
    if(!locked||locked.closest('.u-upgrade-modal,.u-account-modal'))return;
    const actionable=event.target.closest('.project-lock,[data-project-plan],.plan-style-badge,.ultra-badge,.feature-plan-badge,button,a')||locked.matches('.premium-style,.footer-style-card,.brand-kit,[data-colors-card],[data-watermark-card]');
    if(!actionable)return;
    event.preventDefault();event.stopPropagation();openUpgradeModal();
  },true);
  window.UncartellPlatform={lang,cfg,words,getQuota:()=>quota,getUser:()=>supportContext?{id:supportContext.user_id,email:supportContext.email}:currentUser,getProfile:()=>supportContext||currentProfile,getSupportContext:()=>supportContext,getSupabase:()=>supabaseClient,whenReady:()=>authReady,submitMailboxForm,publishDocument,checkDocumentSlug,deletePublishedDocument,listUserProjects,saveUserProject,deleteUserProject,syncProjectStore,canDownload(){return getPlan()!=='basic'||remainingDownloads()>0},consumeDownload(options={}){if(getPlan()==='basic'){if(remainingDownloads()<=0){openUpgradeModal();return false}quota.count=Math.min(max,quota.count+1);localStorage.setItem(quotaKey,JSON.stringify(quota));renderQuota()}if(options.reload!==false)location.reload();return true},getPlan,setPlan,openAccount,openUpgradeModal,requestBasicDowngrade,activatePremium,async switchToBasic(){if(supportContext)throw new Error('Action disabled during support impersonation');if(currentUser&&supabaseClient){const {error}=await supabaseClient.rpc('switch_to_basic');if(error)throw error}setPlan('basic')}};
  setPlan(getPlan());renderQuota();initAuth();
})();
