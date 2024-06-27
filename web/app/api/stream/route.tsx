// import dbConnect, { setupChangeStream } from '@/lib/dbConnect';
import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';
import { fetchLatestCommands } from '@/app/lib/data';

export const GET = async (req: NextApiRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const param = searchParams.get("collection");
    const collection = param;

    if (!collection) {
      return NextResponse.json(
        { error: { message: 'No collection specified.' } },
        { status: 400 }
      );
    }

    // const pipeline = [
    //   {
    //     $match: {
    //       $and: [
    //         { operationType: "insert" },
    //       ],
    //     },
    //   },
    // ];

    // setupChangeStream(collection, pipeline, (change) => {
    //   return NextResponse.json(change.fullDocument, { status: 200 });
    // });

    const latestCommands = await fetchLatestCommands();
    return NextResponse.json(latestCommands, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { error: { message: 'Error setting up change stream:' + error } },
      { status: 500 }
    );
  }
};