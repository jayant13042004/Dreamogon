import { Suspense } from 'react';
import DreamDetailClient from './DreamDetailClient';
import { Spinner } from '@/components/ui/Spinner';

export default async function DreamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[40vh] items-center justify-center">
          <Spinner size="lg" />
        </div>
      }
    >
      <DreamDetailClient dreamId={id} />
    </Suspense>
  );
}
