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
  let state={id:uid(),url:'',foreground:'#181614',background:'#ffffff',level:'Q',watermark:lang==='ca'?'uncartell.cat':'uncartel.es',logo:'',dynamicId:'',publicUrl:'',destinationUpdatedAt:'',svg:'',name:$('[data-project-name]').value};
  let hasUnsavedChanges=false;
  window.UncartellEditorHasUnsavedChanges=()=>hasUnsavedChanges;
  let plan=window.UncartellPlatform?.getPlan?.()||'basic',canPremium=plan==='premium'||plan==='ultra',canUltra=plan==='ultra';
  let toastTimer;
  const toast=message=>{const el=$('[data-toast]');el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2300)};
  const formatAllowed=format=>window.UncartellPlatform?.canDownloadFormat?.(format)??(format==='pdf'||format==='print'||format==='png'&&canPremium||format==='svg'&&canUltra);
  const setEnabled=enabled=>{const png=$('[data-download-png]'),svg=$('[data-download-svg]');$('[data-print]').disabled=!enabled;png.disabled=!enabled;svg.disabled=!enabled;png.classList.toggle('is-plan-locked',enabled&&!formatAllowed('png'));svg.classList.toggle('is-plan-locked',enabled&&!formatAllowed('svg'))};
  const downloadModal=$('[data-download-modal]');
  $$('[data-open-downloads]').forEach(button=>button.addEventListener('click',()=>{downloadModal.hidden=false}));
  $$('[data-close-downloads]').forEach(button=>button.addEventListener('click',()=>{downloadModal.hidden=true}));
  const encodedUrl=()=>state.dynamicId?(state.publicUrl||`${location.origin}/qr/?id=${state.dynamicId}`):state.url;
  const renderDynamicEditor=()=>{const dynamic=$('[data-dynamic-link-editor]'),fresh=$('[data-new-link-editor]');if(!dynamic||!fresh)return;dynamic.hidden=!state.dynamicId;fresh.hidden=!!state.dynamicId;if(state.dynamicId){$('[data-current-destination]').value=state.url||'';$('[data-replacement-url]').value=''}};
  const render=()=>{
    if(!state.svg){$('[data-empty]').hidden=false;$('[data-result]').hidden=true;setEnabled(false);return}
    $('[data-empty]').hidden=true;$('[data-result]').hidden=false;$('[data-qr-preview]').innerHTML=state.svg;
    const resultUrl=$('[data-result-url]');resultUrl.href=state.url;resultUrl.textContent=state.url;setEnabled(true);
    renderDynamicEditor();
  };
  const urlInputs=$$('[data-qr-url]'),urlErrors=$$('[data-url-error]');
  $('[data-project-name]').addEventListener('input',()=>{hasUnsavedChanges=true});
  const sync=()=>{state.name=$('[data-project-name]').value.trim()||T.fallbackName;state.url=urlInputs[0].value.trim();state.foreground=$('[data-foreground]').value;state.background=$('[data-background]').value;state.level='Q';state.watermark=$('[data-watermark]').value.trim()};
  const ensureDynamicLink=async()=>{if(!canPremium||state.dynamicId)return !!state.dynamicId;await window.UncartellPlatform?.whenReady?.();const client=window.UncartellPlatform?.getSupabase?.();if(!client)return false;const {data,error}=await client.rpc('create_dynamic_qr_link',{p_project_id:String(state.id),p_destination_url:state.url});if(error)throw error;const row=Array.isArray(data)?data[0]:data;if(!row?.id)throw new Error('dynamic_qr_not_created');state.dynamicId=row.id;state.url=row.destination_url;state.destinationUpdatedAt=row.destination_updated_at||row.updated_at;state.publicUrl=`${location.origin}/qr/?id=${row.id}`;return true};
  const generate=async({quiet=false}={})=>{sync();if(!validUrl(state.url)){urlErrors.forEach(error=>error.textContent=T.invalid);(document.activeElement?.matches?.('[data-qr-url]')?document.activeElement:urlInputs[0]).focus();return false}urlErrors.forEach(error=>error.textContent='');try{if(canPremium&&!state.dynamicId)await ensureDynamicLink()}catch(error){console.error('Dynamic QR creation',error);toast(lang==='ca'?'No s’ha pogut crear el QR dinàmic':'No se ha podido crear el QR dinámico');return false}state.svg=makeSvg(encodedUrl(),state);render();$('[data-save-status]').textContent=T.generated;if(!quiet)toast(T.generated);return true};
  $$('[data-generate]').forEach(button=>button.addEventListener('click',()=>generate()));
  const askDestinationReplacement=nextUrl=>new Promise(resolve=>{const node=document.createElement('div');node.className='qr-projects-modal qr-confirm-modal';node.innerHTML=`<button class="qr-modal-backdrop" type="button" data-cancel></button><section role="dialog" aria-modal="true" aria-labelledby="replaceQrTitle"><button class="qr-modal-close" type="button" data-cancel>×</button><span class="qr-eyebrow">${lang==='ca'?'QR DINÀMIC':'QR DINÁMICO'}</span><h2 id="replaceQrTitle">${lang==='ca'?'Substituir la destinació?':'¿Sustituir el destino?'}</h2><p>${lang==='ca'?'El QR imprès continuarà sent el mateix i redirigirà a la nova URL.':'El QR impreso seguirá siendo el mismo y redirigirá a la nueva URL.'}</p><code>${escapeHtml(nextUrl)}</code><div class="qr-confirm-actions"><button type="button" data-cancel>${lang==='ca'?'Cancel·la':'Cancelar'}</button><button class="primary" type="button" data-confirm>${lang==='ca'?'Substitueix URL':'Sustituye la URL'}</button></div></section>`;document.body.append(node);const finish=value=>{node.remove();resolve(value)};$$('[data-cancel]',node).forEach(button=>button.addEventListener('click',()=>finish(false)));$('[data-confirm]',node).addEventListener('click',()=>finish(true))});
  $('[data-replace-destination]')?.addEventListener('click',async()=>{const input=$('[data-replacement-url]'),error=$('[data-replacement-error]'),nextUrl=input.value.trim();if(!canPremium){window.UncartellPlatform?.openUpgradeModal?.();return}if(!state.dynamicId){error.textContent=lang==='ca'?'Primer genera el QR.':'Primero genera el QR.';return}if(!validUrl(nextUrl)){error.textContent=T.invalid;input.focus();return}if(nextUrl===state.url){error.textContent=lang==='ca'?'Aquesta ja és la destinació actual.':'Este ya es el destino actual.';return}error.textContent='';if(!await askDestinationReplacement(nextUrl))return;const button=$('[data-replace-destination]'),original=button.textContent;button.disabled=true;button.textContent=lang==='ca'?'Actualitzant…':'Actualizando…';try{await window.UncartellPlatform?.whenReady?.();const client=window.UncartellPlatform?.getSupabase?.();const {data,error:rpcError}=await client.rpc('replace_dynamic_qr_destination',{p_qr_link_id:state.dynamicId,p_destination_url:nextUrl});if(rpcError)throw rpcError;const row=Array.isArray(data)?data[0]:data;state.url=row.destination_url;state.destinationUpdatedAt=row.destination_updated_at;urlInputs.forEach(field=>field.value=state.url);state.svg=makeSvg(encodedUrl(),state);hasUnsavedChanges=true;render();toast(lang==='ca'?'Destinació substituïda. El QR no ha canviat.':'Destino sustituido. El QR no ha cambiado.');if(canUltra)loadAnalytics()}catch(requestError){console.error('Dynamic QR replacement',requestError);error.textContent=lang==='ca'?'No s’ha pogut substituir la destinació.':'No se ha podido sustituir el destino.'}finally{button.disabled=false;button.textContent=original}});
  urlInputs.forEach(input=>{input.addEventListener('input',()=>{hasUnsavedChanges=true;urlInputs.forEach(peer=>{if(peer!==input)peer.value=input.value});urlErrors.forEach(error=>error.textContent='')});input.addEventListener('keydown',event=>{if(event.key!=='Enter')return;event.preventDefault();generate()})});
  $$('[data-foreground],[data-background],[data-watermark]').forEach(input=>input.addEventListener('input',()=>{hasUnsavedChanges=true;if(state.svg)generate({quiet:true})}));
  const incomingParams=new URLSearchParams(location.search),incoming=incomingParams.get('url');
  if(incoming&&validUrl(incoming)){
    urlInputs.forEach(input=>input.value=incoming);state.url=incoming;
    const incomingName=incomingParams.get('name');
    if(incomingName){state.name=incomingName;$('[data-project-name]').value=incomingName}
    state.id=`qr-${safeName(incoming)}`;
    if(incomingParams.get('generate')==='1')setTimeout(async()=>{
      if(!await generate({quiet:true})||incomingParams.get('save')!=='1')return;
      try{
        await window.UncartellPlatform?.whenReady?.();
        const activePlan=window.UncartellPlatform?.getPlan?.()||'basic';
        if(activePlan!=='premium'&&activePlan!=='ultra')return;
        const stableId=state.id;sync();
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
  const projectBar=$('.qr-project-bar'),projectField=$('.tool-project-field'),colorsCard=$('[data-colors-card]'),watermarkCard=$('[data-watermark-card]'),logoCard=$('[data-logo-card]'),brandCard=$('[data-brand-card]'),analyticsCard=$('[data-analytics-card]');
  const applyEntitlements=()=>{
    plan=window.UncartellPlatform?.getPlan?.()||'basic';canPremium=plan==='premium'||plan==='ultra';canUltra=plan==='ultra';
    // Only project management is gated. The whole header must never become a
    // locked target because Basic users can still open the download chooser.
    projectField?.classList.toggle('is-locked',!canPremium);projectBar?.classList.remove('is-locked');
    $$('[data-open-projects],[data-save-project]').forEach(button=>button.classList.toggle('is-plan-locked',!canPremium));
    const nameField=$('[data-project-name]');nameField.disabled=!canPremium;nameField.value=canPremium?(state.name||T.fallbackName):'';nameField.placeholder=canPremium?T.fallbackName:(lang==='ca'?'Premium · Desa i gestiona projectes':'Premium · Guarda y gestiona proyectos');
    $('[data-project-plan]').hidden=canPremium;
    [colorsCard,watermarkCard,logoCard].forEach(card=>{if(!card)return;card.classList.toggle('is-locked',!canPremium);$$('input,button',card).forEach(input=>input.disabled=!canPremium);const badge=$('em',card);if(badge)badge.hidden=canPremium});
    [brandCard,analyticsCard].forEach(card=>{if(!card)return;card.classList.toggle('is-locked',!canUltra);$$('input,button',card).forEach(input=>input.disabled=!canUltra);const badge=$('em',card);if(badge)badge.hidden=canUltra});
    const pngBadge=$('em',$('[data-download-png]')),svgBadge=$('em',$('[data-download-svg]'));if(pngBadge)pngBadge.hidden=canPremium;if(svgBadge)svgBadge.hidden=canUltra;
    setEnabled(Boolean(state.svg));
  };
  applyEntitlements();
  window.addEventListener('uncartell:plan',applyEntitlements);
  window.UncartellPlatform?.whenReady?.().then(applyEntitlements);
  const renderLogo=()=>{const preview=$('[data-logo-preview]');if(!preview)return;preview.innerHTML=state.logo?`<img src="${escapeHtml(state.logo)}" alt="">`:'';$('[data-remove-logo]').hidden=!state.logo};
  $('[data-logo-upload]')?.addEventListener('change',event=>{const file=event.target.files?.[0];if(!file||!canPremium)return;if(file.size>1500000){toast(lang==='ca'?'El logotip ha de pesar menys d’1,5 MB':'El logotipo debe pesar menos de 1,5 MB');return}const reader=new FileReader();reader.onload=()=>{state.logo=String(reader.result||'');state.level='Q';hasUnsavedChanges=true;renderLogo();if(state.svg)generate({quiet:true})};reader.readAsDataURL(file)});
  $('[data-remove-logo]')?.addEventListener('click',()=>{state.logo='';hasUnsavedChanges=true;renderLogo();if(state.svg)generate({quiet:true})});
  $('[data-apply-brand]')?.addEventListener('click',()=>{if(!canUltra){window.UncartellPlatform?.openUpgradeModal?.();return}let kit={};try{kit=JSON.parse(localStorage.getItem('uncartell-brand-kit-preview-user')||'{}')}catch(_){}if(!kit.primary&&!kit.secondary&&!kit.logo){$('[data-brand-status]').textContent=lang==='ca'?'Encara no tens cap kit desat.':'Todavía no tienes ningún kit guardado.';return}if(kit.primary){state.foreground=kit.primary;$('[data-foreground]').value=kit.primary}if(kit.secondary){state.background=kit.secondary;$('[data-background]').value=kit.secondary}if(kit.logo)state.logo=kit.logo;renderLogo();hasUnsavedChanges=true;if(state.svg)generate({quiet:true});$('[data-brand-status]').textContent=lang==='ca'?'Kit aplicat.':'Kit aplicado.'});
  let analyticsDays=30;
  const formatDate=value=>value?new Intl.DateTimeFormat(lang,{dateStyle:'short',timeStyle:'short'}).format(new Date(value)):'—';
  const renderAnalyticsChart=rows=>{const chart=$('[data-analytics-chart]');if(!chart)return;const values=(rows||[]).map(row=>Number(row.count)||0),max=Math.max(1,...values);chart.innerHTML=(rows||[]).map((row,index)=>`<span style="--value:${Math.max(3,Math.round((Number(row.count)||0)/max*100))}%" title="${escapeHtml(row.date)} · ${Number(row.count)||0}"><i></i>${index===0||index===rows.length-1?`<small>${new Intl.DateTimeFormat(lang,{day:'2-digit',month:'2-digit'}).format(new Date(`${row.date}T12:00:00`))}</small>`:''}</span>`).join('')};
  const loadAnalytics=async()=>{const status=$('[data-analytics-status]');if(!status)return;if(!canUltra){window.UncartellPlatform?.openUpgradeModal?.();return}if(!state.dynamicId){status.textContent=lang==='ca'?'Obre o desa un QR dinàmic per veure les mètriques.':'Abre o guarda un QR dinámico para ver sus métricas.';return}status.textContent=lang==='ca'?'Carregant…':'Cargando…';try{await window.UncartellPlatform?.whenReady?.();const client=window.UncartellPlatform?.getSupabase?.();const {data,error}=await client.rpc('get_dynamic_qr_analytics',{p_qr_link_id:state.dynamicId,p_days:analyticsDays});if(error)throw error;const metric=(selector,value)=>{const node=$(selector);if(node)node.textContent=value};metric('[data-analytics-total]',data.total||0);metric('[data-analytics-period]',data.period||0);metric('[data-analytics-average]',Number(data.average_per_day||0).toLocaleString(lang,{maximumFractionDigits:2}));metric('[data-analytics-last]',formatDate(data.last_scan_at));metric('[data-analytics-since-change]',data.since_destination_change||0);metric('[data-analytics-created]',formatDate(data.created_at));metric('[data-analytics-updated]',formatDate(data.destination_updated_at));const destination=$('[data-analytics-destination]');if(destination){destination.href=data.destination_url;destination.textContent=data.destination_url}renderAnalyticsChart(data.daily);status.textContent=''}catch(error){console.error(error);status.textContent=lang==='ca'?'No s’han pogut carregar les analítiques.':'No se han podido cargar las analíticas.'}};
  $$('[data-analytics-days]').forEach(button=>button.addEventListener('click',()=>{analyticsDays=Number(button.dataset.analyticsDays);$$('[data-analytics-days]').forEach(item=>item.classList.toggle('active',item===button));loadAnalytics()}));
  $('[data-refresh-analytics]')?.addEventListener('click',loadAnalytics);
  renderLogo();
  const projects=()=>{try{return JSON.parse(localStorage.getItem(storageKey)||'[]')}catch(_){return[]}};
  const saveProjects=list=>localStorage.setItem(storageKey,JSON.stringify(list.slice(0,50)));
  window.UncartellPlatform?.syncProjectStore?.('qr',storageKey).catch(console.error);
  window.addEventListener('uncartell:projects-synced',event=>{if(event.detail?.toolType==='qr')renderProjects()});
  $('[data-save-project]').addEventListener('click',async()=>{if(!canPremium){window.UncartellPlatform?.openUpgradeModal?.();return}if(!await generate({quiet:true}))return;sync();const list=projects().filter(project=>project.id!==state.id);const saved={...state,name:state.name||state.title||'QR',savedAt:new Date().toISOString()};list.unshift(saved);saveProjects(list);try{await window.UncartellPlatform?.saveUserProject?.('qr',saved);hasUnsavedChanges=false;$('[data-save-status]').textContent=`${T.savedAt} · ${new Intl.DateTimeFormat(lang,{dateStyle:'short',timeStyle:'short'}).format(new Date(saved.savedAt))}`;toast(T.saved)}catch(_){toast(lang==='ca'?'No s’ha pogut desar al núvol':'No se ha podido guardar en la nube')}});
  const renderProjects=()=>{const list=projects();$('[data-project-list]').innerHTML=list.length?list.map(project=>`<article class="qr-project-card"><div><strong>${escapeHtml(project.name)}</strong><small>${escapeHtml(project.url)}</small></div><div><button type="button" data-open="${project.id}">${T.open}</button><button type="button" data-delete="${project.id}">${T.remove}</button></div></article>`).join(''):`<p class="qr-project-empty">${T.none}</p>`;
    $$('[data-open]').forEach(button=>button.addEventListener('click',async()=>{const project=projects().find(item=>item.id===button.dataset.open);if(!project)return;state={watermark:lang==='ca'?'uncartell.cat':'uncartel.es',logo:'',dynamicId:'',publicUrl:'',destinationUpdatedAt:'',...project,level:'Q'};if(state.dynamicId){try{await window.UncartellPlatform?.whenReady?.();const client=window.UncartellPlatform?.getSupabase?.();const {data,error}=await client.from('qr_links').select('destination_url,destination_updated_at,status').eq('id',state.dynamicId).maybeSingle();if(error)throw error;if(data?.destination_url){state.url=data.destination_url;state.destinationUpdatedAt=data.destination_updated_at}}catch(error){console.error('Dynamic QR refresh',error)}}$('[data-project-name]').value=state.name;urlInputs.forEach(input=>input.value=state.url);$('[data-foreground]').value=state.foreground;$('[data-background]').value=state.background;$('[data-watermark]').value=state.watermark;state.svg=makeSvg(encodedUrl(),state);renderLogo();render();$('[data-projects-modal]').hidden=true;$('[data-save-status]').textContent=`${T.savedAt} · ${new Intl.DateTimeFormat(lang,{dateStyle:'short',timeStyle:'short'}).format(new Date(state.savedAt))}`;toast(T.opened);if(canUltra)loadAnalytics()}));
    $$('[data-delete]').forEach(button=>button.addEventListener('click',async()=>{const project=projects().find(item=>item.id===button.dataset.delete);saveProjects(projects().filter(item=>item.id!==button.dataset.delete));try{if(project?.dynamicId){const client=window.UncartellPlatform?.getSupabase?.();await client?.from('qr_links').delete().eq('id',project.dynamicId)}await window.UncartellPlatform?.deleteUserProject?.('qr',button.dataset.delete)}catch(error){console.error(error)}renderProjects();toast(T.deleted)}));
  };
  document.addEventListener('click',event=>{if(event.target.closest('[data-open]'))hasUnsavedChanges=false},true);
  $$('[data-open-projects]').forEach(button=>button.addEventListener('click',async()=>{if(!canPremium){window.UncartellPlatform?.openUpgradeModal?.();return}try{await window.UncartellPlatform?.syncProjectStore?.('qr',storageKey)}catch(error){console.error('Cloud projects sync',error)}renderProjects();$('[data-projects-modal]').hidden=false}));
  $$('[data-close-projects]').forEach(button=>button.addEventListener('click',()=>{$('[data-projects-modal]').hidden=true}));
  const consumeDownload=()=>window.UncartellPlatform?.consumeDownload({reload:false});
  $('[data-download-svg]').addEventListener('click',()=>{if(!formatAllowed('svg')){window.UncartellPlatform?.openUpgradeModal?.();return}if(!window.UncartellPlatform?.canDownload?.()){window.UncartellPlatform?.openUpgradeModal?.();return}downloadBlob(svgBlob(state.svg),`${safeName(state.name)}.svg`);consumeDownload();$('[data-download-modal]').hidden=true;toast(T.downloaded)});
  $('[data-download-png]').addEventListener('click',async()=>{if(!formatAllowed('png')){window.UncartellPlatform?.openUpgradeModal?.();return}if(!window.UncartellPlatform?.canDownload?.()){window.UncartellPlatform?.openUpgradeModal?.();return}downloadBlob(await svgToPng(state.svg),`${safeName(state.name)}.png`);consumeDownload();$('[data-download-modal]').hidden=true;toast(T.downloaded)});
  $('[data-print]').addEventListener('click',()=>{if(!window.UncartellPlatform?.canDownload?.()){window.UncartellPlatform?.openUpgradeModal?.();return}const frame=document.createElement('iframe');frame.style.cssText='position:fixed;width:0;height:0;border:0';document.body.append(frame);frame.contentDocument.write(`<title>${escapeHtml(T.printTitle)}</title><style>@page{margin:16mm}body{margin:0;display:grid;place-items:center;min-height:90vh}svg{width:min(170mm,90vw);height:auto}</style>${state.svg}`);frame.contentDocument.close();frame.contentWindow.focus();consumeDownload();$('[data-download-modal]').hidden=true;setTimeout(()=>{frame.contentWindow.print();setTimeout(()=>frame.remove(),500)},150)});
  render();
})();
