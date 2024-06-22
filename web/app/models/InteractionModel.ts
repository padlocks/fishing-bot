import mongoose from 'mongoose';
import { Schema, model, Document } from 'mongoose';

interface IInteraction extends Document {
	command: Schema.Types.ObjectId;
	user: string;
	time: Date;
	channel?: string;
	guild?: string;
	interactions: object[];
	status: 'pending' | 'completed' | 'failed';
	statusMessage?: string;
	type: string;
}

const interactionSchema = new Schema<IInteraction>({
	command: {
		type: Schema.Types.ObjectId,
		ref: 'Command',
	},
	user: {
		type: String,
		required: true,
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
	interactions: {
		type: [Object],
	},
	status: {
		type: String,
		enum: ['pending', 'completed', 'failed'],
		default: 'pending',
	},
	statusMessage: {
		type: String,
	},
	type: {
		type: String,
		default: 'interaction',
	},
});

const Interaction = mongoose.models.Interaction || model<IInteraction>('Interaction', interactionSchema);
export { Interaction };	export type { IInteraction };
