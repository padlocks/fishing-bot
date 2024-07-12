'use client';

import React, { useEffect, useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { lusitana } from '@/app/ui/fonts';
import { LatestCommandsSkeleton } from '../skeletons';

const API = '/api/latest/commands';

export default function LatestCommands() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    const fetchData = async () => {
      try {
        const eventSource = new EventSource(`/api/stream?collection=commands`);

        eventSource.onmessage = (event) => {
          const newData = JSON.parse(event.data);
          if (newData.length === 1) {
            // Remove the last element from data and prepend the new data
            setData((prevData) => [newData[0], ...prevData].slice(0, 10));
            console.log(data.length);
          }
          else {
            setData(newData);
          }
        };

        eventSource.onerror = (event) => {
          console.log("Connection was closed due to an error:", event);
          eventSource.close();
        };
      } catch (err) {
        console.error('Fetch error:', err);
        if (!ignore) setError(err);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LatestCommandsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex w-full flex-col md:col-span-4">
        <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>Latest Commands</h2>
        <p className="text-red-500">Error fetching commands: {error.message}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex w-full flex-col md:col-span-4">
        <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>Latest Commands</h2>
        <p>No commands available.</p>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>Latest Commands</h2>
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-50 p-4">
        {data.map((command, i) => (
          <div
            key={command._id}
            className={clsx(
              'flex flex-row items-center justify-between py-4',
              {
                'border-t': i !== 0,
              },
            )}
          >
            <div className="flex items-center">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold md:text-base">
                  {new Date(command.time).toLocaleString()}
                </p>
                <p className="hidden text-sm text-gray-500 sm:block">{command.user}</p>
              </div>
            </div>
            <p className={`${lusitana.className} truncate text-sm font-medium md:text-base`}>
              {command.command}
            </p>
          </div>
        ))}
        <div className="flex items-center pb-2 pt-6">
          <ArrowPathIcon className="h-5 w-5 text-gray-500" />
          <h3 className="ml-2 text-sm text-gray-500 ">Updated just now</h3>
        </div>
      </div>
    </div>
  );
}