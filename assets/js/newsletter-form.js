/* ============================================================
   newsletter-form.js — Gourmets de Tarragona
   Alta a la newsletter sense sortir del web, per a qualsevol <form class="nl-form">.
   El formulari de Brevo accepta peticions AJAX (?isAjax=1) des del nostre domini.
   Si falla (p. ex. des de Vercel), s'envia el formulari de la manera clàssica en una pestanya nova.
   Cada formulari necessita: input[type=email], button i un <p class="nl-estat" role="status">.
   ============================================================ */
(function () {
  var TXT = {
    es: { email: 'Escribe un email válido.', enviant: 'Apuntando…', boto: 'Apuntarme',
          ok: '¡Listo! Ya estás en la lista. Si te llega un correo de confirmación, ábrelo para activar la suscripción.',
          error: 'No hemos podido apuntarte. Inténtalo de nuevo en un momento.' },
    ca: { email: 'Escriu un correu vàlid.', enviant: 'Apuntant…', boto: 'Apuntar-me',
          ok: "Fet! Ja ets a la llista. Si t'arriba un correu de confirmació, obre'l per activar la subscripció.",
          error: "No t'hem pogut apuntar. Torna-ho a provar d'aquí a un moment." }
  };
  function lang() { try { return localStorage.getItem('gdt-lang') === 'ca' ? 'ca' : 'es'; } catch (e) { return 'es'; } }
  var EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function prepara(form) {
    var email = form.querySelector('input[type="email"]');
    var boto = form.querySelector('button');
    var estat = form.querySelector('.nl-estat');
    if (!email || !boto || !estat) return;
    function mostra(text, tipus) { estat.textContent = text; estat.className = 'nl-estat ' + (tipus || ''); }
    email.addEventListener('input', function () { email.removeAttribute('aria-invalid'); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var L = TXT[lang()];
      var loc = form.querySelector('input[name="locale"]');
      if (loc) loc.value = lang();
      if (!EMAIL_OK.test(email.value.trim())) {
        email.setAttribute('aria-invalid', 'true'); mostra(L.email, 'error'); email.focus(); return;
      }
      boto.disabled = true; boto.textContent = L.enviant; mostra('', '');
      fetch(form.action + (form.action.indexOf('?') < 0 ? '?' : '&') + 'isAjax=1', { method: 'POST', body: new FormData(form) })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res && res.success) { form.reset(); mostra(L.ok, 'ok'); }
          else { mostra(L.error, 'error'); }
        })
        .catch(function () { form.target = '_blank'; form.submit(); mostra(L.ok, 'ok'); })
        .then(function () { boto.disabled = false; boto.textContent = L.boto; });
    });
  }
  document.querySelectorAll('form.nl-form').forEach(prepara);
})();
