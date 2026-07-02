import type { SupabaseClient } from '@supabase/supabase-js';
import { organizationDraftSchema, organizationSubmitSchema } from '../../schemas/portalDraft';

export async function getActiveRevision(supabase: SupabaseClient, userId: string) {
  // Obtener org del usuario
  const { data: orgUser } = await supabase
    .from('organization_users')
    .select('organization_id')
    .eq('user_id', userId)
    .single();

  if (!orgUser) return null;

  // Obtener profile (o crearlo si no existe)
  let { data: profile } = await supabase
    .from('organization_profiles')
    .select('id')
    .eq('organization_id', orgUser.organization_id)
    .single();

  if (!profile) {
    // Crear el profile inicial en borrador si la empresa es nueva
    const { data: newProfile, error } = await supabase
      .from('organization_profiles')
      .insert({
        organization_id: orgUser.organization_id,
        editorial_status: 'draft',
        summary: ''
      })
      .select('id')
      .single();
    
    if (error || !newProfile) return null;
    profile = newProfile;
  }

  // Buscar revisión activa
  const { data: revision } = await supabase
    .from('profile_revisions')
    .select('*')
    .eq('organization_profile_id', profile.id)
    .in('status', ['draft', 'pending_review', 'changes_requested', 'rejected'])
    .order('submitted_at', { ascending: false })
    .limit(1)
    .single();

  return revision || null;
}

export async function createRevisionFromPublished(supabase: SupabaseClient, userId: string) {
  // Obtener org del usuario
  const { data: orgUser } = await supabase
    .from('organization_users')
    .select('organization_id')
    .eq('user_id', userId)
    .single();

  if (!orgUser) throw new Error("No organization linked");

  // Obtener profile
  const { data: profile } = await supabase
    .from('organization_profiles')
    .select(`
      id,
      summary,
      description,
      foundation_year,
      logo_url,
      cover_url,
      organizations (name)
    `)
    .eq('organization_id', orgUser.organization_id)
    .single();

  if (!profile) throw new Error("No profile found");

  // Leer otras relaciones (Simplificado para Fase 5B inicial)
  // Aquí construiríamos el JSON inicial
    const orgName = (() => {
      const orgs = profile.organizations as any;
      return (Array.isArray(orgs) ? orgs[0]?.name : orgs?.name) || '';
    })();

    const revisionData = {
      basicInfo: {
        name: orgName || '',
        foundation_year: profile.foundation_year || null,
        logo_url: profile.logo_url || '',
        cover_url: profile.cover_url || ''
      },
    summaryData: {
      summary: profile.summary || ''
    },
    descriptionData: {
      description: profile.description || ''
    }
    // TODO: Cargar contacts, locations, faqs si ya existían en el perfil público
  };

  const { data: newRevision, error } = await supabase
    .from('profile_revisions')
    .insert({
      organization_profile_id: profile.id,
      submitted_by: userId,
      status: 'draft',
      revision_data: revisionData
    })
    .select('*')
    .single();

  if (error) throw error;
  return newRevision;
}

export async function upsertRevisionDraft(supabase: SupabaseClient, revisionId: string, revisionData: any) {
  // Validar con esquema parcial Zod
  const result = organizationDraftSchema.safeParse(revisionData);
  if (!result.success) {
    throw new Error("Validation Error: " + result.error.message);
  }

  const { data, error } = await supabase
    .from('profile_revisions')
    .update({ 
      revision_data: result.data,
      // Status permanece igual
    })
    .eq('id', revisionId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export async function submitRevision(supabase: SupabaseClient, revisionId: string, revisionData: any) {
  // Validar esquema estricto Zod para envío
  const result = organizationSubmitSchema.safeParse(revisionData);
  if (!result.success) {
    throw new Error("Validation Error: El perfil no cumple con los campos obligatorios mínimos.");
  }

  const { data, error } = await supabase
    .from('profile_revisions')
    .update({ 
      revision_data: result.data,
      status: 'pending_review',
      submitted_at: new Date().toISOString()
    })
    .eq('id', revisionId)
    .select('*')
    .single();

  if (error) throw error;
  return data;
}

export function calculateProfileCompletion(revisionData: any): number {
  if (!revisionData) return 0;
  let score = 0;

  // Basic Info (15%)
  if (revisionData.basicInfo?.name) score += 5;
  if (revisionData.basicInfo?.logo_url) score += 5;
  if (revisionData.basicInfo?.cover_url) score += 5;

  // Summary & Description (20%)
  if (revisionData.summaryData?.summary) score += 10;
  if (revisionData.descriptionData?.description) score += 10;

  // Categories & Products (15%)
  if (revisionData.categories?.length > 0) score += 5;
  if (revisionData.products?.length > 0) score += 5;
  if (revisionData.services?.length > 0) score += 5;

  // Location (10%)
  if (revisionData.locationData?.department && revisionData.locationData?.city) score += 5;
  if (revisionData.locationData?.coverage?.length > 0) score += 5;

  // Contact & Social (15%)
  if (revisionData.contactData?.email && revisionData.contactData?.phone) score += 5;
  if (revisionData.contactData?.private_email) score += 5;
  if (revisionData.socialLinks?.length > 0) score += 5;

  // Media & Docs (15%)
  if (revisionData.mediaData?.gallery?.length > 0) score += 5;
  if (revisionData.docsData?.certifications?.length > 0) score += 5;
  if (revisionData.docsData?.private_docs?.length > 0) score += 5;

  // FAQs (5%)
  if (revisionData.faqs?.length > 0) score += 5;

  // Legal (5%)
  if (revisionData.legalData?.veracity_declaration) score += 5;

  return Math.min(score, 100);
}
