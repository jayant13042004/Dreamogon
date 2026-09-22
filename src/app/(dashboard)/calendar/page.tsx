'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/Spinner';

export default function CalendarPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dreams?view=calendar');
  }, [router]);

  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

