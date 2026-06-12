// src/data/allies.ts
// Aliados estratégicos de ANALAC — migrar a Payload CMS API

export interface Ally {
  id: string
  name: string
  description: string
  category: string
  url?: string
}

export const allies: Ally[] = [
  {
    id: 'fedegan',
    name: 'Fedegán',
    description: 'Federación Colombiana de Ganaderos. Aliado estratégico en política ganadera y bienestar animal.',
    category: 'Gremial',
    url: 'https://www.fedegan.org.co',
  },
  {
    id: 'ica',
    name: 'ICA',
    description: 'Instituto Colombiano Agropecuario. Entidad que regula la sanidad animal y la inocuidad alimentaria.',
    category: 'Gobierno',
    url: 'https://www.ica.gov.co',
  },
  {
    id: 'ifcn',
    name: 'IFCN',
    description: 'International Farm Comparison Network. Red global de investigación en economía lechera.',
    category: 'Internacional',
    url: 'https://www.ifcndairy.org',
  },
  {
    id: 'minagricultura',
    name: 'Ministerio de Agricultura',
    description: 'Ministerio de Agricultura y Desarrollo Rural de Colombia. Rector de la política agropecuaria.',
    category: 'Gobierno',
    url: 'https://www.minagricultura.gov.co',
  },
  {
    id: 'agrosavia',
    name: 'Agrosavia',
    description: 'Corporación Colombiana de Investigación Agropecuaria. Innovación y transferencia de tecnología.',
    category: 'I+D',
    url: 'https://www.agrosavia.co',
  },
  {
    id: 'madr',
    name: 'MADR',
    description: 'Ministerio de Agricultura y Desarrollo Rural — apoyo a programas de financiación sectorial.',
    category: 'Gobierno',
  },
  {
    id: 'corpoica',
    name: 'Corpoica',
    description: 'Antecedente de Agrosavia, con décadas de investigación en genética y nutrición bovina.',
    category: 'I+D',
  },
  {
    id: 'finagro',
    name: 'Finagro',
    description: 'Fondo para el Financiamiento del Sector Agropecuario. Crédito y financiación para productores.',
    category: 'Financiero',
    url: 'https://www.finagro.com.co',
  },
]

export const allyNames = allies.map((a) => a.name)
