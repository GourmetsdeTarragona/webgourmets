/* ============================================================
   entrada.js — Gourmets de Tarragona
   Comportament comú dels articles (entrades/) per a les peces que genera tools/publica-blog.js:
   · tradueix els textos .t de les molles de pa i del bloc final (algunes plantilles antigues
     només traduïen el seu diccionari propi)
   · botó «Copiar enllaç» i compartir nadiu al mòbil
   ============================================================ */
(function () {
  function lang() { try { return localStorage.getItem('gdt-lang') === 'ca' ? 'ca' : 'es'; } catch (e) { return 'es'; } }
  function tradueix(l) {
    document.querySelectorAll('.e-migues .t, .ef .t, .ef-barra .t').forEach(function (el) {
      var v = el.getAttribute('data-' + l);
      if (v !== null) el.innerHTML = v;
    });
    document.querySelectorAll('.ef [data-ph-' + l + ']').forEach(function (el) { el.placeholder = el.getAttribute('data-ph-' + l); });
  }
  tradueix(lang());
  if (typeof window.setLang === 'function') {
    var original = window.setLang;
    window.setLang = function (l) { original(l); tradueix(l); };
  }

  /* Copiar l'enllaç */
  document.querySelectorAll('[data-copia]').forEach(function (b) {
    b.addEventListener('click', function () {
      var avis = b.parentNode.querySelector('.ef-copiat');
      var url = location.href.split('#')[0];
      var fet = function () { if (avis) { avis.classList.add('vis'); setTimeout(function () { avis.classList.remove('vis'); }, 2200); } };
      if (navigator.clipboard) navigator.clipboard.writeText(url).then(fet, fet);
      else { var t = document.createElement('textarea'); t.value = url; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch (e) {} t.remove(); fet(); }
    });
  });

  /* Compartir nadiu (mòbil) */
  var nadiu = document.querySelector('[data-comparteix]');
  if (nadiu && navigator.share) {
    nadiu.hidden = false;
    nadiu.addEventListener('click', function () {
      navigator.share({ title: document.title, url: location.href.split('#')[0] }).catch(function () {});
    });
  }
})();
