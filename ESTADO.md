# Estado del proyecto analac-web
Fecha: 15 julio 2026

## Deploy a Vercel: RESUELTO ✓ (desde el 7 julio)
URL producción: https://analac-web.vercel.app

El detalle completo del troubleshooting de deploy (migraciones de Supabase, `turbo.json`, Node version en Vercel) quedó documentado en el historial de git — ver commits `78618d7`, `ac60b7f` y el resto de esa sesión. Ese tema ya está cerrado, no hace falta retomarlo salvo que vuelva a fallar un deploy.

## Estado de push
**Todo lo de hoy (15 julio) está commiteado localmente pero NO pusheado todavía.** Falta abrir GitHub Desktop y darle "Push origin" (ver sección de abajo). Todo lo de la sesión del 14 julio (hasta `9209826`) ya se pusheó y confirmó por el usuario.

## Sesión del 15 julio

1. **`1ecec8e`** — Home "Ciencia Láctea" y "Consumo Lácteo": el cliente pidió que las cards se muevan igual que los logos de "Organizaciones e instituciones que respaldan..." (scroll continuo, no saltos cada 3.5s) y que se detengan al pasar el mouse encima. Se reemplazó el autoplay a saltos + botones prev/next por el mismo mecanismo de marquee continuo (2 copias del set, `translateX` en loop infinito, `animation-play-state:paused` en hover). Se quitaron los botones de navegación manual porque no encajaban con el movimiento continuo (la referencia del cliente tampoco los tiene) — avisado explícitamente al cliente por si los quiere de vuelta de otra forma.
2. **`14acc4c`** — Los 3 carruseles de scroll-hijack (Nodos de la Red, Nodos de Conocimiento en `/noticias`, Ecosistema Digital ANALAC en `/quienes-somos`) tenían dos bugs reportados por el cliente:
   - Al entrar scrolleando rápido, el carrusel se podía enganchar ya varias cards adentro (se veía "Zona de Pagos" o la última card activa en vez de la primera). Ahora el primer scroll que ancla la sección solo la fija y muestra la card del extremo correspondiente (primera si se venía bajando, última si se venía subiendo) sin avanzar todavía; recién el siguiente scroll avanza.
   - La card activa (más grande, con sombra grande) quedaba cortada por el `overflow:hidden` del contenedor interno del carrusel — se quitó ese overflow interno (el de la sección, más afuera, ya recorta lo horizontal).
   - De paso se centró el menú de navegación interna (Propósito, Labor Gremial, etc.) en `quienes-somos.astro` e `informacion-sectorial.astro`, que quedaba pegado a la izquierda por falta de `justify-content:center`.
3. **`40aede8`** — `/informacion-sectorial`:
   - Dashboard de Indicadores: los 4 valores (`$1.820`, `98,4%`, `7,2B L`, `12`) ahora cuentan desde 0 al entrar en el viewport, con un parser propio que soporta el formato colombiano (punto de miles, coma decimal, prefijos/sufijos como `$` y `B L`).
   - Panorama del Sector: las barras arrancan en 0 y se llenan hasta su ancho real al entrar en el viewport, en secuencia.
   - "El Observatorio se construye entre toda la Red...": efecto de máquina de escribir (letra por letra), respeta `prefers-reduced-motion`. Se corrigió también el texto (los dos puntos → punto, "Los" con mayúscula). **Bug encontrado y corregido en el camino**: los `<span>` por letra se crean por JS y no heredan el atributo de scope de Astro (`data-astro-cid-*`), así que las reglas CSS scoped nunca los alcanzaban — se resolvió aplicando los estilos en línea por JS en vez de por clase CSS.
4. **`4154d78`** — Directorio de aliados:
   - La ficha de cada empresa (ej. Lácteos del Valle) tenía el menú superior transparente flotando sobre fondo blanco, se veía como una franja gris cortada (el menú está pensado para ir sobre foto oscura). Se le agregó un fondo verde oscuro sólido de 140px a la franja superior del header.
   - Se agregó la sección "Otras organizaciones del directorio" al final de cada ficha: carrusel continuo (mismo mecanismo que Ciencia Láctea) con las demás organizaciones del directorio, excluyendo la actual. Conectado a los datos reales (mock/Supabase), crece automáticamente con más organizaciones.

