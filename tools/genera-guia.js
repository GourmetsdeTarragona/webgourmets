#!/usr/bin/env node
/* ============================================================
   genera-guia.js — Gourmets de Tarragona
   Actualitza pages/gastronomia-tarragona.html (guia per temes) a partir de
   data/blog-posts.json, només amb els articles JA PUBLICATS
   (data/blog-publicats.json). Els programats no hi surten fins al seu dia.

   Només toca dues zones de la pàgina:
     · entre <!-- GUIA:AUTO:INICI --> i <!-- GUIA:AUTO:FI -->  (índex i llistes)
     · el bloc JSON-LD CollectionPage (llista d'articles per a Google)
   La resta (capçalera, textos, newsletter) es pot editar a mà sense perill.

   S'executa sol al final de tools/publica-blog.js.
   Ús manual:  node tools/genera-guia.js   [--dry]
   ============================================================ */
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..');
const PAGE = 'pages/gastronomia-tarragona.html';
const DOMINI = 'https://www.gourmetsdetarragona.com';
const DRY = process.argv.includes('--dry');

/* Grups de la guia. Cada article va al grup de la seva categoria, llevat que
   tingui restaurant (sempre «restaurantes») o sigui a FORCA. */
const GRUPS = [
  { id: 'restaurantes', es: 'Restaurantes que hemos visitado', ca: 'Restaurants que hem visitat',
    introEs: 'Cada visita tiene una previa, antes de la cena, y una crónica con el menú plato a plato.',
    introCa: 'Cada visita té una prèvia, abans del sopar, i una crònica amb el menú plat a plat.' },
  { id: 'producto', es: 'Producto del territorio', ca: 'Producte del territori',
    introEs: 'De la salsa que comían en Tarraco a la gamba del Serrallo: lo que se cultiva, se pesca y se cocina en la provincia.',
    introCa: 'De la salsa que menjaven a Tàrraco a la gamba del Serrallo: el que es cultiva, es pesca i es cuina a la província.' },
  { id: 'vinos', es: 'Vinos y bebidas', ca: 'Vins i begudes',
    introEs: 'Las denominaciones de origen de la provincia, sus bodegas y los vermuts y licores que nacieron aquí.',
    introCa: 'Les denominacions d\u2019origen de la província, els seus cellers i els vermuts i licors que van néixer aquí.' },
  { id: 'cultura', es: 'Cultura, premios y asociación', ca: 'Cultura, premis i associació',
    introEs: 'Quiénes somos, cómo funcionan los premios Gastronia y Bacus y otras historias de mesa.',
    introCa: 'Qui som, com funcionen els premis Gastronia i Bacus i altres històries de taula.' },
];
const PER_CATEGORIA = { curiositats: 'producto', vi: 'vinos', cultura: 'cultura', noticia: 'cultura', event: 'cultura', previa: 'restaurantes', cronica: 'restaurantes' };
/* Articles que per tema encaixen millor en un altre grup que el de la categoria */
const FORCA = {
  'vermut-reus-capital': 'vinos',
  'masclet-reus-misericordia': 'vinos',
  'chartreuse-tarragona': 'vinos',
  'catedrals-del-vi': 'vinos',
};

const llegeix = (f) => fs.readFileSync(path.join(REPO, f), 'utf8');
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const posts = JSON.parse(llegeix('data/blog-posts.json'));
const pubRaw = JSON.parse(llegeix('data/blog-publicats.json'));
const publicats = new Set((Array.isArray(pubRaw) ? pubRaw : Object.values(pubRaw)).map((p) => p.slug));
const existeix = (slug) => fs.existsSync(path.join(REPO, 'entrades', slug + '.html'));

const visibles = posts
  .filter((p) => publicats.has(p.slug) && existeix(p.slug))
  .sort((a, b) => b.data.localeCompare(a.data) || a.slug.localeCompare(b.slug));

const grupDe = (p) => FORCA[p.slug] || (p.restaurant ? 'restaurantes' : PER_CATEGORIA[p.categoria] || 'cultura');
const perGrup = Object.fromEntries(GRUPS.map((g) => [g.id, []]));
visibles.forEach((p) => perGrup[grupDe(p)].push(p));

