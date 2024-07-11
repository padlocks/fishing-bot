// import dbConnect, { setupChangeStream } from '@/lib/dbConnect';
import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';
import { getCommandTrend } from '@/app/lib/data';

export const GET = async (req: NextApiRequest) => {
  try {
    const percent = await getCommandTrend();
    return NextResponse.json(percent, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { error: { message: 'Error fetching latest command count' + error } },
      { status: 500 }
    );
  }
};