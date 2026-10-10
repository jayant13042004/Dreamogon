import { createBrowserClient } from '@supabase/ssr';

let client: ReturnType<typeof createBrowserClient> | undefined;

export function createClient() {
  if (typeof window === 'undefined') {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }

  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookieOptions: {
          // 400 days is the maximum persistent cookie lifetime supported by modern browsers
          maxAge: 400 * 24 * 60 * 60,
          sameSite: 'lax',
          path: '/',
          secure: window.location.protocol === 'https:',
        },
      }
    );
  }

  return client;
}
