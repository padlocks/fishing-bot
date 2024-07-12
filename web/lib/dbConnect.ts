import mongoose from 'mongoose';
declare global {
  // eslint-disable-next-line no-var, no-shadow, no-unused-vars
  var mongoose: any;
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
	throw new Error(
		'Please define the MONGODB_URI environment variable inside .env.local',
	);
}

let cached = global.mongoose;

if (!cached) {
	cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
	if (cached.conn) {
		return cached.conn;
	}
	if (!cached.promise) {
		const opts = {
			bufferCommands: false,
		};
		// eslint-disable-next-line no-shadow
		cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
			return mongoose;
		});
	}
	try {
		cached.conn = await cached.promise;
	}
	catch (e) {
		cached.promise = null;
		throw e;
	}

	return cached.conn;
}

export default dbConnect;

export async function setupChangeStream(collectionName: string, pipeline, callback: (change: any) => void) {
    await dbConnect();
    const db = mongoose.connection.db;
    const collection = db.collection(collectionName);

    const changeStream = collection.watch(pipeline, {
        fullDocument: "updateLookup",
    });

    changeStream.on('change', (change) => {
        try {
            callback(change);
        } catch (callbackError) {
            console.error('Error in change stream callback:', callbackError);
        }
    });

    changeStream.on('error', (error) => {
        console.error('Change stream error:', error);
    });

    changeStream.on('end', () => {
        console.log('Change stream ended');
    });

    return changeStream;
}
