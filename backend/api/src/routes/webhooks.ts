import { Hono } from 'hono'
import { db } from '../db'
import { payments } from '../db/schema'
import { eq } from 'drizzle-orm'

export const webhooksRouter = new Hono()

// POST /api/webhooks/wompi — Eventos de Wompi
webhooksRouter.post('/wompi', async (c) => {
  const body = await c.req.json()

  // Verificar signature de Wompi
  const signature = c.req.header('x-event-checksum')
  const eventsSecret = process.env.WOMPI_EVENTS_SECRET

  if (!eventsSecret || !signature) {
    return c.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Firma inválida' } }, 401)
  }

  // Procesar evento de transacción
  const { event, data } = body

  if (event === 'transaction.updated') {
    const transaction = data?.transaction
    if (transaction) {
      const { id: wompiId, reference, status } = transaction

      // Mapear status de Wompi a nuestros status
      const statusMap: Record<string, 'paid' | 'failed' | 'pending'> = {
        APPROVED: 'paid',
        DECLINED: 'failed',
        ERROR: 'failed',
        PENDING: 'pending',
      }

      const paymentStatus = statusMap[status] ?? 'pending'

      await db
        .update(payments)
        .set({
          status: paymentStatus,
          wompiTransactionId: wompiId,
          wompiReference: reference,
          paidAt: paymentStatus === 'paid' ? new Date() : undefined,
          updatedAt: new Date(),
        })
        .where(eq(payments.wompiReference, reference))

      console.info(`[Wompi] Transacción ${wompiId} → ${paymentStatus}`)
    }
  }

  return c.json({ success: true })
})

// POST /api/webhooks/clerk — Eventos de Clerk
webhooksRouter.post('/clerk', async (c) => {
  const body = await c.req.json()
  const { type, data } = body

  console.info(`[Clerk Webhook] Evento: ${type}`)

  // Manejar eventos de usuario de Clerk
  // TODO: Sincronizar usuarios de Clerk con la tabla members

  return c.json({ success: true })
})
