import Link from 'next/link';
import NavLinks from '@/app/ui/dashboard/nav-links';
import FishingRPGLogo from '@/app/ui/logo';
import { PowerIcon } from '@heroicons/react/24/outline';
import { auth, signOut } from '@/auth';

export default async function SideNav() {
  const session = await auth();

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-blue-500 dark:bg-gray-800 p-4 md:h-42">
        {<FishingRPGLogo />}
      </div>
      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 dark:bg-gray-900 md:block"></div>
        <form
          action={async () => {
            'use server';
            await signOut();
          }}
        >
          <div className="flex items-center bg-gray-50 dark:bg-gray-900">
            {session && session.user && (
              <>
                <img src={session.user.image ?? ''} alt="Profile Picture" className="w-12 h-12 rounded-full" />
                <div className="hidden md:block ml-2">{session.user.name}</div>
              </>
            )}
            <div className="flex-grow"></div>
            <button className="flex h-[48px] grow items-center gap-2 rounded-md bg-gray-50 dark:bg-gray-900 p-3 text-sm font-medium hover:bg-sky-100 hover:text-blue-600 md:flex-none md:justify-start md:p-2 md:px-3">
              <PowerIcon className="w-6" />
              <div className="hidden md:block">Sign Out</div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}