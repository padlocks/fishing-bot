import { Schema, model, Document, Model } from 'mongoose';
import { Item, ItemData } from './ItemModel';

interface IRod extends Document {
	capabilities: string[];
	requirements: {
		level: number;
	};
	obtained: number;
	fishCaught: number;
	state: 'mint' | 'repaired' | 'broken' | 'destroyed';
	durability: number;
	maxDurability: number;
	repairs: number;
	maxRepairs: number;
	repairCost: number;
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

const rodSchema = new Schema<IRod>({
	capabilities: {
		type: [String],
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
	state: {
		type: String,
		enum: ['mint', 'repaired', 'broken', 'destroyed'],
		default: 'mint',
	},
	durability: {
		type: Number,
		default: 1000,
	},
	maxDurability: {
		type: Number,
		default: 1000,
	},
	repairs: {
		type: Number,
		default: 0,
	},
	maxRepairs: {
		type: Number,
		default: 3,
	},
	repairCost: {
		type: Number,
		default: 1000,
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
		default: 'rod',
	},
});

const Rod: Model<IRod> = Item.discriminator<IRod>('Rod', rodSchema);
const RodData: Model<IRod> = ItemData.discriminator<IRod>('RodData', rodSchema);

export { Rod, RodData };
