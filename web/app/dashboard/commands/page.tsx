import Pagination from '@/app/ui/commands/pagination';
import Search from '@/app/ui/search';
import Table from '@/app/ui/commands/table';
// import { CreateInvoice } from '@/app/ui/commands/buttons';
import { fetchCommandsPages } from '@/app/lib/data';
import { lusitana } from '@/app/ui/fonts';
import { CommandsTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';

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
	const totalPages = await fetchCommandsPages(query);
	return (
		<div className="w-full">
			<div className="flex w-full items-center justify-between">
				<h1 className={`${lusitana.className} text-2xl`}>Commands</h1>
			</div>
			<div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
				<Search placeholder="Search commands..." />
				{/* <CreateInvoice /> */}
			</div>
			<Suspense key={query + currentPage} fallback={<CommandsTableSkeleton />}>
				<Table query={query} currentPage={currentPage} />
			</Suspense>
			<div className="mt-5 flex w-full justify-center">
				<Pagination totalPages={totalPages} />
			</div>
		</div>
	);
}