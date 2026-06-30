export const prerender = false;
import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { user, supabase } = locals;
    if (!user) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });

    const { data: admin } = await supabase.from('admin_users').select('*').eq('id', user.id).single();
    if (!admin) return new Response(JSON.stringify({ error: 'Acceso denegado' }), { status: 403 });

    const body = await request.json();
    const { revisionId, content, isVisible } = body;

    if (!revisionId || !content) {
      return new Response(JSON.stringify({ error: 'Faltan datos' }), { status: 400 });
    }

    const { error } = await supabase.from('moderation_notes').insert({
      revision_id: revisionId,
      author_id: user.id,
      content,
      is_visible_to_company: isVisible
    });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
