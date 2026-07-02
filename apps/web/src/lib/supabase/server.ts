import { createServerClient, parseCookieHeader } from '@supabase/ssr';
import type { AstroCookies } from 'astro';

// Polyfill for Node.js 20 environment missing native WebSocket
if (typeof process !== 'undefined' && typeof globalThis.WebSocket === 'undefined') {
  import('ws').then(ws => {
    (globalThis as any).WebSocket = ws.WebSocket || ws.default || ws;
  });
}

export function getSupabaseServer(request: Request, cookies: AstroCookies) {
  const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || '';

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        const parsedCookies = parseCookieHeader(request.headers.get('Cookie') ?? '');
        return parsedCookies.map(c => ({ name: c.name, value: c.value || '' }));
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          if (!value) {
            cookies.delete(name, { path: '/' });
          } else {
            cookies.set(name, value, {
              ...options,
              path: '/',
              httpOnly: true,
              secure: import.meta.env.PROD,
              sameSite: 'lax',
            });
          }
        });
      },
    },
  });
}
