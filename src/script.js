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
  const navLinks = $$('#navbar a'); // Changed $ to $$ to get array
  navLinks.forEach(a => {
    a.addEventListener('click', evt => {
      const navbar = $('#navbar');
      const hamburger = $('#hamburger');
      if (navbar) navbar.classList.remove('active');
      if (hamburger) hamburger.setAttribute('aria-expanded','false');
    });
  });

  // Throttled intersection observer for better performance
  const sections = $$('.section'); // Changed $ to $$ to get array
  const links = $$('#navbar a'); // Changed $ to $$ to get array

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
function revealProjects() {
  if (prefersReducedMotion) {
    const cards = $$('.project-card');
    cards.forEach(c => c.style.opacity = 1);
    return;
  }

  const cards = $$('.project-card');
  cards.forEach(c => {
    c.style.opacity = 0;
    c.style.transition = 'opacity 0.3s ease'; // Only animate opacity
  });
  
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(e => {
      if(e.isIntersecting) {
        e.target.style.opacity = '1';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  
  cards.forEach(c => io.observe(c));
}

// ===== Project Card Mouse Following Effects =====
function setupProjectCardMouseFollow() {
  if (prefersReducedMotion || window.innerWidth <= 768) return;

  const cards = $$('.project-card');
  
  cards.forEach(card => {
    // Remove any existing transition properties
    card.style.transition = '';
    
    const cursorBorderGlow = document.createElement('div');
    cursorBorderGlow.className = 'cursor-border-glow';
    card.appendChild(cursorBorderGlow);

    const handleMouseMove = throttle((e) => {
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    }, 16);

    card.addEventListener('mouseenter', () => {
      cursorBorderGlow.style.opacity = '1';
    });

    card.addEventListener('mouseleave', () => {
      cursorBorderGlow.style.opacity = '0';
    });

    card.addEventListener('mousemove', handleMouseMove, { passive: true });
  });
}

// ===== Intersection Observer for Performance =====
function setupPerformanceOptimizedEffects() {
  // Only activate heavy effects when sections are visible
  const projectsSection = $('#projects');
  if (!projectsSection) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Activate enhanced effects when projects section is visible
        setupProjectCardMouseFollow();
        observer.disconnect(); // Only run once
      }
    });
  }, { threshold: 0.1 });

  observer.observe(projectsSection);
}

// ===== Init =====
window.addEventListener('DOMContentLoaded', () => {
  // Core functionality
  updateCounter();
  setupInPageNav();
  
  // Enhanced visual effects (only on capable devices)
  if (!prefersReducedMotion && window.innerWidth > 768) {
    setupPerformanceOptimizedEffects();
  }

  revealProjects();
  
  // Mobile navigation
  const hamburgerBtn = $('#hamburger');
  if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', toggleMenu);
  }
});

// ===== Cleanup on unload =====
window.addEventListener('beforeunload', () => {
  // Cancel any pending animations
  const cards = $('.project-card');
  cards.forEach(card => {
    card.style.setProperty('--mouse-x', '50%');
    card.style.setProperty('--mouse-y', '50%');
    card.style.transform = '';
  });
});

// ===== Resize Handler for Performance =====
window.addEventListener('resize', debounce(() => {
  // Re-initialize effects if screen size changes significantly
  const isMobile = window.innerWidth <= 768;
  
  if (isMobile) {
    // Cleanup effects on mobile
    const cards = $$('.project-card');
    cards.forEach(card => {
      card.style.transform = '';
      card.style.setProperty('--mouse-x', '50%');
      card.style.setProperty('--mouse-y', '50%');
    });
  }
}, 250));