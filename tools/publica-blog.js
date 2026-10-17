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

console.log(`\nFet${DRY ? ' (simulació)' : ''}: blog.html (${UNITATS.length} targetes), blog-publicats.json, feed.xml (${publicats.length}), sitemap.xml (${altres.length} pàgines + ${entrades.length} entrades).`);
if (!DRY) console.log('Puja per FileZilla: pages/blog.html, data/blog-posts.json, data/blog-publicats.json, feed.xml, sitemap.xml (i l\'article nou amb les seves imatges).');
