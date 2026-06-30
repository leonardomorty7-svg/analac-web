import mocks from '../../data/directoryMocks.json';
import { getSupabaseBrowser } from '../../lib/supabase/browser';

const DATA_SOURCE = import.meta.env.PUBLIC_DIRECTORY_DATA_SOURCE || 'mock';

export async function getDirectoryFilters(): Promise<{ categories: string[], regions: string[] }> {
  if (DATA_SOURCE === 'mock') {
    const cats = new Set<string>();
    const regs = new Set<string>();
    
    mocks.forEach(m => {
      if (m.category) cats.add(m.category);
      if (m.location?.department) regs.add(m.location.department);
    });

    return {
      categories: Array.from(cats).sort(),
      regions: Array.from(regs).sort()
    };
  }

  // Desde Supabase extraemos valores únicos.
  // En aplicaciones grandes se suele cachear esto.
  const supabase = getSupabaseBrowser();
  const [{ data: catData }, { data: locData }] = await Promise.all([
    supabase.from('categories').select('name'),
    supabase.from('locations').select('department')
  ]);

  const cats = new Set((catData || []).map(c => c.name));
  const regs = new Set((locData || []).map(l => l.department));

  return {
    categories: Array.from(cats).filter(Boolean).sort(),
    regions: Array.from(regs).filter(Boolean).sort()
  };
}
