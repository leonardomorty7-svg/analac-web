-- ==========================================
-- 1. ESTRATEGIA DE STORAGE (Buckets)
-- ==========================================
-- Insertar definición de Buckets (Si es compatible en entorno local Supabase)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('public-media', 'public-media', true, 5242880, '{image/jpeg, image/png, image/webp}'), -- 5MB limit
  ('private-docs', 'private-docs', false, 10485760, '{application/pdf}') -- 10MB limit
ON CONFLICT (id) DO NOTHING;

-- Políticas Storage: public-media
CREATE POLICY "Public Media is publicly accessible" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'public-media');

CREATE POLICY "Authenticated users can upload to public-media" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'public-media' AND auth.role() = 'authenticated');

-- Políticas Storage: private-docs
CREATE POLICY "Private Docs viewable by owners or admins" 
  ON storage.objects FOR SELECT 
  USING (
    bucket_id = 'private-docs' AND (
      (auth.uid() = owner) OR (auth.jwt() ->> 'role' IN ('admin', 'moderator'))
    )
  );

CREATE POLICY "Authenticated users can upload private-docs" 
  ON storage.objects FOR INSERT 
  WITH CHECK (bucket_id = 'private-docs' AND auth.role() = 'authenticated');


-- ==========================================
-- 2. ÍNDICES Y BÚSQUEDA (GIN / TEXT)
-- ==========================================
-- Índices para claves foráneas y búsquedas comunes
CREATE INDEX IF NOT EXISTS idx_org_slug ON organizations(slug);
CREATE INDEX IF NOT EXISTS idx_org_status ON organizations(status);
CREATE INDEX IF NOT EXISTS idx_profile_org_id ON organization_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_locations_org_id ON locations(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_cat_org_id ON organization_categories(organization_id);

-- Implementar búsqueda de texto completo (Full Text Search) con GIN
-- Requerido para buscar por: nombre de organización, resumen, descripción.
ALTER TABLE organization_profiles ADD COLUMN IF NOT EXISTS fts_vector tsvector;

-- Función para actualizar el vector de búsqueda automáticamente
CREATE OR REPLACE FUNCTION update_fts_vector() RETURNS trigger AS $$
BEGIN
  -- Construir el vector usando el resumen y descripción del perfil
  NEW.fts_vector := 
    setweight(to_tsvector('spanish', coalesce(NEW.summary, '')), 'A') ||
    setweight(to_tsvector('spanish', coalesce(NEW.description, '')), 'B');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_fts_vector
BEFORE INSERT OR UPDATE ON organization_profiles
FOR EACH ROW EXECUTE FUNCTION update_fts_vector();

-- Índice GIN sobre el vector
CREATE INDEX IF NOT EXISTS idx_profile_fts ON organization_profiles USING GIN (fts_vector);


-- ==========================================
-- 3. PRUEBAS RLS REPRODUCIBLES (Scripts)
-- ==========================================
/*
-- Script de prueba 1: Verificar que un Visitante anónimo no ve borradores
SET ROLE anon;
SELECT * FROM organization_profiles; 
-- El resultado SOLO debe incluir filas con editorial_status = 'published'.

-- Script de prueba 2: Administrador ve todo
SET ROLE authenticated;
-- Asumimos claims de admin
SELECT set_config('request.jwt.claims', '{"role":"admin"}', true);
SELECT * FROM organization_profiles;
-- El resultado debe incluir TODOS los perfiles (draft, published, etc).

-- Script de prueba 3: Verificar protección de lectura de private-docs
SET ROLE anon;
SELECT * FROM storage.objects WHERE bucket_id = 'private-docs';
-- Resultado vacío (Access denied).
*/
