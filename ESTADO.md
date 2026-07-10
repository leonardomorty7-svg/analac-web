# Estado del proyecto analac-web
Fecha: 10 julio 2026

## Deploy a Vercel: RESUELTO ✓ (desde el 7 julio)
URL producción: https://analac-web.vercel.app

El detalle completo del troubleshooting de deploy (migraciones de Supabase, `turbo.json`, Node version en Vercel) quedó documentado en el historial de git — ver commits `78618d7`, `ac60b7f` y el resto de esa sesión. Ese tema ya está cerrado, no hace falta retomarlo salvo que vuelva a fallar un deploy.

## Estado de push
**Todo lo de hoy (10 julio) y de ayer (9 julio) ya está pusheado a `origin/main`** (confirmado con `git fetch` + comparación de hash — `HEAD` y `origin/main` apuntan al mismo commit, `5581445`). No hay nada pendiente de subir.

## Sesión del 10 julio

1. **`286ad4d`** — Home/`/noticias` "Ciencia Láctea": cada categoría (Nutrición, Producción, Consumo, Sostenibilidad) tiene su propio color de acento. El byline genérico "Equipo Técnico ANALAC" se reemplazó por la firma real del colaborador (foto, nombre, cargo), alimentada por una fuente de datos única (`src/data/equipo.ts`) que también usa `/quienes-somos`. Nuevo componente `AuthorSignature.astro` (variantes `byline`/`firma`, la variante firma incluye LinkedIn). Página oculta `/preview/firmas` (noindex) para revisar todas las firmas.
2. **`bee74f1`** — Se agregó fecha de publicación a las cards de Ciencia Láctea, alineada a la derecha de la categoría.
3. **`0ded603`** — Home "Consumo Lácteo": mismo tratamiento que Ciencia Láctea — carrusel horizontal infinito full-bleed, color por categoría de comida, firma de autor real, botón "Consultar preparación" ahora solo visible en hover. Se agregaron 4 recetas colombianas nuevas (changua, natilla, arequipe, kumis) usando fotos que ya estaban en `public/images/recetas/`.
4. **`44f2ac2`** — Home "Nuestro Impacto": se quitó la línea separadora verde bajo el título y se capitalizaron las tres etiquetas (Productores/Departamentos/Precio).
5. **`dfac688`** — `/quienes-somos` "Nuestra Historia" (timeline): el hover de los puntos no se notaba porque usaba variables CSS (`--color-green-dark`, `--color-bg-page`) que **no estaban definidas en ningún lado del proyecto** (confirmado con `getComputedStyle` — devolvían string vacío). Se reemplazaron por colores reales; ahora el hover rellena en verde, agranda y tiene glow. Los años pasaron de weight 300 a 600.
6. **`9352670`** + **`cb12493`** + **`cb7a23d`** + **`904f5c5`** — `/quienes-somos` "Aliados Estratégicos": rediseño completo de lista larga apilada a panel de scrollytelling — texto fijo centrado verticalmente a la izquierda, panel derecho que cambia de grupo de logos según el progreso de scroll (con `position:sticky` + cálculo de progreso, sin hijackear el scroll). Se agregó texto descriptivo a los 3 grupos que no lo tenían (Aliados Premium, Aliados Estratégicos, Empresas Aliadas). Nuevo componente reutilizable `AliadosGroup.astro`.
7. **`30ec5e7`** — `/quienes-somos` "Valores Institucionales": ícono de "Sostenibilidad" cambiado de signo de pesos ($) a una hoja.
8. **`1f931f4`** + **`1fa8655`** — `/informacion-sectorial` (Observatorio): hero "Observatorio ANALAC" → "Observatorio" (ya no se repite); el párrafo de "¿Qué es el Observatorio?" ya no repite el título; el badge "Disponible solo para afiliados" en Datos Territoriales ahora va debajo del botón "Ver Territorios" (antes flotaba al lado por ser `inline-flex`); la sección "Información construida con el ecosistema" pasó de 3 cards con ícono a **una sola frase grande y centrada**, muy tipográfica (estilo inspirado en la referencia de Antigravity que envió el cliente), resumiendo actualización + validación + privacidad.
9. **`5581445`** — Fix de performance: dos listeners de `scroll` a nivel de `window` (Nav.astro y el scrollytelling de Aliados) corrían sin límite de frecuencia, haciendo trabajo pesado (`getBoundingClientRect`, toggles de clase) en cada evento. Se limitaron a recalcular una vez por frame con `requestAnimationFrame`. Esto se hizo porque el cliente reportó "parpadeo" al hacer scroll en varias páginas.

