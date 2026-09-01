(()=>{
  const root=document.querySelector('.poster-admin');
  if(!root)return;
  const nav=[...root.querySelectorAll('[data-admin-nav]')];
  const views=[...root.querySelectorAll('[data-admin-view]')];
  const valid=new Set(nav.map(button=>button.dataset.adminNav));
  const activate=(name,{focus=false}={})=>{
    if(!valid.has(name))name='overview';
    nav.forEach(button=>{
      const active=button.dataset.adminNav===name;
      button.classList.toggle('is-active',active);
      button.setAttribute('aria-current',active?'page':'false');
    });
    views.forEach(view=>{
      const active=view.dataset.adminView===name;
      view.hidden=!active;
      if(view.tagName==='DETAILS')view.open=active;
    });
    history.replaceState(null,'',name==='overview'?location.pathname:`#${name}`);
    if(focus)root.querySelector(`[data-admin-view="${name}"] h2`)?.focus?.();
  };
  nav.forEach(button=>button.addEventListener('click',()=>activate(button.dataset.adminNav)));
  root.querySelectorAll('[data-admin-jump]').forEach(button=>button.addEventListener('click',()=>activate(button.dataset.adminJump)));
  activate(location.hash.slice(1)||'overview');

  const command=root.querySelector('[data-admin-command]');
  command?.addEventListener('submit',event=>{
    event.preventDefault();
    const kind=root.querySelector('[data-admin-global-kind]').value;
    const query=root.querySelector('[data-admin-global-search]').value.trim();
    activate(kind);
    const selector=kind==='publications'?'[data-publication-search]':`[data-admin-list-search="${kind}"]`;
    const apply=()=>{
      const input=root.querySelector(selector);
      if(!input)return false;
      input.value=query;
      input.dispatchEvent(new Event('input',{bubbles:true}));
      input.focus();
      return true;
    };
    if(!apply())setTimeout(apply,500);
  });

  const syncOverview=()=>{
    const source=root.querySelector('[data-analytics-admin] .admin-metrics');
    const target=root.querySelector('[data-admin-overview-metrics]');
    if(source&&target&&source.children.length){
      const nextMetrics=[...source.children].map(card=>`<article>${card.innerHTML}</article>`).join('');
      if(target.innerHTML!==nextMetrics)target.innerHTML=nextMetrics;
    }
    const audit=[...root.querySelectorAll('[data-system-admin] .admin-system-list>div')].slice(0,5);
    const activity=root.querySelector('[data-admin-overview-activity]');
    if(audit.length&&activity){
      const nextActivity=audit.map(row=>{
        const title=row.querySelector('strong')?.textContent||'Activitat administrativa';
        const date=row.querySelector('em')?.textContent||'';
        return `<div><i aria-hidden="true"></i><span>${escapeHtml(title)}</span><time>${escapeHtml(date)}</time></div>`;
      }).join('');
      if(activity.innerHTML!==nextActivity)activity.innerHTML=nextActivity;
    }
  };
  const escapeHtml=value=>String(value).replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const overviewObserver=new MutationObserver(syncOverview);
  root.querySelectorAll('[data-analytics-admin],[data-system-admin]').forEach(source=>{
    overviewObserver.observe(source,{childList:true,subtree:true});
  });
  syncOverview();
})();
