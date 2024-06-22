import mongoose from 'mongoose';
import { Schema, model, Document, Types } from 'mongoose';

interface ICommand extends Document {
	user: string;
	command: string;
	options?: object;
	time: Date;
	channel?: string;
	guild?: string;
	interaction?: object;
	chainedTo?: Types.ObjectId;
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
	options: {
		type: Object,
	},
	time: {
		type: Date,
		default: Date.now,
	},
	channel: {
		type: String,
	},
	guild: {
		type: String,
	},
	interaction: {
		type: Object,
	},
	chainedTo: {
		type: Schema.Types.ObjectId,
		ref: 'Interaction',
	},
	type: {
		type: String,
		default: 'command',
	},
});

const Command = mongoose.models.Command || model<ICommand>('Command', commandSchema);
export { Command };	export type { ICommand };
