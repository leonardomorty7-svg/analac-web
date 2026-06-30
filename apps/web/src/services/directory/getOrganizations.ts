import type { DirectorySearchParams, PaginatedDirectoryResponse, OrganizationDTO } from './types';
import mocks from '../../data/directoryMocks.json';
import { getSupabaseBrowser } from '../../lib/supabase/browser';

const DATA_SOURCE = import.meta.env.PUBLIC_DIRECTORY_DATA_SOURCE || 'mock';

export async function getOrganizations(params: DirectorySearchParams): Promise<PaginatedDirectoryResponse> {
  const { q = '', page = 1, pageSize = 12, category = '', region = '' } = params;

  if (DATA_SOURCE === 'mock') {
    return getOrganizationsFromMock(q, page, pageSize, category, region);
  }

  return getOrganizationsFromSupabase(q, page, pageSize, category, region);
}

// Fallback de Mocks
function getOrganizationsFromMock(q: string, page: number, pageSize: number, category: string, region: string): PaginatedDirectoryResponse {
  let filtered = (mocks as unknown as OrganizationDTO[]).filter(org => {
    const matchQ = q === '' || 
      org.name.toLowerCase().includes(q.toLowerCase()) || 
      org.summary.toLowerCase().includes(q.toLowerCase()) ||
      (org.products && org.products.some(p => p.toLowerCase().includes(q.toLowerCase())));
      
    const matchCat = category === '' || org.category === category;
    const matchReg = region === '' || org.location.department === region;
    
    return matchQ && matchCat && matchReg;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / pageSize);
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages
  };
}

// Consulta a Supabase
async function getOrganizationsFromSupabase(q: string, page: number, pageSize: number, category: string, region: string): Promise<PaginatedDirectoryResponse> {
  const supabase = getSupabaseBrowser();
  let query = supabase
    .from('organizations')
    .select(`
      id, slug, name, org_type, status, verified,
      organization_profiles!inner (
        editorial_status, summary, description, foundation_year, logo_url, cover_url
      ),
      organization_categories!inner (
        categories!inner ( name, slug )
      ),
      locations ( city, department ),
      coverage_areas ( region_name ),
      products_summary ( name )
    `, { count: 'exact' })
    .eq('organization_profiles.editorial_status', 'published');

  if (q) {
    query = query.textSearch('organization_profiles.fts_vector', q.split(' ').map(term => `${term}:*`).join(' & '));
  }

  if (category) {
    query = query.eq('organization_categories.categories.name', category);
  }

  if (region) {
    // Para simplificar, asumimos que location es único por sede principal o filtramos sobre coverage. 
    // Por ahora filtramos por el departamento de la location principal
    query = query.eq('locations.department', region);
  }

  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;
  query = query.range(start, end).order('name', { ascending: true });

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching from Supabase:', error);
    throw new Error('No se pudieron cargar los perfiles.');
  }

  const mappedData: OrganizationDTO[] = data.map((row: any) => ({
    id: row.id,
    slug: row.slug,
    name: row.name,
    type: row.org_type,
    category: row.organization_categories?.[0]?.categories?.name || 'Otro',
    status: row.status,
    verified: row.verified,
    logo: row.organization_profiles[0]?.logo_url,
    location: {
      city: row.locations?.[0]?.city || '',
      department: row.locations?.[0]?.department || ''
    },
    summary: row.organization_profiles[0]?.summary || '',
    description: row.organization_profiles[0]?.description,
    foundationYear: row.organization_profiles[0]?.foundation_year,
    coverage: row.coverage_areas?.map((c: any) => c.region_name) || [],
    products: row.products_summary?.map((p: any) => p.name) || [],
    certifications: [], // En listado no es tan crítico
    contacts: undefined
  }));

  const total = count || 0;
  return {
    data: mappedData,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize)
  };
}
