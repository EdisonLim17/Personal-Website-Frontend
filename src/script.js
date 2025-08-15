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
          { transform: 'translateY(8px)', opacity: 0 },
          { transform: 'translateY(0)', opacity: 1 }
        ], { duration: 200, easing: 'ease-out', fill: 'forwards' });
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  
  cards.forEach(c => io.observe(c));
}

// ===== Background Blob Mouse Attraction =====
function setupBlobMouseAttraction() {
  if (prefersReducedMotion || window.innerWidth <= 768) {
    return; // Skip on mobile or reduced motion
  }

  const blobs = $$('.blob');
  if (blobs.length === 0) return;

  // Store original positions for each blob
  const originalPositions = blobs.map(blob => {
    const computedStyle = window.getComputedStyle(blob);
    const rect = blob.getBoundingClientRect();
    return {
      element: blob,
      originalX: 0, // Will be set relative to current position
      originalY: 0,
      currentX: 0,
      currentY: 0,
      targetX: 0,
      targetY: 0
    };
  });

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let isMouseActive = false;

  // Smooth mouse tracking
  const handleMouseMove = throttle((e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    isMouseActive = true;
    
    // Calculate attraction for each blob
    originalPositions.forEach((blobData, index) => {
      const blob = blobData.element;
      const rect = blob.getBoundingClientRect();
      const blobCenterX = rect.left + rect.width / 2;
      const blobCenterY = rect.top + rect.height / 2;
      
      // Calculate distance from mouse to blob center
      const deltaX = mouseX - blobCenterX;
      const deltaY = mouseY - blobCenterY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      
      // Attraction zone - only attract when mouse is reasonably close
      const maxAttractionDistance = 500;
      const attractionStrength = Math.max(0, 1 - distance / maxAttractionDistance);
      
      // Different attraction multipliers for each blob for variety
      const multipliers = [0.3, 0.25, 0.35, 0.28];
      const attraction = attractionStrength * multipliers[index];
      
      // Calculate target position - move towards mouse when close
      blobData.targetX = deltaX * attraction;
      blobData.targetY = deltaY * attraction;
    });
    
    // Reset mouse active flag after a delay
    clearTimeout(window.mouseActiveTimeout);
    window.mouseActiveTimeout = setTimeout(() => {
      isMouseActive = false;
      // Return to original positions
      originalPositions.forEach(blobData => {
        blobData.targetX = 0;
        blobData.targetY = 0;
      });
    }, 1000);
  }, 16); // 60fps

  // Animation loop for smooth blob movement
  function animateBlobs() {
    originalPositions.forEach((blobData) => {
      // Smooth interpolation towards target
      blobData.currentX += (blobData.targetX - blobData.currentX) * 0.1;
      blobData.currentY += (blobData.targetY - blobData.currentY) * 0.1;
      
      // Apply transform
      const transform = `translate3d(${blobData.currentX}px, ${blobData.currentY}px, 0)`;
      blobData.element.style.transform = transform;
    });
    
    requestAnimationFrame(animateBlobs);
  }

  // Start animation loop
  animateBlobs();

  // Mouse event listeners
  window.addEventListener('mousemove', handleMouseMove, { passive: true });

  // Reset blobs when mouse leaves viewport
  window.addEventListener('mouseleave', () => {
    isMouseActive = false;
    originalPositions.forEach(blobData => {
      blobData.targetX = 0;
      blobData.targetY = 0;
    });
  }, { passive: true });
}

// ===== Project Card Mouse Following Effects =====
function setupProjectCardMouseFollow() {
  if (prefersReducedMotion || window.innerWidth <= 768) {
    return; // Skip on mobile or reduced motion
  }

  const cards = $$('.project-card');
  
  cards.forEach(card => {
    let isHovered = false;

    // Mouse move handler for blob following
    const handleMouseMove = throttle((e) => {
      if (!isHovered) return;

      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;

      // Clamp values to reasonable bounds
      const clampedX = Math.max(10, Math.min(90, x));
      const clampedY = Math.max(10, Math.min(90, y));

      // Update CSS custom properties for the blob position
      card.style.setProperty('--mouse-x', `${clampedX}%`);
      card.style.setProperty('--mouse-y', `${clampedY}%`);
    }, 16);

    // Hover events
    card.addEventListener('mouseenter', (e) => {
      isHovered = true;
      
      // Initialize mouse position
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      isHovered = false;
      
      // Reset blob to center
      card.style.setProperty('--mouse-x', '50%');
      card.style.setProperty('--mouse-y', '50%');
    }, { passive: true });

    // Mouse move tracking
    card.addEventListener('mousemove', handleMouseMove, { passive: true });
  });
}

// ===== Performance Monitor =====
function logPerformanceMetrics() {
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark('website-interactive');
    console.log('🚀 Website loaded and interactive');
  }
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
  revealProjects();
  
  // Enhanced visual effects (only on capable devices)
  if (!prefersReducedMotion && window.innerWidth > 768) {
    setupBlobMouseAttraction();
    setupPerformanceOptimizedEffects();
  }
  
  // Mobile navigation
  $('#hamburger')?.addEventListener('click', toggleMenu);
  
  logPerformanceMetrics();
});

// ===== Cleanup on unload =====
window.addEventListener('beforeunload', () => {
  // Cancel any pending animations
  const cards = $$('.project-card');
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