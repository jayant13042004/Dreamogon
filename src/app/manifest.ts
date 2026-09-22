import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/seo/metadata';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Dreamogon — Private Dream Journal & Subconscious Archive',
    short_name: 'Dreamogon',
    description: SITE_CONFIG.description,
    start_url: '/dream/new',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#101013',
    theme_color: '#101013',
    categories: ['lifestyle', 'health', 'productivity'],
    icons: [
      {
        src: '/favicon.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
