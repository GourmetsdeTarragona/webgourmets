// ============================================================
// OPTIMITZA IMATGES — Gourmets de Tarragona
// Executar ABANS de cada pujada que afegeixi fotos o pàgines noves:
//
//   node tools/optimiza-imatges.js --dry   (només informa, no toca res)
//   node tools/optimiza-imatges.js         (aplica)
//
// Què fa (és idempotent: es pot executar tantes vegades com calgui):
//  1. Comprimeix les fotos d'assets/img (JPG/WebP) a màx. 1600 px i qualitat web.
//     Guarda un registre (tools/imatges-optimitzades.json) per no recomprimir mai
//     dues vegades la mateixa foto (perdria qualitat).
//  2. Crea miniatures WebP de 640 px a assets/img/_thumbs/ per a les targetes:
//     blog.html, "També et pot interessar" de les entrades i el blog de la home (data/blog-posts.json).
//  3. Retoca l'HTML: targetes → miniatures, logo.png → logo-160.webp,
//     i loading="lazy" a les imatges que no el tinguin (excepte logo i imatges "hero").
// Requereix sharp: npm i -g sharp-cli
// ============================================================
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

const DRY = process.argv.includes('--dry');
const REPO = path.resolve(__dirname, '..');
const IMG = path.join(REPO, 'assets/img');
const THUMBS = path.join(IMG, '_thumbs');
const MANIFEST = path.join(__dirname, 'imatges-optimitzades.json');
// THUMB_W: la targeta més gran es pinta a ~520 px (destacada del blog en ordinador)
const MAX_SIDE = 1600, MIN_BYTES = 150 * 1024, THUMB_W = 640, THUMB_Q = 62;
// Ja optimitzades a mà o amb mida pensada (no tocar)
const SKIP = new Set(['hero.webp', 'hero-mobile.webp', 'og-gourmets.jpg', 'logo.png', 'logo-160.webp',
  'logo-transparent.png', 'gastronia.png', 'bacus.png']);

function loadSharp() {
  try { return require('sharp'); } catch (e) { /* prova la instal·lació global */ }
  const root = execSync('npm root -g').toString().trim();
  for (const p of [path.join(root, 'sharp'), path.join(root, 'sharp-cli', 'node_modules', 'sharp')]) {
    try { return require(p); } catch (e) { /* següent */ }
  }
  throw new Error('No trobo sharp. Instal·la-ho amb: npm i -g sharp-cli');
}
const sharp = loadSharp();
const sha1 = buf => crypto.createHash('sha1').update(buf).digest('hex');
const rel = p => path.relative(REPO, p).replace(/\\/g, '/');
const kb = n => Math.round(n / 1024) + ' KB';

function walk(dir, test, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.') || ['node_modules', 'tools', 'package'].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, test, acc); else if (test(e.name, p)) acc.push(p);
  }
  return acc;
}

// ---------- 1. Comprimir originals ----------
async function optimizeOriginals() {
  const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {};
  const files = walk(IMG, (n, p) => /\.(jpe?g|webp)$/i.test(n) && !p.includes('_thumbs') && !SKIP.has(n) && !/^favicon/.test(n));
  let before = 0, after = 0, changed = 0;
  for (const f of files) {
    const key = rel(f);
    const buf = fs.readFileSync(f);
    if (manifest[key] === sha1(buf)) continue;           // ja optimitzada
    let meta;
    try { meta = await sharp(buf).metadata(); }
    catch (e) { console.warn(`  ! format no reconegut (revisar a mà): ${key}`); continue; }
    const w = meta.orientation >= 5 ? meta.height : meta.width, h = meta.orientation >= 5 ? meta.width : meta.height;
    if (buf.length < MIN_BYTES && Math.max(w, h) <= MAX_SIDE) { manifest[key] = sha1(buf); continue; }
    let pipe = sharp(buf).rotate().resize({ width: MAX_SIDE, height: MAX_SIDE, fit: 'inside', withoutEnlargement: true });
    pipe = /\.webp$/i.test(f) ? pipe.webp({ quality: 74 }) : pipe.jpeg({ quality: 76, mozjpeg: true });
    const out = await pipe.toBuffer();
    if (out.length < buf.length * 0.9) {
      before += buf.length; after += out.length; changed++;
      console.log(`  ${key}: ${kb(buf.length)} → ${kb(out.length)}`);
      if (!DRY) fs.writeFileSync(f, out);
      manifest[key] = sha1(out);
    } else manifest[key] = sha1(buf);
  }
  if (!DRY) fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 1) + '\n');
  console.log(`1) Originals: ${changed} fotos, ${kb(before)} → ${kb(after)}`);
}

