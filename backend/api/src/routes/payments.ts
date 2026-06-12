import { Hono } from 'hono'
import { db } from '../db'
import { payments } from '../db/schema'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq } from 'drizzle-orm'

export const paymentsRouter = new Hono()

// GET /api/payments — Listar pagos
paymentsRouter.get('/', async (c) => {
  const memberId = c.req.query('memberId')

  const rows = memberId
    ? await db.select().from(payments).where(eq(payments.memberId, memberId))
    : await db.select().from(payments).limit(50)

  return c.json({ success: true, data: rows })
})

// POST /api/payments — Crear registro de pago
const createPaymentSchema = z.object({
  memberId: z.string().uuid(),
  amount: z.number().positive(),
  method: z.enum(['wompi_card', 'wompi_pse', 'wompi_nequi', 'bank_transfer', 'cash']),
  description: z.string().min(5).max(500),
  dueDate: z.string().datetime().optional(),
})

paymentsRouter.post('/', zValidator('json', createPaymentSchema), async (c) => {
  const data = c.req.valid('json')

  const [payment] = await db
    .insert(payments)
    .values({
      memberId: data.memberId,
      amount: String(data.amount),
      currency: 'COP',
      method: data.method,
      description: data.description,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      status: 'pending',
    })
    .returning()

  return c.json({ success: true, data: payment }, 201)
})

// GET /api/payments/:id
paymentsRouter.get('/:id', async (c) => {
  const id = c.req.param('id')
  const [payment] = await db.select().from(payments).where(eq(payments.id, id)).limit(1)

  if (!payment) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Pago no encontrado' } }, 404)
  }

  return c.json({ success: true, data: payment })
})
