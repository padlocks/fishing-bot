'use client';

import {
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
  InboxIcon,
} from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { useEffect, useState } from 'react';
import { CardsSkeleton } from '../skeletons';

const iconMap = {
  collected: BanknotesIcon,
  customers: UserGroupIcon,
  pending: ClockIcon,
  invoices: InboxIcon,
};

export default async function CardWrapper() {
  const [numberOfCommands, setCommands] = useState(0);
  const [numberOfUsers, setUsers] = useState(0);
  const [numberOfFishCaught, setFish] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      try {
        const commandsRes = await fetch('/api/latest/commandCount');
        const usersRes = await fetch('/api/latest/userCount');
        const fishRes = await fetch('/api/latest/fishCount');

        if (!commandsRes.ok || !usersRes.ok || !fishRes.ok) {
          throw new Error('Network response was not ok');
        }
        if (!ignore) setCommands(await commandsRes.json());
        if (!ignore) setUsers(await usersRes.json());
        if (!ignore) setFish(await fishRes.json());

      } catch (err) {
        console.error('Fetch error:', err);
        if (!ignore) setError(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 5000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return <CardsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex w-full flex-col md:col-span-4">
        <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>Latest Commands</h2>
        <p className="text-red-500">Error fetching commands: {error.message}</p>
      </div>
    );
  }

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
