// ============================================
// @analac/types — Tipos compartidos del dominio ANALAC
// ============================================

// ── Entidades Base ──────────────────────────

export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

// ── Productor / Afiliado ────────────────────

export type MemberStatus = 'active' | 'inactive' | 'pending' | 'suspended'
export type MemberCategory = 'small' | 'medium' | 'large' | 'industrial'

export interface Member extends BaseEntity {
  /** Número de identificación tributaria */
  nit: string
  /** Razón social o nombre del productor */
  name: string
  /** Nombre del contacto principal */
  contactName: string
  email: string
  phone: string
  department: string
  municipality: string
  address: string
  status: MemberStatus
  category: MemberCategory
  /** Fecha de afiliación */
  affiliationDate: Date
  /** Litros de leche producidos por día */
  dailyLiters: number
  clerkUserId?: string
}

// ── Productor (vista pública) ───────────────

export interface Producer extends BaseEntity {
  slug: string
  name: string
  description: string
  logoUrl?: string
  coverImageUrl?: string
  department: string
  municipality: string
  dailyLiters: number
  products: Product[]
  certifications: string[]
  isFeatured: boolean
}

// ── Productos Lácteos ───────────────────────

export type ProductCategory =
  | 'fresh_milk'
  | 'cheese'
  | 'yogurt'
  | 'butter'
  | 'cream'
  | 'whey'
  | 'other'

export interface Product extends BaseEntity {
  slug: string
  name: string
  description: string
  category: ProductCategory
  imageUrl?: string
  producerId: string
  isAvailable: boolean
  priceRange?: {
    min: number
    max: number
    currency: 'COP'
  }
}

// ── Noticias / Blog ─────────────────────────

export type NewsStatus = 'draft' | 'published' | 'archived'

export interface NewsArticle extends BaseEntity {
  slug: string
  title: string
  excerpt: string
  content: string
  coverImageUrl?: string
  author: string
  status: NewsStatus
  publishedAt?: Date
  tags: string[]
  category: string
}

// ── Eventos ─────────────────────────────────

export type EventType = 'congress' | 'workshop' | 'webinar' | 'fair' | 'other'

export interface Event extends BaseEntity {
  slug: string
  title: string
  description: string
  type: EventType
  startDate: Date
  endDate: Date
  location: string
  isVirtual: boolean
  virtualLink?: string
  coverImageUrl?: string
  maxAttendees?: number
  registrationDeadline?: Date
  isFree: boolean
  price?: number
}

// ── Pagos / Cuotas ──────────────────────────

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'
export type PaymentMethod = 'wompi_card' | 'wompi_pse' | 'wompi_nequi' | 'bank_transfer' | 'cash'

export interface Payment extends BaseEntity {
  memberId: string
  amount: number
  currency: 'COP'
  status: PaymentStatus
  method: PaymentMethod
  wompiTransactionId?: string
  wompiReference?: string
  description: string
  dueDate?: Date
  paidAt?: Date
  metadata?: Record<string, unknown>
}

// ── Estadísticas del Sector ─────────────────

export interface SectorStats {
  totalMembers: number
  totalProducers: number
  totalDailyLiters: number
  departments: number
  averagePricePerLiter: number
  lastUpdated: Date
}

// ── API Responses ───────────────────────────

export interface ApiResponse<T> {
  data: T
  success: true
}

export interface ApiError {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, string[]>
  }
}

export type ApiResult<T> = ApiResponse<T> | ApiError

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

// ── Formularios ─────────────────────────────

export interface ContactFormData {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

export interface AffiliationFormData {
  nit: string
  companyName: string
  contactName: string
  email: string
  phone: string
  department: string
  municipality: string
  address: string
  category: MemberCategory
  dailyLiters: number
}

// ── Utilidades ──────────────────────────────

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type WithoutId<T extends BaseEntity> = Omit<T, 'id' | 'createdAt' | 'updatedAt'>
