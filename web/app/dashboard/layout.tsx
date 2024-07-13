import SideNav from '@/app/ui/dashboard/sidenav';
import TopNav from '@/app/ui/dashboard/topnav';
import { Providers } from '../providers';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Providers>
        {/* <TopNav /> */}
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden dark:bg-gray-800">
          <div className="w-full flex-none md:w-64">
            <SideNav />
          </div>
          <div className="flex-grow p-6 md:overflow-y-auto md:p-12">{children}</div>
        </div>
      </Providers>
    </div>
  );
}