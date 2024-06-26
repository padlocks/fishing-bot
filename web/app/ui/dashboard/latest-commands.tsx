'use client';

import React, { useEffect, useState } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Image from 'next/image';
import { lusitana } from '@/app/ui/fonts';
import { LatestCommandsSkeleton } from '../skeletons';
import { io } from 'socket.io-client';

const API = '/api/stream?collection=commands';

export default function LatestCommands() {
  const [data, setData] = useState([]);

  useEffect(() => {
    try {
      const socket = io('http://127.0.0.1:3001' + API);

      socket.on('connect', () => {
        socket.emit('join', 'commands');
      });

      socket.on('initialData', (message) => {
        setData(message.data);
      });

      socket.on('change', (message) => {
        setData((prevData) => [message.data, ...prevData]);
      });

      return () => socket.disconnect(); // Cleanup on unmount
    } catch (error) {
      console.error(error);
    }
  }, []);

  return (
    <div className="flex w-full flex-col md:col-span-4">
      <h2 className={`${lusitana.className} mb-4 text-xl md:text-2xl`}>
        Latest Commands
      </h2>
      <div className="flex grow flex-col justify-between rounded-xl bg-gray-50 p-4">
        {data.map((command, i) => (
          <div
            key={command._id} // Assuming _id is the unique identifier in your documents
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