// import dbConnect, { setupChangeStream } from '@/lib/dbConnect';
import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';
import { fetchLatestCommands } from '@/app/lib/data';

export const GET = async (req: NextApiRequest) => {
  try {
    const initialCommands = await fetchLatestCommands();
    return NextResponse.json(initialCommands, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { error: { message: 'Error fetching latest commands' + error } },
      { status: 500 }
    );
  }
};