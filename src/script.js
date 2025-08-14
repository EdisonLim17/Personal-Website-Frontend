// ===== Config =====
const API_ENDPOINT = 'https://5ak2nip9i9.execute-api.us-east-1.amazonaws.com/prod/websitecounterlambdaendpoint';

// ===== Utilities =====
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

// ===== Visitor Counter =====
async function updateCounter(){
  const el = $('#visitor-count');
  try {
    const res = await fetch(API_ENDPOINT, { method: 'POST' });
    if (!res.ok) throw new Error('Network response was not ok');
    const data = await res.json();
    const num = data?.num_views ?? 0;
    el.textContent = String(num);
  } catch (e){
    console.error('Counter error:', e);
    el.textContent = '-';
  }
}

// ===== Mobile Nav =====
function toggleMenu(){
  const nav = $('#navbar');
  const btn = $('#hamburger');
  nav.classList.toggle('active');
  const expanded = nav.classList.contains('active');
  btn.setAttribute('aria-expanded', String(expanded));
}

// ===== Smooth Scroll + Active Link Highlight =====
function setupInPageNav(){
  // Smooth scroll via native behavior (CSS) + here for offset safety
  $$('#navbar a').forEach(a => {
    a.addEventListener('click', evt => {
      // Close mobile menu after click
      $('#navbar').classList.remove('active');
      $('#hamburger').setAttribute('aria-expanded','false');
    });
  });

  // Highlight active section
  const sections = $$('.section');
  const links = $$('#navbar a');
  const map = new Map(sections.map(s => [s.id, s]));

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry => {
      if (entry.isIntersecting){
        const id = entry.target.id;
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: [0,1] });

  sections.forEach(s => io.observe(s));
}

// ===== Card Reveal on Scroll =====
function revealProjects(){
  const cards = $$('.project-card');
  cards.forEach(c => c.style.opacity = 0);
  const io = new IntersectionObserver((entries, obs)=>{
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.animate([
          { transform: 'translateY(12px)', opacity: 0 },
          { transform: 'translateY(0)', opacity: 1 }
        ], { duration: 300, easing: 'ease-out', fill: 'forwards' });
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.2 });
  cards.forEach(c => io.observe(c));
}

// ===== Optional: Parallax-ish blob follow (lightweight) =====
function setupBlobFollow(){
  const blobs = $$('.blob');
  window.addEventListener('mousemove', (e)=>{
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    blobs.forEach((b,i)=>{
      const offset = (i+1) * 14;
      b.style.transform = `translate3d(${offset*x}px, ${offset*y}px, 0)`;
    });
  }, { passive: true });
}

// ===== Init =====
window.addEventListener('DOMContentLoaded', () => {
  updateCounter();
  setupInPageNav();
  revealProjects();
  setupBlobFollow();
  $('#hamburger')?.addEventListener('click', toggleMenu);
});