'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui';

export default function CollectionPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/world?view=list');
  }, [router]);

  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

