import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <DashboardLayout>{children}</DashboardLayout>
    </ThemeProvider>
  );
}
