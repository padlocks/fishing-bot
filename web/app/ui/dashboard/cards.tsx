'use client';

import { useEffect, useState } from 'react';
import { CardsSkeleton } from '../skeletons';
import { BanknotesIcon, ClockIcon, UserGroupIcon, InboxIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';

const iconMap = {
  fish: BanknotesIcon,
  users: UserGroupIcon,
  commands: InboxIcon,
};

export default function CardWrapper() {
  const [data, setData] = useState({
    commands: 0,
    commandTrend: 0,
    users: 0,
    fish: 0,
    fishTrend: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      try {
        const [commandsRes, commandTrendRes, usersRes, fishRes, fishTrendRes] = await Promise.all([
          fetch('/api/latest/commandCount'),
          fetch('/api/latest/commandTrend'),
          fetch('/api/latest/userCount'),
          fetch('/api/latest/fishCount'),
          fetch('/api/latest/fishTrend'),
        ]);

        if (!commandsRes.ok || !commandTrendRes.ok || !usersRes.ok || !fishRes.ok || !fishTrendRes.ok) {
          throw new Error('Network response was not ok');
        }

        const [commandsData, commandTrendData, usersData, fishData, fishTrendData] = await Promise.all([
          commandsRes.json(),
          commandTrendRes.json(),
          usersRes.json(),
          fishRes.json(),
          fishTrendRes.json(),
        ]);

        const newData = {
          commands: commandsData,
          commandTrend: commandTrendData,
          users: usersData,
          fish: fishData,
          fishTrend: fishTrendData,
        };

        if (!ignore && JSON.stringify(data) !== JSON.stringify(newData)) {
          setData(newData);
          setLoading(false);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        if (!ignore) setError(err);
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [data]);

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
      <NewCard title="Commands" value={data.commands} type="commands" percent={data.commandTrend} />
      <NewCard title="Users" value={data.users} type="users" percent={-10} />
      <NewCard title="Fish" value={data.fish} type="fish" percent={data.fishTrend} />
    </>
  );
}

export function NewCard({
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
  const color = type === 'commands' ? 'bg-blue-50' : type === 'users' ? 'bg-green-50' : type === 'fish' ? 'bg-yellow-50' : 'bg-gray-50';
  const iconColor = type === 'commands' ? 'text-blue-700' : type === 'users' ? 'text-green-700' : type === 'fish' ? 'text-yellow-700' : 'text-gray-700';
  const TrendIcon = percent > 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
  const percentColor = percent > 0 ? 'bg-green-500' : 'bg-red-500';

  return (
    <div className={`flex rounded-xl ${color} p-2 shadow-sm`}>
      <div className="flex-1 p-4">
        <div className="flex flex-col items-start">
          {Icon ? <Icon className={`h-4 w-4 ${iconColor}`} /> : null}
          <h3 className="mt-1 text-xs font-medium text-left">{title}</h3>
        </div>
        <p className={`${lusitana.className} truncate rounded-xl text-left text-lg`}>{value.toLocaleString()}</p>
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
