'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { Header } from './Header';
import { usePathname } from 'next/navigation';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [pageTitle, setPageTitle] = useState('Dashboard');

  useEffect(() => {
    if (pathname.includes('/dreams')) setPageTitle('Journal Archive');
    else if (pathname.includes('/insights')) setPageTitle('Insights');
    else if (pathname.includes('/chat')) setPageTitle('Dream Chat');
    else if (pathname.includes('/calendar')) setPageTitle('Calendar');
    else if (pathname.includes('/settings')) setPageTitle('Settings');
    else if (pathname.includes('/world')) setPageTitle('Dream World');
    else if (pathname.includes('/collection')) setPageTitle('Collection');
    else if (pathname.includes('/dream/new')) setPageTitle('Record');
    else if (pathname.includes('/dream/')) setPageTitle('Dream');
    else setPageTitle('Dashboard');
  }, [pathname]);

  const isWorldPage = pathname.includes('/world');
  const isMorningCapture = pathname.includes('/dream/new');

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col md:flex-row antialiased selection:bg-[var(--accent-soft)]">
      <Sidebar />
      <div className="flex-1 md:pl-[260px] flex flex-col min-h-screen pb-16 md:pb-0 relative">
        {!isMorningCapture && <Header title={pageTitle} />}
        <main
          className={`flex-1 w-full ${
            isWorldPage
              ? 'p-2 md:p-4'
              : isMorningCapture
                ? 'p-4 md:p-8 max-w-2xl mx-auto'
                : 'p-4 md:p-8 max-w-7xl mx-auto'
          }`}
        >
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
