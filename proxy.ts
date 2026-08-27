import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js 16 renamed this convention from `middleware.ts` to `proxy.ts` —
 * "middleware" was being read as the Express kind, which it is not. Same
 * behaviour, it just runs at the network edge in front of the app.
 *
 * Runs before every matched request. Two jobs:
 *
 *  1. Refresh the access token. It expires after an hour, and only code that
 *     can write cookies can renew it — a Server Component cannot. Without this
 *     a therapist gets logged out mid-session.
 *
 *  2. Turn away anonymous requests before the page renders. This is the layer
 *     that used to be missing entirely: every clinical record in the app was
 *     readable by anyone who knew the URL.
 *
 * It is still not the security boundary. Anyone can call the Supabase API
 * directly with the anon key from the bundle and skip Next.js completely.
 * The real boundary is Row Level Security in Postgres; this just keeps honest
 * requests honest and gives the user a sensible redirect.
 */

// `/reset-password` must stay public even though the user arrives with a
// recovery session: bouncing them to /clients would skip the whole point.
// `/privacy` has to be readable before anyone decides to register at all.
const PUBLIC_ROUTES = [
	'/sign-in',
	'/sign-up',
	'/reset-password',
	'/privacy',
	'/auth',
];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Written twice on purpose: once onto the request so the rest of
          // this function sees the refreshed token, once onto the response so
          // the browser stores it.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Do not remove or reorder: getUser() is what actually performs the refresh.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/sign-in';
    // Remember where they were headed so sign-in can send them back.
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (
    user &&
    (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up'))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/clients';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Everything except static assets and images. Running this on every .png
     * would mean an auth check per file for no benefit.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
