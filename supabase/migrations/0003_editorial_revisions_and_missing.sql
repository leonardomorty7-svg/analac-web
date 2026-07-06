-- 1. Identidad y Acceso
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY, -- Auth UID de Supabase
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  global_role VARCHAR(50) DEFAULT 'user', -- 'user', 'moderator', 'admin'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE organization_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  org_role VARCHAR(50) DEFAULT 'editor', -- 'owner', 'editor', 'viewer'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, user_id)
);

-- 2. Relación con ANALAC
CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  membership_type VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  start_date DATE,
  end_date DATE,
  UNIQUE(organization_id)
);

CREATE TABLE verification_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  verified_by UUID REFERENCES user_profiles(id),
  verification_date TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT
);

-- 3. Contenido Extendido
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) UNIQUE NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE organization_services (
  organization_profile_id UUID REFERENCES organization_profiles(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  PRIMARY KEY (organization_profile_id, service_id)
);

CREATE TABLE galleries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_profile_id UUID REFERENCES organization_profiles(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption VARCHAR(255),
  display_order INT DEFAULT 0
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_profile_id UUID REFERENCES organization_profiles(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  is_public BOOLEAN DEFAULT true,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Flujo Editorial (Separación de Publicado vs Borrador)
CREATE TABLE profile_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_profile_id UUID REFERENCES organization_profiles(id) ON DELETE CASCADE,
  submitted_by UUID REFERENCES user_profiles(id),
  status profile_status_enum DEFAULT 'pending_review',
  revision_data JSONB NOT NULL, -- Contiene los campos propuestos a cambiar
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES user_profiles(id)
);

CREATE TABLE moderation_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  revision_id UUID REFERENCES profile_revisions(id) ON DELETE CASCADE,
  moderator_id UUID REFERENCES user_profiles(id),
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE publication_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_profile_id UUID REFERENCES organization_profiles(id) ON DELETE CASCADE,
  revision_id UUID REFERENCES profile_revisions(id),
  published_at TIMESTAMPTZ DEFAULT NOW(),
  published_by UUID REFERENCES user_profiles(id)
);
