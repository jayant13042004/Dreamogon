import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const errorMsg = searchParams.get('error_description') || searchParams.get('error');
  const rawNext = searchParams.get('next') ?? '/dashboard';
  // Guard against open-redirect: must be a local relative path and not protocol-relative
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard';

  // Determine correct base URL (handles reverse proxies, Vercel, custom domains, mobile)
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const isLocalEnv = process.env.NODE_ENV === 'development';
  const baseUrl = isLocalEnv
    ? request.nextUrl.origin
    : forwardedHost
    ? `${forwardedProto}://${forwardedHost}`
    : request.nextUrl.origin;

  if (errorMsg) {
    console.error('OAuth provider error in callback:', errorMsg);
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(errorMsg)}`);
  }

  if (code) {
    const redirectResponse = NextResponse.redirect(`${baseUrl}${next}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              redirectResponse.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return redirectResponse;
    }

    console.error('Error exchanging code for session in auth callback:', error.message);
    return NextResponse.redirect(
      `${baseUrl}/login?error=${encodeURIComponent(error.message || 'auth_failed')}`
    );
  }

  return NextResponse.redirect(`${baseUrl}/login?error=auth_failed`);
}
