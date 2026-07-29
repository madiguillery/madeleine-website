/* ==========================================================================
   Madeleine Guillery — main.js
   Handles: nav scroll state, mobile menu, portfolio filtering, scroll reveal,
            contact form submission feedback.
   ========================================================================== */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     Nav — add .scrolled class when page scrolls past hero
     -------------------------------------------------------------------------- */
  const nav = document.getElementById('nav');

  function updateNav() {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateNav, { passive: true });
  updateNav(); // run on load in case page is already scrolled


  /* --------------------------------------------------------------------------
     Mobile menu toggle
     -------------------------------------------------------------------------- */
  const navToggle  = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');

  function closeMobileMenu() {
    navToggle.classList.remove('open');
    mobileMenu.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
  }

  navToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    navToggle.classList.toggle('open', isOpen);
    navToggle.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
  });

  // Close mobile menu when a link is clicked
  mobileMenu.querySelectorAll('.mobile-menu__link').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMobileMenu();
  });


  /* --------------------------------------------------------------------------
     Portfolio filtering
     -------------------------------------------------------------------------- */
  const filterBtns   = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio__item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;

      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Show/hide items with a fade-out/in
      portfolioItems.forEach(item => {
        const category = item.dataset.category;
        const show     = filter === 'all' || category === filter;

        if (show) {
          item.style.display = '';
          // Trigger reflow then animate in
          requestAnimationFrame(() => {
            item.style.opacity  = '1';
            item.style.transform = 'translateY(0)';
          });
        } else {
          item.style.opacity  = '0';
          item.style.transform = 'translateY(8px)';
          // After transition ends, hide from layout
          item.addEventListener('transitionend', function handler() {
            if (item.style.opacity === '0') item.style.display = 'none';
            item.removeEventListener('transitionend', handler);
          });
        }
      });
    });
  });

  // Ensure all items start with transitions enabled
  portfolioItems.forEach(item => {
    item.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
  });


  /* --------------------------------------------------------------------------
     Scroll reveal — uses IntersectionObserver for performance
     -------------------------------------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target); // only animate once
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealEls.forEach(el => observer.observe(el));
  } else {
    // Fallback: reveal immediately for browsers without IntersectionObserver
    revealEls.forEach(el => el.classList.add('revealed'));
  }


  /* --------------------------------------------------------------------------
     Smooth-scroll for all anchor links (supplements CSS scroll-behavior
     for browsers that need JS fallback)
     -------------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;

      e.preventDefault();
      closeMobileMenu();

      const navHeight = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-h'), 10) || 72;

      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top, behavior: 'smooth' });
    });
  });


  /* --------------------------------------------------------------------------
     Contact form — client-side handling
     To wire to a real backend, replace the success block with a fetch() call.
     -------------------------------------------------------------------------- */
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const btn  = contactForm.querySelector('[type="submit"]');
      const name = contactForm.querySelector('#name').value.trim();

      // Basic validation
      if (!name) {
        showFormMessage('Please enter your name.', 'error');
        return;
      }

      const email = contactForm.querySelector('#email').value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showFormMessage('Please enter a valid email address.', 'error');
        return;
      }

      const message = contactForm.querySelector('#message').value.trim();
      if (!message) {
        showFormMessage('Please describe your project.', 'error');
        return;
      }

      // Loading state
      btn.textContent = 'Sending…';
      btn.disabled = true;

      /*
        ── INTEGRATION POINT ──────────────────────────────────────────────────
        To send the form, replace this setTimeout with a fetch() call, e.g.:

        fetch('https://formspree.io/f/YOUR_FORM_ID', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(contactForm))),
        })
        .then(res => {
          if (res.ok) { showFormSuccess(); }
          else { showFormMessage('Something went wrong. Please try again.', 'error'); }
        })
        .catch(() => showFormMessage('Network error. Please try again.', 'error'))
        .finally(() => { btn.textContent = 'Send Message'; btn.disabled = false; });

        Popular options: Formspree, EmailJS, Netlify Forms, a custom endpoint.
        ───────────────────────────────────────────────────────────────────────
      */
      setTimeout(() => {
        showFormSuccess();
        btn.textContent = 'Send Message';
        btn.disabled = false;
      }, 1200);
    });
  }

  function showFormSuccess() {
    const existing = document.querySelector('.form-feedback');
    if (existing) existing.remove();

    const msg = document.createElement('div');
    msg.className = 'form-feedback form-feedback--success';
    msg.innerHTML = `
      <strong>Message sent!</strong>
      Thank you — I'll be in touch within 2 business days.
    `;
    applyFeedbackStyles(msg, '#3A6E6B', '#D4E9E8');
    contactForm.appendChild(msg);
    contactForm.reset();
  }

  function showFormMessage(text, type) {
    const existing = document.querySelector('.form-feedback');
    if (existing) existing.remove();

    const msg = document.createElement('div');
    msg.className = `form-feedback form-feedback--${type}`;
    msg.textContent = text;

    const isError = type === 'error';
    applyFeedbackStyles(msg, isError ? '#7A3B2E' : '#3A6E6B', isError ? '#F0E0DA' : '#D4E9E8');
    contactForm.appendChild(msg);
  }

  function applyFeedbackStyles(el, color, bg) {
    Object.assign(el.style, {
      marginTop:    '0.75rem',
      padding:      '0.75rem 1rem',
      borderRadius: '4px',
      fontSize:     '0.875rem',
      lineHeight:   '1.5',
      color,
      background:   bg,
      border:       `1px solid ${color}40`,
    });
  }


  /* --------------------------------------------------------------------------
     Active nav link highlight on scroll
     -------------------------------------------------------------------------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav__link:not(.nav__link--cta)');

  function highlightNav() {
    const navH     = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h'), 10) || 72;
    const scrollY  = window.scrollY + navH + 80;

    sections.forEach(section => {
      const top    = section.offsetTop;
      const bottom = top + section.offsetHeight;
      const id     = section.getAttribute('id');

      if (scrollY >= top && scrollY < bottom) {
        navLinks.forEach(link => {
          link.classList.toggle('nav__link--active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }

  window.addEventListener('scroll', highlightNav, { passive: true });

})();
