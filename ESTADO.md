# Estado del proyecto analac-web
Fecha: 14 julio 2026

## Deploy a Vercel: RESUELTO ✓ (desde el 7 julio)
URL producción: https://analac-web.vercel.app

El detalle completo del troubleshooting de deploy (migraciones de Supabase, `turbo.json`, Node version en Vercel) quedó documentado en el historial de git — ver commits `78618d7`, `ac60b7f` y el resto de esa sesión. Ese tema ya está cerrado, no hace falta retomarlo salvo que vuelva a fallar un deploy.

## Estado de push
**Todo lo de hoy (14 julio) está commiteado localmente pero NO pusheado todavía.** Falta abrir GitHub Desktop y darle "Push origin" (ver sección de abajo). Antes de esta sesión, todo hasta `d25b0a4` ya estaba en `origin/main`.

## Sesión del 14 julio

1. **`97831bb`** — Se recortó el relleno transparente sobrante en 18 archivos de logos de aliados (Carval, Grupo Bios, Solla, Ganasal, Genética Selecta, Lares, Nutrimixes, Ourofino, Partner, Silveragro, ANDI, Asoleche, Consejo Nacional Lácteo, Invima, SIC, Uniagraria, Universidad de La Sabana). El problema real no era que los archivos tuvieran distinto tamaño, sino que algunos traían mucho margen transparente adentro del archivo, así que a la misma altura en CSS se veían más chicos. Cada recorte se verificó visualmente uno por uno para no cortar ningún logo. Se detectaron 4 casos con "canal alfa falso" (marcado transparente pero en realidad opaco) que el primer script saltó por error y se corrigieron en una segunda pasada.
2. **`a4fd758`** — `/quienes-somos` sección "Aliados y Colaboradores" (antes "Aliados Estratégicos"):
   - Se reemplazó el panel de scrollytelling (título fijo a la izquierda que no cambiaba con el grupo mostrado a la derecha — causaba confusión real del cliente) por **pestañas clicables** con los 6 nombres de grupo (Premium, Estratégicos, Empresas Aliadas, Representación Gremial, Articulación Institucional, Academia) siempre visibles en una sola línea.
   - Título, descripción y grilla de logos del panel activo quedan centrados en el viewport.
   - Se descubrió que la clase `text-center`, usada en 7 títulos de esta página (y en ~10 páginas más del sitio), **nunca tuvo efecto real** — es una utilidad de Tailwind pero esta página carga `global.css`, que no tiene Tailwind. Se agregó la regla real (`text-align:center`) directamente en `global.css`, lo que corrige el centrado en todos esos títulos de una vez.
   - Se reafinó el diccionario `opticalScales` (multiplicadores de tamaño por logo) ahora que las imágenes ya vienen recortadas: se quitaron los ajustes que compensaban relleno que ya no existe, dejando solo los que reflejan una diferencia real de diseño (ej. DeLaval, ICA).
   - Las descripciones de cada grupo se ensancharon a 800px (antes 620px) para que ninguna pase de 2 líneas, a pedido del cliente.
3. **`a4fd758`** (mismo commit) — `/quienes-somos` sección "Ecosistema Digital ANALAC": se portó el mecanismo de **carrusel en abanico con scroll-hijack** de "Nodos de la Red" (`/asociados-y-aliados`), pero con **fondo claro/crema** en vez de oscuro (pedido explícito del cliente, para no chocar con la transición hacia la sección siguiente). En desktop (≥900px) la sección se fija y el scroll avanza las 8 tarjetas de servicio una por una en abanico, con puntos de navegación; en mobile cae a una grilla simple apilada. Mecanismo verificado con eventos de wheel simulados (avanza, respeta el límite de animación, libera el hijack correctamente al llegar a la última tarjeta).
4. **`d25b0a4`** (de la sesión anterior, confirmar que ya se revisó) — `/asociados-y-aliados` CTA final: se quitó la foto de fondo oscura, ahora usa fondo crema con texto verde oscuro/gris.

### Patrón técnico: carrusel en abanico con scroll-hijack
Nuevo patrón (adaptado de "Nodos de la Red", ahora también en "Ecosistema Digital ANALAC"). Desktop-only (`min-width:900px` + `prefers-reduced-motion:no-preference`); la sección se pone `height:100vh` y un listener de `wheel` en `window` (`passive:false`) hace `preventDefault()` mientras la sección está "pineada" (`Math.abs(rect.top) <= 100`) y traduce el `wheel` en avanzar/retroceder una tarjeta activa (`translateX` calculado para centrar la tarjeta activa, con tarjetas antes/después escaladas y rotadas para el efecto abanico). Al llegar a la primera/última tarjeta y seguir scrolleando hacia afuera, se libera el hijack y el scroll nativo continúa a la siguiente sección. En mobile el mismo track cae a una grilla CSS simple (sin JS de carrusel). Ver `apps/web/src/pages/asociados-y-aliados/index.astro` (original) y `apps/web/src/pages/quienes-somos.astro` (variante clara).

