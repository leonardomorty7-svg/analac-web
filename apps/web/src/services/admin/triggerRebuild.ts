export async function triggerDirectoryRebuild() {
  const hookUrl = import.meta.env.VERCEL_DEPLOY_HOOK_URL;
  
  if (!hookUrl) {
    console.warn('VERCEL_DEPLOY_HOOK_URL no está configurado. La reconstrucción (Deploy) deberá hacerse manualmente.');
    return { success: false, reason: 'No hook URL' };
  }

  try {
    const response = await fetch(hookUrl, {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error(`Error disparando hook Vercel: ${response.status} ${response.statusText}`);
    }

    console.log('Hook de Vercel disparado exitosamente para reconstruir el Directorio.');
    return { success: true };
  } catch (error: any) {
    console.error('Fallo en triggerDirectoryRebuild:', error.message);
    throw error;
  }
}
