import { Hono } from 'hono'

export const healthRouter = new Hono()

healthRouter.get('/', (c) =>
  c.json({
    status: 'ok',
    service: 'analac-api',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version ?? '0.0.1',
  }),
)
