// import dbConnect, { setupChangeStream } from '@/lib/dbConnect';
import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';
import { checkIfUserIsAdmin, getCommandTrend } from '@/app/lib/data';
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
    
    const percent = await getCommandTrend();
    return NextResponse.json(percent, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { error: { message: 'Error fetching latest command count' + error } },
      { status: 500 }
    );
  }
};