const item = (p) => `      <li class="guia-item">
        <a href="../entrades/${p.slug}.html" class="guia-link t" data-es="${esc(p.titol_es)}" data-ca="${esc(p.titol_ca)}">${esc(p.titol_es)}</a>
        <p class="guia-resum t" data-es="${esc(p.resum_es)}" data-ca="${esc(p.resum_ca)}">${esc(p.resum_es)}</p>
      </li>`;

const toc = GRUPS.map((g) => `<a href="#${g.id}" class="t" data-es="${esc(g.es)}" data-ca="${esc(g.ca)}">${esc(g.es)}</a>`).join('\n    ');
const seccions = GRUPS.filter((g) => perGrup[g.id].length).map((g) => `  <section class="guia-sec" id="${g.id}">
    <h2 class="guia-h2 t" data-es="${esc(g.es)}" data-ca="${esc(g.ca)}">${esc(g.es)}</h2>
    <p class="guia-intro t" data-es="${esc(g.introEs)}" data-ca="${esc(g.introCa)}">${esc(g.introEs)}</p>
    <ul class="guia-list">
${perGrup[g.id].map(item).join('\n')}
    </ul>
  </section>`).join('\n\n');

const auto = `<!-- GUIA:AUTO:INICI · generat per tools/genera-guia.js, no editar a mà -->
  <nav class="guia-toc" aria-label="Temas de la guía">
    ${toc}
  </nav>

${seccions}
  <!-- GUIA:AUTO:FI -->`;

let html = llegeix(PAGE);
const crlf = html.includes('\r\n');
html = html.replace(/\r\n/g, '\n');

if (html.includes('<!-- GUIA:AUTO:INICI')) {
  html = html.replace(/<!-- GUIA:AUTO:INICI[\s\S]*?<!-- GUIA:AUTO:FI -->/, auto);
} else {
  /* Primera vegada: de l'índex fins a la darrera secció abans del bloc newsletter */
  const ini = html.indexOf('<nav class="guia-toc"');
  const fi = html.indexOf('<div class="guia-cta">');
  if (ini < 0 || fi < 0) throw new Error('No trobo la zona de la guia (guia-toc / guia-cta) a ' + PAGE);
  html = html.slice(0, ini) + auto + '\n\n  ' + html.slice(fi);
}

const ld = {
  '@context': 'https://schema.org', '@type': 'CollectionPage',
  name: (html.match(/<title>([^<]*)<\/title>/) || [])[1] || 'Gastronomía de Tarragona',
  description: (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '',
  url: `${DOMINI}/${PAGE}`, inLanguage: 'es',
  isPartOf: { '@type': 'WebSite', name: 'Gourmets de Tarragona', url: DOMINI + '/' },
  about: { '@type': 'Thing', name: 'Gastronomía de la provincia de Tarragona' },
  mainEntity: {
    '@type': 'ItemList', numberOfItems: visibles.length,
    itemListElement: GRUPS.flatMap((g) => perGrup[g.id]).map((p, i) => ({ '@type': 'ListItem', position: i + 1, url: `${DOMINI}/entrades/${p.slug}.html`, name: p.titol_es })),
  },
};
const ldRe = /<script type="application\/ld\+json">\{"@context":"https:\/\/schema\.org","@type":"CollectionPage"[\s\S]*?<\/script>/;
if (!ldRe.test(html)) throw new Error('No trobo el JSON-LD CollectionPage a ' + PAGE);
html = html.replace(ldRe, `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`);

if (crlf) html = html.replace(/\n/g, '\r\n');
if (!DRY) fs.writeFileSync(path.join(REPO, PAGE), html);

const resum = GRUPS.map((g) => `${g.id} ${perGrup[g.id].length}`).join(', ');
console.log(`Guia${DRY ? ' (simulació)' : ''}: ${visibles.length} articles publicats (${resum}) → ${PAGE}`);
