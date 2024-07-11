import { auth } from '@/auth';
import FishingRPGLogo from '../logo';

const TopNav = async () => {
	const session = await auth(); 

	if (session) {
		return (
			<>
				<nav className="flex justify-between items-center px-4 py-2 bg-gray-50">
					<div className="flex h-20 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-42">
						{<FishingRPGLogo />}
					</div>
					<div className="flex-grow"></div>
					<div className="flex items-center">
						<div className="flex items-center">
							<span className="text-black-200">{session.user?.name}</span> {}
							<img
								src={session.user?.image ?? 'default-profile-picture-url'}
								alt="Profile Picture"
								className="w-8 h-8 rounded-full ml-2"
							/>
						</div>
					</div>
				</nav>
			</>
		);
	} else {
		return (
			<>
				<nav className="flex justify-between items-center px-4 py-2 bg-gray-50">
					<div className="flex h-20 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-42">
						{<FishingRPGLogo />}
					</div>
					<div className="flex-grow"></div>
					<div className="flex items-center">
						<div className="flex items-center">
							<span className="text-black-200">Guest</span>
						</div>
					</div>
				</nav>
			</>
		);
	}
};

export default TopNav;
