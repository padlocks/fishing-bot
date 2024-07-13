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
    userTrend: 0,
    fish: 0,
    fishTrend: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;
    const eventSource = new EventSource(`/api/stream/countData`);

    const fetchData = async () => {
      try {
        eventSource.onmessage = (event) => {
          const newData = JSON.parse(event.data);
          setData(newData);

          if (!ignore) setLoading(false);
        };

        eventSource.onerror = (event) => {
          console.log("Connection was closed due to an error:", event);
          eventSource.close();
        };
      } catch (err) {
        console.error('Fetch error:', err);
        eventSource.close();
        if (!ignore) setError(err);
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      ignore = true;
      console.log("Closing EventSource for countData");
      eventSource.close();
    }
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
      <Card title="Commands" value={data.commands} type="commands" percent={data.commandTrend} />
      <Card title="Users" value={data.users} type="users" percent={data.userTrend} />
      <Card title="Fish" value={data.fish} type="fish" percent={data.fishTrend} />
    </>
  );
}

export function Card({
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
    <div className={`flex rounded-xl ${color} dark:bg-gray-900 p-2 shadow-sm`}>
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
