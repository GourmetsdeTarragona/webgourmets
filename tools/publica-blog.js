#!/usr/bin/env node
/* ============================================================
   publica-blog.js — Gourmets de Tarragona
   Font única: data/blog-posts.json (+ data/blog-config.json).
   Regenera tot el que depèn dels articles perquè no es desincronitzi mai:
     · pages/blog.html          → blocs entre <!-- BLOG:AUTO:… --> (filtres, portada, graella)
     · data/blog-publicats.json → articles ja publicats (la portada del web els llegeix)
     · feed.xml                 → RSS ordenat, amb lastBuildDate
     · sitemap.xml              → URLs d'entrades/ amb lastmod (la resta del sitemap es manté)
   Els articles amb data futura queden PROGRAMATS: no surten enlloc fins aquell dia
   (cal tornar a executar l'script el dia de la publicació i pujar els fitxers).

   Ús:  node tools/publica-blog.js                 (escriu)
        node tools/publica-blog.js --dry           (només valida i informa)
        node tools/publica-blog.js --avui=2026-11-09   (simula una altra data)
   ============================================================ */
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const DOMINI = 'https://www.gourmetsdetarragona.com';
const DRY = process.argv.includes('--dry');
const argAvui = (process.argv.find(a => a.startsWith('--avui=')) || '').split('=')[1];
const AVUI = argAvui || new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

const llegeix = f => fs.readFileSync(path.join(REPO, f), 'utf8');
const escriu = (f, t) => { if (!DRY) fs.writeFileSync(path.join(REPO, f), t); };
const POSTS = JSON.parse(llegeix('data/blog-posts.json'));
const CONFIG = JSON.parse(llegeix('data/blog-config.json'));

/* ── Categories: la del JSON (detallada) i el filtre del blog (agrupat) ── */
const CAT = {
  previa:      { es: 'Previa', ca: 'Prèvia' },
  cronica:     { es: 'Crónica', ca: 'Crònica' },
  vi:          { es: 'Vinos', ca: 'Vins' },
  curiositats: { es: 'Producto y tradición', ca: 'Producte i tradició' },
  cultura:     { es: 'Cultura', ca: 'Cultura' },
  noticia:     { es: 'Actualidad', ca: 'Actualitat' },
  event:       { es: 'Asociación', ca: 'Associació' },
};
const FILTRES = [
  { id: 'tots',       es: 'Todo', ca: 'Tot' },
  { id: 'recorregut', es: 'Recorrido', ca: 'Recorregut' },
  { id: 'vins',       es: 'Vinos', ca: 'Vins' },
  { id: 'producte',   es: 'Producto y tradición', ca: 'Producte i tradició' },
  { id: 'cultura',    es: 'Cultura', ca: 'Cultura' },
  { id: 'actualitat', es: 'Actualidad', ca: 'Actualitat' },
];
function filtreDe(p) {
  if (p.restaurant) return 'recorregut';
  return { vi: 'vins', curiositats: 'producte', cultura: 'cultura' }[p.categoria] || 'actualitat';
}

