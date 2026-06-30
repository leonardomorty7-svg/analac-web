import type { APIRoute } from 'astro';
import { getSupabaseServer } from '../../../../lib/supabase/server';
import { upsertRevisionDraft, getActiveRevision, createRevisionFromPublished } from '../../../../services/portal/revisions';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = getSupabaseServer(request, cookies);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
    }

    const body = await request.json();
    let revisionId = body.revisionId;
    const revisionData = body.revisionData;

    // Si no hay revisionId, buscar la activa o crear una desde el publicado
    if (!revisionId) {
      let active = await getActiveRevision(supabase, user.id);
      if (!active) {
        active = await createRevisionFromPublished(supabase, user.id);
      }
      revisionId = active.id;
    }

    const updated = await upsertRevisionDraft(supabase, revisionId, revisionData);

    return new Response(JSON.stringify(updated), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
