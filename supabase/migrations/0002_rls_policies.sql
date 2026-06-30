-- Habilitar RLS en las tablas principales
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA: organizations
-- 1. Visitantes (Anon): Pueden ver la organización SOLO si tiene un perfil publicado.
CREATE POLICY "Public profiles are viewable by everyone" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_profiles 
      WHERE organization_profiles.organization_id = organizations.id 
      AND editorial_status = 'published'
    )
  );

-- 2. Administradores/Moderadores (Roles en Auth)
-- (Supone que los administradores/moderadores tienen un campo 'role' en JWT claims o una tabla user_roles)
CREATE POLICY "Admins can do everything on organizations" ON organizations
  FOR ALL USING (
    auth.jwt() ->> 'role' IN ('admin', 'moderator')
  );

-- POLÍTICAS PARA: organization_profiles
-- 1. Visitantes (Anon): Solo pueden ver perfiles publicados
CREATE POLICY "Published profiles viewable by everyone" ON organization_profiles
  FOR SELECT USING (
    editorial_status = 'published'
  );

-- 2. Admins/Moderadores: Todo
CREATE POLICY "Admins can do everything on profiles" ON organization_profiles
  FOR ALL USING (
    auth.jwt() ->> 'role' IN ('admin', 'moderator')
  );

-- POLÍTICAS RELACIONADAS (Cascada de visibilidad desde organization_profiles)
-- Locations
CREATE POLICY "Locations viewable if profile published" ON locations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_profiles 
      WHERE organization_profiles.organization_id = locations.organization_id
      AND editorial_status = 'published'
    )
  );

-- Contacts
CREATE POLICY "Contacts viewable if profile published" ON contacts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_profiles 
      WHERE organization_profiles.organization_id = contacts.organization_id
      AND editorial_status = 'published'
    )
  );

-- Products
CREATE POLICY "Products viewable if profile published" ON products_summary
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_profiles 
      WHERE organization_profiles.id = products_summary.organization_profile_id
      AND editorial_status = 'published'
    )
  );

-- FAQs
CREATE POLICY "FAQs viewable if profile published" ON faqs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_profiles 
      WHERE organization_profiles.id = faqs.organization_profile_id
      AND editorial_status = 'published'
    )
  );

-- Certifications
CREATE POLICY "Certifications viewable if profile published" ON certifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_profiles 
      WHERE organization_profiles.id = certifications.organization_profile_id
      AND editorial_status = 'published'
    )
  );

-- NOTA: Las políticas para los representantes empresariales (edición)
-- requerirán la futura tabla 'organization_users' vinculada al auth.uid().
-- Por ahora, estas políticas base aseguran que el frontend público lea correctamente.
