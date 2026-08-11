(()=>{
  const es=document.documentElement.lang==='es';
  const host=document.querySelector('.poster-admin');
  if(!host)return;
  const labels=es?{
    eyebrow:'PUBLICACIONES',title:'Cartas y servicios publicados',copy:'Controla las URL públicas, el propietario, el plan y su vigencia.',refresh:'Actualizar',empty:'Todavía no hay publicaciones.',owner:'Usuario',plan:'Plan',expires:'Caduca',updated:'Actualizado',active:'Activa',disabled:'Bloqueada',expired:'Caducada',error:'No se han podido cargar las publicaciones.'
  }:{
    eyebrow:'PUBLICACIONS',title:'Cartes i serveis publicats',copy:'Controla les URL públiques, el propietari, el pla i la vigència.',refresh:'Actualitza',empty:'Encara no hi ha publicacions.',owner:'Usuari',plan:'Pla',expires:'Caduca',updated:'Actualitzat',active:'Activa',disabled:'Bloquejada',expired:'Caducada',error:'No s’han pogut carregar les publicacions.'
  };
  host.insertAdjacentHTML('beforeend',`<section class="publication-admin"><header><div><span class="eyebrow">${labels.eyebrow}</span><h2>${labels.title}</h2><p>${labels.copy}</p></div><button type="button" data-publication-refresh>${labels.refresh}</button></header><p class="publication-admin-feedback" data-publication-feedback></p><div class="publication-admin-list" data-publication-list></div></section>`);
  const list=host.querySelector('[data-publication-list]'),feedback=host.querySelector('[data-publication-feedback]');
  const style=document.createElement('style');
  style.textContent='.publication-admin{margin-top:76px;padding-top:58px;border-top:1px solid var(--line)}.publication-admin header{display:flex;align-items:flex-end;justify-content:space-between;gap:20px}.publication-admin h2{margin:10px 0 8px;font-size:clamp(34px,4vw,54px);letter-spacing:-.045em}.publication-admin header p{max-width:620px;color:var(--muted);line-height:1.5}.publication-admin-feedback{color:#b23030}.publication-admin-list{display:grid;gap:10px;margin-top:28px}.publication-admin-row{display:grid;grid-template-columns:minmax(180px,1.5fr) minmax(180px,1fr) 100px 120px 150px auto;align-items:center;gap:16px;border:1px solid var(--line);border-radius:16px;background:#fff;padding:16px}.publication-admin-row a{overflow:hidden;color:var(--ink);font-weight:850;text-overflow:ellipsis;white-space:nowrap}.publication-admin-row small{display:block;color:var(--muted);font-size:10px}.publication-admin-state{display:flex;gap:6px}.publication-admin-state button{padding:8px 10px;font-size:10px}.publication-admin-state button.current{border-color:var(--ink);background:var(--ink);color:#fff}@media(max-width:950px){.publication-admin-row{grid-template-columns:1fr 1fr}.publication-admin-state{grid-column:1/-1}}@media(max-width:600px){.publication-admin header{align-items:flex-start;flex-direction:column}.publication-admin-row{grid-template-columns:1fr}}';
  document.head.appendChild(style);
  const wait=()=>new Promise(resolve=>{const poll=()=>window.UncartellPlatform?.getSupabase?.()?resolve(window.UncartellPlatform.getSupabase()):setTimeout(poll,80);poll()});
  const date=value=>value?new Intl.DateTimeFormat(es?'es-ES':'ca-ES',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value)):'—';
  const url=row=>`${location.origin}/${row.kind==='menu'?'carta':(es?'servicios':'serveis')}/${row.slug}/`;
  async function update(id,status){const supabase=await wait();const {error}=await supabase.from('public_documents').update({status}).eq('id',id);if(error)throw error;await load()}
  async function load(){
    feedback.textContent='';list.innerHTML='';
    try{
      const supabase=await wait();
      const {data,error}=await supabase.from('public_documents').select('id,owner_email,locale,kind,slug,plan,status,plan_expires_at,updated_at').order('updated_at',{ascending:false});
      if(error)throw error;
      if(!data?.length){list.innerHTML=`<p class="poster-admin-empty">${labels.empty}</p>`;return}
      data.forEach(row=>{
        const article=document.createElement('article');article.className='publication-admin-row';
        article.innerHTML=`<div><a href="${url(row)}" target="_blank" rel="noopener">/${row.kind==='menu'?'carta':(row.locale==='es'?'servicios':'serveis')}/${row.slug}</a><small>${row.locale.toUpperCase()} · ${row.kind}</small></div><div><strong>${row.owner_email||'—'}</strong><small>${labels.owner}</small></div><div><strong>${String(row.plan||'basic').toUpperCase()}</strong><small>${labels.plan}</small></div><div><strong>${date(row.plan_expires_at)}</strong><small>${labels.expires}</small></div><div><strong>${date(row.updated_at)}</strong><small>${labels.updated}</small></div><div class="publication-admin-state"></div>`;
        const controls=article.querySelector('.publication-admin-state');
        [['active',labels.active],['disabled',labels.disabled],['expired',labels.expired]].forEach(([status,text])=>{const button=document.createElement('button');button.type='button';button.textContent=text;button.classList.toggle('current',row.status===status);button.addEventListener('click',()=>update(row.id,status).catch(error=>feedback.textContent=error.message));controls.appendChild(button)});
        list.appendChild(article);
      });
    }catch(error){feedback.textContent=error.message||labels.error}
  }
  host.querySelector('[data-publication-refresh]').addEventListener('click',load);
  load();
})();
