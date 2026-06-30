import type { APIRoute } from 'astro';
import { getSupabaseServer } from '../lib/supabase/server';

export const GET: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = getSupabaseServer(request, cookies);
    
    // 1. Obtener todos los perfiles publicados
    const { data: profiles, error } = await supabase
      .from('organization_profiles')
      .select('slug, updated_at, organization_id')
      .eq('editorial_status', 'published');

    if (error) {
      throw error;
    }

    const baseUrl = 'https://analac.com';

    // 2. URLs estáticas e institucionales indexables
    const staticPages = [
      '',
      '/asociados-y-aliados/directorio',
      '/noticias',
      '/informacion-sectorial',
      '/afiliacion'
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    for (const page of staticPages) {
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${page}</loc>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>${page === '' ? '1.0' : '0.8'}</priority>\n`;
      xml += `  </url>\n`;
    }

    // Published Profiles
    if (profiles) {
      for (const p of profiles) {
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}/asociados-y-aliados/directorio/${p.slug}</loc>\n`;
        if (p.updated_at) {
          // Extraemos solo la porción de la fecha YYYY-MM-DD
          const dateStr = new Date(p.updated_at).toISOString().split('T')[0];
          xml += `    <lastmod>${dateStr}</lastmod>\n`;
        }
        xml += `    <changefreq>monthly</changefreq>\n`;
        xml += `    <priority>0.7</priority>\n`;
        xml += `  </url>\n`;
      }
    }

    // 3. URLs Temáticas (Categorías) - Fase 7 GEO
    // Solo si tienen más de 1 empresa asociada
    const { data: categoryStats } = await supabase
      .from('organization_categories')
      .select('categories ( slug ), organization_id');
    
    if (categoryStats) {
      // Agrupar por categoria
      const catCount: Record<string, number> = {};
      for (const cs of categoryStats) {
        const slug = (cs.categories as any)?.slug;
        if (slug) {
          catCount[slug] = (catCount[slug] || 0) + 1;
        }
      }

      for (const [slug, count] of Object.entries(catCount)) {
        if (count >= 2) { // Regla de validación: Evitar Thin Content
          xml += `  <url>\n`;
          xml += `    <loc>${baseUrl}/asociados-y-aliados/directorio/categorias/${slug}</loc>\n`;
          xml += `    <changefreq>weekly</changefreq>\n`;
          xml += `    <priority>0.6</priority>\n`;
          xml += `  </url>\n`;
        }
      }
    }

    xml += `</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });

  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
};
