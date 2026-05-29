# Newsletter · Gourmets de Tarragona

Sistema de newsletter mensual gestionado con Brevo.

## Estructura de carpetas

```
newsletter/
  README.md        → este archivo
  PLANTILLA.md     → template reutilizable para cada número
  borradores/      → drafts en preparación
  enviados/        → números ya enviados (mover aquí tras el envío)
```

## Plataforma

**Brevo** (brevo.com) — cuenta: gourmetsdetarragona@gourmetsdetarragona.com
- Lista de suscriptores: *Newsletter Gourmets de Tarragona*
- Formulario de suscripción: incrustado en `pages/blog.html`
- Doble opt-in activado (RGPD)

## Flujo de trabajo

1. **Preparar el borrador** — usar `PLANTILLA.md`, guardar en `borradores/`
2. **Revisar** — enviar prueba desde Brevo al email propio
3. **Enviar** — desde Brevo: Marketing → Campañas → Crear campaña de email
4. **Archivar** — mover el archivo de `borradores/` a `enviados/`

## Frecuencia recomendada

Mensual. Mejor día: **jueves o viernes a las 19h**.

## Naming de archivos

`numXX-mesmañ.md` → ejemplo: `num01-mayo2026.md`, `num02-junio2026.md`

## Contenido recomendado por número

- 1 artículo destacado (el más potente del mes)
- 1-2 artículos secundarios
- Link al blog completo
- Intro editorial breve con voz propia (no genérica)
