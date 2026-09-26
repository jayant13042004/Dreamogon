import type { Metadata } from 'next';

export const SITE_CONFIG = {
  name: 'Subconscious Log',
  fullName: 'Subconscious Log',
  title: 'Subconscious Log — A private place to record your dreams and discover what keeps returning.',
  description:
    'A private place to record your dreams and discover what keeps returning. Capture dreams before they fade, reflect with care, and uncover recurring patterns over time.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://subconsciouslog.com',
  ogImage: '/og-subconsciouslog.png',
  twitterHandle: '@subconsciouslog',
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || '[OWNER INPUT REQUIRED: Support Email]',
  privacyEmail: process.env.NEXT_PUBLIC_PRIVACY_EMAIL || '[OWNER INPUT REQUIRED: Privacy Email]',
  securityEmail: process.env.NEXT_PUBLIC_SECURITY_EMAIL || '[OWNER INPUT REQUIRED: Security Email]',
  getSupportEmail(): string {
    return process.env.NEXT_PUBLIC_SUPPORT_EMAIL || '[OWNER INPUT REQUIRED: Support Email]';
  },
  getPrivacyEmail(): string {
    return process.env.NEXT_PUBLIC_PRIVACY_EMAIL || '[OWNER INPUT REQUIRED: Privacy Email]';
  },
  getSecurityEmail(): string {
    return process.env.NEXT_PUBLIC_SECURITY_EMAIL || '[OWNER INPUT REQUIRED: Security Email]';
  },
  isEmailConfigured(): boolean {
    return Boolean(process.env.NEXT_PUBLIC_SUPPORT_EMAIL);
  },
  ownerName: 'Jayant Jagtap',
  legalEntityName: process.env.NEXT_PUBLIC_LEGAL_ENTITY || 'Jayant Jagtap (Proprietor, Subconscious Log)',
  registeredAddress: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || 'Samarth Nagar, Jalna, Maharashtra 431203, India',
  jurisdiction: process.env.NEXT_PUBLIC_JURISDICTION || 'India',
  effectiveDate: 'September 2026',
  lastUpdated: 'September 26, 2026',
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
