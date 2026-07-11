(function(){
  var STORAGE_KEY = 'gdt-nl-dismissed';
  var DAYS_HIDE   = 7;

  // No mostrar si ya suscrito o descartado recientemente
  var dismissed = localStorage.getItem(STORAGE_KEY);
  if (dismissed && Date.now() < parseInt(dismissed, 10)) return;

  var popup   = document.getElementById('nl-popup');
  var overlay = document.getElementById('nl-popup-overlay');
  var closeBtn= document.getElementById('nl-popup-close');
  var form    = document.getElementById('nl-popup-form');
  if (!popup) return;

  var shown = false;

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
  }

  function closePopup() {
    popup.classList.remove('nl-visible');
    setTimeout(function(){
      popup.style.display = 'none';
    }, 300);
    document.body.style.overflow = '';
    // Guardar que fue descartado por X dias
    localStorage.setItem(STORAGE_KEY, Date.now() + DAYS_HIDE * 86400000);
  }

  closeBtn.addEventListener('click', closePopup);
  overlay.addEventListener('click', closePopup);
  document.addEventListener('keydown', function(e){
    if (e.key === 'Escape') closePopup();
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
