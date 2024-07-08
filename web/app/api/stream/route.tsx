// import dbConnect, { setupChangeStream } from '@/lib/dbConnect';
import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';
import { fetchLatestCommands } from '@/app/lib/data';
import { setupChangeStream } from '@/lib/dbConnect';

export const GET = async (req: NextApiRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const collectionParam = searchParams.get("collection");
    const collection = collectionParam;

    const initialParam = searchParams.get("initial");
    const initial = initialParam || false;

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

    // await setupChangeStream(collection, pipeline, (change) => {
    //   return NextResponse.json(change.fullDocument, { status: 200 });
    // });

    // if (initial) {
    //   const initialCommands = await fetchLatestCommands();
    //   return NextResponse.json(initialCommands, { status: 200 });
    // }

    // return NextResponse.json({}, { status: 200 });
    const initialCommands = await fetchLatestCommands();
    return NextResponse.json(initialCommands, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { error: { message: 'Error setting up change stream:' + error } },
      { status: 500 }
    );
  }
};