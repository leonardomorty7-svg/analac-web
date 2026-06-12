import { defineConfig } from 'astro/config'
import react from '@astrojs/react'

const siteUrl = process.env.PUBLIC_SITE_URL ?? 'https://analac.com'

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  output: 'static',
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
