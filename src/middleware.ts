import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  if (process.env.NODE_ENV === 'development' && (request.nextUrl.searchParams.get('preview') === '1' || request.cookies.get('dev_preview')?.value === '1')) {
    const response = (await import('next/server')).NextResponse.next();
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
