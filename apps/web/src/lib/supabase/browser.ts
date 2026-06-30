import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

let browserClient: SupabaseClient | null = null;

export const getSupabaseBrowser = () => {
  if (browserClient) return browserClient;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Faltan variables de entorno para inicializar Supabase. Verifica tu .env');
  }

  browserClient = createClient(supabaseUrl, supabaseAnonKey);
  return browserClient;
};
