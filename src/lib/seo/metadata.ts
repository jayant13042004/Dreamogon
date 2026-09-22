import type { Metadata } from 'next';

export const SITE_CONFIG = {
  name: 'Dreamogon',
  fullName: 'Dreamogon',
  title: 'Dreamogon — A private place to record your dreams and discover what keeps returning.',
  description:
    'A private place to record your dreams and discover what keeps returning. Capture dreams before they fade, reflect with care, and uncover recurring patterns over time.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://dreamogon.com',
  ogImage: '/og-dreamogon.png',
  twitterHandle: '@dreamogon',
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@dreamogon.com',
  privacyEmail: process.env.NEXT_PUBLIC_PRIVACY_EMAIL || 'privacy@dreamogon.com',
  securityEmail: process.env.NEXT_PUBLIC_SECURITY_EMAIL || 'security@dreamogon.com',
  getSupportEmail(): string {
    return process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@dreamogon.com';
  },
  getPrivacyEmail(): string {
    return process.env.NEXT_PUBLIC_PRIVACY_EMAIL || 'privacy@dreamogon.com';
  },
  getSecurityEmail(): string {
    return process.env.NEXT_PUBLIC_SECURITY_EMAIL || 'security@dreamogon.com';
  },
  isEmailConfigured(): boolean {
    return true;
  },
  legalEntityName: process.env.NEXT_PUBLIC_LEGAL_ENTITY || 'Dreamogon Cognitive Systems',
  registeredAddress: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || 'San Francisco, CA, United States',
  jurisdiction: process.env.NEXT_PUBLIC_JURISDICTION || 'State of California, United States',
  effectiveDate: 'September 2026',
  lastUpdated: 'September 19, 2026',
};

interface MetadataProps {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  ogImage?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  noIndex?: boolean;
}

export function constructMetadata({
  title,
  description,
  path = '',
  keywords = [],
  ogImage = SITE_CONFIG.ogImage,
  type = 'website',
  publishedTime,
  modifiedTime,
  noIndex = false,
}: MetadataProps): Metadata {
  const canonicalUrl = `${SITE_CONFIG.url}${path.startsWith('/') ? path : `/${path}`}`;

  const baseKeywords = [
    'dream journal',
    'dream interpretation',
    'dream meanings',
    'dream symbols',
    'lucid dreaming',
    'recurring dreams',
    'subconscious patterns',
    'AI dream analysis',
    'sleep journal'
  ];

  return {
    title: `${title} | ${SITE_CONFIG.name}`,
    description,
    keywords: Array.from(new Set([...baseKeywords, ...keywords])),
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: ogImage.startsWith('http') ? ogImage : `${SITE_CONFIG.url}${ogImage}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      type,
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | ${SITE_CONFIG.name}`,
      description,
      images: [ogImage.startsWith('http') ? ogImage : `${SITE_CONFIG.url}${ogImage}`],
      creator: SITE_CONFIG.twitterHandle,
    },
  };
}
