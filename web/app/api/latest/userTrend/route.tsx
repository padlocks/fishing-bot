// import dbConnect, { setupChangeStream } from '@/lib/dbConnect';
import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';
import { getUserTrend } from '@/app/lib/data';

export const GET = async (req: NextApiRequest) => {
  try {
    const percent = await getUserTrend();
    return NextResponse.json(percent, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { error: { message: 'Error fetching latest command count' + error } },
      { status: 500 }
    );
  }
};