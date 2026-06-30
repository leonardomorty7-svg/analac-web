import type { OrganizationDTO } from './types';
import mocks from '../../data/directoryMocks.json';
import { getSupabaseBrowser } from '../../lib/supabase/browser';

const DATA_SOURCE = import.meta.env.PUBLIC_DIRECTORY_DATA_SOURCE || 'mock';

export async function getOrganizationBySlug(slug: string): Promise<OrganizationDTO | null> {
  if (DATA_SOURCE === 'mock') {
    const org = (mocks as unknown as OrganizationDTO[]).find(o => o.slug === slug);
    return org || null;
  }

  const supabase = getSupabaseBrowser();
  const { data, error } = await supabase
    .from('organizations')
    .select(`
      id, slug, name, org_type, status, verified,
      organization_profiles!inner (
        editorial_status, summary, description, foundation_year, logo_url, cover_url
      ),
      organization_categories (
        categories ( name, slug )
      ),
      locations ( city, department, address ),
      coverage_areas ( region_name ),
      products_summary ( name ),
      contacts ( email, phone, website ),
      faqs ( question, answer ),
      certifications ( name, document_url, valid_until )
    `)
    .eq('slug', slug)
    .eq('organization_profiles.editorial_status', 'published')
    .single();

  if (error || !data) {
    if (error && error.code !== 'PGRST116') { // PGRST116 is No Rows Found
      console.error('Error fetching org by slug:', error);
    }
    return null;
  }

  const mappedData: OrganizationDTO = {
    id: data.id,
    slug: data.slug,
    name: data.name,
    type: data.org_type,
    category: data.organization_categories?.[0]?.categories?.name || 'Otro',
    status: data.status,
    verified: data.verified,
    logo: data.organization_profiles[0]?.logo_url,
    location: {
      city: data.locations?.[0]?.city || '',
      department: data.locations?.[0]?.department || ''
    },
    summary: data.organization_profiles[0]?.summary || '',
    description: data.organization_profiles[0]?.description,
    foundationYear: data.organization_profiles[0]?.foundation_year,
    coverage: data.coverage_areas?.map((c: any) => c.region_name) || [],
    products: data.products_summary?.map((p: any) => p.name) || [],
    certifications: data.certifications?.map((c: any) => c.name) || [],
    contacts: data.contacts?.[0] ? {
      email: data.contacts[0].email,
      phone: data.contacts[0].phone,
      website: data.contacts[0].website
    } : undefined,
    faqs: data.faqs?.map((f: any) => ({ question: f.question, answer: f.answer })) || []
  };

  return mappedData;
}
