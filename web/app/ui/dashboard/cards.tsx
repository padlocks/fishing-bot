'use client';

import {
  BanknotesIcon,
  ClockIcon,
  UserGroupIcon,
  InboxIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { useEffect, useState } from 'react';
import { CardsSkeleton } from '../skeletons';

const iconMap: { [key: string]: any } = {
  fish: BanknotesIcon,
  users: UserGroupIcon,
  commands: InboxIcon,
};

export default async function CardWrapper() {
  const [numberOfCommands, setCommands] = useState(0);
  const [commandTrend, setTrend] = useState(0);
  const [numberOfUsers, setUsers] = useState(0);
  const [numberOfFishCaught, setFish] = useState(0);
  const [fishTrend, setFishTrend] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      try {
        const commandsRes = await fetch('/api/latest/commandCount');
        const commandTrendRes = await fetch('/api/latest/commandTrend');
        const usersRes = await fetch('/api/latest/userCount');
        const fishRes = await fetch('/api/latest/fishCount');
        const fishTrendRes = await fetch('/api/latest/fishTrend');

        if (!commandsRes.ok || !usersRes.ok || !fishRes.ok) {
          throw new Error('Network response was not ok');
        }
        if (!ignore) setCommands(await commandsRes.json());
        if (!ignore) setTrend(await commandTrendRes.json());
        if (!ignore) setUsers(await usersRes.json());
        if (!ignore) setFish(await fishRes.json());
        if (!ignore) setFishTrend(await fishTrendRes.json());

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
      { <NewCard title="Commands" value={numberOfCommands} type="commands" percent={commandTrend} /> }
        { <NewCard
        title="Users"
        value={numberOfUsers}
        type="users" 
        percent={-10}        /> }
        { <NewCard title="Fish" value={numberOfFishCaught} type="fish" percent={fishTrend} /> }
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

export async function NewCard({
  title,
  value,
  type,
  percent,
}: {
  title: string;
  value: number | string;
  type: 'commands' | 'users' | 'fish',
  percent: number;
}) {
  const Icon = iconMap[type];
  const color = type === 'commands' ? 'bg-blue-50' : type === 'users' ? 'bg-green-50' : type === 'fish' ? 'bg-yellow-50' : 'bg-gray-50'
  const iconColor = type === 'commands' ? 'text-blue-700' : type === 'users' ? 'text-green-700' : type === 'fish' ? 'text-yellow-700' : 'text-gray-700'
  const TrendIcon = percent > 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
  const percentColor = percent > 0 ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className={`flex rounded-xl ${color} p-2 shadow-sm`}>
      <div className="flex-1 p-4">
        <div className="flex flex-col items-start">
          {Icon ? <Icon className={`h-4 w-4 ${iconColor}`} /> : null}
          <h3 className="mt-1 text-xs font-medium text-left">{title}</h3>
        </div>
        <p
          className={`${lusitana.className}
            truncate rounded-xl text-left text-lg`}
        >
          {value.toLocaleString()}
        </p>
      </div>
      <div className="flex-1 flex items-center justify-between">
        <div className={`rounded-xl ${percentColor} w-12 h-5 flex items-center justify-center`}>
          <p className="font-medium text-white flex items-center gap-1" style={{ fontSize: '0.65rem' }}>
            <TrendIcon className="h-3 w-3 text-white" /> {percent.toString().replace('-', '')}%
          </p>
        </div>
      </div>
    </div>
  );
}
