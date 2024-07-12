import { NextApiRequest } from 'next';
import { fetchCommandsLength, fetchTotalFishCaught, fetchUserCount, getCommandTrend, getFishTrend } from '@/app/lib/data';
import { setupChangeStream } from '@/lib/dbConnect';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const GET = async (req: NextApiRequest) => {
  try {
    const responseStream = new TransformStream();
    const writer = responseStream.writable.getWriter();
    const encoder = new TextEncoder();

	const initialCommandCount = await fetchCommandsLength();
	const initialCommandTrend = await getCommandTrend();
	const initialUserCount = await fetchUserCount();
	const initialFishCount = await fetchTotalFishCaught();
	const initialFishTrend = await getFishTrend();
    writer.write(encoder.encode(`data: ${JSON.stringify({commands: initialCommandCount, commandTrend: initialCommandTrend, users: initialUserCount, fish: initialFishCount, fishTrend: initialFishTrend})}\n\n`));

    const pipeline = [
      {
        $match: {
          $and: [{ operationType: "insert" }],
        },
      },
    ];

    const changeStream = await setupChangeStream("commands", pipeline, async (change) => {
      try {

		const commands = await fetchCommandsLength();
		const commandTrend = await getCommandTrend();
		const users = await fetchUserCount();
		const fish = await fetchTotalFishCaught();
		const fishTrend = await getFishTrend();

        writer.write(encoder.encode(`data: ${JSON.stringify({commands, commandTrend, users, fish, fishTrend})}\n\n`));
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