import { Schema, Document, model, Model } from 'mongoose';
import { Item, ItemData } from './ItemModel';

interface IBait extends Document {
	capabilities: string[];
	biomes: string[];
	multiplier: number;
	requirements: {
		level: number;
	};
	obtained?: number;
	fishCaught: number;
	count: number;
	icon: {
		animated: boolean;
		data: string;
	};
	weights: {
		common: number;
		uncommon: number;
		rare: number;
		ultra: number;
		giant: number;
		legendary: number;
		lucky: number;
	};
	type: string;
}

const baitSchema = new Schema<IBait>({
	capabilities: {
		type: [String],
	},
	biomes: {
		type: [String],
	},
	multiplier: {
		type: Number,
		default: 1,
	},
	requirements: {
		level: {
			type: Number,
			default: 0,
		},
	},
	obtained: {
		type: Number,
	},
	fishCaught: {
		type: Number,
		default: 0,
	},
	count: {
		type: Number,
		default: 1,
	},
	icon: {
		animated: {
			type: Boolean,
			default: false,
		},
		data: {
			type: String,
			default: 'old_rod:1210508306662301706',
		},
	},
	weights: {
		common: {
			type: Number,
			default: 7000,
		},
		uncommon: {
			type: Number,
			default: 2500,
		},
		rare: {
			type: Number,
			default: 500,
		},
		ultra: {
			type: Number,
			default: 100,
		},
		giant: {
			type: Number,
			default: 50,
		},
		legendary: {
			type: Number,
			default: 20,
		},
		lucky: {
			type: Number,
			default: 1,
		},
	},
	type: {
		type: String,
		default: 'bait',
	},
});

const Bait: Model<IBait> = Item.discriminator<IBait>('Bait', baitSchema);
const BaitData: Model<IBait> = ItemData.discriminator<IBait>('BaitData', baitSchema);

export { Bait, BaitData };
