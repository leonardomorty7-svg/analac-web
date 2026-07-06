-- admin_users table for Phase 6 (Moderation)
CREATE TYPE admin_role AS ENUM ('analac_moderator', 'analac_admin', 'super_admin');

CREATE TABLE admin_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role admin_role NOT NULL DEFAULT 'analac_moderator',
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Solo los mismos admins o superadmins pueden ver a otros admins
CREATE POLICY "Admins can view other admins"
ON admin_users FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true)
);

-- Las políticas de lectura general para profiles, revisions, y notas
-- Los administradores (cualquier rol) pueden leer todas las revisiones y perfiles
CREATE POLICY "Admins can view all profiles"
ON organization_profiles FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true)
);

CREATE POLICY "Admins can view all revisions"
ON profile_revisions FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true)
);

CREATE POLICY "Admins can update revisions"
ON profile_revisions FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true)
);

-- Notas de moderación para Admins
CREATE POLICY "Admins can view and create moderation notes"
ON moderation_notes FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true)
);

-- Triggers for updated_at
CREATE TRIGGER handle_updated_at_admin_users
  BEFORE UPDATE ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
