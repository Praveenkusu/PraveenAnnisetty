document.addEventListener('DOMContentLoaded', () => {
  // ── Loader ──
  const loader = document.getElementById('loader');
  const hide = () => loader.classList.add('loaded');
  window.addEventListener('load', () => setTimeout(hide, 500));
  setTimeout(hide, 2000);

  // ── Scroll reveal ──
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.fade-in').forEach(el => obs.observe(el));

  // ── Counter animation ──
  const cObs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { countUp(e.target); cObs.unobserve(e.target); } });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => cObs.observe(el));

  function countUp(el) {
    const target = +el.dataset.count, dur = 1600, start = performance.now();
    const fmt = n => n >= 1000 ? (n/1000).toFixed(1).replace(/\.0$/,'') + 'K+' : n + '+';
    (function tick(now) {
      const t = Math.min((now - start) / dur, 1);
      el.textContent = fmt(Math.round((1 - Math.pow(1-t,3)) * target));
      if (t < 1) requestAnimationFrame(tick);
    })(start);
  }

  // ── B/A sliders ──
  document.querySelectorAll('[data-slider]').forEach(s => {
    const b = s.querySelector('.ba-slider__before'), d = s.querySelector('.ba-slider__divider'), h = s.querySelector('.ba-slider__handle');
    let drag = false;
    const set = x => { const r = s.getBoundingClientRect(); let p = ((x-r.left)/r.width)*100; p = Math.max(3,Math.min(97,p));
      b.style.clipPath = `inset(0 ${100-p}% 0 0)`; d.style.left = h.style.left = p+'%'; };
    s.addEventListener('mousedown', e => { e.preventDefault(); drag=true; set(e.clientX); });
    window.addEventListener('mousemove', e => { if(drag) set(e.clientX); });
    window.addEventListener('mouseup', () => drag=false);
    s.addEventListener('touchstart', e => { drag=true; set(e.touches[0].clientX); }, {passive:true});
    s.addEventListener('touchmove', e => { if(drag){e.preventDefault(); set(e.touches[0].clientX);} }, {passive:false});
    s.addEventListener('touchend', () => drag=false);
  });

  // ── Highlight "Choose a plan" text when scrolling to plans ──
  const choosePlanText = document.getElementById('choose-plan-text');

  function highlightChoosePlan() {
    if (!choosePlanText) return;
    choosePlanText.classList.remove('highlight-pulse');
    // Force reflow to restart animation
    void choosePlanText.offsetWidth;
    choosePlanText.classList.add('highlight-pulse');
  }

  // Hero CTA and floating CTA both scroll to plans and highlight
  const heroCta = document.getElementById('hero-cta');
  const floatingCta = document.getElementById('wa-cta');

  function scrollToPlans(e) {
    e.preventDefault();
    const section = document.getElementById('process');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
      // Highlight after scroll finishes
      setTimeout(highlightChoosePlan, 600);
    }
  }

  if (heroCta) heroCta.addEventListener('click', scrollToPlans);
  if (floatingCta) floatingCta.addEventListener('click', scrollToPlans);

  // ── WhatsApp Name-Prompt System ──
  const PHONE = '916301904032';
  const modal   = document.getElementById('name-modal');
  const input   = document.getElementById('name-input');
  const submit  = document.getElementById('name-submit');
  const cancel  = document.getElementById('name-cancel');
  let pendingMsg = '';

  // Retrieve saved name so returning visitors skip the prompt
  const savedName = localStorage.getItem('praveen_visitor_name') || '';
  if (savedName) input.value = savedName;

  function openModal(msgTemplate) {
    pendingMsg = msgTemplate;
    modal.classList.add('active');
    // Reset border color in case it was red
    input.style.borderColor = '';
    input.placeholder = 'Your name';
    setTimeout(() => input.focus(), 350);
  }

  function closeModal() {
    modal.classList.remove('active');
    pendingMsg = '';
  }

  function sendToWhatsApp() {
    const name = input.value.trim();
    if (!name) {
      input.style.borderColor = '#ff3b30';
      input.placeholder = 'Please enter your name';
      input.focus();
      return;
    }
    // Save for future visits
    localStorage.setItem('praveen_visitor_name', name);
    const msg = pendingMsg.replace('{name}', name);
    const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    closeModal();
  }

  submit.addEventListener('click', sendToWhatsApp);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') sendToWhatsApp(); });
  cancel.addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  // Intercept plan card clicks — only cards with [data-wa-msg]
  document.querySelectorAll('[data-wa-msg]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      openModal(link.dataset.waMsg);
    });
  });

  // ── Smart floating WhatsApp CTA visibility ──
  const hero = document.getElementById('hero');
  Object.assign(floatingCta.style, { opacity:'0', pointerEvents:'none', transform:'translateY(16px)',
    transition:'opacity .4s ease, transform .4s ease, background .3s ease, box-shadow .3s ease' });
  new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) Object.assign(floatingCta.style, { opacity:'0', pointerEvents:'none', transform:'translateY(16px)' });
      else Object.assign(floatingCta.style, { opacity:'1', pointerEvents:'auto', transform:'translateY(0)' });
    });
  }, { threshold: 0.2 }).observe(hero);
});
