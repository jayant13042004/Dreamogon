import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { EmailOtpType } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const flow_id = searchParams.get('flow_id') || searchParams.get('sb_flow_id');
  const errorMsg = searchParams.get('error_description') || searchParams.get('error');
  const rawNext = searchParams.get('next') ?? '/dashboard';
  // Guard against open-redirect: must be a local relative path and not protocol-relative
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/dashboard';

  // Determine correct base URL (handles Cloudflare, custom domains, reverse proxies, local dev)
  const isLocalEnv = process.env.NODE_ENV === 'development';
  const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'https://subconsciouslog.com';
  const forwardedHost = request.headers.get('x-forwarded-host');
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https';
  const baseUrl = isLocalEnv
    ? request.nextUrl.origin
    : configuredAppUrl || (forwardedHost ? `${forwardedProto}://${forwardedHost}` : request.nextUrl.origin);

  if (errorMsg) {
    console.error('Auth error in callback query params:', errorMsg);
    // If the link is expired or invalid, it typically means it was already consumed on a previous click
    if (errorMsg.toLowerCase().includes('expired') || errorMsg.toLowerCase().includes('invalid')) {
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent(
          'This verification link has expired or has already been used. If you already confirmed your email, please sign in below.'
        )}`
      );
    }
    return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(errorMsg)}`);
  }

  const cookieOptions = {
    maxAge: 400 * 24 * 60 * 60,
    sameSite: 'lax' as const,
    path: '/',
    secure: process.env.NODE_ENV === 'production' || baseUrl.startsWith('https:'),
  };

  const redirectResponse = NextResponse.redirect(`${baseUrl}${next}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions,
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            redirectResponse.cookies.set(name, value, {
              ...options,
              ...cookieOptions,
            });
          });
        },
      },
    }
  );

  // 1. Handle token_hash verification (direct OTP link from email)
  if (token_hash && type) {
    try {
      const { error } = await supabase.auth.verifyOtp({ token_hash, type });
      if (!error) {
        return redirectResponse;
      }
      console.warn('verifyOtp error in callback:', error.message);
      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent(error.message || 'Verification failed')}`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'verification_failed';
      console.error('Exception during verifyOtp:', msg);
      return NextResponse.redirect(`${baseUrl}/login?error=${encodeURIComponent(msg)}`);
    }
  }

  // 2. Handle PKCE code exchange (OAuth like Google, or email confirmation code)
  if (code) {
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(
        code,
        flow_id ? { flowId: flow_id } : undefined
      );

      if (!error) {
        return redirectResponse;
      }

      console.warn('Error exchanging code for session in auth callback:', error.message);

      const isPkceMissing =
        error.message?.includes('PKCE code verifier not found') ||
        error.name === 'AuthPKCECodeVerifierMissingError' ||
        (error as { code?: string }).code === 'pkce_code_verifier_not_found';

      if (isPkceMissing) {
        // The email verification token was already accepted and confirmed by Supabase GoTrue.
        // Because the link opened in an external email client or separate browser session,
        // the client PKCE code verifier cookie is absent on this device/webview.
        // Redirect cleanly to login with a friendly success banner so the user can sign in!
        return NextResponse.redirect(
          `${baseUrl}/login?verified=true`
        );
      }

      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent(error.message || 'auth_failed')}`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'auth_failed';
      console.error('Exception during auth code exchange:', msg);

      if (msg.includes('PKCE code verifier not found')) {
        return NextResponse.redirect(`${baseUrl}/login?verified=true`);
      }

      return NextResponse.redirect(
        `${baseUrl}/login?error=${encodeURIComponent(msg)}`
      );
    }
  }

  return NextResponse.redirect(`${baseUrl}/login?error=auth_failed`);
}

