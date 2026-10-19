# Sistema de diseño · Gourmets de Tarragona

Referencia única para cualquier cambio visual de la web. Antes de tocar diseño, consultar este documento.
Si una página necesita algo que aquí no existe, se añade aquí primero y luego se usa.

- **Estilo:** editorial de lujo discreto (revista gastronómica). Recto, sobrio, mucho aire, fotos reales.
- **Fuente de verdad en código:** `assets/css/variables.css` (tokens) + `assets/css/entrada-final.css` (artículos).
- **Nunca:** imágenes IA, glassmorphism, degradados de colores, emojis como iconos, CDNs externos.

---

## 1. Color

| Token | Valor | Uso |
|---|---|---|
| `--navy` | `#1B3A6B` | Color principal: titulares de sección, botón principal, enlaces |
| `--navy-dark` | `#122850` | Fondos oscuros (bandas, newsletter), títulos grandes |
| `--navy-ink` | `#0b1626` | Azul casi negro: hero, manifiesto, pie, avisos flotantes |
| `--gold` | `#b8924a` | **Solo sobre fondo oscuro** o como detalle (líneas, bordes, iconos grandes) |
| `--gold-light` | `#d4a96a` | Texto dorado sobre azul marino |
| `--gold-text` | `#8A6A2E` | **Texto dorado sobre fondo claro** (blanco o crema) |
| `--cream` | `#F8F4EC` | Fondo de secciones alternas |
| `--white` | `#fff` | Fondo base |
| `--text` | `#2C2C2C` | Texto general |
| `--muted` | `#6B6B6B` | Texto secundario (fechas, pies de foto, ayudas). El gris más claro permitido |
| `--border` | `#E2D9C8` | Bordes y separadores |

### Combinaciones permitidas (contraste mínimo 4,5:1)

| Texto \ Fondo | Blanco | Crema | Azul marino |
|---|---|---|---|
| `--text` | ✅ 13:1 | ✅ 12:1 | — |
| `--navy` | ✅ 11:1 | ✅ 10:1 | — |
| `--muted` | ✅ 5,3:1 | ✅ 4,9:1 | ❌ |
| `--gold-text` | ✅ 5:1 | ✅ 4,6:1 | ❌ |
| `--gold` | ❌ 2,9:1 | ❌ 2,6:1 | ✅ 5:1 |
| `--gold-light` | ❌ | ❌ | ✅ 6,7:1 |
| Blanco | — | — | ✅ 11:1 |

### Reglas
- **Dorado sobre claro → siempre `--gold-text`.** `--gold` como texto solo sobre oscuro.
- **Botón dorado → texto `--navy-dark`**, nunca blanco.
- **Prohibidos los grises claros** (`#888`, `#999`, `#aaa`…) para texto: usar `--muted`.
- **Sin hexadecimales sueltos** en páginas: usar siempre el token. Excepciones: colores de marca de terceros (WhatsApp, Facebook) solo en sus propios iconos, y el acento «vino» del Premio Bacus en Premios (`#2a1d1f` fondo, `#e2a9b4` etiqueta sobre oscuro).
- Blancos con transparencia (`rgba(255,255,255,.75)`) se permiten sobre fondos oscuros, con mínimo `.7` para texto.

---

## 2. Tipografía

| Familia | Token | Uso |
|---|---|---|
| **Playfair Display** | `--font-serif` | Títulos, citas, cifras destacadas |
| **Lato** (300 · 400 · 700) | `--font-body` | Todo el texto, etiquetas, botones |

Decidido el 19/10/2026 tras comparar con Inter: **se mantiene Lato** (más cálida y editorial, ocupa menos líneas).
Ambas servidas desde el propio servidor (`assets/fonts/`). Jost existe pero no se usa en páginas nuevas.

### Escala (9 niveles)

| Token | Escritorio | Móvil | Uso |
|---|---|---|---|
| `--fs-xs` | 12 px · .75rem | 12 px | Etiquetas en mayúsculas, botones, menú |
| `--fs-sm` | 14 px · .875rem | 13 px | Fechas, pies de foto, metadatos |
| `--fs-base` | 16 px · 1rem | 15 px | Texto de interfaz, tarjetas |
| `--fs-md` | 18 px · 1.125rem | 17 px | Texto de artículo |
| `--fs-lg` | 22 px · 1.375rem | 19 px | Citas, títulos de tarjeta |
| `--fs-xl` | 28 px · 1.75rem | 24 px | H2 de artículo y secciones |
| `--fs-2xl` | 40 px · 2.5rem | 28 px | Títulos de sección (máximo del clamp) |
| `--fs-3xl` | 48 px · 3rem | 40 px | H1 de página, mínimo del hero |
| `--fs-4xl` | 72 px · 4.5rem | 48 px | Hero de portada |

Los niveles grandes pueden ser fluidos con `clamp(móvil, …, escritorio)` usando exactamente esos extremos.

### Reglas
- Interlineado: texto **1.6–1.75**; títulos **1.1–1.25**.
- Ancho de lectura: máximo **68ch** (65–75 caracteres por línea).
- Pesos: 400 texto, 700 etiquetas/botones/negritas; Playfair 700 títulos, 400 cursiva para énfasis.
- Mayúsculas solo en etiquetas y botones, siempre con espaciado de letra.

