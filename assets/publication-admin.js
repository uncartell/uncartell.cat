(()=>{
  const es=document.documentElement.lang==='es';
  const host=document.querySelector('[data-publication-admin]');
  if(!host)return;
  const labels=es?{
    title:'Cartas y servicios publicados',copy:'Controla las URL públicas, el propietario, el plan y su vigencia.',refresh:'Actualizar',search:'Buscar por título, URL, ID, usuario o email',clear:'Limpiar',all:'Todos',menu:'Cartas web',services:'Servicios',empty:'Todavía no hay publicaciones.',owner:'Usuario',plan:'Plan',expires:'Caduca',updated:'Actualizado',active:'Activa',disabled:'Bloqueada',expired:'Caducada',remove:'Eliminar',confirmRemove:'Confirmar eliminación',error:'No se han podido cargar las publicaciones.'
  }:{
    title:'Cartes i serveis publicats',copy:'Controla les URL públiques, el propietari, el pla i la vigència.',refresh:'Actualitza',search:'Cerca per títol, URL, ID, usuari o correu',clear:'Neteja',all:'Tots',menu:'Cartes web',services:'Serveis',empty:'Encara no hi ha publicacions.',owner:'Usuari',plan:'Pla',expires:'Caduca',updated:'Actualitzat',active:'Activa',disabled:'Bloquejada',expired:'Caducada',remove:'Elimina',confirmRemove:'Confirma eliminació',error:'No s’han pogut carregar les publicacions.'
  };
  host.insertAdjacentHTML('beforeend',`<section class="publication-admin"><header><div><h2>${labels.title}</h2><p>${labels.copy}</p></div><button type="button" data-publication-refresh>${labels.refresh}</button></header><div class="publication-admin-search"><input type="search" data-publication-search placeholder="${labels.search}" autocomplete="off"><select data-publication-kind><option value="">${labels.all}</option><option value="menu">${labels.menu}</option><option value="services">${labels.services}</option></select><select data-publication-locale><option value="">CA + ES</option><option value="ca">CA</option><option value="es">ES</option></select><select data-publication-status><option value="">${labels.all}</option><option value="active">${labels.active}</option><option value="disabled">${labels.disabled}</option><option value="expired">${labels.expired}</option></select><button type="button" data-publication-clear>${labels.clear}</button></div><p class="publication-admin-feedback" data-publication-feedback></p><div class="publication-admin-list" data-publication-list></div><nav class="admin-pager" data-publication-pager></nav></section>`);
  const list=host.querySelector('[data-publication-list]'),feedback=host.querySelector('[data-publication-feedback]'),searchInput=host.querySelector('[data-publication-search]'),kindInput=host.querySelector('[data-publication-kind]'),localeInput=host.querySelector('[data-publication-locale]'),statusInput=host.querySelector('[data-publication-status]'),pager=host.querySelector('[data-publication-pager]');
  const style=document.createElement('style');
  style.textContent='.publication-admin header{display:flex;align-items:flex-end;justify-content:space-between;gap:20px}.publication-admin h2{margin:0 0 8px;font-size:28px;letter-spacing:-.035em}.publication-admin header p{max-width:620px;color:var(--muted);line-height:1.5}.publication-admin-search{display:grid;grid-template-columns:1fr auto;gap:10px;margin-top:24px}.publication-admin-search input{min-width:0;border:1px solid var(--line);border-radius:12px;background:#fff;padding:12px;font:inherit}.publication-admin-feedback{color:#b23030}.publication-admin-list{display:grid;gap:10px;margin-top:18px}.publication-admin-row{display:grid;grid-template-columns:minmax(180px,1.5fr) minmax(180px,1fr) 100px 120px 150px auto;align-items:center;gap:16px;border:1px solid var(--line);border-radius:16px;background:#fff;padding:16px}.publication-admin-row a{overflow:hidden;color:var(--ink);font-weight:850;text-overflow:ellipsis;white-space:nowrap}.publication-admin-row small{display:block;color:var(--muted);font-size:10px}.publication-admin-state{display:flex;flex-wrap:wrap;gap:6px}.publication-admin-state button{padding:8px 10px;font-size:10px}.publication-admin-state button.current{border-color:var(--ink);background:var(--ink);color:#fff}.publication-admin-state button.remove{color:#b23030}.publication-admin-state button.confirm{border-color:#b23030;background:#b23030;color:#fff}@media(max-width:950px){.publication-admin-row{grid-template-columns:1fr 1fr}.publication-admin-state{grid-column:1/-1}}@media(max-width:600px){.publication-admin header{align-items:flex-start;flex-direction:column}.publication-admin-search,.publication-admin-row{grid-template-columns:1fr}}';
  style.textContent += '.publication-admin-search{grid-template-columns:minmax(220px,1fr) repeat(3,auto) auto}.publication-admin-search select{min-width:0;border:1px solid var(--line);border-radius:12px;background:#fff;padding:12px;font:inherit}@media(max-width:950px){.publication-admin-search{grid-template-columns:1fr 1fr}}@media(max-width:600px){.publication-admin-search{grid-template-columns:1fr}}';
  document.head.appendChild(style);
  const wait=()=>new Promise(resolve=>{const poll=()=>window.UncartellPlatform?.getSupabase?.()?resolve(window.UncartellPlatform.getSupabase()):setTimeout(poll,80);poll()});
  const date=value=>value?new Intl.DateTimeFormat(es?'es-ES':'ca-ES',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value)):'—';
  const url=row=>`${location.origin}/${row.kind==='menu'?'carta':(row.locale==='es'?'servicios':'serveis')}/${row.slug}/`;
  let page=1,timer=0;
  const invoke=async body=>{const supabase=await wait();const {data,error}=await supabase.functions.invoke('admin-dashboard',{body});if(error){let detail='';try{detail=(await error.context.json()).error||''}catch{}throw new Error(detail||error.message||labels.error)}if(!data?.ok)throw new Error(data?.error||labels.error);return data};
  async function update(id,status){await invoke({action:'set_publication_status',id,status});await load()}
  async function remove(id){await invoke({action:'delete_publication',id});await load()}
  async function load(){
    feedback.textContent='';list.innerHTML='<p class="admin-loading">…</p>';
    try{
      const data=await invoke({action:'list_publications',page,per_page:25,search:searchInput.value.trim(),kind:kindInput.value,locale:localeInput.value,status:statusInput.value});
      const rows=data.rows||[];list.innerHTML='';
      if(!rows.length){list.innerHTML=`<p class="poster-admin-empty">${labels.empty}</p>`;pager.innerHTML='';return}
      rows.forEach(row=>{
        const article=document.createElement('article');article.className='publication-admin-row';
        article.innerHTML=`<div><a href="${url(row)}" target="_blank" rel="noopener">/${row.kind==='menu'?'carta':(row.locale==='es'?'servicios':'serveis')}/${row.slug}</a><small>${row.locale.toUpperCase()} · ${row.kind}</small></div><div><strong>${row.owner_email||'—'}</strong><small>${labels.owner}</small></div><div><strong>${String(row.plan||'basic').toUpperCase()}</strong><small>${labels.plan}</small></div><div><strong>${date(row.plan_expires_at)}</strong><small>${labels.expires}</small></div><div><strong>${date(row.updated_at)}</strong><small>${labels.updated}</small></div><div class="publication-admin-state"></div>`;
        const controls=article.querySelector('.publication-admin-state');
        [['active',labels.active],['disabled',labels.disabled],['expired',labels.expired]].forEach(([status,text])=>{const button=document.createElement('button');button.type='button';button.textContent=text;button.classList.toggle('current',row.status===status);button.addEventListener('click',()=>update(row.id,status).catch(error=>feedback.textContent=error.message));controls.appendChild(button)});
        const removeButton=document.createElement('button');removeButton.type='button';removeButton.className='remove';removeButton.textContent=labels.remove;removeButton.addEventListener('click',()=>{if(!removeButton.classList.contains('confirm')){removeButton.classList.add('confirm');removeButton.textContent=labels.confirmRemove;return}remove(row.id).catch(error=>feedback.textContent=error.message)});controls.appendChild(removeButton);
        list.appendChild(article);
      });
      const pages=Math.max(1,Math.ceil((data.total||0)/(data.per_page||25)));
      pager.innerHTML=`<button type="button" data-publication-page="${page-1}" ${page<=1?'disabled':''}>←</button><span>${page} / ${pages}</span><button type="button" data-publication-page="${page+1}" ${page>=pages?'disabled':''}>→</button>`;
      pager.querySelectorAll('[data-publication-page]').forEach(button=>button.addEventListener('click',()=>{page=Number(button.dataset.publicationPage);load()}));
    }catch(error){list.innerHTML='';feedback.textContent=error.message||labels.error}
  }
  host.querySelector('[data-publication-refresh]').addEventListener('click',load);
  host.querySelector('[data-publication-clear]').addEventListener('click',()=>{searchInput.value='';page=1;load()});
  searchInput.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>{page=1;load()},320)});
  [kindInput,localeInput,statusInput].forEach(input=>input.addEventListener('change',()=>{page=1;load()}));
  load();
})();
