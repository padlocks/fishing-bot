import { Schema, Document, model, Model } from 'mongoose';
import { Item, ItemData } from './ItemModel';

interface ICustomRod extends Document {
	type: string;
	rod: typeof ItemData['_id'];
	reel: typeof ItemData['_id'];
	hook: typeof ItemData['_id'];
	handle: typeof ItemData['_id'];
	capabilities: string[];
	requirements: {
		level: number;
	};
	obtained: Date;
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
}

const CustomRodSchema: Schema<ICustomRod> = new Schema<ICustomRod>({
	type: {
		type: String,
		default: 'customrod',
	},
	rod: {
		type: Schema.Types.ObjectId,
		ref: 'ItemData',
		required: true,
	},
	reel: {
		type: Schema.Types.ObjectId,
		ref: 'ItemData',
		required: true,
	},
	hook: {
		type: Schema.Types.ObjectId,
		ref: 'ItemData',
		required: true,
	},
	handle: {
		type: Schema.Types.ObjectId,
		ref: 'ItemData',
		required: true,
	},
	capabilities: {
		type: [String],
		default: [],
	},
	requirements: {
		level: {
			type: Number,
			default: 0,
		},
	},
	obtained: {
		type: Date,
		default: Date.now,
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
});

const CustomRod: Model<ICustomRod> = model<ICustomRod>('CustomRod', CustomRodSchema);
const CustomRodData: Model<typeof ItemData> = model<typeof ItemData>('CustomRodData', CustomRodSchema);

export { CustomRod, CustomRodData };
