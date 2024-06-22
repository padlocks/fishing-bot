import Image from 'next/image';
import { UpdateInvoice, DeleteInvoice, ViewCommand } from '@/app/ui/commands/buttons';
import InvoiceStatus from '@/app/ui/commands/status';
import { fetchFilteredCommands } from '@/app/lib/data';

export default async function CommandsTable({
	query,
	currentPage,
}: {
  query: string;
  currentPage: number;
}) {
	const commands = await fetchFilteredCommands(query, currentPage);

	return (
		<div className="mt-6 flow-root">
			<div className="inline-block min-w-full align-middle">
				<div className="rounded-lg bg-gray-50 p-2 md:pt-0">
					<div className="md:hidden">
						{commands?.map((command) => (
							<div
								key={command.id}
								className="mb-2 w-full rounded-md bg-white p-4"
							>
								<div className="flex items-center justify-between border-b pb-4">
									<div>
										<div className="mb-2 flex items-center">
											<p>{command.command}</p>
										</div>
										<p className="text-sm text-gray-500">{new Date(command.time).toLocaleString()}</p>
									</div>
									<InvoiceStatus status={command.user} />
								</div>
								<div className="flex w-full items-center justify-between pt-4">
									<div>
										<p className="text-xl font-medium">
											{/* {formatCurrency(invoice.amount)} */}
										</p>
										{/* <p>{formatDateToLocal(invoice.date)}</p> */}
									</div>
									<div className="flex justify-end gap-2">
										{}
									</div>
								</div>
							</div>
						))}
					</div>
					<table className="hidden min-w-full text-gray-900 md:table">
						<thead className="rounded-lg text-left text-sm font-normal">
							<tr>
								<th scope="col" className="px-4 py-5 font-medium sm:pl-6">
                  Command
								</th>
								<th scope="col" className="px-3 py-5 font-medium">
                  User
								</th>
								<th scope="col" className="px-3 py-5 font-medium">
                  Time
								</th>
								<th scope="col" className="relative py-3 pl-6 pr-3">
									<span className="sr-only">Edit</span>
								</th>
							</tr>
						</thead>
						<tbody className="bg-white">
							{commands?.map((command) => (
								<tr
									key={command.id}
									className="w-full border-b py-3 text-sm last-of-type:border-none [&:first-child>td:first-child]:rounded-tl-lg [&:first-child>td:last-child]:rounded-tr-lg [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg"
								>
									<td className="whitespace-nowrap py-3 pl-6 pr-3">
										<div className="flex items-center gap-3">
											<p>{command.command}</p>
										</div>
									</td>
									<td className="whitespace-nowrap px-3 py-3">
										{command.user}
									</td>
									<td className="whitespace-nowrap px-3 py-3">
										{/* <InvoiceStatus status={command.} /> */}
										{new Date(command.time).toLocaleString()}
									</td>
									<td className="whitespace-nowrap py-3 pl-6 pr-3">
										<div className="flex justify-end gap-3">
											<ViewCommand id={command.id} />
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
