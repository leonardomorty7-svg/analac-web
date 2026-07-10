# Estado del proyecto analac-web
Fecha: 9 julio 2026

## Deploy a Vercel: RESUELTO ✓ (desde el 7 julio)
URL producción: https://analac-web.vercel.app

El detalle completo del troubleshooting de deploy (migraciones de Supabase, `turbo.json`, Node version en Vercel) quedó documentado en el historial de git — ver commits `78618d7`, `ac60b7f` y el resto de esa sesión. Ese tema ya está cerrado, no hace falta retomarlo salvo que vuelva a fallar un deploy.

## Sesión del 9 julio: mejoras visuales en Analac, hechas con Claude en vez de Antigravity
Todos los commits de esta sesión **ya están pusheados a `origin/main`** (confirmado con `git fetch` + `git status -sb`, no hay commits pendientes de push).

1. **`56f5736`** — Carrusel de scroll-hijack "Nodos de la Red" (`/asociados-y-aliados`): tarjetas en abanico controladas por scroll, estilo Apple.
2. **`af26cbd`** — Rediseño de "Ciencia Láctea" (home): 3 tarjetas iguales con firma de autor.
3. **`ac8e438`** — Tarjetas de recetas (home, "Consumo Lácteo"): texto descriptivo + hover premium.
4. **`2296a6d`** — `/noticias`: se agregó "Ciencia Láctea" y se quitó el "Archivo de Prensa" (vacío, sin noticias en Supabase).
5. **`ba4996c`** — "Datos Territoriales" (`/informacion-sectorial`): mapa real de Colombia (SVG de 33 departamentos, provisto por el cliente, en `apps/web/src/assets/mapa-colombia.svg`) con pines pulsantes y fondo oscuro premium.
6. **`38423a5`** — Nav: bandera de Colombia junto a "Pagos" + fix de contraste de "Hazte afiliado" al hacer scroll.
7. **`d618a2d`** — "Información construida con el ecosistema" (`/informacion-sectorial`): rediseño en 3 tarjetas de icono.
8. **`8efc1fa`** — `/noticias`: se replicó el carrusel de scroll-hijack en "6 Nodos de Conocimiento" (mismo patrón que Nodos de la Red).
9. **`68aa9d1`** — `/asociados-y-aliados`: se eliminó la sección "Un solo perfil para toda la Red" (pedido del cliente).
10. **`188072d`** — Nav: se quitó la bandera junto a "Pagos" (parecía selector de idioma) y se reemplazó por una cinta diagonal de Colombia (`cinta-colombia.svg`, provista por el cliente) fija en la esquina superior izquierda del nav.
11. **`bfc8e4e`** + **`4ec8a63`** — Home "Ciencia Láctea": se convirtió la grilla de 3 tarjetas en un carrusel horizontal infinito:
    - Peek carousel full-bleed (cards llegan hasta el borde real del viewport, la última se ve cortada a la mitad, invita a seguir viendo).
    - **Auto-rotación infinita**: las tarjetas avanzan solas cada 3.5s (pedido explícito del cliente vía screenshot: "que vayan girando cada cierto tiempo, como un carrusel infinito, no importa que se repitan"). Se implementó con 3 copias del set de artículos en el DOM; cuando el scroll sale de la copia del medio, salta instantáneamente una copia hacia el lado opuesto (contenido idéntico → el salto es invisible). Se pausa al pasar el mouse por encima; los botones prev/next siguen funcionando y reinician el autoplay.
    - Este componente (`CienciaLacteaSection.astro`) se reutiliza también en `/noticias`, así que el carrusel infinito aplica ahí también automáticamente.

### Patrón de diseño establecido (para mantener consistencia en próximas secciones)
Cuando una sección necesita sentirse "premium": fondo oscuro casi negro (`#040a05`), glow radial verde (`rgba(109,181,109,0.12-0.22)`) + grilla sutil de 60px enmascarada con radial-gradient. Ya aplicado en: Vitrina Digital (home), Nodos de la Red, Datos Territoriales, Nodos de Conocimiento (noticias). Verde de acento: `#6db56d` / `var(--c-green)`.

### Patrón técnico: carrusel horizontal infinito con auto-rotación
Para reutilizar en otras secciones si el cliente lo pide: renderizar 3 copias del array de items en el track (`[...items, ...items, ...items]`), posicionar el scroll inicial en `track.scrollWidth / 3` de forma **síncrona** (no usar `requestAnimationFrame` para esto — en algunos entornos no se dispara de forma confiable), y en cada evento `scroll` (debounced ~150ms) revisar si `scrollLeft` salió del tercio del medio; si es así, saltar una copia con `scrollTo({ left, behavior: 'instant' })` (nunca asignar `scrollLeft` directamente si el contenedor tiene `scroll-behavior: smooth` en CSS, porque heredaría la animación y el "salto invisible" dejaría de ser invisible).

## Pendiente / para decidir con el usuario
Hay **6 archivos de imagen modificados sin commitear** desde antes de esta sesión, que Claude no tocó y cuyo origen no está confirmado (parecen versiones más livianas/optimizadas de las mismas fotos):
- `apps/web/public/images/colombia-dairy-bg.jpg`, `colombia-dairy-bg-v2.jpg`, `colombia-dairy-bg-v3.jpg`
- `apps/web/public/images/cta-lared-bg.jpg`, `cta-observatorio-bg.jpg`, `cta-quienes-somos-bg.jpg`

Preguntar al usuario si quiere commitearlos o descartarlos antes de seguir tocando esas imágenes.

## Cómo se hace push (sin credenciales git en este entorno)
Este Mac no tiene credenciales de git para GitHub en el entorno de Claude Code. El camino que funciona: abrir **GitHub Desktop** (ya autenticado) y darle "Push origin" ahí, cada vez que se pide guardar.

## Para retomar
```
cd /Users/andres/Documents/analac-web
git status
git log --oneline -10
```
1. Revisar los 6 archivos de imagen pendientes (sección "Pendiente" arriba) antes de tocarlos.
2. El servidor de Astro dev (`pnpm dev`, puerto 4321) puede haber quedado corriendo de una sesión anterior — revisar antes de levantar uno nuevo.
3. Dashboard Vercel: vercel.com/andres-projects-f33d3017/analac-web
4. Repo: github.com/leonardomorty7-svg/analac-web
