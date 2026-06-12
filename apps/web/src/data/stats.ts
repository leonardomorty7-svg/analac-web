// src/data/stats.ts
// Indicadores del sector lácteo — migrar a Payload CMS API

export interface Stat {
  value: string
  label: string
  sublabel?: string
}

export interface Indicator {
  value: string
  label: string
  sublabel: string
  trend: 'up' | 'down' | 'stable'
  trendValue: string
}

export const homeStats: Stat[] = [
  { value: '68+', label: 'Años de trayectoria', sublabel: 'Desde 1957' },
  { value: '$1.820', label: 'Precio litro nov. 2025', sublabel: 'COP / litro en finca' },
  { value: '7.200M', label: 'Litros/año en Colombia', sublabel: 'Producción nacional' },
  { value: '400K+', label: 'Productores representados', sublabel: 'En todo el país' },
]

export const sectorIndicators: Indicator[] = [
  {
    value: '$1.820',
    label: 'Precio litro en finca',
    sublabel: 'noviembre 2025',
    trend: 'up',
    trendValue: '↑ 3,2% vs oct.',
  },
  {
    value: '98,4%',
    label: 'Tasa de acopio formal',
    sublabel: 'sobre producción total',
    trend: 'up',
    trendValue: '↑ 0,8%',
  },
  {
    value: '7,2B L',
    label: 'Producción anual',
    sublabel: 'litros acumulados 2025',
    trend: 'stable',
    trendValue: '↔ Estable',
  },
  {
    value: '12',
    label: 'Departamentos activos',
    sublabel: 'con acopio reportado',
    trend: 'up',
    trendValue: '↑ 1 nuevo',
  },
]
