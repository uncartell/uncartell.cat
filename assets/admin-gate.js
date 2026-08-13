(()=>{
  const es=document.documentElement.lang==='es';
  const main=document.querySelector('.poster-admin');
  const editModal=document.querySelector('[data-admin-modal]');
  if(main)main.hidden=true;
  if(editModal)editModal.hidden=true;
  document.body.insertAdjacentHTML('beforeend',`<div class="u-account-modal" data-admin-gate><div class="u-modal-shade"></div><section class="u-account-card" role="dialog" aria-modal="true"><div><h2>${es?'Acceso de administración':'Accés d’administració'}</h2><p>${es?'Inicia sesión con una cuenta administradora.':'Inicia sessió amb un compte administrador.'}</p><button class="u-button primary" type="button" data-admin-account>${es?'Iniciar sesión':'Inicia sessió'}</button><p class="u-account-feedback" data-admin-feedback></p></div></section></div>`);
  const gate=document.querySelector('[data-admin-gate]');
  const accountButton=document.querySelector('[data-admin-account]');
  const feedback=document.querySelector('[data-admin-feedback]');
  let checking=false,loaded=false;
  const loadAdmin=()=>{gate.remove();if(main)main.hidden=false;['/assets/poster-admin.js?v=10','/assets/publication-admin.js?v=4','/assets/admin-dashboard.js?v=3'].forEach(src=>{const script=document.createElement('script');script.src=src;document.body.appendChild(script)})};
  const waitPlatform=()=>new Promise(resolve=>{const poll=()=>window.UncartellPlatform?.getSupabase?.()?resolve(window.UncartellPlatform):setTimeout(poll,80);poll()});
  async function checkAccess(){
    if(checking||loaded)return;
    checking=true;
    feedback.textContent=es?'Comprobando…':'Comprovant…';
    try{
      const platform=await waitPlatform(),supabase=platform.getSupabase();
      const {data:{user},error:userError}=await supabase.auth.getUser();
      if(!user){feedback.textContent='';accountButton.hidden=false;return}
      if(userError)throw userError;
      const {data:profile,error}=await supabase.from('profiles').select('role').eq('id',user.id).single();
      if(error)throw error;
      if(profile?.role!=='admin'){
        accountButton.hidden=false;
        feedback.textContent=es?'Esta cuenta no tiene acceso de administración.':'Aquest compte no té accés d’administració.';
        return;
      }
      loaded=true;
      loadAdmin();
    }catch(error){feedback.textContent=error.message||'Error'}finally{checking=false}
  }
  accountButton.addEventListener('click',()=>window.UncartellPlatform?.openAccount?.());
  window.addEventListener('uncartell:auth-ready',checkAccess);
  window.addEventListener('uncartell:auth-change',checkAccess);
  checkAccess();
})();
(()=>{
  const es=document.documentElement.lang==='es';
  const main=document.querySelector('.poster-admin');
  const editModal=document.querySelector('[data-admin-modal]');
  if(main)main.hidden=true;
  if(editModal)editModal.hidden=true;
  document.body.insertAdjacentHTML('beforeend',`<div class="u-account-modal" data-admin-gate><div class="u-modal-shade"></div><section class="u-account-card" role="dialog" aria-modal="true"><div><h2>${es?'Acceso de administración':'Accés d’administració'}</h2><p>${es?'Inicia sesión con una cuenta administradora.':'Inicia sessió amb un compte administrador.'}</p><button class="u-button primary" type="button" data-admin-account>${es?'Iniciar sesión':'Inicia sessió'}</button><p class="u-account-feedback" data-admin-feedback></p></div></section></div>`);
  const gate=document.querySelector('[data-admin-gate]');
  const accountButton=document.querySelector('[data-admin-account]');
  const feedback=document.querySelector('[data-admin-feedback]');
  let checking=false,loaded=false;
  const loadAdmin=()=>{gate.remove();if(main)main.hidden=false;['/assets/poster-admin.js?v=9','/assets/publication-admin.js?v=4','/assets/admin-dashboard.js?v=3'].forEach(src=>{const script=document.createElement('script');script.src=src;document.body.appendChild(script)})};
  const waitPlatform=()=>new Promise(resolve=>{const poll=()=>window.UncartellPlatform?.getSupabase?.()?resolve(window.UncartellPlatform):setTimeout(poll,80);poll()});
  async function checkAccess(){
    if(checking||loaded)return;
    checking=true;
    feedback.textContent=es?'Comprobando…':'Comprovant…';
    try{
      const platform=await waitPlatform(),supabase=platform.getSupabase();
      const {data:{user},error:userError}=await supabase.auth.getUser();
      if(!user){feedback.textContent='';accountButton.hidden=false;return}
      if(userError)throw userError;
      const {data:profile,error}=await supabase.from('profiles').select('role').eq('id',user.id).single();
      if(error)throw error;
      if(profile?.role!=='admin'){
        accountButton.hidden=false;
        feedback.textContent=es?'Esta cuenta no tiene acceso de administración.':'Aquest compte no té accés d’administració.';
        return;
      }
      loaded=true;
      loadAdmin();
    }catch(error){feedback.textContent=error.message||'Error'}finally{checking=false}
  }
  accountButton.addEventListener('click',()=>window.UncartellPlatform?.openAccount?.());
  window.addEventListener('uncartell:auth-ready',checkAccess);
  window.addEventListener('uncartell:auth-change',checkAccess);
  checkAccess();
})();
