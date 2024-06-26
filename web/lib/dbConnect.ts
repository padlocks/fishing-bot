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

export async function setupChangeStream(collectionName: string, callback: (change: any) => void) {
    await dbConnect();
    const db = mongoose.connection.db;
    const collection = db.collection(collectionName);

    const changeStream = collection.watch();

    // changeStream.on('change', (change) => {
    //     callback(change);
    // });

	// Read the first change directly from the stream
    let doc;
    while ((doc = await changeStream.next()) !== null) {
        callback(doc);
    }
}