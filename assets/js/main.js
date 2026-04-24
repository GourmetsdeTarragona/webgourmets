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
    /* Recalcular top si la nav canvia de mida (p.ex. en resize) */
    mobileMenu._resizeHandler = () => {
      mobileMenu.style.top = getNavHeight() + 'px';
    };
    window.addEventListener('resize', mobileMenu._resizeHandler, { passive: true });
  }

  function closeMobileMenu() {
    if (mobileMenu) {
      mobileMenu.classList.remove('open');
      if (mobileMenu._resizeHandler) {
        window.removeEventListener('resize', mobileMenu._resizeHandler);
        mobileMenu._resizeHandler = null;
      }
    }
    if (hamburger) hamburger.classList.remove('open');
    if (nav)       nav.classList.remove('menu-open');
    document.querySelectorAll('.mobile-sub.open').forEach(s => s.classList.remove('open'));
    document.querySelectorAll('.mobile-item.expanded').forEach(s => s.classList.remove('expanded'));
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', e => {
      e.stopPropagation();
      mobileMenu.classList.contains('open') ? closeMobileMenu() : openMobileMenu();
    });

    /* Tanca en fer clic fora — un sol listener, no s'acumula */
    document.addEventListener('click', e => {
      if (!mobileMenu.classList.contains('open')) return;
      const clickDinsNav  = nav && nav.contains(e.target);
      const clickDinsMenu = mobileMenu.contains(e.target);
      if (!clickDinsNav && !clickDinsMenu) closeMobileMenu();
    });

    /* Tanca en clicar un link del menú mòbil */
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => setTimeout(closeMobileMenu, 80));
    });
  }

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
  if (item) item.classList.toggle('expanded', !isOpen);
}
