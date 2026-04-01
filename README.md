# Gourmets de Tarragona — Web

Web estàtica bilingüe (ES / CA) de l'Associació Gastronòmica Gourmets de Tarragona.

## Estructura

```
gourmets-tarragona/
├── index.html                    ← Pàgina principal (home)
├── assets/
│   ├── css/
│   │   ├── variables.css         ← Tokens, reset, botons, utilitats
│   │   ├── nav.css               ← Navegació desktop + mòbil
│   │   ├── hero.css              ← Hero + strip
│   │   └── seccions.css          ← Seccions home + footer
│   ├── js/
│   │   ├── i18n.js               ← Sistema de traducció ES/CA
│   │   └── main.js               ← Nav scroll, hamburger, reveal
│   └── img/                      ← Imatges locals (logo, hero, premis...)
├── pages/
│   ├── associacio.html
│   ├── restaurants.html
│   ├── premis.html
│   ├── esdeveniments.html
│   ├── blog.html
│   └── contacte.html
└── entrades/
    ├── kema-cronica-2026.html
    └── kema-previa-2026.html
```

## Sistema de traducció (i18n)

Totes les cadenes de text estan al fitxer `assets/js/i18n.js`.
Per traduir un element HTML s'afegeix `data-i18n="clau"`:

```html
<p data-i18n="hero_sub"></p>
```

Per canviar la llengua des de JS:
```js
setLang('ca'); // o setLang('es')
```

La llengua es guarda a `localStorage` i persisteix entre pàgines.

## Afegir una nova entrada de restaurant

1. Duplica `entrades/kema-cronica-2026.html`
2. Reanomena: `entrades/nom-restaurant-any.html`
3. Edita hero, contingut, menú i tancament
4. Afegeix la card a `pages/restaurants.html` i a `index.html#recorregut`
5. Afegeix les traduccions ES/CA noves a `assets/js/i18n.js`

## Imatges locals (`assets/img/`)

| Fitxer           | Ús                        |
|-----------------|---------------------------|
| `logo.png`      | Logo nav + footer         |
| `hero.jpg`      | Foto de fons del hero     |
| `gastronia.png` | Trofeu Gastronía          |
| `bacus.png`     | Premi Bacus               |

Mentre no hi hagi imatges locals, s'usen les URLs de gourmetsdetarragona.com i Unsplash.

## GitHub Pages

1. Puja el projecte a un repositori GitHub
2. **Settings → Pages → Branch: main / folder: / (root)**
3. El lloc estarà a `https://[usuari].github.io/[repositori]/`
