import { pgTable, text, timestamp, uuid, integer, boolean, numeric, pgEnum } from 'drizzle-orm/pg-core'

// ── Enums ──────────────────────────────────

export const memberStatusEnum = pgEnum('member_status', [
  'active',
  'inactive',
  'pending',
  'suspended',
])

export const memberCategoryEnum = pgEnum('member_category', [
  'small',
  'medium',
  'large',
  'industrial',
])

export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'paid',
  'failed',
  'refunded',
  'cancelled',
])

export const paymentMethodEnum = pgEnum('payment_method', [
  'wompi_card',
  'wompi_pse',
  'wompi_nequi',
  'bank_transfer',
  'cash',
])

// ── Tabla: members (afiliados) ──────────────

export const members = pgTable('members', {
  id: uuid('id').primaryKey().defaultRandom(),
  nit: text('nit').notNull().unique(),
  name: text('name').notNull(),
  contactName: text('contact_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull(),
  department: text('department').notNull(),
  municipality: text('municipality').notNull(),
  address: text('address').notNull(),
  status: memberStatusEnum('status').notNull().default('pending'),
  category: memberCategoryEnum('category').notNull(),
  dailyLiters: integer('daily_liters').notNull().default(0),
  clerkUserId: text('clerk_user_id').unique(),
  affiliationDate: timestamp('affiliation_date', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ── Tabla: payments (pagos de cuotas) ────────

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  memberId: uuid('member_id')
    .notNull()
    .references(() => members.id, { onDelete: 'cascade' }),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('COP'),
  status: paymentStatusEnum('status').notNull().default('pending'),
  method: paymentMethodEnum('method').notNull(),
  wompiTransactionId: text('wompi_transaction_id'),
  wompiReference: text('wompi_reference'),
  description: text('description').notNull(),
  dueDate: timestamp('due_date', { withTimezone: true }),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  metadata: text('metadata'), // JSON stringified
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ── Tabla: audit_logs ──────────────────────

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  userId: text('user_id'),
  changes: text('changes'), // JSON stringified
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// ── Tipos inferidos ────────────────────────

export type Member = typeof members.$inferSelect
export type NewMember = typeof members.$inferInsert
export type Payment = typeof payments.$inferSelect
export type NewPayment = typeof payments.$inferInsert
