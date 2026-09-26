import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Begin Your Journal',
  description: 'Create your private Subconscious Log account.',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
