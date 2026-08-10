(()=>{
  const es=document.documentElement.lang==='es';
  const main=document.querySelector('.poster-admin');
  const editModal=document.querySelector('[data-admin-modal]');
  if(main)main.hidden=true;
  if(editModal)editModal.hidden=true;
  document.body.insertAdjacentHTML('beforeend',`<div class="u-account-modal" data-admin-gate><div class="u-modal-shade"></div><section class="u-account-card" role="dialog" aria-modal="true"><div><h2>${es?'Acceso de administración':'Accés d’administració'}</h2><p>${es?'Introduce las credenciales del panel.':'Introdueix les credencials del panell.'}</p><form class="u-account-email" data-admin-login-form><input name="username" autocomplete="username" required placeholder="${es?'Usuario':'Usuari'}"><input name="password" type="password" autocomplete="current-password" required placeholder="${es?'Contraseña':'Contrasenya'}"><button class="u-button primary" type="submit">${es?'Entrar':'Entra'}</button></form><p class="u-account-feedback" data-admin-feedback></p></div></section></div>`);
  const gate=document.querySelector('[data-admin-gate]');
  const form=document.querySelector('[data-admin-login-form]');
  const feedback=document.querySelector('[data-admin-feedback]');
  const loadAdmin=()=>{gate.remove();if(main)main.hidden=false;const script=document.createElement('script');script.src='/assets/poster-admin.js?v=6';document.body.appendChild(script)};
  const waitPlatform=()=>new Promise(resolve=>{const poll=()=>window.UncartellPlatform?.getSupabase?.()?resolve(window.UncartellPlatform.getSupabase()):setTimeout(poll,80);poll()});
  form.addEventListener('submit',async event=>{
    event.preventDefault();
    const button=form.querySelector('button');button.disabled=true;feedback.textContent=es?'Comprobando…':'Comprovant…';
    try{
      const supabase=await waitPlatform();
      const values=new FormData(form);
      const {data:valid,error}=await supabase.rpc('verify_admin_credentials',{input_username:String(values.get('username')||''),input_password:String(values.get('password')||'')});
      if(error)throw error;if(!valid)throw new Error(es?'Credenciales incorrectas.':'Credencials incorrectes.');
      sessionStorage.setItem('uncartell-admin-session','1');loadAdmin();
    }catch(error){feedback.textContent=error.message;button.disabled=false}
  });
  if(sessionStorage.getItem('uncartell-admin-session')==='1')loadAdmin();
})();
