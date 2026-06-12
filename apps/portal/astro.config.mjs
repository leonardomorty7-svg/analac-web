import { defineConfig } from 'astro/config'
import react from '@astrojs/react'
import tailwind from '@astrojs/tailwind'
import clerk from '@clerk/astro'

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_PORTAL_URL ?? 'https://portal.analac.com',
  output: 'server', // SSR para auth protegida
  integrations: [
    clerk(),
    react(),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  vite: {
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  },
})
