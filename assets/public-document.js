(()=>{
  if(!document.querySelector('link[data-public-document-v3]')){const stylesheet=document.createElement('link');stylesheet.rel='stylesheet';stylesheet.href='/assets/public-document-v3.css?v=3';stylesheet.dataset.publicDocumentV3='';document.head.append(stylesheet)}
  const parts=location.pathname.split('/').filter(Boolean);
  const kind=parts[0]==='carta'?'menu':parts[0]==='serveis'||parts[0]==='servicios'?'services':'';
  const slug=parts[1];
  if(!kind||!slug)return;
  const lang=document.documentElement.lang==='es'?'es':'ca';
  const escape=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const wait=()=>new Promise(resolve=>{const poll=()=>window.UncartellPlatform?.getSupabase?.()?resolve(window.UncartellPlatform.getSupabase()):setTimeout(poll,70);poll()});
  const icon=direction=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${direction==='back'?'M19 12H5m7 7-7-7 7-7':direction==='prev'?'m5 15 7-7 7 7':'m5 9 7 7 7-7'}"/></svg>`;
  const allergenLabels={ca:{gluten:'Gluten',crustaceans:'Crustacis',egg:'Ous',fish:'Peix',peanuts:'Cacauets',soy:'Soja',milk:'Llet',nuts:'Fruits de closca',celery:'Api',mustard:'Mostassa',sesame:'Sèsam',sulphites:'Sulfits',lupin:'Tramussos',molluscs:'Mol·luscs'},es:{gluten:'Gluten',crustaceans:'Crustáceos',egg:'Huevos',fish:'Pescado',peanuts:'Cacahuetes',soy:'Soja',milk:'Leche',nuts:'Frutos de cáscara',celery:'Apio',mustard:'Mostaza',sesame:'Sésamo',sulphites:'Sulfitos',lupin:'Altramuces',molluscs:'Moluscos'}};
  const allergenPaths={gluten:'<path d="M4 20 20 4M8 18c4-5 5-10 4-15m-1 6-4-2m5 7-5-1m6-4 4-3m-5 8 5-2"/>',crustaceans:'<path d="M8 13c0-4 2-7 4-7s4 3 4 7-2 6-4 6-4-2-4-6ZM8 11 4 8M16 11l4-3M9 16l-4 2M15 16l4 2M10 7 8 3M14 7l2-4"/>',egg:'<path d="M12 3c-3 0-6 7-6 11a6 6 0 0 0 12 0c0-4-3-11-6-11Z"/>',fish:'<path d="M4 12c3-5 8-6 13-2l3-3v10l-3-3c-5 4-10 3-13-2Zm4 0h.01"/>',peanuts:'<path d="M9 4c3 0 3 3 5 4s5 1 5 4-3 3-4 5-1 4-4 4-3-3-4-4-4-4 0-4 3-4 3-1 2-3 3-2 3 0Zm-3 9 9-5M8 17l8-5"/>',soy:'<path d="M4 16C7 8 13 5 20 5c-1 8-6 13-14 14M8 15c1-2 2-3 4-4m1 3c1-2 2-3 4-4"/>',milk:'<path d="M8 3h7l2 4v14H7V7l1-4Zm-1 4h10M9 3v4m6-4v4"/>',nuts:'<path d="M12 5c4 0 7 4 6 8-1 5-4 8-6 8s-5-3-6-8c-1-4 2-8 6-8Zm0 0V2m-4 2c2-2 6-2 8 0"/>',celery:'<path d="M8 21V9m4 12V5m4 16V9M8 11 5 8m7-1-3-3m7 7 3-3M6 21h12"/>',mustard:'<path d="M12 4v16M12 8 8 6m4 6 5-3m-5 7-5-3M8 6a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm13 3a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM9 13a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"/>',sesame:'<path d="M8 5c3 2 3 5 0 7-3-2-3-5 0-7Zm8 1c3 2 3 5 0 7-3-2-3-5 0-7Zm-4 7c3 2 3 5 0 7-3-2-3-5 0-7Z"/>',sulphites:'<path d="M9 3h6M10 3v6l-5 9c-.7 1.3.2 3 1.7 3h10.6c1.5 0 2.4-1.7 1.7-3l-5-9V3M8 16h8"/>',lupin:'<path d="M12 21v-9m0 3c-4 0-6-2-6-5 4 0 6 2 6 5Zm0-3c0-4 2-6 5-6 0 4-2 6-5 6Zm0-4c-2-1-3-3-2-5 3 1 4 3 2 5Z"/>',molluscs:'<path d="M4 18c0-7 3-12 8-12s8 5 8 12H4Zm8 0V7m-4 11 2-11m6 11-2-11M6 14h12"/>'};
  const glutenPath='<path d="M12 3v18"/><path d="M12 7C9 7 7.5 5.5 7 3c3 0 4.5 1.5 5 4Z"/><path d="M12 11c-3 0-4.5-1.5-5-4 3 0 4.5 1.5 5 4Z"/><path d="M12 15c-3 0-4.5-1.5-5-4 3 0 4.5 1.5 5 4Z"/><path d="M12 7c3 0 4.5-1.5 5-4-3 0-4.5 1.5-5 4Z"/><path d="M12 11c3 0 4.5-1.5 5-4-3 0-4.5 1.5-5 4Z"/><path d="M12 15c3 0 4.5-1.5 5-4-3 0-4.5 1.5-5 4Z"/><path d="M3 3l18 18"/>';
  const allergenIcon=(key,withLabel=false)=>{const label=allergenLabels[lang][key]||key;const drawing=key==='gluten'?glutenPath:(allergenPaths[key]||'<circle cx="12" cy="12" r="7"/>');return `<button type="button" class="u-public-allergen${withLabel?' has-visible-label':''}" title="${escape(label)}" aria-label="${escape(label)}" aria-expanded="false"><svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${drawing}</svg>${withLabel?`<span class="u-public-allergen-name">${escape(label)}</span>`:`<span class="u-public-allergen-tooltip" role="tooltip">${escape(label)}</span>`}</button>`};
  const renderBlock=block=>{
    if(block.type==='section')return `<h3>${escape(block.text)}</h3>`;
    if(block.type==='separator')return '<hr>';
    if(block.type==='spacer-large')return '<div class="u-public-spacer"></div>';
    if(block.type==='note'||block.type==='text')return `<p class="u-public-note">${escape(block.text)}</p>`;
    const image=block.type==='dish-image'&&block.image?`<img src="${escape(block.image)}" alt="">`:'';
    const allergens=Array.isArray(block.allergens)&&block.allergens.length?`<span class="u-public-dish-allergens">${block.allergens.map(key=>allergenIcon(key)).join('')}</span>`:'';
    return `<article class="${image?'has-image':''}">${image}<div><strong>${escape(block.name||block.title||block.text||'')}</strong>${block.description?`<p>${escape(block.description)}</p>`:''}${allergens}</div>${block.price?`<b>${escape(block.price)}</b>`:''}</article>`;
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
        const pageBody=page.role==='mobile-allergens'?`<div class="u-public-allergen-grid">${Object.keys(allergenLabels[lang]).map(key=>allergenIcon(key,true)).join('')}</div>`:renderBlocks(page);
        content=`<section class="u-public-section"><header><button type="button" data-page="${homeIndex}" aria-label="${lang==='es'?'Volver al menú':'Torna al menú'}">${icon('back')}</button><h1>${escape(page.title||'')}</h1></header><div class="u-public-list">${pageBody}</div></section><nav class="u-public-pager" aria-label="${lang==='es'?'Navegación de la carta':'Navegació de la carta'}">${position>0?`<button type="button" data-page="${numbered[position-1].index}" aria-label="${lang==='es'?'Anterior':'Anterior'}">${icon('prev')}</button>`:'<span></span>'}${position<numbered.length-1?`<button type="button" data-page="${numbered[position+1].index}" aria-label="${lang==='es'?'Siguiente':'Següent'}">${icon('next')}</button>`:'<span></span>'}</nav>`;
      }
      main.innerHTML=`<div class="u-public-shell">${content}<footer>${lang==='es'?'Creado con uncartel.es':'Creat amb uncartell.cat'}</footer></div>`;
      main.querySelectorAll('[data-page]').forEach(button=>button.addEventListener('click',()=>{show(Number(button.dataset.page));scrollTo({top:0,behavior:'smooth'})}));
      main.querySelectorAll('.u-public-allergen:not(.has-visible-label)').forEach(button=>button.addEventListener('click',event=>{event.stopPropagation();const expanded=button.getAttribute('aria-expanded')==='true';main.querySelectorAll('.u-public-allergen[aria-expanded="true"]').forEach(item=>item.setAttribute('aria-expanded','false'));button.setAttribute('aria-expanded',expanded?'false':'true')}));
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
