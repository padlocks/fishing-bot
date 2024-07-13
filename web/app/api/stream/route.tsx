import { NextApiRequest } from 'next';
import { checkIfUserIsAdmin, fetchLatestCommands } from '@/app/lib/data';
import { setupChangeStream } from '@/lib/dbConnect';
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = async (req: NextApiRequest) => {

  const session = await auth();
  const id = session?.user?.image?.split('/')[4]?.split('.')[0] ?? '';
  const admin = await checkIfUserIsAdmin(id);

  if (!session || !admin) {
    return NextResponse.json(
      { error: { message: 'Not authorized' } },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const collectionParam = searchParams.get("collection");
  const collection = collectionParam;

  if (!collection) {
    return new Response('No collection specified.', {
      status: 400,
      headers: {
        'Content-Type': 'text/event-stream',
        Connection: 'keep-alive',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  }

  try {
    const responseStream = new TransformStream();
    const writer = responseStream.writable.getWriter();
    const encoder = new TextEncoder();

    const initialCommands = await fetchLatestCommands();
    writer.write(encoder.encode(`data: ${JSON.stringify(initialCommands)}\n\n`));

    const pipeline = [
      {
        $match: {
          $and: [{ operationType: "insert" }],
        },
      },
    ];

    await setupChangeStream(collection, pipeline, async (change) => {
      try {
        writer.write(encoder.encode(`data: ${JSON.stringify([change.fullDocument])}\n\n`));
      } catch (writeError) {
        console.error('Error writing to stream:', writeError);
      }
    });

    return new Response(responseStream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        Connection: 'keep-alive',
        'Cache-Control': 'no-cache, no-transform',
      },
    });

  } catch (error) {
    console.error('Error during request:', error);
    return new Response('An error occurred during request', {
      status: 500,
      headers: {
        'Content-Type': 'text/event-stream',
        Connection: 'keep-alive',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  }
};