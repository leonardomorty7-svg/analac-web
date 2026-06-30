-- Limpiar datos existentes (Solo para entornos de desarrollo)
TRUNCATE TABLE organizations CASCADE;
TRUNCATE TABLE categories CASCADE;

-- Crear categorías base
INSERT INTO categories (id, slug, name, description) VALUES 
('11111111-1111-1111-1111-111111111111', 'procesamiento', 'Procesamiento', 'Empresas transformadoras de leche y derivados.'),
('22222222-2222-2222-2222-222222222222', 'sanidad-animal', 'Sanidad Animal', 'Laboratorios e insumos veterinarios.'),
('33333333-3333-3333-3333-333333333333', 'acopio', 'Acopio y Comercialización', 'Cooperativas y asociaciones de recolección.'),
('44444444-4444-4444-4444-444444444444', 'maquinaria', 'Maquinaria y Equipos', 'Equipos de ordeño, frío y tecnología.');

-- Organización 1: Lácteos del Valle
WITH org AS (
  INSERT INTO organizations (id, slug, name, org_type, status, verified) 
  VALUES ('aaaa0000-0000-0000-0000-000000000001', 'lacteos-del-valle', 'Lácteos del Valle S.A.', 'Empresa transformadora', 'Asociado ANALAC', true)
  RETURNING id
),
prof AS (
  INSERT INTO organization_profiles (id, organization_id, editorial_status, summary, description, foundation_year, logo_url)
  SELECT 'bbbb0000-0000-0000-0000-000000000001', id, 'published', 
  'Lácteos del Valle S.A. es una empresa transformadora ubicada en Cali, especializada en el procesamiento de derivados lácteos de alta calidad.',
  'Con más de 20 años de experiencia, procesamos leche cruda proveniente de ganaderías sostenibles de la región.', 2004,
  'https://placehold.co/150x150/1a4a2a/ffffff?text=LDV'
  FROM org
  RETURNING id
)
INSERT INTO locations (organization_id, city, department) SELECT id, 'Cali', 'Valle del Cauca' FROM org;

INSERT INTO coverage_areas (organization_id, region_name) VALUES ('aaaa0000-0000-0000-0000-000000000001', 'Valle del Cauca'), ('aaaa0000-0000-0000-0000-000000000001', 'Cauca');
INSERT INTO organization_categories (organization_id, category_id) VALUES ('aaaa0000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111');
INSERT INTO contacts (organization_id, email, phone, website) VALUES ('aaaa0000-0000-0000-0000-000000000001', 'contacto@lacteosdelvalle.com.co', '+57 300 123 4567', 'www.lacteosdelvalle.com.co');
INSERT INTO products_summary (organization_profile_id, name) VALUES ('bbbb0000-0000-0000-0000-000000000001', 'Quesos madurados y frescos'), ('bbbb0000-0000-0000-0000-000000000001', 'Yogures con probióticos');

-- Organización 2: Agrovet Innovación (En Borrador / No Publicada)
WITH org AS (
  INSERT INTO organizations (id, slug, name, org_type, status, verified) 
  VALUES ('aaaa0000-0000-0000-0000-000000000002', 'agrovet-innovacion', 'Agrovet Innovación', 'Proveedor', 'Aliado Estratégico', true)
  RETURNING id
),
prof AS (
  INSERT INTO organization_profiles (id, organization_id, editorial_status, summary, description, foundation_year, logo_url)
  SELECT 'bbbb0000-0000-0000-0000-000000000002', id, 'draft', -- NO PUBLICADO
  'Agrovet Innovación es un proveedor de insumos de sanidad animal.',
  'Proveemos soluciones integrales para mejorar la salud del hato lechero.', 2012,
  'https://placehold.co/150x150/f8fcf9/1a4a2a?text=AGV'
  FROM org
  RETURNING id
)
INSERT INTO locations (organization_id, city, department) SELECT id, 'Bogotá', 'Cundinamarca' FROM org;
INSERT INTO organization_categories (organization_id, category_id) VALUES ('aaaa0000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222');
