import type { APIRoute } from 'astro';
import { getSupabaseServer } from '../../../lib/supabase/server';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const supabase = getSupabaseServer(request, cookies);
  await supabase.auth.signOut();
  return redirect('/portal-aliados/iniciar-sesion');
};