### Patrón técnico: entrada controlada en carruseles de scroll-hijack
Ver `apps/web/src/pages/asociados-y-aliados/index.astro`, `noticias/index.astro` y `quienes-somos.astro` (sección Ecosistema Digital). Se agregó una variable `wasPinned` al listener de `wheel`: mientras la sección no estaba pineada, `wasPinned=false`; en el primer `wheel` con la sección ya pineada (`wasPinned` pasa de `false` a `true`), se hace `preventDefault()` y se fija `activeIndex` al extremo que corresponde a la dirección de entrada (0 si `deltaY>0`, `total-1` si `deltaY<0`) **sin** llamar a `goTo()` — recién el siguiente evento de `wheel` avanza normalmente. Esto evita que un scroll rápido salte varias cards antes de que el usuario perciba que la sección ya se anclo.

### Patrón técnico: por qué la card activa se veía con la sombra cortada
El contenedor `.eco-carousel` / `.nodos-carousel` / `.hub-carousel` (el `flex:1` que envuelve el track) tenía su propio `overflow:hidden`, pero la card activa se agranda (`scale(1.06)`) y se levanta (`translateY(-10px)`) con una sombra de hasta ~56px de blur — eso no cabía dentro de ese `overflow:hidden` interno y se cortaba contra el borde. Se quitó el `overflow:hidden` de ese contenedor interno; el recorte horizontal (ocultar las cards que sobran a los costados) lo sigue haciendo el `overflow:hidden` de la sección completa, un nivel más afuera.

### Patrón técnico: por qué la sombra del hover se cortaba en los carruseles de marquee (Ciencia Láctea, Consumo Lácteo, Otras organizaciones)
Mismo síntoma, causa distinta: el track solo tenía `padding: 4px 4px 8px`, muy poco para una sombra de hover que se extiende ~60-75px. Se le subió el padding vertical del track (24px arriba / 72px abajo en Ciencia y Consumo, 20px/56px en "Otras organizaciones") para que la sombra tenga aire antes de llegar al borde del `overflow:hidden` del wrap.

### Patrón técnico: animación de conteo con formato colombiano
Ver el script de `#indicadoresGrid` en `informacion-sectorial.astro`. A diferencia del bloque de impacto de `quienes-somos` (que solo maneja enteros simples), este parsea strings tipo `$1.820`, `98,4%`, `7,2B L` con una regex (`^([^\d]*)([\d.,]+)(.*)$`) separando prefijo/núcleo numérico/sufijo, detecta coma como separador decimal, y reconstruye el número formateado (punto de miles, coma decimal) en cada frame de la animación.

### Patrón técnico: por qué un efecto de "letra por letra" (typewriter) no se veía
Los `<span>` de cada letra se crean dinámicamente por JavaScript (`document.createElement`), pero Astro solo aplica el atributo de scope (`data-astro-cid-*`) a los elementos que están escritos directamente en el `.astro` template — los creados por JS en runtime no lo heredan, así que cualquier regla CSS scoped que los apunte (ej. `.comunitaria-big-text .tw-char`) nunca los alcanza. Solución: aplicar esos estilos (`opacity`, `transition`) directamente por JS (`el.style.opacity = ...`) en vez de por clase CSS. Si se necesita reutilizar este patrón en otro lado, tenerlo en cuenta desde el principio.

### Patrón técnico: carrusel en abanico con scroll-hijack (de sesiones anteriores)
Desktop-only (`min-width:900px` + `prefers-reduced-motion:no-preference`); la sección se pone `height:100vh` y un listener de `wheel` en `window` (`passive:false`) hace `preventDefault()` mientras la sección está "pineada" (`Math.abs(rect.top) <= 100`). Ver arriba la actualización de "entrada controlada".

