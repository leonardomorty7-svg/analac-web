import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default buildConfig({
  serverURL: process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3001',
  secret: process.env.PAYLOAD_SECRET ?? 'change-me-secret',

  admin: {
    user: 'users',
    meta: {
      titleSuffix: '— ANALAC CMS',
    },
  },

  collections: [
    // ── Usuarios Admin ─────────────────────
    {
      slug: 'users',
      auth: true,
      fields: [
        { name: 'name', type: 'text', required: true },
        {
          name: 'role',
          type: 'select',
          options: ['super-admin', 'admin', 'editor'],
          defaultValue: 'editor',
          required: true,
        },
      ],
    },

    // ── Noticias ───────────────────────────
    {
      slug: 'news',
      admin: { useAsTitle: 'title', group: 'Contenido' },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true, unique: true },
        { name: 'excerpt', type: 'textarea', required: true },
        { name: 'content', type: 'richText', editor: lexicalEditor({}) },
        { name: 'coverImage', type: 'upload', relationTo: 'media' },
        { name: 'author', type: 'text', required: true },
        { name: 'tags', type: 'array', fields: [{ name: 'tag', type: 'text' }] },
        { name: 'category', type: 'text' },
        {
          name: 'status',
          type: 'select',
          options: ['draft', 'published', 'archived'],
          defaultValue: 'draft',
          required: true,
        },
        { name: 'publishedAt', type: 'date' },
      ],
    },

    // ── Eventos ────────────────────────────
    {
      slug: 'events',
      admin: { useAsTitle: 'title', group: 'Contenido' },
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true, unique: true },
        { name: 'description', type: 'richText', editor: lexicalEditor({}) },
        {
          name: 'type',
          type: 'select',
          options: ['congress', 'workshop', 'webinar', 'fair', 'other'],
          required: true,
        },
        { name: 'startDate', type: 'date', required: true },
        { name: 'endDate', type: 'date', required: true },
        { name: 'location', type: 'text' },
        { name: 'isVirtual', type: 'checkbox', defaultValue: false },
        { name: 'virtualLink', type: 'text' },
        { name: 'coverImage', type: 'upload', relationTo: 'media' },
        { name: 'maxAttendees', type: 'number' },
        { name: 'isFree', type: 'checkbox', defaultValue: true },
        { name: 'price', type: 'number' },
      ],
    },

    // ── Productores (Vista Pública) ─────────
    {
      slug: 'producers',
      admin: { useAsTitle: 'name', group: 'Directorio' },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true, unique: true },
        { name: 'description', type: 'textarea' },
        { name: 'logo', type: 'upload', relationTo: 'media' },
        { name: 'coverImage', type: 'upload', relationTo: 'media' },
        { name: 'department', type: 'text', required: true },
        { name: 'municipality', type: 'text', required: true },
        { name: 'dailyLiters', type: 'number' },
        { name: 'certifications', type: 'array', fields: [{ name: 'cert', type: 'text' }] },
        { name: 'isFeatured', type: 'checkbox', defaultValue: false },
      ],
    },

    // ── Productos Lácteos ───────────────────
    {
      slug: 'products',
      admin: { useAsTitle: 'name', group: 'Directorio' },
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'slug', type: 'text', required: true, unique: true },
        { name: 'description', type: 'textarea' },
        {
          name: 'category',
          type: 'select',
          options: ['fresh_milk', 'cheese', 'yogurt', 'butter', 'cream', 'whey', 'other'],
          required: true,
        },
        { name: 'image', type: 'upload', relationTo: 'media' },
        { name: 'producer', type: 'relationship', relationTo: 'producers', required: true },
        { name: 'isAvailable', type: 'checkbox', defaultValue: true },
      ],
    },

    // ── Media ──────────────────────────────
    {
      slug: 'media',
      upload: {
        staticDir: path.resolve(__dirname, '../media'),
      },
      fields: [
        { name: 'alt', type: 'text', required: true },
        { name: 'caption', type: 'text' },
      ],
    },
  ],

  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL ?? 'postgresql://localhost:5432/analac_cms',
    },
  }),

  typescript: {
    outputFile: path.resolve(__dirname, 'src/payload-types.ts'),
  },

  plugins: [
    ...(process.env.S3_BUCKET
      ? [
          s3Storage({
            collections: { media: true },
            bucket: process.env.S3_BUCKET,
            config: {
              credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID ?? '',
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? '',
              },
              region: process.env.S3_REGION ?? 'us-east-1',
              ...(process.env.S3_ENDPOINT ? { endpoint: process.env.S3_ENDPOINT } : {}),
            },
          }),
        ]
      : []),
  ],
})
