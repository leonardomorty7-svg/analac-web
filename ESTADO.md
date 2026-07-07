# Estado del proyecto analac-web
Fecha: 7 julio 2026

## Deploy a Vercel: RESUELTO ✓
URL producción: https://analac-web.vercel.app (ya sirve la versión más reciente, verificado)

El bloqueo real nunca fue el `git push` (eso ya funcionaba). Fueron 3 problemas de build/deploy encadenados:

1. **Migraciones de Supabase desincronizadas de git** — el fix de `uuid_generate_v4()` (usar `gen_random_uuid()` + extensión `uuid-ossp`) ya estaba aplicado en la base de datos remota, pero nunca se había hecho commit. Corregido en commit `78618d7`.
2. **`turbo.json` no declaraba las env vars del build** — Turborepo en modo estricto bloqueaba `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, etc., aunque estuvieran configuradas en Vercel. Corregido en commit `ac60b7f` (se agregó el array `"env"` a la tarea `build`).
3. **Node.js Version en Vercel mal configurado** — el adaptador `@astrojs/vercel@7.8.0` solo reconoce como runtime válido Node **18** o **20** (ver `SUPPORTED_NODE_VERSIONS` en su código fuente); cualquier otra versión (22, 24...) cae a `nodejs18.x`, que Vercel ya no acepta. Se cambió en **Project Settings → Build and Deployment → Node.js Version → 20.x** (esto es config del dashboard de Vercel, no queda en git).

## Cómo se hizo el push (sin credenciales git en este entorno)
Este Mac no tiene credenciales de git configuradas para GitHub en el entorno de Claude Code (ni SSH ni token). Se generó una llave SSH (`~/.ssh/id_ed25519`) y se agregó a GitHub, pero en la práctica los pushes se terminaron haciendo con **GitHub Desktop** (ya autenticado con la cuenta de Andrés) — ese es el camino que funcionó cada vez.

## Restricciones activas (del handoff previo del 6 julio)
El frontend (Astro/React) se considera terminado. **No tocar** `apps/`, `packages/`, `backend/`, rutas, componentes ni UI. Todo lo de esta sesión se limitó a `supabase/` y `turbo.json` (raíz del monorepo) + configuración del dashboard de Vercel.

## Pendiente / a revisar
- **Deployment Protection → Vercel Authentication** está activado ("Standard Protection"). Si el cliente entra sin cuenta de Vercel podría pedirle iniciar sesión. Desactivar si genera problemas.
- El build final quedó "Ready" pero con 1 error / 3 warnings reportados en Build Logs — no bloqueó el deploy, pero no se investigó a fondo qué eran. Revisar si hay tiempo.
- El proyecto `@analac/portal` seguía sin adaptador de Vercel configurado (nota heredada de estado anterior, no verificado en esta sesión).

## Para retomar
```
cd /Users/andres/Documents/analac-web
git status
git log --oneline -5
```
Dashboard Vercel: vercel.com/andres-projects-f33d3017/analac-web
Repo: github.com/leonardomorty7-svg/analac-web
