(()=>{
  const es=document.documentElement.lang==='es';
  const main=document.querySelector('.poster-admin');
  const editModal=document.querySelector('[data-admin-modal]');
  if(main)main.hidden=true;
  if(editModal)editModal.hidden=true;
  let checking=false,loaded=false;
  const loadAdmin=()=>{document.querySelector('[data-admin-gate]')?.remove();if(main)main.hidden=false;['/assets/poster-admin.js?v=11','/assets/publication-admin.js?v=4','/assets/admin-dashboard.js?v=4'].forEach(src=>{const script=document.createElement('script');script.src=src;document.body.appendChild(script)})};
  const showDenied=message=>{
    document.querySelector('[data-admin-gate]')?.remove();
    document.body.insertAdjacentHTML('beforeend',`<div class="u-account-modal" data-admin-gate><div class="u-modal-shade"></div><section class="u-account-card" role="dialog" aria-modal="true"><div><h2>${es?'Acceso restringido':'Accés restringit'}</h2><p>${message}</p><button class="u-button primary" type="button" data-admin-account>${es?'Cambiar de cuenta':'Canvia de compte'}</button></div></section></div>`);
    document.querySelector('[data-admin-account]')?.addEventListener('click',()=>window.UncartellPlatform?.openAccount?.());
  };
  const waitPlatform=()=>new Promise(resolve=>{const poll=()=>window.UncartellPlatform?.getSupabase?.()?resolve(window.UncartellPlatform):setTimeout(poll,80);poll()});
  async function checkAccess(){
    if(checking||loaded)return;
    checking=true;
    try{
      const platform=await waitPlatform();
      await platform.whenReady?.();
      const supabase=platform.getSupabase();
      const {data:{session},error:sessionError}=await supabase.auth.getSession();
      if(sessionError)throw sessionError;
      const user=session?.user||platform.getUser?.();
      if(!user){platform.openAccount?.();return}
      let profile=platform.getProfile?.();
      if(!profile){const result=await supabase.from('profiles').select('role').eq('id',user.id).single();if(result.error)throw result.error;profile=result.data}
      if(profile?.role!=='admin'){
        showDenied(es?'Esta cuenta no tiene permisos de administración.':'Aquest compte no té permisos d’administració.');
        return;
      }
      loaded=true;
      loadAdmin();
    }catch(error){showDenied(error.message||'Error')}finally{checking=false}
  }
  window.addEventListener('uncartell:auth-ready',checkAccess);
  window.addEventListener('uncartell:auth-change',checkAccess);
  checkAccess();
})();
