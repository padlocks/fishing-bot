// import dbConnect, { setupChangeStream } from '@/lib/dbConnect';
import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';
import { fetchTotalFishCaught } from '@/app/lib/data';

export const GET = async (req: NextApiRequest) => {
  try {
    const fishCount = await fetchTotalFishCaught();
    return NextResponse.json(fishCount, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { error: { message: 'Error fetching latest fish count' + error } },
      { status: 500 }
    );
  }
};