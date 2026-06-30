import { z } from 'zod';

// Esquemas Base de Identidad
export const OrganizationSchema = z.object({
  id: z.string().uuid(),
  slug: z.string().min(3),
  name: z.string().min(2, "El nombre es obligatorio"),
  org_type: z.enum([
    'Empresa transformadora', 
    'Proveedor', 
    'Cooperativa', 
    'Asociación', 
    'Academia', 
    'Institución Pública',
    'Otro'
  ]),
  status: z.string(),
  verified: z.boolean()
});

// Campos permitidos para que la empresa los actualice
export const OrganizationUpdateSchema = OrganizationSchema.omit({
  id: true, // No editable
  status: true, // Exclusivo admin
  verified: true // Exclusivo admin
});

// Esquemas Base de Perfil
export const ProfileSchema = z.object({
  id: z.string().uuid(),
  organization_id: z.string().uuid(),
  editorial_status: z.enum([
    'draft', 
    'pending_review', 
    'changes_requested', 
    'approved', 
    'published', 
    'suspended', 
    'rejected', 
    'archived'
  ]),
  summary: z.string().max(300, "El resumen debe ser directo y conciso (máximo 300 caracteres)"),
  description: z.string().optional(),
  foundation_year: z.number().int().min(1800).max(new Date().getFullYear()).optional(),
  logo_url: z.string().url().optional().or(z.literal('')),
  cover_url: z.string().url().optional().or(z.literal(''))
});

// Campos permitidos para que la empresa los edite en su revisión
export const ProfileRevisionDraftSchema = ProfileSchema.omit({
  id: true, // No editable
  organization_id: true, // No editable
  editorial_status: true // Establecido automáticamente o por admin
});

export const LocationSchema = z.object({
  city: z.string().min(1, "La ciudad es obligatoria"),
  department: z.string().min(1, "El departamento es obligatorio"),
  address: z.string().optional()
});

export const ContactSchema = z.object({
  email: z.string().email("Debe ser un correo válido").optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().url("Debe ser una URL válida").optional().or(z.literal(''))
});
