import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import vercel from '@astrojs/vercel/serverless'

const siteUrl = process.env.PUBLIC_SITE_URL ?? 'https://analac.com'

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  output: 'hybrid',
  adapter: vercel(),
  redirects: {
    '/servicios': '/soluciones',
    '/zona-pagos': '/pago-membresia',
    '/gobernanza': '/quienes-somos/transparencia-y-gobierno',
    '/portal-aliados': '/portal'
  },
  integrations: [
    react(),
    // Sitemap: añadir con `pnpm add @astrojs/sitemap` cuando se configure PUBLIC_SITE_URL en CI
  ],
  vite: {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
})
