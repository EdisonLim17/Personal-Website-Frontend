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
  const navLinks = $$('#navbar a');
  navLinks.forEach(a => {
    a.addEventListener('click', evt => {
      const navbar = $('#navbar');
      const hamburger = $('#hamburger');
      if (navbar) navbar.classList.remove('active');
      if (hamburger) hamburger.setAttribute('aria-expanded','false');
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
function revealProjects() {
  if (prefersReducedMotion) {
    const cards = $$('.project-card');
    cards.forEach(c => c.style.opacity = 1);
    return;
  }

  const cards = $$('.project-card');
  cards.forEach(c => {
    c.style.opacity = 0;
    c.style.transition = 'opacity 0.3s ease';
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

// ===== About Me Grid Mouse Following Effects =====
function setupAboutMeMouseFollow() {
  if (prefersReducedMotion || window.innerWidth <= 768) return;

  const aboutGrid = $('.about-grid');
  if (!aboutGrid) return;

  // Create cursor border glow element
  const cursorBorderGlow = document.createElement('div');
  cursorBorderGlow.className = 'cursor-border-glow';
  aboutGrid.appendChild(cursorBorderGlow);

  // Throttled mouse move handler for better performance
  const handleMouseMove = throttle((e) => {
    const rect = aboutGrid.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Set CSS custom properties for cursor position
    aboutGrid.style.setProperty('--mouse-x', `${mouseX}px`);
    aboutGrid.style.setProperty('--mouse-y', `${mouseY}px`);
    
    // Calculate distance to nearest edge for border brightening
    const distanceToLeft = mouseX;
    const distanceToRight = rect.width - mouseX;
    const distanceToTop = mouseY;
    const distanceToBottom = rect.height - mouseY;
    
    // Find minimum distance to any edge
    const minDistance = Math.min(distanceToLeft, distanceToRight, distanceToTop, distanceToBottom);
    
    // Brighten border when cursor is within 500px of edge
    const edgeThreshold = 500;
    const borderBrightness = Math.max(0, (edgeThreshold - minDistance) / edgeThreshold);
    
    // Update border glow opacity based on proximity to edge
    cursorBorderGlow.style.opacity = borderBrightness * 0.8; // Max opacity of 0.8
  }, 16);

  // Mouse enter/leave handlers
  const handleMouseEnter = () => {
    if (!prefersReducedMotion) {
      cursorBorderGlow.style.transition = 'opacity 0.3s ease';
    }
  };

  const handleMouseLeave = () => {
    cursorBorderGlow.style.opacity = '0';
    aboutGrid.style.setProperty('--mouse-x', '50%');
    aboutGrid.style.setProperty('--mouse-y', '50%');
  };

  // Add event listeners
  aboutGrid.addEventListener('mouseenter', handleMouseEnter);
  aboutGrid.addEventListener('mouseleave', handleMouseLeave);
  aboutGrid.addEventListener('mousemove', handleMouseMove, { passive: true });
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
  const aboutSection = $('#about');
  const projectsSection = $('#projects');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (entry.target.id === 'about') {
          setupAboutMeMouseFollow();
        } else if (entry.target.id === 'projects') {
          setupProjectCardMouseFollow();
        }
        observer.unobserve(entry.target); // Only run once per section
      }
    });
  }, { threshold: 0.1 });

  if (aboutSection) observer.observe(aboutSection);
  if (projectsSection) observer.observe(projectsSection);
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
  const cards = $$('.project-card');
  const aboutGrid = $('.about-grid');
  
  cards.forEach(card => {
    card.style.setProperty('--mouse-x', '50%');
    card.style.setProperty('--mouse-y', '50%');
    card.style.transform = '';
  });
  
  if (aboutGrid) {
    aboutGrid.style.setProperty('--mouse-x', '50%');
    aboutGrid.style.setProperty('--mouse-y', '50%');
  }
});

// ===== Resize Handler for Performance =====
window.addEventListener('resize', debounce(() => {
  // Re-initialize effects if screen size changes significantly
  const isMobile = window.innerWidth <= 768;
  
  if (isMobile) {
    // Cleanup effects on mobile
    const cards = $$('.project-card');
    const aboutGrid = $('.about-grid');
    
    cards.forEach(card => {
      card.style.transform = '';
      card.style.setProperty('--mouse-x', '50%');
      card.style.setProperty('--mouse-y', '50%');
    });
    
    if (aboutGrid) {
      aboutGrid.style.setProperty('--mouse-x', '50%');
      aboutGrid.style.setProperty('--mouse-y', '50%');
    }
  }
}, 250));