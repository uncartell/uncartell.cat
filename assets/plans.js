(()=>{
  document.querySelectorAll('[data-plan]').forEach(button=>button.addEventListener('click',async()=>{
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
        const es=document.documentElement.lang==='es';
        if(!confirm(es?'¿Quieres cambiar a Basic? Perderás las descargas ilimitadas.':'Vols canviar a Basic? Perdràs les descàrregues il·limitades.'))return;
        await platform.switchToBasic();
        location.reload();
      }
    }catch(error){
      alert(error?.message||'No s’ha pogut actualitzar el pla.');
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

  const es=document.documentElement.lang==='es';
  const valid=value=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  let pending=false;

  const saveInterest=async()=>{
    const value=email.value.trim().toLowerCase();
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
      feedback.textContent=es?'Ya estás en la lista.':'Ja ets a la llista.';
    }catch(_){
      feedback.textContent=es?'No se ha podido guardar. Inténtalo de nuevo.':'No s’ha pogut desar. Torna-ho a provar.';
      submit.disabled=false;
      pending=false;
    }
  };

  notify.addEventListener('click',()=>{
    notify.hidden=true;
    emailWrap.hidden=false;
    email.focus();
  });
  submit.addEventListener('click',saveInterest);
  email.addEventListener('keydown',event=>{
    if(event.key!=='Enter')return;
    event.preventDefault();
    saveInterest();
  });
})();
