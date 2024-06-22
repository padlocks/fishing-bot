import { Schema, model, Document } from 'mongoose';
import { Item, ItemData } from './ItemModel';

interface IBuff extends Document {
	name: string;
	description?: string;
	rarity: string;
	active: boolean;
	capabilities?: string[];
	requirements: {
		level: number;
	};
	obtained?: number;
	length?: number;
	endTime?: number;
	count: number;
	icon: {
		animated: boolean;
		data: string;
	};
	user?: string;
	type: string;
}

const buffSchema = new Schema<IBuff>({
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
	active: {
		type: Boolean,
		default: false,
	},
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
	length: {
		type: Number,
	},
	endTime: {
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
	user: {
		type: String,
	},
	type: {
		type: String,
		default: 'buff',
	},
});

const Buff = Item.discriminator<IBuff>('Buff', buffSchema);
const BuffData = ItemData.discriminator('BuffData', buffSchema);

export { Buff, BuffData };
