import { Schema, model, Document } from 'mongoose';
import mongoose from 'mongoose';

interface ICommand extends Document {
	user: string;
	command: string;
	time?: number;
	channel?: string;
	guild?: string;
	type: string;
}

const commandSchema = new Schema<ICommand>({
	user: {
		type: String,
		required: true,
	},
	command: {
		type: String,
		required: true,
	},
	time: {
		type: Number,
		default: Date.now,
	},
	channel: {
		type: String,
	},
	guild: {
		type: String,
	},
	type: {
		type: String,
		default: 'command',
	},
});

const Command = mongoose.models.Command || model<ICommand>('Command', commandSchema);
export { Command };	export type { ICommand };