/* ── Utilitats ── */
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const normal = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
const thumb = img => 'assets/img/_thumbs/' + decodeURIComponent(img).replace(/^assets\/img\//, '').replace(/\s+/g, '-').replace(/\.[a-z]+$/i, '.webp');
const MES_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sept', 'oct', 'nov', 'dic'];
const MES_CA = ['gen', 'febr', 'març', 'abr', 'maig', 'juny', 'jul', 'ag', 'set', 'oct', 'nov', 'des'];
function dataCurta(iso, l) { const [a, m, d] = iso.split('-').map(Number); return `${d} ${(l === 'ca' ? MES_CA : MES_ES)[m - 1]} ${a}`; }
const t = (cls, es, ca, tag = 'span', extra = '') => `<${tag} class="t${cls ? ' ' + cls : ''}"${extra} data-es="${esc(es)}" data-ca="${esc(ca)}">${esc(es)}</${tag}>`;
function substitueixBloc(text, nom, nou, fitxer) {
  const a = `<!-- BLOG:AUTO:${nom} -->`, b = `<!-- /BLOG:AUTO:${nom} -->`;
  const i = text.indexOf(a), j = text.indexOf(b);
  if (i < 0 || j < 0) throw new Error(`Falten els marcadors ${nom} a ${fitxer}`);
  return text.slice(0, i + a.length) + '\n' + nou + '\n' + text.slice(j);
}

/* ── 1. Validació ── */
const errors = [], avisos = [];
const slugs = new Set();
const fitxers = fs.readdirSync(path.join(REPO, 'entrades')).filter(f => f.endsWith('.html')).map(f => f.replace('.html', ''));
for (const p of POSTS) {
  if (slugs.has(p.slug)) errors.push(`slug repetit: ${p.slug}`);
  slugs.add(p.slug);
  if (!fitxers.includes(p.slug)) errors.push(`${p.slug}: no existeix entrades/${p.slug}.html`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.data || '')) errors.push(`${p.slug}: data no vàlida (${p.data})`);
  if (!CAT[p.categoria]) errors.push(`${p.slug}: categoria desconeguda (${p.categoria})`);
  for (const c of ['titol_es', 'titol_ca', 'resum_es', 'resum_ca', 'img']) if (!p[c]) errors.push(`${p.slug}: falta ${c}`);
  if (p.img && !fs.existsSync(path.join(REPO, decodeURIComponent(p.img)))) errors.push(`${p.slug}: no existeix la imatge ${p.img}`);
  if (p.img && !fs.existsSync(path.join(REPO, thumb(p.img)))) avisos.push(`${p.slug}: falta la miniatura (executa node tools/optimiza-imatges.js)`);
}
for (const f of fitxers) if (!slugs.has(f)) errors.push(`entrades/${f}.html no és al JSON`);
for (const s of [CONFIG.destacat, ...(CONFIG.imprescindibles || [])].filter(Boolean)) if (!slugs.has(s)) errors.push(`blog-config.json: «${s}» no existeix`);

const publicats = POSTS.filter(p => p.data <= AVUI).sort((a, b) => b.data.localeCompare(a.data) || a.slug.localeCompare(b.slug));
const programats = POSTS.filter(p => p.data > AVUI).sort((a, b) => a.data.localeCompare(b.data));

console.log(`Data de referència: ${AVUI}${DRY ? '  (simulació, no s\'escriu res)' : ''}`);
console.log(`Articles: ${POSTS.length} · publicats ${publicats.length} · programats ${programats.length}`);
programats.forEach(p => console.log(`  programat ${p.data}  ${p.slug}`));
avisos.forEach(a => console.log('  ! ' + a));
if (errors.length) { console.error('\nERRORS:\n  ' + errors.join('\n  ')); process.exit(1); }

/* ── 2. Unitats del blog: els restaurants agrupen prèvia + crònica en una sola targeta ── */
function unitats(llista) {
  const out = [], vistos = new Set();
  for (const p of llista) {
    if (!p.restaurant) { out.push({ principal: p, filtre: filtreDe(p), membres: [p] }); continue; }
    if (vistos.has(p.restaurant)) continue;
    vistos.add(p.restaurant);
    const membres = llista.filter(x => x.restaurant === p.restaurant);
    const cronica = membres.find(x => x.categoria === 'cronica'), previa = membres.find(x => x.categoria === 'previa');
    out.push({ principal: cronica || previa, cronica, previa, filtre: 'recorregut', membres });
  }
  return out;
}
const UNITATS = unitats(publicats);

function textCerca(u) {
  return normal(u.membres.map(p => [p.titol_es, p.titol_ca, p.subtitol_es, p.subtitol_ca, p.resum_es, p.resum_ca, CAT[p.categoria].es, CAT[p.categoria].ca, p.slug.replace(/-/g, ' ')].join(' ')).join(' '));
}
function etiqueta(u) {
  const p = u.principal;
  if (u.filtre === 'recorregut') return { es: 'Recorrido ' + p.data.slice(0, 4), ca: 'Recorregut ' + p.data.slice(0, 4) };
  return CAT[p.categoria];
}
function meta(p, et) {
  return `<p class="bc-meta">${t('bc-cat', et.es, et.ca)}<span class="bc-punt" aria-hidden="true">·</span>${t('', dataCurta(p.data, 'es'), dataCurta(p.data, 'ca'), 'time', ` datetime="${p.data}"`)}<span class="bc-punt" aria-hidden="true">·</span><span>${p.min_lectura} min</span></p>`;
}
function enllacosRestaurant(u, cls) {
  if (!u.cronica || !u.previa) return '';
  return `<p class="${cls}">` +
    `<a class="t" href="../entrades/${u.cronica.slug}.html" data-es="Crónica →" data-ca="Crònica →">Crónica →</a>` +
    `<a class="t" href="../entrades/${u.previa.slug}.html" data-es="Previa" data-ca="Prèvia">Previa</a></p>`;
}

