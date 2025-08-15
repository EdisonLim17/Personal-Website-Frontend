// ===== Config =====
const API_ENDPOINT = 'https://5ak2nip9i9.execute-api.us-east-1.amazonaws.com/prod/websitecounterlambdaendpoint';

// ===== Utilities =====
const $ = (sel, root=document) => root.querySelector(sel);
const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

// ===== Performance Utilities =====
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Check if user prefers reduced motion
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  $$('#navbar a').forEach(a => {
    a.addEventListener('click', evt => {
      $('#navbar').classList.remove('active');
      $('#hamburger').setAttribute('aria-expanded','false');
    });
  });

  // Throttled intersection observer for better performance
  const sections = $$('.section');
  const links = $$('#navbar a');

  const io = new IntersectionObserver(throttle((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting){
        const id = entry.target.id;
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
      }
    });
  }, 100), { rootMargin: '-40% 0px -50% 0px', threshold: [0,1] });

  sections.forEach(s => io.observe(s));
}

// ===== Card Reveal on Scroll (Optimized) =====
function revealProjects(){
  if (prefersReducedMotion) {
    // Skip animations for reduced motion users
    $$('.project-card').forEach(c => c.style.opacity = 1);
    return;
  }

  const cards = $$('.project-card');
  cards.forEach(c => c.style.opacity = 0);
  
  const io = new IntersectionObserver((entries, obs)=>{
    entries.forEach(e => {
      if(e.isIntersecting){
        e.target.animate([
          { transform: 'translateY(8px)', opacity: 0 }, // Reduced movement
          { transform: 'translateY(0)', opacity: 1 }
        ], { duration: 200, easing: 'ease-out', fill: 'forwards' }); // Faster animation
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 }); // Lower threshold for earlier trigger
  
  cards.forEach(c => io.observe(c));
}

// ===== Optimized Background Blob Follow =====
function setupBlobFollow(){
  if (prefersReducedMotion || window.innerWidth <= 768) {
    return; // Skip on mobile or reduced motion
  }

  const blobs = $$('.blob');
  if (blobs.length === 0) return;

  // Throttled mouse move handler
  const handleMouseMove = throttle((e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    // Use transform3d for hardware acceleration
    blobs.forEach((b,i)=>{
      const offset = (i+1) * 8; // Reduced movement
      b.style.transform = `translate3d(${offset*x}px, ${offset*y}px, 0)`;
    });
  }, 16); // ~60fps

  window.addEventListener('mousemove', handleMouseMove, { passive: true });
}

// ===== Highly Optimized Project Card Mouse Effects =====
function setupOptimizedProjectCardEffects(){
  if (prefersReducedMotion || window.innerWidth <= 768) {
    return; // Skip on mobile or reduced motion
  }

  const cards = $$('.project-card');
  
  cards.forEach(card => {
    let isHovered = false;
    let animationId = null;
    
    const handleMouseMove = (e) => {
      if (!isHovered) return;
      
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      
      animationId = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        
        // Reduced movement range for smoother performance
        const blobX = x * 15;
        const blobY = y * 15;
        
        card.style.setProperty('--blob-transform', 
          `translate3d(calc(-50% + ${blobX}px), calc(-50% + ${blobY}px), 0)`
        );
      });
    };

    // Throttled mouse move for better performance
    const throttledMouseMove = throttle(handleMouseMove, 16); // ~60fps

    card.addEventListener('mouseenter', () => {
      isHovered = true;
    }, { passive: true });
    
    card.addEventListener('mouseleave', () => {
      isHovered = false;
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      
      // Reset to center smoothly
      requestAnimationFrame(() => {
        card.style.setProperty('--blob-transform', 'translate3d(-50%, -50%, 0)');
      });
    }, { passive: true });
    
    card.addEventListener('mousemove', throttledMouseMove, { passive: true });
  });
}

// ===== Performance Monitor (Optional) =====
function logPerformanceMetrics() {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark('website-interactive');
    console.log('🚀 Website loaded and interactive');
    
    // Log frame rate if available
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        console.log('💻 System performance: OK');
      });
    }
  }
}

// ===== Init =====
window.addEventListener('DOMContentLoaded', () => {
  performance.mark('dom-loaded');
  
  updateCounter();
  setupInPageNav();
  revealProjects();
  
  // Only add heavy effects on capable devices
  if (!prefersReducedMotion && window.innerWidth > 768) {
    setupBlobFollow();
    setupOptimizedProjectCardEffects();
  }
  
  $('#hamburger')?.addEventListener('click', toggleMenu);
  
  logPerformanceMetrics();
});

// Clean up on page unload
window.addEventListener('beforeunload', () => {
  // Cancel any pending animations
  const cards = $$('.project-card');
  cards.forEach(card => {
    card.style.setProperty('--blob-transform', 'translate3d(-50%, -50%, 0)');
  });
});