### Espaciado de letra (4 valores)

| Token | Valor | Uso |
|---|---|---|
| `--ls-tight` | `-.01em` | Títulos grandes de Playfair |
| `--ls-normal` | `0` | Texto |
| `--ls-wide` | `.12em` | Botones, etiquetas cortas |
| `--ls-wider` | `.2em` | Etiquetas de sección en mayúsculas |

---

## 3. Espaciado (ritmo de 8 px)

| Token | Valor |
|---|---|
| `--sp-1` | 8 px |
| `--sp-2` | 16 px |
| `--sp-3` | 24 px |
| `--sp-4` | 32 px |
| `--sp-6` | 48 px |
| `--sp-8` | 64 px |
| `--sp-12` | 96 px |

- Separación entre secciones: `--sp-12` escritorio, `--sp-8` móvil.
- Margen lateral: 4 % (mínimo 16 px en móvil). Ancho máximo: `--max` 1280 px.
- Se permite 4 px para ajustes finos (iconos, bordes).

---

## 4. Superficies

| Token | Valor | Uso |
|---|---|---|
| `--shadow-sm` | `0 2px 12px rgba(27,58,107,.07)` | Tarjetas en reposo |
| `--shadow-md` | `0 8px 28px rgba(27,58,107,.12)` | Tarjetas al pasar el ratón, menús |
| `--shadow-lg` | `0 14px 40px rgba(27,58,107,.16)` | Ventanas emergentes, visor de fotos |

- **Esquinas:** rectas (`0`) en todo. Solo `50%` para elementos circulares (avatares, botones redondos). Se eliminan 2/3/4/5/10/12 px.
- **Bordes:** 1 px `--border`. Línea dorada de 3 px solo como acento (citas, separadores de sección).

---

## 5. Movimiento

| Token | Valor | Uso |
|---|---|---|
| `--dur-fast` | 150 ms | Color, opacidad (hover de enlaces) |
| `--dur` | 250 ms | Botones, tarjetas, menús |
| `--dur-slow` | 400 ms | Zoom de fotos, visor, ventanas |
| `--dur-reveal` | 600 ms | Entradas de sección al hacer scroll (ritmo pausado de revista) |
| `--ease-out` | `cubic-bezier(0.23,1,0.32,1)` | Todo lo que entra |
| `--ease-in-out` | `cubic-bezier(0.77,0,0.175,1)` | Desplazamientos |

- Animar solo `transform` y `opacity`.
- Siempre respetar `prefers-reduced-motion`.
- Las salidas, más rápidas que las entradas.

---

## 6. Componentes base

| Componente | Especificación |
|---|---|
| **Botón principal** | Fondo `--navy`, texto blanco, `--fs-xs` 700 `--ls-wide` mayúsculas, padding 14×26, alto mínimo 44 px |
| **Botón dorado** | Fondo `--gold`, texto `--navy-dark`. Solo sobre fondo oscuro |
| **Botón contorno** | Borde 1 px `--navy`, texto `--navy`; hover fondo `--navy` texto blanco |
| **Etiqueta de sección** | `--fs-xs` 700 `--ls-wider` mayúsculas, `--gold-text` sobre claro / `--gold` sobre oscuro |
| **Tarjeta** | Fondo blanco, `--shadow-sm`, esquinas rectas, foto 16:9 o 4:3; hover `--shadow-md` + `translateY(-4px)` |
| **Enlace en texto** | `--navy`, subrayado 1 px dorado; hover subrayado `--navy` |
| **Campo de formulario** | Etiqueta visible encima, borde `--border`, alto ≥ 44 px, error debajo en texto |

---

## 7. Accesibilidad (obligatorio)

- Contraste ≥ 4,5:1 (texto grande ≥ 3:1). Ver tabla del punto 1.
- **Foco visible:** `outline: 2px solid var(--gold); outline-offset: 3px` sobre fondo oscuro; `--navy` sobre fondo claro. Nunca `outline: none` sin sustituto.
- Zonas táctiles ≥ 44×44 px y ≥ 8 px entre ellas.
- Texto alternativo en todas las fotos con contenido; `alt=""` en las decorativas.
- Jerarquía de títulos sin saltos (h1 → h2 → h3).

---

## 8. Imágenes

- Solo fotos reales. Fotos de restaurantes y Michelin: solo en su artículo.
- WebP, `width`/`height` declarados, `loading="lazy"` salvo la principal (`fetchpriority="high"`).
- Antes de subir: `node tools/optimiza-imatges.js`.

---

## Estado de aplicación

| Paso | Estado |
|---|---|
| 1. Este documento | ✅ 19/10/2026 |
| 2. Corrección de contraste (dorado, botones, grises) | ✅ 19/10/2026 · 35 archivos. Los adornos «· · ·» (.e-sep) se quedan dorados a propósito |
| 3. Tokens en el código, página por página | En curso · ✅ Portada + CSS comunes (nav, hero, seccions, variables) 19/10/2026 |
