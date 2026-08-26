import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Supabase client for Server Components, Route Handlers and Server Actions.
 *
 * A new client per request, not a module-level singleton: it closes over that
 * request's cookies, and sharing one across requests would leak one user's
 * session into another's response.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Components cannot set cookies. That is fine — the
            // middleware refreshes the session on every request, so the only
            // thing lost here is a duplicate write.
          }
        },
      },
    },
  );
}

/**
 * The signed-in therapist, or null.
 *
 * Uses getUser(), not getSession(). getSession() reads the cookie and trusts
 * it; getUser() verifies the token with Supabase. On the server, where the
 * cookie is attacker-controllable input, only the verified one counts.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, client_id')
    .eq('id', user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? '',
    fullName: profile?.full_name ?? user.email ?? '',
    role: (profile?.role ?? 'patient') as 'patient' | 'clinician',
  };
}
