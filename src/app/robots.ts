import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/seo/metadata';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SITE_CONFIG.url;

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/dashboard/*',
          '/dream/*',
          '/dreams',
          '/dreams/*',
          '/world',
          '/world/*',
          '/collection',
          '/collection/*',
          '/insights',
          '/insights/*',
          '/chat',
          '/chat/*',
          '/calendar',
          '/calendar/*',
          '/settings',
          '/settings/*',
          '/api/*',
          '/auth/*',
          '/login',
          '/signup',
          '/forgot-password',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
