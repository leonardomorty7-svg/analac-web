/**
 * Tipos base para el Servicio de Capacidades (Permissions Matrix) de Red ANALAC.
 * Esto sienta las bases no destructivas para la evaluación de permisos unificados.
 */

export type ModuleName = 'directory' | 'showcase' | 'community' | 'observatory' | 'opportunities';
export type Capability = 
  | 'view_public'
  | 'manage_profile'
  | 'publish_profile'
  | 'manage_products'
  | 'participate_community'
  | 'view_advanced_metrics'
  | 'manage_organization'
  | 'can_access_observatory_basic'
  | 'can_access_observatory_advanced'
  | 'can_download_observatory_reports'
  | 'can_compare_observatory_data'
  | 'can_save_observatory_queries'
  | 'can_receive_observatory_alerts';

export interface UserContext {
  userId: string;
  globalRole: 'user' | 'moderator' | 'admin';
  organizationId?: string;
  orgRole?: 'owner' | 'editor' | 'viewer';
  membershipType?: string;
  membershipStatus?: 'active' | 'suspended' | 'expired' | 'pending';
}

export interface ModuleAccess {
  module: ModuleName;
  isAccessible: boolean;
  status: 'active' | 'coming_soon' | 'requires_membership' | 'suspended';
  capabilities: Capability[];
}

/**
 * Función conceptual para resolver las capacidades de un usuario en el ecosistema.
 * @param context El contexto unificado (Identidad + Organización + Membresía).
 * @returns Array con los accesos y capacidades por módulo.
 */
export function resolveUserCapabilities(context: UserContext): ModuleAccess[] {
  const isAdmin = context.globalRole === 'admin';
  const hasActiveOrg = context.organizationId && context.orgRole;
  const isMember = context.membershipStatus === 'active';

  return [
    {
      module: 'directory',
      isAccessible: true,
      status: hasActiveOrg ? 'active' : 'requires_membership',
      capabilities: isAdmin ? ['manage_profile', 'publish_profile'] : (hasActiveOrg ? ['manage_profile'] : ['view_public'])
    },
    {
      module: 'showcase',
      isAccessible: isAdmin || isMember,
      status: 'coming_soon',
      capabilities: []
    },
    {
      module: 'community',
      isAccessible: isAdmin || isMember,
      status: 'requires_membership',
      capabilities: []
    },
    {
      module: 'observatory',
      isAccessible: true, // Nivel 1 es abierto
      status: 'active', // O 'requires_membership' para avanzado
      capabilities: [
        'can_access_observatory_basic',
        'view_public',
        ...(isMember ? [
          'view_advanced_metrics' as Capability,
          'can_access_observatory_advanced' as Capability,
          'can_download_observatory_reports' as Capability,
          'can_compare_observatory_data' as Capability,
          'can_save_observatory_queries' as Capability,
          'can_receive_observatory_alerts' as Capability
        ] : [])
      ]
    }
  ];
}
