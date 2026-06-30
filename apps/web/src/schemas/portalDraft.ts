import { z } from 'zod';

export const organizationBasicInfoSchema = z.object({
  name: z.string().min(2, "El nombre comercial es muy corto").max(255).optional().or(z.literal('')),
  foundation_year: z.number().int().min(1800).max(new Date().getFullYear()).optional().nullable(),
  logo_url: z.string().url().optional().nullable().or(z.literal('')),
  cover_url: z.string().url().optional().nullable().or(z.literal('')),
});

export const organizationSummarySchema = z.object({
  what_we_do: z.string().max(300).optional(),
  services_offered: z.string().max(300).optional(),
  target_audience: z.string().max(300).optional(),
  operation_area: z.string().max(300).optional(),
  differentiator: z.string().max(300).optional(),
  summary: z.string().max(400).optional().or(z.literal('')),
});

export const organizationDescriptionSchema = z.object({
  description: z.string().max(5000).optional().or(z.literal('')),
  history: z.string().max(2000).optional(),
  experience: z.string().max(2000).optional(),
});

export const faqSchema = z.object({
  question: z.string().min(5),
  answer: z.string().min(10),
  display_order: z.number().int().default(0),
});

export const contactSchema = z.object({
  email: z.string().email("Correo inválido").optional().nullable().or(z.literal('')),
  phone: z.string().max(50).optional().nullable().or(z.literal('')),
  website: z.string().url("URL inválida").optional().nullable().or(z.literal('')),
});

export const socialLinkSchema = z.object({
  platform: z.enum(['LinkedIn', 'Facebook', 'Instagram', 'YouTube', 'TikTok', 'X', 'Other']),
  url: z.string().url(),
});

export const locationSchema = z.object({
  country: z.string().default('Colombia'),
  department: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
});

// JSON Draft general (acepta campos opcionales)
export const organizationDraftSchema = z.object({
  basicInfo: organizationBasicInfoSchema.optional(),
  summaryData: organizationSummarySchema.optional(),
  descriptionData: organizationDescriptionSchema.optional(),
  locationData: locationSchema.optional(),
  contactData: contactSchema.optional(),
  socialLinks: z.array(socialLinkSchema).optional(),
  faqs: z.array(faqSchema).optional(),
  categories: z.array(z.string()).optional(), // Array de IDs
  services: z.array(z.string()).optional(), // Array de nombres
});

// Esquema de Envío a Revisión (estricto)
export const organizationSubmitSchema = organizationDraftSchema.extend({
  basicInfo: organizationBasicInfoSchema.required({ name: true }),
  summaryData: organizationSummarySchema.required({ summary: true }),
  descriptionData: organizationDescriptionSchema.required({ description: true }),
});
