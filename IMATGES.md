# Guia d'imatges — Gourmets de Tarragona

## ⚠️ Abans de cada pujada amb fotos o pàgines noves

```
node tools/optimiza-imatges.js --dry   # mira què faria
node tools/optimiza-imatges.js         # ho aplica
```

- Comprimeix les fotos noves (màx. 1600 px). No recomprimeix mai les que ja ha fet (registre a `tools/imatges-optimitzades.json`).
- Crea les miniatures de les targetes a `assets/img/_thumbs/` (640 px, WebP): blog, "També et pot interessar" i blog de la home.
- Posa `loading="lazy"` a les imatges noves i canvia `logo.png` per `logo-160.webp`.
- Requereix sharp: `npm i -g sharp-cli`.
- Noms de fitxer **sense espais** (fes servir guions): `sala-taula.jpg`, no `sala taula.jpg`.
- Comprova que la foto és de veritat una imatge: `cine-gastronomia-mesa.jpg` era una pàgina web desada amb extensió .jpg.
- Si s'afegeix una icona Font Awesome nova (`<i class="fa fa-...">`), regenerar `assets/css/icons.css` amb `tools/make-icons.js`.
- No enllaçar mai Google Fonts, Font Awesome CDN ni imatges d'Unsplash: tot es serveix des del propi web.

Totes les imatges van a la carpeta `assets/img/`.
Els noms han de ser **exactament** els que apareixen aquí.

---

## Imatges que has de pujar tu (del teu WordPress)

### Logos i elements de marca
| Fitxer destí | URL original al WordPress | On s'usa |
|---|---|---|
| `assets/img/logo.png` | `/wp-content/uploads/2025/05/cropped-logo_gourmets_blau_sin_fondo-3-300x296.png` | Nav + footer |
| `assets/img/logo-blanc.png` | Mateixa imatge (versió blanca si en tens) | Footer sobre fons fosc |
| `assets/img/gastronia.png` | `/wp-content/uploads/2025/12/Gastronia_1.png` | Secció premis |
| `assets/img/bacus.png` | `/wp-content/uploads/2025/12/Gastronia_2.png` | Secció premis |

### Fotos del Kema (crònica)
Posa-les totes a la subcarpeta `assets/img/kema/`

| Fitxer destí | URL original al WordPress |
|---|---|
| `assets/img/kema/hero.jpg` | `/wp-content/uploads/2026/02/DSC_8154-Mejorado-NR-Mediana-1024x740-1.jpg` |
| `assets/img/kema/obertura-1.jpg` | `/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-05-at-23.52.02-1-768x1024.jpeg` |
| `assets/img/kema/obertura-2.jpg` | `/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-05-at-23.52.02-2-768x1024.jpeg` |
| `assets/img/kema/obertura-3.jpg` | `/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-05-at-23.52.02-768x1024.jpeg` |
| `assets/img/kema/intermezzo-1.jpg` | `/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-05-at-23.52.03-1-768x1024.jpeg` |
| `assets/img/kema/intermezzo-2.jpg` | `/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-05-at-23.52.03-768x1024.jpeg` |
| `assets/img/kema/aries-1.jpg` | `/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-05-at-23.39.18-771x1024.jpeg` |
| `assets/img/kema/aries-2.jpg` | `/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-05-at-23.52.04-768x1024.jpeg` |
| `assets/img/kema/aries-3.jpg` | `/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-05-at-23.52.05-768x1024.jpeg` |
| `assets/img/kema/aries-4.jpg` | `/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-05-at-23.52.07-1-768x1024.jpeg` |
| `assets/img/kema/ribEye.jpg` | `/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-05-at-23.52.07-2.jpeg` |
| `assets/img/kema/prefinale-1.jpg` | `/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-05-at-23.52.07-4-768x1024.jpeg` |
| `assets/img/kema/prefinale-2.jpg` | `/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-05-at-23.52.07-3-768x1024.jpeg` |
| `assets/img/kema/sala.jpg` | `/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-05-at-23.38.55-1-771x1024.jpeg` |
| `assets/img/kema/grup.jpg` | `/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-05-at-23.57.53.jpeg` |
| `assets/img/kema/exterior.jpg` | `/wp-content/uploads/2026/02/DSC_8154-Mejorado-NR-Mediana-1024x740-1.jpg` |

---

## Hero de la home (foto pròpia)

| Fitxer | Origen | Notes |
|---|---|---|
| `assets/img/hero.webp` | Gala Premis 2025 a Vermuts Rofes (Reus) · `Desktop\Gourmets\Entrega Premis 2025\instagram todos\WhatsApp Image 2026-01-31 at 08.04.19 (5).jpeg` | 1920 px, ordinador |
| `assets/img/hero-mobile.webp` | Mateixa foto, retall vertical central (920×1536 → 800 px) | Mòbil (≤ 680 px) |

Si apareix l'original de més qualitat (no WhatsApp), regenerar amb sharp i mantenir els mateixos noms.

---

## Capçaleres i imatges generals (totes pròpies, oct. 2026)

Ja no hi ha cap imatge d'Unsplash a la web. Les antigues (`hero.jpg`, `about.jpg`, `event-*.jpg`) s'han eliminat; es poden recuperar de l'historial de git.

| Fitxer | Origen | On s'usa |
|---|---|---|
| `assets/img/og-gourmets.jpg` | Retall 1200×630 de la gala Premis 2025 (Vermuts Rofes) | Imatge en compartir: home, blog, restaurants, esdeveniments… |
| `assets/img/about/hero-associacio.jpg` | Retall horitzontal de `lesdunes/cronica/sala-taula-imperial.jpg` (socis a la taula llarga) | Capçalera de l'Associació, article "Qué som", targetes del blog |
| `assets/img/pages/contacte-nautic.jpg` | Saló del Club Nàutic, sopar d'estiu 2026 (amb el roll-up GT) | Capçalera de Contacte |
| `assets/img/galliner/cronica/sala-parada.jpg` | Crònica El Galliner | Capçalera de Restaurants |
| `assets/img/lesdunes/cronica/vinos-maridatge.jpg` | Crònica Les Dunes | Capçalera de Newsletter |
| `assets/img/brumma/cronica/sala-cena.jpg` | Crònica Brumma | Home, secció "Qui som" |
| `assets/img/brumma/cronica/vinos.jpg` | Crònica Brumma (De Muller, DO Tarragona) | Targeta "Tast de vins DO Tarragona" (home, esdeveniments, newsletter) |
| `assets/img/santjordi/santjordi-cuinem.jpg` | Portada de llibre de l'article | Capçalera i imatge per compartir de Sant Jordi 2026 |

---

## Estructura final de la carpeta

```
assets/img/
├── logo.png
├── logo-blanc.png        (opcional)
├── gastronia.png
├── bacus.png
├── hero.webp / hero-mobile.webp
├── og-gourmets.jpg
├── pages/
└── kema/
    ├── hero.jpg
    ├── exterior.jpg
    ├── obertura-1.jpg
    ├── obertura-2.jpg
    ├── obertura-3.jpg
    ├── intermezzo-1.jpg
    ├── intermezzo-2.jpg
    ├── aries-1.jpg
    ├── aries-2.jpg
    ├── aries-3.jpg
    ├── aries-4.jpg
    ├── ribEye.jpg
    ├── prefinale-1.jpg
    ├── prefinale-2.jpg
    ├── sala.jpg
    └── grup.jpg
```
