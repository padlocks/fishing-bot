import { model, Schema, Document } from 'mongoose';
import mongoose from 'mongoose';

interface IFish extends Document {
	name: string;
	description: string;
	rarity: string;
	value: number;
	locked: boolean;
	qualities: string[];
	icon: {
		animated: boolean;
		data: string;
	};
	user: string;
	obtained: number;
	count: number;
	type: string;
	biome: string;
}

const FishSchema = new Schema<IFish>({
	name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
		default: 'A fish',
	},
	rarity: {
		type: String,
		default: 'Common',
	},
	value: {
		type: Number,
		default: 10,
	},
	locked: {
		type: Boolean,
		default: false,
	},
	qualities: [{
		type: String,
		default: 'weak',
	}],
	icon: {
		animated: {
			type: Boolean,
			default: false,
		},
		data: {
			type: String,
			default: 'rawfish:1209352519726276648',
		},
	},
	user: {
		type: String,
	},
	obtained: {
		type: Number,
	},
	count: {
		type: Number,
		default: 1,
	},
	type: {
		type: String,
		default: 'fish',
	},
	biome: {
		type: String,
		default: 'ocean',
	},
});

const Fish = mongoose.models.Fish || model<IFish>('Fish', FishSchema);
const FishData = mongoose.models.FishData || model<IFish>('FishData', FishSchema);
export { Fish, FishData };
export type { IFish };
