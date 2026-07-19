/* Nikhil Garala — Portfolio interactivity (vanilla JS, no framework deps) */
(function () {
  'use strict';

  var doc = document;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Preloader (with safety timeout so it can never get stuck) ---------- */
  function hidePreloader() {
    var pre = doc.getElementById('preloader');
    if (pre) pre.classList.add('is-hidden');
  }
  window.addEventListener('load', hidePreloader);
  setTimeout(hidePreloader, 2500); // fallback in case 'load' never fires cleanly

  /* ---------- Footer year ---------- */
  var yearEl = doc.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Header scroll state ---------- */
  var header = doc.getElementById('header');
  function onScrollHeader() {
    if (!header) return;
    if (window.scrollY > 12) header.classList.add('is-scrolled');
    else header.classList.remove('is-scrolled');
  }
  onScrollHeader();
  window.addEventListener('scroll', onScrollHeader, { passive: true });

  /* ---------- Mobile nav: close on link click / outside click / Escape ---------- */
  var navToggleInput = doc.getElementById('nav-toggle-input');
  var navLinks = doc.querySelectorAll('.nav-menu a');
  navLinks.forEach(function (a) {
    a.addEventListener('click', function () {
      if (navToggleInput) navToggleInput.checked = false;
    });
  });
  var navScrim = doc.querySelector('.nav-scrim');
  if (navScrim && navToggleInput) {
    navScrim.addEventListener('click', function () { navToggleInput.checked = false; });
  }
  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navToggleInput) navToggleInput.checked = false;
  });

  /* ---------- Scroll-spy active nav link ---------- */
  var sections = Array.prototype.slice.call(doc.querySelectorAll('section[id]'));
  var navItemMap = {};
  doc.querySelectorAll('.nav-menu li').forEach(function (li) {
    var a = li.querySelector('a[href^="#"]');
    if (a) navItemMap[a.getAttribute('href').slice(1)] = li;
  });

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        Object.keys(navItemMap).forEach(function (id) {
          navItemMap[id].classList.toggle('active', id === entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = doc.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Typed hero role text (with graceful fallback) ---------- */
  var typedTarget = doc.querySelector('.typed');
  if (typedTarget) {
    var items = (typedTarget.getAttribute('data-typed-items') || '')
      .split(',').map(function (s) { return s.trim(); }).filter(Boolean);

    if (typeof window.Typed === 'function' && !reduceMotion && items.length) {
      try {
        new window.Typed(typedTarget, {
          strings: items,
          typeSpeed: 55,
          backSpeed: 30,
          backDelay: 1400,
          loop: true,
          smartBackspace: true
        });
      } catch (err) {
        typedTarget.textContent = items[0] || '';
      }
    } else {
      typedTarget.textContent = items[0] || '';
    }
  }

  /* ---------- Project filter ---------- */
  var filterBtns = doc.querySelectorAll('.filter-btn');
  var projectCards = doc.querySelectorAll('.project-card');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterBtns.forEach(function (b) { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      var filter = btn.getAttribute('data-filter');
      projectCards.forEach(function (card) {
        var match = filter === 'all' || card.getAttribute('data-category') === filter;
        card.classList.toggle('is-hidden', !match);
      });
    });
  });

  /* ---------- Image fallback handling (broken/missing images never break layout) ---------- */
  doc.querySelectorAll('img[data-fallback-initials]').forEach(function (img) {
    img.addEventListener('error', function () {
      var wrap = img.closest('.hero-photo, .about-photo');
      var initials = img.getAttribute('data-fallback-initials');
      img.style.display = 'none';
      if (wrap) {
        var fallback = doc.createElement('div');
        fallback.className = 'avatar-fallback';
        fallback.textContent = initials || 'NG';
        wrap.appendChild(fallback);
      }
    }, { once: true });
  });

  doc.querySelectorAll('.gallery-item img').forEach(function (img) {
    img.addEventListener('error', function () {
      var item = img.closest('.gallery-item');
      if (item) item.classList.add('is-broken');
    }, { once: true });
  });

  /* ---------- Lightbox for certificate / webinar gallery ---------- */
  var lightbox = doc.getElementById('lightbox');
  var lbImg = lightbox ? lightbox.querySelector('img') : null;
  var lbCaption = lightbox ? lightbox.querySelector('.lb-caption') : null;
  var lastFocused = null;

  function openLightbox(src, caption) {
    if (!lightbox || !lbImg) return;
    lastFocused = doc.activeElement;
    lbImg.src = src;
    lbImg.alt = caption || 'Certificate preview';
    if (lbCaption) lbCaption.textContent = caption || '';
    lightbox.classList.add('is-open');
    doc.body.style.overflow = 'hidden';
    var closeBtn = lightbox.querySelector('.lb-close');
    if (closeBtn) closeBtn.focus();
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    doc.body.style.overflow = '';
    if (lbImg) lbImg.src = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  doc.querySelectorAll('.gallery-item').forEach(function (item) {
    item.addEventListener('click', function () {
      var img = item.querySelector('img');
      if (!img) return;
      openLightbox(img.getAttribute('src'), img.getAttribute('alt'));
    });
    item.setAttribute('role', 'button');
    item.setAttribute('tabindex', '0');
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });
  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    var lbClose = lightbox.querySelector('.lb-close');
    if (lbClose) lbClose.addEventListener('click', closeLightbox);
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
    });
  }

  /* ---------- Back to top ---------- */
  var backToTop = doc.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      backToTop.classList.toggle('is-visible', window.scrollY > 500);
    }, { passive: true });
  }

  /* ---------- Contact form: no backend required, always works ---------- */
  var contactForm = doc.getElementById('contact-form');
  if (contactForm) {
    var statusEl = doc.getElementById('form-status');
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var nameEl = doc.getElementById('name');
      var emailEl = doc.getElementById('email');
      var subjectEl = doc.getElementById('subject');
      var messageEl = doc.getElementById('message');

      var name = (nameEl.value || '').trim();
      var email = (emailEl.value || '').trim();
      var subject = (subjectEl.value || '').trim() || 'Portfolio contact from ' + (name || 'website visitor');
      var message = (messageEl.value || '').trim();

      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (name.length < 2) {
        showStatus('Please enter your name.', 'err');
        nameEl.focus();
        return;
      }
      if (!emailPattern.test(email)) {
        showStatus('Please enter a valid email address.', 'err');
        emailEl.focus();
        return;
      }
      if (message.length < 5) {
        showStatus('Please write a short message.', 'err');
        messageEl.focus();
        return;
      }

      var to = contactForm.getAttribute('data-to') || '';
      var body = 'Name: ' + name + '\nEmail: ' + email + '\n\n' + message;
      var mailto = 'mailto:' + encodeURIComponent(to) +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);

      window.location.href = mailto;
      showStatus('Opening your email app to send this message…', 'ok');
    });

    function showStatus(msg, type) {
      if (!statusEl) return;
      statusEl.textContent = msg;
      statusEl.className = 'form-status ' + (type || '');
    }
  }

})();
