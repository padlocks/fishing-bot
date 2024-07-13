import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';
import { checkIfUserIsAdmin, fetchCommandsLength, fetchTotalFishCaught, fetchUserCount, getCommandTrend, getFishTrend, getUserTrend } from '@/app/lib/data';
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
    
    const initialCommandCount = await fetchCommandsLength();
    const initialCommandTrend = await getCommandTrend();
    const initialUserCount = await fetchUserCount();
    const initialUserTrend = await getUserTrend();
    const initialFishCount = await fetchTotalFishCaught();
    const initialFishTrend = await getFishTrend();
    return NextResponse.json({ commands: initialCommandCount, commandTrend: initialCommandTrend, users: initialUserCount, userTrend: initialUserTrend, fish: initialFishCount, fishTrend: initialFishTrend }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { error: { message: 'Error fetching latest fish count' + error } },
      { status: 500 }
    );
  }
};