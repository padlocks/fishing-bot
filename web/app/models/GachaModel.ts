import { Schema, model, Document } from 'mongoose';
import { Item, ItemData } from './ItemModel';

interface Gacha extends Document {
	name: string;
	description?: string;
	rarity: string;
	opened: boolean;
	capabilities?: string[];
	items: number;
	requirements: {
		level: number;
	};
	obtained?: number;
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
	user?: string;
	type: string;
}

const gachaSchema = new Schema<Gacha>({
	name: {
		type: String,
		required: true,
	},
	description: {
		type: String,
	},
	rarity: {
		type: String,
		default: 'Common',
	},
	opened: {
		type: Boolean,
		default: false,
	},
	capabilities: {
		type: [String],
	},
	items: {
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
	user: {
		type: String,
	},
	type: {
		type: String,
		default: 'gacha',
	},
});

const Gacha = Item.discriminator<Gacha>('Gacha', gachaSchema);
const GachaData = ItemData.discriminator<Gacha>('GachaData', gachaSchema);

export { Gacha, GachaData };