/* ── 3. Targeta estàndard ── */
function targeta(u, eager, aPortada) {
  const p = u.principal;
  return `<article class="bc" data-f="${u.filtre}"${aPortada ? ' data-portada="1"' : ''} data-q="${esc(textCerca(u))}">
  <div class="bc-img"><img src="../${esc(thumb(p.img))}" alt="" loading="${eager ? 'eager' : 'lazy'}" decoding="async" width="640" height="427"></div>
  <div class="bc-cos">
    ${meta(p, etiqueta(u))}
    <h3 class="bc-tit"><a class="t" href="../entrades/${p.slug}.html" data-es="${esc(p.titol_es)}" data-ca="${esc(p.titol_ca)}">${esc(p.titol_es)}</a></h3>
    ${p.subtitol_es ? t('bc-sub', p.subtitol_es, p.subtitol_ca || p.subtitol_es, 'p') : ''}
    ${t('bc-res', p.resum_es, p.resum_ca, 'p')}
    ${enllacosRestaurant(u, 'bc-dos')}
  </div>
</article>`;
}

/* ── 4. Portada: destacat + imprescindibles + 3 recents ── */
const destacat = (CONFIG.destacat && UNITATS.find(u => u.membres.some(m => m.slug === CONFIG.destacat))) || UNITATS[0];
const secundaris = UNITATS.filter(u => u !== destacat).slice(0, 3);
const imprescindibles = (CONFIG.imprescindibles || []).map(s => POSTS.find(p => p.slug === s)).filter(p => p && p.data <= AVUI).slice(0, 5);

