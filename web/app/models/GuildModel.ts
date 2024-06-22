import { Schema, model, Document } from 'mongoose';

interface IGuild extends Document {
	id: string;
	prefix: string;
	ponds: string[];
}

const GuildSchema = new Schema<IGuild>({
	id: {
		type: String,
		required: true,
		unique: true,
	},
	prefix: {
		type: String,
		default: '/',
	},
	ponds: {
		type: [String],
		default: [],
	},
});

const Guild = model<IGuild>('Guild', GuildSchema);
export { Guild };