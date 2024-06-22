import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import { fetchCommandById, fetchInteractionById } from '@/app/lib/data';

export default async function Page({ params }: { params: { id: string } }) {
	const id = params.id;
	const command = await fetchCommandById(id);
	const interaction = await fetchInteractionById(command.chainedTo);
	return (
		<main>
			<Breadcrumbs
				breadcrumbs={[
					{ label: 'Invoices', href: '/dashboard/invoices' },
					{
						label: 'Command',
						href: `/dashboard/commads/${id}/edit`,
						active: true,
					},
				]}
			/>
			{interaction}
		</main>
	);
}