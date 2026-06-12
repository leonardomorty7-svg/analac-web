# ANALAC Web — Monorepo

> Rediseño completo del sitio web de la **Asociación Nacional de Productores de Leche de Colombia**

[![Turbo](https://img.shields.io/badge/Turborepo-2.x-blueviolet?logo=turborepo)](https://turbo.build)
[![pnpm](https://img.shields.io/badge/pnpm-9.x-orange?logo=pnpm)](https://pnpm.io)
[![Astro](https://img.shields.io/badge/Astro-4.x-FF5D01?logo=astro)](https://astro.build)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://typescriptlang.org)

## Estructura del Monorepo

```
analac-web/
├── apps/
│   ├── web/          → Astro 4 + TypeScript       (puerto 4321)
│   ├── portal/       → Astro + React islands       (puerto 4322)
│   └── cms/          → Payload CMS 3 headless      (puerto 3001)
├── backend/
│   └── api/          → Node.js + Hono + Drizzle    (puerto 4000)
├── packages/
│   ├── ui/           → Componentes React compartidos
│   ├── types/        → Tipos TypeScript del dominio
│   └── config/       → Configuraciones base (TS, ESLint)
└── ...
```

## Requisitos

- **Node.js** ≥ 20.0.0
- **pnpm** ≥ 9.0.0
- **PostgreSQL** ≥ 15

## Inicio Rápido

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-org/analac-web.git
cd analac-web

# 2. Instalar dependencias
pnpm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus valores

# 4. Migrar la base de datos
pnpm db:migrate

# 5. Iniciar todos los servicios en desarrollo
pnpm dev
```

## Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Inicia todos los servicios en paralelo |
| `pnpm dev:web` | Solo el sitio público (puerto 4321) |
| `pnpm dev:portal` | Solo el portal de afiliados (puerto 4322) |
| `pnpm dev:cms` | Solo Payload CMS (puerto 3001) |
| `pnpm dev:api` | Solo la API REST (puerto 4000) |
| `pnpm build` | Build de producción de todo el workspace |
| `pnpm typecheck` | Verificación de tipos TypeScript |
| `pnpm lint` | Linting de todo el código |
| `pnpm db:generate` | Genera migraciones de Drizzle |
| `pnpm db:migrate` | Ejecuta migraciones pendientes |
| `pnpm db:studio` | Abre Drizzle Studio (UI de BD) |

## Stack Tecnológico

### Frontend
- **[Astro 4](https://astro.build)** — Framework para sitios estáticos (web pública)
- **[React 18](https://react.dev)** — UI islands interactivos (portal)
- **[Tailwind CSS 3](https://tailwindcss.com)** — Estilos utilitarios

### Backend
- **[Hono](https://hono.dev)** — Framework web ultraligero para Node.js
- **[Drizzle ORM](https://orm.drizzle.team)** — ORM con type-safety para PostgreSQL
- **[Payload CMS 3](https://payloadcms.com)** — CMS headless con UI de admin

### Auth & Pagos
- **[Clerk](https://clerk.com)** — Autenticación y gestión de usuarios
- **[Wompi](https://wompi.com)** — Pasarela de pagos colombiana

### Infraestructura
- **[Turborepo](https://turbo.build)** — Orquestador de tareas en monorepo
- **[pnpm](https://pnpm.io)** — Gestor de paquetes

## Variables de Entorno

Copia `.env.example` a `.env` y configura:

- `DATABASE_URL` — Cadena de conexión PostgreSQL
- `CLERK_SECRET_KEY` — Clave secreta de Clerk
- `WOMPI_PUBLIC_KEY` / `WOMPI_PRIVATE_KEY` — Credenciales Wompi
- `PAYLOAD_SECRET` — Clave secreta de Payload CMS
- Ver `.env.example` para la lista completa

## Licencia

Privado — © ANALAC 2025
