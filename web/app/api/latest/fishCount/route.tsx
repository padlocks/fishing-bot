// import dbConnect, { setupChangeStream } from '@/lib/dbConnect';
import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';
import { checkIfUserIsAdmin, fetchTotalFishCaught } from '@/app/lib/data';
import { auth } from '@/auth';

export const GET = async (req: NextApiRequest) => {
  try {
    const session = await auth();
    const id = session?.user?.image?.split('/')[4]?.split('.')[0] ?? '';
    const admin = await checkIfUserIsAdmin(id);
  
    if (!session || !admin) {
      return NextResponse.json(
        { error: { message: 'Not authorized' } },
        { status: 401 }
      );
    }
    
    const fishCount = await fetchTotalFishCaught();
    return NextResponse.json(fishCount, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { error: { message: 'Error fetching latest fish count' + error } },
      { status: 500 }
    );
  }
};