(()=>{
  const es=document.documentElement.lang==='es';
  const syncPlanCards=()=>{
    const platform=window.UncartellPlatform;
    if(!platform)return;
    const plan=platform.getPlan();
    const basic=document.querySelector('button[data-plan="basic"]');
    const premium=document.querySelector('button[data-plan="premium"]');
    const basicHead=basic?.closest('.u-plan')?.querySelector('.u-plan-head');
    const premiumHead=premium?.closest('.u-plan')?.querySelector('.u-plan-head');
    if(basic){basic.disabled=plan==='basic';basic.textContent=plan==='basic'?(es?'Plan actual':'Pla actual'):(es?'Cambiar a Basic':'Canvia a Basic')}
    if(premium){premium.disabled=plan==='premium'||plan==='ultra';premium.textContent=plan==='premium'?(es?'Plan actual':'Pla actual'):plan==='ultra'?(es?'Incluido en Ultra':'Inclòs amb Ultra'):(es?'Activa Premium gratis':'Activa Premium gratis')}
    if(basicHead)basicHead.textContent=plan==='basic'?(es?'Plan actual':'Pla actual'):(es?'Basic':'Basic');
    if(premiumHead)premiumHead.textContent=plan==='premium'?(es?'Plan actual':'Pla actual'):(es?'Recomendado':'Recomanat');
    basic?.closest('.u-plan')?.classList.toggle('is-current',plan==='basic');
    premium?.closest('.u-plan')?.classList.toggle('is-current',plan==='premium');
  };
  syncPlanCards();
  addEventListener('uncartell:plan',syncPlanCards);
  addEventListener('uncartell:auth-ready',syncPlanCards);
  addEventListener('uncartell:auth-change',syncPlanCards);
  document.querySelectorAll('button[data-plan]').forEach(button=>button.addEventListener('click',async()=>{
    const platform=window.UncartellPlatform;
    if(!platform||button.disabled)return;
    const plan=button.dataset.plan;
    const original=button.textContent;
    button.disabled=true;
    try{
      if(plan==='premium'){
        const activated=await platform.activatePremium();
        if(activated)location.reload();
      }else if(plan==='basic'){
        if(platform.getPlan()==='basic')return;
        if(!await platform.requestBasicDowngrade())return;
        await platform.switchToBasic();
        location.reload();
      }
    }catch(error){
      console.error(error);
    }finally{
      button.disabled=false;
      button.textContent=original;
    }
  }));

  const notify=document.querySelector('[data-ultra-notify]');
  const emailWrap=document.querySelector('[data-ultra-email]');
  const email=emailWrap?.querySelector('input');
  const submit=emailWrap?.querySelector('button');
  const feedback=document.querySelector('[data-ultra-feedback]');
  if(!notify||!emailWrap||!email||!submit||!feedback)return;

  const valid=value=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  let pending=false;

  const saveInterest=async(explicitEmail='')=>{
    const value=(explicitEmail||email.value).trim().toLowerCase();
    if(!valid(value)){
      feedback.textContent=es?'Escribe un correo válido.':'Escriu un correu vàlid.';
      email.focus();
      return;
    }
    if(pending)return;
    pending=true;
    submit.disabled=true;
    feedback.textContent=es?'Guardando…':'Desant…';
    try{
      await window.UncartellPlatform.submitMailboxForm({type:'ultra',fields:{email:value,message:es?`${value} se ha interesado por el plan Ultra.`:`${value} s’ha interessat pel pla Ultra.`}});
      localStorage.setItem(`uncartell-ultra-interest-${es?'es':'ca'}`,value);
      emailWrap.hidden=true;
      notify.hidden=false;
      notify.disabled=true;
      notify.textContent=es?'Te avisaremos ✓':'T’avisarem ✓';
      feedback.textContent='';
    }catch(_){
      feedback.textContent=es?'No se ha podido guardar. Inténtalo de nuevo.':'No s’ha pogut desar. Torna-ho a provar.';
      submit.disabled=false;
      pending=false;
    }
  };

  notify.addEventListener('click',async event=>{
    event.preventDefault();
    await window.UncartellPlatform?.whenReady?.();
    const knownEmail=window.UncartellPlatform?.getUser?.()?.email||'';
    if(knownEmail){await saveInterest(knownEmail);return}
    notify.hidden=true;
    emailWrap.hidden=false;
    email.focus();
  });
  submit.addEventListener('click',()=>saveInterest());
  email.addEventListener('keydown',event=>{
    if(event.key!=='Enter')return;
    event.preventDefault();
    saveInterest();
  });
})();
