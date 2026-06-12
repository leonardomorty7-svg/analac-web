import { Hono } from 'hono'
import { db } from '../db'
import { members } from '../db/schema'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { eq } from 'drizzle-orm'

export const membersRouter = new Hono()

// GET /api/members — Listar afiliados (paginado)
membersRouter.get('/', async (c) => {
  const page = Number(c.req.query('page') ?? 1)
  const pageSize = Number(c.req.query('pageSize') ?? 20)
  const offset = (page - 1) * pageSize

  const [rows, total] = await Promise.all([
    db.select().from(members).limit(pageSize).offset(offset),
    db.$count(members),
  ])

  return c.json({
    success: true,
    data: rows,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  })
})

// GET /api/members/:id
membersRouter.get('/:id', async (c) => {
  const id = c.req.param('id')
  const [member] = await db.select().from(members).where(eq(members.id, id)).limit(1)

  if (!member) {
    return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Afiliado no encontrado' } }, 404)
  }

  return c.json({ success: true, data: member })
})

// POST /api/members — Crear afiliado
const createMemberSchema = z.object({
  nit: z.string().min(5).max(20),
  name: z.string().min(2).max(200),
  contactName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
  department: z.string().min(2).max(100),
  municipality: z.string().min(2).max(100),
  address: z.string().min(5).max(300),
  category: z.enum(['small', 'medium', 'large', 'industrial']),
  dailyLiters: z.number().int().min(0),
  clerkUserId: z.string().optional(),
})

membersRouter.post('/', zValidator('json', createMemberSchema), async (c) => {
  const data = c.req.valid('json')

  const [member] = await db.insert(members).values(data).returning()

  return c.json({ success: true, data: member }, 201)
})

// PATCH /api/members/:id
membersRouter.patch(
  '/:id',
  zValidator('json', createMemberSchema.partial()),
  async (c) => {
    const id = c.req.param('id')
    const data = c.req.valid('json')

    const [updated] = await db
      .update(members)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(members.id, id))
      .returning()

    if (!updated) {
      return c.json({ success: false, error: { code: 'NOT_FOUND', message: 'Afiliado no encontrado' } }, 404)
    }

    return c.json({ success: true, data: updated })
  },
)
