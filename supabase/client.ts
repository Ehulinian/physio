'use client';

/**
 * Supabase client for browser code ("use client" components).
 *
 * Note what changed from the previous `createClient` call: the session no
 * longer lives in localStorage, it lives in cookies. Three reasons:
 *
 *  1. The server has to read it. Cookies travel with every request, so a
 *     Server Component and middleware can see who is signed in. localStorage
 *     is invisible to the server, which makes protecting a route impossible
 *     before the page has already rendered.
 *
 *  2. localStorage is not reliable across an auth redirect. Safari treats
 *     storage written before a cross-site redirect differently from Chrome,
 *     and the symptom is a session that silently disappears on some browsers
 *     and not others.
 *
 *  3. Cookies can be httpOnly and Secure. localStorage is readable by any
 *     script on the page, so one XSS hands over the token.
 */

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
