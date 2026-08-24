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