function blocPortada() {
  const d = destacat.principal;
  return `<section class="portada" aria-label="Destacados">
  <article class="dest">
    <div class="dest-img"><img src="../${esc(decodeURIComponent(d.img))}" alt="" width="1200" height="800" fetchpriority="high" decoding="async"></div>
    <div class="dest-cos">
      ${meta(d, etiqueta(destacat))}
      <h2 class="dest-tit"><a class="t" href="../entrades/${d.slug}.html" data-es="${esc(d.titol_es)}" data-ca="${esc(d.titol_ca)}">${esc(d.titol_es)}</a></h2>
      ${d.subtitol_es ? t('dest-sub', d.subtitol_es, d.subtitol_ca || d.subtitol_es, 'p') : ''}
      ${t('dest-res', d.resum_es, d.resum_ca, 'p')}
      ${enllacosRestaurant(destacat, 'bc-dos dest-dos') || `<p class="bc-dos dest-dos"><a class="t" href="../entrades/${d.slug}.html" data-es="Leer el artículo →" data-ca="Llegir l'article →">Leer el artículo →</a></p>`}
    </div>
  </article>
  <aside class="impr" aria-labelledby="impr-tit">
    ${t('impr-tit', 'Imprescindibles', 'Imprescindibles', 'h2', ' id="impr-tit"')}
    <ol>
${imprescindibles.map((p, i) => `      <li><span class="impr-num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><a class="t" href="../entrades/${p.slug}.html" data-es="${esc(p.titol_es)}" data-ca="${esc(p.titol_ca)}">${esc(p.titol_es)}</a></li>`).join('\n')}
    </ol>
  </aside>
</section>
<section class="secundaris" aria-label="Más recientes">
${secundaris.map(u => targeta(u, true)).join('\n')}
</section>`;
}

/* ── 5. Filtres amb recompte ── */
function blocFiltres() {
  const n = id => id === 'tots' ? UNITATS.length : UNITATS.filter(u => u.filtre === id).length;
  return FILTRES.map(f => `      <button type="button" class="filtre${f.id === 'tots' ? ' actiu' : ''}" data-f="${f.id}" aria-pressed="${f.id === 'tots'}"><span class="t" data-es="${esc(f.es)}" data-ca="${esc(f.ca)}">${esc(f.es)}</span><span class="filtre-n">${n(f.id)}</span></button>`).join('\n');
}

/* ── 6. Graella completa ── */
// Les de la portada també hi són (per als filtres i la cerca), però s'amaguen quan no hi ha cap filtre actiu
const aPortada = new Set([destacat, ...secundaris]);
const blocGraella = () => UNITATS.map(u => targeta(u, false, aPortada.has(u))).join('\n');

/* ── 7. Escriure blog.html ── */
let blog = llegeix('pages/blog.html');
blog = substitueixBloc(blog, 'FILTRES', blocFiltres(), 'blog.html');
blog = substitueixBloc(blog, 'PORTADA', blocPortada(), 'blog.html');
blog = substitueixBloc(blog, 'GRAELLA', blocGraella(), 'blog.html');
blog = blog.replace(/data-total="\d+"/g, `data-total="${UNITATS.length}"`);
escriu('pages/blog.html', blog);

/* ── 8. Dades per a la portada del web ── */
escriu('data/blog-publicats.json', JSON.stringify(publicats.map(p => ({
  slug: p.slug, categoria: p.categoria, data: p.data,
  titol_es: p.titol_es, titol_ca: p.titol_ca, resum_es: p.resum_es, resum_ca: p.resum_ca,
  img: p.img, min_lectura: p.min_lectura, color_bg: '#122850',
})), null, 2) + '\n');

/* ── 9. RSS ── */
function rfc822(iso) {
  const d = new Date(iso + 'T09:00:00');
  const dies = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], mesos = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const off = -d.getTimezoneOffset(), sig = off >= 0 ? '+' : '-';
  const hh = String(Math.floor(Math.abs(off) / 60)).padStart(2, '0'), mm = String(Math.abs(off) % 60).padStart(2, '0');
  return `${dies[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')} ${mesos[d.getMonth()]} ${d.getFullYear()} 09:00:00 ${sig}${hh}${mm}`;
}
const xml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>Gourmets de Tarragona — Blog Gourmet</title>
    <link>${DOMINI}/pages/blog.html</link>
    <description>Crónicas de restaurantes, vinos, producto y cultura gastronómica del Camp de Tarragona.</description>
    <language>es-ES</language>
    <lastBuildDate>${rfc822(publicats[0].data)}</lastBuildDate>
    <atom:link href="${DOMINI}/feed.xml" rel="self" type="application/rss+xml"/>
${publicats.map(p => `
    <item>
      <title>${xml(p.titol_es + (p.subtitol_es ? ' — ' + p.subtitol_es : ''))}</title>
      <link>${DOMINI}/entrades/${p.slug}.html</link>
      <guid>${DOMINI}/entrades/${p.slug}.html</guid>
      <pubDate>${rfc822(p.data)}</pubDate>
      <category>${xml(CAT[p.categoria].es)}</category>
      <description>${xml(p.resum_es)}</description>
      <media:content url="${DOMINI}/${encodeURI(decodeURIComponent(p.img))}" medium="image"/>
    </item>`).join('\n')}

  </channel>
</rss>
`;
escriu('feed.xml', feed);

/* ── 10. Sitemap: es regeneren només les URLs d'entrades/ ── */
let sm = llegeix('sitemap.xml').replace(/\r\n/g, '\n');
const urls = [...sm.matchAll(/  <url>[\s\S]*?<\/url>\n?/g)].map(m => m[0].endsWith('\n') ? m[0] : m[0] + '\n');
const altres = urls.filter(u => !u.includes('/entrades/'))
  .map(u => u.includes('/pages/blog.html') ? u.replace(/<lastmod>[^<]*<\/lastmod>/, `<lastmod>${publicats[0].data}</lastmod>`) : u);
const entrades = publicats.map(p => `  <url>\n    <loc>${DOMINI}/entrades/${p.slug}.html</loc>\n    <lastmod>${p.data_mod || p.data}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`);
sm = sm.slice(0, sm.indexOf('  <url>')) + altres.join('') + entrades.join('') + '</urlset>\n';
escriu('sitemap.xml', sm);

/* ── 11. Articles: molles de pa, bloc final comú i neteja de peces antigues ──
   Tot va entre marcadors <!-- BLOG:AUTO:MIGES --> i <!-- BLOG:AUTO:FINAL -->: es pot tornar a executar
   sempre. El text de cada article no es toca. */
const RESTAURANTS = fs.existsSync(path.join(REPO, 'data/restaurants.json')) ? JSON.parse(llegeix('data/restaurants.json')) : {};
const NL_ACTION = (llegeix('pages/blog.html').match(/action="(https:\/\/[a-z0-9]+\.sibforms\.com\/serve\/[^"]+)"/) || [])[1];
const NOM_FILTRE = Object.fromEntries(FILTRES.map(f => [f.id, f]));

function elementSencer(text, inici) {
  const tag = (text.slice(inici + 1).match(/^[a-z0-9]+/i) || [])[0];
  if (!tag) return null;
  const re = new RegExp(`<${tag}\\b|</${tag}>`, 'gi');
  re.lastIndex = inici;
  let fondaria = 0, m;
  while ((m = re.exec(text))) {
    if (m[0][1] === '/') { fondaria--; if (fondaria === 0) return [inici, m.index + m[0].length]; }
    else fondaria++;
  }
  return null;
}
function treuElement(text, atribut) {
  for (let i = 0; i < 20; i++) {
    const k = text.indexOf(atribut);
    if (k < 0) break;
    const r = elementSencer(text, text.lastIndexOf('<', k));
    if (!r) break;
    text = text.slice(0, r[0]).replace(/[ \t]*$/, '') + text.slice(r[1]).replace(/^\n/, '');
  }
  return text;
}
function posaBloc(text, nom, contingut, onInserir) {
  const a = `<!-- BLOG:AUTO:${nom} -->`, b = `<!-- /BLOG:AUTO:${nom} -->`;
  const bloc = `${a}\n${contingut}\n${b}`;
  if (text.includes(a) && text.includes(b)) return text.slice(0, text.indexOf(a)) + bloc + text.slice(text.indexOf(b) + b.length);
  return onInserir(text, bloc);
}
const urlArticle = p => `${DOMINI}/entrades/${p.slug}.html`;

function migues(p) {
  const f = NOM_FILTRE[filtreDe(p)];
  return `<nav class="e-migues" aria-label="Migas de pan"><ol>
  <li><a class="t" href="../pages/blog.html" data-es="Blog" data-ca="Blog">Blog</a></li>
  <li><a class="t" href="../pages/blog.html?cat=${filtreDe(p)}" data-es="${esc(f.es)}" data-ca="${esc(f.ca)}">${esc(f.es)}</a></li>
  <li aria-current="page" class="t" data-es="${esc(p.titol_es)}" data-ca="${esc(p.titol_ca)}">${esc(p.titol_es)}</li>
  <li class="e-meta-linia">${t('', dataCurta(p.data, 'es'), dataCurta(p.data, 'ca'), 'time', ` datetime="${p.data}"`)}<span aria-hidden="true">·</span><span>${p.min_lectura} min</span></li>
</ol></nav>`;
}

function blocFinal(p) {
  const llista = POSTS.filter(x => x.data <= AVUI || x.slug === p.slug).sort((a, b) => a.data.localeCompare(b.data) || a.slug.localeCompare(b.slug));
  const idx = llista.findIndex(x => x.slug === p.slug);
  const ant = llista[idx - 1], seg = llista[idx + 1];
  const parella = p.restaurant ? publicats.find(x => x.restaurant === p.restaurant && x.slug !== p.slug) : null;
  const mateixTema = publicats.filter(x => x.slug !== p.slug && x !== parella && filtreDe(x) === filtreDe(p));
  const altres = publicats.filter(x => x.slug !== p.slug && x !== parella && filtreDe(x) !== filtreDe(p));
  /* 3 relacionats: primer la parella (prèvia↔crònica), després el mateix tema; mai dos del mateix restaurant */
  const rel = [], restaurantsVistos = new Set([p.restaurant]);
  for (const x of [parella, ...mateixTema, ...altres].filter(Boolean)) {
    if (rel.length === 3) break;
    if (x !== parella && x.restaurant && restaurantsVistos.has(x.restaurant)) continue;
    if (x.restaurant) restaurantsVistos.add(x.restaurant);
    rel.push(x);
  }
  const r = p.restaurant && RESTAURANTS[p.restaurant];
  const titol = p.titol_es + (p.subtitol_es ? ' — ' + p.subtitol_es : '');
  const url = urlArticle(p);
  const maps = r ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(r.nom + ', ' + r.adreca + ', ' + r.lloc)}` : '';
  const out = [];
  out.push(`<aside class="ef" aria-label="Más sobre este artículo">`);
  if (r) {
    out.push(`  <section class="ef-sec ef-fitxa" aria-label="${esc(r.nom)}">
    <div>
      ${t('ef-tit', 'El restaurante', 'El restaurant', 'p')}
      <p class="ef-fitxa-nom">${esc(r.nom)}</p>
      <p class="ef-fitxa-dades">${esc(r.adreca)}${r.adreca.includes(r.lloc) ? '' : ' · ' + esc(r.lloc)}${r.telefon ? ` · <a href="tel:+34${r.telefon.replace(/\s/g, '')}">${esc(r.telefon)}</a>` : ''}</p>
    </div>
    <div class="ef-accions">
      <a class="ef-btn ef-btn-prim" href="${esc(maps)}" target="_blank" rel="noopener"><i class="fa fa-map-marker-alt" aria-hidden="true"></i>${t('', 'Cómo llegar', 'Com arribar-hi')}</a>
      ${r.web ? `<a class="ef-btn" href="${esc(r.web)}" target="_blank" rel="noopener"><i class="fa fa-globe" aria-hidden="true"></i>Web</a>` : ''}
    </div>
  </section>`);
  }
  out.push(`  <div class="ef-sec ef-comp">
    ${t('ef-tit', 'Compártelo', 'Comparteix-ho', 'p')}
    <a class="ef-btn ef-btn-wa" href="https://wa.me/?text=${encodeURIComponent(titol + ' ' + url)}" target="_blank" rel="noopener">WhatsApp</a>
    <button type="button" class="ef-btn" data-copia>${t('', 'Copiar enlace', 'Copiar l\'enllaç')}</button>
    <a class="ef-btn" href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}" target="_blank" rel="noopener">Facebook</a>
    <a class="ef-btn" href="mailto:?subject=${encodeURIComponent(titol)}&amp;body=${encodeURIComponent(url)}">Email</a>
    <button type="button" class="ef-btn" data-comparteix hidden>${t('', 'Más…', 'Més…')}</button>
    ${t('ef-copiat', 'Enlace copiado', 'Enllaç copiat', 'span', ' role="status"')}
  </div>`);
  if (ant || seg) {
    out.push(`  <nav class="ef-sec ef-nav" aria-label="Artículos anterior y siguiente">
${ant ? `    <a class="ant" href="${ant.slug}.html"><small class="t" data-es="← Anterior" data-ca="← Anterior">← Anterior</small><strong class="t" data-es="${esc(ant.titol_es)}" data-ca="${esc(ant.titol_ca)}">${esc(ant.titol_es)}</strong></a>` : ''}
${seg ? `    <a class="seg" href="${seg.slug}.html"><small class="t" data-es="Siguiente →" data-ca="Següent →">Siguiente →</small><strong class="t" data-es="${esc(seg.titol_es)}" data-ca="${esc(seg.titol_ca)}">${esc(seg.titol_es)}</strong></a>` : ''}
  </nav>`);
  }
  if (NL_ACTION) {
    out.push(`  <section class="ef-sec ef-nl" aria-label="Newsletter">
    <div>
      <h2 class="t" data-es="La próxima crónica, <em>en tu correo</em>" data-ca="La propera crònica, <em>al teu correu</em>">La próxima crónica, <em>en tu correo</em></h2>
      ${t('', 'Sin calendario fijo: solo cuando hay algo que contar.', 'Sense calendari fix: només quan hi ha alguna cosa a explicar.', 'p')}
    </div>
    <form class="nl-form" action="${NL_ACTION}" method="post" novalidate>
      <div class="nl-trampa" aria-hidden="true"><input type="text" name="email_address_check" value="" tabindex="-1" autocomplete="off"></div>
      <input type="hidden" name="locale" value="es">
      <div class="nl-form-fila">
        <label class="sr-only" for="ef-nl-email">Email</label>
        <input type="email" id="ef-nl-email" name="EMAIL" required autocomplete="email" placeholder="hola@tucorreo.com" data-ph-es="hola@tucorreo.com" data-ph-ca="hola@elteucorreu.com">
        <button type="submit" class="t" data-es="Apuntarme" data-ca="Apuntar-me">Apuntarme</button>
      </div>
      <p class="nl-priv t" data-es="Gratis. Al apuntarte aceptas la &lt;a href=&quot;../pages/privacitat.html&quot;&gt;política de privacidad&lt;/a&gt;; los envíos los gestiona Brevo." data-ca="Gratuïta. En apuntar-te acceptes la &lt;a href=&quot;../pages/privacitat.html&quot;&gt;política de privacitat&lt;/a&gt;; els enviaments els gestiona Brevo.">Gratis. Al apuntarte aceptas la <a href="../pages/privacitat.html">política de privacidad</a>; los envíos los gestiona Brevo.</p>
      <p class="nl-estat" role="status" aria-live="polite"></p>
    </form>
  </section>`);
  }
  if (rel.length) {
    out.push(`  <section class="ef-sec" aria-labelledby="ef-rel-tit">
    ${t('ef-tit', 'Sigue leyendo', 'Continua llegint', 'h2', ' id="ef-rel-tit"')}
    <div class="ef-rel">
${rel.map(x => `      <article>
        <div class="ef-rel-img"><img src="../${esc(thumb(x.img))}" alt="" loading="lazy" decoding="async" width="640" height="427"></div>
        ${t('ef-rel-cat', CAT[x.categoria].es, CAT[x.categoria].ca, 'p')}
        <h3><a class="t" href="${x.slug}.html" data-es="${esc(x.titol_es)}" data-ca="${esc(x.titol_ca)}">${esc(x.titol_es)}</a></h3>
      </article>`).join('\n')}
    </div>
  </section>`);
  }
  out.push(`  <a class="ef-tornar t" href="../pages/blog.html" data-es="← Todos los artículos" data-ca="← Tots els articles">← Todos los artículos</a>`);
  out.push(`</aside>`);
  if (r) {
    out.push(`<div class="ef-barra" role="navigation" aria-label="${esc(r.nom)}">
  <a href="${esc(maps)}" target="_blank" rel="noopener"><i class="fa fa-map-marker-alt" aria-hidden="true"></i>${t('', 'Cómo llegar', 'Com arribar-hi')}</a>
  ${r.telefon ? `<a href="tel:+34${r.telefon.replace(/\s/g, '')}"><i class="fa fa-phone" aria-hidden="true"></i>${t('', 'Llamar', 'Trucar')}</a>` : ''}
  ${r.web ? `<a href="${esc(r.web)}" target="_blank" rel="noopener"><i class="fa fa-globe" aria-hidden="true"></i>Web</a>` : ''}
</div>`);
  }
  /* Dades estructurades: molles de pa i, si és un restaurant, la fitxa */
  const ld = [{
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Blog', item: `${DOMINI}/pages/blog.html` },
      { '@type': 'ListItem', position: 2, name: NOM_FILTRE[filtreDe(p)].es, item: `${DOMINI}/pages/blog.html?cat=${filtreDe(p)}` },
      { '@type': 'ListItem', position: 3, name: p.titol_es, item: url },
    ],
  }];
  if (r) ld.push({
    '@context': 'https://schema.org', '@type': 'Restaurant', name: r.nom,
    address: { '@type': 'PostalAddress', streetAddress: r.adreca, addressLocality: r.lloc, addressRegion: 'Tarragona', addressCountry: 'ES' },
    ...(r.telefon ? { telephone: '+34 ' + r.telefon } : {}), ...(r.web ? { url: r.web } : {}),
    geo: { '@type': 'GeoCoordinates', latitude: r.lat, longitude: r.lng },
  });
  out.push(`<script type="application/ld+json">${JSON.stringify(ld.length === 1 ? ld[0] : ld)}</script>`);
  return out.join('\n');
}

