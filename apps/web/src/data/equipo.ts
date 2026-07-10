// src/data/equipo.ts
// Fuente única de datos del equipo y la junta directiva de ANALAC.
// Se usa en /quienes-somos, en las firmas de autor de blogs/noticias
// (componente AuthorSignature) y en /preview/firmas.

export interface TeamMember {
  id: string
  nombre: string
  cargo: string
  descripcion: string
  imagen: string
  linkedin: string
  grupo: 'equipo' | 'junta'
  oculto?: boolean
}

export const equipo: TeamMember[] = [
  {
    id: 'andres-ramirez',
    nombre: 'Andrés Ramírez',
    cargo: 'Dirección Ejecutiva',
    descripcion: 'Lidera la estrategia institucional y representa a ANALAC ante los diferentes actores del sector.',
    imagen: '/images/equipo/andres_ramirez.png',
    linkedin: '#',
    grupo: 'equipo',
  },
  {
    id: 'laura-hernandez',
    nombre: 'Laura Hernández',
    cargo: 'Área Técnica',
    descripcion: 'Desarrolla estudios, indicadores y análisis para apoyar la toma de decisiones del gremio.',
    imagen: '/images/equipo/laura_hernandez.png',
    linkedin: '#',
    grupo: 'equipo',
  },
  {
    id: 'felipe-gonzalez',
    nombre: 'Felipe González',
    cargo: 'Comunicaciones',
    descripcion: 'Gestiona la comunicación institucional, campañas y relacionamiento con productores y aliados.',
    imagen: '/images/equipo/felipe_gonzalez.png',
    linkedin: '#',
    grupo: 'equipo',
  },
  {
    id: 'sandra-morales',
    nombre: 'Sandra Morales',
    cargo: 'Administración',
    descripcion: 'Coordina los procesos administrativos y el soporte operativo de la asociación.',
    imagen: '/images/equipo/sandra_morales.png',
    linkedin: '#',
    grupo: 'equipo',
    oculto: true,
  },
  {
    id: 'javier-perez',
    nombre: 'Javier Pérez',
    cargo: 'Presidente Ejecutivo',
    descripcion: 'Lidera la estrategia institucional y representa a ANALAC ante organismos públicos y privados.',
    imagen: '/images/equipo/javier_perez_new.png',
    linkedin: '#',
    grupo: 'junta',
  },
  {
    id: 'maria-lopez',
    nombre: 'María López',
    cargo: 'Directora Gremial',
    descripcion: 'Supervisa la integración regional, garantizando la articulación efectiva de todos los productores afiliados.',
    imagen: '/images/equipo/maria_lopez_new.png',
    linkedin: '#',
    grupo: 'junta',
  },
  {
    id: 'carlos-gomez',
    nombre: 'Carlos Gómez',
    cargo: 'Secretario General',
    descripcion: 'Coordina la estructura administrativa, legal y operativa, asegurando el cumplimiento normativo del gremio.',
    imagen: '/images/equipo/carlos_gomez_new.png',
    linkedin: '#',
    grupo: 'junta',
  },
]

export function getAutor(id: string): TeamMember | undefined {
  return equipo.find((m) => m.id === id)
}
