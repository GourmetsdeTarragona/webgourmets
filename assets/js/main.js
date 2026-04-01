/* ============================================================
   MAIN.JS — Gourmets de Tarragona
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---- Nav scroll (afegeix classe .solid en scroll) ---- */
  const nav = document.getElementById('nav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('solid', window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); /* estat inicial */
  }

  /* ---- Hamburger ---- */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      hamburger.classList.toggle('open');
    });
    /* Tanca en fer clic fora */
    document.addEventListener('click', e => {
      if (!nav.contains(e.target)) {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
      }
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

/* ---- Submenús mòbil (crida des d'onclick inline) ---- */
function toggleMobileSub(el) {
  const sub = el.nextElementSibling;
  if (sub) sub.classList.toggle('open');
}
