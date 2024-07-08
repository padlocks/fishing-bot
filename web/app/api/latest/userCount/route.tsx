// import dbConnect, { setupChangeStream } from '@/lib/dbConnect';
import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';
import { fetchUserCount } from '@/app/lib/data';

export const GET = async (req: NextApiRequest) => {
  try {
    const userCount = await fetchUserCount();
    return NextResponse.json(userCount, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { error: { message: 'Error fetching latest user count' + error } },
      { status: 500 }
    );
  }
};