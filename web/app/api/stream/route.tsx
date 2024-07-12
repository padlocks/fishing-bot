import { NextApiRequest } from 'next';
import { fetchLatestCommands } from '@/app/lib/data';
import { setupChangeStream } from '@/lib/dbConnect';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = async (req: NextApiRequest) => {
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

    const changeStream = await setupChangeStream(collection, pipeline, async (change) => {
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