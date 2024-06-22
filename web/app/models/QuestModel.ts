import { Schema, model, Document } from 'mongoose';

interface IQuest extends Document {
	title: string;
	description: string;
	reward?: Schema.Types.ObjectId[];
	cash: number;
	xp: number;
	requirements: {
		level: number;
		previous: string[];
	};
	startDate?: number;
	endDate?: number;
	user?: string;
	progress: number;
	progressMax: number;
	status: 'pending' | 'in_progress' | 'completed' | 'failed';
	daily: boolean;
	progressType: {
		fish: string[];
		rarity: string[];
		rod: string;
		qualities: string[];
	};
	type: string;
}

const questSchema = new Schema<IQuest>({
	title: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		required: true,
	},
	reward: {
		type: [{
			type: Schema.Types.ObjectId,
		}],
	},
	cash: {
		type: Number,
		required: true,
		default: 0,
	},
	xp: {
		type: Number,
		required: true,
		default: 0,
	},
	requirements: {
		level: {
			type: Number,
			default: 0,
		},
		previous: [{
			type: String,
			default: '',
		}],
	},
	startDate: {
		type: Number,
	},
	endDate: {
		type: Number,
	},
	user: {
		type: String,
	},
	progress: {
		type: Number,
		default: 0,
	},
	progressMax: {
		type: Number,
		default: 1,
	},
	status: {
		type: String,
		enum: ['pending', 'in_progress', 'completed', 'failed'],
		default: 'pending',
	},
	daily: {
		type: Boolean,
		default: false,
	},
	progressType: {
		fish: [{
			type: String,
			default: 'any',
		}],
		rarity: [{
			type: String,
			default: 'any',
		}],
		rod: {
			type: String,
			default: 'any',
		},
		qualities: [{
			type: String,
			default: 'any',
		}],
	},
	type: {
		type: String,
		default: 'quest',
	},
});

const Quest = model<IQuest>('Quest', questSchema);
const QuestData = model<IQuest>('QuestData', questSchema);

export { Quest, QuestData };
