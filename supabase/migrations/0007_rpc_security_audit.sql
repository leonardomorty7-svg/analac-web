-- 0007_rpc_security_audit.sql
-- Corrección de seguridad para la función de publicación

-- 1. Revocar ejecución pública
REVOKE EXECUTE ON FUNCTION publish_revision_transaction(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION publish_revision_transaction(UUID) TO authenticated;

-- 2. Redefinir la función con search_path y validación explícita de admin
CREATE OR REPLACE FUNCTION publish_revision_transaction(p_revision_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_profile_id UUID;
  v_status VARCHAR;
  v_data JSONB;
  
  v_city VARCHAR;
  v_dept VARCHAR;
  v_address VARCHAR;
  
  v_email VARCHAR;
  v_phone VARCHAR;
  v_website VARCHAR;
  
  -- Iterators
  item JSONB;
  i INT;
  
  v_caller_uid UUID;
  v_is_admin BOOLEAN;
BEGIN
  -- 1. Validar Identidad dentro de PostgreSQL
  v_caller_uid := auth.uid();
  
  IF v_caller_uid IS NULL THEN
    RAISE EXCEPTION 'Usuario no autenticado (auth.uid() es NULL)';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = v_caller_uid AND is_active = true
  ) INTO v_is_admin;

  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Acceso denegado: el usuario no tiene rol de administrador activo.';
  END IF;

  -- 2. Obtener la revisión
  SELECT organization_id, status, revision_data
  INTO v_org_id, v_status, v_data
  FROM profile_revisions
  WHERE id = p_revision_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Revisión no encontrada';
  END IF;

  IF v_status != 'approved' THEN
    RAISE EXCEPTION 'La revisión no está en estado "approved"';
  END IF;

  -- 3. Asegurar el perfil
  SELECT id INTO v_profile_id FROM organization_profiles WHERE organization_id = v_org_id;
  
  IF v_profile_id IS NULL THEN
    INSERT INTO organization_profiles (organization_id, summary, description, foundation_year, logo_url, cover_url, editorial_status)
    VALUES (
      v_org_id,
      COALESCE(v_data->'summaryData'->>'summary', ''),
      v_data->'descriptionData'->>'description',
      (v_data->'basicInfo'->>'foundation_year')::INT,
      v_data->'basicInfo'->>'logo_url',
      v_data->'basicInfo'->>'cover_url',
      'published'
    ) RETURNING id INTO v_profile_id;
  ELSE
    UPDATE organization_profiles
    SET 
      summary = COALESCE(v_data->'summaryData'->>'summary', ''),
      description = v_data->'descriptionData'->>'description',
      foundation_year = (v_data->'basicInfo'->>'foundation_year')::INT,
      logo_url = v_data->'basicInfo'->>'logo_url',
      cover_url = v_data->'basicInfo'->>'cover_url',
      editorial_status = 'published',
      updated_at = NOW()
    WHERE id = v_profile_id;
  END IF;

  -- 4. Actualizar tabla Organizations
  IF v_data->'basicInfo'->>'name' IS NOT NULL THEN
    UPDATE organizations SET name = v_data->'basicInfo'->>'name' WHERE id = v_org_id;
  END IF;

  -- 5. Sub-tablas Relacionales (Limpieza e Inserción)
  
  -- 5.1 Locations
  DELETE FROM locations WHERE organization_id = v_org_id;
  v_city := v_data->'locationData'->>'city';
  v_dept := v_data->'locationData'->>'department';
  v_address := v_data->'locationData'->>'address';
  
  IF v_city IS NOT NULL AND v_dept IS NOT NULL THEN
    INSERT INTO locations (organization_id, city, department, address, is_headquarters)
    VALUES (v_org_id, v_city, v_dept, v_address, true);
  END IF;

  -- Coverage
  DELETE FROM coverage_areas WHERE organization_id = v_org_id;
  IF jsonb_typeof(v_data->'locationData'->'coverage') = 'array' THEN
    FOR item IN SELECT * FROM jsonb_array_elements_text(v_data->'locationData'->'coverage')
    LOOP
      INSERT INTO coverage_areas (organization_id, region_name) VALUES (v_org_id, item);
    END LOOP;
  END IF;

  -- 5.2 Contacts
  DELETE FROM contacts WHERE organization_id = v_org_id;
  IF v_data->'contactData' IS NOT NULL THEN
    v_email := v_data->'contactData'->>'email';
    v_phone := v_data->'contactData'->>'phone';
    v_website := v_data->'contactData'->>'website';
    
    INSERT INTO contacts (organization_id, email, phone, website, is_primary)
    VALUES (v_org_id, v_email, v_phone, v_website, true);
  END IF;

  -- 5.3 Social Links
  DELETE FROM social_links WHERE organization_id = v_org_id;
  IF jsonb_typeof(v_data->'socialLinks') = 'array' THEN
    FOR item IN SELECT * FROM jsonb_array_elements(v_data->'socialLinks')
    LOOP
      INSERT INTO social_links (organization_id, platform, url)
      VALUES (v_org_id, item->>'platform', item->>'url');
    END LOOP;
  END IF;

  -- 5.4 FAQs
  DELETE FROM faqs WHERE organization_profile_id = v_profile_id;
  IF jsonb_typeof(v_data->'faqs') = 'array' THEN
    i := 0;
    FOR item IN SELECT * FROM jsonb_array_elements(v_data->'faqs')
    LOOP
      INSERT INTO faqs (organization_profile_id, question, answer, display_order)
      VALUES (v_profile_id, item->>'question', item->>'answer', i);
      i := i + 1;
    END LOOP;
  END IF;

  -- 5.5 Products/Services
  DELETE FROM products_summary WHERE organization_profile_id = v_profile_id;
  IF jsonb_typeof(v_data->'products') = 'array' THEN
    i := 0;
    FOR item IN SELECT * FROM jsonb_array_elements_text(v_data->'products')
    LOOP
      INSERT INTO products_summary (organization_profile_id, name, display_order)
      VALUES (v_profile_id, item, i);
      i := i + 1;
    END LOOP;
  END IF;

  -- 6. Finalizar transacción
  UPDATE profile_revisions SET status = 'published' WHERE id = p_revision_id;

  RETURN TRUE;
END;
$$;
