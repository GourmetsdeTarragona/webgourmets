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

  /* ---- Hamburger ---- */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  function closeMobileMenu() {
    if (mobileMenu) mobileMenu.classList.remove('open');
    if (hamburger)  hamburger.classList.remove('open');
    if (nav)        nav.classList.remove('menu-open');
    /* Tanca tots els submenús oberts */
    document.querySelectorAll('.mobile-sub.open').forEach(s => s.classList.remove('open'));
    document.querySelectorAll('.mobile-item.expanded').forEach(s => s.classList.remove('expanded'));
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = mobileMenu.classList.contains('open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        /* Forçar nav visible (solid) quan s'obre el menú */
        nav.classList.add('solid');
        nav.classList.add('menu-open');
        /* Calcular top dinàmicament per si la nav té altura diferent */
        const navH = nav.getBoundingClientRect().height;
        mobileMenu.style.top = navH + 'px';
        mobileMenu.classList.add('open');
        hamburger.classList.add('open');
      }
    });

    /* Tanca en fer clic fora */
    document.addEventListener('click', e => {
      if (nav && !nav.contains(e.target)) {
        closeMobileMenu();
      }
    });

    /* Tanca automàticament quan es fa clic en un enllaç del menú mòbil */
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        /* Petit delay perquè el navegador tingui temps de processar el href */
        setTimeout(closeMobileMenu, 80);
      });
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
  /* btn és el .mobile-item-toggle, el submenú és el germà del .mobile-item-row */
  const row  = btn.closest('.mobile-item-row');
  const sub  = row ? row.nextElementSibling : null;
  const item = btn.closest('.mobile-item');
  if (!sub) return;

  const isOpen = sub.classList.contains('open');

  /* Tanca tots els altres submenús oberts */
  document.querySelectorAll('.mobile-sub.open').forEach(s => {
    if (s !== sub) s.classList.remove('open');
  });
  document.querySelectorAll('.mobile-item.expanded').forEach(i => {
    if (i !== item) i.classList.remove('expanded');
  });

  sub.classList.toggle('open', !isOpen);
  if (item) item.classList.toggle('expanded', !isOpen);
}
