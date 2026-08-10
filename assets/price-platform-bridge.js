(()=>{
  const platform=window.UncartellPlatform;if(!platform)return;
  document.querySelectorAll('[data-preview-plan]').forEach(button=>button.addEventListener('click',()=>{
    const map={free:'basic',premium:'premium',ultra:'ultra'};platform.setPlan(map[button.dataset.previewPlan]);
  }));
  const exportButton=document.querySelector('#exportButton');
  exportButton?.addEventListener('click',(event)=>{
    if(platform.getPlan()==='basic'&&platform.getQuota().count>=10){event.preventDefault();event.stopImmediatePropagation();location.href=platform.cfg.plansPath;return}
    if(platform.getPlan()==='basic'){
      const q=platform.getQuota();q.count=Math.min(10,q.count+1);localStorage.setItem('uncartell-global-download-quota-v12',JSON.stringify(q));
    }
  },true);
  const brief=document.querySelector('#customMenuBrief');
  if(brief){
    const ca=platform.lang==='ca';
    brief.innerHTML=`<div class="custom-brief-cta-copy"><span class="eyebrow">uncartell studio</span><h2>${ca?'Necessites una taula de serveis i preus a mida?':'¿Necesitas una tabla de servicios y precios a medida?'}</h2><p>${ca?'Explica’ns el projecte i crearem una proposta única per al teu negoci.':'Cuéntanos el proyecto y crearemos una propuesta única para tu negocio.'}</p><small>${ca?'Subjecte a pressupost':'Sujeto a presupuesto'}</small></div><button class="custom-brief-open" type="button"><span>${ca?'Parlem-ne':'Hablemos'}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></button>`;
    const modal=document.createElement('div');modal.className='custom-brief-modal';modal.hidden=true;modal.innerHTML=`<button class="custom-brief-backdrop" data-brief-close aria-label="Tanca"></button><section class="custom-brief-dialog" role="dialog" aria-modal="true"><button class="custom-brief-close" data-brief-close>×</button><span class="eyebrow">uncartell studio</span><h2>${ca?'Taula de serveis i preus a mida':'Tabla de servicios y precios a medida'}</h2><p>${ca?'Explica’ns la idea i et respondrem amb una proposta.':'Cuéntanos la idea y te responderemos con una propuesta.'}</p><form><label>${ca?'Nom i cognoms':'Nombre y apellidos'}<input name="name" required></label><label>${ca?'Restaurant o negoci':'Restaurante o negocio'}<input name="business" required></label><label>${ca?'Correu electrònic':'Correo electrónico'}<input name="email" type="email" required></label><label>${ca?'Què necessites?':'¿Qué necesitas?'}<textarea name="details" rows="5" required></textarea></label><button type="submit">${ca?'Envia la petició':'Envía la solicitud'}</button></form></section>`;document.body.appendChild(modal);
    brief.querySelector('.custom-brief-open').onclick=()=>{modal.hidden=false;document.body.style.overflow='hidden'};
    modal.querySelectorAll('[data-brief-close]').forEach(b=>b.onclick=()=>{modal.hidden=true;document.body.style.overflow=''});
    modal.querySelector('form').onsubmit=e=>{e.preventDefault();modal.querySelector('form').innerHTML=`<div class="custom-brief-success"><strong>${ca?'Enviat!':'¡Enviado!'}</strong><p>${ca?'Gràcies. Et respondrem tan aviat com puguem.':'Gracias. Te responderemos lo antes posible.'}</p></div>`}
  }
})();
