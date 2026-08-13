(()=>{
  const parts=location.pathname.split('/').filter(Boolean);
  const kind=parts[0]==='carta'?'menu':parts[0]==='serveis'||parts[0]==='servicios'?'services':'';
  const slug=parts[1];
  if(!kind||!slug)return;
  const lang=document.documentElement.lang==='es'?'es':'ca';
  const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const wait=()=>new Promise(resolve=>{const poll=()=>window.UncartellPlatform?.getSupabase?.()?resolve(window.UncartellPlatform.getSupabase()):setTimeout(poll,70);poll()});
  const icon=direction=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${direction==='back'?'M19 12H5m7 7-7-7 7-7':direction==='prev'?'m15 19-7-7 7-7':'m9 5 7 7-7 7'}"/></svg>`;
  const renderBlock=block=>{
    if(block.type==='section')return `<h3>${escape(block.text)}</h3>`;
    if(block.type==='separator')return '<hr>';
    if(block.type==='spacer-large')return '<div class="u-public-spacer"></div>';
    if(block.type==='note'||block.type==='text')return `<p class="u-public-note">${escape(block.text)}</p>`;
    const image=block.type==='dish-image'&&block.image?`<img src="${escape(block.image)}" alt="">`:'';
    return `<article class="${image?'has-image':''}">${image}<div><strong>${escape(block.name||block.title||block.text||'')}</strong>${block.description?`<p>${escape(block.description)}</p>`:''}</div>${block.price?`<b>${escape(block.price)}</b>`:''}</article>`;
  };
  const renderBlocks=page=>(page?.blocks||[]).map(renderBlock).join('');
  const render=payload=>{
    const pages=Array.isArray(payload.pages)?payload.pages:[];
    const homeIndex=Math.max(0,pages.findIndex(page=>page.role==='mobile-home'));
    let active=homeIndex;
    const main=document.querySelector('main');
    const accent=payload.accent||'#73f172';
    document.title=`${payload.name||slug} | ${lang==='es'?'uncartel.es':'uncartell.cat'}`;
    main.className=`u-public-document style-${escape(payload.style||'modern')}`;
    main.style.setProperty('--accent',accent);
    const show=index=>{
      active=Math.min(Math.max(index,0),pages.length-1);
      const page=pages[active]||{};
      const isHome=page.role==='mobile-home';
      const numbered=pages.map((item,index)=>({item,index})).filter(({item,index})=>index!==homeIndex&&['mobile-section','mobile-allergens'].includes(item.role));
      let content='';
      if(isHome){
        content=`<section class="u-public-home"><span class="u-public-kicker">${escape(page.restaurant||payload.name||slug)}</span><h1>${escape(page.title||payload.name||slug)}</h1>${page.subtitle?`<p>${escape(page.subtitle)}</p>`:''}<nav class="u-public-index">${numbered.map(({item,index},position)=>`<button type="button" data-page="${index}"><span>${String(position+1).padStart(2,'0')}</span>${escape(item.title)}</button>`).join('')}</nav></section>`;
      }else{
        const position=numbered.findIndex(entry=>entry.index===active);
        content=`<section class="u-public-section"><header><button type="button" data-page="${homeIndex}" aria-label="${lang==='es'?'Volver al menú':'Torna al menú'}">${icon('back')}</button><h1>${escape(page.title||'')}</h1></header><div class="u-public-list">${renderBlocks(page)}</div></section><nav class="u-public-pager" aria-label="${lang==='es'?'Navegación de la carta':'Navegació de la carta'}">${position>0?`<button type="button" data-page="${numbered[position-1].index}" aria-label="${lang==='es'?'Anterior':'Anterior'}">${icon('prev')}</button>`:'<span></span>'}${position<numbered.length-1?`<button type="button" data-page="${numbered[position+1].index}" aria-label="${lang==='es'?'Siguiente':'Següent'}">${icon('next')}</button>`:'<span></span>'}</nav>`;
      }
      main.innerHTML=`<div class="u-public-shell">${content}<footer>${lang==='es'?'Creado con uncartel.es':'Creat amb uncartell.cat'}</footer></div>`;
      main.querySelectorAll('[data-page]').forEach(button=>button.addEventListener('click',()=>{show(Number(button.dataset.page));scrollTo({top:0,behavior:'smooth'})}));
    };
    show(homeIndex);
    document.body.classList.add('u-public-mode');
  };
  wait().then(async supabase=>{
    const {data,error}=await supabase.rpc('get_public_document',{p_locale:lang,p_kind:kind,p_slug:slug}).maybeSingle();
    if(error||!data)return;
    render(data.payload||{});
  }).catch(()=>{});
})();
