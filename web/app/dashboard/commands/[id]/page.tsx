import Breadcrumbs from '@/app/ui/commands/breadcrumbs';
import { fetchCommandById, fetchInteractionById } from '@/app/lib/data';
import { auth } from '@/auth';
import { checkIfUserIsAdmin } from '@/app/lib/data';

export default async function Page({ params }) {
	const id = params.id;
	const command = await fetchCommandById(id);
	const interaction = await fetchInteractionById(command.chainedTo);
	const interactions = interaction.interactions;

	const session = await auth();
	const userId = session?.user?.image?.split('/')[4]?.split('.')[0] ?? '';
	const admin = await checkIfUserIsAdmin(userId);

	if (session && admin) {

		return (
			<main>
				<Breadcrumbs
					breadcrumbs={[
						{ label: 'Commands', href: '/dashboard/commands' },
						{
							label: 'Interaction Steps',
							href: `/dashboard/commads/${id}/steps`,
							active: true,
						},
					]}
				/>
				<h1>Interaction Steps for Command ID: {id}</h1>
				<br />
				{command.options && (
					<>
						<strong>Arguments:</strong>
						<ul>
							{command.options.map((option) => (
								<li key={option.name}>
									<strong>{option.name}</strong>: {option.value}
								</li>
							))}
						</ul>
						<br />
					</>
				)}
				<ul>
					{interactions.map((interaction) => (
						<li key={interaction._id.$oid}>
							<br />
							<strong>Command:</strong> {interaction.command}
							<br />
							<strong>Channel:</strong> {interaction.channel}
							<br />
							<strong>Guild:</strong> {interaction.guild}
							<br />
							<strong>Time:</strong> {new Date(interaction.time).toLocaleString()}
							<br />
							<strong>Type:</strong> {interaction.type}
							<br />
							<br />
							<hr />
						</li>
					))}
				</ul>
				{interaction && (
					<><br></br>
						<div>
							<strong>Final Interaction Status</strong>
							<p>Status: {interaction.status}</p>
							<p>Message: {interaction.statusMessage}</p>
						</div></>
				)}
			</main>
		);
	} else if (session) {
		return (
			<div>
				<p>You need to be an admin to view this page</p>
			</div>
		);
	}
	else {
		return (
			<div>
				<p>You need to be logged in to view this page</p>
			</div>
		);
	}
}