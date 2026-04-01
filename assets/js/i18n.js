/* ============================================================
   I18N.JS — Sistema de traduccions ES / CA
   Gourmets de Tarragona
   ============================================================
   Ús: qualsevol element amb data-i18n="clau" s'actualitza
   automàticament en cridar setLang('es') o setLang('ca').
   La llengua es guarda a localStorage per persistir entre pàgines.
   ============================================================ */

window.translations = {

  /* ---- NAV ---- */
  nav_inicio:     { es: 'Inicio',            ca: 'Inici' },
  nav_asoc:       { es: 'La Asociación',     ca: "L'Associació" },
  nav_asoc_short: { es: 'La Asociación',     ca: "L'Associació" },
  nav_rest:       { es: 'Restaurantes',      ca: 'Restaurants' },
  nav_rest_short: { es: 'Restaurantes',      ca: 'Restaurants' },
  nav_premios:    { es: 'Premios',           ca: 'Premis' },
  nav_premios_short:{ es: 'Premios',         ca: 'Premis' },
  nav_eventos:    { es: 'Eventos',           ca: 'Esdeveniments' },
  nav_eventos_short:{ es: 'Eventos',         ca: 'Esdeveniments' },
  nav_blog:       { es: 'Blog Gourmet',      ca: 'Blog Gourmet' },
  nav_contacto:   { es: 'Contacto',          ca: 'Contacte' },

  nav_quienes:    { es: 'Quiénes somos',     ca: 'Qui som' },
  nav_como:       { es: 'Cómo funcionamos',  ca: 'Com funcionem' },
  nav_sistema:    { es: 'El sistema de valoración', ca: 'El sistema de valoració' },
  nav_visites:    { es: 'Visitas 2025–26',   ca: 'Visites 2025–26' },
  nav_historic:   { es: 'Histórico de visitas', ca: 'Històric de visites' },
  nav_gastronia:  { es: 'Trofeo Gastronía',  ca: 'Trofeu Gastronía' },
  nav_bacus:      { es: 'Premio Baccus',     ca: 'Premi Bacus' },
  nav_palmares:   { es: 'Palmarés histórico',ca: 'Palmarès històric' },
  nav_cenes:      { es: 'Cenas especiales',  ca: 'Sopars especials' },
  nav_cates:      { es: 'Catas & Visitas',   ca: 'Tasts & Visites' },
  nav_calendari:  { es: 'Calendario',        ca: 'Calendari' },

  /* ---- HERO ---- */
  hero_label: {
    es: 'Asociación Gastronómica · Camp de Tarragona',
    ca: 'Associació Gastronòmica · Camp de Tarragona'
  },
  hero_sub: {
    es: 'Una comunidad apasionada por la gastronomía mediterránea, la alta cocina y el arte de compartir la mesa.',
    ca: 'Una comunitat apassionada per la gastronomia mediterrània, l\'alta cuina i l\'art de compartir la taula.'
  },
  hero_btn1:  { es: 'Descúbrenos',   ca: 'Descobreix-nos' },
  hero_btn2:  { es: 'Hazte socio',   ca: 'Fes-te soci' },
  hero_meta1: { es: 'Temporada 2026',     ca: 'Temporada 2026' },
  hero_meta2: { es: 'Recorrido Gourmet', ca: 'Recorregut Gourmet' },
  hero_scroll:{ es: 'Scroll',             ca: 'Scroll' },

  /* ---- STRIP ---- */
  strip1: { es: '8 Restaurantes al año', ca: '8 Restaurants a l\'any' },
  strip2: { es: 'Trofeo Gastronía',      ca: 'Trofeu Gastronía' },
  strip3: { es: 'Premio Baccus',         ca: 'Premi Bacus' },
  strip4: { es: 'Tarragona, Catalunya',  ca: 'Tarragona, Catalunya' },

  /* ---- QUI SOM ---- */
  about_label: { es: 'Quiénes somos',  ca: 'Qui som' },
  about_title: {
    es: 'La excelencia culinaria en el corazón del Mediterráneo',
    ca: 'L\'excel·lència culinària al cor del Mediterrani'
  },
  about_p1: {
    es: 'Gourmets de Tarragona es una asociación formada por amantes de la gastronomía, chefs, productores locales y entusiastas del buen comer que comparten una misma pasión: explorar, celebrar y difundir la riqueza culinaria de nuestra tierra.',
    ca: 'Gourmets de Tarragona és una associació formada per amants de la gastronomia, cuiners, productors locals i entusiastes del bon menjar que comparteixen una mateixa passió: explorar, celebrar i difondre la riquesa culinària de la nostra terra.'
  },
  about_p2: {
    es: 'A lo largo del año visitamos cerca de ocho restaurantes, los socios valoran cada experiencia y al final del año los mejores reciben nuestros preciados galardones.',
    ca: 'Al llarg de l\'any visitem prop de vuit restaurants, els socis valoren cada experiència i al final de l\'any els millors reben els nostres preuats guardons.'
  },
  val1: { es: 'Excelencia gastronómica',              ca: 'Excel·lència gastronòmica' },
  val2: { es: 'Producto local y de temporada',        ca: 'Producte local i de temporada' },
  val3: { es: 'Cultura del vino y el maridaje',       ca: 'Cultura del vi i el maridatge' },
  val4: { es: 'Respeto por el territorio y sus profesionales', ca: 'Respecte pel territori i els seus professionals' },
  about_cta: { es: 'Conocer la asociación', ca: 'Conèixer l\'associació' },

  /* ---- PREMIS HOME ---- */
  premis_label: { es: 'Nuestros Galardones',  ca: 'Els nostres Guardons' },
  premis_title: {
    es: 'Los premios más codiciados de la gastronomía tarraconense',
    ca: 'Els premis més cobejats de la gastronomia tarragonina'
  },
  premis_gastronia_title: { es: 'Trofeo Gastronía', ca: 'Trofeu Gastronía' },
  premis_gastronia_desc: {
    es: 'El máximo reconocimiento al mejor restaurante del año según la valoración acumulada de todos los socios a lo largo de las visitas.',
    ca: 'El màxim reconeixement al millor restaurant de l\'any segons la valoració acumulada de tots els socis al llarg de les visites.'
  },
  premis_bacus_title: { es: 'Premio Baccus', ca: 'Premi Bacus' },
  premis_bacus_desc: {
    es: 'Otorgado a la mejor bodega o vino descubierto durante las visitas del año. La bodega premiada es invitada de honor a la Cena de Entrega de Premios.',
    ca: 'Atorgat al millor celler o vi descobert durant les visites de l\'any. El celler premiat és convidat d\'honor al Sopar de Lliurament de Premis.'
  },
  premis_cta: { es: 'Ver todos los premios', ca: 'Veure tots els premis' },

  /* ---- EVENTS HOME ---- */
  events_label: { es: 'Próximos Eventos',       ca: 'Propers Esdeveniments' },
  events_title: { es: 'No te pierdas ninguna cita', ca: 'No et perdis cap cita' },
  ev1_badge: { es: 'Cata',          ca: 'Tast' },
  ev1_date:  { es: '12 Abril 2026', ca: '12 Abril 2026' },
  ev1_title: { es: 'Cata de Vinos DO Tarragona', ca: 'Tast de Vins DO Tarragona' },
  ev1_desc:  {
    es: 'Una noche de descubrimiento a través de los mejores caldos de la DO Tarragona.',
    ca: 'Una nit de descoberta a través dels millors vins de la DO Tarragona.'
  },
  ev1_loc: { es: 'Celler Mas dels Frares', ca: 'Celler Mas dels Frares' },
  ev2_badge: { es: 'Visita',        ca: 'Visita' },
  ev2_date:  { es: '3 Mayo 2026',   ca: '3 Maig 2026' },
  ev2_title: { es: 'Visita Gastronómica — Restaurante Els Pescadors', ca: 'Visita Gastronòmica — Restaurant Els Pescadors' },
  ev2_desc:  {
    es: 'Quinta visita del año a uno de los referentes de la cocina marinera de Tarragona.',
    ca: 'Cinquena visita de l\'any a un dels referents de la cuina marinera de Tarragona.'
  },
  ev2_loc: { es: 'Tarragona', ca: 'Tarragona' },
  ev3_badge: { es: 'Cena Especial', ca: 'Sopar Especial' },
  ev3_date:  { es: '21 Junio 2026', ca: '21 Juny 2026' },
  ev3_title: { es: 'Cena de Verano — Noche de San Juan', ca: 'Sopar d\'Estiu — Nit de Sant Joan' },
  ev3_desc:  {
    es: 'Cena especial al aire libre para celebrar la noche más corta del año.',
    ca: 'Sopar especial a l\'aire lliure per celebrar la nit més curta de l\'any.'
  },
  ev3_loc:    { es: 'Port de Tarragona', ca: 'Port de Tarragona' },
  ev_reservar:{ es: 'Reservar',          ca: 'Reservar' },
  events_cta: { es: 'Ver todos los eventos', ca: 'Veure tots els esdeveniments' },

  /* ---- RECORREGUT ---- */
  rec_label:       { es: 'Temporada 2026',           ca: 'Temporada 2026' },
  rec_title:       { es: 'Recorrido Gourmet',         ca: 'Recorregut Gourmet' },
  rec_desc:        { es: 'Ocho restaurantes, una temporada, un territorio. Evaluamos con criterio y compartimos con honestidad.', ca: 'Vuit restaurants, una temporada, un territori. Avaluem amb criteri i compartim amb honestedat.' },
  rec_visitada:    { es: 'Visitado',                  ca: 'Visitat' },
  rec_pendent:     { es: 'Próximamente',              ca: 'Pròximament' },
  rec_zona:        { es: 'Camp de Tarragona',         ca: 'Camp de Tarragona' },
  rec_kema_cuina:  { es: 'Brasas & Cocktail',         ca: 'Brases & Còctel' },
  rec_kema_desc:   { es: 'Primera visita de la temporada. Cocina de brasa con producto de calidad, técnica y una oferta de coctelería diferencial.', ca: 'Primera visita de la temporada. Cuina de brasa amb producte de qualitat, tècnica i una oferta de cocteleria diferencial.' },
  rec_link_previa: { es: 'Leer la previa →',          ca: 'Llegir la prèvia →' },
  rec_link_cronica:{ es: 'Crónica completa →',        ca: 'Crònica completa →' },
  rec_seg_visita:  { es: '2ª Visita',                 ca: '2a Visita' },
  rec_ter_visita:  { es: '3ª Visita',                 ca: '3a Visita' },
  rec_seg_desc:    { es: 'El recorrido continúa. Próxima visita pendiente de confirmar.', ca: 'El recorregut continua. Propera visita pendent de confirmar.' },
  rec_cta:         { es: 'Ver todas las visitas',     ca: 'Veure totes les visites' },

  /* ---- FOOTER ---- */
  footer_desc: {
    es: 'Asociación gastronómica sin ánimo de lucro.<br>Camp de Tarragona.',
    ca: 'Associació gastronòmica sense ànim de lucre.<br>Camp de Tarragona.'
  },
  footer_nav:        { es: 'Navegación',          ca: 'Navegació' },
  footer_legal:      { es: 'Legal',               ca: 'Legal' },
  footer_contacte:   { es: 'Contacto',            ca: 'Contacte' },
  footer_avis:       { es: 'Aviso Legal',          ca: 'Avís Legal' },
  footer_privacitat: { es: 'Política de Privacidad', ca: 'Política de Privacitat' },
  footer_cookies:    { es: 'Política de Cookies', ca: 'Política de Cookies' },
  footer_copy: {
    es: '© 2026 Gourmets de Tarragona · Asociación Gastronómica · Todos los derechos reservados',
    ca: '© 2026 Gourmets de Tarragona · Associació Gastronòmica · Tots els drets reservats'
  },

};

/* ---- Motor de traducció ---- */
let currentLang = localStorage.getItem('gdt-lang') || 'es';

function applyTranslations(lang) {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (window.translations[key] && window.translations[key] && window.translations[key][lang] !== undefined) {
      /* innerHTML per permetre <br> i entitats HTML dins les traduccions */
      el.innerHTML = translations[key][lang];
    }
  });
  /* Atribut lang del document */
  document.getElementById('html-root')?.setAttribute('lang', lang);
  /* Botons actius */
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });
}

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem('gdt-lang', lang);
  applyTranslations(lang);
}

/* Aplica en carregar la pàgina */
document.addEventListener('DOMContentLoaded', () => {
  applyTranslations(currentLang);
});
