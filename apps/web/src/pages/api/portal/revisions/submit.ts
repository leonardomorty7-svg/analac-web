import type { APIRoute } from 'astro';
import { getSupabaseServer } from '../../../../lib/supabase/server';
import { submitRevision } from '../../../../services/portal/revisions';

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = getSupabaseServer(request, cookies);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });
    }

    const body = await request.json();
    const revisionId = body.revisionId;
    const revisionData = body.revisionData;

    if (!revisionId) {
      return new Response(JSON.stringify({ error: 'Falta revisionId' }), { status: 400 });
    }

    const updated = await submitRevision(supabase, revisionId, revisionData);

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
