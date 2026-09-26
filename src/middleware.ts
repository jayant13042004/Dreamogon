import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  // Gracefully handle Supabase auth codes if redirected to root or any non-callback URL
  if (
    request.nextUrl.pathname !== '/auth/callback' &&
    request.nextUrl.searchParams.has('code')
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth/callback';
    return NextResponse.redirect(url);
  }

  if (process.env.NODE_ENV === 'development' && (request.nextUrl.searchParams.get('preview') === '1' || request.cookies.get('dev_preview')?.value === '1')) {
    const response = NextResponse.next();
    response.cookies.set('dev_preview', '1', { path: '/' });
    return response;
  }
  return await updateSession(request);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
