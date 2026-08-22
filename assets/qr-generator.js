(()=>{
  const lang=document.documentElement.lang==='es'?'es':'ca';
  const T=lang==='ca'?{
    invalid:'Escriu un enllaç complet, per exemple https://exemple.cat',saved:'Projecte desat',generated:'QR generat correctament',copied:'QR copiat al porta-retalls',copyFail:'El navegador no permet copiar aquesta imatge',downloaded:'Fitxer preparat',opened:'Projecte obert',deleted:'Projecte eliminat',none:'Encara no tens cap projecte desat',open:'Obre',remove:'Elimina',savedAt:'Desat',printTitle:'Codi QR',fallbackName:'El meu codi QR'
  }:{
    invalid:'Escribe un enlace completo, por ejemplo https://ejemplo.es',saved:'Proyecto guardado',generated:'QR generado correctamente',copied:'QR copiado al portapapeles',copyFail:'El navegador no permite copiar esta imagen',downloaded:'Archivo preparado',opened:'Proyecto abierto',deleted:'Proyecto eliminado',none:'Todavía no tienes ningún proyecto guardado',open:'Abrir',remove:'Eliminar',savedAt:'Guardado',printTitle:'Código QR',fallbackName:'Mi código QR'
  };
  const $=(selector,root=document)=>root.querySelector(selector);
  const $$=(selector,root=document)=>[...root.querySelectorAll(selector)];
  const storageKey=`uncartell-qr-projects-v1-${lang}`;
  const uid=()=>crypto.randomUUID?.()||`${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const escapeHtml=value=>String(value??'').replace(/[&<>'"]/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
  const validUrl=value=>{try{const url=new URL(value);return ['http:','https:'].includes(url.protocol)}catch(_){return false}};
  const safeName=value=>(value||'qr').trim().toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)||'qr';
  const makeSvg=(value,{foreground='#181614',background='#ffffff',level='Q',watermark='',logo='',size=1024,margin=4}={})=>{
    const qr=qrcode(0,level);qr.addData(value);qr.make();
    const footer=watermark?76:0,count=qr.getModuleCount(),unit=size/(count+margin*2),parts=[`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size+footer}" width="${size}" height="${size+footer}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="${background}"/>`];
    for(let row=0;row<count;row++){for(let col=0;col<count;col++){if(qr.isDark(row,col))parts.push(`<rect x="${((col+margin)*unit).toFixed(3)}" y="${((row+margin)*unit).toFixed(3)}" width="${(unit+.08).toFixed(3)}" height="${(unit+.08).toFixed(3)}" fill="${foreground}"/>`)}}
    if(logo){const logoSize=Math.round(size*.17),logoPos=Math.round((size-logoSize)/2);parts.push(`<rect x="${logoPos-12}" y="${logoPos-12}" width="${logoSize+24}" height="${logoSize+24}" rx="18" fill="${background}"/><image href="${escapeHtml(logo)}" x="${logoPos}" y="${logoPos}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet"/>`)}
    if(watermark)parts.push(`<text x="${size/2}" y="${size+47}" text-anchor="middle" fill="#9b9790" font-family="Helvetica,Arial,sans-serif" font-size="25">${escapeHtml(watermark)}</text>`);parts.push('</svg>');return parts.join('');
  };
  const svgBlob=svg=>new Blob([svg],{type:'image/svg+xml;charset=utf-8'});
  const downloadBlob=(blob,name)=>{const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=name;document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(link.href),1000)};
  const svgToPng=svg=>new Promise((resolve,reject)=>{const image=new Image(),url=URL.createObjectURL(svgBlob(svg));image.onload=()=>{const canvas=document.createElement('canvas'),ratio=(image.naturalHeight||1024)/(image.naturalWidth||1024);canvas.width=2048;canvas.height=Math.round(2048*ratio);const context=canvas.getContext('2d');context.imageSmoothingEnabled=false;context.drawImage(image,0,0,canvas.width,canvas.height);URL.revokeObjectURL(url);canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('PNG')),'image/png')};image.onerror=reject;image.src=url});
  window.UncartellQR={makeSvg,svgToPng,validUrl};

  class QRGeneratorModal{
    static open({url='',title,downloadLabel,onGenerated}={}){
      const ca=lang==='ca';
      const node=document.createElement('div');node.className='qr-projects-modal';
      node.innerHTML=`<button class="qr-modal-backdrop" type="button" data-close></button><section role="dialog" aria-modal="true"><button class="qr-modal-close" type="button" data-close>×</button><span class="qr-eyebrow">${ca?'COMPARTEIX AMB UN QR':'COMPARTE CON UN QR'}</span><h2>${escapeHtml(title||(ca?'Comparteix el teu document':'Comparte tu documento'))}</h2><ol><li>${ca?'Descarrega el document.':'Descarga el documento.'}</li><li>${ca?'Puja’l a Google Drive.':'Súbelo a Google Drive.'}</li><li>${ca?'Activa «qualsevol persona amb l’enllaç».':'Activa «cualquier persona con el enlace».'}</li><li>${ca?'Copia i enganxa l’enllaç públic.':'Copia y pega el enlace público.'}</li></ol><label class="qr-field"><span>${ca?'Enllaç públic':'Enlace público'}</span><textarea rows="3">${escapeHtml(url)}</textarea><small></small></label><button class="qr-generate" type="button">${escapeHtml(downloadLabel||(ca?'Genera el codi QR':'Genera el código QR'))}</button><p class="qr-note">${ca?'El QR és estàtic, gratuït i no caduca.':'El QR es estático, gratuito y no caduca.'}</p></section>`;
      document.body.append(node);const input=$('textarea',node),error=$('small',node);
      $$('[data-close]',node).forEach(button=>button.addEventListener('click',()=>node.remove()));
      $('.qr-generate',node).addEventListener('click',()=>{const value=input.value.trim();if(!validUrl(value)){error.textContent=T.invalid;return}const svg=makeSvg(value);onGenerated?.({url:value,svg});node.remove()});
      input.focus();return node;
    }
  }
  window.QRGeneratorModal=QRGeneratorModal;

  if(!$('.qr-page'))return;
  let state={id:uid(),url:'',foreground:'#181614',background:'#ffffff',level:'Q',watermark:lang==='ca'?'uncartell.cat':'uncartel.es',logo:'',dynamicId:'',publicUrl:'',svg:'',name:$('[data-project-name]').value};
  let hasUnsavedChanges=false;
  window.UncartellEditorHasUnsavedChanges=()=>hasUnsavedChanges;
  const plan=window.UncartellPlatform?.getPlan?.()||'basic',canPremium=plan==='premium'||plan==='ultra',canUltra=plan==='ultra';
  let toastTimer;
  const toast=message=>{const el=$('[data-toast]');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2300)};
  const setEnabled=enabled=>{$('[data-print]').disabled=!enabled;$('[data-download-png]').disabled=!enabled||!canPremium;$('[data-download-svg]').disabled=!enabled||!canUltra};
  const encodedUrl=()=>state.dynamicId?(state.publicUrl||`${location.origin}/qr/?id=${state.dynamicId}`):state.url;
  const render=()=>{
    if(!state.svg){$('[data-empty]').hidden=false;$('[data-result]').hidden=true;setEnabled(false);return}
    $('[data-empty]').hidden=true;$('[data-result]').hidden=false;$('[data-qr-preview]').innerHTML=state.svg;
    const resultUrl=$('[data-result-url]');resultUrl.href=state.url;resultUrl.textContent=state.url;setEnabled(true);
    $$('[data-generate]').forEach(button=>button.textContent=state.dynamicId?(lang==='ca'?'Actualitza la destinació':'Actualiza el destino'):(lang==='ca'?'Genera el codi QR':'Genera el código QR'));
  };
  const urlInputs=$$('[data-qr-url]'),urlErrors=$$('[data-url-error]');
  $('[data-project-name]').addEventListener('input',()=>{hasUnsavedChanges=true});
  const sync=()=>{state.name=$('[data-project-name]').value.trim()||T.fallbackName;state.url=urlInputs[0].value.trim();state.foreground=$('[data-foreground]').value;state.background=$('[data-background]').value;state.level=$('[data-correction]').value;state.watermark=$('[data-watermark]').value.trim()};
  const ensureDynamicLink=async()=>{if(!canPremium)return false;await window.UncartellPlatform?.whenReady?.();const user=window.UncartellPlatform?.getUser?.(),client=window.UncartellPlatform?.getSupabase?.();if(!user||!client)return false;const row={owner_id:user.id,project_id:String(state.id),destination_url:state.url,status:'active',updated_at:new Date().toISOString()};const {data,error}=await client.from('qr_links').upsert(row,{onConflict:'owner_id,project_id'}).select('id').single();if(error)throw error;state.dynamicId=data.id;state.publicUrl=`${location.origin}/qr/?id=${data.id}`;return true};
  const generate=async({quiet=false}={})=>{sync();if(!validUrl(state.url)){urlErrors.forEach(error=>error.textContent=T.invalid);(document.activeElement?.matches?.('[data-qr-url]')?document.activeElement:urlInputs[0]).focus();return false}urlErrors.forEach(error=>error.textContent='');try{if(state.dynamicId||canPremium)await ensureDynamicLink()}catch(error){console.error('Dynamic QR update',error);if(state.dynamicId){toast(lang==='ca'?'No s’ha pogut actualitzar la destinació':'No se ha podido actualizar el destino');return false}}state.svg=makeSvg(encodedUrl(),state);render();$('[data-save-status]').textContent=state.dynamicId?(lang==='ca'?'Destinació actualitzada':'Destino actualizado'):T.generated;if(!quiet)toast(state.dynamicId?(lang==='ca'?'Destinació actualitzada sense canviar el QR':'Destino actualizado sin cambiar el QR'):T.generated);return true};
  $$('[data-generate]').forEach(button=>button.addEventListener('click',()=>generate()));
  urlInputs.forEach(input=>{input.addEventListener('input',()=>{hasUnsavedChanges=true;urlInputs.forEach(peer=>{if(peer!==input)peer.value=input.value});urlErrors.forEach(error=>error.textContent='')});input.addEventListener('keydown',event=>{if(event.key!=='Enter')return;event.preventDefault();generate()})});
  $$('[data-foreground],[data-background],[data-correction],[data-watermark]').forEach(input=>input.addEventListener('input',()=>{hasUnsavedChanges=true;if(state.svg)generate({quiet:true})}));
  const incomingParams=new URLSearchParams(location.search),incoming=incomingParams.get('url');
  if(incoming&&validUrl(incoming)){
    urlInputs.forEach(input=>input.value=incoming);state.url=incoming;
    const incomingName=incomingParams.get('name');
    if(incomingName){state.name=incomingName;$('[data-project-name]').value=incomingName}
    if(incomingParams.get('generate')==='1')setTimeout(async()=>{
      if(!await generate({quiet:true})||incomingParams.get('save')!=='1')return;
      try{
        await window.UncartellPlatform?.whenReady?.();
        const activePlan=window.UncartellPlatform?.getPlan?.()||'basic';
        if(activePlan!=='premium'&&activePlan!=='ultra')return;
        const stableId=`qr-${safeName(incoming)}`;state.id=stableId;sync();
        const saved={...state,name:state.name||T.fallbackName,savedAt:new Date().toISOString()};
        const list=projects().filter(project=>project.id!==stableId);list.unshift(saved);saveProjects(list);
        await window.UncartellPlatform.saveUserProject('qr',saved);
        hasUnsavedChanges=false;$('[data-save-status]').textContent=`${T.savedAt} · ${new Intl.DateTimeFormat(lang,{dateStyle:'short',timeStyle:'short'}).format(new Date(saved.savedAt))}`;
        toast(T.saved);
      }catch(error){console.error('Automatic QR save failed',error);toast(lang==='ca'?'QR generat; no s’ha pogut desar al núvol':'QR generado; no se ha podido guardar en la nube')}
    },0)
  }
  $('[data-clear-watermark]').addEventListener('click',()=>{hasUnsavedChanges=true;$('[data-watermark]').value='';if(state.svg)generate({quiet:true})});
  $$('[data-tab]').forEach(button=>button.addEventListener('click',()=>{$$('[data-tab]').forEach(item=>item.classList.toggle('active',item===button));$$('[data-panel]').forEach(panel=>panel.hidden=panel.dataset.panel!==button.dataset.tab)}));
  // Mobile behaves like a native editor: the QR preview remains the main
  // surface and Content/Style open as a dismissible bottom sheet.
  const qrControls=$('.qr-controls');
  if(qrControls){
    qrControls.classList.remove('qr-mobile-panel-open');
    $$('[data-tab]').forEach(button=>button.addEventListener('click',()=>{
      if(!matchMedia('(max-width:820px)').matches)return;
      const sameOpen=qrControls.classList.contains('qr-mobile-panel-open')&&qrControls.dataset.mobileTab===button.dataset.tab;
      qrControls.dataset.mobileTab=button.dataset.tab;
      qrControls.classList.toggle('qr-mobile-panel-open',!sameOpen);
    }));
    document.addEventListener('keydown',event=>{if(event.key==='Escape')qrControls.classList.remove('qr-mobile-panel-open')});
  }
  const projectBar=$('.qr-project-bar'),projectField=$('.tool-project-field'),colorsCard=$('[data-colors-card]'),watermarkCard=$('[data-watermark-card]'),logoCard=$('[data-logo-card]'),brandCard=$('[data-brand-card]'),analyticsCard=$('[data-analytics-card]');projectField?.classList.toggle('is-locked',!canPremium);$$('[data-open-projects]').forEach(button=>button.classList.toggle('is-plan-locked',!canPremium));$('[data-project-name]').disabled=!canPremium;$('[data-project-plan]').hidden=canPremium;[colorsCard,watermarkCard,logoCard].forEach(card=>{if(!card)return;card.classList.toggle('is-locked',!canPremium);$$('input,button',card).forEach(input=>input.disabled=!canPremium);const badge=$('em',card);if(badge)badge.hidden=canPremium});[brandCard,analyticsCard].forEach(card=>{if(!card)return;card.classList.toggle('is-locked',!canUltra);$$('input,button',card).forEach(input=>input.disabled=!canUltra);const badge=$('em',card);if(badge)badge.hidden=canUltra});
  $('em',$('[data-download-png]')).hidden=canPremium;$('em',$('[data-download-svg]')).hidden=canUltra;
  const renderLogo=()=>{const preview=$('[data-logo-preview]');if(!preview)return;preview.innerHTML=state.logo?`<img src="${escapeHtml(state.logo)}" alt="">`:'';$('[data-remove-logo]').hidden=!state.logo};
  $('[data-logo-upload]')?.addEventListener('change',event=>{const file=event.target.files?.[0];if(!file||!canPremium)return;if(file.size>1500000){toast(lang==='ca'?'El logotip ha de pesar menys d’1,5 MB':'El logotipo debe pesar menos de 1,5 MB');return}const reader=new FileReader();reader.onload=()=>{state.logo=String(reader.result||'');state.level='Q';$('[data-correction]').value='Q';hasUnsavedChanges=true;renderLogo();if(state.svg)generate({quiet:true})};reader.readAsDataURL(file)});
  $('[data-remove-logo]')?.addEventListener('click',()=>{state.logo='';hasUnsavedChanges=true;renderLogo();if(state.svg)generate({quiet:true})});
  $('[data-apply-brand]')?.addEventListener('click',()=>{if(!canUltra){window.UncartellPlatform?.openUpgradeModal?.();return}let kit={};try{kit=JSON.parse(localStorage.getItem('uncartell-brand-kit-preview-user')||'{}')}catch(_){}if(!kit.primary&&!kit.secondary&&!kit.logo){$('[data-brand-status]').textContent=lang==='ca'?'Encara no tens cap kit desat.':'Todavía no tienes ningún kit guardado.';return}if(kit.primary){state.foreground=kit.primary;$('[data-foreground]').value=kit.primary}if(kit.secondary){state.background=kit.secondary;$('[data-background]').value=kit.secondary}if(kit.logo)state.logo=kit.logo;renderLogo();hasUnsavedChanges=true;if(state.svg)generate({quiet:true});$('[data-brand-status]').textContent=lang==='ca'?'Kit aplicat.':'Kit aplicado.'});
  const loadAnalytics=async()=>{const status=$('[data-analytics-status]');if(!canUltra){window.UncartellPlatform?.openUpgradeModal?.();return}if(!state.dynamicId){status.textContent=lang==='ca'?'Obre o desa un QR dinàmic per veure les mètriques.':'Abre o guarda un QR dinámico para ver sus métricas.';return}try{await window.UncartellPlatform?.whenReady?.();const client=window.UncartellPlatform?.getSupabase?.(),monthAgo=new Date(Date.now()-30*864e5).toISOString();const [all,recent,last]=await Promise.all([client.from('qr_link_events').select('id',{count:'exact',head:true}).eq('qr_link_id',state.dynamicId),client.from('qr_link_events').select('id',{count:'exact',head:true}).eq('qr_link_id',state.dynamicId).gte('visited_at',monthAgo),client.from('qr_link_events').select('visited_at').eq('qr_link_id',state.dynamicId).order('visited_at',{ascending:false}).limit(1).maybeSingle()]);if(all.error||recent.error||last.error)throw all.error||recent.error||last.error;$('[data-analytics-total]').textContent=all.count||0;$('[data-analytics-month]').textContent=recent.count||0;$('[data-analytics-last]').textContent=last.data?.visited_at?new Intl.DateTimeFormat(lang,{dateStyle:'short',timeStyle:'short'}).format(new Date(last.data.visited_at)):'—';status.textContent=''}catch(error){console.error(error);status.textContent=lang==='ca'?'No s’han pogut carregar les analítiques.':'No se han podido cargar las analíticas.'}};
  $('[data-refresh-analytics]')?.addEventListener('click',loadAnalytics);
  $$('[data-open-downloads]').forEach(button=>button.addEventListener('click',()=>{$('[data-download-modal]').hidden=false}));
  $$('[data-close-downloads]').forEach(button=>button.addEventListener('click',()=>{$('[data-download-modal]').hidden=true}));
  renderLogo();
  const projects=()=>{try{return JSON.parse(localStorage.getItem(storageKey)||'[]')}catch(_){return[]}};
  const saveProjects=list=>localStorage.setItem(storageKey,JSON.stringify(list.slice(0,50)));
  window.UncartellPlatform?.syncProjectStore?.('qr',storageKey).catch(console.error);
  window.addEventListener('uncartell:projects-synced',event=>{if(event.detail?.toolType==='qr')renderProjects()});
  $('[data-save-project]').addEventListener('click',async()=>{if(!canPremium){window.UncartellPlatform?.openUpgradeModal?.();return}if(!await generate({quiet:true}))return;sync();const list=projects().filter(project=>project.id!==state.id);const saved={...state,name:state.name||state.title||'QR',savedAt:new Date().toISOString()};list.unshift(saved);saveProjects(list);try{await window.UncartellPlatform?.saveUserProject?.('qr',saved);hasUnsavedChanges=false;$('[data-save-status]').textContent=`${T.savedAt} · ${new Intl.DateTimeFormat(lang,{dateStyle:'short',timeStyle:'short'}).format(new Date(saved.savedAt))}`;toast(T.saved)}catch(_){toast(lang==='ca'?'No s’ha pogut desar al núvol':'No se ha podido guardar en la nube')}});
  const renderProjects=()=>{const list=projects();$('[data-project-list]').innerHTML=list.length?list.map(project=>`<article class="qr-project-card"><div><strong>${escapeHtml(project.name)}</strong><small>${escapeHtml(project.url)}</small></div><div><button type="button" data-open="${project.id}">${T.open}</button><button type="button" data-delete="${project.id}">${T.remove}</button></div></article>`).join(''):`<p class="qr-project-empty">${T.none}</p>`;
    $$('[data-open]').forEach(button=>button.addEventListener('click',()=>{const project=projects().find(item=>item.id===button.dataset.open);if(!project)return;state={watermark:lang==='ca'?'uncartell.cat':'uncartel.es',logo:'',dynamicId:'',publicUrl:'',...project};$('[data-project-name]').value=state.name;urlInputs.forEach(input=>input.value=state.url);$('[data-foreground]').value=state.foreground;$('[data-background]').value=state.background;$('[data-correction]').value=state.level;$('[data-watermark]').value=state.watermark;state.svg=makeSvg(encodedUrl(),state);renderLogo();render();$('[data-projects-modal]').hidden=true;$('[data-save-status]').textContent=`${T.savedAt} · ${new Intl.DateTimeFormat(lang,{dateStyle:'short',timeStyle:'short'}).format(new Date(state.savedAt))}`;toast(T.opened);if(canUltra)loadAnalytics()}));
    $$('[data-delete]').forEach(button=>button.addEventListener('click',async()=>{const project=projects().find(item=>item.id===button.dataset.delete);saveProjects(projects().filter(item=>item.id!==button.dataset.delete));try{if(project?.dynamicId){const client=window.UncartellPlatform?.getSupabase?.();await client?.from('qr_links').delete().eq('id',project.dynamicId)}await window.UncartellPlatform?.deleteUserProject?.('qr',button.dataset.delete)}catch(error){console.error(error)}renderProjects();toast(T.deleted)}));
  };
  document.addEventListener('click',event=>{if(event.target.closest('[data-open]'))hasUnsavedChanges=false},true);
  $$('[data-open-projects]').forEach(button=>button.addEventListener('click',async()=>{if(!canPremium){window.UncartellPlatform?.openUpgradeModal?.();return}try{await window.UncartellPlatform?.syncProjectStore?.('qr',storageKey)}catch(error){console.error('Cloud projects sync',error)}renderProjects();$('[data-projects-modal]').hidden=false}));
  $$('[data-close-projects]').forEach(button=>button.addEventListener('click',()=>{$('[data-projects-modal]').hidden=true}));
  const consumeDownload=()=>window.UncartellPlatform?.consumeDownload({reload:false});
  $('[data-download-svg]').addEventListener('click',()=>{if(!canUltra){window.UncartellPlatform?.openUpgradeModal?.();return}if(!window.UncartellPlatform?.canDownload?.()){window.UncartellPlatform?.openUpgradeModal?.();return}downloadBlob(svgBlob(state.svg),`${safeName(state.name)}.svg`);consumeDownload();$('[data-download-modal]').hidden=true;toast(T.downloaded)});
  $('[data-download-png]').addEventListener('click',async()=>{if(!canPremium){window.UncartellPlatform?.openUpgradeModal?.();return}if(!window.UncartellPlatform?.canDownload?.()){window.UncartellPlatform?.openUpgradeModal?.();return}downloadBlob(await svgToPng(state.svg),`${safeName(state.name)}.png`);consumeDownload();$('[data-download-modal]').hidden=true;toast(T.downloaded)});
  $('[data-print]').addEventListener('click',()=>{const frame=document.createElement('iframe');frame.style.cssText='position:fixed;width:0;height:0;border:0';document.body.append(frame);frame.contentDocument.write(`<title>${escapeHtml(T.printTitle)}</title><style>@page{margin:16mm}body{margin:0;display:grid;place-items:center;min-height:90vh}svg{width:min(170mm,90vw);height:auto}</style>${state.svg}`);frame.contentDocument.close();frame.contentWindow.focus();setTimeout(()=>{frame.contentWindow.print();setTimeout(()=>frame.remove(),500)},150)});
  render();
})();
