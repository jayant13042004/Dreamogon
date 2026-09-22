'use client';

import { useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/Spinner';

export default function EditDreamPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const dreamId = resolvedParams.id;
  const router = useRouter();

  useEffect(() => {
    if (dreamId) {
      router.replace(`/dream/${dreamId}?edit=1`);
    }
  }, [dreamId, router]);

  return (
    <div className="flex h-[60vh] items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}
