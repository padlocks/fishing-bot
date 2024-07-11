import { lusitana } from '@/app/ui/fonts';
import CommandsChart from '@/app/ui/dashboard/commands-chart';
import { Suspense } from 'react';
import {
  LatestCommandsSkeleton,
  ChartSkeleton,
  CardsSkeleton,
} from '@/app/ui/skeletons';
import dynamic from 'next/dynamic';
import { auth } from '@/auth';
import { checkIfUserIsAdmin } from '@/app/lib/data';

const LatestCommands = dynamic(
  () => import('@/app/ui/dashboard/latest-commands'),
  { ssr: false },
);
const CardWrapper = dynamic(() => import('@/app/ui/dashboard/cards'), {
  ssr: false,
});

export default async function Page() {
  const session = await auth();
  const id = session?.user?.image?.split('/')[4]?.split('.')[0] ?? '';
  const admin = await checkIfUserIsAdmin(id);

  if (session && admin) {
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
            <CommandsChart />
          </Suspense>
          <Suspense fallback={<LatestCommandsSkeleton />}>
            <LatestCommands />
          </Suspense>
        </div>
      </main>
    );
  } else if (session) {
    return (
      <div>
        <p>You need to be an admin to view this page</p>
      </div>
    );
  } else {
    return (
      <div>
        <p>You need to be logged in to view this page</p>
      </div>
    );
  }
}