### Patrón de diseño establecido (para mantener consistencia en próximas secciones)
Variante oscura: fondo casi negro (`#040a05`), glow radial verde (`rgba(109,181,109,0.12-0.22)`) + grilla sutil de 60px enmascarada con radial-gradient. Ya aplicado en: Vitrina Digital (home), Nodos de la Red, Datos Territoriales, Nodos de Conocimiento (noticias).
Variante clara (nueva, 14 julio): mismo glow radial verde pero sobre fondo crema (`var(--c-cream)`) y grilla sutil oscura (`rgba(15,34,17,0.035)`) en vez de blanca. Usada en "Ecosistema Digital ANALAC".
Verde de acento: `#6db56d` / `var(--c-green)`.

### Patrón técnico: carrusel horizontal infinito con auto-rotación
Ya usado en Ciencia Láctea y Consumo Lácteo. Para reutilizar: renderizar 3 copias del array de items en el track (`[...items, ...items, ...items]`), posicionar el scroll inicial en `track.scrollWidth / 3` de forma **síncrona**, y en cada evento `scroll` (debounced ~150ms) revisar si `scrollLeft` salió del tercio del medio; si es así, saltar una copia con `scrollTo({ left, behavior: 'instant' })`. Para el efecto "peek" simétrico en ambos bordes: usar `scroll-snap-align: center` (no `start`) en las cards, y ancho de card en `vw` (no `%`) si el wrap del carrusel es full-bleed, para que no cambie de tamaño según el ancho del wrap.

### Fuente única de datos del equipo
`src/data/equipo.ts` — usado por `/quienes-somos`, por `AuthorSignature.astro` (firmas de blogs/noticias) y por `/preview/firmas`. Cambiar el nombre/foto/cargo de una persona ahí lo actualiza en todos lados.

## Pendiente / para decidir con el usuario
1. **Variables CSS `--color-*` nunca definidas** (`--color-text-sub`, `--color-green-main`, `--color-text-main`, `--color-bg-page`, `--color-green-dark`, `--color-green-soft`, etc.): causan que textos/colores en `quienes-somos.astro` (y probablemente otras páginas: consumo-lacteo, servicios, gobernanza, afiliate, informacion-sectorial, portal) caigan en el color por defecto en vez del color de marca real. Hay un chip de sesión pendiente para esto (`task_eb54eba0`) — falta que el usuario lo dispare o lo pida.
2. **Logo del Ministerio de Agricultura** (`Logo_Ministerio_de_Agricultura...svg.webp` en `instituciones/`) viene con el texto "Agricultura" tocando el borde izquierdo/derecho del archivo original — no es relleno de sobra que se pueda recortar, el texto ya llega al borde en el archivo fuente. Habría que pedir un archivo nuevo con más margen si el cliente lo nota.
3. Las 8 tarjetas de "Ecosistema Digital ANALAC" (Portal de Afiliados, Zona de Pagos, etc.) no tienen links reales — el texto "Acceder" es solo decorativo, sin `href`. Esto ya era así antes del carrusel; no se tocó porque no había URLs claras para cada una. Si el cliente quiere que sean clicables, hay que definir a dónde va cada una.
4. Sigue pendiente definir las URLs reales de LinkedIn del equipo en `src/data/equipo.ts` (hoy están en `#` como placeholder).

## Cómo se hace push (sin credenciales git en este entorno)
Este Mac no tiene credenciales de git para GitHub en el entorno de Claude Code. El camino que funciona: abrir **GitHub Desktop** (ya autenticado) y darle "Push origin" ahí, cada vez que se pide guardar.

## Para retomar
```
cd /Users/andres/Documents/analac-web
git status
git log --oneline -15
```
1. Confirmar que el push desde GitHub Desktop de la sesión del 14 julio se hizo (commits `97831bb` y `a4fd758`, más este de docs).
2. El servidor de Astro dev (`pnpm dev`, puerto 4321) puede haber quedado corriendo de una sesión anterior — revisar antes de levantar uno nuevo.
3. Dashboard Vercel: vercel.com/andres-projects-f33d3017/analac-web
4. Repo: github.com/leonardomorty7-svg/analac-web
