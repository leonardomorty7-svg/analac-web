import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseServiceKey) {
  console.warn('SUPABASE_SERVICE_ROLE_KEY no está definida. Funciones administrativas fallarán.');
}

// Cliente ADMINISTRATIVO (Service Role). 
// ¡NUNCA USAR EN CLIENTE! Solo en endpoints del servidor bajo estricta autorización.
// Salta las políticas RLS.
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
