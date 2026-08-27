(()=>{
  const root=document.querySelector('[data-testimonial-slider]');
  if(!root)return;
  const slides=[...root.querySelectorAll('[data-testimonial]')];
  const dots=[...root.querySelectorAll('[data-testimonial-dot]')];
  let index=0;
  const show=next=>{
    index=(next+slides.length)%slides.length;
    slides.forEach((slide,i)=>{slide.hidden=i!==index;slide.classList.toggle('is-active',i===index)});
    dots.forEach((dot,i)=>{dot.classList.toggle('is-active',i===index);i===index?dot.setAttribute('aria-current','true'):dot.removeAttribute('aria-current')});
  };
  root.querySelector('[data-testimonial-prev]')?.addEventListener('click',()=>show(index-1));
  root.querySelector('[data-testimonial-next]')?.addEventListener('click',()=>show(index+1));
  dots.forEach(dot=>dot.addEventListener('click',()=>show(Number(dot.dataset.testimonialDot))));
})();

(()=>{
  const items=[...document.querySelectorAll('.u-home .u-hero-float')];
  if(items.length!==4)return;

  const desktop=window.matchMedia('(min-width: 1024px) and (pointer: fine)');
  const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const depth=[
    {x:-14,y:-9},
    {x:-20,y:-13},
    {x:16,y:10},
    {x:22,y:-14}
  ];
  let targetX=0;
  let targetY=0;
  let currentX=0;
  let currentY=0;
  let frame=0;
  let enabled=false;

  const render=()=>{
    currentX+=(targetX-currentX)*.085;
    currentY+=(targetY-currentY)*.085;
    items.forEach((item,index)=>{
      const movement=depth[index];
      item.style.translate=`${(currentX*movement.x).toFixed(2)}px ${(currentY*movement.y).toFixed(2)}px`;
    });
    if(Math.abs(targetX-currentX)>.001||Math.abs(targetY-currentY)>.001){
      frame=requestAnimationFrame(render);
    }else{
      frame=0;
    }
  };

  const requestRender=()=>{
    if(!frame)frame=requestAnimationFrame(render);
  };

  const onPointerMove=event=>{
    targetX=(event.clientX/window.innerWidth-.5)*2;
    targetY=(event.clientY/window.innerHeight-.5)*2;
    requestRender();
  };

  const onPointerLeave=()=>{
    targetX=0;
    targetY=0;
    requestRender();
  };

  const disable=()=>{
    if(!enabled)return;
    enabled=false;
    window.removeEventListener('pointermove',onPointerMove);
    document.documentElement.removeEventListener('mouseleave',onPointerLeave);
    cancelAnimationFrame(frame);
    frame=0;
    targetX=currentX=0;
    targetY=currentY=0;
    items.forEach(item=>{
      item.style.removeProperty('translate');
      item.style.removeProperty('will-change');
    });
  };

  const sync=()=>{
    if(!desktop.matches||reducedMotion.matches){
      disable();
      return;
    }
    if(enabled)return;
    enabled=true;
    items.forEach(item=>{item.style.willChange='translate'});
    window.addEventListener('pointermove',onPointerMove,{passive:true});
    document.documentElement.addEventListener('mouseleave',onPointerLeave);
  };

  desktop.addEventListener('change',sync);
  reducedMotion.addEventListener('change',sync);
  sync();
})();
