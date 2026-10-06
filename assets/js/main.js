/* ============================================================
   MAIN.JS — Gourmets de Tarragona
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Nav scroll (afegeix classe .solid en scroll) ---- */
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('solid', window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---- Moure mobile-menu al body per evitar overflow/z-index del nav ---- */
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileMenu && mobileMenu.parentElement !== document.body) {
    document.body.appendChild(mobileMenu);
  }

  /* ---- Hamburger ---- */
  const hamburger = document.getElementById('hamburger');
  if (hamburger && mobileMenu) {
    hamburger.setAttribute('aria-controls', 'mobileMenu');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  function getNavHeight() {
    return nav ? nav.getBoundingClientRect().height : 68;
  }

  function openMobileMenu() {
    if (!mobileMenu || !hamburger) return;
    nav.classList.add('solid');
    nav.classList.add('menu-open');
    mobileMenu.style.top = getNavHeight() + 'px';
    mobileMenu.classList.add('open');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    const firstLink = mobileMenu.querySelector('a, button');
    if (firstLink) firstLink.focus({ preventScroll: true });
    /* Recalcular top si la nav canvia de mida (p.ex. en resize) */
    mobileMenu._resizeHandler = () => {
      mobileMenu.style.top = getNavHeight() + 'px';
    };
    window.addEventListener('resize', mobileMenu._resizeHandler, { passive: true });
  }

  function closeMobileMenu(returnFocus) {
    if (mobileMenu) {
      mobileMenu.classList.remove('open');
      if (mobileMenu._resizeHandler) {
        window.removeEventListener('resize', mobileMenu._resizeHandler);
        mobileMenu._resizeHandler = null;
      }
    }
    if (hamburger) {
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      if (returnFocus === true) hamburger.focus();
    }
    if (nav)       nav.classList.remove('menu-open');
    document.querySelectorAll('.mobile-sub.open').forEach(s => s.classList.remove('open'));
    document.querySelectorAll('.mobile-item.expanded').forEach(s => s.classList.remove('expanded'));
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', e => {
      e.stopPropagation();
      mobileMenu.classList.contains('open') ? closeMobileMenu(true) : openMobileMenu();
    });

    /* Tanca en fer clic fora — un sol listener, no s'acumula */
    document.addEventListener('click', e => {
      if (!mobileMenu.classList.contains('open')) return;
      const clickDinsNav  = nav && nav.contains(e.target);
      const clickDinsMenu = mobileMenu.contains(e.target);
      if (!clickDinsNav && !clickDinsMenu) closeMobileMenu();
    });

    /* Esc tanca el menú i torna el focus al botó */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) closeMobileMenu(true);
    });

    /* Tanca en clicar un link del menú mòbil */
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => setTimeout(closeMobileMenu, 80));
    });
  }

  /* ---- Botons d'idioma: estat per a lectors de pantalla ---- */
  const syncLangButtons = () => {
    document.querySelectorAll('.lang-btn').forEach(b => {
      const l = b.getAttribute('data-lang') || (b.id === 'btn-ca' ? 'ca' : b.id === 'btn-es' ? 'es' : null);
      if (l) b.setAttribute('lang', l);
      b.setAttribute('aria-pressed', b.classList.contains('active') ? 'true' : 'false');
    });
  };
  syncLangButtons();
  document.addEventListener('click', e => {
    if (e.target.closest && e.target.closest('.lang-btn')) setTimeout(syncLangButtons, 0);
  });

  /* ---- Toggles dels submenús mòbils ---- */
  document.querySelectorAll('.mobile-item-toggle').forEach(btn => {
    const label = btn.closest('.mobile-item-row')?.querySelector('a, span')?.textContent.trim();
    btn.setAttribute('aria-label', label ? 'Submenú: ' + label : 'Submenú');
    btn.setAttribute('aria-expanded', 'false');
  });

  /* ---- Scroll reveal ---- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('vis');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ---- Barra de progrés de lectura (entry pages only) ---- */
  if (document.querySelector('.entrada-cos')) {
    var readBar = document.createElement('div');
    readBar.id = 'read-progress';
    readBar.style.cssText = 'position:fixed;top:0;left:0;width:0%;height:3px;background:var(--gold,#b8924a);z-index:10000;transition:width .12s linear;pointer-events:none;';
    document.body.appendChild(readBar);
    function updateReadProgress() {
      var cos = document.querySelector('.entrada-cos');
      if (!cos) return;
      var cosTop = cos.getBoundingClientRect().top + window.scrollY;
      var cosBottom = cosTop + cos.offsetHeight;
      var wh = window.innerHeight;
      var total = cosBottom - cosTop - wh;
      var pct = Math.max(0, Math.min(100, ((window.scrollY - cosTop + wh * 0.15) / total) * 100));
      readBar.style.width = pct + '%';
    }
    window.addEventListener('scroll', updateReadProgress, { passive: true });
    updateReadProgress();
  }

});

/* ---- Submenús mòbil ---- */
function toggleMobileSub(btn) {
  const row  = btn.closest('.mobile-item-row');
  const sub  = row ? row.nextElementSibling : null;
  const item = btn.closest('.mobile-item');
  if (!sub) return;

  const isOpen = sub.classList.contains('open');

  document.querySelectorAll('.mobile-sub.open').forEach(s => {
    if (s !== sub) s.classList.remove('open');
  });
  document.querySelectorAll('.mobile-item.expanded').forEach(i => {
    if (i !== item) i.classList.remove('expanded');
  });

  sub.classList.toggle('open', !isOpen);
  btn.setAttribute('aria-expanded', String(!isOpen));
  if (item) item.classList.toggle('expanded', !isOpen);
}
