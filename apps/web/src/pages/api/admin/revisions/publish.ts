export const prerender = false;
import type { APIRoute } from 'astro';
import { publishRevision } from '../../../../services/admin/publish';
import { triggerDirectoryRebuild } from '../../../../services/admin/triggerRebuild';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const { user, supabase } = locals;
    if (!user) return new Response(JSON.stringify({ error: 'No autorizado' }), { status: 401 });

    const { data: admin } = await supabase.from('admin_users').select('*').eq('id', user.id).single();
    if (!admin) return new Response(JSON.stringify({ error: 'Acceso denegado' }), { status: 403 });

    // Solo Admin y SuperAdmin pueden publicar
    if (admin.role === 'analac_moderator') {
      return new Response(JSON.stringify({ error: 'Permisos insuficientes para publicar' }), { status: 403 });
    }

    const body = await request.json();
    const { revisionId } = body;

    if (!revisionId) {
      return new Response(JSON.stringify({ error: 'Faltan datos' }), { status: 400 });
    }

    const { data: rev } = await supabase.from('profile_revisions').select('status').eq('id', revisionId).single();
    if (rev?.status !== 'approved') {
      return new Response(JSON.stringify({ error: 'La revisión debe estar aprobada antes de publicarse' }), { status: 400 });
    }

    // Ejecutar lógica de transacción
    await publishRevision(supabase, revisionId);

    // Disparar hook de Vercel (no bloqueante, o loggeable si falla)
    // El deploy hook es best-effort
    triggerDirectoryRebuild().catch(err => console.error("Error en Deploy Hook:", err));

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
