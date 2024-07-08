import Pagination from '@/app/ui/commands/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/users/table';
// import { CreateUser } from '@/app/ui/users/buttons';
import { fetchUsersPages } from '@/app/lib/data';
import { lusitana } from '@/app/ui/fonts';
import { CommandsTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { auth } from '@/auth';
import { checkIfUserIsAdmin } from '@/app/lib/data';
 
export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
    page?: string;
  };
}) {
  const query = searchParams?.query || '';
  const currentPage = Number(searchParams?.page) || 1;
  const totalPages = await fetchUsersPages(query);

  const session = await auth();
  const id = session?.user?.image?.split('/')[4]?.split('.')[0] ?? '';
  const admin = await checkIfUserIsAdmin(id);

  if (session && admin) {
    return (
      <div className="w-full">
        <div className="flex w-full items-center justify-between">
          <h1 className={`${lusitana.className} text-2xl`}>Users</h1>
        </div>
        <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
          <Search placeholder="Search users..." />
          {/* <CreateUser /> */}
        </div>
        <Suspense key={query + currentPage} fallback={<CommandsTableSkeleton />}>
          <Table query={query} currentPage={currentPage} />
        </Suspense>
        <div className="mt-5 flex w-full justify-center">
          <Pagination totalPages={totalPages} />
        </div>
      </div>
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