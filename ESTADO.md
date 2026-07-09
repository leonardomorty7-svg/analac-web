# Estado del proyecto analac-web
Fecha: 9 julio 2026

## Deploy a Vercel: RESUELTO ✓ (desde el 7 julio)
URL producción: https://analac-web.vercel.app

El detalle completo del troubleshooting de deploy (migraciones de Supabase, `turbo.json`, Node version en Vercel) quedó documentado en el historial de git — ver commits `78618d7`, `ac60b7f` y el resto de esa sesión. Ese tema ya está cerrado, no hace falta retomarlo salvo que vuelva a fallar un deploy.

## Sesión de hoy (9 julio): mejoras visuales en Analac, hechas con Claude en vez de Antigravity
A partir de hoy el usuario decidió seguir trabajando el frontend directamente conmigo (ya no aplica la restricción previa de "no tocar apps//frontend" — esa restricción era de una sesión anterior con otra herramienta). Cambios hechos, todos ya commiteados en local (**faltaba hacer push al cierre de la sesión** — confirmar con `git status` / `git log origin/main..HEAD`):

1. **`56f5736`** — Carrusel de scroll-hijack "Nodos de la Red" (`/asociados-y-aliados`): tarjetas en abanico controladas por scroll, estilo Apple. Implementado en `apps/web/src/pages/asociados-y-aliados/index.astro`.
2. **`af26cbd`** — Rediseño de "Ciencia Láctea" (home): pasó de 1 tarjeta grande + 2 chicas a 3 tarjetas iguales, con firma de autor (avatar circular "AN" + "Equipo Técnico ANALAC"). Componente: `apps/web/src/components/CienciaLacteaSection.astro`.
3. **`ac8e438`** — Tarjetas de recetas (home, sección "Consumo Lácteo"): se agregó texto descriptivo bajo cada título y se mejoró el hover (elevación, glow verde, zoom de imagen). `apps/web/src/components/ConsumoSection.astro`.
4. **`2296a6d`** — Página `/noticias`: se agregó la sección "Ciencia Láctea" antes del footer y se eliminó el bloque "Archivo de Prensa / Actualidad y Análisis" que quedaba vacío (sin noticias publicadas en Supabase todavía).
5. **`ba4996c`** — Sección "Datos Territoriales" (`/informacion-sectorial`): pasó de placeholder genérico a un mapa real de Colombia (SVG con 33 departamentos, provisto por el cliente, guardado en `apps/web/src/assets/mapa-colombia.svg`) con pines pulsantes, fondo oscuro estilo "Vitrina Digital", botón "Ver Territorios →" que lleva a `/afiliate` con nota "Disponible solo para afiliados".
6. **`38423a5`** — Nav global: se agregó una bandera de Colombia junto a "Pagos" en la franja superior, y se corrigió que esa franja, al hacer scroll, tomaba el mismo verde que el botón "Hazte afiliado" y lo hacía ilegible.

### Patrón de diseño establecido (para mantener consistencia en próximas secciones)
Cuando una sección necesita sentirse "premium": fondo oscuro casi negro (`#040a05`), glow radial verde (`rgba(109,181,109,0.12-0.22)`) + grilla sutil de 60px enmascarada con radial-gradient — es el mismo tratamiento que ya tenía "Vitrina Digital" en el home, y ahora se reutilizó en "Nodos de la Red" y "Datos Territoriales". Verde de acento: `#6db56d` / `var(--c-green)`.

## Cómo se hace push (sin credenciales git en este entorno)
Este Mac no tiene credenciales de git para GitHub en el entorno de Claude Code. El camino que funciona: abrir **GitHub Desktop** (ya autenticado) y darle "Push origin" ahí, cada vez que se pide guardar.

## Para retomar mañana
```
cd /Users/andres/Documents/analac-web
git status
git log --oneline -10
```
1. Verificar si ya se hizo push de los commits de hoy (`38423a5` es el más reciente); si no, abrir GitHub Desktop y darle "Push origin".
2. El servidor de Astro dev (`pnpm dev`, puerto 4321) puede haber quedado corriendo desde ayer — revisar antes de levantar uno nuevo.
3. Dashboard Vercel: vercel.com/andres-projects-f33d3017/analac-web
4. Repo: github.com/leonardomorty7-svg/analac-web
