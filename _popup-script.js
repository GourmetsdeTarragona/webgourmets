(function(){
  var STORAGE_KEY = 'gdt-nl-dismissed';
  var DAYS_HIDE   = 30;

  // No mostrar si ya suscrito o descartado recientemente
  var dismissed = localStorage.getItem(STORAGE_KEY);
  if (localStorage.getItem('gdt-nl-done') || (dismissed && Date.now() < parseInt(dismissed, 10))) return;

  var popup   = document.getElementById('nl-popup');
  var overlay = document.getElementById('nl-popup-overlay');
  var closeBtn= document.getElementById('nl-popup-close');
  var form    = document.getElementById('nl-popup-form');
  if (!popup) return;

  var shown = false;
  var lastFocus = null;

  function showPopup() {
    if (shown) return;
    shown = true;
    popup.style.display = 'flex';
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        popup.classList.add('nl-visible');
      });
    });
    document.body.style.overflow = 'hidden';
    // Actualizar placeholder segun idioma
    var lang = localStorage.getItem('gdt-lang') || 'es';
    var emailInput = document.getElementById('nl-popup-email');
    if (emailInput) {
      emailInput.placeholder = emailInput.getAttribute('data-placeholder-' + lang) || emailInput.placeholder;
    }
    // Actualizar textos bilingues del popup
    if (typeof setLang === 'function') setLang(lang);
    lastFocus = document.activeElement;
    if (emailInput) emailInput.focus({ preventScroll: true });
  }

  function closePopup() {
    popup.classList.remove('nl-visible');
    setTimeout(function(){
      popup.style.display = 'none';
    }, 300);
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    // Guardar que fue descartado por X dias
    localStorage.setItem(STORAGE_KEY, Date.now() + DAYS_HIDE * 86400000);
  }

  closeBtn.addEventListener('click', closePopup);
  overlay.addEventListener('click', closePopup);
  document.addEventListener('keydown', function(e){
    if (!popup.classList.contains('nl-visible')) return;
    if (e.key === 'Escape') { closePopup(); return; }
    if (e.key !== 'Tab') return;
    // Manté el focus dins del diàleg
    var f = popup.querySelectorAll('button, input:not([type=hidden]):not([tabindex="-1"]), a[href]');
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  // Al enviar el formulario, marcar como suscrito para no volver a mostrar
  form.addEventListener('submit', function(){
    localStorage.setItem(STORAGE_KEY, Date.now() + 365 * 86400000);
  });

  // Trigger: aparece al llegar al 75% del scroll
  var triggered = false;
  function onScroll() {
    if (triggered) return;
    var scrolled  = window.scrollY + window.innerHeight;
    var total     = document.documentElement.scrollHeight;
    if (scrolled / total >= 0.75) {
      triggered = true;
      window.removeEventListener('scroll', onScroll);
      setTimeout(showPopup, 400);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
})();
