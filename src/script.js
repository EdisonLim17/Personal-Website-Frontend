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
  const handleMouseEnter = (e) => {
    if (!prefersReducedMotion) {
      cursorBorderGlow.style.transition = 'opacity 0.3s ease';
      // Set initial mouse position to prevent blob appearing at center
      const rect = aboutGrid.getBoundingClientRect();
      aboutGrid.style.setProperty('--mouse-x', `${(e.clientX - rect.left) / rect.width * 100}%`);
      aboutGrid.style.setProperty('--mouse-y', `${(e.clientY - rect.top) / rect.height * 100}%`);
    }
  };

  const handleMouseLeave = () => {
    cursorBorderGlow.style.opacity = '0';
    // Remove the mouse position reset to prevent teleportation
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
      card.style.setProperty('--mouse-x', `${(e.clientX - rect.left) / rect.width * 100}%`);
      card.style.setProperty('--mouse-y', `${(e.clientY - rect.top) / rect.height * 100}%`);
    }, 16);

    card.addEventListener('mouseenter', (e) => {
      cursorBorderGlow.style.opacity = '1';
      // Set initial mouse position to prevent lag/blob appearing at center
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${(e.clientX - rect.left) / rect.width * 100}%`);
      card.style.setProperty('--mouse-y', `${(e.clientY - rect.top) / rect.height * 100}%`);
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

// ===== Scroll Animation for Project Cards =====
function initScrollAnimations() {
  const projectCards = document.querySelectorAll('.project-card');
  
  if (projectCards.length === 0) return;
  
  // Group cards by rows (assuming 2 cards per row)
  const cardsPerRow = 2;
  const cardRows = [];
  
  for (let i = 0; i < projectCards.length; i += cardsPerRow) {
    cardRows.push(Array.from(projectCards).slice(i, i + cardsPerRow));
  }
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Find which row this card belongs to
        let rowIndex = -1;
        cardRows.forEach((row, index) => {
          if (row.includes(entry.target)) {
            rowIndex = index;
          }
        });
        
        if (rowIndex !== -1) {
          // Animate all cards in this row simultaneously
          cardRows[rowIndex].forEach((card, cardIndex) => {
            setTimeout(() => {
              card.classList.add('animate-in');
              
              // Add animation-complete class after animation finishes
              setTimeout(() => {
                card.classList.add('animation-complete');
              }, 800); // Match the animation duration
              
            }, cardIndex * 50); // Small stagger within the row (50ms between cards in same row)
          });
          
          // Unobserve all cards in this row since we've animated them
          cardRows[rowIndex].forEach(card => {
            observer.unobserve(card);
          });
        }
      }
    });
  }, {
    threshold: 0.1, // Trigger when 10% of the card is visible
    rootMargin: '0px 0px 50px 0px' // Start animation 50px before card enters viewport
  });
  
  projectCards.forEach(card => {
    observer.observe(card);
  });
}

// ===== Scroll Animation for About Section =====
function initAboutScrollAnimation() {
  const aboutGrid = document.querySelector('.about-grid');
  const aboutText = document.querySelector('.about-text');
  const aboutPhoto = document.querySelector('.about-photo');
  
  if (!aboutGrid) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Animate about grid first
        entry.target.classList.add('animate-in');
        
        // Then animate text and photo with stagger
        setTimeout(() => {
          if (aboutText) aboutText.classList.add('animate-in');
        }, 200);
        
        setTimeout(() => {
          if (aboutPhoto) aboutPhoto.classList.add('animate-in');
        }, 400);
        
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2, // Trigger when 20% of the about section is visible
    rootMargin: '0px 0px 50px 0px'
  });
  
  observer.observe(aboutGrid);
}

// ===== Scroll Animation for Resume Section =====
function initResumeScrollAnimation() {
  const resumeFigure = document.querySelector('.resume-figure');
  const resumeImage = document.querySelector('.resume-image');
  const resumeButton = document.querySelector('.button');
  
  if (!resumeFigure) return;
  
  // Observer for resume container and image
  const resumeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Animate resume container first
        entry.target.classList.add('animate-in');
        
        // Then animate image with 3D effect
        setTimeout(() => {
          if (resumeImage) resumeImage.classList.add('animate-in');
        }, 300);
        
        resumeObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.01, // Trigger when 10% of the resume section is visible
    rootMargin: '0px 0px 100px 0px' // Start animation 100px before resume section enters viewport
  });
  
  // Separate observer for the button at the bottom
  const buttonObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        buttonObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1, // Trigger when button comes into view
    rootMargin: '0px 0px 50px 0px' // Start animation when button is 50px from viewport
  });
  
  resumeObserver.observe(resumeFigure);
  if (resumeButton) {
    buttonObserver.observe(resumeButton);
  }
}

// ===== Scroll Animation for Footer =====
function initFooterScrollAnimation() {
  const footerContent = document.querySelector('.footer-content p');
  const footerLinks = document.querySelector('.footer-links');
  
  if (!footerContent) return;
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Animate both elements simultaneously for "meeting in the middle" effect
        if (footerContent) footerContent.classList.add('animate-in');
        if (footerLinks) footerLinks.classList.add('animate-in');
        
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.5, // Trigger when 50% of the footer is visible
    rootMargin: '0px 0px 0px 0px'
  });
  
  const footer = document.querySelector('.site-footer');
  if (footer) {
    observer.observe(footer);
  }
}

// Initialize all scroll animations when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initScrollAnimations();
    initAboutScrollAnimation();
    initResumeScrollAnimation();
    initFooterScrollAnimation();
  });
} else {
  initScrollAnimations();
  initAboutScrollAnimation();
  initResumeScrollAnimation();
  initFooterScrollAnimation();
}