### ⚠️ Pendiente de verificar (parpadeo al hacer scroll)
El cliente reportó un parpadeo general al hacer scroll en varias páginas. Se identificó y corrigió la causa más probable (scroll listeners sin throttle, ver punto 9 arriba), pero **no se pudo verificar visualmente en vivo** porque el navegador automatizado (claude-in-chrome) quedó caído por una falla temporal de infraestructura justo al final de la sesión. Antes de dar esto por cerrado:
1. Abrir `localhost:4321` en un navegador real y scrollear rápido por el home y por `/quienes-somos` (sección "Aliados Estratégicos", la más pesada).
2. Si el parpadeo sigue apareciendo, pedirle al usuario que precise en qué página/sección exacta lo ve, para investigar puntualmente ahí.
3. También quedó pendiente una revisión visual del responsive en varios anchos de pantalla (se hizo una auditoría estática del CSS de todo lo tocado esta sesión y no se encontraron problemas evidentes, pero no se pudo confirmar visualmente por la misma falla del navegador automatizado).

### Patrón de diseño establecido (para mantener consistencia en próximas secciones)
Cuando una sección necesita sentirse "premium": fondo oscuro casi negro (`#040a05`), glow radial verde (`rgba(109,181,109,0.12-0.22)`) + grilla sutil de 60px enmascarada con radial-gradient. Ya aplicado en: Vitrina Digital (home), Nodos de la Red, Datos Territoriales, Nodos de Conocimiento (noticias). Verde de acento: `#6db56d` / `var(--c-green)`.

### Patrón técnico: carrusel horizontal infinito con auto-rotación
Ya usado en Ciencia Láctea y Consumo Lácteo. Para reutilizar: renderizar 3 copias del array de items en el track (`[...items, ...items, ...items]`), posicionar el scroll inicial en `track.scrollWidth / 3` de forma **síncrona** (no usar `requestAnimationFrame` para esto — no se dispara de forma confiable en algunos entornos), y en cada evento `scroll` (debounced ~150ms) revisar si `scrollLeft` salió del tercio del medio; si es así, saltar una copia con `scrollTo({ left, behavior: 'instant' })` (nunca asignar `scrollLeft` directamente si el contenedor tiene `scroll-behavior: smooth` en CSS).

### Patrón técnico: panel de scrollytelling (sticky + progreso de scroll)
Usado en "Aliados Estratégicos". Wrapper con altura real = N pasos × alto de viewport (ej. `calc(N * 62vh)`), y adentro un `position: sticky` que se queda pegado mientras se hace scroll por esa altura. La lógica en JS calcula progreso con `-rect.top / (rect.height - innerHeight)` y determina el paso activo con `Math.floor(progress * N)`. **Importante**: throttlear el listener de scroll con `requestAnimationFrame` (no correrlo en cada evento crudo).

### Fuente única de datos del equipo
`src/data/equipo.ts` — usado por `/quienes-somos`, por `AuthorSignature.astro` (firmas de blogs/noticias) y por `/preview/firmas`. Cambiar el nombre/foto/cargo de una persona ahí lo actualiza en todos lados.

## Pendiente / para decidir con el usuario
1. **Verificar el fix del parpadeo en scroll** (ver sección de arriba) antes de considerar esto cerrado.
2. Sigue pendiente definir las URLs reales de LinkedIn del equipo en `src/data/equipo.ts` (hoy están en `#` como placeholder).
3. Tarea sugerida (no urgente, ver chip de sesión `task_c6793c49`): varias páginas usan variables CSS (`--color-green-dark`, `--color-bg-page`, `--color-text-main`) que nunca fueron definidas en ningún `:root` del proyecto — funcionan "por accidente" (fallback a `currentColor`/`transparent`). Ya se corrigió el caso puntual de la timeline en `/quienes-somos`; falta revisar el resto (gobernanza, afiliate, servicios, contacto, etc.).

## Cómo se hace push (sin credenciales git en este entorno)
Este Mac no tiene credenciales de git para GitHub en el entorno de Claude Code. El camino que funciona: abrir **GitHub Desktop** (ya autenticado) y darle "Push origin" ahí, cada vez que se pide guardar.

## Para retomar
```
cd /Users/andres/Documents/analac-web
git status
git log --oneline -15
```
1. Revisar el punto de "parpadeo al hacer scroll" (arriba) — probar en vivo en el navegador antes de seguir.
2. El servidor de Astro dev (`pnpm dev`, puerto 4321) puede haber quedado corriendo de una sesión anterior — revisar antes de levantar uno nuevo.
3. Dashboard Vercel: vercel.com/andres-projects-f33d3017/analac-web
4. Repo: github.com/leonardomorty7-svg/analac-web
