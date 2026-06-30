import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ request }) => {
  // En Vercel o entorno Node, podemos leer la variable de entorno para saber si estamos en producción
  const isProduction = import.meta.env.PUBLIC_VERCEL_ENV === 'production' || import.meta.env.PROD;

  let robots = '';

  if (!isProduction) {
    // Staging / Dev
    robots = `User-agent: *\nDisallow: /\n`;
  } else {
    // Producción
    robots = `User-agent: *
Allow: /
Disallow: /admin-analac/
Disallow: /portal-aliados/
Disallow: /api/
Disallow: /*?q=*
Disallow: /*?categoria=*
Disallow: /*?region=*

Sitemap: https://analac.com/sitemap.xml
`;
  }

  return new Response(robots, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain'
    }
  });
};
