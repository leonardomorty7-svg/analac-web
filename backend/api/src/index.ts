import { serve } from '@hono/node-server'
import app from './app'

const PORT = Number(process.env.PORT ?? 4000)

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.info(`🚀 ANALAC API corriendo en http://localhost:${info.port}`)
    console.info(`   Entorno: ${process.env.NODE_ENV ?? 'development'}`)
  },
)
