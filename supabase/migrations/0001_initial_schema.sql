-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create fallback function for uuid_generate_v4 to prevent schema path errors
CREATE OR REPLACE FUNCTION public.uuid_generate_v4()
RETURNS uuid AS $$
  SELECT gen_random_uuid();
$$ LANGUAGE sql;

-- 1. Enums
CREATE TYPE profile_status_enum AS ENUM (
  'draft', 
  'pending_review', 
  'changes_requested', 
  'approved', 
  'published', 
  'suspended', 
  'rejected', 
  'archived'
);

CREATE TYPE organization_type_enum AS ENUM (
  'Empresa transformadora', 
  'Proveedor', 
  'Cooperativa', 
  'Asociación', 
  'Academia', 
  'Institución Pública',
  'Otro'
);

-- 2. Identidad de la Organización (Core)
-- Esta tabla aloja la identidad inmutable que persistirá incluso si el perfil público es archivado
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  org_type organization_type_enum NOT NULL,
  status VARCHAR(100) DEFAULT 'Asociado', -- e.g. "Asociado ANALAC", "Aliado Comercial"
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Perfil Empresarial (Contenido AEO y Público)
-- Aloja la información enriquecida que atraviesa estados editoriales
CREATE TABLE organization_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  editorial_status profile_status_enum DEFAULT 'draft',
  summary VARCHAR(300) NOT NULL, -- Obligatorio para AEO
  description TEXT,
  foundation_year INT,
  logo_url TEXT,
  cover_url TEXT,
  update_history JSONB DEFAULT '[]', -- Para trazar auditoría de cambios
  source_references JSONB DEFAULT '[]', -- Para AEO: citas o verificaciones
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id)
);

-- 4. Categorías
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE organization_categories (
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (organization_id, category_id)
);

-- 5. Ubicación y Cobertura
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  city VARCHAR(255) NOT NULL,
  department VARCHAR(255) NOT NULL,
  address TEXT,
  is_headquarters BOOLEAN DEFAULT true
);

CREATE TABLE coverage_areas (
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  region_name VARCHAR(255) NOT NULL, -- e.g. "Valle del Cauca", "Nacional"
  PRIMARY KEY (organization_id, region_name)
);

-- 6. Contactos
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(255),
  is_primary BOOLEAN DEFAULT true
);

CREATE TABLE social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL, -- e.g. "LinkedIn", "Instagram"
  url TEXT NOT NULL
);

-- 7. Contenidos Específicos
CREATE TABLE products_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_profile_id UUID REFERENCES organization_profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  display_order INT DEFAULT 0
);

CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_profile_id UUID REFERENCES organization_profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  document_url TEXT, -- URL en bucket private-docs
  valid_until DATE
);

CREATE TABLE faqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_profile_id UUID REFERENCES organization_profiles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  display_order INT DEFAULT 0
);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers de timestamp
CREATE TRIGGER update_organizations_modtime
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_organization_profiles_modtime
  BEFORE UPDATE ON organization_profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
