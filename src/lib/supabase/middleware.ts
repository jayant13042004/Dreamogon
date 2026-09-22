import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  // Protected routes - redirect to login if not authenticated
  const protectedPaths = [
    '/dashboard',
    '/dream',
    '/dreams',
    '/insights',
    '/chat',
    '/calendar',
    '/settings',
    '/world',
    '/collection',
  ];
  const isProtected = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path));

  // Redirect authenticated users away from auth pages
  const authPaths = ['/login', '/signup', '/forgot-password'];
  const isAuthPage = authPaths.some(path => request.nextUrl.pathname.startsWith(path));

  // Check if any Supabase auth cookies exist
  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some(
    c => c.name.startsWith('sb-') && (c.name.includes('-auth-token') || c.name.endsWith('-token'))
  );

  // 1. Fast path: Public page with no auth cookie -> return immediately with zero network delay
  if (!isProtected && !isAuthPage && !hasAuthCookie) {
    return supabaseResponse;
  }

  // 2. Fast path: Protected route with no auth cookie -> redirect to login immediately without network delay
  if (isProtected && !hasAuthCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your_supabase')) {
    if (isProtected) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      return NextResponse.redirect(url);
    }
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  let user = null;
  try {
    // Guard against dead DNS / unreachable Supabase hosts hanging the server for 25+ seconds
    const userPromise = supabase.auth.getUser();
    const timeoutPromise = new Promise<{ data: { user: null } }>((resolve) =>
      setTimeout(() => resolve({ data: { user: null } }), 2000)
    );
    const result = await Promise.race([userPromise, timeoutPromise]);
    user = result?.data?.user ?? null;
  } catch {
    user = null;
  }

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (isAuthPage && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
