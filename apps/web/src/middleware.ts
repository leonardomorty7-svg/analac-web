import { defineMiddleware } from 'astro:middleware';
import { getSupabaseServer } from './lib/supabase/server';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, request, cookies, redirect, locals } = context;

  const isDynamicRoute = 
    url.pathname.startsWith('/portal-aliados') || 
    url.pathname.startsWith('/admin-analac') || 
    url.pathname.startsWith('/api');

  if (isDynamicRoute) {
    // 1. Instanciar Supabase Globalmente para SSR
    const supabase = getSupabaseServer(request, cookies);
    const { data: { user } } = await supabase.auth.getUser();

    locals.supabase = supabase;
    locals.user = user || null;
  }

  // 2. Proteger rutas /portal-aliados
  if (url.pathname.startsWith('/portal-aliados')) {
    const isAuthRoute = url.pathname.startsWith('/portal-aliados/iniciar-sesion') ||
                        url.pathname.startsWith('/portal-aliados/recuperar-contrasena') ||
                        url.pathname.startsWith('/portal-aliados/actualizar-password');

    if (!locals.user && !isAuthRoute) {
      return redirect('/portal-aliados/iniciar-sesion');
    }

    if (locals.user && isAuthRoute) {
      return redirect('/portal-aliados');
    }
  }

  // 3. Obtener la respuesta normal
  const response = await next();

  // 4. Inyectar cabecera X-Robots-Tag para bloquear indexación en rutas protegidas/API
  if (
    url.pathname.startsWith('/portal-aliados') ||
    url.pathname.startsWith('/admin-analac') ||
    url.pathname.startsWith('/api') ||
    url.pathname === '/404'
  ) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  }

  return response;
});