// ---------- 2 i 3. Miniatures i HTML ----------
// Noms amb espais o %20 → miniatura sense espais
const thumbRel = imgRel => 'assets/img/_thumbs/' + decodeURIComponent(imgRel).replace(/^assets\/img\//, '')
  .replace(/\s+/g, '-').replace(/\.[a-z]+$/i, '.webp');

async function makeThumb(imgRel) {
  const src = path.join(REPO, decodeURIComponent(imgRel)), dst = path.join(REPO, thumbRel(imgRel));
  if (!fs.existsSync(src)) { console.warn('  ! no existeix: ' + imgRel); return false; }
  if (fs.existsSync(dst) && fs.statSync(dst).mtimeMs >= fs.statSync(src).mtimeMs) return true;
  if (!DRY) {
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    await sharp(src).rotate().resize({ width: THUMB_W, withoutEnlargement: true }).webp({ quality: THUMB_Q }).toFile(dst);
  }
  return true;
}

async function thumbsAndHtml() {
  const wanted = new Set();
  // Blog de la home: data/blog-posts.json
  const posts = JSON.parse(fs.readFileSync(path.join(REPO, 'data/blog-posts.json'), 'utf8'));
  for (const p of (Array.isArray(posts) ? posts : posts.posts || [])) if (p.img && p.img.startsWith('assets/img/')) wanted.add(p.img);

  const pages = walk(REPO, n => n.endsWith('.html') && !n.startsWith('_'));
  let htmlChanged = 0, nThumbs = 0, nLogo = 0, nLazy = 0;
  for (const f of pages) {
    let t = fs.readFileSync(f, 'utf8');
    const orig = t;
    const P = rel(f).includes('/') ? '../' : '';
    const isBlog = rel(f) === 'pages/blog.html';
    // Targetes → miniatura (blog.html: totes les <img> de contingut; entrades: "També et pot interessar")
    const toThumb = (m, pre, src) => {
      const r = src.replace(/^\.\.\//, '');
      if (!/^assets\/img\//.test(r) || r.includes('_thumbs') || /logo/.test(r)) return m;
      wanted.add(r); nThumbs++;
      return pre + P + thumbRel(r);
    };
    if (isBlog) t = t.replace(/(<img\b[^>]*?\ssrc=")((?:\.\.\/)?assets\/img\/[^"]+)/g, toThumb);
    t = t.replace(/(class="e-tambe-card-img"[^>]*>\s*<img\b[^>]*?\ssrc=")((?:\.\.\/)?assets\/img\/[^"]+)/g, toThumb);
    // Logo gran → logo petit (només dins <img>, no a les dades estructurades)
    t = t.replace(/(<img\b[^>]*?\ssrc=")((?:\.\.\/)?assets\/img\/)logo\.png"/g, (m, a, b) => { nLogo++; return a + b + 'logo-160.webp"'; });
    // Càrrega diferida
    t = t.replace(/<img\b(?![^>]*\sloading=)([^>]*)>/g, (m, attrs) => {
      if (/logo|hero/i.test(attrs)) return m;
      nLazy++;
      return '<img loading="lazy" decoding="async"' + attrs + '>';
    });
    if (t !== orig) { htmlChanged++; if (!DRY) fs.writeFileSync(f, t); }
  }
  // Miniatures que l'HTML ja enllaça (execucions anteriors): busca la foto original corresponent
  const norm = s => s.replace(/\s+/g, '-').replace(/\.[a-z]+$/i, '').toLowerCase();
  for (const f of pages) {
    for (const m of fs.readFileSync(f, 'utf8').matchAll(/assets\/img\/_thumbs\/([^"'\s)]+)\.webp/g)) {
      const sub = m[1], dir = path.join(IMG, path.dirname(sub));
      if (!fs.existsSync(dir)) { console.warn('  ! carpeta inexistent per a la miniatura: ' + sub); continue; }
      const orig = fs.readdirSync(dir).find(n => /\.(jpe?g|png|webp)$/i.test(n) && norm(n) === norm(path.basename(sub)));
      if (orig) wanted.add(rel(path.join(dir, orig))); else console.warn('  ! sense original per a la miniatura: ' + sub);
    }
  }
  let made = 0;
  for (const r of wanted) if (await makeThumb(r)) made++;
  console.log(`2) Miniatures: ${made} (a ${THUMB_W} px, WebP)`);
  console.log(`3) HTML: ${htmlChanged} pàgines · ${nThumbs} targetes → miniatura · ${nLogo} logos · ${nLazy} imatges amb lazy`);
}

(async () => {
  console.log(DRY ? '— MODE PROVA: no es modifica res —' : '— Optimitzant —');
  await optimizeOriginals();
  await thumbsAndHtml();
})().catch(e => { console.error(e); process.exit(1); });
