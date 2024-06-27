import {
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { fetchCommandsLength, fetchTotalFishCaught, fetchUserCount } from '@/app/lib/data';

const iconMap = {
  collected: BanknotesIcon,
  customers: UserGroupIcon,
  pending: ClockIcon,
  invoices: InboxIcon,
};

export default async function CardWrapper() {
  const numberOfCommands = await fetchCommandsLength();
  const numberOfUsers = await fetchUserCount();
  const numberOfFishCaught = await fetchTotalFishCaught();
  return (
    <>
      { <Card title="Total Commands" value={numberOfCommands} type="commands" /> }
        { <Card
          title="Total Users"
          value={numberOfUsers}
          type="users"
        /> }
        { <Card title="Fish Caught" value={numberOfFishCaught} type="fish" /> }
    </>
  );
}

export async function Card({
  title,
  value,
  type,
}: {
  title: string;
  value: number | string;
  type: 'commands' | 'users' | 'fish';
}) {
  const Icon = iconMap[type];

  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div className="flex p-4">
        {Icon ? <Icon className="h-5 w-5 text-gray-700" /> : null}
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`${lusitana.className}
          truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
      >
        {value}
      </p>
    </div>
  );
}
