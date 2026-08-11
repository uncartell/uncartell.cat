(()=>{
  const es=document.documentElement.lang==='es';
  const gate=document.querySelector('[data-ultra-gate]');
  const sessionView=document.querySelector('[data-ultra-session]');
  const passwordView=document.querySelector('[data-ultra-password]');
  const successView=document.querySelector('[data-ultra-success]');
  const feedback=document.querySelector('[data-ultra-access-feedback]');
  const accountButton=document.querySelector('[data-ultra-login]');
  const form=document.querySelector('[data-ultra-form]');
  const emailNode=document.querySelector('[data-ultra-user-email]');
  let submitting=false;
  const waitPlatform=()=>new Promise(resolve=>{const poll=()=>window.UncartellPlatform?.getSupabase?.()?resolve(window.UncartellPlatform):setTimeout(poll,80);poll()});
  const show=(name)=>{sessionView.hidden=name!=='session';passwordView.hidden=name!=='password';successView.hidden=name!=='success';gate.classList.toggle('u-ultra-success',name==='success')};
  async function refresh(){
    try{
      const platform=await waitPlatform(),supabase=platform.getSupabase();
      const {data:{user}}=await supabase.auth.getUser();
      if(!user){show('session');return}
      emailNode.textContent=user.email||'';
      const {data:profile}=await supabase.from('profiles').select('plan').eq('id',user.id).maybeSingle();
      if(profile?.plan==='ultra'&&profile?.ultra_until&&new Date(profile.ultra_until)>new Date()){platform.setPlan('ultra');show('success');return}
      show('password');
    }catch(_){feedback.textContent=es?'No se ha podido comprobar la sesión.':'No s’ha pogut comprovar la sessió.'}
  }
  accountButton.addEventListener('click',()=>window.UncartellPlatform?.openAccount?.());
  form.addEventListener('submit',async event=>{
    event.preventDefault();if(submitting)return;
    const password=new FormData(form).get('password');
    if(!password)return;
    submitting=true;feedback.textContent=es?'Comprobando…':'Comprovant…';
    const button=form.querySelector('button');button.disabled=true;
    try{
      const platform=await waitPlatform(),supabase=platform.getSupabase();
      const {data,error}=await supabase.functions.invoke('unlock-ultra',{body:{password}});
      if(error||!data?.ok)throw new Error(data?.message||error?.message);
      platform.setPlan('ultra');form.reset();show('success');
    }catch(_){feedback.textContent=es?'La contraseña no es correcta o el acceso no está disponible.':'La contrasenya no és correcta o l’accés no està disponible.'}
    finally{submitting=false;button.disabled=false}
  });
  window.addEventListener('uncartell:auth-ready',refresh);
  window.addEventListener('uncartell:auth-change',refresh);
  refresh();
})();
