import { z } from 'zod';
import { 
  OrganizationSchema, 
  ProfileSchema, 
  LocationSchema, 
  ContactSchema 
} from '../schemas/directory';

export type Organization = z.infer<typeof OrganizationSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type Location = z.infer<typeof LocationSchema>;
export type Contact = z.infer<typeof ContactSchema>;

// Tipo Compuesto para el Frontend (Vista de Perfil Completa)
export interface FullOrganizationProfile extends Organization {
  profile: Profile;
  location: Location;
  contacts: Contact;
  categories: string[];
  coverage_areas: string[];
  products: string[];
  certifications: { name: string; document_url: string; valid_until: string }[];
  faqs: { question: string; answer: string }[];
}
