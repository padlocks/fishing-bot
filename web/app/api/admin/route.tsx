// import dbConnect, { setupChangeStream } from '@/lib/dbConnect';
import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';
import { checkIfUserIsAdmin } from '@/app/lib/data';

export const GET = async (req: NextApiRequest) => {
  try {
    const userId = req.query.id as string;
	const isAdmin = await checkIfUserIsAdmin(userId);
    return NextResponse.json(isAdmin, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { error: { message: 'Error checking if user is admin' + error } },
      { status: 500 }
    );
  }
};