let articlesCanviats = 0;
for (const p of POSTS) {
  const f = `entrades/${p.slug}.html`;
  const original = llegeix(f);
  const crlf = original.includes('\r\n');
  let h = original.replace(/\r\n/g, '\n');
  /* fora: compartir, newsletter, «també t'interessa», tornar al blog i finestra emergent antics */
  for (const a of ['class="e-compartir"', 'class="e-nl-cta"', 'class="e-tambe"', 'class="e-nav-retorn"', 'id="nl-popup"']) h = treuElement(h, a);
  h = h.replace(/<script>([\s\S]*?)<\/script>\n?/g, (m, js) =>
    (js.includes('gdt-nl-dismissed') || (js.includes("getElementById('btn-wa')") && !js.includes('function setLang'))) ? '' : m);
  h = h.replace(/<style>([\s\S]*?)<\/style>\n?/g, (m, css) =>
    ((css.includes('#nl-popup') || css.includes('.e-nl-cta')) && !/\.(entrada|cronica)-hero/.test(css)) ? '' : m);
  /* imatges per a xarxes sempre amb www */
  h = h.replace(/(content=")https:\/\/gourmetsdetarragona\.com\//g, '$1https://www.gourmetsdetarragona.com/');
  /* molles de pa just després de la capçalera */
  h = posaBloc(h, 'MIGES', migues(p), (text, bloc) => {
    const k = text.search(/class="(entrada|cronica)-hero"/);
    const r = k >= 0 ? elementSencer(text, text.lastIndexOf('<', k)) : null;
    if (r) return text.slice(0, r[1]) + '\n' + bloc + text.slice(r[1]);
    return text.replace(/(<main\b[^>]*>)/, `$1\n${bloc}`);
  });
  /* bloc final abans de tancar el contingut */
  h = posaBloc(h, 'FINAL', blocFinal(p), (text, bloc) => {
    const k = text.lastIndexOf('</main>');
    return k >= 0 ? text.slice(0, k) + bloc + '\n' + text.slice(k) : text;
  });
  if (!h.includes('entrada-final.css')) h = h.replace('</head>', '<link rel="stylesheet" href="../assets/css/entrada-final.css?v=20261018b">\n</head>');
  if (!/<\/body>/i.test(h)) h = h.replace(/\s*$/, '\n</body>\n</html>\n');   // algun article antic no tancava el document
  if (!h.includes('entrada.js')) h = h.replace(/<\/body>(?![\s\S]*<\/body>)/, '<script src="../assets/js/newsletter-form.js?v=20261017"></script>\n<script src="../assets/js/entrada.js?v=20261017"></script>\n</body>');
  if (crlf) h = h.replace(/\n/g, '\r\n');
  if (h !== original) { articlesCanviats++; escriu(f, h); }
}

console.log(`\nFet${DRY ? ' (simulació)' : ''}: blog.html (${UNITATS.length} targetes), blog-publicats.json, feed.xml (${publicats.length}), sitemap.xml (${altres.length} pàgines + ${entrades.length} entrades), ${articlesCanviats} articles actualitzats.`);
/* Guia per temes (pages/gastronomia-tarragona.html): mateixos articles publicats */
if (!DRY) {
  try { require('./genera-guia.js'); }
  catch (e) { console.log('ATENCIÓ: la guia no s\'ha pogut actualitzar: ' + e.message); }
}
if (!DRY) console.log('Puja per FileZilla: pages/blog.html, pages/gastronomia-tarragona.html, data/blog-posts.json, data/blog-publicats.json, feed.xml, sitemap.xml, index.html (si ha canviat) i els articles actualitzats (entrades/).');
