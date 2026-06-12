import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import { timing } from 'hono/timing'
import { HTTPException } from 'hono/http-exception'
import 'dotenv/config'

import { membersRouter } from './routes/members'
import { paymentsRouter } from './routes/payments'
import { healthRouter } from './routes/health'
import { webhooksRouter } from './routes/webhooks'

const app = new Hono()

// ── Middlewares globales ────────────────────

app.use('*', timing())
app.use('*', logger())
app.use('*', secureHeaders())
app.use(
  '/api/*',
  cors({
    origin: [
      process.env.PUBLIC_SITE_URL ?? 'http://localhost:4321',
      process.env.PUBLIC_PORTAL_URL ?? 'http://localhost:4322',
    ],
    credentials: true,
  }),
)

// ── Rutas ───────────────────────────────────

app.route('/health', healthRouter)
app.route('/api/members', membersRouter)
app.route('/api/payments', paymentsRouter)
app.route('/api/webhooks', webhooksRouter)

// ── Error handler global ────────────────────

app.onError((err, c) => {
  console.error('[API Error]', err)

  if (err instanceof HTTPException) {
    return c.json(
      {
        success: false,
        error: {
          code: 'HTTP_EXCEPTION',
          message: err.message,
        },
      },
      err.status,
    )
  }

  return c.json(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Ha ocurrido un error interno',
      },
    },
    500,
  )
})

app.notFound((c) =>
  c.json(
    {
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: `Ruta no encontrada: ${c.req.path}`,
      },
    },
    404,
  ),
)

export default app
