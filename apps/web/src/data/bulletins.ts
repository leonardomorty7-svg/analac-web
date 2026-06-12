// src/data/bulletins.ts
// Boletines descargables — migrar a Payload CMS API

export interface Bulletin {
  id: string
  title: string
  month: string
  year: number
  pdfUrl: string
  coverColor: string
  highlights: string[]
}

export const bulletins: Bulletin[] = [
  {
    id: 'nov-2025',
    title: 'Boletín de Indicadores ANALAC',
    month: 'Noviembre',
    year: 2025,
    pdfUrl: 'https://analac.org/wp-content/uploads/2025/12/NOV-2025-BOLETIN-INDICADORES-ANALAC.pdf',
    coverColor: '#0f2211',
    highlights: ['Precio litro: $1.820', 'Acopio: 98,4%', 'Exportaciones +12%'],
  },
  {
    id: 'oct-2025',
    title: 'Boletín de Indicadores ANALAC',
    month: 'Octubre',
    year: 2025,
    pdfUrl: 'https://analac.org/wp-content/uploads/2025/11/OCT-2025-BOLETIN-INDICADORES-ANALAC.pdf',
    coverColor: '#1a3d1f',
    highlights: ['Precio litro: $1.763', 'Producción +1,2%', 'Nuevos mercados'],
  },
  {
    id: 'sep-2025',
    title: 'Boletín de Indicadores ANALAC',
    month: 'Septiembre',
    year: 2025,
    pdfUrl: 'https://analac.org/wp-content/uploads/2025/10/SEP-2025-BOLETIN-INDICADORES-ANALAC.pdf',
    coverColor: '#0f2211',
    highlights: ['Análisis Fenómeno Niño', 'Costos insumos', 'Comparativo regional'],
  },
  {
    id: 'ago-2025',
    title: 'Boletín de Indicadores ANALAC',
    month: 'Agosto',
    year: 2025,
    pdfUrl: 'https://analac.org/wp-content/uploads/2025/09/AGO-2025-BOLETIN-INDICADORES-ANALAC.pdf',
    coverColor: '#1a3d1f',
    highlights: ['Precio litro: $1.701', 'Temporada de lluvias', 'Mercado Venezolano'],
  },
]

export const latestBulletin = bulletins[0]!
