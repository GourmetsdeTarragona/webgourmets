// Genera assets/css/icons.css: només les icones que fa servir el web, com a SVG (màscara CSS).
// Substitueix el CSS complet de Font Awesome (~100 KB + fonts) sense tocar l'HTML: <i class="fa fa-star"> segueix funcionant.
const fs = require('fs');
const path = require('path');
// Ús (des de l'arrel del repo):
//   npm pack @fortawesome/fontawesome-free@6.5.0 && tar -xzf fortawesome-fontawesome-free-6.5.0.tgz
//   node tools/make-icons.js package/svgs
//   (després esborra la carpeta package/ i el .tgz; no s'han de pujar)
const FA = process.argv[2] || 'package/svgs';
const repo = path.resolve(__dirname, '..');

// Noms de Font Awesome 5 que el web encara fa servir → nom actual a FA6
const ALIAS = {
  'map-marker-alt': 'location-dot', 'wine-glass-alt': 'wine-glass-empty', 'share-alt': 'share-nodes',
  'times': 'xmark', 'search': 'magnifying-glass',
};
const MODIFIERS = new Set(['solid', 'regular', 'brands', 'fw', 'lg', 'xs', 'sm', '1x', '2x', '3x', 'spin', 'pulse']);

// 1. Recollir icones usades a tots els .html i .js (excepte llibreries)
function walk(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    // package/ = el paquet de Font Awesome descomprimit; tools/ = aquest mateix script
    if (['node_modules', 'package', 'tools'].includes(e.name) || e.name.startsWith('.git')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.(html|js)$/.test(e.name) && e.name !== 'leaflet.js') acc.push(p);
  }
  return acc;
}
const used = new Map(); // nom → Set(estils)
for (const f of walk(repo)) {
  const txt = fs.readFileSync(f, 'utf8');
  for (const m of txt.matchAll(/class=["'][^"']*\bfa[a-z-]*\b[^"']*["']/g)) {
    const cls = m[0].replace(/^class=["']|["']$/g, '').split(/\s+/);
    if (!cls.some(c => /^(fa|fas|far|fab|fa-solid|fa-regular|fa-brands)$/.test(c))) continue;
    const style = cls.includes('fa-regular') || cls.includes('far') ? 'regular'
      : cls.includes('fa-brands') || cls.includes('fab') ? 'brands' : 'solid';
    for (const c of cls) {
      const n = c.startsWith('fa-') ? c.slice(3) : null;
      if (!n || MODIFIERS.has(n)) continue;
      if (!used.has(n)) used.set(n, new Set());
      used.get(n).add(style);
    }
  }
}

// 2. Generar CSS
function svgData(file) {
  const svg = fs.readFileSync(file, 'utf8').replace(/<!--[\s\S]*?-->/g, '').trim();
  const vb = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  const enc = svg.replace(/"/g, "'").replace(/</g, '%3C').replace(/>/g, '%3E').replace(/#/g, '%23');
  return { url: `url("data:image/svg+xml,${enc}")`, w: +vb[1], h: +vb[2] };
}
const rules = [];
const missing = [];
for (const [name, styles] of [...used].sort()) {
  const real = ALIAS[name] || name;
  for (const style of styles) {
    // Instagram és de "brands" encara que el posin amb la classe .fa
    const order = name === 'instagram' ? ['brands'] : [style, 'solid', 'regular', 'brands'];
    const dir = order.find(d => fs.existsSync(path.join(FA, d, real + '.svg')));
    if (!dir) { missing.push(name); continue; }
    const { url, w, h } = svgData(path.join(FA, dir, real + '.svg'));
    const sel = style === 'regular' ? `.fa-regular.fa-${name}, .far.fa-${name}` : `.fa-${name}`;
    rules.push(`${sel} { --fa-i: ${url}; --fa-w: ${(w / h).toFixed(4)}em; }`);
  }
}
const base = `/* Icones del web (subconjunt de Font Awesome Free 6.5.0, icones sota llicència CC BY 4.0 — https://fontawesome.com/license/free).
   Substitueix el CSS complet de Font Awesome. Regenerar amb make-icons.js si s'afegeixen icones noves. */
.fa, .fas, .far, .fab, .fa-solid, .fa-regular, .fa-brands {
  display: inline-block; width: var(--fa-w, 1em); height: 1em;
  vertical-align: -.125em; font-style: normal;
  background-color: currentColor;
  -webkit-mask: var(--fa-i) no-repeat center / contain;
          mask: var(--fa-i) no-repeat center / contain;
}
.fa-fw { width: 1.25em; }
`;
fs.writeFileSync(path.join(repo, 'assets/css/icons.css'), base + '\n' + rules.join('\n') + '\n');
console.log('icones:', rules.length, '· mida:', Math.round(fs.statSync(path.join(repo, 'assets/css/icons.css')).size / 1024) + ' KB');
console.log('usades:', [...used.keys()].join(', '));
if (missing.length) { console.error('FALTEN:', missing.join(', ')); process.exit(1); }
