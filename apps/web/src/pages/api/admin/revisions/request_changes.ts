export const prerender = false;
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { user, supabase } = locals;
    if (!user) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });

    const { data: admin } = await supabase.from('admin_users').select('*').eq('id', user.id).single();
    if (!admin) return new Response(JSON.stringify({ error: 'Acceso denegado' }), { status: 403 });

    const body = await request.json();
    const { revisionId } = body;

    if (!revisionId) {
      return new Response(JSON.stringify({ error: 'Faltan datos' }), { status: 400 });
    }

    // 1. Verificar estado actual (debe ser pending_review)
    const { data: rev } = await supabase.from('profile_revisions').select('status').eq('id', revisionId).single();
    if (rev?.status !== 'pending_review') {
      return new Response(JSON.stringify({ error: 'Estado inválido para esta acción' }), { status: 400 });
    }

    // 2. Actualizar a changes_requested
    const { error } = await supabase
      .from('profile_revisions')
      .update({ status: 'changes_requested' })
      .eq('id', revisionId);

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