### Patrón de diseño establecido
Variante oscura: fondo casi negro (`#040a05`), glow radial verde + grilla sutil de 60px enmascarada. Ya aplicado en: Vitrina Digital (home), Nodos de la Red, Datos Territoriales, Nodos de Conocimiento (noticias).
Variante clara: mismo glow radial verde pero sobre fondo crema (`var(--c-cream)`) y grilla sutil oscura. Usada en "Ecosistema Digital ANALAC" y en el fondo verde-oscuro-sólido del header del directorio (variante simplificada, sin glow).
Verde de acento: `#6db56d` / `var(--c-green)`.

### Patrón técnico: carrusel horizontal infinito con auto-rotación (marquee)
Usado en Ciencia Láctea, Consumo Lácteo, y "Otras organizaciones del directorio". Para reutilizar: 2 copias del array de items en el track (`[...items, ...items]`), `display:flex; width:max-content`, `animation: <nombre> Ns linear infinite` con `@keyframes { 0% {transform:translateX(0)} 100% {transform:translateX(calc(-50% - <mitad-del-gap>px))} }`, y `.track:hover { animation-play-state: paused }`. **Importante**: dar suficiente `padding` vertical al track (ver arriba) para que la sombra del hover no se corte contra el `overflow:hidden` del wrap.

### Fuente única de datos del equipo
`src/data/equipo.ts` — usado por `/quienes-somos`, por `AuthorSignature.astro` (firmas de blogs/noticias) y por `/preview/firmas`. Cambiar el nombre/foto/cargo de una persona ahí lo actualiza en todos lados.

### Directorio de aliados: datos
`src/data/directoryMocks.json` — solo 4 organizaciones de prueba por ahora (Lácteos del Valle, Agrovet Innovación, Cooperativa Lechera del Norte, Tecnofrío Andina). La sección "Otras organizaciones del directorio" en cada ficha usa `getOrganizations()` (mismo servicio que el listado del directorio) y excluye la organización actual — cuando se cargue el directorio real (Supabase, `PUBLIC_DIRECTORY_DATA_SOURCE`), esta sección se llena sola sin tocar código.

## Pendiente / para decidir con el usuario
1. **Variables CSS `--color-*` nunca definidas** (`--color-text-sub`, `--color-green-main`, etc.): sigue pendiente, hay un chip de sesión (`task_eb54eba0`) esperando que el usuario lo dispare.
2. **Logo del Ministerio de Agricultura** viene con el texto pegado al borde del archivo original — no se puede arreglar con recorte, haría falta un archivo nuevo.
3. Las 8 tarjetas de "Ecosistema Digital ANALAC" no tienen links reales todavía (el texto "Acceder" es decorativo). Falta que el cliente defina a dónde va cada una.
4. Sigue pendiente definir las URLs reales de LinkedIn del equipo en `src/data/equipo.ts`.
5. El directorio de aliados solo tiene 4 organizaciones de prueba — la sección "Otras organizaciones del directorio" se verá más rica cuando el cliente cargue el directorio real.

## Cómo se hace push (sin credenciales git en este entorno)
Este Mac no tiene credenciales de git para GitHub en el entorno de Claude Code. El camino que funciona: abrir **GitHub Desktop** (ya autenticado) y darle "Push origin" ahí, cada vez que se pide guardar.

## Para retomar
```
cd /Users/andres/Documents/analac-web
git status
git log --oneline -15
```
1. Confirmar que el push desde GitHub Desktop de la sesión del 15 julio se hizo (commits `1ecec8e`, `14acc4c`, `40aede8`, `4154d78`, más este de docs).
2. El servidor de Astro dev (`pnpm --filter web dev`, puerto 4321) puede haber quedado corriendo de una sesión anterior — revisar antes de levantar uno nuevo.
3. Dashboard Vercel: vercel.com/andres-projects-f33d3017/analac-web
4. Repo: github.com/leonardomorty7-svg/analac-web
