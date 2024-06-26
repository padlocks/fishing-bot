import CardWrapper, { Card } from '@/app/ui/dashboard/cards';
import { lusitana } from '@/app/ui/fonts';
import CommandsChart from '@/app/ui/dashboard/commands-chart';
import { Suspense } from 'react';
import { LatestCommandsSkeleton, ChartSkeleton, CardsSkeleton } from '@/app/ui/skeletons';
import dynamic from 'next/dynamic';

const LatestCommands = dynamic(() => import('@/app/ui/dashboard/latest-commands'), { ssr: false });
 
export default async function Page() {
  return (
    <main>
      <h1 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Dashboard
      </h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Suspense fallback={<CardsSkeleton />}>
          <CardWrapper />
        </Suspense>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <Suspense fallback={<ChartSkeleton />}>
          <CommandsChart  />
        </Suspense>
        <Suspense fallback={<LatestCommandsSkeleton />}>
          <LatestCommands />
        </Suspense>
      </div>
    </main>
  );
}