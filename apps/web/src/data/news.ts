// src/data/news.ts
// Datos estáticos de noticias — migrar a Payload CMS API en el futuro

export interface NewsItem {
  id: string
  slug: string
  title: string
  excerpt: string
  category: string
  date: string
  dateISO: string
  imageUrl: string
  imageAlt: string
  readTime: number
}

export const news: NewsItem[] = [
  {
    id: '1',
    slug: 'cadena-lactea-2024-equipo-consumidor',
    title: 'Cadena láctea en 2024: equipo y cercanía al consumidor',
    excerpt:
      'El año 2024 marcó un hito en la articulación entre productores, procesadores y consumidores. Revisamos los logros y desafíos del sector.',
    category: 'Sector',
    date: 'Dic 2024',
    dateISO: '2024-12-01',
    imageUrl: '/images/noticia-destacada.jpg',
    imageAlt: 'Ganado lechero holstein en potrero colombiano',
    readTime: 4,
  },
  {
    id: '2',
    slug: 'costos-produccion-colombia-vs-mundo',
    title: 'Costos de producción: Colombia vs. USA, Brasil y Nueva Zelanda',
    excerpt:
      'Un análisis comparativo de los costos del litro de leche en los principales países productores, con datos del IFCN para 2024.',
    category: 'Análisis',
    date: 'Nov 2024',
    dateISO: '2024-11-15',
    imageUrl: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?w=300&q=80&auto=format&fit=crop',
    imageAlt: 'Vacas lecheras en campo abierto, comparativo de producción',
    readTime: 6,
  },
  {
    id: '3',
    slug: 'fenomeno-nino-recomendaciones-productores',
    title: 'Recomendaciones para la temporada del Fenómeno del Niño',
    excerpt:
      'ANALAC y Agrosavia comparten guías prácticas para que los productores protejan sus hatos durante la época seca prolongada.',
    category: 'Clima',
    date: 'Oct 2024',
    dateISO: '2024-10-20',
    imageUrl: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=300&q=80&auto=format&fit=crop',
    imageAlt: 'Vacas pastando en campo colombiano durante época seca',
    readTime: 5,
  },
  {
    id: '4',
    slug: 'precio-leche-noviembre-2025',
    title: 'Precio de la leche en finca: noviembre 2025 cierra en $1.820',
    excerpt:
      'El precio al productor registró un incremento del 3,2% respecto a octubre, consolidando una tendencia positiva en el cierre del año.',
    category: 'Indicadores',
    date: 'Nov 2025',
    dateISO: '2025-11-30',
    imageUrl: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&q=80&auto=format&fit=crop',
    imageAlt: 'Leche fresca en recipiente metálico',
    readTime: 3,
  },
  {
    id: '5',
    slug: 'boletin-indicadores-noviembre-2025',
    title: 'Boletín de indicadores ANALAC — Noviembre 2025',
    excerpt:
      'Descargue el informe mensual con precios, acopio, exportaciones e indicadores de competitividad del sector lácteo colombiano.',
    category: 'Boletín',
    date: 'Nov 2025',
    dateISO: '2025-11-28',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80&auto=format&fit=crop',
    imageAlt: 'Gráficas de indicadores económicos',
    readTime: 2,
  },
  {
    id: '6',
    slug: 'colombia-exportaciones-lacteas-2024',
    title: 'Colombia consolida exportaciones lácteas a Venezuela y Ecuador',
    excerpt:
      'Las exportaciones de leche en polvo y quesos mostraron un crecimiento del 18% en 2024, con Venezuela como principal destino.',
    category: 'Comercio',
    date: 'Sep 2024',
    dateISO: '2024-09-10',
    imageUrl: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80&auto=format&fit=crop',
    imageAlt: 'Puerto de exportación con contenedores',
    readTime: 4,
  },
]

export const featuredNews = news.slice(0, 3)
