import type { SupabaseClient } from '@supabase/supabase-js';

export async function publishRevision(supabase: SupabaseClient, revisionId: string) {
  // Llama a la función transaccional de Postgres
  const { data, error } = await supabase.rpc('publish_revision_transaction', { 
    p_revision_id: revisionId 
  });

  if (error) {
    throw new Error(`Error en la transacción de publicación: ${error.message}`);
  }

  return true;
}
